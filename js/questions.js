// ============================================================
//  OTÁZKY PRO HRU – tento soubor můžete libovolně upravovat.
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
      { id: 'm1', type: 'input', q: 'Kolik zaplatíme celkem (v Kč)?',
        clues: ['Sešit stojí 15 Kč.', 'Pero stojí dvakrát tolik co sešit.', 'Kupujeme 1 sešit a 2 pera.'],
        answer: ['75', '75kc'] },
      { id: 'm2', type: 'input', q: 'Jaký obsah má zahrada (v m²)?',
        clues: ['Zahrada má tvar obdélníku.', 'Delší strana měří 12 m.', 'Kratší strana je o 4 m kratší než ta delší.'],
        answer: ['96', '96m2', '96m²'], hint: 'Obsah obdélníku = a · b' },
      { id: 'm3', type: 'input', q: 'Jaké je tajné číslo?',
        clues: ['Je to dvojciferné číslo.', 'Součet jeho číslic je 9.', 'Je dělitelné pěti a je větší než 50.'],
        answer: ['90'] },
      { id: 'm4', type: 'input', q: 'V kolik hodin vlak dorazí do cíle?',
        clues: ['Vlak odjíždí v 7:45.', 'Cesta trvá 50 minut.', 'Vlak má zpoždění 10 minut.'],
        answer: ['8:45', '8.45', '08:45', '845'] },
      { id: 'm5', type: 'input', q: 'Kolik dětí je DNES ve třídě?',
        clues: ['Dívek je ve třídě 14.', 'Chlapců je o 3 méně než dívek.', 'Dnes 2 děti chybí, protože jsou nemocné.'],
        answer: ['23'] },
      { id: 'm6', type: 'input', q: 'Které číslo patří místo otazníku?  3,  7,  ?,  15',
        clues: ['Řada roste pořád o stejné číslo.', 'Rozdíl mezi sousedními čísly je 4.', 'Hledané číslo je liché a menší než 15.'],
        answer: ['11'] },
    ],
  },
  {
    id: 'zem', letter: 'R', name: 'Zeměpis', color: '#f2861f', needed: 3,
    questions: [
      { id: 'z1', type: 'choice', q: 'Které město hledáme?',
        clues: ['Leží v Kraji Vysočina.', 'Je to krajské město.', 'Protéká jím řeka, která má stejné jméno jako město.'],
        options: ['Brno', 'Jihlava', 'Třebíč', 'Plzeň'], answer: 1 },
      { id: 'z2', type: 'choice', q: 'Kterou zemi hledáme?',
        clues: ['Sousedí se Švýcarskem.', 'Leží u Středozemního moře.', 'Nesousedí se Španělskem.'],
        options: ['Francie', 'Německo', 'Itálie', 'Španělsko', 'Rakousko'], answer: 2 },
      { id: 'z3', type: 'input', q: 'Jak se jmenuje hora, kterou hledáme?',
        clues: ['Leží v pohoří na severu Čech.', 'Měří 1603 metrů a nikde v Česku není vyšší hora.', 'Její jméno souvisí se sněhem.'],
        answer: ['Sněžka', 'Snezka'] },
      { id: 'z4', type: 'choice', q: 'Kterým směrem půjde turista?',
        clues: ['Turista stojí na náměstí a dívá se přímo k zapadajícímu slunci.', 'Slunce zapadá na západě.', 'Turista se otočí doprava a jde rovně.'],
        options: ['Na sever', 'Na jih', 'Na východ', 'Na západ'], answer: 0 },
      { id: 'z5', type: 'choice', q: 'Kterou řeku hledáme?',
        clues: ['Protéká Krajem Vysočina.', 'Vlévá se do Vltavy.', 'Pramení ve Žďárských vrších.'],
        options: ['Labe', 'Morava', 'Sázava', 'Odra'], answer: 2 },
      { id: 'z6', type: 'input', q: 'Které hlavní město hledáme?',
        clues: ['Je to hlavní město státu, který sousedí s Českem.', 'Protéká jím řeka Dunaj.', 'Není to Bratislava.'],
        answer: ['Vídeň', 'Viden', 'Wien'] },
    ],
  },
  {
    id: 'dej', letter: 'A', name: 'Dějepis', color: '#f5c21b', needed: 3,
    questions: [
      { id: 'd1', type: 'input', q: 'Ve kterém roce vzniklo Československo?',
        clues: ['Česká republika vznikla v roce 1993.', 'Československo vzniklo o 75 let dříve.', 'Stalo se to 28. října, na konci 1. světové války.'],
        answer: ['1918'] },
      { id: 'd2', type: 'choice', q: 'Kdo jsem?',
        clues: ['Žil jsem v 17. století.', 'Musel jsem odejít z vlasti a zemřel jsem v Nizozemsku.', 'Říká se mi „učitel národů“.'],
        options: ['Karel IV.', 'Jan Hus', 'Jan Amos Komenský', 'T. G. Masaryk'], answer: 2 },
      { id: 'd3', type: 'choice', q: 'Kdo jsem?',
        clues: ['Byl jsem český král a také římský císař.', 'Založil jsem v Praze univerzitu.', 'Nechal jsem postavit hrad Karlštejn.'],
        options: ['Přemysl Otakar II.', 'Karel IV.', 'Jiří z Poděbrad', 'Václav Havel'], answer: 1 },
      { id: 'd4', type: 'input', q: 'Kolik let uplynulo mezi těmito dvěma událostmi?',
        clues: ['Karlova univerzita byla založena v roce 1348.', 'Stavba Karlova mostu začala v roce 1357.', 'Odečti dřívější rok od pozdějšího.'],
        answer: ['9', 'devet', 'devět'] },
      { id: 'd5', type: 'choice', q: 'Ve které zemi se nacházíme?',
        clues: ['Stojí tu starobylé pyramidy.', 'Protéká tu řeka Nil.', 'Země leží u Středozemního moře.'],
        options: ['Mexiko', 'Súdán', 'Egypt', 'Maroko'], answer: 2 },
      { id: 'd6', type: 'choice', q: 'Který vynález hledáme?',
        clues: ['Vznikl v 15. století.', 'Díky němu se knihy mohly vyrábět rychle a ve velkém.', 'Jeho vynálezce Johannes Gutenberg pocházel z Mohuče.'],
        options: ['Parní stroj', 'Knihtisk', 'Telefon', 'Žárovka'], answer: 1 },
    ],
  },
  {
    id: 'pri', letter: 'Z', name: 'Přírodopis', color: '#7cc242', needed: 3,
    questions: [
      { id: 'p1', type: 'choice', q: 'Které zvíře hledáme?',
        clues: ['Umí létat.', 'Je to savec.', 'Je aktivní hlavně v noci.'],
        options: ['Sova', 'Netopýr', 'Veverka', 'Delfín'], answer: 1 },
      { id: 'p2', type: 'input', q: 'Kolik nohou mají všechna zvířata na louce dohromady?',
        clues: ['Na louce je 1 pavouk (pavoukovci mají 8 nohou).', 'Jsou tam 2 brouci (hmyz má 6 nohou).', 'A ještě jedna kočka.'],
        answer: ['24'] },
      { id: 'p3', type: 'choice', q: 'Kterou planetu hledáme?',
        clues: ['Je to kamenná planeta, ne plynná.', 'Je dál od Slunce než Země.', 'Kvůli barvě povrchu se jí říká „rudá planeta“.'],
        options: ['Merkur', 'Venuše', 'Mars', 'Jupiter'], answer: 2 },
      { id: 'p4', type: 'choice', q: 'Který strom hledáme?',
        clues: ['Je to jehličnan.', 'Na zimu shazuje jehličí.', 'Roste i v lesích na Vysočině.'],
        options: ['Smrk', 'Borovice', 'Modřín', 'Buk'], answer: 2 },
      { id: 'p5', type: 'choice', q: 'Který plyn hledáme?',
        clues: ['Rostliny mě vyrábějí při fotosyntéze.', 'Ve vzduchu mě je asi 21 %.', 'Potřebuješ mě k dýchání.'],
        options: ['Oxid uhličitý', 'Dusík', 'Kyslík', 'Helium'], answer: 2 },
      { id: 'p6', type: 'choice', q: 'Které zvíře hledáme?',
        clues: ['Jako mládě žije ve vodě a dýchá žábrami.', 'Dospělé žije ve vodě i na souši.', 'Je to obojživelník.'],
        options: ['Kapr', 'Žába', 'Ještěrka', 'Čáp'], answer: 1 },
    ],
  },
  {
    id: 'pro', letter: 'M', name: 'Programování', color: '#8e3fa8', needed: 3,
    questions: [
      { id: 'c1', type: 'input', q: 'Co vypíše program? Každý z vás má jeden jeho řádek.',
        clues: ['1. řádek:  a = 4', '2. řádek:  b = a * 3', '3. řádek:  print(a + b)'],
        answer: ['16'] },
      { id: 'c2', type: 'input', q: 'Kolikrát program vypíše „Ahoj“?',
        clues: ['Vnější cyklus:  for i in range(3):', 'Uvnitř je další cyklus:  for j in range(2):', 'Ve vnitřním cyklu je:  print("Ahoj")'],
        answer: ['6', 'sest', 'šest'] },
      { id: 'c3', type: 'choice', q: 'Kde robot skončí?',
        clues: ['Robot stojí na startu a dívá se na sever (nahoru).', 'Udělá 2 kroky dopředu a pak se otočí VPRAVO.', 'Potom udělá 3 kroky dopředu.'],
        options: ['2 pole nahoru a 3 doprava', '3 pole nahoru a 2 doprava', '2 pole nahoru a 3 doleva', '2 pole dolů a 3 doprava'], answer: 0 },
      { id: 'c4', type: 'input', q: 'Jaké heslo otevře trezor?',
        clues: ['Heslo má 3 znaky.', '1. znak je číslo: počet písmen ve slově ŠKOLA.', 'Další dva znaky jsou písmena „AB“ pozpátku.'],
        answer: ['5BA'] },
      { id: 'c5', type: 'input', q: 'Jak se zapíše hledané číslo ve dvojkové soustavě?',
        clues: ['Hledáme číslo 6.', 'Dvojková soustava používá jen číslice 0 a 1.', 'Pozice zprava mají hodnotu 1, 2, 4, 8 …'],
        answer: ['110'] },
      { id: 'c6', type: 'choice', q: 'Co program vypíše?',
        code: 'if teplota > 20 and prsi == False:\n    print("Jdeme ven")\nelse:\n    print("Zůstaneme uvnitř")',
        clues: ['Na začátku programu:  teplota = 25', 'Na začátku programu:  prsi = True', 'Podmínka s „and“ platí, jen když platí obě její části.'],
        options: ['Jdeme ven', 'Zůstaneme uvnitř', 'Nic', 'Chybu'], answer: 1 },
    ],
  },
];
