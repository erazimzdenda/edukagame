// Malování vlastního obličeje (na přední stranu hlavy).
export const PEN_COLORS = ['#1f2a44', '#ffffff', '#e8392b', '#f2861f', '#f5c21b', '#7cc242', '#2f73c4', '#8e3fa8', '#ec5f9c', '#7a4a2a'];

export function createFaceEditor(canvas, { skin, onChange }) {
  const ctx = canvas.getContext('2d');
  const N = canvas.width; // 256
  let pen = PEN_COLORS[0], size = 10, erasing = false;
  let strokes = []; // pro tlačítko Zpět
  let bg = skin;

  function snapshot() { strokes.push(ctx.getImageData(0, 0, N, N)); if (strokes.length > 30) strokes.shift(); }
  function fillBg() { ctx.fillStyle = bg; ctx.fillRect(0, 0, N, N); }

  function defaultFace() {
    fillBg();
    ctx.fillStyle = '#1f2a44';
    ctx.beginPath(); ctx.arc(N * 0.33, N * 0.4, N * 0.06, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(N * 0.67, N * 0.4, N * 0.06, 0, 7); ctx.fill();
    ctx.strokeStyle = '#1f2a44'; ctx.lineWidth = N * 0.04; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(N / 2, N * 0.55, N * 0.2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    onChange?.();
  }

  // změna barvy kůže: přebarví pozadí, ale zachová kresbu
  function setSkin(newSkin) {
    const old = hexToRgb(bg), nw = hexToRgb(newSkin);
    const img = ctx.getImageData(0, 0, N, N), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (Math.abs(d[i] - old[0]) < 6 && Math.abs(d[i + 1] - old[1]) < 6 && Math.abs(d[i + 2] - old[2]) < 6) {
        d[i] = nw[0]; d[i + 1] = nw[1]; d[i + 2] = nw[2];
      }
    }
    ctx.putImageData(img, 0, 0);
    bg = newSkin;
    onChange?.();
  }

  let drawing = false, last = null;
  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * N, y: ((e.clientY - r.top) / r.height) * N };
  };
  function line(a, b) {
    ctx.strokeStyle = erasing ? bg : pen;
    ctx.fillStyle = erasing ? bg : pen;
    ctx.lineWidth = erasing ? size * 2.2 : size;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    snapshot(); drawing = true; last = pos(e); line(last, last); onChange?.();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e); line(last, p); last = p; onChange?.();
  });
  const stop = () => { drawing = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  return {
    setPen(c) { pen = c; erasing = false; },
    setSize(s) { size = s; },
    setEraser(on) { erasing = on; },
    setSkin,
    undo() { const s = strokes.pop(); if (s) { ctx.putImageData(s, 0, 0); onChange?.(); } },
    clear() { snapshot(); fillBg(); onChange?.(); },
    defaultFace() { snapshot(); defaultFace(); },
    load(dataUrl) {
      return new Promise((res) => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0, N, N); onChange?.(); res(true); };
        img.onerror = () => { defaultFace(); res(false); };
        img.src = dataUrl;
      });
    },
    init() { defaultFace(); },
    toDataURL() {
      const small = document.createElement('canvas');
      small.width = small.height = 96;
      small.getContext('2d').drawImage(canvas, 0, 0, 96, 96);
      return small.toDataURL('image/png');
    },
  };
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
