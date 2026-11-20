// ============================================================
//  NASTAVENÍ HRY
// ============================================================

export const CONFIG = {
  // Výchozí kód třídy (hráči se stejným kódem hrají spolu).
  defaultRoom: 'TRIDA',

  // Jedinečný název aplikace – nemusíte měnit.
  appId: 'erazim-polna-unikova-hra',

  // Spolupráce: indicie se rozdělí mezi hráče ve stejné učebně.
  // true = hráč, který je v učebně sám, uvidí všechny indicie (hodí se pro vyzkoušení učitelem).
  soloAllClues: false,

  // Volitelné: pokud se hráči ve škole nemohou propojit (přísný firewall),
  // založte si zdarma Firebase Realtime Database (viz README) a vložte sem její adresu,
  // např. 'https://moje-skola-default-rtdb.europe-west1.firebasedatabase.app'
  firebaseUrl: '',

  // Volitelné: vlastní Nostr relay servery (wss://...). Prázdné = výchozí veřejné servery.
  relayUrls: [],

  // Volitelné: vlastní TURN server pro přísné sítě (viz README). Většinou není potřeba.
  turnConfig: [],
};
