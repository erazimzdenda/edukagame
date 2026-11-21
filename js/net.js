// Síťová vrstva: hráči se propojují přímo mezi sebou (WebRTC přes Trystero),
// takže hra nepotřebuje vlastní server a běží i z GitHub Pages.
// Režim ?local=1 propojí jen okna stejného prohlížeče (pro vyzkoušení).
import { CONFIG } from './config.js';

const ACTIONS = ['hello', 'pos', 'state', 'msg', 'help', 'log'];

export async function connect(roomCode, { local = false } = {}) {
  const handlers = {};
  const emit = (type, data, peerId) => (handlers[type] || []).forEach((h) => h(data, peerId));
  const api = {
    selfId: null,
    mode: local ? 'local' : CONFIG.firebaseUrl ? 'firebase' : 'nostr',
    on(type, h) { (handlers[type] ||= []).push(h); },
    send() {},
    leave() {},
  };

  if (local) {
    const id = Math.random().toString(36).slice(2, 10);
    api.selfId = id;
    const bc = new BroadcastChannel('erazim-' + roomCode);
    const seen = new Map();
    bc.onmessage = ({ data: m }) => {
      if (m.from === id || (m.to && m.to !== id)) return;
      if (!seen.has(m.from)) { seen.set(m.from, Date.now()); emit('peerJoin', null, m.from); }
      seen.set(m.from, Date.now());
      if (m.type === 'bye') { seen.delete(m.from); emit('peerLeave', null, m.from); return; }
      if (m.type !== 'ping') emit(m.type, m.data, m.from);
    };
    api.send = (type, data, to) => bc.postMessage({ from: id, to: to || null, type, data });
    const ping = setInterval(() => {
      api.send('ping');
      const now = Date.now();
      for (const [p, t] of seen) if (now - t > 6000) { seen.delete(p); emit('peerLeave', null, p); }
    }, 1000);
    api.send('ping');
    api.leave = () => { clearInterval(ping); api.send('bye'); bc.close(); };
    addEventListener('pagehide', api.leave);
    return api;
  }

  const relayParam = new URLSearchParams(location.search).get('relay');
  const relayUrls = relayParam ? [relayParam] : CONFIG.relayUrls || [];
  const lib = CONFIG.firebaseUrl
    ? await import('../vendor/trystero-firebase.js')
    : await import('../vendor/trystero-nostr.js');
  const room = lib.joinRoom(
    {
      appId: CONFIG.firebaseUrl || CONFIG.appId,
      use: [lib.scale({ maxDirectPeers: 12 })],
      ...(CONFIG.turnConfig?.length ? { turnConfig: CONFIG.turnConfig } : {}),
      ...(relayUrls.length && !CONFIG.firebaseUrl ? { relayConfig: { urls: relayUrls } } : {}),
    },
    'erazim-' + roomCode,
  );
  const acts = {};
  for (const a of ACTIONS) {
    acts[a] = room.makeAction(a);
    acts[a].onMessage((data, ctx) => emit(a, data, ctx.peerId));
  }
  room.onPeerJoin(({ peerId }) => emit('peerJoin', null, peerId));
  room.onPeerLeave(({ peerId }) => emit('peerLeave', null, peerId));
  room.onError?.((e) => console.warn('[síť]', e.code, e.message));
  try { api.selfId = (await room.getSelf()).peerId; } catch { api.selfId = 'me'; }
  api.send = (type, data, to) => {
    acts[type]?.send(data, to ? { target: to } : undefined).catch(() => {});
  };
  api.leave = () => room.leave();
  addEventListener('pagehide', () => room.leave());
  return api;
}
