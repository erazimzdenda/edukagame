// Detaily světa: lepší nábytek, rostliny, okna, chodba se skříňkami
// a zvířátka (kočka na chodbě, králíci, kachny, ptáci, motýli, rybičky, křeček, želva).
import * as THREE from '../vendor/three.module.min.js';
import { makeLabel } from './avatar.js';

// pevně daná "náhoda" – všichni hráči vidí stejnou školu
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function buildDecor(scene, { lam, addCollider }) {
  const rand = rng(2026);
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const animals = [];
  const BOOK = ['#e8392b', '#f2861f', '#f5c21b', '#7cc242', '#2f73c4', '#8e3fa8', '#ec5f9c', '#2bb5b0'];

  const mk = (geo, color, x, y, z, parent = scene) => {
    const m = new THREE.Mesh(geo, typeof color === 'string' ? lam(color) : color);
    m.position.set(x, y, z); parent.add(m); return m;
  };
  const box = (w, h, d, color, x, y, z, parent) => mk(new THREE.BoxGeometry(w, h, d), color, x, y, z, parent);
  const cyl = (rt, rb, h, color, x, y, z, parent, seg = 10) => mk(new THREE.CylinderGeometry(rt, rb, h, seg), color, x, y, z, parent);
  const ball = (r, color, x, y, z, parent, d = 1) => mk(new THREE.IcosahedronGeometry(r, d), color, x, y, z, parent);
  const coll = (x, z, w, d) => addCollider({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });

  // ---------- nábytek a rostliny ----------
  function plant(x, z, size = 1, kind = 0) {
    cyl(0.32 * size, 0.24 * size, 0.55 * size, pick(['#c46a3a', '#e3d4b5', '#2f73c4', '#f4f1ea']), x, 0.27 * size, z);
    cyl(0.3 * size, 0.3 * size, 0.04, '#5b3a22', x, 0.55 * size, z);
    if (kind === 1) { // kaktus
      cyl(0.16 * size, 0.18 * size, 0.9 * size, '#4f9a3a', x, 1.0 * size, z);
      cyl(0.07 * size, 0.07 * size, 0.35 * size, '#4f9a3a', x + 0.2 * size, 1.05 * size, z).rotation.z = 0.9;
      ball(0.07 * size, '#ec5f9c', x, 1.5 * size, z, scene, 0);
    } else if (kind === 2) { // fíkus
      cyl(0.04, 0.05, 1.2 * size, '#7a4a2a', x, 1.1 * size, z);
      for (let i = 0; i < 4; i++) ball((0.32 + rand() * 0.12) * size, pick(['#4aa63c', '#5cb848', '#3d8f33']), x + (rand() - 0.5) * 0.5 * size, (1.45 + rand() * 0.5) * size, z + (rand() - 0.5) * 0.5 * size, scene, 0);
    } else { // keřík s listy
      for (let i = 0; i < 6; i++) {
        const l = box(0.12 * size, 0.6 * size, 0.04, pick(['#4aa63c', '#5cb848', '#7cc242']), x, 0.85 * size, z);
        l.rotation.set((rand() - 0.5) * 1.2, i, (rand() - 0.5) * 1.2);
      }
    }
    coll(x, z, 0.6 * size, 0.6 * size);
  }

  function bookshelf(x, z, len = 2.4, alongZ = true) {
    const g = new THREE.Group(); g.position.set(x, 0, z); if (alongZ) g.rotation.y = -Math.PI / 2; scene.add(g);
    box(len, 2, 0.05, '#8a5a36', 0, 1, -0.2, g);
    for (const sx of [-len / 2, len / 2]) box(0.06, 2, 0.45, '#a8693a', sx, 1, 0, g);
    box(len + 0.06, 0.06, 0.47, '#a8693a', 0, 2, 0, g);
    for (let s = 0; s < 4; s++) {
      box(len - 0.1, 0.05, 0.42, '#8a5a36', 0, 0.12 + s * 0.48, 0.02, g);
      let bx = -len / 2 + 0.12;
      while (bx < len / 2 - 0.2) {
        const w = 0.07 + rand() * 0.08, h = 0.28 + rand() * 0.12;
        const b = box(w, h, 0.3, pick(BOOK), bx + w / 2, 0.16 + s * 0.48 + h / 2, 0.06, g);
        if (rand() < 0.12) b.rotation.z = 0.25;
        bx += w + 0.01;
      }
    }
    if (alongZ) coll(x, z, 0.5, len); else coll(x, z, len, 0.5);
  }

  function windowN(x, z, w = 2.4) { // okno na severní (zadní) zdi, viditelné zevnitř
    box(w + 0.2, 1.7, 0.08, '#ffffff', x, 1.75, z);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.5), new THREE.MeshBasicMaterial({ color: '#cdeeff' }));
    glass.position.set(x, 1.75, z + 0.05); scene.add(glass);
    box(0.06, 1.5, 0.04, '#ffffff', x, 1.75, z + 0.07);
    box(w, 0.06, 0.04, '#ffffff', x, 1.95, z + 0.07);
    box(w + 0.4, 0.08, 0.25, '#ffffff', x, 0.95, z + 0.12); // parapet
    box(w * 0.8, 0.45, 0.1, '#d6dbe3', x, 0.6, z + 0.12); // radiátor
    if (rand() < 0.7) { // květináč na parapetu
      cyl(0.12, 0.09, 0.2, '#c46a3a', x + w * 0.3, 1.09, z + 0.12);
      ball(0.16, '#5cb848', x + w * 0.3, 1.3, z + 0.12, scene, 0);
    }
  }

  function poster(x, z, w, h, draw) {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = Math.round(256 * h / w);
    draw(cv.getContext('2d'), cv.width, cv.height);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex }));
    m.position.set(x, 2.35, z); scene.add(m);
  }
  const posterText = (bg, emoji, text) => (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(8, 8, w - 16, h - 16);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `${h * 0.38}px sans-serif`; c.fillText(emoji, w / 2, h * 0.38);
    c.fillStyle = bg; c.font = `800 ${h * 0.15}px Nunito, sans-serif`; c.fillText(text, w / 2, h * 0.78);
  };

  function clock(x, y, z) {
    const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    const face = mk(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 24), '#ffffff', 0, 0, 0, g); face.rotation.x = Math.PI / 2;
    const rim = mk(new THREE.TorusGeometry(0.35, 0.04, 6, 24), '#1f2a44', 0, 0, 0.02, g);
    const hand1 = box(0.04, 0.22, 0.02, '#1f2a44', 0, 0.09, 0.05, g); hand1.rotation.z = -0.6;
    const hand2 = box(0.03, 0.3, 0.02, '#e8392b', 0, 0, 0.06, g);
    hand2.geometry.translate(0, 0.13, 0); hand2.position.y = 0;
    g.userData.dyn = true;
    animals.push({ update: (t) => { hand2.rotation.z = -t * 0.5; } });
    void rim;
  }

  // ---------- CHODBA ----------
  const LOCK = ['#e8392b', '#f2861f', '#f5c21b', '#7cc242', '#2f73c4', '#8e3fa8'];
  for (const cx of [-23, -9, 9, 23]) {
    for (let i = 0; i < 4; i++) {
      const x = cx - 1.2 + i * 0.8;
      box(0.78, 2, 0.45, LOCK[(i + Math.abs(cx)) % 6], x, 1, -2.62);
      box(0.6, 0.04, 0.02, '#ffffff', x, 1.75, -2.39);
      box(0.6, 0.04, 0.02, '#ffffff', x, 1.65, -2.39);
      box(0.05, 0.18, 0.04, '#d6dbe3', x + 0.28, 1.1, -2.38);
    }
    coll(cx, -2.62, 3.2, 0.45);
  }
  // nástěnky / plakáty nad skříňkami
  poster(-16, -2.83, 1.2, 0.9, posterText('#2f73c4', '📚', 'ČTEME'));
  poster(-2.5, -2.83, 1.2, 0.9, posterText('#7cc242', '💛', 'POMÁHÁME SI'));
  poster(2.5, -2.83, 1.2, 0.9, posterText('#f2861f', '🔬', 'BÁDÁME'));
  poster(15.5, -2.83, 1.2, 0.9, posterText('#8e3fa8', '💻', 'TVOŘÍME'));
  clock(-9, 2.5, -2.36);
  // jižní strana chodby: lavičky, rostliny, koše
  for (const x of [-9, 9]) {
    box(2.4, 0.08, 0.5, '#c98e56', x, 0.48, 2.5);
    box(2.4, 0.4, 0.06, '#c98e56', x, 0.8, 2.78);
    for (const dx of [-1, 1]) box(0.08, 0.45, 0.45, '#6b7280', x + dx, 0.22, 2.5);
    coll(x, 2.5, 2.4, 0.6);
  }
  plant(-24.5, 2.3, 1.1, 2); plant(-12.5, 2.3, 1, 0); plant(-4.5, 2.3, 1, 1);
  plant(4.5, 2.3, 1, 0); plant(12.5, 2.3, 1, 2); plant(25.4, 2.3, 1.1, 0);
  for (const x of [-5.8, 22]) { cyl(0.22, 0.18, 0.55, '#2f73c4', x, 0.28, 2.45); coll(x, 2.45, 0.4, 0.4); }

  // ---------- UČEBNY ----------
  // okna na zadní stěně horních učeben
  for (const cx of [-18, 0, 18]) { windowN(cx - 6.4, -14.83); windowN(cx + 6.4, -14.83); }
  // Matematika
  bookshelf(-9.45, -9.5, 2.4, true);
  plant(-10.2, -13.9, 1, 1);
  // Zeměpis
  bookshelf(8.55, -9.5, 2.4, true);
  plant(-7.8, -5, 0.9, 0);
  { // model hory s čepicí sněhu na stolku
    box(1.4, 0.7, 0.9, '#a8693a', 6.5, 0.35, -13.6);
    mk(new THREE.ConeGeometry(0.5, 0.8, 6), '#7a8b6a', 6.3, 1.1, -13.6);
    mk(new THREE.ConeGeometry(0.2, 0.3, 6), '#ffffff', 6.3, 1.39, -13.6);
    mk(new THREE.ConeGeometry(0.35, 0.55, 6), '#8a9a78', 6.85, 0.98, -13.5);
    coll(6.5, -13.6, 1.4, 0.9);
  }
  // Dějepis – vitrína s historickými předměty
  {
    box(2.2, 0.8, 0.7, '#8a5a36', 9.6 + 0.35, 0.4, -9);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 0.6), lam('#cdeeff', { transparent: true, opacity: 0.35 }));
    glass.position.set(9.95, 1.2, -9); glass.rotation.y = Math.PI / 2; scene.add(glass);
    const helmet = mk(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#7a8566', 9.95, 0.82, -9.5);
    void helmet;
    box(0.3, 0.06, 0.4, '#5b3a22', 9.95, 0.84, -8.7); // stará kniha
    box(0.05, 0.02, 0.5, '#c9ced8', 9.95, 0.83, -9.05); // pero
    coll(9.95, -9, 0.7, 2.2);
  }
  // Naše třída – koberec, knihovna, rostliny, židle u katedry
  {
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(13, 7.5), lam('#e8b4a0'));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.015, 9.2); scene.add(rug);
    const rug2 = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 6.9), lam('#f2cdbd'));
    rug2.rotation.x = -Math.PI / 2; rug2.position.set(0, 0.018, 9.2); scene.add(rug2);
    bookshelf(8.55, 8, 2.6, true);
    plant(-8.2, 14.2, 1.1, 2); plant(8.2, 14.2, 1, 1); plant(-8.2, 4.2, 0.9, 0);
    box(0.5, 0.06, 0.5, '#2f73c4', -2.1, 0.5, 14.1);
    box(0.5, 0.5, 0.06, '#2f73c4', -2.1, 0.78, 14.38);
    for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) box(0.05, 0.5, 0.05, '#6b7280', -2.1 + dx, 0.25, 14.1 + dz);
    coll(-2.1, 14.1, 0.6, 0.6);
    box(0.5, 0.25, 0.35, '#f5c21b', 0.6, 1.02, 14); // krabička s křídami
    ball(0.2, '#3b8fd9', -0.6, 1.1, 14, scene, 1); // malý glóbus
  }
  // Přírodopis – křeček v kleci, želva v teráriu, rostliny
  {
    // stolek s klecí
    box(1.6, 0.75, 0.9, '#a8693a', -10.6, 0.37, 6.6); coll(-10.6, 6.6, 1.6, 0.9);
    box(1.4, 0.08, 0.75, '#f5c21b', -10.6, 0.79, 6.6);
    for (let i = 0; i <= 7; i++) box(0.02, 0.6, 0.02, '#c9ced8', -11.3 + i * 0.2, 1.1, 6.25);
    for (let i = 0; i <= 7; i++) box(0.02, 0.6, 0.02, '#c9ced8', -11.3 + i * 0.2, 1.1, 6.95);
    box(1.42, 0.03, 0.76, '#c9ced8', -10.6, 1.4, 6.6);
    const wheel = new THREE.Group(); wheel.position.set(-10.2, 1.08, 6.6); wheel.userData.dyn = true; scene.add(wheel);
    const ring = mk(new THREE.TorusGeometry(0.22, 0.025, 6, 18), '#e8392b', 0, 0, 0, wheel);
    for (let i = 0; i < 6; i++) { const s = box(0.02, 0.44, 0.02, '#e8392b', 0, 0, 0, wheel); s.rotation.z = (i / 6) * Math.PI; }
    void ring;
    const ham = new THREE.Group(); ham.position.set(-10.2, 0.92, 6.6); ham.userData.dyn = true; scene.add(ham);
    const hb = ball(0.11, '#d9a066', 0, 0, 0, ham, 1); hb.scale.set(1.3, 1, 1);
    ball(0.035, '#f6d7b8', 0.12, 0.05, 0.06, ham, 0); ball(0.035, '#f6d7b8', 0.12, 0.05, -0.06, ham, 0);
    ball(0.015, '#1f2a44', 0.14, 0.02, 0.04, ham, 0); ball(0.015, '#1f2a44', 0.14, 0.02, -0.04, ham, 0);
    const heartH = addHeart(ham, 0.55);
    animals.push({ pos: () => ({ x: -10.6, z: 6.6 }), heart: heartH, update: (t) => { wheel.rotation.z = t * 6; ham.position.y = 0.92 + Math.abs(Math.sin(t * 12)) * 0.02; } });
    // terárium s želvou
    box(3, 0.4, 1.4, '#8a5a36', -22.5, 0.2, 13.4); coll(-22.5, 13.4, 3, 1.4);
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.2), lam('#e3d4b5')); sand.rotation.x = -Math.PI / 2; sand.position.set(-22.5, 0.41, 13.4); scene.add(sand);
    const tglass = new THREE.Mesh(new THREE.BoxGeometry(3, 0.7, 1.4), lam('#cdeeff', { transparent: true, opacity: 0.25 }));
    tglass.position.set(-22.5, 0.75, 13.4); scene.add(tglass);
    ball(0.15, '#9ca3af', -23.6, 0.48, 13.1, scene, 0);
    for (let i = 0; i < 5; i++) { const l = box(0.05, 0.3, 0.02, '#5cb848', -21.4, 0.55, 13.8); l.rotation.set(0, i, (rand() - 0.5) * 1.2); }
    const turtle = new THREE.Group(); turtle.position.set(-22.5, 0.42, 13.4); turtle.userData.dyn = true; scene.add(turtle);
    const shell = mk(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#4f7a3a', 0, 0, 0, turtle); shell.scale.set(1.2, 0.8, 1);
    ball(0.08, '#9bc47a', 0.3, 0.06, 0, turtle, 1);
    for (const [lx, lz] of [[0.15, 0.15], [0.15, -0.15], [-0.15, 0.15], [-0.15, -0.15]]) ball(0.05, '#9bc47a', lx, 0.02, lz, turtle, 0);
    const heartT = addHeart(turtle, 0.7);
    animals.push({ pos: () => ({ x: turtle.position.x, z: 13.4 }), heart: heartT, update: (t) => {
      const s = Math.sin(t * 0.25); turtle.position.x = -22.5 + s * 0.9; turtle.rotation.y = Math.cos(t * 0.25) > 0 ? 0 : Math.PI;
    } });
    // rybičky v akváriu (akvárium je v world.js na x=-13, z=4.2)
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Group(); f.userData.dyn = true; scene.add(f);
      const col = ['#f2861f', '#f5c21b', '#e8392b', '#2bb5b0'][i];
      const b = ball(0.1, col, 0, 0, 0, f, 1); b.scale.set(1.6, 1, 0.6);
      const tail = mk(new THREE.ConeGeometry(0.08, 0.14, 4), col, -0.2, 0, 0, f); tail.rotation.z = Math.PI / 2;
      const ph = rand() * 6, sp = 0.4 + rand() * 0.3, y = 0.85 + i * 0.18, zz = 4.0 + (i % 2) * 0.35;
      animals.push({ update: (t) => {
        const s = Math.sin(t * sp + ph); f.position.set(-13 + s * 1.0, y + Math.sin(t * 2 + ph) * 0.04, zz);
        f.rotation.y = Math.cos(t * sp + ph) > 0 ? 0 : Math.PI; tail.rotation.y = Math.sin(t * 10) * 0.4;
      } });
    }
    plant(-25.4, 6.5, 1, 2);
  }
  // Programování – serverová skříň s blikajícími diodami (robot Bajt je v npc.js)
  {
    box(0.7, 2.1, 1.6, '#1f2a44', 26.4, 1.05, 9.2); coll(26.4, 9.2, 0.7, 1.6);
    const leds = [];
    for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) {
      const led = mk(new THREE.BoxGeometry(0.02, 0.05, 0.1), new THREE.MeshBasicMaterial({ color: '#58e08f' }), 26.04, 0.4 + i * 0.2, 8.7 + j * 0.45);
      led.userData.dyn = true; leds.push(led);
    }
    animals.push({ update: (t) => { leds.forEach((l, k) => l.material.color.set(Math.sin(t * (3 + (k % 5)) + k) > 0.2 ? '#58e08f' : '#1d5a36')); } });
    plant(10.2, 14.1, 1, 1);
  }

  // ---------- VENKU ----------
  function tree(x, z, kind = rand() < 0.35 ? 'pine' : 'leaf', s = 0.9 + rand() * 0.4) {
    cyl(0.22 * s, 0.32 * s, 2.2 * s, '#7a4a2a', x, 1.1 * s, z);
    if (kind === 'pine') {
      for (let i = 0; i < 3; i++) mk(new THREE.ConeGeometry((1.6 - i * 0.4) * s, 1.6 * s, 7), pick(['#2f7a3a', '#3a8a43']), x, (2.2 + i * 0.9) * s, z);
    } else {
      const c = pick(['#5cb848', '#4aa63c', '#6cc24a']);
      ball(1.4 * s, c, x, 3.1 * s, z, scene, 1);
      ball(1.0 * s, c, x + 0.9 * s, 2.7 * s, z + 0.3 * s, scene, 1);
      ball(1.0 * s, c, x - 0.8 * s, 2.8 * s, z - 0.4 * s, scene, 1);
      if (rand() < 0.5) for (let i = 0; i < 4; i++) ball(0.12, '#e8392b', x + (rand() - 0.5) * 2 * s, (2.4 + rand() * 1.2) * s, z + 1.1 * s, scene, 0);
    }
    coll(x, z, 0.6 * s, 0.6 * s);
  }
  for (const [x, z] of [[34, -10], [43, -21], [51, -5], [58, 4], [62, -6], [36, 20], [52, 20], [60, 15], [-34, -8], [-33, 10], [-36, 0], [0, -22], [-14, -21], [14, -21], [-14, 22], [14, 22], [0, 22], [24, -22], [-24, 21], [33, 13]]) tree(x, z);

  // keře kolem budovy
  for (let x = -25; x <= 25; x += 3.4) { ball(0.7, pick(['#4aa63c', '#5cb848']), x, 0.45, -15.9, scene, 1); ball(0.7, pick(['#4aa63c', '#5cb848']), x, 0.45, 15.9, scene, 1); }
  for (let z = -13; z <= 13; z += 3.4) ball(0.7, '#4aa63c', -27.9, 0.45, z, scene, 1);
  for (const z of [-13, -9.6, -6.2, 6.2, 9.6, 13]) ball(0.7, '#5cb848', 27.9, 0.45, z, scene, 1);

  // cesta lemovaná květinami
  const FLOW = ['#e8392b', '#f5c21b', '#ec5f9c', '#8e3fa8', '#ffffff', '#f2861f'];
  const flowers = [];
  for (let x = 31; x < 57; x += 1.3) for (const z of [-2.6, 2.6]) {
    if (rand() < 0.25) continue;
    const fz = z + (rand() - 0.5) * 0.4;
    cyl(0.02, 0.02, 0.4, '#4f9a3a', x, 0.2, fz, scene, 4);
    ball(0.11, pick(FLOW), x, 0.43, fz, scene, 0);
    ball(0.05, '#f5c21b', x, 0.47, fz, scene, 0);
    flowers.push([x, fz]);
  }
  // záhon u vchodu
  for (let i = 0; i < 26; i++) {
    const x = 29 + rand() * 3, z = (rand() < 0.5 ? -1 : 1) * (3.5 + rand() * 7);
    cyl(0.02, 0.02, 0.35, '#4f9a3a', x, 0.17, z, scene, 4); ball(0.1, pick(FLOW), x, 0.38, z, scene, 0);
  }

  // lavičky, stojan na kola, stožár s vlajkou, branky a míč
  function bench(x, z, rot = 0) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
    for (let i = 0; i < 3; i++) box(2.6, 0.06, 0.16, '#c47a3a', 0, 0.48, -0.2 + i * 0.2, g);
    for (let i = 0; i < 2; i++) box(2.6, 0.14, 0.05, '#c47a3a', 0, 0.75 + i * 0.2, 0.3, g);
    for (const dx of [-1.1, 1.1]) { box(0.08, 0.48, 0.6, '#4b4f58', dx, 0.24, 0, g); box(0.08, 0.5, 0.06, '#4b4f58', dx, 0.8, 0.3, g); }
    coll(x, z, rot ? 0.8 : 2.6, rot ? 2.6 : 0.8);
  }
  bench(40, -4.6); bench(47, 4.6, Math.PI);
  for (let i = 0; i < 5; i++) mk(new THREE.TorusGeometry(0.35, 0.03, 6, 14, Math.PI), '#9ca3af', 31.5 + i * 0.5, 0, 6).rotation.y = Math.PI / 2;
  coll(32.5, 6, 2.6, 0.5);
  cyl(0.06, 0.08, 6, '#d6dbe3', 31, 3, -5); coll(31, -5, 0.3, 0.3);
  {
    const cv = document.createElement('canvas'); cv.width = 96; cv.height = 64; const c = cv.getContext('2d');
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, 96, 32); c.fillStyle = '#d7141a'; c.fillRect(0, 32, 96, 32);
    c.fillStyle = '#11457e'; c.beginPath(); c.moveTo(0, 0); c.lineTo(48, 32); c.lineTo(0, 64); c.closePath(); c.fill();
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1, 6, 1), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
    flag.position.set(31.75, 5.4, -5); flag.userData.dyn = true; scene.add(flag);
    const base = flag.geometry.attributes.position.array.slice();
    animals.push({ update: (t) => {
      const p = flag.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.array[i * 3 + 2] = Math.sin(t * 4 + x * 3) * 0.08 * (x + 0.75); }
      p.needsUpdate = true;
    } });
  }
  for (const gx of [47.4, 60.6]) {
    const dir = gx < 54 ? -1 : 1;
    for (const dz of [-1.6, 1.6]) box(0.12, 1.6, 0.12, '#ffffff', gx, 0.8, -14 + dz);
    box(0.12, 0.12, 3.3, '#ffffff', gx, 1.6, -14);
    box(0.05, 1.6, 3.2, '#e6e6e6', gx + dir * 0.6, 0.8, -14).material = lam('#ffffff', { transparent: true, opacity: 0.35 });
    coll(gx, -14, 0.3, 3.4);
  }
  const ballMesh = mk(new THREE.IcosahedronGeometry(0.25, 1), '#ffffff', 53, 0.25, -12.5);
  ball(0.08, '#1f2a44', 53.2, 0.4, -12.42, scene, 0);
  void ballMesh;

  // plot kolem dvora
  const fenceX0 = 28.5, fenceX1 = 66, fenceZ = 24;
  for (let x = fenceX0; x <= fenceX1; x += 2.5) for (const z of [-fenceZ, fenceZ]) box(0.12, 1.1, 0.12, '#f4f1ea', x, 0.55, z);
  for (let z = -fenceZ; z <= fenceZ; z += 2.5) box(0.12, 1.1, 0.12, '#f4f1ea', fenceX1, 0.55, z);
  for (const y of [0.4, 0.85]) {
    for (const z of [-fenceZ, fenceZ]) box(fenceX1 - fenceX0, 0.07, 0.05, '#f4f1ea', (fenceX0 + fenceX1) / 2, y, z);
    box(0.05, 0.07, fenceZ * 2, '#f4f1ea', fenceX1, y, 0);
  }

  // rybníček
  const pond = new THREE.Mesh(new THREE.CircleGeometry(3.4, 28), lam('#5bb3e6'));
  pond.rotation.x = -Math.PI / 2; pond.position.set(43, 0.02, 13); scene.add(pond);
  const shore = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.9, 28), lam('#c9b48a'));
  shore.rotation.x = -Math.PI / 2; shore.position.set(43, 0.015, 13); scene.add(shore);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; ball(0.25 + rand() * 0.15, '#9ca3af', 43 + Math.cos(a) * 3.8, 0.12, 13 + Math.sin(a) * 3.8, scene, 0); }
  for (let i = 0; i < 4; i++) { const a = rand() * 6; const lp = new THREE.Mesh(new THREE.CircleGeometry(0.3, 10), lam('#4aa63c')); lp.rotation.x = -Math.PI / 2; lp.position.set(43 + Math.cos(a) * 2.2, 0.03, 13 + Math.sin(a) * 2.2); scene.add(lp); }
  coll(43, 13, 6.6, 6.6);

  // ---------- ZVÍŘÁTKA ----------
  function addHeart(parent, y) {
    const h = makeLabel('❤️', { bg: 'rgba(255,255,255,0.95)', size: 40 });
    h.position.y = y; h.visible = false; parent.add(h); return h;
  }
  const legBox = (g, color, pts, h = 0.22) => pts.map(([x, z]) => box(0.07, h, 0.07, color, x, h / 2, z, g));

  // kočka na chodbě
  {
    const cat = new THREE.Group(); cat.userData.dyn = true; cat.scale.setScalar(1.6); scene.add(cat);
    const C = '#f2a03d';
    box(0.6, 0.26, 0.28, C, 0, 0.36, 0, cat);
    for (let i = 0; i < 3; i++) box(0.05, 0.27, 0.29, '#d9822b', -0.18 + i * 0.15, 0.36, 0, cat);
    const head = new THREE.Group(); head.position.set(0.36, 0.52, 0); cat.add(head);
    box(0.26, 0.24, 0.28, C, 0, 0, 0, head);
    for (const dz of [-0.09, 0.09]) { mk(new THREE.ConeGeometry(0.06, 0.12, 4), C, 0.0, 0.17, dz, head); ball(0.025, '#1f2a44', 0.135, 0.04, dz * 0.8, head, 0); }
    box(0.03, 0.03, 0.04, '#ec5f9c', 0.14, -0.02, 0, head);
    const tail = box(0.05, 0.45, 0.05, C, -0.32, 0.55, 0, cat); tail.rotation.z = 0.5;
    const legs = legBox(cat, '#f6d7b8', [[0.22, 0.1], [0.22, -0.1], [-0.22, 0.1], [-0.22, -0.1]]);
    const heart = addHeart(cat, 1.05);
    const name = makeLabel('🐱 Micka', { size: 26 }); name.position.y = 0.85; cat.add(name);
    const st = { x: -14, z: 1, tx: -14, tz: 1, wait: 1 };
    cat.position.set(st.x, 0, st.z);
    animals.push({ pos: () => ({ x: cat.position.x, z: cat.position.z }), heart, update: (t, dt, near) => {
      const dx = st.tx - st.x, dz = st.tz - st.z, d = Math.hypot(dx, dz);
      let moving = false;
      if (near) { /* zastaví se a nechá se pohladit */ }
      else if (st.wait > 0) st.wait -= dt;
      else if (d < 0.1) { st.tx = -24 + rand() * 48; st.tz = -1.5 + rand() * 3.3; st.wait = 1.5 + rand() * 3; }
      else { const sp = 1.3 * dt; st.x += (dx / d) * Math.min(sp, d); st.z += (dz / d) * Math.min(sp, d); moving = true; cat.rotation.y = Math.atan2(-dz, dx); }
      cat.position.set(st.x, 0, st.z);
      legs.forEach((l, i) => { l.rotation.z = moving ? Math.sin(t * 12 + (i % 2) * Math.PI + (i > 1 ? Math.PI : 0)) * 0.5 : 0; });
      tail.rotation.z = 0.5 + Math.sin(t * 3) * 0.25;
      head.rotation.y = near ? Math.sin(t * 2) * 0.2 : 0;
    } });
  }

  // králíci na dvoře
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Group(); r.userData.dyn = true; r.scale.setScalar(1.6); scene.add(r);
    const col = ['#ffffff', '#b8a48c', '#8a8f99'][i];
    const body = ball(0.22, col, 0, 0.22, 0, r, 1); body.scale.set(1.3, 1, 1);
    ball(0.14, col, 0.26, 0.38, 0, r, 1);
    for (const dz of [-0.05, 0.05]) { const e = box(0.05, 0.24, 0.035, col, 0.24, 0.6, dz, r); e.rotation.x = dz * 3; box(0.025, 0.16, 0.02, '#f2b3c5', 0.25, 0.6, dz * 1.05, r).rotation.x = dz * 3; }
    ball(0.02, '#1f2a44', 0.37, 0.42, 0.06, r, 0); ball(0.02, '#1f2a44', 0.37, 0.42, -0.06, r, 0);
    ball(0.07, '#ffffff', -0.28, 0.28, 0, r, 0);
    const heart = addHeart(r, 1.0);
    const st = { x: 36 + rand() * 24, z: -18 + rand() * 30, tx: 0, tz: 0, wait: rand() * 2, hop: 0 };
    st.tx = st.x; st.tz = st.z;
    animals.push({ pos: () => ({ x: st.x, z: st.z }), heart, update: (t, dt, near) => {
      const dx = st.tx - st.x, dz = st.tz - st.z, d = Math.hypot(dx, dz);
      if (near) { r.position.y = 0; }
      else if (st.wait > 0) { st.wait -= dt; r.position.y = 0; }
      else if (d < 0.15) { st.tx = Math.max(33, Math.min(64, st.x + (rand() - 0.5) * 8)); st.tz = Math.max(-21, Math.min(21, st.z + (rand() - 0.5) * 8)); if (Math.hypot(st.tx - 43, st.tz - 13) < 4.5) st.tz -= 9; st.wait = 0.8 + rand() * 2.5; }
      else { st.hop += dt * 9; const sp = 2 * dt; st.x += (dx / d) * Math.min(sp, d); st.z += (dz / d) * Math.min(sp, d); r.position.y = Math.abs(Math.sin(st.hop)) * 0.3; r.rotation.y = Math.atan2(-dz, dx); }
      r.position.x = st.x; r.position.z = st.z;
    } });
  }

  // kachny na rybníčku
  for (let i = 0; i < 3; i++) {
    const dk = new THREE.Group(); dk.userData.dyn = true; dk.scale.setScalar(1.4); scene.add(dk);
    const col = i === 0 ? '#8a5a36' : '#ffffff';
    const b = ball(0.25, col, 0, 0.12, 0, dk, 1); b.scale.set(1.4, 0.8, 1);
    ball(0.14, i === 0 ? '#2f7a3a' : '#ffffff', 0.27, 0.35, 0, dk, 1);
    const beak = mk(new THREE.ConeGeometry(0.05, 0.14, 6), '#f2861f', 0.43, 0.33, 0, dk); beak.rotation.z = -Math.PI / 2;
    ball(0.025, '#1f2a44', 0.36, 0.4, 0.08, dk, 0); ball(0.025, '#1f2a44', 0.36, 0.4, -0.08, dk, 0);
    box(0.1, 0.1, 0.05, col, -0.36, 0.25, 0, dk).rotation.z = 0.6;
    const heart = addHeart(dk, 0.9);
    const rad = 1.2 + i * 0.7, sp = (0.25 + i * 0.08) * (i % 2 ? -1 : 1), ph = i * 2;
    animals.push({ pos: () => ({ x: dk.position.x, z: dk.position.z }), heart, near: 4.6, update: (t) => {
      const a = t * sp + ph; dk.position.set(43 + Math.cos(a) * rad, Math.sin(t * 3 + i) * 0.02, 13 + Math.sin(a) * rad);
      dk.rotation.y = Math.atan2(-Math.cos(a) * sp, -Math.sin(a) * sp);
    } });
  }

  // ptáci na obloze
  for (let i = 0; i < 5; i++) {
    const bd = new THREE.Group(); bd.userData.dyn = true; scene.add(bd);
    const b = ball(0.16, '#4b4f58', 0, 0, 0, bd, 0); b.scale.set(1.6, 0.8, 0.8);
    ball(0.1, '#4b4f58', 0.24, 0.06, 0, bd, 0);
    mk(new THREE.ConeGeometry(0.04, 0.1, 4), '#f5c21b', 0.36, 0.06, 0, bd).rotation.z = -Math.PI / 2;
    const wings = [-1, 1].map((s) => { const w = new THREE.Group(); bd.add(w); const m = box(0.25, 0.02, 0.5, '#6b7280', 0, 0, s * 0.25, w); void m; return { w, s }; });
    const rad = 8 + rand() * 10, sp = 0.25 + rand() * 0.2, h = 8 + rand() * 4, cx = 40 + rand() * 12, cz = -4 + rand() * 8, ph = rand() * 6;
    animals.push({ update: (t) => {
      const a = t * sp + ph; bd.position.set(cx + Math.cos(a) * rad, h + Math.sin(t + i) * 0.5, cz + Math.sin(a) * rad);
      bd.rotation.y = Math.atan2(Math.cos(a), -Math.sin(a)) + Math.PI;
      wings.forEach(({ w, s }) => { w.rotation.x = s * Math.sin(t * 10 + i) * 0.7; });
    } });
  }

  // motýli u květin
  for (let i = 0; i < 6; i++) {
    const bf = new THREE.Group(); bf.userData.dyn = true; scene.add(bf);
    const col = ['#f5c21b', '#ec5f9c', '#2f73c4', '#f2861f', '#ffffff', '#8e3fa8'][i];
    const wm = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
    const left = new THREE.Group(), right = new THREE.Group(); bf.add(left, right);
    const l1 = new THREE.Mesh(new THREE.CircleGeometry(0.12, 8), wm); l1.position.set(0, 0, 0.12); l1.rotation.x = -Math.PI / 2; left.add(l1);
    const r1 = new THREE.Mesh(new THREE.CircleGeometry(0.12, 8), wm); r1.position.set(0, 0, -0.12); r1.rotation.x = -Math.PI / 2; right.add(r1);
    box(0.18, 0.03, 0.03, '#1f2a44', 0, 0, 0, bf);
    const [fx, fz] = flowers[Math.floor(rand() * flowers.length)] || [40, 2];
    const ph = rand() * 6;
    animals.push({ update: (t) => {
      bf.position.set(fx + Math.sin(t * 0.6 + ph) * 1.8, 0.8 + Math.sin(t * 1.7 + ph) * 0.35, fz + Math.cos(t * 0.45 + ph) * 1.2);
      bf.rotation.y = t * 0.6 + ph;
      const f = Math.sin(t * 18 + ph) * 0.9; left.rotation.x = f; right.rotation.x = -f;
    } });
  }

  function update(t, dt, px, pz) {
    for (const a of animals) {
      let near = false;
      if (a.pos && a.heart) {
        const p = a.pos();
        near = Math.hypot(p.x - px, p.z - pz) < (a.near || 1.8);
        a.heart.visible = near;
        if (near) a.heart.position.y += Math.sin(t * 4) * 0.003;
      }
      a.update(t, dt, near);
    }
  }
  return { update };
}

// Sloučí nehybné objekty se stejným materiálem do jedné sítě → hra běží plynule i na tabletech.
export function mergeStatic(scene) {
  scene.updateMatrixWorld(true);
  const groups = new Map();
  (function walk(o) {
    if (o.userData.dyn) return;
    if (o.isMesh && !Array.isArray(o.material) && !o.material.transparent && o.geometry.attributes.normal) {
      if (!groups.has(o.material)) groups.set(o.material, []);
      groups.get(o.material).push(o);
    }
    for (const c of o.children.slice()) walk(c);
  })(scene);
  let merged = 0;
  for (const [mat, list] of groups) {
    if (list.length < 2) continue;
    const parts = list.map((m) => {
      let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      return g;
    });
    const count = parts.reduce((s, g) => s + g.attributes.position.count, 0);
    const pos = new Float32Array(count * 3), nor = new Float32Array(count * 3), uv = new Float32Array(count * 2);
    let o = 0;
    for (const g of parts) {
      const n = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3);
      nor.set(g.attributes.normal.array, o * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
      o += n; g.dispose();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.computeBoundingSphere();
    for (const m of list) { m.parent.remove(m); m.geometry.dispose(); }
    scene.add(new THREE.Mesh(geo, mat));
    merged += list.length;
  }
  return merged;
}
