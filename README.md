# 🏫 Útěk ze školy – ERAZIM Polná

Společná online úniková hra pro žáky. Všichni začínají v **naší třídě**, procházejí školou
a v učebnách plní úkoly z **matematiky, zeměpisu, dějepisu, přírodopisu a programování**.
Za každou učebnu se rozsvítí jedno písmeno loga **ERAZIM** – když svítí všechna, otevře se
východ (modrý rám z loga) a třída může utéct na školní dvůr. 🌳

**Nejde o závod, ale o spolupráci:**
- 🔎 U každého úkolu dostane **každý hráč jinou indicii**. Odpověď najdou jen tak, že se
  sejdou ve stejné učebně a indicie si řeknou. Kdo je v učebně sám, uvidí jen první indicii.
- ⭐ Body se počítají **celé třídě společně**, není tu žádný žebříček.
- 💛 Špatná odpověď nic nestojí – hra jen povzbudí, ať to zkusí znovu.
- 🙋 Tlačítko **Zavolat kamarády** pošle všem zprávu a na mapě rozbliká danou učebnu.
- 💬 Chat jsou jen přednastavené přátelské zprávy (nedá se psát nic jiného).

Každý žák si po přihlášení **nakreslí vlastní obličej**, vybere barvu kůže a barvu těla.
Ovládání: šipky / WASD na počítači, na mobilu a tabletu prstem v levé dolní části obrazovky.

---

## 🚀 Jak hru zveřejnit na GitHubu (jednou, cca 5 minut)

1. Na [github.com](https://github.com) vytvořte nový repozitář (např. `unikova-hra`), nastavte **Public**.
2. Klikněte na **Add file → Upload files** a přetáhněte **celý obsah** této složky
   (`index.html`, složky `js`, `css`, `vendor`, `assets` a soubor `.nojekyll`). Potvrďte **Commit changes**.
3. V repozitáři otevřete **Settings → Pages**. V části *Build and deployment* zvolte
   **Source: Deploy from a branch**, větev **main** a složku **/ (root)**. Uložte.
4. Za minutu-dvě se nahoře objeví adresa, např. `https://vas-ucet.github.io/unikova-hra/`.

## 👩‍🏫 Jak hrát s třídou

Pošlete žákům odkaz **s kódem třídy**, např.:

```
https://vas-ucet.github.io/unikova-hra/?trida=7A-PONDELI
```

Všichni se stejným kódem hrají spolu. **Pro každou hodinu použijte nový kód**
(např. `7A-PONDELI`, `7A-UTERY`) – hra začne od nuly. Průběh se v prohlížeči pamatuje
6 hodin, takže když někomu spadne internet, po návratu se nic neztratí.

Doporučeno do cca 30 hráčů v jedné místnosti. Indicie se rozdělují mezi hráče, kteří
stojí ve stejné učebně – ideální jsou skupinky po 2–4 žácích.

**Vyzkoušení na jednom počítači:** otevřete hru ve více záložkách s `?local=1`
(např. `.../?local=1&trida=TEST`) – záložky se propojí mezi sebou i bez internetu.
Pokud chcete jako učitel projít hru sám a vidět všechny indicie, nastavte v `js/config.js`
`soloAllClues: true`.

## ✏️ Úprava otázek

Všechny otázky jsou v souboru **`js/questions.js`** – dají se upravit přímo na GitHubu
(otevřít soubor → ikonka tužky → *Commit changes*). U každé otázky je:

- `q` – otázka, `clues` – indicie (každý hráč dostane jinou),
- `type: 'choice'` s možnostmi `options` a správnou `answer` (číslo pořadí od 0), nebo
- `type: 'input'` s povolenými odpověďmi `answer: ['...']`,
- `needed` u předmětu = kolik otázek musí třída vyřešit, aby se písmeno rozsvítilo.

Tip: dobrá indicie sama o sobě nestačí – teprve všechny dohromady dávají odpověď.

## 🌐 Když se žáci nemohou propojit

Hra nepotřebuje žádný vlastní server – prohlížeče se propojí přímo mezi sebou (WebRTC)
a ke „seznámení“ používají veřejné servery. Některé školní sítě to blokují.
Pokud se po načtení stále ukazuje „🟡 Čekám…“ i když jsou ostatní přihlášení se stejným kódem:

1. Vyzkoušejte, zda funguje na mobilních datech – pokud ano, blokuje to školní síť.
2. Spolehlivější varianta: založte si zdarma **Firebase Realtime Database**
   ([console.firebase.google.com](https://console.firebase.google.com) → nový projekt →
   *Build → Realtime Database → Create database* → v *Rules* nastavte `.read` a `.write` na `true`).
   Adresu databáze (např. `https://moje-skola-default-rtdb.europe-west1.firebasedatabase.app`)
   vložte do `js/config.js` do položky `firebaseUrl`.
3. U velmi přísných sítí může pomoci TURN server (`turnConfig` v `js/config.js`) – poraďte se se správcem sítě.

## 📁 Struktura

```
index.html          hlavní stránka
css/style.css       vzhled
js/questions.js     ← OTÁZKY A INDICIE (upravujte)
js/config.js        ← nastavení
js/main.js          herní logika
js/world.js         3D budova školy
js/avatar.js        postavičky
js/editor.js        kreslení obličeje
js/net.js           propojení hráčů
vendor/             knihovny three.js a Trystero (MIT licence)
assets/             logo školy
```
