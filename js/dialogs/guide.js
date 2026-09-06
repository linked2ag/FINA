/* ══════════════════════════════════════════════════════════════
   FINA — Seitenbereich „Anleitung"
   Die ganze Bedienung, in der Sprache, die in den Einstellungen
   gewählt ist. Der Text steht hier und nicht in js/i18n.js: es
   sind lange Abschnitte, die zusammen gelesen und zusammen
   gepflegt werden.

   Kein Fenster: die Anleitung klappt rechts auf und bleibt offen,
   während man in der Tabelle weiterarbeitet — nachlesen und
   eintragen soll ohne Zumachen gehen. Die Seite wird dafür um die
   Breite des Bereichs schmaler (siehe css/components.css).

   Drei Reiter, weil drei verschiedene Fragen gestellt werden
   (der dritte, „Was ist neu", ist die Versionsliste, siehe unten):

   * „Schritt für Schritt" ist für den, der so etwas noch nie
     geführt hat. Er wird einmal von oben nach unten durchgearbeitet
     und endet mit dem Monatsrhythmus, den man danach wiederholt.
     Jeder Schritt sagt zuerst, was zu tun ist, dann warum, und
     zeigt ein Bild derselben Stelle.
   * „Was FINA kann" ist die Beschreibung für den, der weiß, was
     ein Haushaltsbuch ist, und wissen will, was diese Anwendung
     daraus macht.

   Die Bilder liegen in doc/img und entstehen mit doc/make-shots.py
   aus einer Beispieldatei — sie zeigen also die laufende
   Anwendung. Ändert sich die Oberfläche, wird das Skript neu
   aufgerufen; von Hand nachzeichnen muss niemand etwas. Wo ein
   Knopf gemeint ist, steht sein Name über t(…) da, damit er die
   Sprache mitwechselt.
   ══════════════════════════════════════════════════════════════ */

/* Ein Bild mit Bildunterschrift. Der Klick öffnet es in voller
   Größe in einem neuen Reiter — im schmalen Seitenbereich ist eine
   Jahresmatrix sonst nur ein Muster. */
const gshot=(file,cap)=>`<figure class="gshot">
  <a href="doc/img/${file}.png" target="_blank" rel="noopener"><img src="doc/img/${file}.png" alt="${esc(cap)}"></a>
  <figcaption>${cap}</figcaption></figure>`;

const GUIDE={

/* ── Reiter 1: Schritt für Schritt ─────────────────────────── */
steps:{

en:()=>`
<p class="glead">Never kept a household book? Work through these seven steps once, from top to
bottom. Half an hour, and your book is up and running. Everything else is in
<b>${t('guide.tabProduct')}</b>.</p>

<h4>What you get</h4>
<p>FINA is a household book for one year. You enter what comes in and what goes out, month by
month, and tick off what has been paid. In return FINA answers three questions at any time:</p>
<ul>
  <li><b>What is still due this month?</b></li>
  <li><b>Where does my money go?</b></li>
  <li><b>How will the year end?</b></li>
</ul>
<p>Everything stays in <b>one file on your own computer</b>. No account, no cloud, no server.
FINA writes to that file only when you press <b>${t('app.save')}</b>.</p>

<h4>Before you start: three areas</h4>
<p>Every entry in FINA belongs to one of three areas. The category you pick decides which:</p>
<ul>
  <li><b>${t('g.income')}</b> — money that comes in: salary, refunds, anything positive.</li>
  <li><b>${t('g.fixed')}</b> — bills that repeat and whose amount you know: rent, insurance,
      a subscription. One entry per contract.</li>
  <li><b>${t('g.flex')}</b> — everyday spending that changes every month: groceries, fuel,
      going out. Not every purchase, just a handful of entries with one amount per month.</li>
</ul>
<p>Rule of thumb: a contract is regular. What you spend in a shop is flexible.</p>

<h4>Step 1 — Start a book</h4>
${gshot('welcome','The first screen: open a file, or start from scratch')}
<p>With no file open you see two buttons. <b>${t('wel.open')}</b> takes a FINA file you saved
before. <b>${t('wel.new')}</b> begins an empty book. Top right you choose the language.</p>
<p>Press <b>${t('wel.new')}</b>. FINA opens in <b>${t('view.jahr')}</b>. That is where you
build the book.</p>

<h4>Step 2 — Year, language, opening balance</h4>
${gshot('set-general','Settings, section General')}
<p>Open the menu <b>☰</b> at the top right and press <b>${t('app.settings')}</b>. In
<b>${t('set.navGeneral')}</b> choose your language and the year. One file holds one year.</p>
<p>In <b>${t('set.opening')}</b> type what was in your account before January. Every balance
in FINA counts on from there. Leave it empty and the book starts at zero.</p>

<h4>Step 3 — Your accounts and categories</h4>
${gshot('set-groups','Settings, section Categories')}
<p>Still in the settings. Under <b>${t('set.navBanks')}</b> name your accounts and how you
pay. Each gets a short code. The year table shows the codes.</p>
<p>Under <b>${t('set.groups')}</b> you find three lists: <b>${t('set.groupsIn')}</b>,
<b>${t('set.groupsFlex')}</b> and <b>${t('set.groupsOut')}</b>. Four to six per list are
plenty. Each list already has an entry called <b>N/A</b> for everything without a category.</p>
<p>One rule: <b>a name may appear only once across all three lists</b>. That is how FINA
knows which area an entry belongs to.</p>
<p>Press <b>${t('g.save')}</b> in the window, then <b>${t('app.save')}</b> in the menu. The
window hands the change to FINA; the menu writes the file.</p>

<h4>Step 4 — Enter your income and your bills</h4>
${gshot('item-dialog','The entry window: name, assignment, amounts, ticks')}
<p>Open the menu and press <b>${t('menu.newOut')}</b>. The window is the same for every
entry:</p>
<ol>
  <li><b>The name</b> is the heading. Click it and type, for example “Salary” or “Rent”.</li>
  <li><b>The category</b> decides the area. The list has three groups: income, flexible,
      regular. Without a category the entry is not saved.</li>
  <li><b>Account, payment type, due day</b> — pick them from your lists. A link to each list
      stands right above the fields, in case something is missing.</li>
  <li><b>Twelve boxes</b>, one per month. Income has no sign. <b>An expense gets a minus</b>:
      “-49,90”. The same amount every month? Type it once in <b>${t('item.quick')}</b> and
      press <b>${t('item.apply')}</b>.</li>
  <li><b>A tick under each month</b> means “settled”. It locks the amount. Not sure about a
      number yet? Switch on <b>${t('g.estimated')}</b>. It then shows in yellow with a
      question mark.</li>
</ol>
<p>Press <b>${t('g.save')}</b>. Repeat for every income and every contract.</p>

<h4>Step 5 — Enter your everyday spending</h4>
<p>Same window, same button. Pick a category from the <b>${t('g.flex')}</b> group, for
example “Groceries”. Type what you expect per month and switch on
<b>${t('g.estimated')}</b>.</p>
<p>You cannot know these numbers in advance, and you are not meant to. Correct them once the
month is over. Or let FINA read them from your bank statement: <b>${t('menu.csv')}</b> in the
menu. The import has a guide of its own.</p>

<h4>Step 6 — Your monthly routine</h4>
${gshot('month-out','The regular costs of one month')}
<p>This is the part you repeat. Once a month:</p>
<ol>
  <li>Open <b>${t('view.monat')}</b>. The month bar under the filter row shows all twelve
      months; the current one has a red ring.</li>
  <li>Tick off what has left your account: click the circle in front of the row.</li>
  <li>Correct what turned out different. Double-click the amount, type the real number, tick
      the month, save.</li>
  <li>Press <b>${t('app.save')}</b>.</li>
</ol>
<p><b>Good to know:</b> an estimated amount is never ticked off in passing. Its circle opens
the entry with that month ready to correct. Cancel, and nothing has changed.</p>
<p><b>The circles</b>, in every view: <b>green with a tick</b> is paid, <b>blue with an
arrow</b> came from a CSV import, a <b>question mark</b> means the amount is a guess. A row on
<b>grey</b> has nothing left to pay this year.</p>
<p>Want to find something? Just start typing. The first letter goes into the search field.</p>

<h4>Step 7 — Save, and keep the file safe</h4>
<p>As soon as there is something to save, <b>${t('app.save')}</b> steps out of the menu and
stands next to the ☰ button with a red frame. Chrome and Edge write back into the same file.
Other browsers put a copy in your downloads folder, with date and time in front of the
name.</p>
<p><b>${t('app.backup')}</b> makes such a dated copy on purpose, in every browser. Use it
before anything you are unsure about. It does not count as saving.</p>
<p>The file is plain text and yours alone. Copy it somewhere safe now and then. It is the
only place your numbers exist.</p>

<h4>That is the whole book</h4>
<p>Everything else answers a question you have not asked yet: the year table, the forecast,
the filters, the notes, the CSV import. When you do ask, it is all in
<b>${t('guide.tabProduct')}</b>.</p>
`,

de:()=>`
<p class="glead">Noch nie ein Haushaltsbuch geführt? Geh diese sieben Schritte einmal von oben
nach unten durch. Eine halbe Stunde, und dein Buch läuft. Alles Weitere steht in
<b>${t('guide.tabProduct')}</b>.</p>

<h4>Was du bekommst</h4>
<p>FINA ist ein Haushaltsbuch für ein Jahr. Du trägst ein, was hereinkommt und was hinausgeht,
Monat für Monat, und hakst ab, was bezahlt ist. Dafür beantwortet dir FINA jederzeit drei
Fragen:</p>
<ul>
  <li><b>Was ist diesen Monat noch fällig?</b></li>
  <li><b>Wohin geht mein Geld?</b></li>
  <li><b>Wie geht das Jahr aus?</b></li>
</ul>
<p>Alles bleibt in <b>einer Datei auf deinem eigenen Rechner</b>. Kein Konto, keine Cloud,
kein Server. FINA schreibt in diese Datei nur, wenn du auf <b>${t('app.save')}</b>
klickst.</p>

<h4>Bevor du anfängst: drei Bereiche</h4>
<p>Jeder Eintrag in FINA gehört zu einem von drei Bereichen. Die Kategorie, die du wählst,
entscheidet darüber:</p>
<ul>
  <li><b>${t('g.income')}</b> — Geld, das hereinkommt: Gehalt, Rückzahlungen, alles
      Positive.</li>
  <li><b>${t('g.fixed')}</b> — Rechnungen, die wiederkehren und deren Höhe du kennst: Miete,
      Versicherung, ein Abo. Je Vertrag ein Eintrag.</li>
  <li><b>${t('g.flex')}</b> — die alltäglichen Ausgaben, die jeden Monat anders sind:
      Lebensmittel, Sprit, Ausgehen. Nicht jeder Einkauf, sondern eine Handvoll Einträge mit
      je einem Betrag pro Monat.</li>
</ul>
<p>Faustregel: Ein Vertrag ist regulär. Was du im Laden ausgibst, ist flexibel.</p>

<h4>Schritt 1 — Ein Buch anfangen</h4>
${gshot('welcome','Die erste Seite: Datei öffnen oder neu anfangen')}
<p>Ohne Datei siehst du zwei Knöpfe. <b>${t('wel.open')}</b> nimmt eine FINA-Datei, die du
schon gespeichert hast. <b>${t('wel.new')}</b> fängt ein leeres Buch an. Oben rechts wählst
du die Sprache.</p>
<p>Klick auf <b>${t('wel.new')}</b>. FINA öffnet in <b>${t('view.jahr')}</b>. Dort legst du
das Buch an.</p>

<h4>Schritt 2 — Jahr, Sprache, Anfangsbestand</h4>
${gshot('set-general','Die Einstellungen, Bereich Allgemein')}
<p>Öffne das Menü <b>☰</b> oben rechts und klick auf <b>${t('app.settings')}</b>. Unter
<b>${t('set.navGeneral')}</b> wählst du die Sprache und das Jahr. Eine Datei fasst ein
Jahr.</p>
<p>In <b>${t('set.opening')}</b> trägst du ein, was vor dem Januar auf deinem Konto lag.
Jeder Kontostand in FINA rechnet von da an weiter. Lässt du es leer, fängt das Buch bei null
an.</p>

<h4>Schritt 3 — Deine Konten und Kategorien</h4>
${gshot('set-groups','Die Einstellungen, Bereich Kategorien')}
<p>Weiter in den Einstellungen. Unter <b>${t('set.navBanks')}</b> benennst du deine Konten und
Zahlungswege. Jeder bekommt ein kurzes Kürzel. Die Jahrestabelle zeigt die Kürzel.</p>
<p>Unter <b>${t('set.groups')}</b> findest du drei Listen: <b>${t('set.groupsIn')}</b>,
<b>${t('set.groupsFlex')}</b> und <b>${t('set.groupsOut')}</b>. Vier bis sechs je Liste
genügen. In jeder Liste steht schon ein Eintrag <b>N/A</b> für alles ohne Kategorie.</p>
<p>Eine Regel: <b>Ein Name darf über alle drei Listen nur einmal vorkommen.</b> Daran erkennt
FINA, zu welchem Bereich ein Eintrag gehört.</p>
<p>Klick im Fenster auf <b>${t('g.save')}</b>, danach im Menü auf <b>${t('app.save')}</b>.
Das Fenster gibt die Änderung an FINA weiter; das Menü schreibt die Datei.</p>

<h4>Schritt 4 — Einnahmen und Rechnungen eintragen</h4>
${gshot('item-dialog','Das Fenster eines Eintrags: Name, Zuordnung, Beträge, Haken')}
<p>Öffne das Menü und klick auf <b>${t('menu.newOut')}</b>. Das Fenster ist für jeden Eintrag
dasselbe:</p>
<ol>
  <li><b>Der Name</b> ist die Überschrift. Klick darauf und tipp ihn ein, zum Beispiel
      „Gehalt" oder „Miete".</li>
  <li><b>Die Kategorie</b> entscheidet über den Bereich. Die Liste hat drei Gruppen: Einnahmen,
      Flexibel, Regulär. Ohne Kategorie wird der Eintrag nicht gespeichert.</li>
  <li><b>Konto, Zahlungsart, Zahltag</b> — wähl sie aus deinen Listen. Ein Weg zu jeder Liste
      steht direkt über den Feldern, falls etwas fehlt.</li>
  <li><b>Zwölf Felder</b>, eines je Monat. Einnahmen haben kein Vorzeichen. <b>Eine Ausgabe
      bekommt ein Minus</b>: „-49,90". Jeden Monat derselbe Betrag? Tipp ihn einmal in die
      <b>${t('item.quick')}</b> und klick auf <b>${t('item.apply')}</b>.</li>
  <li><b>Ein Haken unter jedem Monat</b> heißt „erledigt". Er sperrt den Betrag. Bei einer
      Zahl noch unsicher? Schalte <b>${t('g.estimated')}</b> ein. Sie steht dann gelb mit
      Fragezeichen da.</li>
</ol>
<p>Klick auf <b>${t('g.save')}</b>. Das wiederholst du für jede Einnahme und jeden Vertrag.</p>

<h4>Schritt 5 — Alltägliche Ausgaben eintragen</h4>
<p>Dasselbe Fenster, derselbe Knopf. Wähl eine Kategorie aus der Gruppe <b>${t('g.flex')}</b>,
zum Beispiel „Lebensmittel". Trag ein, womit du je Monat rechnest, und schalte
<b>${t('g.estimated')}</b> ein.</p>
<p>Diese Zahlen kannst du nicht vorher wissen, und das sollst du auch nicht. Korrigier sie,
wenn der Monat vorbei ist. Oder lass FINA sie aus deinem Kontoauszug lesen:
<b>${t('menu.csv')}</b> im Menü. Der Import hat eine eigene Anleitung.</p>

<h4>Schritt 6 — Dein Monatsrhythmus</h4>
${gshot('month-out','Die regulären Kosten eines Monats')}
<p>Nur das hier wiederholt sich. Einmal im Monat:</p>
<ol>
  <li>Öffne <b>${t('view.monat')}</b>. Die Monatsleiste unter der Filterzeile zeigt alle zwölf
      Monate; der laufende trägt einen roten Ring.</li>
  <li>Hak ab, was vom Konto gegangen ist: Klick auf den Kreis vor der Zeile.</li>
  <li>Korrigier, was anders ausgefallen ist. Doppelklick auf den Betrag, richtige Zahl tippen,
      Monat abhaken, speichern.</li>
  <li>Klick auf <b>${t('app.save')}</b>.</li>
</ol>
<p><b>Gut zu wissen:</b> Ein geschätzter Betrag wird nie nebenbei abgehakt. Sein Kreis öffnet
den Eintrag mit genau diesem Monat zum Korrigieren. Brichst du ab, hat sich nichts
geändert.</p>
<p><b>Die Kreise</b>, in jeder Ansicht: <b>grün mit Haken</b> ist bezahlt, <b>blau mit
Pfeil</b> kam aus einem CSV-Import, ein <b>Fragezeichen</b> heißt, der Betrag ist geschätzt.
Eine Zeile auf <b>grauem Grund</b> hat für dieses Jahr nichts mehr offen.</p>
<p>Du suchst etwas? Tipp einfach los. Der erste Buchstabe landet im Suchfeld.</p>

<h4>Schritt 7 — Speichern und die Datei sichern</h4>
<p>Sobald es etwas zu speichern gibt, tritt <b>${t('app.save')}</b> aus dem Menü heraus und
steht mit rotem Rahmen neben dem ☰-Knopf. Chrome und Edge schreiben in dieselbe Datei
zurück. Andere Browser legen eine Kopie im Download-Ordner ab, mit Datum und Uhrzeit vor dem
Namen.</p>
<p><b>${t('app.backup')}</b> legt so eine datierte Kopie mit Absicht an, in jedem Browser.
Nimm sie vor allem, was du dir nicht ganz zutraust. Als Speichern zählt sie nicht.</p>
<p>Die Datei ist einfacher Text und gehört dir allein. Kopier sie ab und zu an einen sicheren
Ort. Sie ist der einzige Ort, an dem deine Zahlen stehen.</p>

<h4>Das ist das ganze Buch</h4>
<p>Alles andere beantwortet eine Frage, die du noch nicht gestellt hast: die Jahrestabelle,
die Prognose, die Filter, die Notizen, der CSV-Import. Wenn du sie stellst, steht die Antwort
in <b>${t('guide.tabProduct')}</b>.</p>
`},

/* ── Reiter 2: Was FINA kann ───────────────────────────────── */
product:{

en:()=>`
<h4>What FINA is</h4>
<p>FINA is a household book for one year. You enter what comes in and what goes out, month
by month, and tick off what has been paid. FINA shows you at any time what is still due,
where your money goes and how the year will end.</p>
<p>Everything lives in <b>one file on your own computer</b>. No account, no server. Nothing
is uploaded. FINA writes to the file only when you press <b>${t('app.save')}</b>.</p>
<p><b>Examples of what you can ask FINA:</b></p>
<ul>
  <li>“What do I still have to pay before the end of the month?” — the month view, filtered
      by <b>${t('month.fOpen')}</b>.</li>
  <li>“How much does my car cost per year?” — type “Car” into the search field; every total
      follows.</li>
  <li>“Will I be in the red in November?” — the forecast, column <b>${t('prog.colEnd')}</b>.</li>
  <li>“Which subscription ends soon?” — the year table, column <b>${t('year.end')}</b>.</li>
</ul>

<h4>Three areas, one kind of entry</h4>
<p>Every entry has a name, a category and twelve monthly amounts. The category puts it into
one of three areas:</p>
<ul>
  <li><b>${t('g.income')}</b> — salary, refunds, anything positive.</li>
  <li><b>${t('g.fixed')}</b> — bills that repeat: rent, insurance, subscriptions. One entry per
      contract, with a due day and an end date if it has one.</li>
  <li><b>${t('g.flex')}</b> — everyday spending: groceries, fuel, going out. A handful of
      entries with an estimate per month, replaced by the real number once you know it or
      once a CSV import brings it in.</li>
</ul>
<p>Above all three sits one row called <b>${t('bal.row')}</b>. It is there for a difference
you cannot explain: a rounding error, a payment that never made it into the book. Type the
missing amount there, and the balance is right again. There is nothing to tick off in that
row.</p>
${gshot('month-bal','The balance correction, above the income block')}
<p><b>The book starts from a number you give it.</b> In <b>${t('app.settings')}</b>, next to
the year, stands <b>${t('set.opening')}</b>: what was in your account before January. Every
balance counts on from there. Leave it empty and the book starts at zero.</p>

<h4>The views</h4>
<p>Four tabs in the middle of the header. Each has a shortcut: <b>Ctrl/Cmd + Shift + M · Y
· F · I</b>. The letters follow the English names and are the same in both languages.</p>
<ul>
  <li><b>${t('view.monat')}</b> — one month close up. This is where you work: tick off, correct,
      check what is still due. Ctrl/Cmd + ← / → steps through the months.</li>
  <li><b>${t('view.jahr')}</b> — the whole year as a table, one row per entry, one column per
      month. This is where you plan and spot the gaps.</li>
  <li><b>${t('view.prognose')}</b> — how the year ends: the balance month by month up to
      31 December, as numbers and as a chart.</li>
  <li><b>${t('view.kakeibo')}</b> — appears only after a CSV import. It shows the imported
      rows behind your flexible entries.</li>
</ul>
<p>With a file open FINA starts in the current month. A brand new book starts in the year
view.</p>

<h4>The month view</h4>
${gshot('month-out','The month view, block by block')}
<p>Three cards, one per area, plus the balance correction. Each row shows the circle for its
state, the amount, the name and, on the right, account, payment type and due date.</p>
<p><b>At the top, the filter row.</b> A search field, then <b>${t('flt.options')}</b>, then
three drop-downs: <b>${t('month.fSec')}</b>, <b>${t('flt.due')}</b>,
<b>${t('flt.state')}</b>. While a filter is on, the row turns yellow.</p>
<p><b>Below it, the month bar.</b> The chosen month is a black pill, the current month has a
red ring, finished months are struck through.</p>
<p><b>Then the analytics line</b> with four numbers: income, flexible, regular and
<b>${t('month.kpiSaldo')}</b>, everything the month brings in and costs. Click the line and
the timeline of the month opens. See below.</p>
<p><b>Folding.</b> A click on a card heading folds the card down to its heading and total. A
small arrow appears when you point at the heading. What you fold is kept in the file, for all
twelve months.</p>
<p>A double-click on an amount or a name opens the entry. A row on grey has nothing left to
pay this year.</p>

<h4>The timeline</h4>
${gshot('ui-analytics','The analytics area, opened: numbers, timeline, filter row')}
<p>The timeline splits the month into five rows: <b>${t('month.tlOpen')}</b> (what the months
before left over), <b>${t('month.fDueA')}</b> (days 1–10), <b>${t('month.fDueM')}</b>
(11–20), <b>${t('month.fDueE')}</b> (from the 21st) and <b>${t('month.tlClose')}</b>. The last
row collects everything without a due day: the flexible entries and the balance
correction.</p>
${gshot('ui-waterfall','The waterfall: every row starts where the row above it ended')}
<p><b>The bars are a waterfall.</b> The scale is your balance. Left of the line is red, right
of it green. Every row starts at the balance of the row above and ends at its own, the dark
tick. Green is income, yellow flexible, red regular, blue the correction. Point at a colour
and its amount appears.</p>
<p>The row you are currently in carries the mark <b>${t('month.tlNow')}</b>.</p>
<p><b>A click on a row filters.</b> The cards below then show only that part of the month,
and the timeline shows the bars of that part alone; the other rows stay pale. Click again,
and the waterfall is back.</p>
<p>The timeline starts closed. In <b>${t('app.settings')}</b> → <b>${t('set.navView')}</b>
you can make it open with the file.</p>

<h4>The year table</h4>
${gshot('year-left','The year table with the code columns B, PT, DD and LP')}
<ul>
  <li><b>The narrow columns on the left</b> carry the codes: <b>B</b> bank, <b>PT</b> payment
      type, <b>DD</b> due date, <b>LP</b> last payment.</li>
  <li><b>LP</b> shows the last payment of an entry. Its colour says how much of the term is
      left: <span class="endkey e-now">this month only</span>
      <span class="endkey e-soon">2 to 3 months</span> <span class="endkey e-mid">4 to 6</span>
      <span class="endkey e-far">7 and more</span>.</li>
  <li><b>Every month has two columns:</b> the amount and the circle. Green with a tick is
      paid, blue with an arrow imported, a question mark estimated. Amounts are green when
      positive, red when negative, yellow while estimated.</li>
  <li><b>${t('year.totalRow')}</b> at the top is what that month brings in and costs. The
      three blocks below break it down. It stays put whatever you filter.</li>
  <li><b>Folding:</b> a click on a block row folds the block down to its twelve totals. Kept
      in the file, separately from the month view.</li>
  <li><b>The same three filter menus</b> as in the month view, plus two buttons on the right:
      <b>${t('year.hideDone')}</b> takes away the columns of finished months,
      <b>${t('year.hideSettled')}</b> the rows that are fully paid. Both are for this session
      only. How the file opens is set in <b>${t('app.settings')}</b> →
      <b>${t('set.navView')}</b>.</li>
  <li>Headings, total row and block rows stay put while you scroll. The scrollbar for sideways
      is below the table.</li>
  <li>A click on a month name takes you into that month. A double-click on an amount or a name
      opens the entry.</li>
</ul>

<h4>The forecast</h4>
${gshot('forecast','The forecast: every month up to the year-end balance')}
<p>One table across the full width, a row per month. <b>Every row reads like a bank statement
of that month:</b> START is the balance the month begins with, then the four movements
(income, regular, flexible, correction), <b>SUM</b> is their total, and
<b>${t('prog.colEnd')}</b> is the balance afterwards. Read down the column, PROG shows how
your finances develop over the year.</p>
<p>Above January stands a row of its own, <b>${t('set.opening')}</b>. Double-click its amount
and the settings open with that field ready.</p>
<p>On the right, <b>${t('prog.colFlow')}</b>: the same waterfall as in the month view, over
twelve months. The balance stands above every grid line.</p>
<p>Two things can be changed right here: double-click a month in the column <b>COR</b> and the
balance correction opens at that month. Everything else is calculated. The card on the right
shows, per flexible entry, the amount the forecast assumes and the average so far. Both are
read-only; you change the amounts in the entry window.</p>

<h4>${t('view.kakeibo')}</h4>
${gshot('flex-view','Import Details: spending by category')}
<p>This tab appears once you have imported a CSV. It reads the imported rows behind your
flexible entries and shows what each category costs in the chosen period and on average per
month. It opens with the whole year and, on the right, with the <b>${t('kak.top')}</b>.</p>
<p>Behind every entry, in brackets, it says where the number comes from:
<b>${t('kak.kImp')}</b> from a CSV, <b>${t('kak.kDone')}</b> ticked off by you,
<b>${t('kak.kFix')}</b> typed and not estimated, <b>${t('kak.kEst')}</b> still a guess.</p>

<h4>The entry window</h4>
${gshot('item-dialog','The entry window')}
<p>The pencil next to a row opens it, and so does a double-click on the amount or the name.
The window is built in blocks, top to bottom:</p>
<ol>
  <li><b>The name</b> as heading. Click it to change it.</li>
  <li><b>Assignment:</b> category, bank, payment type, due date, and the month and year of the
      last payment if the contract ends. Above the fields: <b>${t('item.listsIn')}</b> — one
      link per list. The settings open on top of the window; nothing you typed is lost.</li>
  <li><b>${t('item.links')}:</b> contract, invoice, customer account, up to ten. Paste an
      address and the name fills itself in. In the views a chain symbol next to the row opens
      the first link; several links open a small list.</li>
  <li><b>${t('item.quick')}:</b> type an amount once, choose how often it repeats and from
      which month, press <b>${t('item.apply')}</b>. The switch <b>${t('g.estimated')}</b>
      marks all amounts as guesses.</li>
  <li><b>The twelve months</b> with a tick each. A ticked month locks its amount. Two buttons
      close every month that is over, or reopen all of them. The sign shows while you type:
      red from the minus, green from the plus.</li>
</ol>
<p><b>Imported months are locked.</b> A month with the blue arrow came from a CSV file and
cannot be changed here. To release it, delete the import data of the entry with the button
at the bottom of the window.</p>
<p><b>A double-click on an amount</b> in a view opens the window with that month framed in
orange, so you find it among the twelve.</p>
<p><b>${t('item.dup')}</b> opens a copy of what is typed, without ticks and notes. The copy
is created when you press <b>${t('g.save')}</b>.</p>

<h4>The CSV import</h4>
<p>FINA reads any CSV: bank statement, card export, budget app. <b>${t('menu.csv')}</b> in the
menu opens a window with three steps:</p>
<ol>
  <li><b>${t('c2.steps1')}</b> — pick the file. If FINA knows this kind of file,
      <b>${t('c2.knownApply')}</b> fills in the next step for you.</li>
  <li><b>${t('c2.steps2')}</b> — say which column holds the date, the amount and up to five
      references. FINA remembers this structure for the next file of the same kind.</li>
  <li><b>${t('c2.steps3')}</b> — say which rows belong to which entry: with filters that FINA
      stores at the entry as its import criteria, or by hand, once. Next time,
      <b>${t('c2.autoMap')}</b> does the work for you.</li>
</ol>
<p><b>${t('c2.finish')}</b> writes the rows into the book. An imported month gets the blue
arrow, and the rows stay with the entry: open it and press <b>${t('impv.show')}</b>. Rows
already in the book are recognised and never imported twice. An import adds to a month; it
never replaces what is there.</p>
<p>The <b>${t('app.guide')}</b> button in steps 2 and 3 explains the step right next to the
window. What FINA has learned, structures and criteria, is under <b>${t('app.settings')}</b>
→ <b>${t('set.navImport')}</b>.</p>

<h4>Filtering and finding</h4>
<p>Filtering never changes your file. It only decides which rows you see.</p>
<p><b>Every number follows what is on screen.</b> Filter a month down to three rows, and the
card totals, the category rows and the analytics line count those three. The year table does
the same. Switch the filter off and the full numbers are back. Only the forecast always
counts the whole book.</p>
<p><b>The filters, and they all apply at once:</b></p>
<ul>
  <li><b>The search field</b>, in the month view and in the year view. Just start typing.</li>
  <li><b>${t('month.fSec')}</b>: income, flexible or regular.</li>
  <li><b>${t('flt.due')}</b>: start, middle, end of the month, or month close.</li>
  <li><b>${t('flt.state')}</b>: open, estimated, settled.</li>
  <li><b>The timeline</b>, when the analytics area is open: a click on a row.</li>
</ul>
<p>While a filter is on, the filter row is yellow, every block stands open, and what a card
hides stands next to its heading as “(n hidden)”. The <b>✕</b> next to the search field
takes everything back. Escape does the same, as long as no window is open.</p>
<p><b>${t('flt.options')}</b> opens the settings, section <b>${t('set.navFilter')}</b>. Five
boxes say what the search term is looked for in: <b>${t('flt.fName')}</b>,
<b>${t('flt.fNote')}</b>, <b>${t('flt.fAmount')}</b>, <b>${t('flt.fTotal')}</b>,
<b>${t('flt.fMeta')}</b>. A sixth, <b>${t('flt.fHidden')}</b>, lets a search term beat every
other filter. The choice is kept in the file.</p>
<p>The search looks at parts of words and numbers; “1.234,56” and “1234.56” find the same row.
Hit the name of a block or a category, and that block stands there whole.</p>

<h4>Notes</h4>
<p>The small lamp is a note. The lamp <b>next to a name</b> belongs to the entry itself. The
lamp <b>inside a month</b> belongs to that month only: “paid in cash”, “check the invoice”.
A lit lamp means there is a note; point at it to read it. Notes keep their line breaks.</p>

<h4>Saving and safety</h4>
<p>Nothing is ever written by itself. <b>${t('app.save')}</b> writes numbers and settings into
your file. In Chrome and Edge into the very same file; other browsers put a fresh copy in the
downloads folder, with date and time in front of the name.</p>
<p><b>${t('app.backup')}</b> makes such a dated copy on purpose, in every browser. Use it
before an import or a big change. It does not count as saving.</p>
<p><b>${t('app.load')}</b> opens another file; if something is unsaved, FINA asks first.
<b>${t('app.unlink')}</b> puts the file down and shows the first screen again.</p>
<p>A file from an older version of FINA is read as it is. When you save, it is written in the
current format, and FINA says so once.</p>
<p><b>What leaves your computer:</b> nothing of your book. FINA asks the internet for two
things only: whether a survey is running, and, in the desktop apps, whether a newer version
is out. Both send nothing but the request. The fonts come with FINA; no external server is
called. Details are in the privacy policy, linked on the first screen.</p>

<h4>On the phone</h4>
<p>Below 700 px FINA builds a layout of its own: the month as a card list with large circles,
the year as twelve month cards, the forecast with its chart to swipe. The view is chosen at
the bottom. The phone is for looking things up: saving is not available there, only
<b>${t('app.backup')}</b>.</p>

<h4>This guide, and your feedback</h4>
<p>The orange <b>${t('app.guide')}</b> button in the menu opens and closes this panel. It
stays open while you work; drag its left edge to change the width. EN · DE in its header
switch the language of the guide only. The button next to them opens the guide on a full
page.</p>
<p>FINA is in its pilot phase: everything is unlocked and free. Instead of a price we ask for
your opinion. When a survey is running, an orange <b>${t('srv.open')}</b> button waits in the
header. One minute, and it is gone.</p>

<h4>What FINA is not</h4>
<ul>
  <li><b>Not a bank connection.</b> FINA never talks to your bank. You type, or you import a
      CSV file you exported yourself.</li>
  <li><b>Not a cloud.</b> One file, on your computer. You take care of copies.</li>
  <li><b>Not automatic.</b> Nothing is saved until you press <b>${t('app.save')}</b>.</li>
  <li><b>Not a multi-year book.</b> One file holds one year. Start a new file for the next
      year and give it last year's closing balance as its opening balance.</li>
  <li><b>Not finished.</b> The apps for Mac and Windows are being built; today FINA runs in
      the browser.</li>
</ul>
`,

de:()=>`
<h4>Was FINA ist</h4>
<p>FINA ist ein Haushaltsbuch für ein Jahr. Du trägst ein, was hereinkommt und was hinausgeht,
Monat für Monat, und hakst ab, was bezahlt ist. FINA zeigt dir jederzeit, was noch fällig ist,
wohin dein Geld geht und wie das Jahr ausgeht.</p>
<p>Alles steht in <b>einer Datei auf deinem eigenen Rechner</b>. Kein Konto, kein Server. Es
wird nichts hochgeladen. FINA schreibt in die Datei nur, wenn du auf <b>${t('app.save')}</b>
klickst.</p>
<p><b>Beispiele, was du FINA fragen kannst:</b></p>
<ul>
  <li>„Was muss ich bis Monatsende noch bezahlen?" — die Monatsansicht, gefiltert nach
      <b>${t('month.fOpen')}</b>.</li>
  <li>„Was kostet mich das Auto im Jahr?" — tipp „Auto" ins Suchfeld; jede Summe rechnet
      mit.</li>
  <li>„Rutsche ich im November ins Minus?" — die Prognose, Spalte
      <b>${t('prog.colEnd')}</b>.</li>
  <li>„Welches Abo läuft bald aus?" — die Jahrestabelle, Spalte <b>${t('year.end')}</b>.</li>
</ul>

<h4>Drei Bereiche, eine Art von Eintrag</h4>
<p>Jeder Eintrag hat einen Namen, eine Kategorie und zwölf Monatsbeträge. Die Kategorie
stellt ihn in einen von drei Bereichen:</p>
<ul>
  <li><b>${t('g.income')}</b> — Gehalt, Rückzahlungen, alles Positive.</li>
  <li><b>${t('g.fixed')}</b> — Rechnungen, die wiederkehren: Miete, Versicherung, Abos. Je
      Vertrag ein Eintrag, mit Zahltag und, falls er endet, mit der letzten Zahlung.</li>
  <li><b>${t('g.flex')}</b> — die alltäglichen Ausgaben: Lebensmittel, Sprit, Ausgehen. Eine
      Handvoll Einträge mit einer Schätzung je Monat, ersetzt durch die echte Zahl, sobald du
      sie kennst oder ein CSV-Import sie bringt.</li>
</ul>
<p>Über allen dreien steht eine Zeile namens <b>${t('bal.row')}</b>. Sie ist für eine
Differenz da, die du nicht erklären kannst: eine Rundung, eine Zahlung, die nie im Buch
gelandet ist. Trag den fehlenden Betrag dort ein, und der Saldo stimmt wieder. Abgehakt wird
in dieser Zeile nichts.</p>
${gshot('month-bal','Die Saldokorrektur, über dem Einnahmenblock')}
<p><b>Das Buch fängt bei einer Zahl an, die du ihm gibst.</b> In <b>${t('app.settings')}</b>,
neben dem Jahr, steht der <b>${t('set.opening')}</b>: was vor dem Januar auf deinem Konto
lag. Jeder Kontostand rechnet von da an weiter. Lässt du das Feld leer, fängt das Buch bei
null an.</p>

<h4>Die Ansichten</h4>
<p>Vier Reiter in der Mitte der Kopfzeile. Jeder hat einen Tastengriff: <b>Strg/Cmd +
Umschalt + M · Y · F · I</b>. Die Buchstaben folgen den englischen Namen und sind in beiden
Sprachen gleich.</p>
<ul>
  <li><b>${t('view.monat')}</b> — ein Monat aus der Nähe. Hier arbeitest du: abhaken,
      korrigieren, nachsehen, was noch fällig ist. Strg/Cmd + ← / → blättert durch die
      Monate.</li>
  <li><b>${t('view.jahr')}</b> — das ganze Jahr als Tabelle, je Eintrag eine Zeile, je Monat
      eine Spalte. Hier planst du, und hier fallen dir Lücken auf.</li>
  <li><b>${t('view.prognose')}</b> — wie das Jahr ausgeht: der Kontostand Monat für Monat bis
      zum 31. Dezember, als Zahlen und als Grafik.</li>
  <li><b>${t('view.kakeibo')}</b> — erscheint erst nach einem CSV-Import. Er zeigt die
      importierten Zeilen hinter deinen flexiblen Einträgen.</li>
</ul>
<p>Mit geladener Datei beginnt FINA im laufenden Monat. Ein ganz neues Buch beginnt in der
Jahresansicht.</p>

<h4>Die Monatsansicht</h4>
${gshot('month-out','Die Monatsansicht, Block für Block')}
<p>Drei Karten, eine je Bereich, dazu die Saldokorrektur. Jede Zeile zeigt den Kreis für ihren
Stand, den Betrag, den Namen und rechts Konto, Zahlungsart und Fälligkeit.</p>
<p><b>Ganz oben die Filterzeile.</b> Ein Suchfeld, dann <b>${t('flt.options')}</b>, dann drei
Aufklappmenüs: <b>${t('month.fSec')}</b>, <b>${t('flt.due')}</b>,
<b>${t('flt.state')}</b>. Solange ein Filter greift, ist die Zeile gelb.</p>
<p><b>Darunter die Monatsleiste.</b> Der gewählte Monat ist eine schwarze Pille, der laufende
trägt einen roten Ring, abgeschlossene Monate sind durchgestrichen.</p>
<p><b>Dann die Auswertungszeile</b> mit vier Zahlen: Einnahmen, Flexibel, Regulär und
<b>${t('month.kpiSaldo')}</b>, also alles, was der Monat bringt und kostet. Ein Klick auf die
Zeile öffnet den Zeitstrahl des Monats. Siehe unten.</p>
<p><b>Zuklappen.</b> Ein Klick auf den Kopf einer Karte klappt sie auf Überschrift und Summe
zusammen. Ein kleiner Pfeil erscheint, sobald du auf den Kopf zeigst. Was du zuklappst, steht
in der Datei, für alle zwölf Monate.</p>
<p>Ein Doppelklick auf Betrag oder Name öffnet den Eintrag. Eine Zeile auf grauem Grund hat
für dieses Jahr nichts mehr offen.</p>

<h4>Der Zeitstrahl</h4>
${gshot('ui-analytics','Der Auswertungsbereich, aufgeklappt: Zahlen, Zeitstrahl, Filterzeile')}
<p>Der Zeitstrahl teilt den Monat in fünf Zeilen: <b>${t('month.tlOpen')}</b> (was die Monate
davor übrig gelassen haben), <b>${t('month.fDueA')}</b> (1. bis 10.),
<b>${t('month.fDueM')}</b> (11. bis 20.), <b>${t('month.fDueE')}</b> (ab dem 21.) und
<b>${t('month.tlClose')}</b>. Die letzte Zeile sammelt alles ohne Zahltag: die flexiblen
Einträge und die Saldokorrektur.</p>
${gshot('ui-waterfall','Der Wasserfall: jede Zeile fängt dort an, wo die Zeile darüber aufgehört hat')}
<p><b>Die Balken sind ein Wasserfall.</b> Der Maßstab ist dein Kontostand. Links der Linie ist
es rot, rechts grün. Jede Zeile fängt beim Kontostand der Zeile darüber an und endet bei
ihrem eigenen, dem kräftigen Strich. Grün sind Einnahmen, gelb Flexibel, rot Regulär, blau
die Korrektur. Zeig auf eine Farbe, und ihr Betrag erscheint.</p>
<p>Die Zeile, in der du gerade stehst, trägt die Marke <b>${t('month.tlNow')}</b>.</p>
<p><b>Ein Klick auf eine Zeile filtert.</b> Die Karten darunter zeigen dann nur diesen Teil des
Monats, und der Zeitstrahl zeigt die Balken dieses Teils allein; die übrigen Zeilen bleiben
blass. Noch ein Klick, und der Wasserfall ist zurück.</p>
<p>Der Zeitstrahl beginnt zugeklappt. Unter <b>${t('app.settings')}</b> →
<b>${t('set.navView')}</b> kannst du ihn mit der Datei aufgehen lassen.</p>

<h4>Die Jahrestabelle</h4>
${gshot('year-left','Die Jahrestabelle mit den Kürzelspalten B, PT, DD und LP')}
<ul>
  <li><b>Die schmalen Spalten links</b> tragen die Kürzel: <b>B</b> Bank, <b>PT</b>
      Zahlungsart, <b>DD</b> Fälligkeit, <b>LP</b> letzte Zahlung.</li>
  <li><b>LP</b> zeigt die letzte Zahlung eines Eintrags. Die Farbe sagt, wie viel Laufzeit
      bleibt: <span class="endkey e-now">nur noch dieser Monat</span>
      <span class="endkey e-soon">2 bis 3 Monate</span> <span class="endkey e-mid">4 bis 6</span>
      <span class="endkey e-far">7 und mehr</span>.</li>
  <li><b>Jeder Monat hat zwei Spalten:</b> den Betrag und den Kreis. Grün mit Haken ist
      bezahlt, blau mit Pfeil importiert, ein Fragezeichen geschätzt. Beträge sind grün im
      Plus, rot im Minus, gelb, solange sie geschätzt sind.</li>
  <li><b>${t('year.totalRow')}</b> ganz oben ist, was der Monat bringt und kostet. Die drei
      Blöcke darunter schlüsseln es auf. Die Zeile bleibt stehen, was auch immer du
      filterst.</li>
  <li><b>Zuklappen:</b> ein Klick auf eine Blockzeile klappt den Block auf seine zwölf Summen
      zusammen. Steht in der Datei, getrennt von der Monatsansicht.</li>
  <li><b>Dieselben drei Filtermenüs</b> wie im Monat, dazu rechts zwei Knöpfe:
      <b>${t('year.hideDone')}</b> nimmt die Spalten abgeschlossener Monate weg,
      <b>${t('year.hideSettled')}</b> die Zeilen, die abbezahlt sind. Beide gelten nur für
      diese Sitzung. Womit die Datei aufgeht, stellst du unter <b>${t('app.settings')}</b> →
      <b>${t('set.navView')}</b> ein.</li>
  <li>Spaltenköpfe, Gesamtzeile und Blockzeilen bleiben beim Scrollen stehen. Der Rollbalken
      für die Breite steht unter der Tabelle.</li>
  <li>Ein Klick auf einen Monatsnamen bringt dich in diesen Monat. Ein Doppelklick auf Betrag
      oder Name öffnet den Eintrag.</li>
</ul>

<h4>Die Prognose</h4>
${gshot('forecast','Die Prognose: jeder Monat bis zum Saldo am Jahresende')}
<p>Eine Tabelle über die volle Breite, je Monat eine Zeile. <b>Jede Zeile liest sich wie ein
Kontoauszug dieses Monats:</b> START ist der Stand, mit dem der Monat beginnt, dann die vier
Bewegungen (Einnahmen, Regulär, Flexibel, Korrektur), <b>SUM</b> ist ihre Summe, und
<b>${t('prog.colEnd')}</b> ist der Stand danach. Von oben nach unten gelesen zeigt PROG, wie
sich deine Finanzen über das Jahr entwickeln.</p>
<p>Über dem Januar steht eine eigene Zeile, <b>${t('set.opening')}</b>. Ein Doppelklick auf
ihren Betrag öffnet die Einstellungen mit genau diesem Feld.</p>
<p>Rechts der <b>${t('prog.colFlow')}</b>: derselbe Wasserfall wie im Monat, über zwölf
Monate. Über jeder Rasterlinie steht ihr Kontostand.</p>
<p>Zwei Dinge lassen sich direkt hier ändern: Ein Doppelklick auf einen Monat in der Spalte
<b>COR</b> öffnet die Saldokorrektur mit diesem Monat. Alles andere ist gerechnet. Die Karte
rechts zeigt je flexiblem Eintrag, womit die Prognose rechnet und was der Durchschnitt bisher
ist. Beides ist nur zu lesen; die Beträge änderst du im Fenster des Eintrags.</p>

<h4>${t('view.kakeibo')}</h4>
${gshot('flex-view','Import Details: die Ausgaben je Kategorie')}
<p>Dieser Reiter erscheint, sobald du eine CSV importiert hast. Er liest die importierten
Zeilen hinter deinen flexiblen Einträgen und zeigt, was jede Kategorie im gewählten Zeitraum
kostet und im Schnitt je Monat. Er geht mit dem ganzen Jahr auf und rechts mit den
<b>${t('kak.top')}</b>.</p>
<p>Hinter jedem Eintrag steht in Klammern, woher die Zahl kommt: <b>${t('kak.kImp')}</b> aus
einer CSV, <b>${t('kak.kDone')}</b> von dir abgehakt, <b>${t('kak.kFix')}</b> eingetippt und
nicht geschätzt, <b>${t('kak.kEst')}</b> noch eine Schätzung.</p>

<h4>Das Fenster eines Eintrags</h4>
${gshot('item-dialog','Das Fenster eines Eintrags')}
<p>Der Stift neben einer Zeile öffnet es, ebenso ein Doppelklick auf Betrag oder Name. Das
Fenster ist in Blöcke gegliedert, von oben nach unten:</p>
<ol>
  <li><b>Der Name</b> als Überschrift. Klick darauf, um ihn zu ändern.</li>
  <li><b>Zuordnung:</b> Kategorie, Bank, Zahlungsart, Fälligkeit, dazu Monat und Jahr der
      letzten Zahlung, falls der Vertrag endet. Über den Feldern:
      <b>${t('item.listsIn')}</b> — ein Weg je Liste. Die Einstellungen gehen über dem Fenster
      auf; nichts Getipptes geht verloren.</li>
  <li><b>${t('item.links')}:</b> Vertrag, Rechnung, Kundenkonto, bis zu zehn. Füg eine Adresse
      ein, und der Name trägt sich selbst ein. In den Ansichten öffnet ein Kettensymbol neben
      der Zeile den ersten Link; bei mehreren eine kleine Auswahl.</li>
  <li><b>${t('item.quick')}:</b> Betrag einmal tippen, Wiederholung und Startmonat wählen, auf
      <b>${t('item.apply')}</b> klicken. Der Schalter <b>${t('g.estimated')}</b> kennzeichnet
      alle Beträge als Schätzung.</li>
  <li><b>Die zwölf Monate</b> mit je einem Haken. Ein abgehakter Monat sperrt seinen Betrag.
      Zwei Knöpfe schließen alle vergangenen Monate ab oder öffnen alle wieder. Das
      Vorzeichen zeigt sich beim Tippen: rot ab Minus, grün ab Plus.</li>
</ol>
<p><b>Importierte Monate sind gesperrt.</b> Ein Monat mit dem blauen Pfeil kam aus einer
CSV-Datei und lässt sich hier nicht ändern. Um ihn freizugeben, löschst du die Importdaten
des Eintrags mit dem Knopf unten im Fenster.</p>
<p><b>Ein Doppelklick auf einen Betrag</b> in einer Ansicht öffnet das Fenster mit diesem Monat
orange umrandet, damit du ihn unter den zwölf findest.</p>
<p><b>${t('item.dup')}</b> öffnet eine Kopie des Getippten, ohne Haken und Notizen. Angelegt
wird die Kopie erst mit <b>${t('g.save')}</b>.</p>

<h4>Der CSV-Import</h4>
<p>FINA liest jede CSV: Kontoauszug, Kartenexport, Budget-App. <b>${t('menu.csv')}</b> im Menü
öffnet ein Fenster mit drei Schritten:</p>
<ol>
  <li><b>${t('c2.steps1')}</b> — Datei wählen. Kennt FINA diese Art von Datei, füllt
      <b>${t('c2.knownApply')}</b> den nächsten Schritt für dich aus.</li>
  <li><b>${t('c2.steps2')}</b> — sagen, welche Spalte das Datum, den Betrag und bis zu fünf
      Referenzen trägt. FINA merkt sich diese Struktur für die nächste Datei derselben
      Art.</li>
  <li><b>${t('c2.steps3')}</b> — sagen, welche Zeilen zu welchem Eintrag gehören: mit Filtern,
      die FINA am Eintrag als Importkriterien merkt, oder von Hand, einmalig. Beim nächsten
      Mal erledigt <b>${t('c2.autoMap')}</b> das für dich.</li>
</ol>
<p><b>${t('c2.finish')}</b> schreibt die Zeilen ins Buch. Ein importierter Monat bekommt den
blauen Pfeil, und die Zeilen bleiben am Eintrag: öffne ihn und klick auf
<b>${t('impv.show')}</b>. Zeilen, die schon im Buch stehen, erkennt FINA und importiert sie
nie zweimal. Ein Import ergänzt einen Monat; er ersetzt nie, was da ist.</p>
<p>Der Knopf <b>${t('app.guide')}</b> in Schritt 2 und 3 erklärt den Schritt direkt neben dem
Fenster. Was FINA gelernt hat, Strukturen und Kriterien, steht unter
<b>${t('app.settings')}</b> → <b>${t('set.navImport')}</b>.</p>

<h4>Filtern und wiederfinden</h4>
<p>Filtern ändert nie deine Datei. Es entscheidet nur, welche Zeilen du siehst.</p>
<p><b>Jede Zahl rechnet über das, was auf dem Schirm steht.</b> Filter einen Monat auf drei
Zeilen herunter, und die Kartensummen, die Kategoriezeilen und die Auswertungszeile zählen
diese drei. Die Jahrestabelle macht es genauso. Nimm den Filter weg, und überall steht wieder
die volle Zahl. Nur die Prognose rechnet immer über das ganze Buch.</p>
<p><b>Die Filter, und sie gelten alle zugleich:</b></p>
<ul>
  <li><b>Das Suchfeld</b>, in der Monats- wie in der Jahresansicht. Einfach lostippen.</li>
  <li><b>${t('month.fSec')}</b>: Einnahmen, Flexibel oder Regulär.</li>
  <li><b>${t('flt.due')}</b>: Monatsanfang, -mitte, -ende oder Monatsabschluss.</li>
  <li><b>${t('flt.state')}</b>: offen, geschätzt, bezahlt.</li>
  <li><b>Der Zeitstrahl</b>, wenn die Auswertung offen ist: ein Klick auf eine Zeile.</li>
</ul>
<p>Solange ein Filter greift, ist die Filterzeile gelb, jeder Block steht offen, und was eine
Karte versteckt, steht als „(n ausgeblendet)" neben ihrer Überschrift. Das <b>✕</b> neben
dem Suchfeld nimmt alles zurück. Escape tut dasselbe, solange kein Fenster offen ist.</p>
<p><b>${t('flt.options')}</b> öffnet die Einstellungen im Bereich <b>${t('set.navFilter')}</b>.
Fünf Kästchen sagen, worin der Suchbegriff gesucht wird: <b>${t('flt.fName')}</b>,
<b>${t('flt.fNote')}</b>, <b>${t('flt.fAmount')}</b>, <b>${t('flt.fTotal')}</b>,
<b>${t('flt.fMeta')}</b>. Ein sechstes, <b>${t('flt.fHidden')}</b>, lässt einen Suchbegriff
jeden anderen Filter schlagen. Die Wahl steht in der Datei.</p>
<p>Die Suche sieht in Wortteile und Zahlstücke; „1.234,56" und „1234.56" finden dieselbe Zeile.
Triffst du den Namen eines Blocks oder einer Kategorie, steht der Block ganz da.</p>

<h4>Notizen</h4>
<p>Die kleine Lampe ist eine Notiz. Die Lampe <b>neben einem Namen</b> gehört zum Eintrag
selbst. Die Lampe <b>in einem Monat</b> gehört nur zu diesem Monat: „bar bezahlt", „Rechnung
prüfen". Eine leuchtende Lampe heißt: Da steht etwas; zeig darauf, um es zu lesen. Notizen
behalten ihre Zeilenumbrüche.</p>

<h4>Speichern und Sicherheit</h4>
<p>Von allein wird nie geschrieben. <b>${t('app.save')}</b> schreibt Zahlen und Einstellungen
in deine Datei. In Chrome und Edge in genau dieselbe Datei; andere Browser legen eine frische
Kopie im Download-Ordner ab, mit Datum und Uhrzeit vor dem Namen.</p>
<p><b>${t('app.backup')}</b> legt so eine datierte Kopie mit Absicht an, in jedem Browser. Nimm
sie vor einem Import oder einer großen Änderung. Als Speichern zählt sie nicht.</p>
<p><b>${t('app.load')}</b> öffnet eine andere Datei; ist etwas ungespeichert, fragt FINA
vorher. <b>${t('app.unlink')}</b> legt die Datei aus der Hand und zeigt wieder die erste
Seite.</p>
<p>Eine Datei aus einer älteren Fassung von FINA wird gelesen, wie sie ist. Beim Speichern
wird sie im aktuellen Format geschrieben, und FINA sagt es einmal.</p>
<p><b>Was deinen Rechner verlässt:</b> nichts aus deinem Buch. FINA fragt das Internet nur
nach zwei Dingen: ob eine Umfrage läuft, und, in den Desktop-Apps, ob es eine neuere Fassung
gibt. Beides schickt nichts außer der Anfrage. Die Schriften bringt FINA mit; kein fremder
Server wird aufgerufen. Einzelheiten stehen in der Datenschutzerklärung, verlinkt auf der
ersten Seite.</p>

<h4>Auf dem Telefon</h4>
<p>Unter 700 px baut FINA ein eigenes Layout: der Monat als Kartenliste mit großen Kreisen,
das Jahr als zwölf Monatskarten, die Prognose mit ihrer Grafik zum Wischen. Die Ansicht
wählst du unten. Das Telefon ist zum Nachsehen da: Speichern gibt es dort nicht, nur
<b>${t('app.backup')}</b>.</p>

<h4>Diese Anleitung, und deine Meinung</h4>
<p>Der orange Knopf <b>${t('app.guide')}</b> im Menü klappt diesen Bereich auf und zu. Er
bleibt offen, während du arbeitest; am linken Rand ziehst du ihn breiter. EN · DE in seinem
Kopf schalten nur die Sprache der Anleitung um. Der Knopf daneben öffnet sie über die ganze
Seite.</p>
<p>FINA ist in der Pilotphase: alles ist freigeschaltet und kostenlos. Statt eines Preises
fragen wir nach deiner Meinung. Läuft eine Umfrage, wartet ein oranger Knopf
<b>${t('srv.open')}</b> in der Kopfzeile. Eine Minute, und er ist weg.</p>

<h4>Was FINA nicht ist</h4>
<ul>
  <li><b>Keine Bankverbindung.</b> FINA spricht nie mit deiner Bank. Du tippst, oder du
      importierst eine CSV-Datei, die du selbst exportiert hast.</li>
  <li><b>Keine Cloud.</b> Eine Datei, auf deinem Rechner. Um Kopien kümmerst du dich.</li>
  <li><b>Kein Automat.</b> Gespeichert wird erst, wenn du auf <b>${t('app.save')}</b>
      klickst.</li>
  <li><b>Kein Mehrjahresbuch.</b> Eine Datei fasst ein Jahr. Fürs nächste Jahr fängst du eine
      neue Datei an und gibst ihr den Endstand des alten als Anfangsbestand.</li>
  <li><b>Nicht fertig.</b> Die Apps für Mac und Windows werden gerade gebaut; heute läuft FINA
      im Browser.</li>
</ul>
`},

/* ── Reiter 3: Was ist neu ─────────────────────────────────────
   Die Versionsliste, neueste Fassung oben. Sie wächst nach oben:
   eine neue Version bekommt einen eigenen <h4> mit der Nummer und
   darunter eine Liste dessen, was sich geändert hat — grob, in
   der Sprache des Nutzers, nicht in der des Codes.

   **Die Nummer ist das Datum: Jahr.Monat.Tag** — drei Stellen,
   dieselbe Form wie VERSION in js/config.js. Eine Zählung dahinter
   gab es bis August 2026 (`26.8.13.1`); sie ist weg, weil sie kein
   gültiges semver ergibt und electron-builder sie zurückweist. Wo
   an einem Tag zweimal etwas fertig wurde, steht es jetzt unter
   einer Nummer.

   Dieser Reiter zählt **nicht** jede Änderung auf: nur die
   größeren funktionalen bekommen einen eigenen Punkt, alles Kleine
   sammelt sich in „Bugfixing und kosmetische Anpassungen". Ein
   neuer Block entsteht mit jeder fertigen Fassung (VERSION in
   js/config.js), nicht mit jedem Commit dazwischen. */
news:{

en:()=>`
<h4>26.9.6 <span class="pill">latest</span></h4>
<ul>
  <li><b>Flexible entries are entries like any other</b> — same window, same fields, one
      “${t('menu.newOut')}”; the category decides between income, flexible and regular, and
      each of the three areas keeps an “N/A” category for entries without one.</li>
  <li><b>CSV import</b> — rows already in the book stay in the file table, grey with a
      cross in the column “X”, and so do rows assigned in this run; a button hides and shows
      them. A fifth reference field. An import adds to a month instead of replacing it.</li>
  <li><b>Year view</b> — the three filter menus (area, due date, payment state), completed
      months struck through in the month bar, the scrollbar below the table.</li>
  <li><b>${t('set.navImport')} in the settings</b> — three sections; a remembered CSV
      structure opens as a window with its own delete button. The table import is gone.</li>
  <li><b>Menu</b> — file name and status on two lines, “${t('menu.newOut')}” in black,
      “${t('app.guide')}” in orange.</li>
  <li><b>Everything moves</b> — views slide in sideways, windows drop in from the top and
      leave the same way, menus unfold, cards and blocks fold smoothly and their neighbours
      glide along. Switched off if your system asks for reduced motion.</li>
  <li><b>One click folds</b> — a click on a card heading or a block row folds it; the arrow
      shows when you point at it. The analytics line folds the same way.</li>
  <li><b>Imported months are locked</b> — a month with the blue arrow keeps its amount until
      you delete the import data of the entry.</li>
  <li><b>CSV import, step 3</b> — the three area rows fold their block, and
      “${t('c2.foldAllBtnShow')}” / “${t('c2.foldAllBtnHide')}” does it for all at once.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>

<h4>26.9.5</h4>
<ul>
  <li><b>CSV import 2.0</b> — reads any CSV in three steps: file, columns and fields,
      matching. FINA remembers the column structure per file type and the import criteria
      at each entry.</li>
  <li><b>A guide beside the import</b> — the “${t('app.guide')}” button in steps 2 and 3
      explains the step next to the window.</li>
  <li><b>${t('set.navImport')} in the settings</b> — change a remembered CSV structure with
      the pencil, and see all import criteria in one window.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>

<h4>26.8.30</h4>
<ul>
  <li><b>“${t('app.save')}” steps out of the menu</b> — as soon as there is something to
      save it stands next to the ☰ button with a red frame, and an open survey sits to its
      left. When the header gets too narrow both slip back into the menu, and the red dot on
      the ☰ button says that something in there is waiting for you.</li>
  <li><b>“${t('app.load')}” is back in the menu</b> — together with the CSV import it opens
      the menu as its own group, so you can pick up another file without closing this one
      first. Unsaved work is asked about before anything is replaced.</li>
  <li><b>The month view now shows its balance</b> — the fourth box of the analytics line
      adds up everything the month brings in and everything it costs, instead of counting
      what is not ticked off yet. It is the same number the year view calls
      <b>${t('year.totalRow')}</b>.</li>
  <li><b>The forecast has a new column</b> — <b>SUM</b> says how the month closed, between
      the correction and the running balance. That balance is now headed <b>PROG</b>: read
      down the column it shows how your finances develop over the year. A stronger line
      separates the numbers from the chart.</li>
  <li><b>Two settings decide what you see when a file opens</b> — under
      <b>${t('set.navView')}</b> you now say whether the month starts with its analytics open
      and whether the year starts with completed months hidden. What you switch while working
      stays with this session and is not written back.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>

<h4>26.8.24</h4>
<ul>
  <li><b>The CSV import reads any file now</b> — bank statement, card export, tracker.
      A three-step window guides you: pick the file, choose columns and fields, then match
      the rows to your entries or flexible categories with filters. Imported months carry a
      blue seal instead of the check mark, and FINA remembers the mapping per file type —
      the next upload of the same kind runs by itself.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>

<h4>26.8.23</h4>
<ul>
  <li><b>FINA is free while we pilot</b> — everything is unlocked, nothing is locked away,
      and instead of a price we ask what you think: the orange button in the header waits
      until you have a minute. The welcome page now also links to the privacy policy.</li>
  <li><b>The filter options live in ${t('app.settings')}</b> — the new section
      <b>${t('set.navFilter')}</b> holds what the search field looks through and whether hidden
      items count; “${t('flt.options')}” next to the search fields takes you straight there.
      The choice is kept in the JSON file, as before.</li>
  <li><b>The phone got a reworked frame</b> — the view is chosen at the bottom from a
      drop-down with ‹ › beside it, the filter menu looks and works like the desktop one and
      its ☰ button glows orange while a filter is on, the year shows four coloured boxes per
      month, and ${t('view.kakeibo')} opens its bookings in a window of their own.</li>
  <li><b>Opening an item no longer pops up the keyboard</b> — the window itself takes the
      focus; only a click on an amount puts the cursor into that month.</li>
  <li><b>The fourth tab is now called “${t('view.kakeibo')}”</b> — with a new shortcut:
      Ctrl/Cmd + Shift + I.</li>
  <li><b>The month view scrolls like the year view</b> — filter row, month bar and summary
      stay put, only the list below them scrolls; switching views no longer jumps.</li>
  <li><b>The windows hold still while you scroll</b> — the name on top and the buttons at
      the bottom always stay in sight; the groups in between float on shadows.</li>
  <li><b>“All” closes a filter menu</b> — it means “done, filter nothing”; any other value
      keeps the menu open for the next choice.</li>
  <li><b>Two ways to create instead of three</b> — the menu offers
      “${t('menu.newFlex')}” and “${t('menu.newOut')}”; whether something is income is
      decided by the category you pick in the window. And every entry of the menu now
      carries its own sign.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.22</h4>
<ul>
  <li><b>Mac style</b> — the whole interface in its new Mac look.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.20</h4>
<ul>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.19</h4>
<ul>
  <li><b>Step through the months with the keyboard</b> — in ${t('view.monat')}, Ctrl/Cmd and the
      left or right arrow key go one month back or forward.</li>
  <li><b>Filtering hides empty areas</b> — an area without a single matching row disappears
      while the filter is on, in the month as well as in the year. Without a filter it stays
      where it is.</li>
  <li><b>The month can open with its analytics</b> — a new tick under
      ${t('app.settings')} → ${t('set.navView')}. A click on the analytics line still opens
      and closes it, for as long as the file is open.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.18</h4>
<ul>
  <li><b>FINA works on the phone</b> — below 700 px the browser shows a mobile layout: the month
      as a card list with large seals, the year as twelve month cards, the forecast with its
      chart to swipe, and the view tabs at the bottom edge.</li>
  <li><b>Your language is remembered</b> — pick EN · DE on the FINA website or on the welcome
      screen, and both open that way next time on this computer. Once a book is open, the book
      decides: its language lives in the file and is changed in ${t('app.settings')}.</li>
  <li><b>The timeline follows the due-date filter</b> — pick a section (a timeline row or a
      filter button): orange lines frame it, and only this row keeps its numbers — one sum
      and, per money type, a bar on a labelled grid. The other rows stay put with pale
      bars; a second click on the chosen one brings the waterfall back.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.16</h4>
<ul>
  <li><b>Choose your language on the welcome page</b> — EN · DE at the top right, before any
      file is open. A loaded file still decides for itself.</li>
  <li><b>The word mark leads back to the FINA page</b> — in the browser, one click on the name
      at the top left; the apps keep it as a plain title.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.15</h4>
<ul>
  <li><b>FINA is now FINA Book</b> — the name in the window, the browser tab and the icon; in
      running text it stays the short FINA.</li>
  <li><b>FINA Book for macOS and for Windows</b> — a download, its own window in the dock or the
      taskbar, and it runs without the internet. The file you open stays exactly what it was.</li>
  <li><b>The app tells you when a newer version is out</b>, with a link to the download page;
      “Not now” hides it until the next start, and it can be switched off in
      ${t('app.settings')}.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.13</h4>
<ul>
  <li><b>The forecast can be changed where it stands.</b> Double-click a month in the <b>COR</b>
      column and the balance correction opens at that month. Double-click the amount of the
      <b>${t('set.opening')}</b> row and the settings open with that field ready to type.</li>
  <li><b>Every window shows the way to its lists.</b> Above the selects there is one link per
      list — categories, banks, payment types, and in the Flexible Payments window its own
      categories. The settings open on top of the window: nothing you typed is lost, and the new
      entries are in the lists when you come back.</li>
  <li><b>A new book is really empty.</b> No categories, no banks, no payment types — you set up
      what you need yourself.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.11</h4>
<ul>
  <li><b>Filtering now adds up what you see.</b> In the month view the block totals, the category
      totals and the four numbers of the analytics line; in the year table the block rows, the
      category rows and <b>${t('year.totalRow')}</b>. Switch the filter off and the full numbers
      are back.</li>
  <li><b>A FINA table can be read in</b> — the spreadsheet FINA grew out of becomes a whole book.
      Before anything changes you see what FINA read against the sum rows of your table.</li>
  <li><b>Both ways of importing now live in ${t('app.settings')}</b>, in the new section
      <b>${t('set.navImport')}</b>, instead of in the top bar.</li>
  <li><b>${t('year.totalRow')}</b> is the top row of the year table: what that one month brings in
      and costs. What is left on the account at the end of a month is in the forecast, under
      END.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.9</h4>
<ul>
  <li><b>The year view holds its headings.</b> Column names, “Balance per month” and the
      block row stay put while you scroll — and the horizontal scrollbar now sits above the
      table instead of across its last row.</li>
  <li><b>Every entry can carry several links</b>, each with a name of your own: contract,
      invoice, customer account. The name fills itself from the address, the order can be
      dragged, and where there is no link yet a dash invites you to add one.</li>
  <li><b>An estimated amount is no longer ticked off blindly.</b> The seal opens the entry
      with that month’s amount ready to correct; you tick it there.</li>
  <li><b>${t('view.kakeibo')}</b> — the fourth tab’s new name, opened with
      Ctrl/Cmd + Shift + D, and it starts with the largest single items.</li>
  <li><b>Corrected imported months say so at once</b>, in orange, and name the imported
      value when you point at them.</li>
  <li><b>Entries without any monthly amount are shown in the year view too</b>, so a new one
      does not go missing before you have filled it in.</li>
  <li><b>The guide on a full page:</b> the button next to the ✕ opens it in a browser tab of
      its own, all three parts one after another.</li>
  <li><b>The guide has its own language.</b> EN · DE in its header. It opens in the language
      from ${t('app.settings')}; the two letters change the reading only.</li>
  <li><b>${t('app.backup')}</b> — a dated copy in your downloads folder, in every browser.</li>
  <li><b>Clicking a field selects what is in it</b>, so typing replaces it.</li>
  <li><b>The forecast scrolls column by column</b> when the window is too narrow for its
      graph.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.8</h4>
<ul>
  <li><b>${t('set.opening')}</b> — the balance your book starts from, next to the year in
      ${t('app.settings')}. Every balance counts on from there.</li>
  <li><b>The year view folds</b> like the month view: a block down to its twelve totals.</li>
  <li><b>While you filter, every block stands open.</b></li>
  <li><b>New ways with the filter:</b> just start typing, ✕ to take it all back, Escape.</li>
  <li><b>A shortcut per view:</b> Ctrl/Cmd + Shift + M · Y · F · D.</li>
  <li><b>${t('flt.fHidden')}</b> — a search term now beats the other filters.</li>
  <li><b>The forecast graph carries its own axis:</b> the balance above every grid line.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.7</h4>
<ul>
  <li><b>Income has categories of its own</b>, in a second list next to the expense
      categories.</li>
  <li><b>The forecast, rebuilt:</b> one table, and a column that draws the balance through the
      year.</li>
  <li><b>The name is the heading</b> — for items and for Flexible Payments categories.</li>
  <li><b>The average per month so far</b> stands above the quick entry.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.6</h4>
<ul>
  <li><b>A first screen</b> with no file open: open a file, or start from scratch.</li>
  <li><b>${t('month.ana')}</b> — the five numbers of the month open a timeline of it.</li>
  <li><b>One filter row at the top</b>, for all three blocks at once.</li>
  <li><b>Blocks fold away.</b></li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.5</h4>
<ul>
  <li><b>The filter searches only where you want it to</b> — the ☰ button in front of the
      field.</li>
  <li><b>${t('view.kakeibo')} only with an import</b>, and now the last tab.</li>
  <li><b>${t('app.import')} moved to the top bar.</b></li>
  <li><b>${t('view.prognose')} only calculates now</b> — it no longer writes.</li>
  <li><b>Duplicate an item or a category</b> — same window, copy inside.</li>
  <li><b>The sign shows while you type:</b> red below zero, green above.</li>
  <li><b>Note lamps from the first moment</b>, and notes keep their line breaks.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.4</h4>
<ul>
  <li><b>Double-click opens an item</b> — in every view, on the amount or on the name.</li>
  <li><b>The search field holds the cursor</b> while you tick things off.</li>
  <li><b>The bar of the year view, rebuilt</b>, with its two filter buttons.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.7.30</h4>
<p>The first complete version:</p>
<ul>
  <li><b>One file, one year</b>, on your own computer. Nothing is written until you save.</li>
  <li><b>Three kinds of money</b> — ${t('g.income')}, ${t('g.fixed')}, ${t('g.flex')} — and
      ${t('bal.row')} above them.</li>
  <li><b>Four views:</b> month, year, everyday spending, forecast.</li>
  <li><b>One window per item:</b> twelve amounts, a tick per month, quick entry.</li>
  <li><b>Filters, notes and a CSV import</b> from Fast Budget.</li>
</ul>
`,

de:()=>`
<h4>26.9.6 <span class="pill">neu</span></h4>
<ul>
  <li><b>Flexible Posten sind Posten wie alle anderen</b> — dasselbe Fenster, dieselben
      Felder, ein „${t('menu.newOut')}"; die Kategorie entscheidet zwischen Einnahme,
      flexibel und regulär, und jeder der drei Bereiche behält eine Kategorie „N/A" für
      Posten ohne eigene.</li>
  <li><b>CSV-Import</b> — Zeilen, die schon im Buch stehen, bleiben grau mit Kreuz in der
      Spalte „X" in der Dateitabelle, ebenso die in diesem Lauf zugeordneten; ein Knopf
      verbirgt und zeigt sie. Ein fünftes Referenzfeld. Ein Import ergänzt einen Monat,
      statt ihn zu ersetzen.</li>
  <li><b>Jahresansicht</b> — die drei Filtermenüs (Bereich, Fälligkeit, Zahlungsstand),
      abgeschlossene Monate durchgestrichen in der Monatsleiste, der Rollbalken unter der
      Tabelle.</li>
  <li><b>${t('set.navImport')} in den Einstellungen</b> — drei Abschnitte; eine gemerkte
      CSV-Struktur öffnet sich als Fenster mit eigenem Löschknopf. Der Tabellenimport ist
      weg.</li>
  <li><b>Menü</b> — Dateiname und Stand auf zwei Zeilen, „${t('menu.newOut')}" schwarz,
      „${t('app.guide')}" orange.</li>
  <li><b>Alles bewegt sich</b> — Ansichten fahren seitwärts herein, Fenster fallen von oben
      ein und gehen denselben Weg hinaus, Menüs entfalten sich, Karten und Blöcke klappen
      weich und ihre Nachbarn gleiten nach. Aus, wenn dein System weniger Bewegung
      wünscht.</li>
  <li><b>Ein Klick klappt</b> — ein Klick auf einen Kartenkopf oder eine Blockzeile klappt
      sie zu; der Pfeil zeigt sich, sobald du darauf zeigst. Die Auswertungszeile klappt
      genauso.</li>
  <li><b>Importierte Monate sind gesperrt</b> — ein Monat mit dem blauen Pfeil behält seinen
      Betrag, bis du die Importdaten des Eintrags löschst.</li>
  <li><b>CSV-Import, Schritt 3</b> — die drei Bereichszeilen klappen ihren Block, und
      „${t('c2.foldAllBtnShow')}" / „${t('c2.foldAllBtnHide')}" tut es für alle auf
      einmal.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.9.5</h4>
<ul>
  <li><b>CSV-Import 2.0</b> — liest jede CSV in drei Schritten: Datei, Spalten und Felder,
      Zuordnen. FINA merkt sich die Spaltenstruktur je Datei-Art und die Importkriterien
      am Posten.</li>
  <li><b>Anleitung neben dem Import</b> — der Knopf „${t('app.guide')}" in Schritt 2 und 3
      erklärt den Schritt neben dem Fenster.</li>
  <li><b>${t('set.navImport')} in den Einstellungen</b> — eine gemerkte CSV-Struktur mit
      dem Stift ändern, alle Importkriterien in einem Fenster sehen.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.30</h4>
<ul>
  <li><b>„${t('app.save')}" tritt aus dem Menü heraus</b> — sobald es etwas zu speichern
      gibt, steht der Knopf mit rotem Rahmen neben dem ☰, und eine offene Umfrage steht
      links daneben. Wird die Kopfzeile zu eng, gehen beide zurück ins Menü, und der rote
      Punkt am ☰ sagt, dass dort drin etwas auf dich wartet.</li>
  <li><b>„${t('app.load')}" steht wieder im Menü</b> — zusammen mit dem CSV-Import als
      eigene Gruppe ganz oben. Du kannst damit eine andere Datei öffnen, ohne die jetzige
      vorher zu schließen; nach ungespeicherter Arbeit wird vorher gefragt.</li>
  <li><b>Die Monatsansicht zeigt jetzt ihren Saldo</b> — die vierte Kachel der Auswertung
      rechnet alles zusammen, was der Monat bringt und kostet, statt zu zählen, was noch
      nicht abgehakt ist. Es ist dieselbe Zahl, die die Jahresansicht
      <b>${t('year.totalRow')}</b> nennt.</li>
  <li><b>Die Prognose hat eine neue Spalte</b> — <b>SUM</b> sagt, wie der Monat
      abgeschlossen hat, und steht zwischen der Korrektur und dem Kontostand. Der heißt
      jetzt <b>PROG</b>: von oben nach unten gelesen zeigt die Spalte die Entwicklung
      deiner Finanzen über das Jahr. Eine kräftigere Linie trennt die Zahlen von der
      Grafik.</li>
  <li><b>Zwei Einstellungen entscheiden, womit eine Datei aufgeht</b> — unter
      <b>${t('set.navView')}</b> sagst du jetzt, ob der Monat mit aufgeklappter Auswertung
      anfängt und ob das Jahr die abgeschlossenen Monate versteckt. Was du beim Arbeiten
      umschaltest, gilt nur für diese Sitzung und wird nicht zurückgeschrieben.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.24</h4>
<ul>
  <li><b>Der CSV-Import liest jetzt jede Datei</b> — Kontoauszug, Kartenexport, Tracker.
      Ein Fenster führt in drei Schritten durch: Datei wählen, Spalten und Felder festlegen,
      dann die Zeilen mit Filtern deinen Posten oder flexiblen Kategorien zuordnen.
      Importierte Monate tragen ein blaues Siegel statt des Hakens, und FINA merkt sich die
      Zuordnung je Datei-Art — derselbe Export läuft beim nächsten Mal von selbst durch.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.23</h4>
<ul>
  <li><b>FINA ist in der Pilotphase kostenlos</b> — alles ist freigeschaltet, nichts ist
      weggesperrt, und statt eines Preises fragen wir nach deiner Meinung: der orange Knopf
      in der Kopfzeile wartet, bis du Zeit hast. Von der Begrüßungsseite führt jetzt
      außerdem ein Weg zur Datenschutzerklärung.</li>
  <li><b>Die Filteroptionen stehen in ${t('app.settings')}</b> — der neue Bereich
      <b>${t('set.navFilter')}</b> sagt, worin das Suchfeld sucht und ob ausgeblendete Posten
      mitzählen; „${t('flt.options')}" neben den Suchfeldern führt direkt hin. Die Wahl steht
      wie bisher in der JSON-Datei.</li>
  <li><b>Das Telefon hat einen neuen Rahmen</b> — die Ansicht wird unten über eine
      Aufklappliste mit ‹ › daneben gewählt, das Filtermenü sieht aus und arbeitet wie am
      Schreibtisch und sein ☰-Knopf leuchtet orange, solange ein Filter greift, das Jahr
      zeigt je Monat vier farbige Kästchen, und ${t('view.kakeibo')} öffnet seine Buchungen
      in einem eigenen Fenster.</li>
  <li><b>Eine Position öffnet sich ohne Tastatur</b> — das Fenster selbst bekommt den Fokus;
      nur der Klick auf einen Betrag setzt die Schreibmarke in diesen Monat.</li>
  <li><b>Der vierte Reiter heißt jetzt „${t('view.kakeibo')}"</b> — mit neuem Tastengriff:
      Strg/Cmd + Umschalt + I.</li>
  <li><b>Die Monatsansicht rollt wie die Jahresansicht</b> — Filterzeile, Monatsleiste und
      Auswertung bleiben stehen, nur die Liste darunter rollt; beim Ansichtswechsel springt
      nichts mehr.</li>
  <li><b>Die Fenster halten still beim Scrollen</b> — der Name oben und die Knöpfe unten
      bleiben immer im Bild; die Gruppen dazwischen schweben auf Schatten.</li>
  <li><b>„Alle" schließt ein Filtermenü</b> — es heißt „fertig, nichts filtern"; jeder
      andere Wert lässt das Menü für die nächste Wahl offen.</li>
  <li><b>Zwei Wege zum Anlegen statt drei</b> — im Menü stehen „${t('menu.newFlex')}"
      und „${t('menu.newOut')}"; ob etwas eine Einnahme ist, entscheidet die Kategorie,
      die man im Fenster wählt. Und jeder Eintrag des Menüs trägt jetzt sein eigenes
      Zeichen.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.22</h4>
<ul>
  <li><b>Mac Style</b> — die ganze Oberfläche im neuen Mac-Gewand.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.20</h4>
<ul>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.19</h4>
<ul>
  <li><b>Mit der Tastatur durch die Monate</b> — in ${t('view.monat')} gehen Strg/Cmd und die
      Pfeiltaste links oder rechts einen Monat zurück oder weiter.</li>
  <li><b>Beim Filtern verschwinden leere Bereiche</b> — ein Bereich ohne einen einzigen
      Treffer wird ausgeblendet, im Monat wie im Jahr. Ohne Filter bleibt er stehen.</li>
  <li><b>Der Monat kann mit aufgeklappter Auswertung aufgehen</b> — ein neuer Haken unter
      ${t('app.settings')} → ${t('set.navView')}. Ein Klick auf die Auswertungszeile klappt
      sie weiterhin auf und zu, solange die Datei offen ist.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.18</h4>
<ul>
  <li><b>FINA läuft auf dem Telefon</b> — unter 700 px zeigt der Browser eine mobile
      Oberfläche: der Monat als Kartenliste mit großen Siegeln, das Jahr als zwölf
      Monatskarten, die Prognose mit ihrer Grafik zum Wischen, und die Ansichtsreiter am
      unteren Rand.</li>
  <li><b>Deine Sprache bleibt gemerkt</b> — wähle EN · DE auf der FINA-Webseite oder auf der
      Begrüßungsseite, und beide öffnen beim nächsten Mal auf diesem Rechner so. Sobald ein Buch
      offen ist, entscheidet das Buch: seine Sprache steht in der Datei und wird in
      ${t('app.settings')} geändert.</li>
  <li><b>Der Zeitstrahl folgt dem Fälligkeitsfilter</b> — wer einen Abschnitt wählt (eine
      Zeile oder einen Filterknopf), sieht ihn orange eingefasst, und nur diese Zeile
      behält ihre Zahlen: eine Summe und je Geldart einen Balken auf einem beschrifteten
      Raster. Die übrigen Zeilen bleiben mit blassen Balken stehen; ein zweiter Klick auf
      die gewählte bringt den Wasserfall zurück.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.16</h4>
<ul>
  <li><b>Sprachwahl auf der Begrüßungsseite</b> — EN · DE oben rechts, noch bevor eine Datei
      offen ist. Eine geladene Datei entscheidet weiter selbst.</li>
  <li><b>Das Wortzeichen führt zur FINA-Seite zurück</b> — im Browser ein Klick auf den Namen
      oben links; in den Apps bleibt er eine gewöhnliche Überschrift.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.15</h4>
<ul>
  <li><b>FINA heißt jetzt FINA Book</b> — im Fenster, im Reiter des Browsers und im Symbol; im
      Fließtext bleibt es beim kurzen FINA.</li>
  <li><b>FINA Book für macOS und für Windows</b> — ein Download, ein eigenes Fenster im Dock oder
      in der Taskleiste, und es läuft ohne Internet. Die Datei, die du öffnest, bleibt genau die,
      die sie war.</li>
  <li><b>Die App sagt Bescheid, wenn es eine neuere Fassung gibt</b>, mit einem Weg zur
      Downloadseite; „Später" blendet die Leiste bis zum nächsten Start aus, abschalten lässt sie
      sich in den ${t('app.settings')}.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.13</h4>
<ul>
  <li><b>Die Prognose lässt sich dort ändern, wo sie steht.</b> Ein Doppelklick auf einen Monat
      der Spalte <b>COR</b> öffnet die Saldokorrektur mit genau diesem Monat. Ein Doppelklick auf
      den Betrag der Zeile <b>${t('set.opening')}</b> öffnet die Einstellungen mit diesem Feld
      bereit zum Tippen.</li>
  <li><b>Jedes Fenster zeigt den Weg zu seinen Listen.</b> Über den Auswahllisten steht ein Weg
      je Liste — Kategorien, Banken, Zahlungsarten, im Fenster der Flexible Payments deren eigene
      Kategorien. Die Einstellungen gehen über dem Fenster auf: Getipptes bleibt stehen, und die
      neuen Einträge stehen hinterher in den Listen.</li>
  <li><b>Ein neues Buch ist wirklich leer.</b> Keine Kategorien, keine Banken, keine
      Zahlungsarten — du richtest dir selbst ein, was du brauchst.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.11</h4>
<ul>
  <li><b>Filtern rechnet jetzt über das, was du siehst.</b> In der Monatsansicht die
      Bereichssummen, die Kategoriesummen und die vier Zahlen der Auswertung; in der
      Jahrestabelle die Blockzeilen, die Kategoriezeilen und <b>${t('year.totalRow')}</b>. Nimmst
      du den Filter weg, steht überall wieder die volle Zahl.</li>
  <li><b>Eine FINA-Tabelle lässt sich einlesen</b> — die Tabellenkalkulation, aus der FINA
      entstanden ist, wird zu einem ganzen Buch. Bevor sich etwas ändert, siehst du, was FINA
      gelesen hat, neben den Summenzeilen deiner Tabelle.</li>
  <li><b>Beide Wege des Imports stehen jetzt in den ${t('app.settings')}</b>, im neuen Bereich
      <b>${t('set.navImport')}</b>, statt in der Kopfzeile.</li>
  <li><b>${t('year.totalRow')}</b> ist die oberste Zeile der Jahrestabelle: was dieser eine Monat
      bringt und kostet. Was am Monatsende auf dem Konto steht, sagt die Prognose unter END.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.9</h4>
<ul>
  <li><b>Die Jahresansicht hält ihre Überschriften fest.</b> Spaltennamen, „Saldo je Monat"
      und die Blockzeile bleiben beim Scrollen stehen — und der waagerechte Rollbalken steht
      jetzt über der Tabelle statt quer über ihrer letzten Zeile.</li>
  <li><b>Jeder Eintrag kann mehrere Links tragen</b>, jeder mit eigenem Namen: Vertrag,
      Rechnung, Kundenkonto. Der Name füllt sich aus der Adresse, die Reihenfolge lässt sich
      ziehen, und wo noch kein Link steht, lädt ein Strich zum Anlegen ein.</li>
  <li><b>Ein geschätzter Betrag wird nicht mehr blind abgehakt.</b> Das Siegel öffnet den
      Eintrag mit dem Betrag dieses Monats zum Richtigstellen; abgehakt wird dort.</li>
  <li><b>${t('view.kakeibo')}</b> — so heißt der vierte Reiter jetzt, geöffnet mit
      Strg/Cmd + Umschalt + D, und er beginnt mit den größten Einzelposten.</li>
  <li><b>Korrigierte Importmonate sagen es sofort</b>, in Orange, und nennen beim Überfahren
      den importierten Wert.</li>
  <li><b>Posten ohne Monatsbeträge stehen auch in der Jahresansicht</b>, damit ein frisch
      angelegter nicht verlorengeht, bevor du ihn ausgefüllt hast.</li>
  <li><b>Die Anleitung über die ganze Seite:</b> der Knopf neben dem ✕ öffnet sie in einem
      eigenen Reiter des Browsers, alle drei Teile hintereinander.</li>
  <li><b>Die Anleitung hat ihre eigene Sprache.</b> EN · DE in ihrem Kopf. Sie geht in der
      Sprache aus den ${t('app.settings')} auf; die beiden Kürzel ändern nur das Lesen.</li>
  <li><b>${t('app.backup')}</b> — eine datierte Kopie im Download-Ordner, in jedem
      Browser.</li>
  <li><b>Ein Feld anklicken markiert seinen Inhalt</b>, tippen ersetzt ihn.</li>
  <li><b>Die Prognose scrollt spaltenweise</b>, wenn das Fenster für ihre Grafik zu schmal
      ist.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.8</h4>
<ul>
  <li><b>${t('set.opening')}</b> — der Stand, bei dem dein Buch anfängt, neben dem Jahr in den
      ${t('app.settings')}. Jeder Kontostand rechnet von da an weiter.</li>
  <li><b>Die Jahresansicht klappt</b> wie die Monatsansicht: ein Block auf seine zwölf
      Summen.</li>
  <li><b>Solange du filterst, steht jeder Block offen.</b></li>
  <li><b>Neue Wege mit dem Filter:</b> einfach lostippen, ✕ nimmt alles zurück, Escape.</li>
  <li><b>Ein Tastengriff je Ansicht:</b> Strg/Cmd + Umschalt + M · Y · F · D.</li>
  <li><b>${t('flt.fHidden')}</b> — ein Suchbegriff schlägt jetzt die übrigen Filter.</li>
  <li><b>Die Grafik der Prognose trägt ihre eigene Achse:</b> über jeder Rasterlinie ihr
      Kontostand.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.7</h4>
<ul>
  <li><b>Einnahmen haben eigene Kategorien</b>, in einer zweiten Liste neben den
      Ausgabe-Kategorien.</li>
  <li><b>Die Prognose neu gebaut:</b> eine Tabelle, und eine Spalte, die den Kontostand durch
      das Jahr zeichnet.</li>
  <li><b>Die Bezeichnung ist die Überschrift</b> — bei Posten wie bei
      Flexible-Payments-Kategorien.</li>
  <li><b>Der bisherige Mittelwert je Monat</b> steht über der Schnelleingabe.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.6</h4>
<ul>
  <li><b>Eine erste Seite</b> ohne Datei: öffnen oder neu anfangen.</li>
  <li><b>${t('month.ana')}</b> — die fünf Zahlen des Monats öffnen seinen Zeitstrahl.</li>
  <li><b>Eine Filterzeile oben</b>, für alle drei Blöcke zugleich.</li>
  <li><b>Blöcke lassen sich zuklappen.</b></li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.5</h4>
<ul>
  <li><b>Der Filter sucht nur dort, wo du es willst</b> — der ☰-Knopf vor dem Feld.</li>
  <li><b>${t('view.kakeibo')} nur mit Import</b>, und jetzt als letzter Reiter.</li>
  <li><b>${t('app.import')} steht in der Kopfzeile.</b></li>
  <li><b>Die ${t('view.prognose')} rechnet nur noch</b> — sie schreibt nicht mehr.</li>
  <li><b>Posten und Kategorien duplizieren</b> — dasselbe Fenster, eine Kopie darin.</li>
  <li><b>Das Vorzeichen zeigt sich beim Tippen:</b> rot unter null, grün darüber.</li>
  <li><b>Notizlampen von Anfang an</b>, und Notizen behalten ihre Zeilen.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.4</h4>
<ul>
  <li><b>Doppelklick öffnet die Position</b> — in jeder Ansicht, auf Betrag oder
      Bezeichnung.</li>
  <li><b>Das Suchfeld hält die Schreibmarke</b>, während du abhakst.</li>
  <li><b>Die Leiste der Jahresansicht neu geordnet</b>, mit ihren zwei Filterknöpfen.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.7.30</h4>
<p>Die erste vollständige Fassung:</p>
<ul>
  <li><b>Eine Datei, ein Jahr</b>, auf dem eigenen Rechner. Geschrieben wird erst beim
      Speichern.</li>
  <li><b>Drei Arten von Geld</b> — ${t('g.income')}, ${t('g.fixed')}, ${t('g.flex')} — und
      darüber ${t('bal.row')}.</li>
  <li><b>Vier Ansichten:</b> Monat, Jahr, alltägliche Ausgaben, Prognose.</li>
  <li><b>Ein Fenster je Position:</b> zwölf Beträge, je Monat ein Haken, schnelle Eingabe.</li>
  <li><b>Filter, Notizen und ein CSV-Import</b> aus Fast Budget.</li>
</ul>
`}

};

/* Die Reiter des Bereichs. Die Anleitung für Anfänger steht
   vorn — wer die Anwendung kennt, findet den zweiten Reiter auch
   so, umgekehrt gilt das nicht. */
const GUIDE_TABS=[['steps','guide.tabSteps'],['product','guide.tabProduct'],
  ['news','guide.tabNews']];

/* ── Breite des Bereichs ──────────────────────────────────────
   Beim ersten Öffnen ein Drittel des Fensters, danach das, was
   der Nutzer am Griff gezogen hat. Der Wert lebt nur in dieser
   Sitzung: er gehört zur Ansicht, nicht zu den Zahlen, und hat
   deshalb in der JSON-Datei nichts verloren. Nach unten eine
   Mindestbreite, damit der Text nicht zur Spalte wird, nach oben
   zwei Drittel — die Tabelle daneben soll lesbar bleiben. */
const GUIDE_MIN=300;
let guideW=0, guideTab='steps';

/* ── Die Anleitung hat ihre eigene Sprache ────────────────────
   Umgeschaltet wird sie im Kopf des Bereichs, links neben dem
   Kreuz, und sie gilt **nur dort**: an `state.lang` und damit an
   der Oberfläche ändert sich nichts. Wer die Anwendung auf Deutsch
   führt, darf die Anleitung trotzdem auf Englisch lesen — und
   umgekehrt.

   Vorgabe ist Englisch, wie in der Anwendung selbst. Der Wert lebt
   nur in dieser Sitzung: er gehört zur Anzeige, nicht zu den
   Zahlen, und hat in der JSON-Datei nichts verloren. */
let gLang='en';

/* Gebaut wird der ganze Bereich in dieser Sprache — Überschrift,
   Reiter und Text sollen nicht auseinanderlaufen. `t()` liest die
   Sprache aus `state.lang`, deshalb steht sie hier für die Dauer
   des Aufbaus darauf und danach wieder auf ihrem alten Wert.
   Dazwischen wird nur eine Zeichenkette gebaut; gezeichnet wird
   nichts, gespeichert erst recht nicht. */
function inGuideLang(build){
  const was=state?state.lang:null;
  if(state) state.lang=gLang;
  try{ return build(); }
  finally{ if(state) state.lang=was; }
}

/* Sprache der Anleitung wechseln. Der Bereich wird neu gebaut, die
   Leseposition bleibt (fillGuide, gleicher Reiter). */
function guideLangTo(l){
  gLang=(l==='de')?'de':'en';
  if(guideOpen()) fillGuide();
}

/* ── Womit die Anleitung aufgeht ──────────────────────────────
   Wer schon mit einer Datei arbeitet, hat seine Sprache in den
   Einstellungen gewählt — die Anleitung fängt dann bei jedem Öffnen
   in derselben an, und zwar wieder, auch wenn zwischendurch
   umgeschaltet wurde: die Wahl im Kopf gilt dem Lesen, nicht der
   Anwendung.

   Auf der Begrüßungsseite bleibt es beim bisherigen Wert. Dort gibt
   es keine Einstellung, an der man sich ausrichten könnte —
   `state.lang` ist die Vorgabe eines leeren Buches und keine
   Entscheidung des Nutzers. */
function guideLangOnOpen(){
  if(ui.welcome) return;
  if(state&&state.lang) gLang=(state.lang==='de')?'de':'en';
}

function guideMax(){ return Math.max(GUIDE_MIN,Math.round(window.innerWidth*0.66)); }

function setGuideWidth(w){
  guideW=Math.min(Math.max(Math.round(w),GUIDE_MIN),guideMax());
  document.documentElement.style.setProperty('--guidew',guideW+'px');
  /* Die Seite ist jetzt schmaler: die mitlaufenden Leisten, die
     Spaltenköpfe der Jahresmatrix und die Rollleisten über den
     Tabellen müssen neu gemessen werden. */
  if(typeof syncMatrixHead==='function') syncMatrixHead();
}

function guideOpen(){ return !!document.getElementById('guidePanel'); }

function openGuide(){
  if(guideOpen()) return;
  guideLangOnOpen();
  const el=document.createElement('aside');
  el.id='guidePanel'; el.className='guidepanel';
  el.setAttribute('aria-label',t('app.guide'));
  document.body.appendChild(el);
  fillGuide(el);
  document.body.classList.add('guideon');
  setGuideWidth(guideW||window.innerWidth/3);
  syncGuideBtn();
  el.querySelector('#gClose').focus();
}

function closeGuide(){
  const el=document.getElementById('guidePanel'); if(!el) return;
  el.remove();
  document.body.classList.remove('guideon');
  syncGuideBtn();
  if(typeof syncMatrixHead==='function') syncMatrixHead();
  const b=document.getElementById('btnGuide'); if(b) b.focus();
}

function toggleGuide(){ guideOpen()?closeGuide():openGuide(); }

/* Reiter wechseln. Öffnet den Bereich, falls er zu ist — so
   kommt man von überall her auf einen bestimmten Reiter. */
function guideTo(tab){
  guideTab=GUIDE[tab]?tab:'steps';
  if(!guideOpen()) openGuide(); else fillGuide();
}

/* Der Knopf zeigt, ob der Bereich offen ist. */
function syncGuideBtn(){
  const b=document.getElementById('btnGuide');
  if(b) b.setAttribute('aria-pressed',guideOpen());
}

/* Nach jedem Neuzeichnen (renderChrome in js/app.js). Zu tun ist
   hier nichts mehr: die Anleitung hängt an ihrer eigenen Sprache
   (gLang) und nicht an der der Oberfläche, und ihr Inhalt ändert
   sich durch nichts, was in der Tabelle passiert. Ein Neuaufbau je
   Klick auf ein Siegel wäre nur Arbeit — und er verlöre die
   Leseposition. */
function renderGuide(){}

/* ── Die Anleitung über die ganze Breite ──────────────────────
   Der Seitenbereich ist zum Nachschlagen neben der Tabelle da. Wer
   die Anleitung wirklich liest, braucht die ganze Seite — dafür der
   Knopf im Kopf: er öffnet sie in einem eigenen Reiter des Browsers
   und schließt den Bereich. Beides nebeneinander wäre dieselbe
   Anleitung zweimal, einmal davon zu schmal.

   Geschrieben wird eine vollständige Seite in den neuen Reiter
   (`document.write`): es gibt keinen Server, und `fetch` scheidet
   unter file:// aus (Regel 4). Das `<base>` zeigt auf die
   Anwendung, damit die Stylesheets und die Bilder aus doc/img mit
   ihren gewohnten relativen Pfaden gefunden werden — dieselben
   Dateien, dieselbe Gestaltung.

   Reiter gibt es dort keine: die drei Teile stehen hintereinander,
   oben eine Zeile mit Sprungmarken. Ein Reiter verbirgt, um Platz
   zu sparen, und auf einer ganzen Seite ist keiner knapp. Damit
   kommt die Seite ohne eigenes Skript aus.

   Gebaut wird alles in der Sprache der Anleitung (gLang), nicht in
   der der Oberfläche — wie der Seitenbereich auch. */
function guideDoc(){
  return inGuideLang(()=>{
    const title=`FINA Book — ${t('app.guide')}`;
    /* Die drei Reiter wie im Seitenbereich — nur sind es hier
       Sprungmarken, keine Schalter: die drei Teile stehen alle auf
       der Seite. Sie kleben oben, damit man von überall zum
       nächsten Teil kommt, ohne zurückzurollen. Ohne Skript, wie
       die ganze Seite (Regel 4). */
    const nav=GUIDE_TABS.map(([k,lab])=>`<a href="#g-${k}">${t(lab)}</a>`).join('');
    const parts=GUIDE_TABS.map(([k,lab])=>{
      const text=GUIDE[k]||GUIDE.steps;
      const body=(text[gLang]||text.en)();
      const zoom=body.indexOf('<figure')>=0?`<p class="gzoom">${t('guide.zoom')}</p>`:'';
      return `<section id="g-${k}"><h2>${t(lab)}</h2>${zoom}${body}</section>`;
    }).join('');
    return `<!DOCTYPE html>
<html lang="${gLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${esc(location.href)}">
<title>${esc(title)}</title>
<!-- Die Schriften bringt tokens.css mit (css/fonts/). Das <base>
     oben zeigt auf die Anwendung, deshalb findet die neue Seite
     sie über denselben relativen Pfad wie index.html. -->
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
<link rel="icon" href="icon.png" sizes="any">
</head>
<body id="g-top">
<main class="guide gpage">
  <h1>${esc(title)}</h1>
  <nav class="gnav">${nav}</nav>
  ${parts}
</main>
<!-- Zurück nach oben: auf einer Seite mit allen drei Teilen ist der
     Weg dorthin sonst weit. Ein Anker, kein Knopf — die Seite hat
     kein Skript. -->
<a class="gtop" href="#g-top" aria-label="${esc(t('guide.top'))}"
  title="${esc(t('guide.top'))}">&#8593;</a>
</body>
</html>`;
  });
}

/* Der Knopf im Kopf. Der neue Reiter wird im Klick geöffnet, sonst
   hielte der Browser ihn für ungefragt. Hält er ihn trotzdem auf,
   bleibt der Bereich stehen — sonst stünde der Nutzer ohne beides
   da. */
function openGuideTab(){
  const html=guideDoc();
  const w=window.open('','_blank');
  if(!w){ warn(t('guide.fullBlocked')); return; }
  w.document.open(); w.document.write(html); w.document.close();
  closeGuide();
}

/* Inhalt und Beschriftungen. Die Leseposition überlebt den
   Neuaufbau nur innerhalb desselben Reiters — beim Wechsel fängt
   man oben an, das ist beim Lesen einer Anleitung auch richtig. */
function fillGuide(el){
  const box=el||document.getElementById('guidePanel'); if(!box) return;
  const sameTab=box.dataset.tab===guideTab;
  const scroll=box.querySelector('.gbody');
  const y=sameTab&&scroll?scroll.scrollTop:0;
  box.dataset.tab=guideTab;
  /* Alles in der Sprache der Anleitung — Text, Reiter, Überschrift.
     Die Kürzel EN · DE kommen aus LANGS in js/i18n.js und sind
     deshalb kein fester Text im Code; sie stehen für die Sprache
     selbst und wechseln nicht mit ihr, wie B · PT · DD · LP in der
     Jahresmatrix. */
  box.innerHTML=inGuideLang(()=>{
    const text=(GUIDE[guideTab]||GUIDE.steps);
    const body=(text[gLang]||text.en)();
    /* Der Hinweis auf die Bilder steht nur über einem Reiter, der
       welche hat — die Versionsliste kommt ohne aus. */
    const zoom=body.indexOf('<figure')>=0?`<p class="gzoom">${t('guide.zoom')}</p>`:'';
    const langs=LANGS.map(([k])=>`<button class="glang" data-glang="${k}"
        aria-pressed="${k===gLang}">${k.toUpperCase()}</button>`).join('');
    return `<div class="ghandle" id="gHandle" role="separator" aria-orientation="vertical"
      tabindex="0" title="${t('app.guideDrag')}" aria-label="${t('app.guideDrag')}"></div>
    <div class="ghead">
      <div><h3>${t('app.guide')} — FINA</h3></div>
      <span class="gact">
        <span class="glangs" role="group" aria-label="${esc(t('guide.lang'))}"
          data-tip="${esc(t('guide.lang'))}">${langs}</span>
        <button class="btn small gfull" id="gFull" aria-label="${esc(t('guide.full'))}"
          data-tip="${esc(t('guide.fullTip'))}">${EXPAND_SVG}</button>
        <button class="btn small" id="gClose" title="${t('g.close')}" aria-label="${t('g.close')}">&#10005;</button>
      </span>
    </div>
    <div class="gtabs" role="tablist">${GUIDE_TABS.map(([k,lab])=>
      `<button role="tab" data-gtab="${k}" aria-selected="${k===guideTab}">${t(lab)}</button>`).join('')}</div>
    <div class="gbody guide">${zoom}${body}</div>
    <button type="button" class="gtop" id="gTop" aria-label="${esc(t('guide.top'))}"
      title="${esc(t('guide.top'))}" hidden>&#8593;</button>`;
  });
  box.querySelector('#gClose').onclick=()=>closeGuide();
  box.querySelector('#gFull').onclick=()=>openGuideTab();
  box.querySelectorAll('[data-gtab]').forEach(b=>b.onclick=()=>guideTo(b.dataset.gtab));
  box.querySelectorAll('[data-glang]').forEach(b=>b.onclick=()=>guideLangTo(b.dataset.glang));
  bindGuideHandle(box.querySelector('#gHandle'));
  const nb=box.querySelector('.gbody'); if(nb) nb.scrollTop=y;
  /* Der Weg zurück nach oben. Er zeigt sich erst, wenn es etwas
     zurückzurollen gibt — ein Knopf, der nichts täte, soll auch
     nicht dastehen. Gerollt wird der Textbereich, nicht die Seite:
     ein Anker wie auf der ganzen Seite ginge hier ins Leere. */
  const top=box.querySelector('#gTop');
  if(nb&&top){
    const sync=()=>{ top.hidden=nb.scrollTop<200; };
    nb.addEventListener('scroll',sync,{passive:true});
    top.onclick=()=>{ nb.scrollTo({top:0,behavior:'smooth'}); nb.focus&&nb.focus(); };
    sync();
  }
}

/* ── Der Griff an der linken Kante ────────────────────────────
   Mit der Maus ziehen, mit den Pfeiltasten in Schritten. Gemessen
   wird vom rechten Fensterrand aus — der Bereich klebt dort. */
function bindGuideHandle(h){
  if(!h) return;
  const move=e=>setGuideWidth(window.innerWidth-e.clientX);
  const up=()=>{
    document.body.classList.remove('gresize');
    removeEventListener('pointermove',move); removeEventListener('pointerup',up);
  };
  h.addEventListener('pointerdown',e=>{
    e.preventDefault();
    document.body.classList.add('gresize');
    addEventListener('pointermove',move); addEventListener('pointerup',up);
  });
  h.addEventListener('keydown',e=>{
    const step=e.shiftKey?80:24;
    if(e.key==='ArrowLeft'){ setGuideWidth(guideW+step); e.preventDefault(); }
    else if(e.key==='ArrowRight'){ setGuideWidth(guideW-step); e.preventDefault(); }
  });
}

/* Wird das Fenster kleiner, darf die Anleitung nicht mehr als
   zwei Drittel behalten. */
addEventListener('resize',()=>{ if(guideOpen()) setGuideWidth(guideW); });
