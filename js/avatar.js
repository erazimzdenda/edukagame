// Kostičkovaná postavička s vlastnoručně nakresleným obličejem.
import * as THREE from '../vendor/three.module.min.js';

export const BODY_COLORS = ['#e8392b', '#f2861f', '#f5c21b', '#7cc242', '#2f73c4', '#8e3fa8', '#ec5f9c', '#2bb5b0', '#4b4f58', '#f4f1ea'];
export const SKIN_COLORS = ['#f6d7b8', '#e9b98f', '#c98e60', '#8d5a3b', '#5c3a24', '#ffd84d'];

function shade(hex, f) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(f);
  return c;
}

export function makeLabel(text, { color = '#1f2a44', bg = 'rgba(255,255,255,0.92)', size = 40 } = {}) {
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  ctx.font = `700 ${size}px Nunito, system-ui, sans-serif`;
  const w = Math.ceil(ctx.measureText(text).width) + size;
  cv.width = w; cv.height = size * 1.6;
  ctx.font = `700 ${size}px Nunito, system-ui, sans-serif`;
  ctx.fillStyle = bg;
  const r = cv.height / 2;
  ctx.beginPath(); ctx.roundRect(0, 0, w, cv.height, r); ctx.fill();
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, cv.height / 2 + 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  const h = 0.42 * (size / 40);
  sp.scale.set(h * (w / cv.height), h, 1);
  sp.renderOrder = 10;
  return sp;
}

export class Avatar {
  constructor({ name = '', color = BODY_COLORS[4], skin = SKIN_COLORS[0], face = null } = {}) {
    this.group = new THREE.Group();
    this.skin = skin;
    const lam = (c) => new THREE.MeshLambertMaterial({ color: c });
    this.bodyMat = lam(color);
    this.armMat = lam(shade(color, 0.85));
    this.legMat = lam('#3b4a6b');
    this.skinMat = lam(skin);

    const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    // nohy
    this.legL = new THREE.Group(); this.legR = new THREE.Group();
    for (const [g, x] of [[this.legL, -0.2], [this.legR, 0.2]]) {
      const m = box(0.36, 0.8, 0.4, this.legMat); m.position.y = -0.4; g.add(m);
      g.position.set(x, 0.8, 0); this.group.add(g);
    }
    // trup
    const torso = box(0.8, 0.8, 0.45, this.bodyMat); torso.position.y = 1.2; this.group.add(torso);
    // ruce
    this.armL = new THREE.Group(); this.armR = new THREE.Group();
    for (const [g, x] of [[this.armL, -0.56], [this.armR, 0.56]]) {
      const m = box(0.3, 0.75, 0.36, this.armMat); m.position.y = -0.33; g.add(m);
      const hand = box(0.28, 0.14, 0.34, this.skinMat); hand.position.y = -0.76; g.add(hand);
      g.position.set(x, 1.58, 0); this.group.add(g);
    }
    // hlava – přední stěna (+z) nese obličej
    const blank = document.createElement('canvas');
    blank.width = blank.height = 128;
    const bctx = blank.getContext('2d'); bctx.fillStyle = skin; bctx.fillRect(0, 0, 128, 128);
    this.faceMat = new THREE.MeshLambertMaterial({ map: this._tex(blank) });
    const hs = 0.66;
    this.head = new THREE.Mesh(new THREE.BoxGeometry(hs, hs, hs),
      [this.skinMat, this.skinMat, this.skinMat, this.skinMat, this.faceMat, this.skinMat]);
    this.head.position.y = 1.6 + hs / 2 + 0.02;
    this.group.add(this.head);

    // stín pod postavou
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02; this.group.add(sh);

    this.label = null;
    this.setName(name);
    if (face) this.setFace(face);
    this.walk = 0;
    this.bubble = null; this.bubbleUntil = 0;
  }

  setName(name) {
    if (this.label) this.group.remove(this.label);
    if (!name) { this.label = null; return; }
    this.label = makeLabel(name);
    this.label.position.y = 2.65;
    this.group.add(this.label);
  }

  setColor(color) {
    this.bodyMat.color.set(color);
    this.armMat.color.copy(shade(color, 0.85));
  }

  setSkin(skin) { this.skin = skin; this.skinMat.color.set(skin); }

  // face = canvas nebo dataURL
  setFace(face) {
    if (typeof face === 'string') {
      const img = new Image();
      img.onload = () => this.setFace(img);
      img.src = face;
      return;
    }
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    cv.getContext('2d').drawImage(face, 0, 0, 128, 128);
    if (this._faceSrc === face && this.faceMat.map) { // stejné plátno – jen obnovit
      this.faceMat.map.image = cv; this.faceMat.map.needsUpdate = true; return;
    }
    this._faceSrc = face;
    const old = this.faceMat.map;
    this.faceMat.map = this._tex(cv);
    this.faceMat.needsUpdate = true;
    old?.dispose();
  }

  _tex(cv) {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  say(text) {
    if (this.bubble) this.group.remove(this.bubble);
    this.bubble = makeLabel(text, { bg: 'rgba(255,255,255,0.98)', color: '#1f2a44', size: 46 });
    this.bubble.position.y = 3.25;
    this.group.add(this.bubble);
    this.bubbleUntil = performance.now() + 4500;
  }

  animate(dt, moving) {
    if (moving) this.walk += dt * 10; else this.walk *= 0.85;
    const s = Math.sin(this.walk) * (moving ? 0.7 : Math.min(0.7, Math.abs(this.walk) * 0.1));
    this.legL.rotation.x = s; this.legR.rotation.x = -s;
    this.armL.rotation.x = -s * 0.8; this.armR.rotation.x = s * 0.8;
    if (this.bubble && performance.now() > this.bubbleUntil) {
      this.group.remove(this.bubble); this.bubble = null;
    }
  }

  dispose() {
    this.group.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose?.(); m.dispose(); });
    });
  }
}
