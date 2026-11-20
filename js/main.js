import * as THREE from '../vendor/three.module.min.js';
import { CONFIG } from './config.js';
import { SUBJECTS } from './questions.js';
import { Avatar, BODY_COLORS, SKIN_COLORS } from './avatar.js';
import { createFaceEditor, PEN_COLORS } from './editor.js';
import { buildWorld, collide, ROOMS, BOUNDS, EXIT_X, OUTSIDE_X, BLUE } from './world.js';
import { connect } from './net.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const LOCAL = params.has('local');
const LETTERS = ['E', 'R', 'A', 'Z', 'I', 'M'];
const SUBJ_BY_LETTER = Object.fromEntries(SUBJECTS.map((s) => [s.letter, s]));
const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// =====================================================================
//  LOBBY – kreslení obličeje, výběr barvy, jména a kódu třídy
// =====================================================================
const profile = Object.assign(
  { name: '', color: BODY_COLORS[4], skin: SKIN_COLORS[0], face: null },
  store.get('erazim-profile', {}),
);

let previewAvatar, previewRenderer, previewScene, previewCam, previewRAF;
const faceCanvas = $('faceCanvas');
const editor = createFaceEditor(faceCanvas, { skin: profile.skin, onChange: () => previewAvatar?.setFace(faceCanvas) });

function swatches(el, colors, current, onPick) {
  el.innerHTML = '';
  for (const c of colors) {
    const b = document.createElement('button');
    b.className = 'swatch' + (c === current ? ' active' : '');
    b.style.background = c; b.title = c; b.type = 'button';
    b.onclick = () => { el.querySelectorAll('.swatch').forEach((x) => x.classList.remove('active')); b.classList.add('active'); onPick(c); };
    el.appendChild(b);
  }
}

function initLobby() {
  if (profile.face) editor.load(profile.face); else editor.init();
  swatches($('penColors'), PEN_COLORS, PEN_COLORS[0], (c) => { editor.setPen(c); $('eraser').classList.remove('active'); });
  swatches($('skinColors'), SKIN_COLORS, profile.skin, (c) => { editor.setSkin(c); profile.skin = c; previewAvatar.setSkin(c); });
  swatches($('bodyColors'), BODY_COLORS, profile.color, (c) => { profile.color = c; previewAvatar.setColor(c); });
  document.querySelectorAll('.tool.size').forEach((b) => b.onclick = () => {
    document.querySelectorAll('.tool.size').forEach((x) => x.classList.remove('active'));
    b.classList.add('active'); editor.setSize(+b.dataset.size);
  });
  $('eraser').onclick = () => { const on = !$('eraser').classList.contains('active'); $('eraser').classList.toggle('active', on); editor.setEraser(on); };
  $('undo').onclick = () => editor.undo();
  $('clearFace').onclick = () => editor.clear();
  $('smile').onclick = () => editor.defaultFace();

  $('nameInput').value = profile.name;
  $('roomInput').value = (params.get('trida') || store.get('erazim-room') || CONFIG.defaultRoom).toUpperCase();

  // 3D náhled postavičky
  const cv = $('preview');
  previewRenderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  previewRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  previewRenderer.setSize(200, 220, false);
  previewScene = new THREE.Scene();
  previewScene.add(new THREE.HemisphereLight('#fff', '#999', 2.2));
  const dl = new THREE.DirectionalLight('#fff', 1.2); dl.position.set(2, 3, 4); previewScene.add(dl);
  previewCam = new THREE.PerspectiveCamera(32, 200 / 220, 0.1, 50);
  previewCam.position.set(0, 1.6, 6.2); previewCam.lookAt(0, 1.25, 0);
  previewAvatar = new Avatar({ color: profile.color, skin: profile.skin });
  previewAvatar.setFace(faceCanvas);
  previewScene.add(previewAvatar.group);
  const t0 = performance.now();
  const loop = () => {
    const t = (performance.now() - t0) / 1000;
    previewAvatar.group.rotation.y = Math.sin(t * 0.8) * 0.6;
    previewAvatar.animate(1 / 60, true);
    previewAvatar.walk = t * 4;
    previewRenderer.render(previewScene, previewCam);
    previewRAF = requestAnimationFrame(loop);
  };
  loop();

  $('startBtn').onclick = startGame;
  $('nameInput').addEventListener('keydown', (e) => e.key === 'Enter' && $('roomInput').focus());
  $('roomInput').addEventListener('keydown', (e) => e.key === 'Enter' && startGame());
}

async function startGame() {
  const name = $('nameInput').value.trim().replace(/\s+/g, ' ').slice(0, 16);
  const room = $('roomInput').value.trim().toUpperCase().replace(/[^A-Z0-9ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ_-]/g, '').slice(0, 20);
  if (!name) { $('lobbyMsg').textContent = 'Napiš prosím své jméno 🙂'; $('nameInput').focus(); return; }
  if (!room) { $('lobbyMsg').textContent = 'Zadej kód třídy (např. 7A).'; $('roomInput').focus(); return; }
  profile.name = name;
  profile.face = editor.toDataURL();
  store.set('erazim-profile', profile);
  store.set('erazim-room', room);
  $('startBtn').disabled = true;
  $('lobbyMsg').textContent = '';
  cancelAnimationFrame(previewRAF);
  previewRenderer.dispose();
  previewRenderer.forceContextLoss?.();
  $('lobby').classList.add('hidden');
  $('game').classList.remove('hidden');
  const url = new URL(location.href); url.searchParams.set('trida', room); history.replaceState(null, '', url);
  await runGame(room);
}

// =====================================================================
//  HRA
// =====================================================================
async function runGame(roomCode) {
  // --- scéna
  const renderer = new THREE.WebGLRenderer({ antialias: devicePixelRatio < 2 });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  $('view').appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize); resize();

  const world = buildWorld(scene, SUBJECTS);

  // --- já
  const me = new Avatar({ name: profile.name, color: profile.color, skin: profile.skin, face: profile.face });
  const home = ROOMS.find((r) => r.key === 'home');
  const pos = { x: -6 + Math.random() * 12, z: home.z0 + 2 + Math.random() * 1.2 };
  let ry = 0; // otočen obličejem ke kameře
  me.group.position.set(pos.x, 0, pos.z);
  scene.add(me.group);
  let escaped = false;

  // --- společný stav (vyřešené otázky) – sjednocení množin, takže se nikdy nepohádá
  const STATE_KEY = 'erazim-state-' + roomCode;
  const saved = store.get(STATE_KEY);
  const solved = new Set(saved && Date.now() - saved.t < 6 * 3600e3 ? saved.solved : []);
  const allIds = new Set(SUBJECTS.flatMap((s) => s.questions.map((q) => q.id)));
  for (const id of [...solved]) if (!allIds.has(id)) solved.delete(id);

  const progress = (s) => s.questions.filter((q) => solved.has(q.id)).length;
  const isDone = (s) => progress(s) >= Math.min(s.needed, s.questions.length);
  const currentQ = (s) => s.questions.find((q) => !solved.has(q.id));
  const allDone = () => SUBJECTS.every(isDone);

  // --- ostatní hráči
  const players = new Map(); // peerId -> {avatar, name, color, tx, tz, try, moving, escaped, seen}
  let net;

  let taskSubj = null, shownQ = null, bonus = false;

  // --- HUD
  const hudLetters = $('hudLetters');
  hudLetters.innerHTML = LETTERS.map((L) => `<div class="hl ${L === 'I' ? 'i' : ''}" data-l="${L}">${L}</div>`).join('');
  const litState = {};

  function refreshProgress(announce = false) {
    for (const L of LETTERS) {
      const s = SUBJ_BY_LETTER[L];
      const on = L === 'I' ? allDone() : isDone(s);
      const el = hudLetters.querySelector(`[data-l="${L}"]`);
      el.style.background = on && L !== 'I' ? s.color : '';
      el.classList.toggle('on', on);
      if (litState[L] !== on) {
        world.setLetter(L, on, L === 'I' ? BLUE : s.color);
        if (on && litState[L] === false && announce) {
          if (L === 'I') toast('🎉 Všechna písmena svítí!<br>Východ je otevřený – běžte ven! 🚪');
          else toast(`Písmeno <b style="color:${s.color}">${L}</b> svítí! ✨<br><small>${s.name} hotovo</small>`);
        }
        litState[L] = on;
      }
    }
    for (const st of world.stations) st.top.material.color.set(isDone(st.subj) ? '#ffffff' : st.subj.color);
    if (allDone()) world.openDoor();
    $('score').textContent = solved.size * 10;
    $('solvedCount').textContent = solved.size;
    store.set(STATE_KEY, { t: Date.now(), solved: [...solved] });
    if (taskSubj) renderTask();
  }
  refreshProgress(false);

  function mergeSolved(list, byName) {
    let added = 0;
    for (const id of list || []) if (allIds.has(id) && !solved.has(id)) { solved.add(id); added++; }
    if (added) {
      if (byName) feed(`⭐ ${esc(byName)} vyřešil(a) úkol – +10 bodů pro všechny!`);
      refreshProgress(true);
    }
    return added;
  }

  // --- feed / toast
  function feed(html) {
    const d = document.createElement('div');
    d.className = 'item'; d.innerHTML = html;
    $('feed').prepend(d);
    while ($('feed').children.length > 4) $('feed').lastChild.remove();
    setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 700); }, 6000);
  }
  let toastTimer;
  function toast(html, ms = 3200) {
    const t = $('toast'); t.innerHTML = html; t.classList.remove('hidden');
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
  }

  // =====================================================================
  //  ÚKOLY
  // =====================================================================
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/,/g, '.').replace(/\s+/g, '').replace(/\.$/, '');
  const softMsgs = ['Skoro! Zkus to ještě jednou 🙂', 'Nevadí, chybami se učíme. Zkus jinou možnost! 💪', 'Hmm, tohle ne. Poraďte se spolu! 💬', 'Zkus to znovu – nebo klikni na 💡 Nápověda.'];
  const goodMsgs = ['Správně! 🎉', 'Výborně! ⭐', 'Paráda! 🙌', 'Super, máš to! ✨'];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function openTask(s) {
    taskSubj = s; shownQ = null; bonus = false;
    $('taskHead').style.background = s.color;
    $('taskLetter').textContent = s.letter;
    $('taskSubj').textContent = s.name;
    $('taskModal').classList.remove('hidden');
    renderTask();
  }
  function closeTask() { taskSubj = null; $('taskModal').classList.add('hidden'); }
  $('taskClose').onclick = closeTask;
  $('taskModal').addEventListener('click', (e) => { if (e.target === $('taskModal')) closeTask(); });

  function renderTask() {
    const s = taskSubj;
    const need = Math.min(s.needed, s.questions.length);
    $('taskDots').innerHTML = Array.from({ length: need }, (_, i) => `<i class="${i < progress(s) ? 'on' : ''}"></i>`).join('');
    if (shownQ) {
      if (!solved.has(shownQ.q.id) || shownQ.local) return; // stále se odpovídá / naše vlastní správná odpověď
      if (!shownQ.notified) {
        // otázku, kterou máme otevřenou, právě vyřešil někdo jiný
        shownQ.notified = true;
        const fb = $('taskBody').querySelector('.feedback');
        if (fb) { fb.className = 'feedback good'; fb.textContent = '✨ Kamarád to právě vyřešil! Za chvíli další otázka…'; }
        $('taskBody').querySelectorAll('.opt, #ansForm button, #ansInput').forEach((b) => b.disabled = true);
        const cur = shownQ;
        setTimeout(() => { if (shownQ === cur) { shownQ = null; if (taskSubj) renderTask(); } }, 1600);
      }
      return;
    }
    const q = currentQ(s);
    if (!q || (isDone(s) && !bonus)) {
      $('hintBtn').classList.add('hidden'); $('helpBtn').classList.add('hidden');
      const next = SUBJECTS.filter((x) => !isDone(x)).map((x) => `<b style="color:${x.color}">${x.letter} ${x.name}</b>`);
      $('taskBody').innerHTML = `<div class="done-box"><div class="emoji-big">🌟</div>
        <h2>Písmeno ${s.letter} svítí!</h2>
        <p>${next.length ? 'Pomozte kamarádům v dalších učebnách: ' + next.join(', ') : 'Všechno je hotovo – běžte k <b>východu</b> na konci chodby! 🚪'}</p>
        ${q ? '<button class="btn ghost" id="bonusBtn">➕ Chci ještě bonusovou otázku</button>' : ''}</div>`;
      $('bonusBtn')?.addEventListener('click', () => { bonus = true; renderTask(); });
      return;
    }
    shownQ = { q };
    drawQuestion(q);
  }

  function drawQuestion(q) {
    const body = $('taskBody');
    $('hintBtn').classList.toggle('hidden', !q.hint);
    $('helpBtn').classList.remove('hidden');
    let html = `<p class="question">${esc(q.q)}</p>`;
    if (q.code) html += `<pre class="code">${esc(q.code)}</pre>`;
    html += `<div id="clueBox" class="clues"></div>`;
    if (q.type === 'choice') {
      html += `<div class="options">${q.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
    } else {
      html += `<form class="answer-row" id="ansForm"><input id="ansInput" autocomplete="off" placeholder="Tvoje odpověď…" enterkeyhint="done"><button class="btn primary">OK</button></form>`;
    }
    html += `<div class="feedback"></div><div class="hint hidden">💡 ${esc(q.hint || '')}</div>`;
    body.innerHTML = html;
    clueKey = ''; renderClues();
    body.querySelectorAll('.opt').forEach((b) => b.onclick = () => {
      if (b.classList.contains('wrong')) return;
      const ok = +b.dataset.i === q.answer;
      if (ok) b.classList.add('right'); else b.classList.add('wrong');
      answer(q, ok);
    });
    const form = $('ansForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const v = norm($('ansInput').value);
        if (!v) return;
        const ok = q.answer.some((a) => norm(a) === v);
        answer(q, ok);
        if (!ok) { $('ansInput').select(); }
      };
      if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => $('ansInput')?.focus(), 50);
    }
  }

  // --- INDICIE: rozdělí se mezi hráče, kteří jsou ve stejné učebně
  let clueKey = '';
  const inRoom = (r, x, z) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
  function clueGroup() {
    const room = ROOMS.find((r) => r.key === taskSubj.id);
    const myId = net?.selfId || 'me';
    const group = [{ id: myId, name: profile.name, me: true }];
    for (const [id, p] of players) if (p.name && p.placed && inRoom(room, p.tx, p.tz)) group.push({ id, name: p.name });
    group.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return group;
  }
  function renderClues() {
    const box = $('clueBox');
    if (!box || !shownQ || !taskSubj) return;
    const q = shownQ.q, clues = q.clues || [];
    if (!clues.length) { box.innerHTML = ''; return; }
    const group = clueGroup();
    const n = group.length, i = group.findIndex((g) => g.me);
    const key = q.id + '|' + group.map((g) => g.id).join(',');
    if (key === clueKey) return;
    clueKey = key;
    let mine;
    if (n === 1) mine = CONFIG.soloAllClues ? clues.map((_, k) => k) : [0];
    else {
      mine = clues.map((_, k) => k).filter((k) => k % n === i);
      if (!mine.length) mine = [i % clues.length];
    }
    const others = group.filter((g) => !g.me).map((g) => esc(g.name));
    const hidden = clues.length - mine.length;
    let html = mine.map((k) => `<div class="clue"><span class="clue-n">🔎 Indicie ${k + 1}/${clues.length}</span>${esc(clues[k])}</div>`).join('');
    if (n === 1 && hidden > 0) {
      html += `<div class="clue-info lonely">🔒 Další ${hidden === 1 ? 'indicie je schovaná' : hidden + ' indicie jsou schované'}. Ukážou se, až do učebny přijdou kamarádi – každý dostane jinou. Zavolej je! 🙋</div>`;
    } else if (n > 1) {
      html += `<div class="clue-info">👥 Ostatní indicie mají: <b>${others.join(', ')}</b>. Řekněte si je a odpovězte společně!</div>`;
    }
    box.innerHTML = html;
  }
  setInterval(() => { if (taskSubj && shownQ) renderClues(); }, 500);

  function answer(q, ok) {
    const fb = $('taskBody').querySelector('.feedback');
    if (!ok) { fb.className = 'feedback soft'; fb.textContent = pick(softMsgs); return; }
    fb.className = 'feedback good'; fb.textContent = pick(goodMsgs) + ' +10 bodů pro celou třídu';
    $('taskBody').querySelectorAll('.opt, #ansForm button, #ansInput').forEach((b) => b.disabled = true);
    const cur = shownQ;
    if (cur) cur.local = true;
    if (!solved.has(q.id)) {
      solved.add(q.id);
      net?.send('state', { solved: [...solved], by: profile.name });
      refreshProgress(true);
    }
    setTimeout(() => { if (shownQ === cur) { shownQ = null; if (taskSubj) renderTask(); } }, 1400);
  }

  $('hintBtn').onclick = () => $('taskBody').querySelector('.hint')?.classList.remove('hidden');
  let lastHelp = 0;
  $('helpBtn').onclick = () => {
    if (!taskSubj) return;
    if (Date.now() - lastHelp < 8000) { toast('Kamarádi už o tobě vědí 📣', 1800); return; }
    lastHelp = Date.now();
    net?.send('help', { subj: taskSubj.id, name: profile.name });
    toast('📣 Kamarádi dostali zprávu, že potřebuješ pomoc.', 2400);
    me.say('🙋 Pomůžete mi?');
  };

  // =====================================================================
  //  OVLÁDÁNÍ
  // =====================================================================
  const keys = new Set();
  const typing = () => ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
  addEventListener('keydown', (e) => {
    if (typing()) return;
    keys.add(e.code);
    if (['KeyE', 'Enter', 'Space'].includes(e.code) && nearStation && !modalOpen()) { e.preventDefault(); openTask(nearStation.subj); }
    if (e.code === 'Escape') { closeTask(); $('chatMenu').classList.add('hidden'); }
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  const modalOpen = () => !!taskSubj || !$('introModal').classList.contains('hidden') || !$('winModal').classList.contains('hidden');

  // joystick
  const joy = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
  const zone = $('joyZone'), base = $('joyBase'), knob = $('joyKnob');
  zone.addEventListener('pointerdown', (e) => {
    joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY;
    zone.setPointerCapture(e.pointerId);
    base.style.left = e.clientX + 'px'; base.style.top = e.clientY + 'px';
    base.classList.remove('hidden');
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy;
    const d = Math.hypot(dx, dy), R = 50;
    if (d > R) { dx *= R / d; dy *= R / d; }
    joy.x = dx / R; joy.y = dy / R;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  const joyEnd = (e) => {
    if (e.pointerId !== joy.id) return;
    joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; base.classList.add('hidden');
  };
  zone.addEventListener('pointerup', joyEnd);
  zone.addEventListener('pointercancel', joyEnd);

  // přiblížení kamery
  let zoom = 1;
  renderer.domElement.addEventListener('wheel', (e) => { zoom = Math.min(1.6, Math.max(0.55, zoom * (e.deltaY > 0 ? 1.1 : 0.9))); }, { passive: true });

  $('actionBtn').onclick = () => nearStation && openTask(nearStation.subj);

  // rychlé zprávy (bez psaní – bezpečné a přátelské)
  const QUICK = ['Ahoj! 👋', 'Pojďte sem! 📍', 'Potřebuju pomoc 🙋', 'Jdu vám pomoct! 🏃', 'Super! 🎉', 'Děkuju! 💛', 'Máme to! ⭐', 'Počkejte na mě ⏳'];
  $('chatMenu').innerHTML = QUICK.map((m) => `<button>${m}</button>`).join('');
  $('chatBtn').onclick = () => { $('chatMenu').classList.toggle('hidden'); $('playersPanel').classList.add('hidden'); };
  $('chatMenu').querySelectorAll('button').forEach((b) => b.onclick = () => {
    me.say(b.textContent);
    net?.send('msg', { text: b.textContent });
    $('chatMenu').classList.add('hidden');
  });
  $('playersBtn').onclick = () => {
    const p = $('playersPanel');
    if (p.classList.toggle('hidden')) return;
    $('chatMenu').classList.add('hidden');
    renderPlayers();
  };
  function renderPlayers() {
    const rows = [[profile.name + ' (ty)', profile.color, escaped], ...[...players.values()].filter((p) => p.name).map((p) => [p.name, p.color, p.escaped])];
    $('playersPanel').innerHTML = `<b>Ve škole jsme spolu:</b>` + rows.map(([n, c, e]) => `<div class="p"><span class="dot" style="background:${c}"></span>${esc(n)}${e ? ' 🌳' : ''}</div>`).join('');
  }

  // =====================================================================
  //  SÍŤ
  // =====================================================================
  $('netStatus').textContent = 'Připojuji…';
  try {
    net = await connect(roomCode, { local: LOCAL });
  } catch (err) {
    console.error(err);
    $('netStatus').textContent = '⚠️ Offline';
    feed('⚠️ Nepodařilo se připojit k síti. Hraješ zatím sám/sama.');
  }
  const hello = () => ({ name: profile.name, color: profile.color, skin: profile.skin, face: profile.face, escaped });

  function getPlayer(id) {
    let p = players.get(id);
    if (!p) {
      const avatar = new Avatar({});
      avatar.group.visible = false;
      scene.add(avatar.group);
      p = { avatar, name: '', color: '#999', tx: 0, tz: 0, try: 0, moving: false, escaped: false, seen: Date.now(), placed: false };
      players.set(id, p);
    }
    p.seen = Date.now();
    return p;
  }
  function removePlayer(id) {
    const p = players.get(id);
    if (!p) return;
    scene.remove(p.avatar.group); p.avatar.dispose();
    players.delete(id);
    if (p.name) feed(`🚪 ${esc(p.name)} se odpojil(a)`);
    updateCount();
  }
  function updateCount() {
    const n = 1 + [...players.values()].filter((p) => p.name).length;
    $('playerCount').textContent = n;
    const st = $('netStatus');
    if (!net) return;
    st.textContent = n > 1 ? '🟢 Spojeno' : '🟡 Čekám…';
    st.title = n > 1 ? 'Jste propojeni se spolužáky' : 'Čekám, až se připojí spolužáci se stejným kódem třídy';
    st.classList.toggle('ok', n > 1);
    if (!$('playersPanel').classList.contains('hidden')) renderPlayers();
  }

  if (net) {
    net.on('peerJoin', (_, id) => {
      getPlayer(id);
      net.send('hello', hello(), id);
      net.send('state', { solved: [...solved] }, id);
      net.send('pos', [pos.x, pos.z, ry, 0], id);
    });
    net.on('peerLeave', (_, id) => removePlayer(id));
    net.on('hello', (d, id) => {
      if (!d || typeof d !== 'object') return;
      const p = getPlayer(id);
      const first = !p.name;
      p.name = String(d.name || 'Hráč').slice(0, 16);
      p.color = BODY_COLORS.includes(d.color) ? d.color : '#999';
      p.escaped = !!d.escaped;
      p.avatar.setName(p.name); p.avatar.setColor(p.color);
      if (SKIN_COLORS.includes(d.skin)) p.avatar.setSkin(d.skin);
      if (typeof d.face === 'string' && d.face.startsWith('data:image/png') && d.face.length < 60000) p.avatar.setFace(d.face);
      if (d.req) net.send('hello', hello(), id);
      if (first) { feed(`👋 ${esc(p.name)} je ve škole`); updateCount(); }
    });
    net.on('pos', (d, id) => {
      if (!Array.isArray(d)) return;
      const p = getPlayer(id);
      if (!p.name && !p.asked) { p.asked = true; net.send('hello', { ...hello(), req: 1 }, id); }
      [p.tx, p.tz, p.try] = d.map(Number);
      p.moving = !!d[3];
      if (!p.placed) { p.placed = true; p.avatar.group.position.set(p.tx, 0, p.tz); p.avatar.group.visible = true; }
      const esc2 = !!d[4];
      if (esc2 && !p.escaped && p.name) feed(`🌳 ${esc(p.name)} je venku!`);
      p.escaped = esc2;
    });
    net.on('state', (d) => d && mergeSolved(d.solved, d.by));
    net.on('msg', (d, id) => {
      const p = players.get(id);
      if (!p || typeof d?.text !== 'string' || !QUICK.includes(d.text)) return;
      p.avatar.say(d.text);
      feed(`💬 <b>${esc(p.name)}:</b> ${esc(d.text)}`);
    });
    net.on('help', (d, id) => {
      const p = players.get(id);
      const s = SUBJECTS.find((x) => x.id === d?.subj);
      if (!p || !s) return;
      feed(`🙋 <b>${esc(p.name)}</b> potřebuje pomoc: <b style="color:${s.color}">${s.letter} ${s.name}</b>`);
      p.avatar.say('🙋 Pomůžete mi?');
      helpPings.push({ subj: s.id, until: performance.now() + 20000 });
    });
    net.send('hello', hello());
    updateCount();
    setTimeout(() => {
      if (players.size === 0 && !LOCAL) feed('ℹ️ Zatím tu nikdo není. Spolužáci musí mít stejný kód třídy: <b>' + esc(roomCode) + '</b>');
    }, 15000);
  }
  // odpojené hráče uklidit
  setInterval(() => { for (const [id, p] of players) if (Date.now() - p.seen > 12000) removePlayer(id); }, 3000);

  // =====================================================================
  //  MINIMAPA
  // =====================================================================
  const helpPings = [];
  const mm = $('minimap'), mctx = mm.getContext('2d');
  const MX0 = -28, MX1 = 34, MZ0 = -16, MZ1 = 16;
  const mx = (x) => ((x - MX0) / (MX1 - MX0)) * mm.width;
  const mz = (z) => ((z - MZ0) / (MZ1 - MZ0)) * mm.height;
  function drawMinimap(t) {
    const c = mctx;
    c.fillStyle = '#8fd16a'; c.fillRect(0, 0, mm.width, mm.height);
    c.fillStyle = '#e9e5dc'; c.fillRect(mx(BOUNDS.x0), mz(-3), mx(BOUNDS.x1) - mx(BOUNDS.x0), mz(3) - mz(-3));
    for (const r of ROOMS) {
      const s = SUBJECTS.find((x) => x.id === r.key);
      c.fillStyle = s ? (isDone(s) ? s.color : s.color + '66') : '#d9c7a5';
      c.fillRect(mx(r.x0) + 1, mz(r.z0) + 1, mx(r.x1) - mx(r.x0) - 2, mz(r.z1) - mz(r.z0) - 2);
      c.fillStyle = '#fff'; c.font = '900 16px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(s ? s.letter : '🏠', mx((r.x0 + r.x1) / 2), mz((r.z0 + r.z1) / 2));
      const ping = helpPings.find((h) => h.subj === r.key && h.until > performance.now());
      if (ping) {
        c.strokeStyle = '#fff'; c.lineWidth = 3;
        c.beginPath(); c.arc(mx((r.x0 + r.x1) / 2), mz((r.z0 + r.z1) / 2), 10 + (t * 20) % 14, 0, 7); c.stroke();
      }
    }
    c.strokeStyle = '#1f2a44'; c.lineWidth = 2; c.strokeRect(mx(BOUNDS.x0), mz(BOUNDS.z0), mx(BOUNDS.x1) - mx(BOUNDS.x0), mz(BOUNDS.z1) - mz(BOUNDS.z0));
    c.fillStyle = world.doorOpen ? '#8fd16a' : BLUE; c.fillRect(mx(EXIT_X) - 2, mz(-1.6), 5, mz(1.6) - mz(-1.6));
    for (const p of players.values()) {
      if (!p.placed) continue;
      c.fillStyle = p.color; c.strokeStyle = '#fff'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(mx(p.avatar.group.position.x), mz(p.avatar.group.position.z), 3.5, 0, 7); c.fill(); c.stroke();
    }
    c.save(); c.translate(mx(pos.x), mz(pos.z)); c.rotate(-ry + Math.PI);
    c.fillStyle = profile.color; c.strokeStyle = '#1f2a44'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, -7); c.lineTo(5, 5); c.lineTo(-5, 5); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }

  // =====================================================================
  //  HERNÍ SMYČKA
  // =====================================================================
  let nearStation = null, lastSend = 0, lastSentMoving = false;
  const clock = new THREE.Clock();
  const camPos = new THREE.Vector3(pos.x, 12, pos.z + 10);
  const tmp = new THREE.Vector3();

  function loop() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // pohyb
    let ix = 0, iz = 0;
    if (!modalOpen()) {
      if (keys.has('KeyW') || keys.has('ArrowUp')) iz -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) iz += 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
      ix += joy.x; iz += joy.y;
    }
    const len = Math.hypot(ix, iz);
    const moving = len > 0.1;
    if (moving) {
      const sp = 5.5 * Math.min(1, len);
      pos.x += (ix / len) * sp * dt; pos.z += (iz / len) * sp * dt;
      const target = Math.atan2(ix, iz);
      let d = target - ry; d = Math.atan2(Math.sin(d), Math.cos(d));
      ry += d * Math.min(1, dt * 12);
    }
    collide(pos, 0.4, world.colliders);
    pos.x = Math.max(-34, Math.min(66, pos.x)); pos.z = Math.max(-26, Math.min(26, pos.z));
    me.group.position.set(pos.x, 0, pos.z); me.group.rotation.y = ry;
    me.animate(dt, moving);

    // únik ven
    if (!escaped && world.doorOpen && pos.x > OUTSIDE_X) {
      escaped = true;
      net?.send('hello', hello());
      showWin();
    }

    // stanoviště v blízkosti
    let near = null;
    for (const st of world.stations) if (Math.hypot(st.x - pos.x, st.z - pos.z) < 2.6) near = st;
    if (near !== nearStation) {
      nearStation = near;
      const btn = $('actionBtn');
      btn.classList.toggle('hidden', !near);
      if (near) { btn.style.background = near.subj.color; btn.textContent = `✏️ ${near.subj.letter} · ${near.subj.name}`; }
    }

    // ostatní hráči – plynulý pohyb
    for (const p of players.values()) {
      if (!p.placed) continue;
      const g = p.avatar.group;
      const k = Math.min(1, dt * 10);
      g.position.x += (p.tx - g.position.x) * k;
      g.position.z += (p.tz - g.position.z) * k;
      let d = p.try - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
      g.rotation.y += d * k;
      p.avatar.animate(dt, p.moving);
    }

    // posílání pozice
    const now = performance.now();
    if (net && (now - lastSend > (moving ? 100 : 1000) || moving !== lastSentMoving)) {
      net.send('pos', [+pos.x.toFixed(2), +pos.z.toFixed(2), +ry.toFixed(2), moving ? 1 : 0, escaped ? 1 : 0]);
      lastSend = now; lastSentMoving = moving;
    }

    // kamera
    const zz = zoom * (camera.aspect < 1 ? Math.min(1.7, 1 / Math.sqrt(camera.aspect)) : 1);
    tmp.set(pos.x, 12 * zz, pos.z + 9.5 * zz);
    camPos.lerp(tmp, Math.min(1, dt * 5));
    camera.position.copy(camPos);
    camera.lookAt(pos.x, 1, pos.z - 0.5);

    world.updateWalls(pos.x, pos.z);
    world.update(t, dt);
    drawMinimap(t);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  // úvod
  if (!allDone()) $('introModal').classList.remove('hidden');
  $('introOk').onclick = () => $('introModal').classList.add('hidden');

  // výhra
  function showWin() {
    $('winSolved').textContent = solved.size;
    $('winScore').textContent = solved.size * 10;
    const names = [profile.name, ...[...players.values()].map((p) => p.name).filter(Boolean)];
    $('winTeam').textContent = 'Tým: ' + names.join(', ');
    $('winModal').classList.remove('hidden');
    me.say('Jsem venku! 🎉');
    confetti();
  }
  $('winOk').onclick = () => $('winModal').classList.add('hidden');
}

function confetti() {
  const cv = $('confetti'), c = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  const cols = ['#e8392b', '#f2861f', '#f5c21b', '#7cc242', '#2f73c4', '#8e3fa8'];
  const parts = Array.from({ length: 160 }, () => ({
    x: Math.random() * cv.width, y: -Math.random() * cv.height, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3,
    r: Math.random() * 6, s: 6 + Math.random() * 6, c: cols[Math.floor(Math.random() * 6)],
  }));
  let frames = 0;
  (function step() {
    c.clearRect(0, 0, cv.width, cv.height);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.r += 0.1;
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore();
    }
    if (++frames < 400) requestAnimationFrame(step); else c.clearRect(0, 0, cv.width, cv.height);
  })();
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

initLobby();
