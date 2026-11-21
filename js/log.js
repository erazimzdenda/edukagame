// Záznam o tom, kdo se kdy připojil (pro panel učitele).
// Hra nemá server, proto si záznam pamatuje každý prohlížeč a hráči si ho
// při setkání vyměňují. Učitel tak uvidí i ty, kteří už odešli – pokud
// o nich ví aspoň jeden z právě připojených.
const KEY = 'erazim-log';
const KEEP_DAYS = 30;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(log) {
  const limit = Date.now() - KEEP_DAYS * 864e5;
  for (const room of Object.keys(log)) {
    for (const k of Object.keys(log[room])) if (log[room][k].l < limit) delete log[room][k];
    if (!Object.keys(log[room]).length) delete log[room];
  }
  try { localStorage.setItem(KEY, JSON.stringify(log)); } catch {}
}
const keyOf = (name) => String(name).trim().toLowerCase();

export function logSeen(room, name, color, { visit = false } = {}) {
  if (!room || !name) return;
  const log = load();
  const r = (log[room] ||= {});
  const k = keyOf(name), now = Date.now();
  const e = (r[k] ||= { n: name, c: color || '#999', f: now, l: now, s: 0, v: 0 });
  e.n = name; if (color) e.c = color; e.l = now;
  if (visit) e.v = (e.v || 0) + 1;
  save(log);
}

export function logSolved(room, name, count = 1) {
  if (!room || !name) return;
  const log = load();
  const e = log[room]?.[keyOf(name)];
  if (!e) { logSeen(room, name); return logSolved(room, name, count); }
  e.s = (e.s || 0) + count;
  save(log);
}

export function roomEntries(room) {
  return Object.values(load()[room] || {});
}

export function knownRooms() {
  const log = load();
  return Object.keys(log).sort((a, b) => Math.max(...roomEntries(b).map((e) => e.l)) - Math.max(...roomEntries(a).map((e) => e.l)));
}

// sloučí záznamy od jiného hráče (data od ostatních jsou nedůvěryhodná → kontrola)
export function mergeEntries(room, entries) {
  if (!room || !Array.isArray(entries)) return false;
  const log = load();
  const r = (log[room] ||= {});
  const now = Date.now();
  let changed = false;
  for (const x of entries.slice(0, 300)) {
    if (!x || typeof x.n !== 'string' || !x.n.trim()) continue;
    const n = x.n.trim().slice(0, 16);
    const f = Math.min(+x.f || now, now), l = Math.min(+x.l || now, now);
    if (!(f > 0) || !(l > 0)) continue;
    const s = Math.max(0, Math.min(999, Math.floor(+x.s || 0))), v = Math.max(0, Math.min(999, Math.floor(+x.v || 0)));
    const c = /^#[0-9a-f]{6}$/i.test(x.c) ? x.c : '#999999';
    const k = keyOf(n), e = r[k];
    if (!e) { r[k] = { n, c, f, l, s, v }; changed = true; continue; }
    if (f < e.f) { e.f = f; changed = true; }
    if (l > e.l) { e.l = l; e.c = c; changed = true; }
    if (s > (e.s || 0)) { e.s = s; changed = true; }
    if (v > (e.v || 0)) { e.v = v; changed = true; }
  }
  if (changed) save(log);
  return changed;
}

export function clearRoom(room) {
  const log = load(); delete log[room]; save(log);
}
