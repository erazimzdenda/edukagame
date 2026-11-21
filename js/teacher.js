// Panel pro učitele: po zadání hesla ukáže, kdo je právě ve hře,
// jak daleko je třída a kdo se za poslední dobu připojil.
import { CONFIG } from './config.js';
import { SUBJECTS } from './questions.js';
import { ROOMS } from './world.js';
import { connect } from './net.js';
import { roomEntries, mergeEntries, knownRooms, clearRoom } from './log.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LETTERS = ['E', 'R', 'A', 'Z', 'I', 'M'];

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const hashPw = (pw) => sha256('erazim:' + pw);

function fmt(ts) {
  const d = new Date(ts), now = new Date();
  const time = d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return 'dnes ' + time;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'včera ' + time;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) + ' ' + time;
}
function where(x, z) {
  if (x > 27.5) return '🌳 venku';
  if (Math.abs(z) < 3) return 'chodba';
  const r = ROOMS.find((r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1);
  if (!r) return '';
  const s = SUBJECTS.find((s) => s.id === r.key);
  return s ? `${s.letter} · ${s.name}` : 'Naše třída';
}

export function initTeacher() {
  const LOCAL = new URLSearchParams(location.search).has('local');
  let net = null, room = '', unlocked = false;
  const online = new Map(); // peerId -> {name, color, x, z, escaped, seen}
  const solved = new Set();

  $('teacherBtn').onclick = () => {
    $('tLogin').classList.remove('hidden');
    $('tPw').value = ''; $('tPwMsg').textContent = '';
    setTimeout(() => $('tPw').focus(), 50);
  };
  $('tLoginClose').onclick = () => $('tLogin').classList.add('hidden');
  $('tLoginForm').onsubmit = async (e) => {
    e.preventDefault();
    if (!crypto?.subtle) { $('tPwMsg').textContent = 'Panel funguje jen na zabezpečené adrese (https).'; return; }
    if ((await hashPw($('tPw').value)) !== CONFIG.teacherPasswordHash) { $('tPwMsg').textContent = 'Nesprávné heslo.'; $('tPw').select(); return; }
    unlocked = true;
    $('tLogin').classList.add('hidden');
    $('lobby').classList.add('hidden');
    $('teacher').classList.remove('hidden');
    $('tRoom').value = $('roomInput').value || knownRooms()[0] || CONFIG.defaultRoom;
    renderRooms();
    watch();
  };
  $('tBack').onclick = () => { net?.leave(); location.reload(); };
  $('tWatch').onclick = watch;
  $('tRoom').addEventListener('keydown', (e) => e.key === 'Enter' && watch());
  $('tPeriod').onchange = render;

  function renderRooms() {
    const rooms = knownRooms();
    $('tRooms').innerHTML = rooms.length ? 'Uložené třídy: ' + rooms.map((r) => `<button class="chip" data-r="${esc(r)}">${esc(r)}</button>`).join(' ') : '';
    $('tRooms').querySelectorAll('button').forEach((b) => b.onclick = () => { $('tRoom').value = b.dataset.r; watch(); });
  }

  async function watch() {
    const code = $('tRoom').value.trim().toUpperCase().replace(/[^A-Z0-9ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ_-]/g, '').slice(0, 20);
    if (!code) return;
    $('tRoom').value = code;
    if (net) { try { net.leave(); } catch {} net = null; }
    room = code; online.clear(); solved.clear();
    $('tStatus').textContent = 'Připojuji…';
    render();
    try {
      // učitel se připojí jako neviditelný pozorovatel – nevysílá postavičku
      net = await connect(code, { local: LOCAL });
    } catch {
      $('tStatus').textContent = '⚠️ Nepodařilo se připojit – zobrazuji jen uložené záznamy.';
      return;
    }
    $('tStatus').textContent = '🟢 Sleduji třídu ' + code;
    net.on('peerJoin', (_, id) => net.send('log', { req: 1 }, id));
    net.on('peerLeave', (_, id) => { online.delete(id); render(); });
    net.on('hello', (d, id) => {
      if (!d || typeof d.name !== 'string') return;
      const o = online.get(id) || {};
      online.set(id, { ...o, name: d.name.slice(0, 16), color: /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : '#999', escaped: !!d.escaped, seen: Date.now() });
      render();
    });
    net.on('pos', (d, id) => {
      const o = online.get(id);
      if (!o || !Array.isArray(d)) return;
      o.x = +d[0]; o.z = +d[1]; o.escaped = !!d[4]; o.seen = Date.now();
    });
    net.on('state', (d) => { for (const id of d?.solved || []) solved.add(id); render(); });
    net.on('log', (d) => { if (d?.entries && mergeEntries(room, d.entries)) render(); });
    net.send('log', { req: 1 });
  }

  function render() {
    if (!unlocked) return;
    const now = Date.now();
    for (const [id, o] of online) if (now - o.seen > 15000) online.delete(id);
    const onlineNames = new Set([...online.values()].map((o) => o.name.toLowerCase()));

    // právě ve hře
    const list = [...online.values()].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
    $('tOnlineCount').textContent = list.length;
    $('tOnline').innerHTML = list.length
      ? list.map((o) => `<div class="t-row"><span class="dot" style="background:${o.color}"></span><b>${esc(o.name)}</b><span class="muted">${o.escaped ? '🌳 venku' : esc(where(o.x ?? 0, o.z ?? 9))}</span></div>`).join('')
      : `<p class="muted">Teď tu nikdo není. ${net ? '' : ''}</p>`;

    // postup třídy
    const done = (s) => s.questions.filter((q) => solved.has(q.id)).length >= Math.min(s.needed, s.questions.length);
    const all = SUBJECTS.every(done);
    $('tProgress').innerHTML = LETTERS.map((L) => {
      const s = SUBJECTS.find((x) => x.letter === L);
      const on = L === 'I' ? all : s && done(s);
      return `<span class="hl ${L === 'I' ? 'i' : ''} ${on ? 'on' : ''}" style="${on && s ? `background:${s.color}` : ''}">${L}</span>`;
    }).join('') + `<span class="muted"> ${solved.size} vyřešených úkolů</span>`;

    // historie
    const days = +$('tPeriod').value;
    const limit = days ? now - days * 864e5 : 0;
    const rows = roomEntries(room).filter((e) => e.l >= limit).sort((a, b) => b.l - a.l);
    $('tHistCount').textContent = rows.length;
    $('tHistory').innerHTML = rows.length ? `<table><thead><tr><th>Jméno</th><th>Naposledy</th><th>Poprvé</th><th>Připojení</th><th>Vyřešeno</th></tr></thead><tbody>${
      rows.map((e) => `<tr><td><span class="dot" style="background:${esc(e.c)}"></span>${esc(e.n)}${onlineNames.has(e.n.toLowerCase()) ? ' <span class="live">● online</span>' : ''}</td><td>${fmt(e.l)}</td><td>${fmt(e.f)}</td><td>${e.v || 1}×</td><td>${e.s || 0}</td></tr>`).join('')
    }</tbody></table>` : '<p class="muted">Zatím žádné záznamy pro tuto třídu.</p>';
  }
  setInterval(render, 3000);

  $('tCsv').onclick = () => {
    const rows = roomEntries(room).sort((a, b) => b.l - a.l);
    const csv = '﻿Jméno;Naposledy;Poprvé;Počet připojení;Vyřešené úkoly\n' + rows.map((e) =>
      [e.n, new Date(e.l).toLocaleString('cs-CZ'), new Date(e.f).toLocaleString('cs-CZ'), e.v || 1, e.s || 0].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `pripojeni-${room}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };
  $('tClear').onclick = () => {
    if (!confirm(`Smazat uložené záznamy třídy ${room} v tomto prohlížeči?`)) return;
    clearRoom(room); renderRooms(); render();
  };
  $('tNewPwBtn').onclick = async () => {
    const pw = $('tNewPw').value;
    if (pw.length < 6) { $('tNewPwOut').textContent = 'Heslo by mělo mít aspoň 6 znaků.'; return; }
    $('tNewPwOut').innerHTML = `V souboru <code>js/config.js</code> nahraďte řádek s <code>teacherPasswordHash</code> tímto:<pre>  teacherPasswordHash: '${await hashPw(pw)}',</pre>`;
  };
}
