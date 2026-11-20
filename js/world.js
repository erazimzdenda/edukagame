// Školní budova: chodba, učebny podle písmen loga ERAZIM, naše třída a východ.
import * as THREE from '../vendor/three.module.min.js';
import { makeLabel } from './avatar.js';

const WALL_H = 3;
const T = 0.3;
export const BLUE = '#2f73c4';

// Rozložení (pohled shora, -z = nahoře na obrazovce)
//   [ E Matematika ][ R Zeměpis ][ A Dějepis ]
//   [===================chodba================]  →  VÝCHOD (modrý rám, „I“)
//   [ Z Přírodopis ][ Naše třída ][ M Programování ]
export const ROOMS = [
  { key: 'mat', x0: -27, x1: -9, z0: -15, z1: -3, top: true },
  { key: 'zem', x0: -9, x1: 9, z0: -15, z1: -3, top: true },
  { key: 'dej', x0: 9, x1: 27, z0: -15, z1: -3, top: true },
  { key: 'pri', x0: -27, x1: -9, z0: 3, z1: 15, top: false },
  { key: 'home', x0: -9, x1: 9, z0: 3, z1: 15, top: false },
  { key: 'pro', x0: 9, x1: 27, z0: 3, z1: 15, top: false },
];
export const BOUNDS = { x0: -27, x1: 27, z0: -15, z1: 15 };
export const EXIT_X = 27;
export const OUTSIDE_X = 29.5;

function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function tint(hex, amount) { // smíchá barvu s bílou
  return new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), amount);
}

export function buildWorld(scene, subjects) {
  const colliders = [];
  const walls = []; // { mesh, axis, pos, a, b }
  const stations = [];
  const gateLetters = {};
  const S = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const lam = (c, extra = {}) => new THREE.MeshLambertMaterial({ color: c, ...extra });
  const wallMat = lam('#f4efe4');
  const addBox = (w, h, d, x, y, z, mat, collide = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    scene.add(m);
    if (collide) colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
    return m;
  };

  // --- světla a obloha
  scene.background = new THREE.Color('#bfe3ff');
  scene.fog = new THREE.Fog('#bfe3ff', 45, 90);
  scene.add(new THREE.HemisphereLight('#ffffff', '#b9a98c', 1.6));
  const sun = new THREE.DirectionalLight('#fff6e0', 1.6);
  sun.position.set(12, 30, 18); scene.add(sun);

  // --- venku: tráva, cesta, stromy
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(220, 160), lam('#8fd16a'));
  grass.rotation.x = -Math.PI / 2; grass.position.y = -0.02; scene.add(grass);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(30, 4), lam('#e3d4b5'));
  path.rotation.x = -Math.PI / 2; path.position.set(42, -0.01, 0); scene.add(path);
  const treeSpots = [[36, -9], [44, -12], [52, -6], [38, 9], [48, 12], [56, 7], [62, -2], [-34, -8], [-33, 10], [0, -22], [-14, 22], [14, 22], [24, -22]];
  for (const [x, z] of treeSpots) {
    const trunk = addBox(0.6, 2, 0.6, x, 1, z, lam('#8a5a36'));
    trunk.userData.outside = true;
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 0), lam(['#5cb848', '#4aa63c', '#7cc242'][(x + z) & 1 ? 0 : 1]));
    crown.position.set(x, 3.2, z); scene.add(crown);
  }
  // lavičky a hřiště venku
  addBox(3, 0.5, 0.8, 40, 0.25, -4.5, lam('#c47a3a'));
  addBox(3, 0.5, 0.8, 46, 0.25, 4.5, lam('#c47a3a'));
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), lam('#d9734a'));
  pitch.rotation.x = -Math.PI / 2; pitch.position.set(54, 0, -14); scene.add(pitch);

  // --- podlahy
  const corridorTex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#e9e5dc'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#dcd6ca';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) c.fillRect(i * 64, j * 64, 64, 64);
  });
  corridorTex.wrapS = corridorTex.wrapT = THREE.RepeatWrapping;
  corridorTex.repeat.set(27, 3);
  const corr = new THREE.Mesh(new THREE.PlaneGeometry(54, 6), new THREE.MeshLambertMaterial({ map: corridorTex }));
  corr.rotation.x = -Math.PI / 2; corr.position.set(0, 0.01, 0); scene.add(corr);

  for (const r of ROOMS) {
    const subj = S[r.key];
    const col = subj ? tint(subj.color, 0.72) : new THREE.Color('#d9c7a5');
    const f = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0, r.z1 - r.z0), lam(col));
    f.rotation.x = -Math.PI / 2; f.position.set((r.x0 + r.x1) / 2, 0.01, (r.z0 + r.z1) / 2); scene.add(f);
  }

  // logo školy na podlaze chodby
  new THREE.TextureLoader().load('assets/logo.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 4), new THREE.MeshBasicMaterial({ map: t }));
    logo.rotation.x = -Math.PI / 2; logo.position.set(-18, 0.02, 0); scene.add(logo);
  });

  // --- zdi
  function wall(x0, z0, x1, z1, mat = wallMat, h = WALL_H) {
    const horiz = z0 === z1;
    const len = horiz ? x1 - x0 : z1 - z0;
    const w = horiz ? len + T : T, d = horiz ? T : len + T;
    const m = addBox(w, h, d, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, mat.clone());
    m.material.transparent = true;
    walls.push({ mesh: m, horiz, pos: horiz ? z0 : x0, a: horiz ? x0 : z0, b: horiz ? x1 : z1 });
    return m;
  }
  // zeď s otvorem pro dveře (osa x)
  function wallWithDoor(z, x0, x1, doorX, doorW = 3.2) {
    wall(x0, z, doorX - doorW / 2, z);
    wall(doorX + doorW / 2, z, x1, z);
    // nadpraží
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.6, T), wallMat);
    lintel.position.set(doorX, WALL_H - 0.3, z); scene.add(lintel);
  }

  // obvodové zdi
  wall(-27, -15, 27, -15);
  wall(-27, 15, 27, 15);
  wall(-27, -15, -27, 15);
  wall(27, -15, 27, -1.6);
  wall(27, 1.6, 27, 15);
  // příčky mezi učebnami
  for (const x of [-9, 9]) { wall(x, -15, x, -3); wall(x, 3, x, 15); }
  // zdi učeben do chodby s dveřmi
  for (const r of ROOMS) {
    const cx = (r.x0 + r.x1) / 2;
    wallWithDoor(r.top ? -3 : 3, r.x0, r.x1, cx);
    const subj = S[r.key];
    // barevný rám dveří
    const frameCol = subj ? subj.color : BLUE;
    for (const dx of [-1.6, 1.6]) addBox(0.22, WALL_H - 0.4, 0.42, cx + dx, (WALL_H - 0.4) / 2, r.top ? -3 : 3, lam(frameCol), false);
    // cedulka nad dveřmi
    const label = subj ? `${subj.letter} · ${subj.name}` : 'Naše třída';
    const sign = makeLabel(label, { bg: frameCol, color: '#ffffff', size: 52 });
    sign.position.set(cx, WALL_H + 0.9, r.top ? -3 : 3);
    scene.add(sign);
  }

  // --- vybavení učeben
  const deskMat = lam('#d9a066'), legMat = lam('#6b7280'), chairMat = lam('#2f73c4');
  function desk(x, z, rot = 0) {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.8), deskMat); top.position.y = 0.75; g.add(top);
    for (const [lx, lz] of [[-0.7, -0.32], [0.7, -0.32], [-0.7, 0.32], [0.7, 0.32]]) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), legMat); l.position.set(lx, 0.37, lz); g.add(l);
    }
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), chairMat); seat.position.set(0, 0.45, 0.75); g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.08), chairMat); back.position.set(0, 0.72, 1.0); g.add(back);
    g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
    colliders.push({ x0: x - 0.8, x1: x + 0.8, z0: z - 0.4, z1: z + 0.4 });
    return g;
  }
  function board(x, z, w, h, draw) {
    const faceSouth = true;
    const tex = canvasTex(512, Math.round(512 * h / w), draw);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex }));
    m.position.set(x, 1.7, z + (faceSouth ? 0.17 : -0.17));
    if (!faceSouth) m.rotation.y = Math.PI;
    scene.add(m);
    return m;
  }
  const chalk = (lines, bg = '#2d5a43', fg = '#f4f1ea') => (c, w, h) => {
    c.fillStyle = '#8a5a36'; c.fillRect(0, 0, w, h);
    c.fillStyle = bg; c.fillRect(10, 10, w - 20, h - 20);
    c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((ln, i) => {
      c.font = `${ln.b ? 700 : 500} ${ln.s || 34}px Nunito, system-ui, sans-serif`;
      c.fillStyle = ln.c || fg;
      c.fillText(ln.t, w / 2, (h / (lines.length + 1)) * (i + 1));
    });
  };

  // Naše třída (start)
  const home = ROOMS.find((r) => r.key === 'home');
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) desk(-5 + i * 5, 6.5 + j * 2.7);
  addBox(2.4, 0.9, 1, 0, 0.45, 14, lam('#a8693a')); // katedra
  board(-4.5, 3, 6, 2, chalk([
    { t: 'Vítejte ve škole ERAZIM! 🏫', b: 1, s: 38, c: '#ffe27a' },
    { t: 'Plňte úkoly v učebnách', s: 30 },
    { t: 'a společně najděte cestu ven.', s: 30 },
  ]), true);
  board(4.5, 3, 3.2, 2, chalk([{ t: 'E R A Z I M', b: 1, s: 44, c: '#ffffff' }, { t: 'pomáhejte si 💛', s: 30 }]), true);

  // dekorace podle předmětu
  const deco = {
    mat(r, cx) {
      board(cx, r.z0, 7, 2.2, chalk([{ t: 'a² + b² = c²', b: 1, s: 44 }, { t: '7 · 8 = ?   ½ + ¼ = ?', s: 34 }, { t: 'π ≈ 3,14', s: 34 }]), true);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) desk(cx - 5.5 + i * 11, r.z0 + 7 + j * 3);
      const shapes = [new THREE.BoxGeometry(1, 1, 1), new THREE.ConeGeometry(0.7, 1.3, 4), new THREE.SphereGeometry(0.6, 16, 12), new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16)];
      shapes.forEach((g, i) => { const m = new THREE.Mesh(g, lam(['#e8392b', '#f5c21b', '#2f73c4', '#7cc242'][i])); m.position.set(r.x0 + 1.5, 0.7, r.z0 + 3 + i * 2.5); scene.add(m); colliders.push({ x0: r.x0 + 0.8, x1: r.x0 + 2.2, z0: r.z0 + 2.3 + i * 2.5, z1: r.z0 + 3.7 + i * 2.5 }); });
    },
    zem(r, cx) {
      board(cx, r.z0, 7, 2.4, (c, w, h) => {
        c.fillStyle = '#8a5a36'; c.fillRect(0, 0, w, h); c.fillStyle = '#9fd4f5'; c.fillRect(10, 10, w - 20, h - 20);
        c.fillStyle = '#9bd17a';
        c.beginPath(); c.moveTo(90, 70); c.lineTo(200, 40); c.lineTo(330, 60); c.lineTo(430, 100); c.lineTo(400, 140); c.lineTo(250, 150); c.lineTo(120, 130); c.closePath(); c.fill();
        c.fillStyle = '#e8392b'; c.beginPath(); c.arc(300, 105, 7, 0, 7); c.fill();
        c.fillStyle = '#1f2a44'; c.font = '700 22px Nunito, sans-serif'; c.fillText('Polná', 312, 100);
        c.font = '700 26px Nunito, sans-serif'; c.fillText('Česká republika', 160, 160);
      }, true);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), lam('#3b8fd9'));
      globe.position.set(r.x0 + 2.2, 2.1, r.z0 + 2.5); scene.add(globe);
      const land = new THREE.Mesh(new THREE.SphereGeometry(1.01, 8, 6, 0, 2, 0.6, 1.3), lam('#7cc242'));
      land.position.copy(globe.position); scene.add(land);
      this._spin = [globe, land];
      addBox(0.6, 1.2, 0.6, r.x0 + 2.2, 0.6, r.z0 + 2.5, lam('#8a5a36'));
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) desk(cx - 5 + i * 10, r.z0 + 7 + j * 3);
    },
    dej(r, cx) {
      board(cx, r.z0, 6, 2.2, chalk([{ t: '1914–1918  1. světová válka', s: 32 }, { t: '1939–1945  2. světová válka', s: 32 }, { t: '8. 5. 1945  konec války v Evropě', s: 32 }], '#5b3a22', '#ffe9c4'), true);
      for (const [x, z] of [[r.x0 + 2, r.z0 + 3], [r.x1 - 2, r.z0 + 3], [r.x0 + 2, r.z1 - 2.5], [r.x1 - 2, r.z1 - 2.5]]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, WALL_H, 12), lam('#efe6d2'));
        col.position.set(x, WALL_H / 2, z); scene.add(col);
        colliders.push({ x0: x - 0.5, x1: x + 0.5, z0: z - 0.5, z1: z + 0.5 });
      }
      // malý hrad
      const hx = cx + 5, hz = r.z1 - 4;
      addBox(2.4, 1.2, 1.6, hx, 0.6, hz, lam('#b8b2a6'));
      for (const dx of [-1.2, 1.2]) addBox(0.7, 2, 0.7, hx + dx, 1, hz, lam('#a39d90'), false);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.9, 4), lam('#c0392b'));
      roof.position.set(hx - 1.2, 2.45, hz); scene.add(roof);
      const roof2 = roof.clone(); roof2.position.x = hx + 1.2; scene.add(roof2);
      desk(cx - 5, r.z0 + 8);
    },
    pri(r, cx) {
      board(cx - 5, r.z0, 6, 2.2, chalk([{ t: '🌱 Fotosyntéza', b: 1, s: 38 }, { t: 'CO₂ + voda + světlo', s: 30 }, { t: '→ cukr + kyslík', s: 30 }]));
      for (const [x, z] of [[r.x0 + 1.5, r.z0 + 2], [r.x0 + 1.5, r.z1 - 2], [r.x1 - 1.5, r.z1 - 2], [r.x0 + 1.5, r.z0 + 6]]) {
        addBox(0.8, 0.7, 0.8, x, 0.35, z, lam('#c46a3a'));
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), lam('#4aa63c'));
        leaf.position.set(x, 1.3, z); scene.add(leaf);
      }
      const aq = addBox(2.6, 1.2, 1, cx + 5, 1.15, r.z0 + 1.2, lam('#7fd0f0', { transparent: true, opacity: 0.6 }));
      aq.userData.water = true;
      addBox(2.8, 0.55, 1.1, cx + 5, 0.27, r.z0 + 1.2, lam('#6b7280'), false);
      for (let i = 0; i < 3; i++) {
        const fish = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 6), lam('#f2861f'));
        fish.rotation.z = Math.PI / 2; fish.position.set(cx + 4 + i * 0.8, 1.1 + (i % 2) * 0.3, r.z0 + 1.2); scene.add(fish);
      }
      for (let i = 0; i < 2; i++) desk(cx - 5 + i * 10, r.z0 + 5);
    },
    pro(r, cx) {
      board(cx - 5, r.z0, 6, 2.2, chalk([{ t: 'for i in range(3):', s: 34 }, { t: '    print("ERAZIM")', s: 34 }], '#14202e', '#7CFFB2'));
      const screenMat = new THREE.MeshBasicMaterial({ color: '#58e08f' });
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const x = cx - 5.5 + i * 11, z = r.z0 + 6 + j * 3.5;
        desk(x, z);
        addBox(0.9, 0.6, 0.08, x, 1.15, z - 0.2, lam('#1f2a44'), false);
        const s = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), screenMat);
        s.position.set(x, 1.15, z - 0.15); scene.add(s);
      }
    },
  };

  const spin = [];
  for (const r of ROOMS) {
    if (!S[r.key]) continue;
    const cx = (r.x0 + r.x1) / 2;
    const ctx = {};
    deco[r.key]?.call(ctx, r, cx);
    if (ctx._spin) spin.push(...ctx._spin);

    // stanoviště s úkolem
    const subj = S[r.key];
    const sz = r.top ? r.z0 + 3.2 : r.z1 - 3.2;
    const sx = cx;
    const ped = addBox(1.4, 1, 1.4, sx, 0.5, sz, lam('#ffffff'));
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 1.5), new THREE.MeshBasicMaterial({ color: subj.color }));
    top.position.set(sx, 1.05, sz); scene.add(top);
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.4, 40),
      new THREE.MeshBasicMaterial({ color: subj.color, transparent: true, opacity: 0.7 }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(sx, 0.03, sz); scene.add(ring);
    const letter = makeLabel(subj.letter, { bg: subj.color, color: '#fff', size: 90 });
    letter.position.set(sx, 2.4, sz); scene.add(letter);
    stations.push({ subj, x: sx, z: sz, ring, letter, top, ped, room: r });
  }

  // --- VÝCHOD: modrý rám z loga + písmena E R A Z I M nad ním
  const gate = new THREE.Group();
  const blueMat = lam(BLUE);
  const gx = EXIT_X + 0.4;
  for (const [w, h, d, y, z] of [[0.6, 5.2, 0.6, 2.6, -2.4], [0.6, 5.2, 0.6, 2.6, 2.4], [0.6, 0.6, 5.4, 5.0, 0]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), blueMat); m.position.set(gx, y, z); gate.add(m);
  }
  scene.add(gate);
  colliders.push({ x0: gx - 0.3, x1: gx + 0.3, z0: -2.7, z1: -2.1 }, { x0: gx - 0.3, x1: gx + 0.3, z0: 2.1, z1: 2.7 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.25, WALL_H, 3.4), lam('#7a8db3'));
  door.position.set(EXIT_X, WALL_H / 2, 0); scene.add(door);
  const doorCollider = { x0: EXIT_X - 0.3, x1: EXIT_X + 0.3, z0: -1.7, z1: 1.7 };
  colliders.push(doorCollider);
  const lock = makeLabel('🔒 Zamčeno', { bg: '#1f2a44', color: '#fff', size: 40 });
  lock.position.set(EXIT_X - 0.5, 1.6, 0); scene.add(lock);

  const letters = ['E', 'R', 'A', 'Z', 'I', 'M'];
  letters.forEach((L, i) => {
    const sp = makeLabel(L, { bg: '#c9ced8', color: '#ffffff', size: 70 });
    sp.position.set(20.2 + i * 1.3, 4.1, -3.2);
    scene.add(sp);
    gateLetters[L] = sp;
  });
  const exitSign = makeLabel('VÝCHOD →', { bg: BLUE, color: '#fff', size: 46 });
  exitSign.position.set(23.5, 5.15, -3.2); scene.add(exitSign);

  let doorOpen = false;
  function setLetter(L, on, color) {
    const sp = gateLetters[L];
    const pos = sp.position.clone();
    scene.remove(sp); sp.material.map.dispose(); sp.material.dispose();
    const n = makeLabel(L, { bg: on ? color : '#c9ced8', color: '#fff', size: 70 });
    n.position.copy(pos); scene.add(n); gateLetters[L] = n;
  }
  function openDoor() {
    if (doorOpen) return;
    doorOpen = true;
    colliders.splice(colliders.indexOf(doorCollider), 1);
    scene.remove(lock);
  }

  // --- průhlednost zdí, které zakrývají hráče
  function updateWalls(px, pz) {
    for (const w of walls) {
      let fade = false;
      if (w.horiz) fade = w.pos > pz && w.pos - pz < 5.5 && px > w.a - 2 && px < w.b + 2;
      w.mesh.material.opacity += ((fade ? 0.25 : 1) - w.mesh.material.opacity) * 0.2;
      w.mesh.material.depthWrite = w.mesh.material.opacity > 0.9;
    }
  }

  function update(t, dt) {
    for (const s of spin) s.rotation.y += dt * 0.5;
    for (const st of stations) {
      st.letter.position.y = 2.4 + Math.sin(t * 2 + st.x) * 0.15;
      st.ring.material.opacity = 0.45 + Math.sin(t * 3) * 0.25;
    }
    if (doorOpen && door.position.y > -WALL_H) door.position.y -= dt * 1.5;
  }

  return { colliders, stations, setLetter, openDoor, updateWalls, update, get doorOpen() { return doorOpen; } };
}

// kolize kruhu (hráče) s obdélníky
export function collide(p, r, colliders) {
  for (let iter = 0; iter < 3; iter++) {
    for (const c of colliders) {
      const cx = Math.max(c.x0, Math.min(p.x, c.x1));
      const cz = Math.max(c.z0, Math.min(p.z, c.z1));
      let dx = p.x - cx, dz = p.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        if (d2 < 1e-8) { // střed uvnitř – vytlačit nejkratší cestou
          const opts = [[c.x0 - r - p.x, 0], [c.x1 + r - p.x, 0], [0, c.z0 - r - p.z], [0, c.z1 + r - p.z]];
          opts.sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]));
          p.x += opts[0][0]; p.z += opts[0][1];
        } else {
          const d = Math.sqrt(d2);
          p.x += (dx / d) * (r - d); p.z += (dz / d) * (r - d);
        }
      }
    }
  }
}
