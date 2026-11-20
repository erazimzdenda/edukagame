// ============================================================
//  OTÁZKY PRO HRU – téma: ČLOVĚK V DOBĚ VÁLEK
//  Tento soubor můžete libovolně upravovat.
// ============================================================
//
//  PRINCIP SPOLUPRÁCE: každá otázka má několik INDICIÍ (clues).
//  Indicie se rozdělí mezi hráče, kteří stojí ve stejné učebně –
//  každý vidí jen svoji. Správnou odpověď najdou jen společně!
//  (Když je hráč v učebně sám, vidí jen první indicii a hra ho vyzve,
//   ať zavolá kamarády.)
//
//  Každá učebna (předmět) má:
//    letter  – písmeno z loga ERAZIM, které se po splnění rozsvítí
//    name    – název předmětu (zobrazí se nad dveřmi)
//    color   – barva učebny
//    needed  – kolik otázek musí třída SPOLEČNĚ vyřešit, aby se písmeno rozsvítilo
//    questions – seznam otázek (může jich být víc, než je "needed")
//
//  Typy otázek:
//    { id: 'x1', type: 'choice', q: 'Otázka', clues: ['indicie 1', 'indicie 2', 'indicie 3'],
//      options: ['A', 'B', 'C', 'D'], answer: 0 }
//        → výběr z možností, answer = pořadí správné možnosti (počítáno od 0)
//    { id: 'x2', type: 'input', q: 'Otázka', clues: [...], answer: ['42'] }
//        → hráči odpověď napíší; answer = seznam všech přijatelných odpovědí
//          (velká/malá písmena, mezery a háčky/čárky se při porovnání ignorují)
//
//  TIP: Dobrá indicie sama o sobě nestačí – teprve dohromady dávají odpověď.
//  Volitelně:  hint: 'Nápověda'   code: 'ukázka kódu'
//
//  ⚠️ Každá otázka musí mít jedinečné "id".
//     Když otázky změníte, použijte pro hru nový kód třídy.
// ============================================================

export const SUBJECTS = [
  {
    id: 'mat', letter: 'E', name: 'Matematika', color: '#e8392b', needed: 3,
    questions: [
      { id: 'vm1', type: 'input', q: 'Na kolik dní vystačí rodině zásoba mouky?',
        clues: ['Za války se potraviny dostávaly jen na přídělové lístky.', 'Rodina dostala na lístky 6 kg mouky.', 'Každý den spotřebuje 400 g mouky.'],
        answer: ['15'], hint: '6 kg = 6000 g' },
      { id: 'vm2', type: 'input', q: 'Kolik let bylo Janovi, když v Evropě skončila 2. světová válka?',
        clues: ['Jan se narodil v roce 1926.', 'Válka v Evropě skončila 8. května 1945.', 'Jan má narozeniny až v prosinci.'],
        answer: ['18'], hint: 'Pozor – v květnu ještě neměl narozeniny.' },
      { id: 'vm3', type: 'input', q: 'Kolik minut šel kurýr se zprávou?',
        clues: ['Kurýr musel donést tajnou zprávu do vesnice vzdálené 12 km.', 'Šel rychlostí 4 km za hodinu.', 'Výsledek uveď v minutách.'],
        answer: ['180'] },
      { id: 'vm4', type: 'input', q: 'Kolik celých let trvala 2. světová válka v Evropě?',
        clues: ['Začala 1. září 1939.', 'V Evropě skončila 8. května 1945.', 'Počítej jen celé uplynulé roky.'],
        answer: ['5', 'pet', 'pět'] },
      { id: 'vm5', type: 'input', q: 'Kolikáté výročí konce války si lidé připomínali?',
        clues: ['Druhá světová válka v Evropě skončila v roce 1945.', 'Velké oslavy výročí proběhly v roce 2025.', 'Odečti rok konce války od roku oslav.'],
        answer: ['80', '80.'] },
      { id: 'vm6', type: 'input', q: 'Kolik let trvala 1. světová válka?',
        clues: ['Začala v létě roku 1914.', 'Skončila na podzim roku 1918.', 'Počítej celé roky (odečti roky od sebe).'],
        answer: ['4', 'ctyri', 'čtyři'] },
    ],
  },
  {
    id: 'zem', letter: 'R', name: 'Zeměpis', color: '#f2861f', needed: 3,
    questions: [
      { id: 'vz1', type: 'choice', q: 'Kterou zemi hledáme?',
        clues: ['Sousedí s Českou republikou.', 'Má přístup k moři.', 'Útokem na tuto zemi 1. září 1939 začala 2. světová válka.'],
        options: ['Německo', 'Polsko', 'Rakousko', 'Slovensko'], answer: 1 },
      { id: 'vz2', type: 'choice', q: 'Kterou obec hledáme?',
        clues: ['Leží nedaleko Kladna.', 'V červnu 1942 ji nacisté vypálili a srovnali se zemí.', 'Byla to pomsta za atentát na Reinharda Heydricha.'],
        options: ['Ležáky', 'Lidice', 'Terezín', 'Lety'], answer: 1 },
      { id: 'vz3', type: 'choice', q: 'Které město hledáme?',
        clues: ['Leží v severních Čechách u řeky Ohře.', 'Původně to byla pevnost pojmenovaná po císařovně Marii Terezii.', 'Za 2. světové války tu bylo židovské ghetto.'],
        options: ['Litoměřice', 'Terezín', 'Osvětim', 'Ústí nad Labem'], answer: 1 },
      { id: 'vz4', type: 'choice', q: 'Kde se 6. června 1944 vylodila spojenecká vojska?',
        clues: ['Operace se jmenovala Overlord.', 'Vojáci připluli z Velké Británie přes průliv La Manche.', 'Místo leží na severu Francie.'],
        options: ['Na Sicílii', 'V Normandii', 'V Norsku', 'V Řecku'], answer: 1 },
      { id: 'vz5', type: 'choice', q: 'Které město hledáme?',
        clues: ['Leží v Japonsku.', '6. srpna 1945 na něj byla svržena atomová bomba.', 'Není to Nagasaki – to bylo zasaženo o tři dny později.'],
        options: ['Tokio', 'Kjóto', 'Nagasaki', 'Hirošima'], answer: 3 },
      { id: 'vz6', type: 'choice', q: 'Které město hledáme?',
        clues: ['Leží v západních Čechách.', 'V květnu 1945 ho osvobodila americká armáda generála Pattona.', 'Je známé pivovarem a závody Škoda.'],
        options: ['Brno', 'Plzeň', 'Ostrava', 'Praha'], answer: 1 },
    ],
  },
  {
    id: 'dej', letter: 'A', name: 'Dějepis', color: '#f5c21b', needed: 3,
    questions: [
      { id: 'vd1', type: 'input', q: 'Ve kterém roce začala 1. světová válka?',
        clues: ['Válku rozpoutal atentát v Sarajevu.', 'Zavražděn byl následník rakouského trůnu František Ferdinand d’Este.', 'Stalo se to 28. června, čtyři roky před koncem války v roce 1918.'],
        answer: ['1914'] },
      { id: 'vd2', type: 'choice', q: 'Jak se jmenovala tato akce?',
        clues: ['Parašutisté byli vysláni z Velké Británie.', 'Jmenovali se Jan Kubiš a Jozef Gabčík.', 'V roce 1942 provedli v Praze atentát na Reinharda Heydricha.'],
        options: ['Overlord', 'Anthropoid', 'Barbarossa', 'Mnichov'], answer: 1 },
      { id: 'vd3', type: 'choice', q: 'Ve kterém roce vznikl Protektorát Čechy a Morava?',
        clues: ['Bylo to rok po podepsání Mnichovské dohody (1938).', 'Německá vojska vstoupila do Prahy 15. března.', 'Ve stejném roce na podzim začala 2. světová válka.'],
        options: ['1938', '1939', '1940', '1945'], answer: 1 },
      { id: 'vd4', type: 'choice', q: 'Kdo jsem?',
        clues: ['Byl jsem prezidentem Československa.', 'Za 2. světové války jsem vedl exilovou vládu v Londýně.', 'Nebyl jsem první prezident – tím byl T. G. Masaryk.'],
        options: ['T. G. Masaryk', 'Edvard Beneš', 'Emil Hácha', 'Václav Havel'], answer: 1 },
      { id: 'vd5', type: 'choice', q: 'Kdo jsem?',
        clues: ['Byla jsem židovská dívka a dva roky jsem se skrývala v Amsterdamu.', 'V úkrytu jsem si psala deník.', 'Můj deník dnes čtou lidé po celém světě.'],
        options: ['Anna Franková', 'Milena Jesenská', 'Božena Němcová', 'Marie Curie-Skłodowská'], answer: 0 },
      { id: 'vd6', type: 'choice', q: 'Kdo jsem?',
        clues: ['Byl jsem Brit a v roce 1939 jsem organizoval vlaky s dětmi z Prahy do Británie.', 'Zachránil jsem 669 převážně židovských dětí.', 'Svět se o tom dozvěděl až po téměř 50 letech.'],
        options: ['Winston Churchill', 'Nicholas Winton', 'Alan Turing', 'Charlie Chaplin'], answer: 1 },
    ],
  },
  {
    id: 'pri', letter: 'Z', name: 'Přírodopis', color: '#7cc242', needed: 3,
    questions: [
      { id: 'vp1', type: 'choice', q: 'Který lék hledáme?',
        clues: ['Je to první široce používané antibiotikum.', 'Objevil ho Alexander Fleming v roce 1928.', 'Za 2. světové války zachránil mnoho raněných před infekcí.'],
        options: ['Aspirin', 'Penicilin', 'Inzulin', 'Vitamin C'], answer: 1 },
      { id: 'vp2', type: 'choice', q: 'Kterou rostlinu hledáme?',
        clues: ['Za války se z jejího kořene dělala náhražka kávy.', 'Roste u cest a na mezích.', 'Má modré květy.'],
        options: ['Pampeliška', 'Kopřiva', 'Čekanka', 'Mák'], answer: 2 },
      { id: 'vp3', type: 'choice', q: 'Který vitamin lidem za války chyběl?',
        clues: ['Za války bylo málo čerstvého ovoce a zeleniny.', 'Lidem pak hrozila nemoc zvaná kurděje.', 'Hodně ho obsahují citrony a šípky.'],
        options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], answer: 2 },
      { id: 'vp4', type: 'input', q: 'Kolik krevních skupin (systém AB0) známe?',
        clues: ['Raněným vojákům zachraňovaly život krevní transfuze.', 'Český lékař Jan Janský krevní skupiny popsal a očísloval.', 'Dnes je označujeme písmeny A, B, AB a 0.'],
        answer: ['4', 'ctyri', 'čtyři'] },
      { id: 'vp5', type: 'choice', q: 'Které zvíře hledáme?',
        clues: ['Za války nosilo vzkazy přes frontu.', 'Umí se vrátit domů i ze vzdálenosti stovek kilometrů.', 'Je to pták.'],
        options: ['Pes', 'Kůň', 'Holub', 'Sokol'], answer: 2 },
      { id: 'vp6', type: 'choice', q: 'Proč se v noci zatemňovala okna?',
        clues: ['Za války se v noci zhasínala světla a okna se zakrývala.', 'Piloti bombardérů v noci hledali města podle světel.', 'Tma tak chránila lidi i domy.'],
        options: ['Aby se šetřila elektřina', 'Aby nepřátelská letadla neviděla města', 'Aby se lépe spalo', 'Kvůli zimě'], answer: 1 },
    ],
  },
  {
    id: 'pro', letter: 'M', name: 'Programování', color: '#8e3fa8', needed: 3,
    questions: [
      { id: 'vc1', type: 'input', q: 'Rozluštěte tajnou zprávu. Jaké slovo to je?',
        clues: ['Zašifrovaná zpráva zní: NJS', 'Šifra posouvá každé písmeno o stejný počet míst v abecedě.', 'Při šifrování se posunulo o 1 místo dopředu (A→B). Ty jdi o 1 zpět.'],
        answer: ['MIR', 'MÍR'] },
      { id: 'vc2', type: 'input', q: 'Jaké slovo je zapsané Morseovou abecedou?',
        clues: ['Zpráva:   · · ·   – – –   · · ·', 'Tři tečky ( · · · ) = S', 'Tři čárky ( – – – ) = O'],
        answer: ['SOS'] },
      { id: 'vc3', type: 'choice', q: 'Kdo pomohl prolomit německou šifru Enigma?',
        clues: ['Byl to britský matematik.', 'Za války pracoval v tajném středisku Bletchley Park.', 'Dnes je považován za jednoho z otců informatiky.'],
        options: ['Albert Einstein', 'Alan Turing', 'Isaac Newton', 'Bill Gates'], answer: 1 },
      { id: 'vc4', type: 'input', q: 'Co vypíše program? Každý z vás má jeden jeho řádek.',
        clues: ['1. řádek:  deti = 96', '2. řádek:  vagony = deti // 24     (// je dělení bez zbytku)', '3. řádek:  print(vagony)'],
        answer: ['4'] },
      { id: 'vc5', type: 'input', q: 'Jaké číslo je tajný kód?',
        clues: ['Kód je zapsaný ve dvojkové soustavě:  1 0 0 1', 'Pozice zprava mají hodnoty 1, 2, 4, 8.', 'Sečti hodnoty pozic, na kterých je 1.'],
        answer: ['9'] },
      { id: 'vc6', type: 'choice', q: 'Co program vypíše?',
        code: 'if signal == "SOS" and vzdalenost < 10:\n    print("Vyrážíme na pomoc")\nelse:\n    print("Voláme posily")',
        clues: ['Na začátku programu:  signal = "SOS"', 'Na začátku programu:  vzdalenost = 25', 'Podmínka s „and“ platí, jen když platí obě její části.'],
        options: ['Vyrážíme na pomoc', 'Voláme posily', 'Nic', 'Chybu'], answer: 1 },
    ],
  },
];
