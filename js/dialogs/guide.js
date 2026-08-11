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

   Zwei Reiter, weil zwei ganz verschiedene Fragen gestellt
   werden:

   * „Schritt für Schritt" ist für den, der so etwas noch nie
     geführt hat. Er wird einmal von oben nach unten durchgearbeitet
     und endet mit dem Monatsrhythmus, den man danach wiederholt.
     Jeder Schritt sagt zuerst, was zu tun ist, dann warum, und
     zeigt ein Bild derselben Stelle.
   * „Was FINA kann" ist die Beschreibung für den, der weiß, was
     ein Kassenbuch ist, und wissen will, was diese Anwendung
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
<p class="glead">Never kept a cash book before? Work through this once, from top to bottom. Half
an hour, and your book is standing. Everything this leaves out is in
<b>${t('guide.tabProduct')}</b>.</p>

<h4>Before you start</h4>
<p>FINA is a book for <b>one year</b>, in <b>one file on your own computer</b>. No account, no
server. Nothing is saved by itself: your file is written when you press
<b>${t('app.save')}</b>.</p>
<p>Your money goes into three drawers:</p>
<ul>
  <li><b>${t('g.income')}</b> — wages, refunds, anything positive.</li>
  <li><b>${t('g.fixed')}</b> — bills that repeat and whose amount you know: rent, insurance, an
      instalment, a subscription. One item per contract.</li>
  <li><b>${t('g.flex')}</b> — everyday spending: groceries, fuel, going out. Not every purchase,
      just a handful of categories with one amount per month.</li>
</ul>
<p>Rule of thumb: a bill or a contract is a regular cost. What you spend in a shop is flexible.</p>

<h4>Step 1 — Start a book</h4>
${gshot('welcome','The first screen: open a file, or start from scratch')}
<p>With no file open you get two buttons. <b>${t('wel.open')}</b> takes a FINA file you saved
before. <b>${t('wel.new')}</b> begins an empty book.</p>
<p>Take <b>${t('wel.new')}</b>. FINA opens in <b>${t('view.jahr')}</b> — that is where you build
the book.</p>
<p>Do you already keep your book in a spreadsheet? Then you can read it in instead of typing it
again: <b>${t('app.settings')}</b>, section <b>${t('set.navImport')}</b>,
<b>${t('shInfo.title')}</b>. What the table has to look like is in
<b>${t('guide.tabProduct')}</b>. Steps 2 and 3 are still worth doing afterwards — the rest you can
skip.</p>

<h4>Step 2 — Year, language, opening balance</h4>
${gshot('set-general','Settings, section General')}
<p>Open <b>${t('app.settings')}</b>. Choose your language and type the year you are keeping the
book for. One file holds one year.</p>
<p>In the third field, <b>${t('set.opening')}</b>, type what was in your account before January.
Every balance in FINA then counts on from there. Leave it empty and the book starts at zero.</p>

<h4>Step 3 — Your accounts and your categories</h4>
${gshot('set-groups','Settings, section Regular categories')}
<p>Still in the settings. Under <b>${t('set.navBanks')}</b> name your accounts and how you pay.
Each entry has a short code — that is what the year table shows.</p>
<p>Under <b>${t('set.groups')}</b> there are two lists: income categories on the left, expense
categories on the right. Four to six each are plenty. <b>A name may appear only once across both
lists</b> — that is how FINA knows whether an item brings money in or costs it.</p>
<p>Under <b>${t('set.kak')}</b> name your everyday categories: Groceries, Fuel, Going out. Five to
eight.</p>
<p>Press <b>${t('g.save')}</b> in the window, then <b>${t('app.save')}</b> in the top bar. The
window only hands the change to the app; the top bar writes the file.</p>

<h4>Step 4 — Enter your income</h4>
<p>Press <b>${t('year.addIncome')}</b>. Give it a name (“Salary”) and fill the twelve boxes with
what you receive each month. Income is typed <b>without a sign</b>.</p>
<p>A refund or a bonus goes in the month it actually arrives, and nowhere else.</p>

<h4>Step 5 — Enter your bills</h4>
${gshot('item-dialog','The item window: who and what, the amounts, the ticks')}
<p>Press <b>${t('year.addItem')}</b>, one item per contract. At the top: name, category, account,
how it is paid, the day it is due. Pick a category — without one the item is not saved.</p>
<p>Under <b>${t('item.links')}</b> you can keep the pages that belong to the item: the contract,
the invoice, your customer account. Press the <b>+</b>, paste the address — the name fills itself
in, and you can overwrite it.</p>
<p>Below that, twelve boxes. <b>An expense is typed with a minus</b>: “-49,90”. Same amount every
month? Type it once in the quick entry and apply it to all of them. Clicking into a box selects
what is in it, so typing replaces it.</p>
<p>Under every month is a <b>tick</b>: “this one is settled”. It locks the amount. If a figure is
not fixed yet, tick <b>“${t('item.est')}”</b> instead — it then shows in yellow with a question
mark.</p>

<h4>Step 6 — Enter your everyday spending</h4>
${gshot('flex-dialog','The amounts window of a Flexible Payments category')}
<p>Press <b>${t('year.addKak')}</b>. Same window, only you are describing a category instead of a
contract. The name is the <b>heading</b> — click it to change it.</p>
<p>You cannot know these figures in advance, and you are not meant to. Put in what you expect,
tick <b>“${t('item.est')}”</b>, and correct it once the month is over.</p>

<h4>Step 7 — Your monthly routine</h4>
${gshot('month-out','The regular costs of one month')}
<p>This is the part you repeat. Once a month:</p>
<ol>
  <li>Open <b>${t('view.monat')}</b> and pick the month at the top.</li>
  <li>Tick off what has actually left your account.</li>
  <li>Correct anything that turned out different — remove the tick, type, tick again.</li>
  <li>Press <b>${t('app.save')}</b>.</li>
</ol>
<p><b>A guessed amount is not ticked off in passing.</b> Its seal opens the item instead, with
that month’s figure ready to correct. Put the real number in, tick the month there, save. Cancel
and nothing has changed — a guess should not become a fact unseen.</p>
<p>To change a row, take the pencil next to it or <b>double-click the amount or the name</b>. A
double-click on an amount marks that month in the window, so you find it again among the twelve.
To find something, just start typing — the first letter goes into the search field. While you
filter, every total counts what is left on screen, so you can read what a category costs without
adding it up yourself.</p>
${gshot('legend','The marks, as they appear below the month view')}
<p>Three marks, in every block: an <b>empty circle</b> is due, a <b>green</b> one is settled, a
<b>yellow</b> one means the amount is a guess. A row on <b>grey</b> has nothing left to pay this
year.</p>

<h4>Step 8 — Save, and keep the file safe</h4>
<p><b>${t('app.save')}</b> writes everything into your file. Chrome and Edge write back into the
same file; other browsers put a copy in your downloads folder, with the date and time in front of
the name so the newest is easy to spot.</p>
<p><b>${t('app.backup')}</b> makes such a dated copy on purpose, in every browser. Use it before
anything you are unsure about. It does not count as saving: the file you work in still has the
change ahead of it.</p>
<p>The file is plain text and yours alone. Copy it somewhere safe now and then — it is the only
place your figures exist.</p>

<h4>That is the whole book</h4>
<p>Everything else answers a question you have not asked yet: the year table, the forecast, the
filters, the notes, the two ways of bringing numbers in from outside. When you do ask it, it is all in
<b>${t('guide.tabProduct')}</b> above.</p>
`,

de:()=>`
<p class="glead">Noch nie ein Kassenbuch geführt? Arbeite das hier einmal von oben nach unten
durch. Eine halbe Stunde, und dein Buch steht. Alles, was hier fehlt, steht in
<b>${t('guide.tabProduct')}</b>.</p>

<h4>Bevor du anfängst</h4>
<p>FINA ist ein Buch für <b>genau ein Jahr</b>, in <b>einer einzigen Datei auf deinem eigenen
Rechner</b>. Kein Konto, kein Server. Von allein wird nichts gespeichert: geschrieben wird, wenn
du auf <b>${t('app.save')}</b> klickst.</p>
<p>Dein Geld liegt in drei Schubladen:</p>
<ul>
  <li><b>${t('g.income')}</b> — Lohn, Rückzahlungen, alles Positive.</li>
  <li><b>${t('g.fixed')}</b> — Rechnungen, die wiederkehren und deren Höhe du kennst: Miete,
      Versicherung, eine Rate, ein Abo. Je Vertrag eine Position.</li>
  <li><b>${t('g.flex')}</b> — die alltäglichen Ausgaben: Lebensmittel, Sprit, Ausgehen. Nicht
      jeder Einkauf, sondern eine Handvoll Kategorien mit je einem Betrag pro Monat.</li>
</ul>
<p>Faustregel: Eine Rechnung oder ein Vertrag sind regelmäßige Kosten. Was du im Laden ausgibst,
ist flexibel.</p>

<h4>Schritt 1 — Ein Buch anfangen</h4>
${gshot('welcome','Die erste Seite: Datei öffnen oder neu anfangen')}
<p>Ohne Datei bekommst du zwei Knöpfe. <b>${t('wel.open')}</b> nimmt eine FINA-Datei, die du schon
gespeichert hast. <b>${t('wel.new')}</b> fängt ein leeres Buch an.</p>
<p>Nimm <b>${t('wel.new')}</b>. FINA öffnet in <b>${t('view.jahr')}</b> — dort legst du das Buch
an.</p>
<p>Führst du dein Buch schon in einer Tabellenkalkulation? Dann kannst du sie einlesen, statt alles
noch einmal zu tippen: <b>${t('app.settings')}</b>, Bereich <b>${t('set.navImport')}</b>,
<b>${t('shInfo.title')}</b>. Wie die Tabelle aussehen muss, steht in
<b>${t('guide.tabProduct')}</b>. Schritt 2 und 3 lohnen sich danach trotzdem — den Rest kannst du
überspringen.</p>

<h4>Schritt 2 — Jahr, Sprache, Anfangsbestand</h4>
${gshot('set-general','Die Einstellungen, Bereich Allgemein')}
<p>Öffne <b>${t('app.settings')}</b>. Wähl die Sprache und trag das Jahr ein, für das du das Buch
führst. Eine Datei fasst ein Jahr.</p>
<p>Ins dritte Feld, <b>${t('set.opening')}</b>, trägst du ein, was vor dem Januar auf deinem Konto
lag. Jeder Kontostand in FINA rechnet von da an weiter. Lässt du es leer, fängt das Buch bei null
an.</p>

<h4>Schritt 3 — Deine Konten und deine Kategorien</h4>
${gshot('set-groups','Die Einstellungen, Bereich Regelmäßige Kategorien')}
<p>Weiter in den Einstellungen. Unter <b>${t('set.navBanks')}</b> benennst du deine Konten und
Zahlungswege. Jeder Eintrag hat ein kurzes Kürzel — das steht später in der Jahrestabelle.</p>
<p>Unter <b>${t('set.groups')}</b> stehen zwei Listen: links die Einnahme-Kategorien, rechts die
Ausgabe-Kategorien. Vier bis sechs je Seite genügen. <b>Ein Name darf über beide Listen hinweg nur
einmal vorkommen</b> — daran erkennt FINA, ob ein Posten Geld bringt oder kostet.</p>
<p>Unter <b>${t('set.kak')}</b> benennst du die Alltagskategorien: Lebensmittel, Sprit, Ausgehen.
Fünf bis acht.</p>
<p>Klick im Fenster auf <b>${t('g.save')}</b>, danach oben auf <b>${t('app.save')}</b>. Das Fenster
gibt die Änderung nur an die Anwendung weiter; geschrieben wird die Datei in der Kopfzeile.</p>

<h4>Schritt 4 — Einnahmen eintragen</h4>
<p>Klick auf <b>${t('year.addIncome')}</b>. Gib ihr einen Namen („Gehalt") und trag in die zwölf
Felder ein, was jeden Monat kommt. Einnahmen werden <b>ohne Vorzeichen</b> geschrieben.</p>
<p>Eine Rückzahlung oder eine Prämie steht in dem Monat, in dem sie kommt, und sonst nirgends.</p>

<h4>Schritt 5 — Rechnungen eintragen</h4>
${gshot('item-dialog','Das Posten-Fenster: wer und was, die Beträge, die Haken')}
<p>Klick auf <b>${t('year.addItem')}</b>, je Vertrag eine Position. Oben: Name, Kategorie, Konto,
Zahlungsart, Zahltag. Wähl eine Kategorie — ohne sie wird der Posten nicht gespeichert.</p>
<p>Unter <b>${t('item.links')}</b> sammelst du die Seiten, die dazugehören: den Vertrag, die
Rechnung, dein Kundenkonto. Klick auf das <b>+</b> und füg die Adresse ein — der Name trägt sich
selbst ein, und du kannst ihn überschreiben.</p>
<p>Darunter zwölf Felder. <b>Eine Ausgabe wird mit Minus geschrieben</b>: „-49,90". Jeden Monat
derselbe Betrag? Tipp ihn einmal in die schnelle Eingabe und übernimm ihn für alle. Ein Klick in
ein Feld markiert seinen Inhalt — tippen ersetzt ihn.</p>
<p>Unter jedem Monat steht ein <b>Haken</b>: „dieser ist erledigt". Er sperrt den Betrag. Steht
eine Zahl noch nicht fest, setz stattdessen den Haken bei <b>„${t('item.est')}"</b> — sie steht
dann gelb mit einem Fragezeichen da.</p>

<h4>Schritt 6 — Alltägliche Ausgaben eintragen</h4>
${gshot('flex-dialog','Das Beträge-Fenster einer Flexible-Payments-Kategorie')}
<p>Klick auf <b>${t('year.addKak')}</b>. Dasselbe Fenster, nur beschreibst du eine Kategorie statt
eines Vertrags. Die Bezeichnung ist die <b>Überschrift</b> — ein Klick darauf ändert sie.</p>
<p>Diese Zahlen kannst du nicht vorher wissen, und das sollst du auch nicht. Trag ein, womit du
rechnest, setz den Haken bei <b>„${t('item.est')}"</b>, und korrigier den Wert, wenn der Monat
vorbei ist.</p>

<h4>Schritt 7 — Dein Monatsrhythmus</h4>
${gshot('month-out','Die regelmäßigen Kosten eines Monats')}
<p>Nur das hier wiederholt sich. Einmal im Monat:</p>
<ol>
  <li>Öffne <b>${t('view.monat')}</b> und wähl oben den Monat.</li>
  <li>Hak ab, was tatsächlich vom Konto gegangen ist.</li>
  <li>Korrigier, was anders ausgefallen ist — Haken weg, tippen, Haken wieder setzen.</li>
  <li>Klick auf <b>${t('app.save')}</b>.</li>
</ol>
<p><b>Ein geschätzter Betrag wird nicht nebenbei abgehakt.</b> Sein Siegel öffnet stattdessen die
Position, und der Betrag dieses Monats steht markiert da. Trag die richtige Zahl ein, hak den
Monat dort ab, speichere. Wer abbricht, hat nichts geändert — aus einer Vermutung soll keine
Tatsache werden, ohne dass jemand hingesehen hat.</p>
<p>Zum Ändern nimmst du den Stift neben der Zeile oder machst einen <b>Doppelklick auf den Betrag
oder auf die Bezeichnung</b>. Der Doppelklick auf einen Betrag hebt diesen Monat im Fenster
hervor, damit du ihn unter zwölf Feldern wiederfindest. Zum Suchen tippst du einfach los — der
erste Buchstabe landet im Suchfeld. Solange du filterst, zählt jede Summe das, was auf dem Schirm
übrig bleibt — du liest also, was eine Kategorie kostet, ohne selbst zu addieren.</p>
${gshot('legend','Die Zeichen, wie sie unter der Monatsansicht stehen')}
<p>Drei Zeichen, in jedem Block: ein <b>leerer Kreis</b> ist fällig, ein <b>grüner</b> ist
erledigt, ein <b>gelber</b> heißt, der Betrag ist geschätzt. Eine Zeile auf <b>grauem Grund</b>
hat für dieses Jahr nichts mehr offen.</p>

<h4>Schritt 8 — Speichern und die Datei sichern</h4>
<p><b>${t('app.save')}</b> schreibt alles in deine Datei. Chrome und Edge schreiben in dieselbe
Datei zurück; andere Browser legen eine Kopie im Download-Ordner ab — mit Datum und Uhrzeit vor
dem Namen, damit die neueste zu erkennen ist.</p>
<p><b>${t('app.backup')}</b> legt so eine datierte Kopie mit Absicht an, in jedem Browser. Nimm
sie vor allem, was du dir nicht ganz zutraust. Als Speichern zählt sie nicht: die Datei, in der
du arbeitest, hat die Änderung danach immer noch vor sich.</p>
<p>Die Datei ist einfacher Text und gehört dir allein. Kopier sie ab und zu an einen sicheren Ort
— sie ist der einzige Ort, an dem deine Zahlen stehen.</p>

<h4>Das ist das ganze Buch</h4>
<p>Alles andere beantwortet eine Frage, die du noch nicht gestellt hast: die Jahrestabelle, die
Prognose, die Filter, die Notizen, die zwei Wege, Zahlen von außen hereinzuholen. Wenn du sie
stellst, steht die
Antwort oben unter <b>${t('guide.tabProduct')}</b>.</p>
`},

/* ── Reiter 2: Was FINA kann ───────────────────────────────── */
product:{

en:()=>`
<h4>What FINA is</h4>
<p>FINA is a cash book for one single year. You write down what comes in and what goes out, month
by month, and tick off what has actually been paid. In return it tells you at any moment how much
is left this month and how the year is going to end.</p>
<p>Everything lives in <b>one file on your own computer</b>. No account, no server. Nothing is sent
anywhere. The app only writes to that file when you press <b>${t('app.save')}</b>. Keep a copy
somewhere safe: it is the only place your figures exist.</p>
<p><b>The book starts from a figure you give it.</b> In <b>${t('app.settings')}</b>, right next to
the year, there is a field called <b>${t('set.opening')}</b>: what was in your account before
January.</p>
<p>Type 5.530,00 there and every balance in FINA counts on from 5.530,00. Income adds to it, costs
come off it, month after month. The timeline of a month, the course of the year in
<b>${t('view.prognose')}</b>, the balance at year end: all of them then show <i>your account</i>,
not just what this one year produced.</p>
<p>Leave the field empty and the book starts at zero. That is the honest answer as long as you
have not told it otherwise.</p>

<h4>The three kinds of money</h4>
<p>FINA sorts everything you have into three drawers. It helps to know which is which before you
start typing.</p>
<ul>
  <li><b>${t('g.income')}</b> — money coming in: wages, refunds, anything positive.</li>
  <li><b>${t('g.fixed')}</b> — the bills that repeat and whose amount you know in advance: rent,
      insurance, an instalment, a subscription. One item per contract.</li>
  <li><b>${t('g.flex')}</b> — everyday spending that changes from month to month: groceries,
      fuel, going out. You do not list every single purchase here. You keep a handful of
      <i>categories</i> and give each one an amount per month: either what you expect to spend, or
      what you really spent once you know it.</li>
</ul>
<p>Above all three sits a single row called <b>${t('bal.row')}</b>. It is there for the difference
that cannot be explained — a rounding error, a payment that never made it into the book. You put
the missing amount there and the balance is right again.</p>
<p>There is nothing to tick off on that row: the amount you type <i>is</i> the correction.</p>
${gshot('month-bal','The balance correction, above the income block')}

<h4>Getting started</h4>
<ol>
  <li>On the first screen press <b>${t('wel.open')}</b> and pick your file. Or press
      <b>${t('wel.new')}</b> to begin an empty book, which the first <b>${t('app.save')}</b> will
      then write to disk. That page is also what you see again after
      <b>${t('app.unlink')}</b>.</li>
  <li>Open <b>${t('app.settings')}</b>. Set the language, the year you are keeping the book for,
      and the <b>${t('set.opening')}</b> — what your account held before January. Under
      <b>${t('set.banks')}</b> and <b>${t('set.pays')}</b> you name your accounts and how you pay.
      Under <b>${t('set.groups')}</b> you decide how your bills are grouped (“Living”,
      “Insurance”, “Car” — whatever suits you). Under <b>${t('set.kak')}</b> you name the everyday
      categories.</li>
  <li>Now fill it: <b>${t('year.addKak')}</b> for an everyday category,
      <b>${t('year.addItem')}</b> for a bill that repeats, <b>${t('year.addIncome')}</b> for money
      coming in. The buttons sit in the month view and in the year view.</li>
  <li>Press <b>${t('app.save')}</b>. Nothing is stored automatically. While something is unsaved,
      the file name at the top is bold and red.</li>
</ol>
<p>With a file open FINA starts in the current month, with a fresh empty book in the year view. In
the month you work, in the year you build.</p>
${gshot('set-lists','Settings: every list has a code and a label of your own')}

<h4>Starting from your spreadsheet</h4>
<p>FINA grew out of a spreadsheet, and it can read one back in. Keep your book that way already?
Then you do not have to type it a second time: <b>${t('app.settings')}</b>, section
<b>${t('set.navImport')}</b>, <b>${t('shInfo.title')}</b>.</p>
<p>The table needs a header row with the twelve month names, one row per item, and twelve month
columns. In the narrow column behind each month a <b>/</b> marks the sum rows. That is how FINA
tells a heading from an item.</p>
<p><b>The structure is worked out, not guessed.</b> A heading is a row whose twelve figures are
exactly the sum of the rows below it. A CSV file has no indentation, but it has those sums.</p>
<p>Before anything changes, FINA puts its own reading next to the sum rows of your table and writes
<b>${t('sheet.ok')}</b> or <b>${t('sheet.off')}</b> beside each one. If one differs, a heading was
read as an item and its numbers would be counted twice. Better cancel and look at the table.</p>
<p>In the same step you say which sum row is your income, which is everyday spending and which are
the bills. FINA suggests, you decide.</p>
<p><b>A table is a whole cash book, not an addition to one.</b> It replaces what is in this file —
items, categories, Flexible Payments, the balance correction. Your ${t('set.opening')} stays: that
is a setting, not part of the year. You see what disappears before anything is changed.</p>
<p>Two things have no counterpart, and FINA says so rather than losing them quietly. The column
<code>P</code>, payments per year, is not taken over — the twelve monthly amounts say the same
thing and say it exactly. And a <code>Deadline</code> that is not a month — “variable”, “monthly” —
becomes a note on the item.</p>
<p>At the end two ticks: take the year from the table, and tick off the months that are over. What
is in the table has happened, so ticking it off means “this is how it was” — every month before the
current one, and all twelve in a year that is already past.</p>
<p>Afterwards, check it: the sum row of your table against <b>${t('year.totalRow')}</b> at the top
of the year view, month by month. If all twelve agree, the structure was read correctly and nothing
is counted twice.</p>

<h4>The views</h4>
<p>You reach each of them with a shortcut, from anywhere: <b>Ctrl/Cmd + Shift + M · Y · F ·
D</b> — month, year, forecast, details. The letters follow the English names and are the same in
both languages.</p>
<p><b>${t('view.monat')}</b> — one month, close up. This is where you work day to day. You see
every amount due, and you tick off what you have paid. The tabs above take you from month to
month.</p>
<p>At the top of the page sit the analytics line and, under it, one filter row for the whole
month: a search field, the due dates, the payment state. Both stay at the top of the screen while
you scroll, together with the heading of the block you are in.</p>
<p>Every block can be folded away with the arrow at the left of its heading. A row on grey is done
for this year. A double-click on an amount or on a name opens the item.</p>
${gshot('month-out','The month view, block by block')}
<p><b>${t('view.jahr')}</b> — the whole year as a table: one row per item, one column per month.
This is where you plan and where you spot the gaps.</p>
${gshot('year-left','The year table with the code columns B, PT, DD and LP')}
<p><b>${t('view.prognose')}</b> — how the year ends. It adds up what is still to come and shows
the balance you can expect on 31 December.</p>
${gshot('forecast','The forecast: every month up to the year-end balance')}
<p>It is <b>one table across the full width</b>: a row per month, short headings that explain
themselves when you point at them, the current month highlighted, the settled months pale.</p>
<p><b>Every row reads like a bank statement of that month:</b> <b>START</b> is the balance the
month finds on the account, then the four movements — income, regular costs, flexible payments,
correction — and <b>END</b> is what is left. END is the next month’s START, and in December it is
the balance at the year end.</p>
<p>Above January stands a row of its own, <b>${t('set.opening')}</b>. That is the money that was
already there before this book began — what last year left over. It is not a movement of any
month, so it gets its own row and its own colour, and every balance below counts on from it. You
type it in the settings; leave it at zero and the year simply starts at nothing.</p>
<p>On the right sits <b>${t('prog.colFlow')}</b> — the same waterfall as in the month view, only
over twelve months. Its grid lines carry their balance above them instead of a column heading, and
the axis begins where the first bar begins: an empty field would be nothing to read.</p>
<p>The assumption the forecast works from for the coming months is kept where the twelve months
are: in the category window, by pencil or double-click. The average of the months that are already
settled stands there in orange above the amount, so you have both in front of you while you
type.</p>
<p>And there is a fourth tab, <b>${t('view.kakeibo')}</b> — the everyday spending in detail: what
each category costs in the chosen period, and what it costs on average per month.</p>
<p>It only appears <b>once you have imported bookings</b> from Fast Budget, and it sits last,
after ${t('view.prognose')}. It reads exactly those bookings; without them it would show an empty
outline. It opens on the <b>whole year</b> and, on the right, with the <b>largest single
items</b> — the question you came with is where the money went, not what the first category in
the list did.</p>
<p>Mind the name: the tab is called ${t('view.kakeibo')}, while the kind of money keeps its own
name, <b>${t('g.flex')}</b>, in the blocks and categories everywhere else.</p>
${gshot('flex-view','Flexible Payments: spending by category')}
<p>In its left-hand card, in brackets behind every main category, it says where that figure comes
from. <b>${t('kak.kImp')}</b> from the import. <b>${t('kak.kCorr')}</b> where you overwrote an
imported month. <b>${t('kak.kDone')}</b> where you ticked one off. <b>${t('kak.kFix')}</b> for a
typed amount that is not an estimate. <b>${t('kak.kEst')}</b> for what is still open.</p>
<p>Over a whole year it counts the months per kind, the commonest first. The dropdown above picks
the period, and <b>${t('kak.cur')}</b> next to it takes you back to this month from
anywhere.</p>

<h4>The analytics area</h4>
<p>Above every month sits one thin line with the four figures of the month: what comes in, what the
everyday categories cost, what the bills cost, and what of that is <b>still open</b>.</p>
<p>There is no balance among them. A balance wants the other eleven months next to it to mean
anything; you find it in the year view and in the forecast. What this month does to your account
is what the timeline below says, row by row.</p>
<p><b>The four count the rows you can see.</b> Filter the month, and they follow — see
<i>Filtering and finding</i>.</p>
<p>Click anywhere on it and it opens. Below the figures a timeline appears that shows how your
balance moves through the month.</p>
${gshot('ui-analytics','The analytics area, opened: figures, timeline, filter row')}
<p>It starts closed on purpose. The line sticks to the top of the screen while you scroll, so
closed it costs one row instead of six. Once you open it, it stays open until you close it again.
That choice belongs to the screen and is not kept in the file.</p>
<p><b>Five rows, in the order the month runs.</b> First <b>${t('month.tlOpen')}</b>, what the
months before it left over. Then <b>${t('month.fDueA')}</b> (days 1–10),
<b>${t('month.fDueM')}</b> (11–20) and <b>${t('month.fDueE')}</b> (from the 21st). Finally
<b>${t('month.tlClose')}</b>. Every row names its days, what moved in it, and the balance
afterwards.</p>
<p><b>${t('month.tlOpen')} is not a period but a level:</b> the sum of the months before it in
this file. In January there is nothing to carry in. It is the only row that does not filter,
because nothing falls due in it.</p>
<p><b>${t('month.tlClose')} takes up everything without a payday:</b> the ${t('g.flex')}, the
balance correction, and every item you left without a due date. Its figure is therefore the
balance of the whole month.</p>
${gshot('ui-waterfall','The waterfall: every row starts where the row above it ended')}
<p><b>The bar is a waterfall.</b> The scale is the balance itself: the further right, the more is
left. Left of the line lies the red area, right of it the green one.</p>
<p>Every row starts at the balance of the row above it and ends at its own, the dark tick. In
between stands what made the difference. Money coming in grows to the right, money going out takes
it back to the left. Every piece is coloured by its kind: <b>green</b> ${t('g.income')},
<b>yellow</b> ${t('g.flex')}, <b>red</b> ${t('g.fixed')}, <b>blue</b> the balance
correction.</p>
<p>A row can do both. First the salary arrives, then the rent goes off. The bar then reaches past
its own result and comes back, so you can see how much came in and how much of it went straight
out again.</p>
<p>Hold the mouse over a colour and its amount appears. That is the only hint in this area; the
colours say the rest.</p>
<p>If your balance is far from zero — five figures on the account against four figures of movement
in the month — the scale is cut. Otherwise the movements would shrink to nothing. The first bar
then frays out towards the left, and the range it covers is printed under the chart.</p>
<p><b>A click filters.</b> Click a row and everything below shows only that part of the month.
That is the same as the due-date buttons in the filter row, only where you happen to be reading.
Click it again and the filter is off.</p>
<p>The timeline then shows that part alone: the other rows lie flat, because nothing you are
looking at moves in them. Only <b>${t('month.tlOpen')}</b> keeps its figure — that is where the
month starts, whatever you filter.</p>

<h4>A regular cost, step by step</h4>
<p>Click <b>${t('year.addItem')}</b>, or the little pencil next to an item that already exists.
The window that opens has three parts.</p>
<p><b>At the top, who and what:</b> the name, the group it belongs to, which account it is paid
from, how it is paid, and the day of the month it is due. And, if it ever stops, the month and
year of the last payment.</p>
<p>The group is not preselected. A new item asks for it, and without one it is not saved.</p>
<p><b>Under ${t('item.links')} live the pages that belong to the item</b> — the contract, the
invoice, your customer account. Up to ten of them. The <b>+</b> next to the heading adds one, the
pencil in a row changes it, the cross deletes it after asking. Drag a row by its handle to change
the order.</p>
<p>Every link has a name of your own. Paste an address and the name fills itself in from it —
telekom.de becomes “Telekom” — and you can overwrite it with anything you like. A link without a
name is not saved: the name field turns red until something stands in it. The name is all you see
later, so a link without one would be a line you cannot read.</p>
<p>In the month view, the year table and the details a <b>chain symbol</b> stands next to the row.
One link and it goes straight there; several and it opens a small list to choose from. That is why
the order matters: the first link is the one a single click reaches. Where an item has no link
yet, a <b>dash</b> stands instead — click it and the window opens ready to add one.</p>
<p><b>In the middle, the amounts:</b> twelve boxes, one per month. <b>An expense is written with a
minus sign</b>: “-49,90”. Income has no sign.</p>
<p>The sign shows while you type: <span class="neg">red</span> from the minus,
<span class="pos">green</span> from the plus. In the twelve boxes as in the quick entry, in closed
months just as in open ones.</p>
<p>If you would type the same amount into many months, use the quick entry above. Type the amount
once, choose how often it repeats and from which month, and press <b>${t('item.apply')}</b>.</p>
<p><b>Below every month, a tick:</b> it means “this one is settled”. A ticked month locks its
amount, so you cannot change it by accident. Untick it and you can type again.</p>
<p>Two buttons do this in bulk: one closes every month that is already over, the other reopens all
of them. The month you are currently in is deliberately left open, because it is not finished
yet.</p>
${gshot('item-dialog','The item window')}
<p>Is an amount not fixed yet — the electricity bill, roughly? Tick the box
<b>“${t('item.est')}”</b>. FINA then shows the figure in yellow with a question mark, so you can
see at a glance which numbers are guesses.</p>
<p><b>A guess is not ticked off in passing.</b> Click the seal of such a month in the month view
and FINA opens the item instead, with that month’s figure ready to correct. Put the real number
in, tick the month there, save. Cancel and nothing has changed — neither the figure nor the tick.
Taking a tick away needs no detour: that changes no number.</p>
<p>A <b>double-click on an amount</b> opens the item too, and marks that month with an orange
frame, so you find it again among the twelve. If the month is still open its figure stands ready
selected; if it is ticked, only the frame is there. Opening the item any other way marks
nothing.</p>
<p>At the bottom of the window, next to Cancel, stands <b>${t('item.dup')}</b>. It opens the same
window once more with a copy of what is currently typed: all the master data and all twelve
amounts, but not a single tick and no notes. So every month is editable straight away.</p>
<p>The copy is created with <b>${t('g.save')}</b> and not before. Cancelling leaves nothing
behind, and the original stays as it was in either case. The window for an everyday category has
the same button.</p>

<h4>Everyday spending</h4>
<p>Everyday spending works the same way, only with categories instead of contracts. Give a
category an amount per month and tick it off once the month is done.</p>
<p>If you cannot pin the figure down, an estimate is enough. FINA marks it as a guess. In the
month view that mark sits at the right-hand end of the row, because it says something about the
figure, not about the name.</p>
<p>If you use the <b>Fast Budget</b> app on your phone, you can save yourself the typing. Export
your transactions there as a CSV file and load it here with <b>${t('app.import')}</b>.</p>
<p>The button sits in <b>${t('app.settings')}</b>, in the section <b>${t('set.navImport')}</b>,
next to the other way in. It is not in the top bar. There it stood between opening and saving and
looked like a third way of opening a file — and it is not one. It changes the book you already have
open.</p>
<p>It opens with a short window naming the app the file comes from and the columns it must contain
(<code>Datum</code>, <code>Wert (EUR)</code>, <code>Hauptkategorie</code>). After that FINA reads
the file, shows you which months are in it, lets you deselect any of them, and tells you exactly
what it is about to overwrite.</p>
<p>Only the very last button changes anything, and the chosen months are <b>replaced, not added
to</b>. After that the app also knows your subcategories and every single booking behind them.</p>
<p>Both ways can live side by side. Months you imported show the real figures, months you did not
show the ones you typed. If an imported figure is wrong you can simply overwrite it. In the
amounts window that month then says <b>CORRECTED</b> in orange instead of IMPORTED, the moment you
type — and pointing at the word tells you what the imported figure was. The import is not lost.</p>

<h4>Reading the year table</h4>
<ul>
  <li>The narrow columns on the left carry the codes: <b>B</b> bank, <b>PT</b> payment type,
      <b>DD</b> due date, <b>LP</b> last payment.</li>
  <li>Every month has two columns: the amount, and a narrow one next to it for the mark. A
      <span class="mk-ok">✓</span> means paid. A <span class="mk-q">?</span> means the amount is
      still a guess. Empty means still open.</li>
  <li>Amounts are <span class="pos">green</span> when positive and <span class="neg">red</span>
      when negative, <span class="est">yellow</span> while they are only estimated.</li>
  <li>The column <b>${t('year.end')}</b> holds the last payment of an item. Its colour says how
      much of the term is left, the current month included:
      <span class="endkey e-now">this one only</span> <span class="endkey e-soon">2 to 3 months</span>
      <span class="endkey e-mid">4 to 6</span> <span class="endkey e-far">7 and more</span>. That way you
      see at a glance what is about to fall away.</li>
  <li>Rows on grey are done for this year — nothing is left to pay. They sink to the bottom of
      their group. <b>${t('year.hideSettled')}</b> hides them completely.</li>
  <li>A month whose name is struck through is fully ticked off. <b>${t('year.hideDone')}</b> folds
      those months away when you need the room; the total column keeps counting all twelve.</li>
  <li>Both buttons keep their label and show at a dark background that they are being applied; a
      second click switches them off. Neither is on to begin with, and both are stored in your
      file, so the table comes back the way you left it.</li>
  <li>The search field in the same bar filters every row of the table that has content and
      searches all twelve months, as far as you allow it to — see below. It shares its word with
      the month view. Hit the name of a block or of a category, and that block stands there
      whole.</li>
  <li><b>${t('year.totalRow')}</b> is what that month alone brings in and costs, added up. The
      three blocks below break it down. What is left on the account at the end of a month is in
      the forecast, under END. The total column carries the result of the year.</li>
  <li>That row belongs to the frame like the column headings and stays put whatever you type.</li>
  <li>The column headings, that row and the three block rows all stay at the top while you scroll.
      The table scrolls inside itself; sideways you move it with the bar above it, so nothing lies
      across your figures.</li>
  <li>Clicking a month name takes you into that month. A double-click on an amount or on the name
      opens the item, the same window as the pencil.</li>
</ul>

<h4>Filtering and finding</h4>
<p>Filtering never changes your file. It only decides which rows you are shown, and you can take it
back at any time.</p>
<p><b>The figures follow what is on screen.</b> Filter a month down to three rows, and the three
block totals, the category totals and the analytics line above them count those three. The year
table does the same: the block rows, the category rows and <b>${t('year.totalRow')}</b> add up what
is left standing. Switch the filter off and the full figures are back.</p>
<p>That way a filter answers a question. Search for a category and you read what it brings in and
what it costs, instead of a total that belongs to rows you cannot see.</p>
<p>Two things stay out of it. <b>${t('month.tlOpen')}</b>, the first row of the timeline, is the
level the month starts from — the months before it made that, and those you cannot filter. And the
forecast counts the whole book: there is nothing to filter there.</p>
<p><b>There are five filters, and they all apply at once.</b> What is left over satisfies every
one of them:</p>
<ul>
  <li><b>The search field</b>, in the month view and in the year view. See below.</li>
  <li><b>The due date</b> in the month view: ${t('month.fDueAll')}, ${t('due.A')}, ${t('due.M')},
      ${t('due.E')}, ${t('month.tlClose')}. The last one holds everything without a payday, which
      is where the Flexible Payments and the balance correction live.</li>
  <li><b>The payment state</b> in the month view: ${t('month.fAll')}, ${t('month.fOpen')},
      ${t('month.fEst')}, ${t('month.fPaid')}.</li>
  <li><b>The timeline</b>, when the analytics area is open. A click on one of its rows filters by
      that part of the month — the same thing the due-date buttons do, only from the graph.</li>
  <li><b>The two buttons of the year view</b>: <b>${t('year.hideDone')}</b> takes away the months
      in which nothing is left open, <b>${t('year.hideSettled')}</b> the items that are fully paid
      for this year. Unlike the others these two are <b>kept in your file</b>. They are a setting,
      not a handful of clicks, and the table comes back the way you left it.</li>
</ul>
<p>A button keeps its label and shows at its dark background that it is being applied; a second
click switches it off. In brackets it says how much it is hiding right now, and what a block is
hiding stands next to its heading as “(n hidden)”.</p>
<p><b>While you filter, every block stands open</b> and the fold arrow is gone. What you are
looking for should never hide in something you folded last week.</p>
<p>The month view and the year view share one search field, and they share its word: type it in
one and it still applies in the other.</p>
<p>It filters while you type, in parts of words and of figures, and without regard to capitals;
“1.234,56” and “1234.56” find the same row. In the month view it looks at the month on screen, in
the year view at all twelve. There, a hit on the name of a block or of a category shows that block
whole. Nothing in the file changes, only what you see.</p>
<p>In front of the field sits a small <b>&#9776;</b> button, and it decides <b>what the word is
looked for in</b>: <b>${t('flt.fName')}</b>, <b>${t('flt.fNote')}</b>, <b>${t('flt.fAmount')}</b>,
<b>${t('flt.fTotal')}</b>, <b>${t('flt.fMeta')}</b>.</p>
<p>Everything is ticked to begin with — that is the search that looks everywhere. Take entries out
and the filter narrows: only names, say, or only figures.</p>
<p><b>${t('g.save')}</b> keeps the choice, <b>${t('g.cancel')}</b> drops it. At least one entry
has to stay ticked. A filter with nothing to search would simply find nothing, so FINA says so in
red instead of saving.</p>
<p>Set apart under those five sits <b>${t('flt.fHidden')}</b>. It answers the other question: not
what is searched, but <b>where</b>.</p>
<p>Ticked, a search term beats every other filter. It also finds what the payment state, the due
date, <b>${t('year.hideSettled')}</b> or a month without an amount would otherwise keep out of
sight. Without a search term nothing changes.</p>
<p>The choice is part of your file, like the two buttons of the year view: set it once and it is
there again the next time you open the book. You can see it without opening the window, too — the
button stands on a dark background as long as the search is set to anything other than the
default.</p>
<p><b>Ways to the field and back out of it.</b> <b>Just start typing</b>: as long as you are not
in another field, the first letter goes into the search field and takes the cursor with it.</p>
<p>The <b>&#10005;</b> right of the field takes the whole filter back: search term, payment state
and due date at once. <b>Escape</b> does the same, as long as no window is open.</p>
<p>The cursor stays where you are typing. After a tick, a filter button, a change of month, a jump
out of the year table into a month, or a window you just saved, it returns to the field with the
term selected — as long as something is in it. An empty field is left alone. Opening a file clears
it, so a new book never appears through the filter of the old one.</p>

<h4>Notes</h4>
<p>The small lamp is a note. There are two kinds. The lamp <b>next to a name</b> holds a note
about the item itself and shows up wherever the item appears. The lamp <b>inside a month</b>
belongs to that one month only: “paid in cash”, “check the invoice”.</p>
<p>A lit lamp means there is a note. Hover over it to read it.</p>
<p>The lamps work before anything has been saved. A brand new item and a brand new category have
them from the moment their window opens. What you write there travels with the item when you save
it, and is dropped with it when you cancel.</p>
<p>A note keeps its lines. Where you start a new line, a new line is shown: in the bubble at the
lamp, in the two lines of preview under the name, and in the month cells of the edit window. A
note can be a list.</p>

<h4>This guide</h4>
<p>The orange <b>${t('app.guide')}</b> button opens and closes this panel. It stays open while you
carry on working in the table; the page next to it simply gets narrower. Drag its left edge to
change the width.</p>
<p>It has <b>a language of its own</b>. The two letters EN · DE in its header switch only what you
are reading — the app itself stays in the language from ${t('app.settings')}. With a file open the
guide comes up in that same language, so you normally never touch them.</p>
<p>Next to them sits a button that opens the guide <b>on a full page</b>, in a browser tab of its
own, with all three parts one after another. Reading a manual in a narrow column is work; this is
for when you really want to read it.</p>

<h4>Saving and safety</h4>
<p>Nothing is ever written by itself. <b>${t('app.save')}</b> writes everything into your file:
figures and settings. In Chrome and Edge it writes back into the very same file; other browsers
put a fresh copy in your downloads folder.</p>
<p>Such a copy carries <b>the date and time in front of its name</b> — “260809-142530 fina.json”.
In a folder full of them the newest is then simply the last, and you can see at a glance which is
which.</p>
<p><b>${t('app.backup')}</b> makes exactly such a dated copy on purpose, in every browser —
including Chrome and Edge, which otherwise only ever write into the one file and never leave a
second state behind. Use it before an import, before a big change, before anything you would not
want to redo. It does not count as saving: the file you work in still has the change ahead of
it.</p>
<p><b>${t('app.unlink')}</b> puts the file down and empties the screen. If anything is unsaved you
are warned first.</p>
<p>The file is plain text and yours alone. Copy it, back it up, take it to another computer. FINA
will read it there just the same.</p>
`,

de:()=>`
<h4>Was FINA ist</h4>
<p>FINA ist ein Kassenbuch für genau ein Jahr. Du trägst ein, was hereinkommt und was hinausgeht,
Monat für Monat, und hakst ab, was tatsächlich bezahlt ist. Dafür sagt dir die Anwendung
jederzeit, wie viel dir in diesem Monat bleibt und wie das Jahr ausgehen wird.</p>
<p>Alles steht in <b>einer einzigen Datei auf deinem eigenen Rechner</b>. Kein Konto, kein Server.
Es wird nichts irgendwohin geschickt. Geschrieben wird nur, wenn du auf <b>${t('app.save')}</b>
klickst. Bewahre eine Kopie der Datei auf: sie ist der einzige Ort, an dem deine Zahlen
stehen.</p>
<p><b>Das Buch fängt bei einer Zahl an, die du ihm gibst.</b> In <b>${t('app.settings')}</b>,
gleich neben dem Jahr, steht das Feld <b>${t('set.opening')}</b>: was vor dem Januar auf deinem
Konto lag.</p>
<p>Trägst du dort 5.530,00 ein, rechnet FINA ab 5.530,00 weiter. Einnahmen kommen dazu, Ausgaben
gehen ab, Monat für Monat. Der Zeitstrahl eines Monats, der Verlauf über das Jahr in
<b>${t('view.prognose')}</b>, der Saldo zum Jahresende: alle zeigen dann <i>dein Konto</i> und
nicht bloß das, was dieses eine Jahr hergegeben hat.</p>
<p>Lässt du das Feld leer, fängt das Buch bei null an. Das ist die ehrliche Antwort, solange du
nichts anderes gesagt hast.</p>

<h4>Die drei Arten von Geld</h4>
<p>FINA sortiert alles in drei Schubladen. Es hilft, sie vor dem ersten Eintrag zu kennen.</p>
<ul>
  <li><b>${t('g.income')}</b> — was hereinkommt: Lohn, Rückzahlungen, alles Positive.</li>
  <li><b>${t('g.fixed')}</b> — die Rechnungen, die wiederkehren und deren Höhe du vorher kennst:
      Miete, Versicherung, eine Rate, ein Abo. Je Vertrag eine Position.</li>
  <li><b>${t('g.flex')}</b> — die alltäglichen Ausgaben, die jeden Monat anders ausfallen:
      Lebensmittel, Sprit, Ausgehen. Hier wird nicht jeder einzelne Einkauf aufgeschrieben. Du
      pflegst eine Handvoll <i>Kategorien</i> und gibst jeder einen Betrag je Monat: entweder was
      du erwartest oder, sobald du es weißt, was es wirklich war.</li>
</ul>
<p>Über allen dreien steht eine einzelne Zeile namens <b>${t('bal.row')}</b>. Sie ist für die
Differenz da, die sich nicht erklären lässt: eine Rundung, eine Zahlung, die nie im Buch gelandet
ist. Du trägst den fehlenden Betrag dort ein, und der Saldo stimmt wieder.</p>
<p>Abgehakt wird diese Zeile nicht. Der Betrag, den du tippst, <i>ist</i> die Korrektur.</p>
${gshot('month-bal','Die Saldokorrektur, über dem Einnahmenblock')}

<h4>Die ersten Schritte</h4>
<ol>
  <li>Klick auf der ersten Seite auf <b>${t('wel.open')}</b> und wähle deine Datei. Oder nimm
      <b>${t('wel.new')}</b> für ein leeres Buch; das erste <b>${t('app.save')}</b> legt die Datei
      dann an. Dieselbe Seite siehst du nach <b>${t('app.unlink')}</b> wieder.</li>
  <li>Öffne <b>${t('app.settings')}</b>. Stell die Sprache ein, das Jahr, für das du das Buch
      führst, und den <b>${t('set.opening')}</b> — was vor dem Januar auf deinem Konto lag. Unter
      <b>${t('set.banks')}</b> und <b>${t('set.pays')}</b> benennst du deine Konten und
      Zahlungswege. Unter <b>${t('set.groups')}</b> legst du fest, wie deine Rechnungen gruppiert
      sind („Wohnen", „Versicherungen", „Auto" — ganz wie es dir passt). Unter
      <b>${t('set.kak')}</b> benennst du die Alltagskategorien.</li>
  <li>Jetzt füllst du es: <b>${t('year.addKak')}</b> für eine Alltagskategorie,
      <b>${t('year.addItem')}</b> für eine Rechnung, die wiederkehrt, <b>${t('year.addIncome')}</b>
      für Geld, das hereinkommt. Die Knöpfe gibt es in der Monats- und in der Jahresansicht.</li>
  <li>Klick auf <b>${t('app.save')}</b>. Von selbst wird nichts gespeichert. Solange etwas offen
      ist, steht der Dateiname oben fett und rot.</li>
</ol>
<p>Mit geladener Datei beginnt FINA im laufenden Monat, ohne Datei in der Jahresansicht. Im Monat
wird gearbeitet, im Jahr angelegt.</p>
${gshot('set-lists','Die Einstellungen: jede Liste hat ein eigenes Kürzel und eine Bezeichnung')}

<h4>Mit deiner Tabelle anfangen</h4>
<p>FINA ist aus einer Tabellenkalkulation entstanden, und es kann eine wieder einlesen. Führst du
dein Buch schon so? Dann musst du es nicht ein zweites Mal tippen:
<b>${t('app.settings')}</b>, Bereich <b>${t('set.navImport')}</b>,
<b>${t('shInfo.title')}</b>.</p>
<p>Die Tabelle braucht eine Kopfzeile mit den zwölf Monatsnamen, eine Zeile je Position und zwölf
Monatsspalten. In der schmalen Spalte hinter jedem Monat kennzeichnet ein <b>/</b> die
Summenzeilen. Daran erkennt FINA eine Überschrift.</p>
<p><b>Die Gliederung wird gerechnet, nicht geraten.</b> Eine Überschrift ist eine Zeile, deren
zwölf Zahlen genau die Summe der Zeilen darunter sind. Eine CSV-Datei kennt keine Einrückung, aber
diese Summen stehen darin.</p>
<p>Bevor sich etwas ändert, stellt FINA seine Lesart neben die Summenzeilen deiner Tabelle und
schreibt <b>${t('sheet.ok')}</b> oder <b>${t('sheet.off')}</b> daneben. Weicht eine ab, wurde eine
Überschrift als Position gelesen, und ihre Zahlen stünden doppelt da. Dann lieber abbrechen und in
die Tabelle sehen.</p>
<p>Im selben Schritt sagst du, welche Summenzeile deine Einnahmen sind, welche die alltäglichen
Ausgaben und welche die Rechnungen. FINA schlägt vor, du entscheidest.</p>
<p><b>Eine Tabelle ist ein ganzes Kassenbuch und kein Nachtrag.</b> Sie ersetzt, was in dieser
Datei steht — Positionen, Kategorien, Flexible Payments, die Saldokorrektur. Dein
${t('set.opening')} bleibt: das ist eine Einstellung und gehört nicht zum Jahr. Was verschwindet,
siehst du, bevor etwas geändert wird.</p>
<p>Zwei Dinge haben kein Gegenstück, und FINA sagt es, statt sie stillschweigend zu verlieren. Die
Spalte <code>P</code>, Zahlungen im Jahr, wird nicht übernommen — die zwölf Monatsbeträge sagen
dasselbe, und zwar genau. Und eine <code>Deadline</code>, die kein Monat ist — „Variabel", „mtl.
kündbar" —, wird zur Notiz der Position.</p>
<p>Am Ende zwei Haken: das Jahr aus der Tabelle übernehmen und die abgeschlossenen Monate abhaken.
Was in der Tabelle steht, ist geschehen; abhaken heißt also „so war es" — jeder Monat vor dem
laufenden, in einem vergangenen Jahr alle zwölf.</p>
<p>Danach die Probe: die Summenzeile deiner Tabelle gegen <b>${t('year.totalRow')}</b> ganz oben in
der Jahresansicht, Monat für Monat. Stimmen alle zwölf, ist die Gliederung richtig gelesen und
nichts doppelt gezählt.</p>

<h4>Die Ansichten</h4>
<p>Jede erreichst du von überall mit einem Tastengriff: <b>Strg/Cmd + Umschalt + M · Y · F ·
D</b> — Monat, Jahr, Prognose, Details. Die Buchstaben folgen den englischen Namen und sind in
beiden Sprachen dieselben.</p>
<p><b>${t('view.monat')}</b> — ein Monat aus der Nähe. Hier arbeitest du im Alltag: du siehst
jeden fälligen Betrag und hakst ab, was du bezahlt hast. Über die Reiter darüber gehst du von
Monat zu Monat.</p>
<p>Ganz oben stehen die Auswertungszeile und darunter eine Filterzeile für den ganzen Monat:
Suchfeld, Fälligkeit, Zahlungsstand. Beide bleiben beim Scrollen oben stehen, zusammen mit der
Überschrift des Blocks, in dem du gerade liest.</p>
<p>Jeden Block kannst du mit dem Pfeil links in seiner Überschrift oder einem Doppelklick darauf
zuklappen. Eine Zeile auf grauem Grund ist für dieses Jahr erledigt. Ein Doppelklick auf den
Betrag oder auf die Bezeichnung öffnet die Position.</p>
${gshot('month-out','Die Monatsansicht, Block für Block')}
<p><b>${t('view.jahr')}</b> — das ganze Jahr als Tabelle: je Position eine Zeile, je Monat eine
Spalte. Hier planst du, und hier fallen dir Lücken auf.</p>
${gshot('year-left','Die Jahrestabelle mit den Kürzelspalten B, PT, DD und LP')}
<p><b>${t('view.prognose')}</b> — wie das Jahr ausgeht. Sie rechnet zusammen, was noch kommt, und
zeigt den Saldo, der am 31. Dezember zu erwarten ist.</p>
${gshot('forecast','Die Prognose: jeder Monat bis zum Saldo am Jahresende')}
<p>Sie ist <b>eine Tabelle über die volle Breite</b>: eine Zeile je Monat, kurze Überschriften mit
Erklärung beim Überfahren, der laufende Monat hervorgehoben, die abgerechneten Monate blass.</p>
<p><b>Jede Zeile liest sich wie ein Kontoauszug dieses Monats:</b> <b>START</b> ist der Stand, den
der Monat auf dem Konto vorfindet, dann die vier Bewegungen — Einnahmen, regelmäßige Kosten,
Flexible Payments, Korrektur — und <b>END</b> ist, was übrig bleibt. END ist der START des
nächsten Monats, im Dezember der Stand zum Jahresende.</p>
<p>Über dem Januar steht eine eigene Zeile, <b>${t('set.opening')}</b>. Das ist das Geld, das schon
da war, bevor dieses Buch anfing — was das letzte Jahr übrig gelassen hat. Es ist keine Bewegung
eines Monats, deshalb bekommt es eine eigene Zeile und eine eigene Farbe, und jeder Kontostand
darunter rechnet von ihm aus weiter. Eingetragen wird es in den Einstellungen; lässt du es auf
null, fängt das Jahr eben bei nichts an.</p>
<p>Ganz rechts steht der <b>${t('prog.colFlow')}</b> — derselbe Wasserfall wie im Monat, nur über
zwölf Monate. Seine Rasterlinien tragen statt einer Spaltenüberschrift ihren Kontostand über sich,
und die Achse fängt dort an, wo der erste Balken anfängt: ein leeres Feld gäbe nichts zu lesen.</p>
<p>Die Annahme, mit der die Prognose für die kommenden Monate rechnet, wird dort gepflegt, wo die
zwölf Monate stehen: im Fenster der Kategorie, über Stift oder Doppelklick. Der Mittelwert der
Monate, die schon feststehen, steht dort orange über dem Betrag. Du hast beim Eintragen also
beides vor dir.</p>
<p>Und es gibt einen vierten Reiter, <b>${t('view.kakeibo')}</b> — die alltäglichen Ausgaben im
Einzelnen: was jede Kategorie im gewählten Zeitraum kostet und was sie im Schnitt je Monat
kostet.</p>
<p>Ihn gibt es <b>nur mit importierten Buchungen</b> aus Fast Budget, und er steht als letzter,
hinter der ${t('view.prognose')}. Er wertet genau diese Buchungen aus, ohne sie stünde dort eine
leere Gliederung. Er geht mit dem <b>ganzen Jahr</b> auf und rechts mit den <b>größten
Einzelposten</b> — die Frage, mit der man herkommt, lautet „wohin ist das Geld gegangen" und nicht
„was hat die erste Kategorie der Liste gemacht".</p>
<p>Achte auf den Namen: der Reiter heißt ${t('view.kakeibo')}, die Art von Geld behält überall
sonst ihren eigenen — <b>${t('g.flex')}</b>.</p>
${gshot('flex-view','Flexible Payments: die Ausgaben je Kategorie')}
<p>In seiner linken Karte steht in Klammern hinter jeder Hauptkategorie, woher die Zahl stammt.
<b>${t('kak.kImp')}</b> aus dem Import. <b>${t('kak.kCorr')}</b>, wo du einen importierten Monat
überschrieben hast. <b>${t('kak.kDone')}</b>, wo du abgehakt hast. <b>${t('kak.kFix')}</b> für
einen eingetippten Betrag, der keine Schätzung ist. <b>${t('kak.kEst')}</b> für das, was noch
offen ist.</p>
<p>Über ein ganzes Jahr werden die Monate je Art gezählt, die häufigste zuerst. Den Zeitraum
wählst du oben in der Liste; <b>${t('kak.cur')}</b> daneben bringt dich von überall in diesen
Monat zurück.</p>

<h4>Der Auswertungsbereich</h4>
<p>Über jedem Monat steht eine dünne Zeile mit den vier Zahlen des Monats: was hereinkommt, was die
alltäglichen Kategorien kosten, was die Rechnungen kosten und was davon <b>noch offen</b> ist.</p>
<p>Ein Kontostand steht nicht dabei. Ein Kontostand sagt erst etwas, wenn die elf anderen Monate
danebenstehen; den findest du in der Jahresansicht und in der Prognose. Was dieser Monat mit deinem
Konto macht, sagt der Zeitstrahl darunter, Zeile für Zeile.</p>
<p><b>Die vier zählen die Zeilen, die du siehst.</b> Filter den Monat, und sie rechnen mit — siehe
<i>Filtern und wiederfinden</i>.</p>
<p>Ein Klick irgendwo darauf klappt sie auf. Unter den Zahlen erscheint ein Zeitstrahl, der zeigt,
wie sich dein Kontostand durch den Monat bewegt.</p>
${gshot('ui-analytics','Der Auswertungsbereich, aufgeklappt: Zahlen, Zeitstrahl, Filterzeile')}
<p>Zugeklappt ist Absicht. Die Zeile klebt beim Scrollen oben am Bildschirm; zugeklappt kostet sie
eine Zeile statt sechs. Einmal aufgeklappt bleibt sie offen, bis du sie wieder zuklappst. Das
gehört zur Anzeige und wird nicht in der Datei gespeichert.</p>
<p><b>Fünf Zeilen in der Reihenfolge des Monats.</b> Zuerst <b>${t('month.tlOpen')}</b>, was die
Monate davor übrig gelassen haben. Dann <b>${t('month.fDueA')}</b> (1. bis 10.),
<b>${t('month.fDueM')}</b> (11. bis 20.) und <b>${t('month.fDueE')}</b> (ab dem 21.). Zuletzt
<b>${t('month.tlClose')}</b>. Jede Zeile nennt ihre Tage, was sich in ihr bewegt hat, und den
Kontostand danach.</p>
<p><b>${t('month.tlOpen')} ist kein Zeitraum, sondern ein Stand:</b> die Summe der Monate davor in
dieser Datei. Im Januar kommt also nichts mit. Es ist die einzige Zeile, die nicht filtert, denn
fällig wird in ihr nichts.</p>
<p><b>${t('month.tlClose')} nimmt alles ohne Zahltag auf:</b> die ${t('g.flex')}, die
Saldokorrektur und jeden Posten, bei dem du keine Fälligkeit eingetragen hast. Ihre Zahl ist
deshalb der Saldo des ganzen Monats.</p>
${gshot('ui-waterfall','Der Wasserfall: jede Zeile fängt dort an, wo die Zeile darüber aufgehört hat')}
<p><b>Der Balken ist ein Wasserfall.</b> Der Maßstab ist der Kontostand selbst: je weiter rechts,
desto mehr bleibt übrig. Links der Linie liegt der rote Bereich, rechts der grüne.</p>
<p>Jede Zeile fängt beim Kontostand der Zeile darüber an und endet bei ihrem eigenen, dem
kräftigen Strich. Dazwischen steht, was den Unterschied gemacht hat. Die Zufuhr wächst nach
rechts, der Abzug holt sie nach links zurück. Jeder Anteil trägt die Farbe seiner Art:
<b>grün</b> ${t('g.income')}, <b>gelb</b> ${t('g.flex')}, <b>rot</b> ${t('g.fixed')},
<b>blau</b> die Saldokorrektur.</p>
<p>Eine Zeile kann beides. Erst kommt das Gehalt, dann geht die Miete ab. Der Balken reicht dann
über sein eigenes Ergebnis hinaus und kommt zurück. So siehst du, wie viel hereinkam und wie viel
davon gleich wieder abging.</p>
<p>Führ die Maus über eine Farbe, und ihr Betrag erscheint. Das ist der einzige Hinweis in diesem
Bereich, den Rest sagen die Farben.</p>
<p>Liegt dein Kontostand weit von der Null entfernt — fünfstellig auf dem Konto gegen vierstellige
Bewegungen im Monat —, wird der Maßstab beschnitten. Sonst schrumpften die Bewegungen zu nichts
zusammen. Der erste Balken franst dann nach links aus, und unter der Grafik steht, welchen Bereich
sie zeigt.</p>
<p><b>Ein Klick filtert.</b> Klick auf eine Zeile, und alles darunter zeigt nur noch diesen Teil
des Monats. Das ist dasselbe wie die Fälligkeitsknöpfe in der Filterzeile, nur an der Stelle, an
der du gerade liest. Ein zweiter Klick nimmt den Filter wieder zurück.</p>
<p>Der Zeitstrahl zeigt dann nur noch diesen Teil: die anderen Zeilen liegen flach, weil sich in
ihnen nichts bewegt, was du gerade ansiehst. Nur <b>${t('month.tlOpen')}</b> behält seine Zahl —
dort fängt der Monat an, egal was du filterst.</p>

<h4>Regelmäßige Kosten, Schritt für Schritt</h4>
<p>Klick auf <b>${t('year.addItem')}</b> oder auf den kleinen Stift neben einer vorhandenen
Position. Das Fenster, das aufgeht, hat drei Teile.</p>
<p><b>Oben, wer und was:</b> der Name, die Gruppe, zu der die Position gehört, von welchem Konto
sie abgeht, wie bezahlt wird und an welchem Tag im Monat sie fällig ist. Und, falls sie einmal
endet, Monat und Jahr der letzten Zahlung.</p>
<p><b>Unter ${t('item.links')} stehen die Seiten, die dazugehören</b> — der Vertrag, die Rechnung,
dein Kundenkonto. Bis zu zehn. Das <b>+</b> neben der Überschrift legt einen an, der Stift in der
Zeile ändert ihn, das Kreuz löscht ihn nach Rückfrage. Am Griff ziehst du eine Zeile an eine
andere Stelle.</p>
<p>Jeder Link hat einen Namen, den du vergibst. Fügst du eine Adresse ein, trägt er sich selbst
ein — aus telekom.de wird „Telekom" —, und du kannst ihn überschreiben. Ohne Namen wird ein Link
nicht gespeichert: das Namensfeld bleibt rot umrandet, bis etwas darin steht. Später siehst du nur
noch den Namen — ein Link ohne ihn wäre eine Zeile, die man nicht lesen kann.</p>
<p>In Monatsansicht, Jahrestabelle und Details steht neben der Zeile ein <b>Kettensymbol</b>. Bei
einem Link führt es direkt hin, bei mehreren öffnet es eine kleine Auswahl. Deshalb zählt die
Reihenfolge: der erste Link ist der, den ein Klick erreicht. Wo noch kein Link steht, steht ein
<b>Strich</b> — ein Klick darauf öffnet das Fenster gleich zum Anlegen.</p>
<p>Die Gruppe ist nicht vorausgewählt. Eine neue Position fragt danach und wird ohne sie nicht
gespeichert.</p>
<p><b>In der Mitte die Beträge:</b> zwölf Felder, eines je Monat. <b>Eine Ausgabe wird mit Minus
geschrieben</b>: „-49,90". Einnahmen bekommen kein Vorzeichen.</p>
<p>Das Vorzeichen zeigt sich beim Tippen: <span class="neg">rot</span> ab Minus,
<span class="pos">grün</span> ab Plus. In den zwölf Feldern wie in der schnellen Eingabe, im
abgeschlossenen Monat wie im offenen.</p>
<p>Wenn derselbe Betrag in viele Monate soll, nimm die schnelle Eingabe darüber: Betrag einmal
eintippen, Wiederholung und Startmonat wählen, auf <b>${t('item.apply')}</b> klicken.</p>
<p><b>Unter jedem Monat ein Haken:</b> er heißt „dieser ist erledigt". Ein abgehakter Monat sperrt
seinen Betrag, damit er nicht aus Versehen verrutscht. Haken weg, und du kannst wieder tippen.</p>
<p>Zwei Knöpfe erledigen das in einem Rutsch: der eine schließt alle Monate ab, die schon vorbei
sind, der andere öffnet sie alle wieder. Der laufende Monat bleibt mit Absicht offen, denn er ist
noch nicht zu Ende.</p>
${gshot('item-dialog','Das Posten-Fenster')}
<p>Steht ein Betrag noch nicht fest — die Stromrechnung, ungefähr? Dann setz den Haken bei
<b>„${t('item.est')}"</b>. FINA zeigt die Zahl daraufhin gelb mit einem Fragezeichen, du siehst
also auf einen Blick, welche Zahlen geschätzt sind.</p>
<p><b>Eine Schätzung wird nicht nebenbei abgehakt.</b> Klickst du in der Monatsansicht auf das
Siegel eines solchen Monats, öffnet FINA stattdessen die Position, und der Betrag dieses Monats
steht bereit. Trag die richtige Zahl ein, hak den Monat dort ab, speichere. Wer abbricht, hat
nichts geändert — weder die Zahl noch den Haken. Einen Haken wegzunehmen braucht keinen Umweg:
das ändert keine Zahl.</p>
<p>Ein <b>Doppelklick auf einen Betrag</b> öffnet die Position ebenfalls und umrandet diesen Monat
orange, damit du ihn unter zwölf Feldern wiederfindest. Ist der Monat noch offen, steht sein
Betrag markiert da; ist er abgehakt, bleibt es beim Rahmen. Öffnest du die Position anders, ist
nichts markiert.</p>
<p>Unten im Fenster, neben „Abbrechen", steht <b>${t('item.dup')}</b>. Der Knopf öffnet dasselbe
Fenster noch einmal mit einer Kopie des gerade Getippten: alle Stammdaten und alle zwölf Beträge,
aber kein einziger Haken und keine Notiz. Jeder Monat ist damit sofort änderbar.</p>
<p>Angelegt wird die Kopie erst mit <b>${t('g.save')}</b>. Wer abbricht, hinterlässt nichts, und
die Vorlage bleibt in beiden Fällen, wie sie war. Das Fenster einer Alltagskategorie hat denselben
Knopf.</p>

<h4>Die alltäglichen Ausgaben</h4>
<p>Die alltäglichen Ausgaben laufen genauso, nur mit Kategorien statt Verträgen. Gib einer
Kategorie einen Betrag je Monat und hak sie ab, wenn der Monat durch ist.</p>
<p>Wer sich nicht festlegen mag, trägt eine Schätzung ein. FINA kennzeichnet sie als solche. In
der Monatsansicht steht diese Marke am rechten Ende der Zeile, denn sie sagt etwas über die Zahl,
nicht über den Namen.</p>
<p>Wenn du auf dem Handy die App <b>Fast Budget</b> benutzt, kannst du dir das Tippen sparen.
Exportiere dort deine Transaktionen als CSV-Datei und lade sie hier über
<b>${t('app.import')}</b>.</p>
<p>Der Knopf steht in den <b>${t('app.settings')}</b>, im Bereich <b>${t('set.navImport')}</b>,
neben dem anderen Weg hinein. In der Kopfzeile steht er nicht mehr. Dort saß er zwischen Öffnen und
Speichern und sah aus wie ein dritter Weg, eine Datei zu öffnen — und das ist er nicht. Er ändert
das Buch, das schon offen ist.</p>
<p>Er öffnet zuerst ein kurzes Fenster mit der App, aus der die Datei kommt, und den Spalten, die
darin stehen müssen (<code>Datum</code>, <code>Wert (EUR)</code>, <code>Hauptkategorie</code>).
Danach liest FINA die Datei, zeigt dir, welche Monate darin stehen, lässt dich einzelne abwählen
und sagt dir genau, was überschrieben wird.</p>
<p>Erst der allerletzte Knopf ändert etwas, und die gewählten Monate werden <b>ersetzt, nicht
ergänzt</b>. Danach kennt die Anwendung auch deine Unterkategorien und jede einzelne Buchung
dahinter.</p>
<p>Beide Wege vertragen sich: importierte Monate zeigen die echten Zahlen, die übrigen deine
eigenen. Ist ein importierter Wert falsch, überschreib ihn einfach. Im Beträge-Fenster steht bei
diesem Monat dann <b>CORRECTED</b> in Orange statt IMPORTED, und zwar sofort beim Tippen — und
wenn du über das Wort fährst, steht dort, was importiert war. Der Import geht nicht verloren.</p>

<h4>Die Jahrestabelle lesen</h4>
<ul>
  <li>Die schmalen Spalten links tragen die Kürzel: <b>B</b> Bank, <b>PT</b> Zahlungsart,
      <b>DD</b> Fälligkeit, <b>LP</b> letzte Zahlung.</li>
  <li>Jeder Monat hat zwei Spalten: den Betrag und daneben eine schmale für das Zeichen. Ein
      <span class="mk-ok">✓</span> heißt bezahlt. Ein <span class="mk-q">?</span> heißt, der
      Betrag ist noch geschätzt. Leer heißt offen.</li>
  <li>Beträge sind <span class="pos">grün</span> im Plus und <span class="neg">rot</span> im
      Minus, <span class="est">gelb</span>, solange sie nur geschätzt sind.</li>
  <li>Die Spalte <b>${t('year.end')}</b> enthält die letzte Zahlung einer Position. Ihre Farbe
      sagt, wie viel Laufzeit noch bleibt, den laufenden Monat mitgezählt:
      <span class="endkey e-now">nur noch dieser</span> <span class="endkey e-soon">2 bis 3 Monate</span>
      <span class="endkey e-mid">4 bis 6</span> <span class="endkey e-far">7 und mehr</span>. So siehst du
      auf einen Blick, was demnächst wegfällt.</li>
  <li>Grau hinterlegte Zeilen sind für dieses Jahr erledigt — dort steht nichts mehr aus. Sie
      rutschen ans Ende ihrer Gruppe. <b>${t('year.hideSettled')}</b> blendet sie ganz aus.</li>
  <li>Ein durchgestrichener Monatsname heißt: vollständig abgehakt. <b>${t('year.hideDone')}</b>
      klappt solche Monate weg, wenn du Platz brauchst; die Gesamtspalte zählt weiter alle
      zwölf.</li>
  <li>Beide Knöpfe behalten ihre Beschriftung und zeigen am dunklen Grund, dass sie gelten; ein
      zweiter Klick schaltet sie ab. Keiner ist zu Anfang an, und beide stehen in deiner Datei —
      die Tabelle sieht beim nächsten Öffnen aus wie beim Zumachen.</li>
  <li>Das Suchfeld in derselben Leiste filtert jede Zeile der Tabelle, in der etwas steht, und
      sucht über alle zwölf Monate, soweit du es zulässt (siehe unten). Es teilt sein Wort mit der
      Monatsansicht. Triffst du den Namen eines Blocks oder einer Kategorie, steht dieser Block
      ganz da.</li>
  <li><b>${t('year.totalRow')}</b> ist das, was der Monat allein bringt und kostet,
      zusammengezählt. Die drei Blöcke darunter schlüsseln es auf. Was am Monatsende auf dem Konto
      liegt, steht in der Prognose unter END. Die Gesamtspalte trägt das Ergebnis des Jahres.</li>
  <li>Diese Zeile gehört zum Gerüst wie die Spaltenköpfe und bleibt stehen, ganz gleich, was du
      tippst.</li>
  <li>Spaltenköpfe, diese Zeile und die drei Blockzeilen bleiben beim Scrollen oben stehen. Die
      Tabelle rollt in sich selbst; zur Seite schiebst du sie an der Leiste über ihr, damit nichts
      quer über deinen Zahlen liegt.</li>
  <li>Ein Klick auf einen Monatsnamen bringt dich in diesen Monat. Ein Doppelklick auf einen
      Betrag oder auf die Bezeichnung öffnet die Position — dasselbe Fenster wie der Stift.</li>
</ul>

<h4>Filtern und wiederfinden</h4>
<p>Filtern ändert nie deine Datei. Es entscheidet nur, welche Zeilen du zu sehen bekommst, und du
kannst es jederzeit zurücknehmen.</p>
<p><b>Die Zahlen rechnen über das, was dasteht.</b> Filter einen Monat auf drei Zeilen herunter,
und die drei Bereichssummen, die Kategoriesummen und die Auswertungszeile darüber zählen diese
drei. In der Jahrestabelle genauso: die Blockzeilen, die Kategoriezeilen und
<b>${t('year.totalRow')}</b> summieren, was stehen geblieben ist. Nimm den Filter weg, und überall
steht wieder die volle Zahl.</p>
<p>So beantwortet ein Filter eine Frage. Such nach einer Kategorie, und du liest, was sie einbringt
und was sie kostet — statt einer Summe, die zu Zeilen gehört, die du gerade nicht siehst.</p>
<p>Zwei Dinge bleiben außen vor. <b>${t('month.tlOpen')}</b>, die erste Zeile des Zeitstrahls, ist
der Stand, mit dem der Monat anfängt — den machen die Monate davor, und die filtert niemand. Und
die Prognose rechnet über das ganze Buch: dort gibt es nichts zu filtern.</p>
<p><b>Es gibt fünf Filter, und sie gelten alle gleichzeitig.</b> Was übrig bleibt, erfüllt jeden
davon:</p>
<ul>
  <li><b>Das Suchfeld</b>, in der Monats- wie in der Jahresansicht. Siehe unten.</li>
  <li><b>Die Fälligkeit</b> in der Monatsansicht: ${t('month.fDueAll')}, ${t('due.A')},
      ${t('due.M')}, ${t('due.E')}, ${t('month.tlClose')}. Der letzte fasst alles ohne Zahltag,
      also die Flexible Payments und die Saldokorrektur.</li>
  <li><b>Der Zahlungsstand</b> in der Monatsansicht: ${t('month.fAll')}, ${t('month.fOpen')},
      ${t('month.fEst')}, ${t('month.fPaid')}.</li>
  <li><b>Der Zeitstrahl</b>, wenn die Auswertung offen ist. Ein Klick auf eine seiner Zeilen
      filtert auf diesen Teil des Monats — dasselbe, was die Fälligkeitsknöpfe tun, nur aus der
      Grafik heraus.</li>
  <li><b>Die beiden Knöpfe der Jahresansicht</b>: <b>${t('year.hideDone')}</b> nimmt die Monate
      weg, in denen nichts mehr offen ist, <b>${t('year.hideSettled')}</b> die Positionen, die für
      dieses Jahr abbezahlt sind. Anders als die übrigen stehen diese beiden <b>in deiner
      Datei</b>. Sie sind eine Einstellung und keine Handgriffe, und die Tabelle sieht beim
      nächsten Öffnen aus wie beim Zumachen.</li>
</ul>
<p>Ein Knopf behält seine Beschriftung und zeigt am dunklen Grund, dass er gerade gilt; ein
zweiter Klick schaltet ihn ab. In Klammern steht, wie viel er gerade versteckt, und was ein Block
versteckt, steht als „(n ausgeblendet)" neben seiner Überschrift.</p>
<p><b>Solange du filterst, steht jeder Block offen</b> und der Klapp-Pfeil ist weg. Was du suchst,
soll sich nicht in etwas verstecken, das du letzte Woche zugeklappt hast.</p>
<p>Monats- und Jahresansicht teilen sich ein Suchfeld, und sie teilen sich sein Wort: was du in
der einen tippst, gilt in der anderen weiter.</p>
<p>Es filtert beim Tippen, in Wortteilen und Zahlstücken und ohne Rücksicht auf Groß- und
Kleinschreibung; „1.234,56" und „1234.56" finden dieselbe Zeile. In der Monatsansicht sieht es in
den Monat auf dem Schirm, in der Jahresansicht in alle zwölf. Dort steht ein Block ganz da, wenn
sein Name oder der einer Kategorie trifft. In der Datei ändert sich dabei nichts, nur das, was du
siehst.</p>
<p>Vor dem Feld steht ein kleiner <b>&#9776;</b>-Knopf, und der entscheidet, <b>worin</b> gesucht
wird: <b>${t('flt.fName')}</b>, <b>${t('flt.fNote')}</b>, <b>${t('flt.fAmount')}</b>,
<b>${t('flt.fTotal')}</b>, <b>${t('flt.fMeta')}</b>.</p>
<p>Anfangs ist alles angekreuzt — das ist die Suche, die überall hinsieht. Nimm Angaben heraus,
und der Filter wird enger: nur die Namen etwa, oder nur die Zahlen.</p>
<p><b>${t('g.save')}</b> behält die Wahl, <b>${t('g.cancel')}</b> verwirft sie. Mindestens eine
Angabe muss angekreuzt bleiben. Ein Filter ohne etwas zu durchsuchen fände schlicht nie etwas,
deshalb sagt FINA es in Rot, statt zu speichern.</p>
<p>Abgesetzt unter den fünfen steht <b>${t('flt.fHidden')}</b>. Er beantwortet die andere Frage:
nicht, worin gesucht wird, sondern <b>wo</b>.</p>
<p>Angekreuzt schlägt ein Suchbegriff jeden anderen Filter. Er findet auch, was Zahlungsstand,
Fälligkeit, <b>${t('year.hideSettled')}</b> oder ein Monat ohne Betrag sonst verbergen. Ohne
Suchbegriff ändert sich nichts.</p>
<p>Die Wahl gehört zu deiner Datei, wie die beiden Knöpfe der Jahresansicht: einmal eingestellt,
steht sie beim nächsten Öffnen wieder da. Und du siehst sie, ohne das Fenster zu öffnen — der
Knopf steht auf dunklem Grund, solange die Suche anders eingestellt ist als von Haus aus.</p>
<p><b>Wege ins Feld und wieder heraus.</b> <b>Einfach lostippen</b>: solange du in keinem anderen
Feld stehst, landet der erste Buchstabe im Suchfeld und nimmt die Schreibmarke mit.</p>
<p>Das <b>&#10005;</b> rechts vom Feld nimmt den ganzen Filter zurück: Suchbegriff, Zahlungsstand
und Fälligkeit auf einmal. <b>Escape</b> tut dasselbe, solange kein Fenster offen ist.</p>
<p>Die Schreibmarke bleibt, wo du tippst. Nach einem Haken, einem Filterknopf, einem
Monatswechsel, einem Sprung aus der Jahrestabelle in einen Monat und nach einem Fenster, das du
gerade gespeichert hast, kehrt sie ins Feld zurück — mit dem Begriff markiert, solange etwas darin
steht. Ein leeres Feld bleibt unangetastet. Beim Öffnen einer Datei wird es geleert, damit kein
neues Buch durch den Filter des alten erscheint.</p>

<h4>Notizen</h4>
<p>Die kleine Lampe ist eine Notiz. Es gibt sie zweimal. Die Lampe <b>neben einem Namen</b> trägt
eine Notiz zur Position selbst und taucht überall auf, wo die Position vorkommt. Die Lampe <b>in
einem Monat</b> gehört nur zu diesem einen Monat: „bar bezahlt", „Rechnung noch prüfen".</p>
<p>Eine leuchtende Lampe heißt: da steht etwas. Fahr mit der Maus darüber, um es zu lesen.</p>
<p>Die Lampen arbeiten schon vor dem ersten Speichern. Ein ganz neuer Posten und eine ganz neue
Kategorie haben sie, sobald ihr Fenster aufgeht. Was du hineinschreibst, wandert mit der Position
in die Datei und wird mit ihr verworfen, wenn du abbrichst.</p>
<p>Eine Notiz behält ihre Zeilen. Wo du eine neue Zeile anfängst, steht auch eine: in der
Sprechblase an der Lampe, in den zwei Zeilen Vorschau unter dem Namen und in den Monatsfeldern des
Bearbeitungsfensters. Eine Notiz darf also eine Liste sein.</p>

<h4>Diese Anleitung</h4>
<p>Der orange Knopf <b>${t('app.guide')}</b> klappt diesen Bereich auf und wieder zu. Er bleibt
offen, während du in der Tabelle weiterarbeitest; die Seite daneben wird einfach schmaler. Am
linken Rand kannst du ihn breiter ziehen.</p>
<p>Er hat <b>eine eigene Sprache</b>. Die beiden Kürzel EN · DE in seinem Kopf schalten nur das
um, was du gerade liest — die Anwendung bleibt in der Sprache aus den ${t('app.settings')}. Mit
geladener Datei geht die Anleitung ohnehin in derselben Sprache auf; meistens rührst du die
Kürzel also nie an.</p>
<p>Daneben steht ein Knopf, der die Anleitung <b>über die ganze Seite</b> öffnet, in einem eigenen
Reiter des Browsers, mit allen drei Teilen hintereinander. Eine Anleitung in einer schmalen Spalte
zu lesen ist Arbeit; dafür ist dieser Knopf da.</p>

<h4>Speichern und Sicherheit</h4>
<p>Von allein wird nie geschrieben. <b>${t('app.save')}</b> schreibt alles in deine Datei: Zahlen
und Einstellungen. Chrome und Edge schreiben dabei in genau dieselbe Datei zurück; andere Browser
legen eine frische Kopie im Download-Ordner ab.</p>
<p>So eine Kopie trägt <b>Datum und Uhrzeit vor dem Namen</b> — „260809-142530 fina.json". In
einem Ordner voller Kopien ist die neueste dann einfach die letzte, und du siehst auf einen Blick,
welche welche ist.</p>
<p><b>${t('app.backup')}</b> legt genau so eine datierte Kopie mit Absicht an, in jedem Browser —
auch in Chrome und Edge, die sonst immer nur in die eine Datei schreiben und nie einen zweiten
Stand hinterlassen. Nimm sie vor einem Import, vor einer großen Änderung, vor allem, was du nicht
noch einmal machen möchtest. Als Speichern zählt sie nicht: die Datei, in der du arbeitest, hat
die Änderung danach immer noch vor sich.</p>
<p><b>${t('app.unlink')}</b> legt die Datei aus der Hand und leert den Bildschirm. Ist etwas
ungespeichert, wirst du vorher gewarnt.</p>
<p>Die Datei ist einfacher Text und gehört dir allein. Kopiere sie, sichere sie, nimm sie mit an
einen anderen Rechner — FINA liest sie dort genauso.</p>
`},

/* ── Reiter 3: Was ist neu ─────────────────────────────────────
   Die Versionsliste, neueste Fassung oben. Sie wächst nach oben:
   eine neue Version bekommt einen eigenen <h4> mit der Nummer und
   darunter eine Liste dessen, was sich geändert hat — grob, in
   der Sprache des Nutzers, nicht in der des Codes. Die Nummer ist
   das Datum: Jahr.Monat.Tag.Zählung. */
news:{

en:()=>`
<h4>26.8.11.1 <span class="pill">latest</span></h4>
<ul>
  <li><b>Filtering now adds up what you see.</b> In the month view the block totals, the category
      totals and the four figures of the analytics line; in the year table the block rows, the
      category rows and <b>${t('year.totalRow')}</b>. Switch the filter off and the full figures
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

<h4>26.8.9.2</h4>
<ul>
  <li><b>The year view holds its headings.</b> Column names, “Balance per month” and the
      block row stay put while you scroll — and the horizontal scrollbar now sits above the
      table instead of across its last row.</li>
  <li><b>Every entry can carry several links</b>, each with a name of your own: contract,
      invoice, customer account. The name fills itself from the address, the order can be
      dragged, and where there is no link yet a dash invites you to add one.</li>
  <li><b>An estimated amount is no longer ticked off blindly.</b> The seal opens the entry
      with that month’s figure ready to correct; you tick it there.</li>
  <li><b>${t('view.kakeibo')}</b> — the fourth tab’s new name, opened with
      Ctrl/Cmd + Shift + D, and it starts with the largest single items.</li>
  <li><b>Corrected imported months say so at once</b>, in orange, and name the imported
      value when you point at them.</li>
  <li><b>Entries without any monthly amount are shown in the year view too</b>, so a new one
      does not go missing before you have filled it in.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.9.1</h4>
<ul>
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

<h4>26.8.8.1</h4>
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

<h4>26.8.7.1</h4>
<ul>
  <li><b>Income has categories of its own</b>, in a second list next to the expense
      categories.</li>
  <li><b>The forecast, rebuilt:</b> one table, and a column that draws the balance through the
      year.</li>
  <li><b>The name is the heading</b> — for items and for Flexible Payments categories.</li>
  <li><b>The average per month so far</b> stands above the quick entry.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.6.1</h4>
<ul>
  <li><b>A first screen</b> with no file open: open a file, or start from scratch.</li>
  <li><b>${t('month.ana')}</b> — the five figures of the month open a timeline of it.</li>
  <li><b>One filter row at the top</b>, for all three blocks at once.</li>
  <li><b>Blocks fold away.</b></li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.5.2</h4>
<ul>
  <li><b>The filter searches only where you want it to</b> — the ☰ button in front of the
      field.</li>
  <li><b>${t('view.kakeibo')} only with an import</b>, and now the last tab.</li>
  <li><b>${t('app.import')} moved to the top bar.</b></li>
  <li><b>${t('view.prognose')} only calculates now</b> — it no longer writes.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.5.1</h4>
<ul>
  <li><b>Duplicate an item or a category</b> — same window, copy inside.</li>
  <li><b>The sign shows while you type:</b> red below zero, green above.</li>
  <li><b>Note lamps from the first moment</b>, and notes keep their line breaks.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.8.4.1</h4>
<ul>
  <li><b>Double-click opens an item</b> — in every view, on the amount or on the name.</li>
  <li><b>The search field holds the cursor</b> while you tick things off.</li>
  <li><b>The bar of the year view, rebuilt</b>, with its two filter buttons.</li>
  <li>Bugfixing and cosmetic changes.</li>
</ul>

<h4>26.7.30.1</h4>
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
<h4>26.8.11.1 <span class="pill">neu</span></h4>
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

<h4>26.8.9.2</h4>
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
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.9.1</h4>
<ul>
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

<h4>26.8.8.1</h4>
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

<h4>26.8.7.1</h4>
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

<h4>26.8.6.1</h4>
<ul>
  <li><b>Eine erste Seite</b> ohne Datei: öffnen oder neu anfangen.</li>
  <li><b>${t('month.ana')}</b> — die fünf Zahlen des Monats öffnen seinen Zeitstrahl.</li>
  <li><b>Eine Filterzeile oben</b>, für alle drei Blöcke zugleich.</li>
  <li><b>Blöcke lassen sich zuklappen.</b></li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.5.2</h4>
<ul>
  <li><b>Der Filter sucht nur dort, wo du es willst</b> — der ☰-Knopf vor dem Feld.</li>
  <li><b>${t('view.kakeibo')} nur mit Import</b>, und jetzt als letzter Reiter.</li>
  <li><b>${t('app.import')} steht in der Kopfzeile.</b></li>
  <li><b>Die ${t('view.prognose')} rechnet nur noch</b> — sie schreibt nicht mehr.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.5.1</h4>
<ul>
  <li><b>Posten und Kategorien duplizieren</b> — dasselbe Fenster, eine Kopie darin.</li>
  <li><b>Das Vorzeichen zeigt sich beim Tippen:</b> rot unter null, grün darüber.</li>
  <li><b>Notizlampen von Anfang an</b>, und Notizen behalten ihre Zeilen.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.8.4.1</h4>
<ul>
  <li><b>Doppelklick öffnet die Position</b> — in jeder Ansicht, auf Betrag oder
      Bezeichnung.</li>
  <li><b>Das Suchfeld hält die Schreibmarke</b>, während du abhakst.</li>
  <li><b>Die Leiste der Jahresansicht neu geordnet</b>, mit ihren zwei Filterknöpfen.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>

<h4>26.7.30.1</h4>
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
  if(typeof fitRails==='function') fitRails();
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
    const title=`FINA — ${t('app.guide')}`;
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@400;600;700&family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
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
  if(!w){ toast(t('guide.fullBlocked')); return; }
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
