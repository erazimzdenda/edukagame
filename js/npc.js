// ============================================================
//  POSTAVIČKY (side questy) – v každé učebně jedna.
//  Texty můžete libovolně upravovat:
//    facts    – zajímavosti, které postavička řekne (náhodně)
//    riddles  – bonusové hádanky (+5 bodů pro celou třídu, každá jen jednou)
//    mission  – úkol: donést předmět jiné postavičce (+5 bodů pro třídu)
// ============================================================
import * as THREE from '../vendor/three.module.min.js';
import { Avatar } from './avatar.js';

export const NPCS = [
  {
    id: 'pro', room: 'pro', name: 'Robot Bajt', emoji: '🤖', color: '#9ca3af', skin: '#c9ced8', face: 'robot',
    hello: 'Píp píp! Jsem Bajt. Zrovna ladím program. Co pro tebe můžu udělat?',
    facts: [
      'Slovo „robot“ vymyslel Josef Čapek. Poprvé ho použil jeho bratr Karel ve hře R.U.R. v roce 1920.',
      'Alan Turing za 2. světové války pomáhal prolomit německou šifru Enigma.',
      'Colossus z roku 1944 byl jeden z prvních elektronických počítačů – luštil německé šifry.',
      'V roce 1947 našli v jednom počítači skutečnou můru. Od té doby se chybám v programu říká „bug“ (brouk).',
      'Morseovka používá jen dvě značky – tečku a čárku. Počítače zase jen 0 a 1.',
    ],
    riddles: [
      { q: 'Kolik je 1 + 1 ve dvojkové soustavě?', options: ['2', '10', '11', '1'], answer: 1 },
      { q: 'Který signál v Morseovce znamená volání o pomoc?', options: ['SOS', 'OK', 'HI', 'GO'], answer: 0 },
    ],
    mission: { to: 'dej', item: 'zašifrovanou zprávu 📜', ask: 'Rozluštil jsem tajnou zprávu! Doneseš ji Kronikáři Vojtěchovi do učebny Dějepisu?' },
    path: [[15.5, 4.4, 'Píšu kód na tabuli ✏️'], [18, 6.5], [25.4, 6.5], [25.4, 8.9, 'Kontroluji server ⚙️'], [25.4, 6.5], [18, 6.5], [14.2, 9.9, 'Testuji program 💻'], [16, 6.5]],
  },
  {
    id: 'mat', room: 'mat', name: 'Profesor Pí', emoji: '🧮', color: '#4b4f58', skin: '#f6d7b8', face: 'glasses', hat: 'grad',
    hello: 'Dobrý den, mladý matematiku! Počítám, kolik je ve třídě židlí. Chceš si se mnou popovídat?',
    facts: [
      'Polští matematici Rejewski, Różycki a Zygalski prolomili Enigmu už před válkou a své znalosti předali Britům.',
      'Za války se počítalo hlavně ručně. Lidem, kteří počítali, se tehdy říkalo „počítači“.',
      'Součet všech čísel od 1 do 100 je 5050. Prý to jako malý kluk rychle spočítal Carl Friedrich Gauss.',
      'Prvočísel je nekonečně mnoho – dokázal to už Eukleidés před více než 2000 lety.',
      'Číslo π je přibližně 3,14 a jeho desetinná místa nikdy nekončí.',
    ],
    riddles: [
      { q: 'Kolik je 12 · 12?', options: ['124', '144', '142', '132'], answer: 1 },
      { q: 'Kolik stran má šestiúhelník?', options: ['5', '6', '7', '8'], answer: 1 },
    ],
    mission: { to: 'home', item: 'výpočet pro školníka 🧮', ask: 'Školník Josef potřebuje spočítat, kolik barvy koupit na chodbu. Doneseš mu můj výpočet do Naší třídy?' },
    roomPath: 'top', acts: ['Píšu rovnici na tabuli ✏️', 'Hledám knihu o zlomcích 📖', 'Měřím jehlan 📐'],
  },
  {
    id: 'zem', room: 'zem', name: 'Cestovatelka Marta', emoji: '🧭', color: '#7a8b4a', skin: '#e9b98f', face: 'smile', hat: 'safari',
    hello: 'Ahoj! Právě jsem se vrátila z cest kolem světa. Chceš slyšet, co jsem zjistila?',
    facts: [
      'Polná leží v Kraji Vysočina, nedaleko Jihlavy.',
      'Česko sousedí se čtyřmi státy: Německem, Polskem, Rakouskem a Slovenskem.',
      'Za 2. světové války dostávali piloti mapy vytištěné na hedvábí – nepromokly a daly se schovat do oblečení.',
      'Nejvyšší hora světa Mount Everest měří 8849 metrů.',
      'Rovník je dlouhý asi 40 000 kilometrů.',
    ],
    riddles: [
      { q: 'Na kterém světadílu leží Egypt?', options: ['Asie', 'Afrika', 'Evropa', 'Amerika'], answer: 1 },
      { q: 'Které město je hlavní město Kraje Vysočina?', options: ['Jihlava', 'Polná', 'Třebíč', 'Brno'], answer: 0 },
    ],
    mission: { to: 'pri', item: 'semínka z cest 🌰', ask: 'Přivezla jsem vzácná semínka. Doneseš je Bioložce Kláře do Přírodopisu? Ona ví, jak je zasadit.' },
    roomPath: 'top', acts: ['Kreslím mapu 🗺️', 'Čtu cestopis 📖', 'Točím glóbusem 🌍'],
  },
  {
    id: 'dej', room: 'dej', name: 'Kronikář Vojtěch', emoji: '📜', color: '#8a5a36', skin: '#f6d7b8', face: 'beard', hat: 'beret',
    hello: 'Vítej! Zapisuji do kroniky všechno, co se ve škole stane. Chceš slyšet něco z historie?',
    facts: [
      'Československo vzniklo 28. října 1918 – proto je ten den státní svátek.',
      'Nicholas Winton zachránil 669 dětí. Mnohé z nich se o něm dozvěděly až v roce 1988 v televizním pořadu.',
      '8. května slavíme Den vítězství – konec 2. světové války v Evropě.',
      'Lidice byly po válce postaveny znovu, kousek od původního místa. Dnes je tam památník a růžový sad.',
      'Karel Čapek varoval před válkou a diktaturou ve hře Bílá nemoc z roku 1937.',
    ],
    riddles: [
      { q: 'Kdo byl prvním prezidentem Československa?', options: ['Edvard Beneš', 'T. G. Masaryk', 'Václav Havel', 'Emil Hácha'], answer: 1 },
      { q: 'Kdy slavíme Den vítězství?', options: ['28. října', '8. května', '17. listopadu', '1. září'], answer: 1 },
    ],
    mission: { to: 'zem', item: 'starou mapu 🗺️', ask: 'V kronice jsem našel starou mapu Polné. Doneseš ji Cestovatelce Martě do Zeměpisu?' },
    roomPath: 'top', acts: ['Zapisuji do kroniky ✍️', 'Prohlížím vitrínu 🏺', 'Zkoumám model hradu 🏰'],
  },
  {
    id: 'pri', room: 'pri', name: 'Bioložka Klára', emoji: '🔬', color: '#f4f1ea', skin: '#c98e60', face: 'glasses',
    hello: 'Ahoj! Starám se tu o zvířátka a dělám pokusy. Pomůžeš mi?',
    facts: [
      'Holub Cher Ami za 1. světové války donesl zprávu, která zachránila skoro 200 vojáků.',
      'Penicilin objevil Alexander Fleming náhodou – na zapomenuté misce mu vyrostla plíseň.',
      'Želvy žijí na Zemi už přes 200 milionů let.',
      'Za války pomáhali psi hledat raněné a nosili zprávy.',
      'Křeček si dokáže nacpat do lícních torb jídlo až do poloviny velikosti svého těla.',
    ],
    riddles: [
      { q: 'Kolik nohou má pavouk?', options: ['6', '8', '10', '4'], answer: 1 },
      { q: 'Které zvíře je obojživelník?', options: ['Mlok', 'Had', 'Ještěrka', 'Želva'], answer: 0 },
    ],
    mission: { to: 'mat', item: 'výsledky pokusu 📊', ask: 'Změřila jsem, jak rychle rostou fazole. Doneseš výsledky Profesorovi Pí do Matematiky, ať je spočítá?' },
    path: [[-13, 5.4, 'Krmím rybičky 🐟'], [-10.8, 5.5, 'Hraju si s křečkem 🐹'], [-18, 5.4], [-20.5, 10.3], [-22.5, 12.0, 'Kontroluji želvu 🐢'], [-20.5, 10.3], [-18, 5.4]],
  },
  {
    id: 'home', room: 'home', name: 'Školník Josef', emoji: '🧹', color: '#2f73c4', skin: '#e9b98f', face: 'mustache', hat: 'cap',
    hello: 'Nazdar! Já tu udržuju pořádek. Ale na kus řeči si čas vždycky najdu.',
    facts: [
      'Jan Amos Komenský chtěl, aby škola byla „dílnou lidskosti“ a učení aby bylo jako hra.',
      'Za války se v mnoha školách neučilo – budovy sloužily jako nemocnice nebo kasárna.',
      'V Polné stojí zámek a velký kostel Nanebevzetí Panny Marie.',
      'Den učitelů slavíme 28. března – v den narozenin Komenského.',
      'Sám víš málo, ale společně víme hodně. Spolupráce je superschopnost!',
    ],
    riddles: [
      { q: 'Kolik písmen má název naší školy ERAZIM?', options: ['5', '6', '7', '8'], answer: 1 },
      { q: 'Čím se nejlépe uklízí podlaha ve třídě?', options: ['Smetákem', 'Pravítkem', 'Kružítkem', 'Houbou na tabuli'], answer: 0 },
    ],
    mission: { to: 'pro', item: 'ztracený šroubek 🔩', ask: 'Při zametání jsem našel šroubek. Asi patří Robotovi Bajtovi – doneseš mu ho do Programování?' },
    path: [[2.5, 4.4, 'Zametám 🧹'], [2.5, 12.9, 'Zametám 🧹'], [7.3, 12.9], [7.4, 8, 'Rovnám knihy 📚'], [7.3, 4.4]],
  },
];

// trasa pro horní učebny (tabule vzadu, stanoviště uprostřed)
function topPath(r, acts) {
  const cx = (r.x0 + r.x1) / 2, z0 = r.z0;
  return [[cx - 4, z0 + 1.4, acts[0]], [cx - 4, z0 + 5.6], [cx + 6.3, z0 + 5.6, acts[1]], [cx - 6.3, z0 + 5.6, acts[2]], [cx - 4, z0 + 5.6]];
}

function drawFace(kind, skin) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const c = cv.getContext('2d');
  c.fillStyle = kind === 'robot' ? '#1f2a44' : skin; c.fillRect(0, 0, 128, 128);
  if (kind === 'robot') {
    c.fillStyle = '#58e08f';
    c.fillRect(28, 40, 22, 22); c.fillRect(78, 40, 22, 22);
    c.fillRect(36, 84, 56, 8); c.fillRect(30, 78, 8, 8); c.fillRect(90, 78, 8, 8);
    return cv;
  }
  c.fillStyle = '#1f2a44';
  c.beginPath(); c.arc(42, 52, 7, 0, 7); c.fill(); c.beginPath(); c.arc(86, 52, 7, 0, 7); c.fill();
  c.strokeStyle = '#1f2a44'; c.lineWidth = 5; c.lineCap = 'round';
  c.beginPath(); c.arc(64, 72, 22, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
  if (kind === 'glasses') {
    c.lineWidth = 4; c.beginPath(); c.arc(42, 52, 15, 0, 7); c.stroke(); c.beginPath(); c.arc(86, 52, 15, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(57, 52); c.lineTo(71, 52); c.stroke();
  }
  if (kind === 'mustache') { c.fillStyle = '#5b3a22'; c.beginPath(); c.ellipse(52, 76, 14, 6, 0.2, 0, 7); c.fill(); c.beginPath(); c.ellipse(76, 76, 14, 6, -0.2, 0, 7); c.fill(); }
  if (kind === 'beard') { c.fillStyle = '#8a8f99'; c.beginPath(); c.moveTo(24, 80); c.quadraticCurveTo(64, 140, 104, 80); c.lineTo(104, 100); c.quadraticCurveTo(64, 150, 24, 100); c.fill(); c.fillRect(24, 76, 80, 10); }
  c.fillStyle = 'rgba(236,95,156,0.35)'; c.beginPath(); c.arc(30, 70, 8, 0, 7); c.fill(); c.beginPath(); c.arc(98, 70, 8, 0, 7); c.fill();
  return cv;
}

function addHat(av, kind) {
  const lam = (c) => new THREE.MeshLambertMaterial({ color: c });
  const add = (geo, color, y, x = 0, z = 0) => { const m = new THREE.Mesh(geo, lam(color)); m.position.set(x, y, z); av.head.add(m); return m; };
  if (kind === 'grad') { add(new THREE.BoxGeometry(0.7, 0.12, 0.7), '#1f2a44', 0.38); add(new THREE.BoxGeometry(0.95, 0.04, 0.95), '#1f2a44', 0.46); add(new THREE.BoxGeometry(0.04, 0.3, 0.04), '#f5c21b', 0.32, 0.45, 0.2); }
  if (kind === 'safari') { add(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 16), '#c9b48a', 0.34); add(new THREE.CylinderGeometry(0.32, 0.36, 0.25, 16), '#c9b48a', 0.46); add(new THREE.CylinderGeometry(0.365, 0.365, 0.06, 16), '#8a5a36', 0.38); }
  if (kind === 'beret') { const m = add(new THREE.CylinderGeometry(0.42, 0.38, 0.12, 16), '#8e3fa8', 0.38); m.rotation.z = 0.15; }
  if (kind === 'cap') { add(new THREE.BoxGeometry(0.7, 0.16, 0.7), '#2f73c4', 0.4); add(new THREE.BoxGeometry(0.5, 0.04, 0.3), '#2f73c4', 0.33, 0, 0.45); }
}

export function buildNPCs(scene, rooms) {
  const list = [];
  for (const def of NPCS) {
    const r = rooms.find((x) => x.key === def.room);
    const path = def.path || topPath(r, def.acts);
    const av = new Avatar({ name: `${def.emoji} ${def.name}`, color: def.color, skin: def.skin });
    av.setFace(drawFace(def.face, def.skin));
    if (def.hat) addHat(av, def.hat);
    if (def.face === 'robot') {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), new THREE.MeshLambertMaterial({ color: '#6b7280' }));
      ant.position.y = 0.45; av.head.add(ant);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#e8392b' }));
      bulb.position.y = 0.63; av.head.add(bulb); def._bulb = bulb;
      av.legMat.color.set('#6b7280');
    }
    if (def.id === 'home') { // smeták
      const broom = new THREE.Group();
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), new THREE.MeshLambertMaterial({ color: '#a8693a' }));
      stick.position.y = -0.4; broom.add(stick);
      const brush = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.15), new THREE.MeshLambertMaterial({ color: '#f5c21b' }));
      brush.position.y = -1.15; broom.add(brush);
      broom.position.set(0, -0.5, 0.25); broom.rotation.x = 0.35; av.armR.add(broom);
    }
    scene.add(av.group);
    // časový plán trasy (stejný pro všechny hráče – řídí se hodinami)
    const SPEED = 1.3, WORK = 6;
    const segs = []; let total = 0;
    for (let i = 0; i < path.length; i++) {
      const a = path[i], b = path[(i + 1) % path.length];
      if (a[2]) { segs.push({ t0: total, t1: total + WORK, a, b: a, work: a[2] }); total += WORK; }
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segs.push({ t0: total, t1: total + d / SPEED, a, b }); total += d / SPEED;
    }
    const offset = list.length * 7.3;
    av.group.position.set(path[0][0], 0, path[0][1]);
    list.push({ def, av, segs, total, offset, lastWork: null, frozen: false });
  }

  const tmpTarget = { x: 0, z: 0 };
  function scheduled(n) {
    const tt = (Date.now() / 1000 + n.offset) % n.total;
    const s = n.segs.find((x) => tt >= x.t0 && tt < x.t1) || n.segs[0];
    const k = (tt - s.t0) / Math.max(0.001, s.t1 - s.t0);
    tmpTarget.x = s.a[0] + (s.b[0] - s.a[0]) * k; tmpTarget.z = s.a[1] + (s.b[1] - s.a[1]) * k;
    return s;
  }

  function update(t, dt, px, pz, talkingId) {
    for (const n of list) {
      const g = n.av.group;
      const dPlayer = Math.hypot(g.position.x - px, g.position.z - pz);
      n.frozen = dPlayer < 2.2 || talkingId === n.def.id;
      const s = scheduled(n);
      let moving = false;
      if (n.frozen) {
        // zastaví se a otočí k hráči
        const want = Math.atan2(px - g.position.x, pz - g.position.z);
        let d = want - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * Math.min(1, dt * 6);
      } else {
        const dx = tmpTarget.x - g.position.x, dz = tmpTarget.z - g.position.z, d = Math.hypot(dx, dz);
        if (d > 0.02) {
          const step = Math.min(d, Math.max(1.3, d * 2) * dt);
          g.position.x += (dx / d) * step; g.position.z += (dz / d) * step;
          moving = d > 0.05;
          const want = Math.atan2(dx, dz);
          let a = want - g.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); g.rotation.y += a * Math.min(1, dt * 8);
        }
        if (s.work && n.lastWork !== s) { n.lastWork = s; n.av.say(s.work); }
      }
      n.av.animate(dt, moving);
      if (s.work && !n.frozen && !moving) { // pracuje – „dělá pokus“
        n.av.armR.rotation.x = -1.1 + Math.sin(t * 6) * 0.35;
        n.av.armL.rotation.x = -0.6 + Math.sin(t * 6 + 1) * 0.2;
      }
      if (n.def._bulb) n.def._bulb.material.color.set(Math.sin(t * 4) > 0 ? '#e8392b' : '#5a1a14');
    }
  }

  function nearest(px, pz, maxD = 2.3) {
    let best = null, bd = maxD;
    for (const n of list) { const d = Math.hypot(n.av.group.position.x - px, n.av.group.position.z - pz); if (d < bd) { bd = d; best = n; } }
    return best ? { npc: best, d: bd } : null;
  }
  return { list, update, nearest, byId: (id) => list.find((n) => n.def.id === id) };
}
