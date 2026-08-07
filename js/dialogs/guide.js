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
<p class="glead">Never kept a cash book before? Work through this once, from top to bottom. It
takes about twenty minutes. Afterwards you only ever repeat step 9.</p>

<h4>Before you start</h4>
<p>FINA is a book for <b>one year</b>. Everything you type lands in <b>one file on your own
computer</b> — no account, no server, nothing is sent anywhere. And nothing is saved by itself:
the file is written when you press <b>${t('app.save')}</b>, never otherwise.</p>
<p>Your money is sorted into three drawers. Deciding which drawer something belongs to is the
whole system:</p>
<ul>
  <li><b>${t('g.income')}</b> — money coming in: wages, refunds, anything positive.</li>
  <li><b>${t('g.fixed')}</b> — bills that repeat and whose amount you know in advance: rent,
      insurance, an instalment, a subscription. One item per contract.</li>
  <li><b>${t('g.flex')}</b> — everyday spending that differs from month to month:
      groceries, fuel, going out. Not every single purchase — a handful of categories, one
      amount per month each.</li>
</ul>
<p>Rule of thumb: does it arrive as a bill or a contract? Then it is a regular cost. Do you spend
it in a shop? Then it is flexible.</p>

<h4>Step 1 — The first screen, and the top bar</h4>
${gshot('welcome','The first screen: open a file, or start from scratch')}
<p>With no file open, FINA greets you with one page and two ways on: <b>${t('wel.open')}</b> picks
a FINA file you saved before, <b>${t('wel.new')}</b> begins an empty book. The same page comes
back when you close a file. Everything else in the top bar is hidden there — there is nothing to
save and nothing to set until a book is open.</p>
<p>Take <b>${t('wel.new')}</b> and read on.</p>
${gshot('ui-header','The top bar and, below it, the views and the twelve months')}
<p>Once a book is open the top bar carries what you need for it: <b>${t('app.save')}</b> writes
your file, <b>${t('app.unlink')}</b> puts it down again. While something is unsaved, the file name
next to the buttons is shown in bold red. There is no “open” button here — a file is opened on the
first screen. Next to them sits <b>${t('app.import')}</b>, which you only need if you use Fast
Budget; it is the last step of this guide.</p>
<p>Below the bar are the views, and under them the months — those belong to
<b>${t('view.monat')}</b>, which is where you will work day to day. There are three of them to
begin with. A fourth, <b>${t('view.kakeibo')}</b>, joins at the end as soon as you have imported
bookings; it evaluates exactly those, so without them there would be nothing in it to read.</p>
<p>Which view greets you depends on your file: with a file loaded FINA opens the <b>current
month</b>, because that is where the work happens; a fresh empty book starts in
<b>${t('view.jahr')}</b>, because that is where you build it. (If the file belongs to another
year, “current” means January.)</p>

<h4>Step 2 — Set the year and the language</h4>
${gshot('set-general','Settings, section General')}
<p>Open <b>${t('app.settings')}</b> and stay in <b>${t('set.navGeneral')}</b>. Choose your
language and type the year you are keeping the book for. Everything else can wait.</p>
<p>One file holds exactly one year. Next January you start a new one.</p>

<h4>Step 3 — Name your accounts and how you pay</h4>
${gshot('set-lists','Settings, section Banks &amp; payment types')}
<p>Still in <b>${t('app.settings')}</b>, go to <b>${t('set.navBanks')}</b>. Every entry has a
<i>code</i> and a <i>label</i>. The label is for you — “Main account”, “Credit card”. The code is
one or two letters and is what appears in the year table, in the narrow columns <b>B</b> (bank)
and <b>PT</b> (payment type).</p>
<p>Two or three accounts and a handful of payment types are plenty. Nothing here is final: change
a code later and FINA asks whether the items carrying it should move along.</p>

<h4>Step 4 — Group your bills</h4>
${gshot('set-groups','Settings, section Regular categories')}
<p>Under <b>${t('set.groups')}</b> there are <b>two lists side by side</b>, and every regular item
belongs to exactly one of them. On the left the income categories — Salary, Side job, Refunds; on
the right the expense categories — Home, Car, Insurance, Subscriptions. Four to six on each side are
plenty; they exist to keep the month view readable, and they are what tells FINA whether an item
brings money in or costs it.</p>
<p>Because of that, <b>a name may appear only once across both lists</b>. Call something “Car” on the
left and “Car” on the right, and FINA can no longer tell which is which — it will refuse the second
one and say so.</p>
<p>Then do the same under <b>${t('set.kak')}</b> for everyday spending: Groceries, Fuel, Going
out, Gifts. Five to eight categories.</p>
<p>Press <b>${t('g.save')}</b> in the window — and then <b>${t('app.save')}</b> in the top bar.
Get into that habit now: the window only hands the change to the app, the top bar writes the
file.</p>

<h4>Step 5 — Enter what comes in</h4>
${gshot('month-in','The income block in the month view')}
<p>Switch to <b>${t('view.monat')}</b> and press <b>${t('year.addIncome')}</b>. Give it a name
(“Salary”), then fill the twelve boxes with the amount you receive each month. Income is typed
<b>without a sign</b>.</p>
<p>Irregular income — a refund, a bonus — goes in the month it actually arrives, and stays empty
everywhere else.</p>

<h4>Step 6 — Enter your first bill</h4>
${gshot('item-dialog','The item window: who and what, the amounts, the ticks')}
<p>Press <b>${t('year.addItem')}</b>. The window has three parts, and they always work the same
way — for every item, in every view.</p>
<p><b>At the top: who and what.</b> The name, the group it belongs to, the account it is paid
from, how it is paid, on which day of the month it is due, and — if it ever stops — the month and
year of the last payment. Those two fields are what colours the <b>LP</b> column in the year
table later.</p>
<p>The <b>${t('item.block')}</b> starts out empty and reads “${t('item.blockPick')}”. Choose one:
FINA refuses to save an item without a block, because such an item would show up in no category of
the month view and in no group of the year table. Nothing is preselected on purpose — a block
chosen for you would end up in your file unnoticed. Only <b>${t('year.addIncome')}</b> brings its
block along.</p>
<p><b>In the middle: the amounts.</b> Twelve boxes, one per month.
<b>An expense is typed with a minus</b> — “-49,90”. Forget the minus and the item counts as
income. You can see it while you type: an amount turns <span class="neg">red</span> as soon as it
is negative and <span class="pos">green</span> as soon as it is positive, in the twelve boxes as in
the quick entry. Zero and an empty box stay black.</p>
${gshot('item-quick','Quick entry — one amount into many months at once')}
<p>Same amount every month? Use the quick entry: type the amount once, choose how often it repeats
and from which month, then press <b>${t('item.apply')}</b>.</p>
${gshot('item-months','The twelve month boxes, each with a tick and a note lamp')}
<p><b>At the bottom of every month: a tick.</b> It means “this one is settled”. A ticked month
locks its amount so you cannot change it by accident; remove the tick and you can type again.</p>
<p>Do not know the amount yet — the electricity bill, roughly? Tick
<b>“${t('item.est')}”</b>. FINA then shows the figure in yellow with a question mark, so you can
see at a glance which numbers are still guesses.</p>
<p>Every month box carries a small <b>note lamp</b>, and there is one next to the name for a note
about the item as a whole. They work from the first moment: a brand new item has its lamps before
it has ever been saved, and what you write is kept with the item when you press
<b>${t('g.save')}</b> — or thrown away with it if you cancel.</p>
<p>Two items that are almost the same — two insurances, two instalments? Fill one in and press
<b>${t('item.dup')}</b> at the bottom of the window. The same window opens again with a copy of
everything you have typed: name, block, account, link and all twelve amounts — but without a
single tick and without notes, so every month can be changed straight away. The copy comes into
being with <b>${t('g.save')}</b>; if you cancel, nothing was created. The original is left
untouched either way.</p>

<h4>Step 7 — Enter your everyday spending</h4>
${gshot('flex-dialog','The amounts window of a Flexible Payments category')}
<p>Press <b>${t('year.addKak')}</b>. It works much like a bill, only the thing you are describing is
a category, not a contract: “Groceries”, twelve amounts, done.</p>
<p>One thing differs from every other window: <b>the name is the heading</b>. There is no field for
it — click the heading, and a small window opens with the name ready and selected, plus
<b>${t('g.cancel')}</b> and <b>${t('item.apply')}</b>. A new category starts with
“— choose a name —” there, and <b>${t('g.save')}</b> without one simply opens that window. Items
work the same way now.</p>
<p>Above the amount of the quick entry stands, in orange, <b>the average per month so far</b> —
counted over the months that are settled, ticked off or imported. It changes as you type, so you
can see what you are aiming at while you set the coming months.</p>
<p>You cannot know these in advance — that is the point. Put in what you expect, tick
<b>“${t('item.est')}”</b>, and correct the figure once the month is over. Guessing here is not
sloppy; it is how the forecast learns what your life costs.</p>
<p>This window has the same <b>${t('item.dup')}</b> button and the same note lamps as the one
before it — a second category with a similar shape is a matter of two clicks.</p>
${gshot('month-flex','The Flexible Payments block in the month view')}

<h4>Step 8 — What the three marks mean</h4>
${gshot('legend','The marks, as they appear below the month view')}
<p>The same three marks appear in every block:</p>
<ul>
  <li>an <b>empty circle</b> — due, not paid yet;</li>
  <li>a <b>green circle with a tick</b> — settled, and the amount is locked;</li>
  <li>a <b>yellow circle</b> — the amount is only an estimate.</li>
</ul>
<p>A whole row on <b>grey</b> says something else: for this year nothing is left to pay on it — the
last instalment is ticked off, or the contract ended. Such rows sink to the bottom of their block.
The month view and the year table use the same grey for it, so you only have to learn it once.</p>

<h4>Step 9 — Your monthly routine</h4>
${gshot('month-out','The regular costs of one month, with filters and seals')}
<p>This is the only part you repeat. Once a month, or whenever you have paid something:</p>
<ol>
  <li>Open <b>${t('view.monat')}</b> and pick the month at the top.</li>
  <li>Tick off what has actually left your account.</li>
  <li>Correct any amount that turned out different — remove the tick, type, tick again.</li>
  <li>Press <b>${t('app.save')}</b>.</li>
</ol>
<p>To change something, take the pencil next to the row — or simply <b>double-click the amount or
the name</b>. Both open the same window, and both work in every view, not only here. The seal, the
pencil, the note lamp and the receipt link keep their own behaviour; you can double-click them
without anything opening.</p>
<p>The filter row sits at the <b>top of the page</b>, under the analytics line, and it applies to
<b>all three blocks at once</b> — income, everyday spending, regular costs. In the order in which
you use it: the <b>search field</b>, then the <b>due date</b> — all, start, middle, end of the
month, or ${t('month.tlClose')} for everything without a payday —, then the <b>payment state</b>:
${t('month.fAll')}, ${t('month.fOpen')}, ${t('month.fEst')}, ${t('month.fPaid')}. A dark button is
one that is being applied; click it again and it is off. Hold the mouse over any of them and it says
what it does. What a block is hiding right now is written next to its heading.</p>
<p>Every block can be folded away: the <b>arrow</b> at the left of its heading, in the colour of the
block and right above the column where you tick things off. Folded, only the heading with its total
is left. FINA remembers that per block in your file, for all twelve months — the everyday categories
start folded, because their list is the same in every month.</p>
<p>The search field works while you type and looks at everything the row shows: name, amount,
bank, payment type, category, note. Part of a word or of a figure is enough — “ele” finds
Electricity, “50” finds every amount containing 50. All three filters apply at once, and none of
them changes anything in the file — only what you see.</p>
<p>What it looks at is yours to decide. The small <b>&#9776;</b> button in front of the field opens
a window with five entries — <b>${t('flt.fName')}</b>, <b>${t('flt.fNote')}</b>,
<b>${t('flt.fAmount')}</b>, <b>${t('flt.fTotal')}</b>, <b>${t('flt.fMeta')}</b>. Tick what should be
searched and press <b>${t('g.save')}</b>; <b>${t('g.cancel')}</b> leaves everything as it was. That
is how you look for a name without half the notes answering as well, or for a figure without the
names getting in the way. Everything is ticked to begin with, at least one entry has to stay
ticked, and the button turns dark as soon as not everything is searched any more. Your choice is
kept in the file and applies to the year view too.</p>
<p>As long as something is typed in the field, the cursor returns to it after every tick: you can
work through a long list without reaching for the mouse. An empty field is left alone, so ticking
never pulls your cursor away from where it was.</p>
<p>And while you scroll, the analytics line, the filter row and the heading of the block you are in
all stay at the top of the screen — you always see what you are reading, what it costs, and you can
filter from anywhere in the list.</p>

<h4>Step 10 — Read the figures at the top</h4>
${gshot('ui-kpi','The analytics line and, below it, the filter row')}
<p>Left to right: what comes in, what the everyday categories cost, what the bills cost, what of
that is <b>still open</b> — and, at the right, what is left. If the last number is green, the
month carries itself.</p>
<p>The line is called <b>${t('month.ana')}</b>, and it is a door as well: <b>click it</b> and a
timeline opens underneath that shows how your balance moves through the month — what the month
started with, what went out at the start, in the middle and at the end of it, and what is left after
the month close. Every row can be clicked and filters everything below, and the colours say which
kind of money moved the balance. There is a section of its own about it in
<b>${t('guide.tabProduct')}</b>.</p>
${gshot('ui-analytics','The analytics area, opened')}

<h4>Step 11 — When the balance does not fit</h4>
${gshot('month-bal','The balance correction — one row above the income')}
<p>Sooner or later the balance in FINA and the balance at your bank drift apart: a rounding, a
payment that never made it into the book. Do not go hunting. Type the difference into
<b>${t('bal.row')}</b> in that month and the balance is right again.</p>
<p>There is nothing to tick off on that row — the amount you type <i>is</i> the correction.</p>

<h4>Step 12 — See the whole year</h4>
${gshot('year-left','The year table: one row per item, one column per month')}
<p>Now open <b>${t('view.jahr')}</b>. One row per item, one column per month, and the narrow
columns on the left carry the codes: <b>B</b> bank, <b>PT</b> payment type, <b>DD</b> due date,
<b>LP</b> last payment. What the marks ✓ and ? mean is written to the right of the view tabs.</p>
<p>Amounts are green when positive, red when negative, yellow while they are still a guess. Rows
on grey are done for this year. A click on a month name takes you into that month, and a
<b>double-click on an amount or on the name</b> opens that item — the same window as the pencil on
the left, from any of the twelve months and from the total column.</p>
<p>The three block rows — ${t('g.income')}, ${t('g.flex')}, ${t('g.fixed')} — stay at the
top of the screen while you scroll through their block, the same way the headings do in the month
view.</p>
<p>The bar above the table starts with the same search field as the month view, and it holds the
same word: what you type in one view still applies in the other. Here it searches all twelve
months and it applies to every row that has content. Type the name of a block or of a category and
that block appears whole, with everything under it — you look for a category in order to see it,
not to find it empty. One row is never filtered away: <b>${t('year.balanceRow')}</b> belongs to the
frame, like the column headings above it. It stays under them while you scroll, whatever you type,
because it is the row you read all the others against.</p>
<p>As in the month view, the cursor stays in the field: after the two buttons next to it and after
a jump into a month it comes back, as long as something is typed in it. Opening a file clears the
field, so a new book is never shown to you through the filter of the old one.</p>
<p>The <b>&#9776;</b> button in front of the field is the same one as in the month view and holds
the same choice: what the filter searches is set once and counts in both views. Two of the five
entries belong here in particular — <b>${t('flt.fTotal')}</b>, the figure in the last column, and
<b>${t('flt.fMeta')}</b>, which also covers the names of the blocks and categories. Untick that
one and a category name no longer opens its block.</p>
<p>Next to it two buttons. <b>${t('year.hideDone')}</b> folds away every month in which nothing is
left open; <b>${t('year.hideSettled')}</b> hides the items that are fully paid for this year.
Neither is on to begin with. They keep their name and show at their dark background that they are
being applied, a second click switches them off — and both are remembered in your file, so the
table looks the way you left it when you open it again.</p>
${gshot('year','The year view: search field and the two filter buttons on the left, what they add on the right')}

<h4>Step 13 — Look ahead</h4>
${gshot('forecast','The Forecast view: the whole year, month by month')}
<p><b>${t('view.prognose')}</b> adds up everything still to come and shows the balance you can
expect on 31 December. One table, one row per month, and the current month highlighted.</p>
<p>The headings are short — <b>M · IN · REG · FLEX · COR · BAL · CUM</b> — so the columns stay as
narrow as their figures. Point at any of them and it tells you what it is. The months before this
one are pale: they are settled.</p>
<p>The last column, <b>${t('prog.colFlow')}</b>, is the same picture as the timeline in the month
view, one floor up: each month starts at the previous month’s balance and ends at its own, and
between them lie the parts in the colours of the three kinds of money. The pale vertical lines are a
grid — the heading says what one step is worth, so you can read off <i>how much</i> a month moved,
not just that it did.</p>
<p>For the months you have not lived yet the forecast needs an assumption per everyday category. You
set it where the twelve months are: open the category with the pencil or a double click, and the
average so far stands right above the amount.</p>

<h4>Step 14 — Save, and keep the file safe</h4>
<p><b>${t('app.save')}</b> writes everything — figures and settings — into your file. Chrome and
Edge write back into the very same file; other browsers put a fresh copy in your downloads
folder.</p>
<p>The file is plain text and yours alone. Copy it somewhere safe now and then: it is the only
place your figures exist.</p>

<h4>Optional — if you use Fast Budget</h4>
<p>Export your transactions there as a CSV file and load it here with <b>${t('app.import')}</b>.
The button sits in the <b>top bar</b>, next to ${t('app.load')} and ${t('app.save')} — not inside a
view. It first opens a short window telling you which app the file comes from and which columns it
must contain (<code>Datum</code>, <code>Wert (EUR)</code>, <code>Hauptkategorie</code>); then you
choose the file. FINA shows you which months are in it, lets you deselect any of them, and tells
you exactly what it is about to overwrite. Only the very last button changes anything, and the
chosen months are replaced, not added to.</p>
<p>Once bookings are in the file, a further tab appears at the end of the row:
<b>${t('view.kakeibo')}</b>. It breaks the everyday spending down to subcategories and single
bookings — that is what the import is for.</p>

<h4>The short version</h4>
<ol>
  <li>Settings: language, year, accounts, groups.</li>
  <li>Enter your income.</li>
  <li>Enter your bills — one item per contract, amounts with a minus.</li>
  <li>Enter your everyday categories — an estimate is enough.</li>
  <li>Every month: tick off what is paid, correct what changed, press
      <b>${t('app.save')}</b>.</li>
</ol>
<p>Everything else in FINA is there to answer a question you have not asked yet. When you do,
read <b>${t('guide.tabProduct')}</b> above.</p>
`,

de:()=>`
<p class="glead">Noch nie ein Kassenbuch geführt? Arbeite das hier einmal von oben nach unten
durch — etwa zwanzig Minuten. Danach wiederholst du nur noch Schritt 9.</p>

<h4>Bevor du anfängst</h4>
<p>FINA ist ein Buch für <b>genau ein Jahr</b>. Alles, was du einträgst, steht in <b>einer einzigen
Datei auf deinem eigenen Rechner</b> — kein Konto, kein Server, es wird nichts irgendwohin
geschickt. Und von allein wird nichts gespeichert: geschrieben wird, wenn du auf
<b>${t('app.save')}</b> klickst, sonst nie.</p>
<p>Dein Geld liegt in drei Schubladen. Die Entscheidung, wohin etwas gehört, ist schon das ganze
System:</p>
<ul>
  <li><b>${t('g.income')}</b> — was hereinkommt: Lohn, Rückzahlungen, alles Positive.</li>
  <li><b>${t('g.fixed')}</b> — Rechnungen, die wiederkehren und deren Höhe du vorher kennst:
      Miete, Versicherung, eine Rate, ein Abo. Je Vertrag eine Position.</li>
  <li><b>${t('g.flex')}</b> — die alltäglichen Ausgaben, die jeden Monat anders ausfallen:
      Lebensmittel, Sprit, Ausgehen. Nicht jeder Einkauf einzeln — eine Handvoll Kategorien mit je
      einem Betrag pro Monat.</li>
</ul>
<p>Faustregel: Kommt es als Rechnung oder Vertrag? Dann regelmäßige Kosten. Gibst du es im Laden
aus? Dann flexibel.</p>

<h4>Schritt 1 — Die erste Seite und die Kopfzeile</h4>
${gshot('welcome','Die erste Seite: Datei öffnen oder neu anfangen')}
<p>Ohne Datei begrüßt dich FINA mit einer Seite und zwei Wegen: <b>${t('wel.open')}</b> nimmt eine
FINA-Datei, die du schon gespeichert hast, <b>${t('wel.new')}</b> fängt ein leeres Buch an.
Dieselbe Seite kommt zurück, wenn du eine Datei schließt. Alles andere in der Kopfzeile ist dort
ausgeblendet — ohne Buch gibt es nichts zu speichern und nichts einzustellen.</p>
<p>Nimm <b>${t('wel.new')}</b> und lies weiter.</p>
${gshot('ui-header','Die Kopfzeile, darunter die Ansichten und die zwölf Monate')}
<p>Mit offenem Buch trägt die Kopfzeile, was du dafür brauchst: <b>${t('app.save')}</b> schreibt
deine Datei, <b>${t('app.unlink')}</b> legt sie wieder aus der Hand. Solange etwas ungespeichert
ist, steht der Dateiname daneben fett und rot. Einen Knopf zum Öffnen gibt es hier nicht — eine
Datei wird auf der ersten Seite geöffnet. Daneben steht <b>${t('app.import')}</b> — den brauchst
du nur, wenn du Fast Budget benutzt; er ist der letzte Schritt dieser Anleitung.</p>
<p>Unter der Zeile stehen die Ansichten und darunter die Monate — die gehören zu
<b>${t('view.monat')}</b>, dort arbeitest du später im Alltag. Zu Anfang sind es drei. Eine
vierte, <b>${t('view.kakeibo')}</b>, kommt am Ende dazu, sobald du Buchungen importiert hast: sie
wertet genau diese aus, ohne sie gäbe es dort nichts zu lesen.</p>
<p>Womit du begrüßt wirst, hängt von der Datei ab: mit geladener Datei öffnet FINA den
<b>laufenden Monat</b>, denn dort wird gearbeitet; ein frisches leeres Buch die
<b>${t('view.jahr')}</b>-Ansicht, denn dort legst du an. (Gehört die Datei zu einem anderen Jahr,
ist der „laufende" Monat der Januar.)</p>

<h4>Schritt 2 — Jahr und Sprache einstellen</h4>
${gshot('set-general','Die Einstellungen, Bereich Allgemein')}
<p>Öffne <b>${t('app.settings')}</b> und bleib in <b>${t('set.navGeneral')}</b>. Wähle die Sprache
und trag das Jahr ein, für das du das Buch führst. Alles andere hat Zeit.</p>
<p>Eine Datei fasst genau ein Jahr. Im nächsten Januar fängst du eine neue an.</p>

<h4>Schritt 3 — Konten und Zahlungswege benennen</h4>
${gshot('set-lists','Die Einstellungen, Bereich Banken &amp; Zahlungsarten')}
<p>Weiter in <b>${t('app.settings')}</b>, Bereich <b>${t('set.navBanks')}</b>. Jeder Eintrag hat
ein <i>Kürzel</i> und eine <i>Bezeichnung</i>. Die Bezeichnung ist für dich — „Hauptkonto",
„Kreditkarte". Das Kürzel ist ein oder zwei Buchstaben und steht später in der Jahrestabelle in
den schmalen Spalten <b>B</b> (bank) und <b>PT</b> (payment type).</p>
<p>Zwei, drei Konten und eine Handvoll Zahlungsarten reichen völlig. Nichts davon ist endgültig:
Änderst du später ein Kürzel, fragt FINA, ob die Posten damit mitwandern sollen.</p>

<h4>Schritt 4 — Deine Rechnungen gruppieren</h4>
${gshot('set-groups','Die Einstellungen, Bereich Regelmäßige Kategorien')}
<p>Unter <b>${t('set.groups')}</b> stehen <b>zwei Listen nebeneinander</b>, und jeder regelmäßige
Posten gehört in genau eine davon. Links die Einnahme-Kategorien — Lohn, Nebenjob, Rückzahlungen;
rechts die Ausgabe-Kategorien — Wohnen, Auto, Versicherungen, Abos. Vier bis sechs je Seite genügen;
sie sind dafür da, dass die Monatsansicht lesbar bleibt — und an ihnen erkennt FINA, ob ein Posten
Geld bringt oder kostet.</p>
<p>Deshalb darf <b>ein Name über beide Listen hinweg nur einmal vorkommen</b>. Heißt links etwas
„Auto" und rechts auch, kann FINA die beiden nicht mehr auseinanderhalten — der zweite wird
abgewiesen, mit einer Meldung dazu.</p>
<p>Dasselbe dann unter <b>${t('set.kak')}</b> für den Alltag: Lebensmittel, Sprit, Ausgehen,
Geschenke. Fünf bis acht Kategorien.</p>
<p>Klick im Fenster auf <b>${t('g.save')}</b> — und danach oben auf <b>${t('app.save')}</b>. Gewöhn
dir das gleich an: das Fenster gibt die Änderung nur an die Anwendung weiter, geschrieben wird die
Datei in der Kopfzeile.</p>

<h4>Schritt 5 — Eintragen, was hereinkommt</h4>
${gshot('month-in','Der Einnahmenblock in der Monatsansicht')}
<p>Wechsle zu <b>${t('view.monat')}</b> und klick auf <b>${t('year.addIncome')}</b>. Gib ihr einen
Namen („Gehalt") und trag in die zwölf Felder ein, was jeden Monat kommt. Einnahmen werden
<b>ohne Vorzeichen</b> geschrieben.</p>
<p>Unregelmäßiges — eine Rückzahlung, eine Prämie — steht in dem Monat, in dem es tatsächlich
kommt, und sonst nirgends.</p>

<h4>Schritt 6 — Die erste Rechnung eintragen</h4>
${gshot('item-dialog','Das Posten-Fenster: wer und was, die Beträge, die Haken')}
<p>Klick auf <b>${t('year.addItem')}</b>. Das Fenster hat drei Teile, und die funktionieren immer
gleich — für jeden Posten, in jeder Ansicht.</p>
<p><b>Oben: wer und was.</b> Der Name, die Gruppe, von welchem Konto es abgeht, wie bezahlt wird,
an welchem Tag im Monat es fällig ist und — falls es einmal endet — Monat und Jahr der letzten
Zahlung. Diese beiden Felder färben später die Spalte <b>LP</b> in der Jahrestabelle.</p>
<p>Der <b>${t('item.block')}</b> ist zu Anfang leer und zeigt „${t('item.blockPick')}". Wähl einen
aus: ohne Block speichert FINA den Posten nicht, denn er stünde in keiner Kategorie der
Monatsansicht und in keiner Gruppe der Jahrestabelle. Vorausgewählt ist mit Absicht nichts — ein
Block, den die Anwendung für dich wählt, landete unbemerkt in deiner Datei. Nur
<b>${t('year.addIncome')}</b> bringt seinen Block mit.</p>
<p><b>In der Mitte: die Beträge.</b> Zwölf Felder, eines je Monat.
<b>Eine Ausgabe wird mit Minus geschrieben</b> — „-49,90". Ohne Minus gilt der Posten als
Einnahme. Du siehst es schon beim Tippen: ein Betrag wird <span class="neg">rot</span>, sobald er
negativ ist, und <span class="pos">grün</span>, sobald er positiv ist — in den zwölf Feldern wie
in der schnellen Eingabe. Die Null und das leere Feld bleiben schwarz.</p>
${gshot('item-quick','Die schnelle Eingabe — ein Betrag in viele Monate auf einmal')}
<p>Jeden Monat derselbe Betrag? Nimm die schnelle Eingabe: Betrag einmal tippen, Wiederholung und
Startmonat wählen, auf <b>${t('item.apply')}</b> klicken.</p>
${gshot('item-months','Die zwölf Monatsfelder, jedes mit Haken und Notizlampe')}
<p><b>Unter jedem Monat ein Haken.</b> Er heißt „dieser ist erledigt". Ein abgehakter Monat sperrt
seinen Betrag, damit er nicht aus Versehen verrutscht; Haken weg, und du kannst wieder tippen.</p>
<p>Steht ein Betrag noch nicht fest — die Stromrechnung, ungefähr? Dann setz den Haken bei
<b>„${t('item.est')}"</b>. FINA zeigt die Zahl daraufhin gelb mit einem Fragezeichen; du siehst
auf einen Blick, welche Zahlen noch geschätzt sind.</p>
<p>An jedem Monatsfeld hängt eine kleine <b>Notizlampe</b>, und neben dem Namen steht eine für die
ganze Position. Sie arbeiten von der ersten Minute an: auch ein ganz neuer Posten hat seine Lampen,
bevor er je gespeichert wurde. Was du hineinschreibst, wandert mit <b>${t('g.save')}</b> in die
Datei — und mit „Abbrechen" wieder weg.</p>
<p>Zwei Posten, die sich fast gleichen — zwei Versicherungen, zwei Raten? Füll einen aus und klick
unten auf <b>${t('item.dup')}</b>. Dasselbe Fenster geht noch einmal auf, mit einer Kopie von allem
Getippten: Name, Block, Konto, Link und alle zwölf Beträge — aber ohne einen einzigen Haken und
ohne Notizen, jeder Monat ist also sofort änderbar. Angelegt wird die Kopie erst mit
<b>${t('g.save')}</b>; wer abbricht, hinterlässt nichts. Die Vorlage bleibt in beiden Fällen
unangetastet.</p>

<h4>Schritt 7 — Die alltäglichen Ausgaben eintragen</h4>
${gshot('flex-dialog','Das Beträge-Fenster einer Flexible-Payments-Kategorie')}
<p>Klick auf <b>${t('year.addKak')}</b>. Das läuft ähnlich wie eine Rechnung, nur beschreibst du
diesmal eine Kategorie statt eines Vertrags: „Lebensmittel", zwölf Beträge, fertig.</p>
<p>Eines ist anders als in jedem anderen Fenster: <b>die Bezeichnung ist die Überschrift</b>. Ein
Feld dafür gibt es nicht — klick auf die Überschrift, und ein kleines Fenster geht auf, der Name
fertig markiert, dazu <b>${t('g.cancel')}</b> und <b>${t('item.apply')}</b>. Bei einer neuen
Kategorie steht dort „— Bezeichnung wählen —", und <b>${t('g.save')}</b> ohne Namen öffnet genau
dieses Fenster. Bei den Posten ist es jetzt genauso.</p>
<p>Über dem Betrag der Schnelleingabe steht orange <b>der bisherige Mittelwert je Monat</b> —
gerechnet über die Monate, die feststehen, abgehakt oder importiert. Er ändert sich beim Tippen mit,
du siehst also beim Setzen der kommenden Monate, woran du dich hältst.</p>
<p>Diese Zahlen kannst du nicht vorher wissen — das ist der Sinn der Sache. Trag ein, womit du
rechnest, setz den Haken bei <b>„${t('item.est')}"</b>, und korrigier den Wert, wenn der Monat
vorbei ist. Schätzen ist hier nicht schlampig; so lernt die Prognose, was dein Leben kostet.</p>
<p>Dieses Fenster hat denselben Knopf <b>${t('item.dup')}</b> und dieselben Notizlampen wie das
davor — eine zweite Kategorie mit ähnlichem Zuschnitt sind zwei Klicks.</p>
${gshot('month-flex','Der Flexible-Payments-Block in der Monatsansicht')}

<h4>Schritt 8 — Was die drei Zeichen bedeuten</h4>
${gshot('legend','Die Zeichen, wie sie unter der Monatsansicht stehen')}
<p>Dieselben drei Zeichen gibt es in jedem Block:</p>
<ul>
  <li>ein <b>leerer Kreis</b> — fällig, noch nicht bezahlt;</li>
  <li>ein <b>grüner Kreis mit Haken</b> — erledigt, der Betrag ist gesperrt;</li>
  <li>ein <b>gelber Kreis</b> — der Betrag ist nur geschätzt.</li>
</ul>
<p>Eine ganze Zeile auf <b>grauem Grund</b> sagt etwas anderes: für dieses Jahr steht dort nichts
mehr aus — die letzte Rate ist abgehakt oder der Vertrag ausgelaufen. Solche Zeilen rutschen ans
Ende ihres Blocks. Monatsansicht und Jahrestabelle benutzen dafür dasselbe Grau, du musst es also
nur einmal lernen.</p>

<h4>Schritt 9 — Dein Monatsrhythmus</h4>
${gshot('month-out','Die regelmäßigen Kosten eines Monats, mit Filtern und Siegeln')}
<p>Nur das hier wiederholt sich. Einmal im Monat, oder immer wenn du etwas bezahlt hast:</p>
<ol>
  <li>Öffne <b>${t('view.monat')}</b> und wähl oben den Monat.</li>
  <li>Hak ab, was tatsächlich vom Konto gegangen ist.</li>
  <li>Korrigier, was anders ausgefallen ist — Haken weg, tippen, Haken wieder setzen.</li>
  <li>Klick auf <b>${t('app.save')}</b>.</li>
</ol>
<p>Zum Ändern nimmst du den Stift neben der Zeile — oder du machst einfach einen
<b>Doppelklick auf den Betrag oder auf die Bezeichnung</b>. Beides öffnet dasselbe Fenster, und
beides gibt es in jeder Ansicht, nicht nur hier. Siegel, Stift, Notizlampe und Beleglink behalten
ihr eigenes Verhalten; auf ihnen öffnet ein Doppelklick nichts.</p>
<p>Die Filterzeile steht <b>ganz oben</b>, unter der Auswertungszeile, und gilt für <b>alle drei
Blöcke zugleich</b> — Einnahmen, Alltagsausgaben, regelmäßige Kosten. In der Reihenfolge, in der man
sie benutzt: das <b>Suchfeld</b>, dann die <b>Fälligkeit</b> — alle, Anfang, Mitte, Ende des Monats
oder ${t('month.tlClose')} für alles ohne Zahltag —, dann der <b>Zahlungsstand</b>:
${t('month.fAll')}, ${t('month.fOpen')}, ${t('month.fEst')}, ${t('month.fPaid')}. Ein dunkler Knopf
gilt gerade; klick ihn noch einmal an, und er gilt nicht mehr. Fahr mit der Maus darüber, und jeder
sagt dir, was er tut. Was ein Block gerade versteckt, steht neben seiner Überschrift.</p>
<p>Jeden Block kannst du zuklappen: mit dem <b>Pfeil</b> links in seiner Überschrift, in der Farbe
des Blocks und genau über der Spalte, in der abgehakt wird. Zugeklappt bleibt nur die Überschrift
mit ihrer Summe stehen. FINA merkt sich das je Block in deiner Datei, für alle zwölf Monate — die
Alltagskategorien fangen zugeklappt an, weil ihre Liste in jedem Monat dieselbe ist.</p>
<p>Das Suchfeld filtert beim Tippen und sieht in alles hinein, was die Zeile zeigt: Name, Betrag,
Bank, Zahlungsart, Kategorie, Notiz. Ein Wortteil oder ein Stück der Zahl genügt — „str" findet
Strom, „50" jeden Betrag, in dem 50 vorkommt. Alle drei Filter gelten gleichzeitig, und keiner
ändert etwas in der Datei — nur, was du siehst.</p>
<p>Worin es hineinsieht, bestimmst du. Der kleine <b>&#9776;</b>-Knopf vor dem Feld öffnet ein
Fenster mit fünf Angaben — <b>${t('flt.fName')}</b>, <b>${t('flt.fNote')}</b>,
<b>${t('flt.fAmount')}</b>, <b>${t('flt.fTotal')}</b>, <b>${t('flt.fMeta')}</b>. Kreuz an, was
durchsucht werden soll, und klick <b>${t('g.save')}</b>; mit <b>${t('g.cancel')}</b> bleibt alles,
wie es war. So suchst du einen Namen, ohne dass die halben Notizen mit antworten, oder eine Zahl,
ohne dass die Namen dazwischenkommen. Anfangs ist alles angekreuzt, mindestens eine Angabe muss
gewählt bleiben, und der Knopf wird dunkel, sobald nicht mehr alles durchsucht wird. Deine Wahl
steht in der Datei und gilt in der Jahresansicht genauso.</p>
<p>Solange etwas im Feld steht, kehrt die Schreibmarke nach jedem Haken dorthin zurück: du kannst
eine lange Liste durcharbeiten, ohne zur Maus zu greifen. Ein leeres Feld bleibt unangetastet —
dann zieht dich das Abhaken nirgendwohin.</p>
<p>Und beim Scrollen bleiben die Auswertungszeile, die Filterzeile und die Überschrift des Blocks,
in dem du liest, oben stehen: du siehst immer, worin du liest und was es kostet, und kannst von
überall aus filtern.</p>

<h4>Schritt 10 — Die Zahlen oben lesen</h4>
${gshot('ui-kpi','Die Auswertungszeile und darunter die Filterzeile')}
<p>Von links nach rechts: was hereinkommt, was die Alltagskategorien kosten, was die Rechnungen
kosten, was davon <b>noch offen</b> ist — und ganz rechts, was übrig bleibt. Ist die letzte Zahl
grün, trägt sich der Monat selbst.</p>
<p>Die Zeile heißt <b>${t('month.ana')}</b> und ist zugleich eine Tür: <b>klick sie an</b>, und
darunter klappt ein Zeitstrahl auf, der zeigt, wie sich dein Kontostand durch den Monat bewegt —
womit der Monat angefangen hat, was am Anfang, in der Mitte und am Ende abgegangen ist und was nach
dem Monatsabschluss übrig bleibt. Jede Zeile lässt sich anklicken und filtert damit alles darunter,
und die Farben sagen, welche Art von Geld den Stand bewegt hat. Dazu gibt es einen eigenen Abschnitt
in <b>${t('guide.tabProduct')}</b>.</p>
${gshot('ui-analytics','Der Auswertungsbereich, aufgeklappt')}

<h4>Schritt 11 — Wenn der Saldo nicht aufgeht</h4>
${gshot('month-bal','Die Saldokorrektur — eine Zeile über den Einnahmen')}
<p>Irgendwann laufen der Saldo in FINA und der Stand auf dem Konto auseinander: eine Rundung, eine
Zahlung, die nie im Buch gelandet ist. Such nicht lange. Trag die Differenz in dem Monat in
<b>${t('bal.row')}</b> ein, und der Saldo stimmt wieder.</p>
<p>Abgehakt wird diese Zeile nicht — der Betrag, den du tippst, <i>ist</i> die Korrektur.</p>

<h4>Schritt 12 — Das ganze Jahr sehen</h4>
${gshot('year-left','Die Jahrestabelle: je Position eine Zeile, je Monat eine Spalte')}
<p>Jetzt öffne <b>${t('view.jahr')}</b>. Je Position eine Zeile, je Monat eine Spalte, und links
die schmalen Spalten mit den Kürzeln: <b>B</b> Bank, <b>PT</b> Zahlungsart, <b>DD</b> Fälligkeit,
<b>LP</b> letzte Zahlung. Was die Zeichen ✓ und ? bedeuten, steht rechts auf Höhe der Reiter.</p>
<p>Beträge sind grün im Plus, rot im Minus und gelb, solange sie geschätzt sind. Grau hinterlegte
Zeilen sind für dieses Jahr erledigt. Ein Klick auf einen Monatsnamen bringt dich in diesen Monat,
und ein <b>Doppelklick auf einen Betrag oder auf die Bezeichnung</b> öffnet die Position —
dasselbe Fenster wie der Stift links, von jedem der zwölf Monate und von der Gesamtspalte aus.</p>
<p>Die drei Blockzeilen — ${t('g.income')}, ${t('g.flex')}, ${t('g.fixed')} — bleiben beim
Scrollen oben stehen, solange du in ihrem Block liest; genau wie die Überschriften in der
Monatsansicht.</p>
<p>Die Leiste über der Tabelle fängt mit demselben Suchfeld an wie die Monatsansicht, und es
enthält dasselbe Wort: was du in der einen Ansicht eintippst, gilt in der anderen weiter. Hier
sucht es über alle zwölf Monate und gilt für jede Zeile, in der etwas steht. Tippst du den Namen
eines Blocks oder einer Kategorie, steht dieser Block ganz da, mit allem darunter — man sucht eine
Kategorie schließlich, um sie zu sehen, nicht um sie leer zu finden. Eine Zeile wird nie
weggefiltert: <b>${t('year.balanceRow')}</b> gehört zum Gerüst wie die Spaltenköpfe darüber. Sie
bleibt beim Scrollen unter ihnen stehen, ganz gleich, was im Feld steht — sie ist die Zeile, gegen
die du alle anderen liest.</p>
<p>Wie in der Monatsansicht bleibt die Schreibmarke im Feld: nach den beiden Knöpfen daneben und
nach einem Sprung in einen Monat kehrt sie zurück, solange etwas darin steht. Beim Öffnen einer
Datei wird das Feld geleert — ein neues Buch soll dir nicht durch den Filter des alten
erscheinen.</p>
<p>Der <b>&#9776;</b>-Knopf davor ist derselbe wie in der Monatsansicht und enthält dieselbe Wahl:
worin der Filter sucht, stellst du einmal ein, und es gilt in beiden Ansichten. Zwei der fünf
Angaben gehören besonders hierher — <b>${t('flt.fTotal')}</b>, die Zahl in der letzten Spalte, und
<b>${t('flt.fMeta')}</b>, worunter auch die Namen der Blöcke und Kategorien fallen. Nimm die
heraus, und ein Kategoriename öffnet seinen Block nicht mehr.</p>
<p>Daneben zwei Knöpfe. <b>${t('year.hideDone')}</b> klappt jeden Monat weg, in dem nichts mehr
offen ist; <b>${t('year.hideSettled')}</b> blendet die Positionen aus, die für dieses Jahr
abbezahlt sind. Keiner von beiden ist zu Anfang an. Sie behalten ihren Namen und zeigen am dunklen
Grund, dass sie gelten; ein zweiter Klick schaltet sie ab — und beide merkt sich deine Datei, die
Tabelle sieht beim nächsten Öffnen also aus wie beim Zumachen.</p>
${gshot('year','Die Jahresansicht: links Suchfeld und die beiden Filterknöpfe, rechts, was etwas anlegt')}

<h4>Schritt 13 — Nach vorn schauen</h4>
${gshot('forecast','Die Prognose: das ganze Jahr, Monat für Monat')}
<p><b>${t('view.prognose')}</b> rechnet zusammen, was noch kommt, und zeigt den Saldo, der am
31. Dezember zu erwarten ist. Eine Tabelle, eine Zeile je Monat, der laufende hervorgehoben.</p>
<p>Die Überschriften sind kurz — <b>M · IN · REG · FLEX · COR · BAL · CUM</b> —, damit die Spalten
nur so breit sind wie ihre Zahlen. Fahr mit der Maus darüber, dann steht da, was sie bedeuten. Die
Monate vor diesem stehen blass: die sind abgerechnet.</p>
<p>Die letzte Spalte, <b>${t('prog.colFlow')}</b>, ist dasselbe Bild wie der Zeitstrahl in der
Monatsansicht, eine Ebene höher: jeder Monat fängt beim Stand des Monats davor an und endet bei
seinem eigenen, dazwischen liegen die Anteile in den Farben der drei Geldarten. Die hellen
senkrechten Linien sind ein Raster — in der Überschrift steht, was ein Schritt wert ist, damit du
ablesen kannst, <i>um wie viel</i> sich ein Monat bewegt hat und nicht nur, dass er es tat.</p>
<p>Für die Monate, die du noch nicht gelebt hast, braucht die Prognose je Alltagskategorie eine
Annahme. Du setzt sie dort, wo die zwölf Monate stehen: Kategorie mit dem Stift oder per Doppelklick
öffnen — der bisherige Mittelwert steht gleich über dem Betrag.</p>

<h4>Schritt 14 — Speichern und die Datei sichern</h4>
<p><b>${t('app.save')}</b> schreibt alles — Zahlen und Einstellungen — in deine Datei. Chrome und
Edge schreiben dabei in genau dieselbe Datei zurück; andere Browser legen eine frische Kopie im
Download-Ordner ab.</p>
<p>Die Datei ist einfacher Text und gehört dir allein. Kopier sie ab und zu an einen sicheren Ort:
sie ist der einzige Ort, an dem deine Zahlen stehen.</p>

<h4>Wenn du Fast Budget benutzt</h4>
<p>Exportiere dort deine Transaktionen als CSV-Datei und lade sie hier über
<b>${t('app.import')}</b>. Der Knopf steht in der <b>Kopfzeile</b>, neben ${t('app.load')} und
${t('app.save')} — nicht in einer Ansicht. Er öffnet zuerst ein kurzes Fenster: aus welcher App
die Datei kommt und welche Spalten darin stehen müssen (<code>Datum</code>,
<code>Wert (EUR)</code>, <code>Hauptkategorie</code>). Danach wählst du die Datei. FINA zeigt dir,
welche Monate darin stehen, lässt dich einzelne abwählen und sagt genau, was überschrieben wird.
Erst der allerletzte Knopf ändert etwas, und die gewählten Monate werden ersetzt, nicht
ergänzt.</p>
<p>Sobald Buchungen in der Datei stehen, kommt am Ende der Reihe ein weiterer Reiter dazu:
<b>${t('view.kakeibo')}</b>. Er schlüsselt die alltäglichen Ausgaben bis zu den Unterkategorien und
einzelnen Buchungen auf — dafür ist der Import da.</p>

<h4>Die Kurzfassung</h4>
<ol>
  <li>Einstellungen: Sprache, Jahr, Konten, Gruppen.</li>
  <li>Einnahmen eintragen.</li>
  <li>Rechnungen eintragen — je Vertrag eine Position, Beträge mit Minus.</li>
  <li>Alltagskategorien eintragen — eine Schätzung genügt.</li>
  <li>Jeden Monat: abhaken, korrigieren, <b>${t('app.save')}</b>.</li>
</ol>
<p>Alles andere in FINA beantwortet eine Frage, die du noch nicht gestellt hast. Wenn du sie
stellst, steht die Antwort oben unter <b>${t('guide.tabProduct')}</b>.</p>
`},

/* ── Reiter 2: Was FINA kann ───────────────────────────────── */
product:{

en:()=>`
<h4>What FINA is</h4>
<p>FINA is a cash book for one single year. You write down what comes in and what goes out,
month by month, and tick off what has actually been paid. In return it tells you at any moment
how much is left this month and how the year is going to end.</p>
<p>Everything lives in <b>one file on your own computer</b> — no account, no server, nothing is
sent anywhere. The app only ever writes to that file when you press <b>${t('app.save')}</b>.
Keep a copy of it somewhere safe: it is the only place your figures exist.</p>

<h4>The three kinds of money</h4>
<p>FINA sorts everything you have into three drawers. It helps to know which is which before you
start typing.</p>
<ul>
  <li><b>${t('g.income')}</b> — money coming in: wages, refunds, anything positive.</li>
  <li><b>${t('g.fixed')}</b> — the bills that repeat and whose amount you know in advance: rent,
      insurance, an instalment, a subscription. One item per contract.</li>
  <li><b>${t('g.flex')}</b> — everyday spending that changes from month to month: groceries,
      fuel, going out. You do not list every single purchase here. You keep a handful of
      <i>categories</i> and give each one an amount per month — either what you expect to spend, or
      what you really spent once you know it.</li>
</ul>
<p>Above all three sits a single row called <b>${t('bal.row')}</b>. It exists for the difference
that cannot be explained — a rounding error, a payment that never made it into the book. You put
the missing amount there and the balance is right again. There is nothing to tick off on that row:
the amount you type <i>is</i> the correction.</p>
${gshot('month-bal','The balance correction, above the income block')}

<h4>Getting started</h4>
<ol>
  <li>On the first screen press <b>${t('wel.open')}</b> and pick your file — or
      <b>${t('wel.new')}</b> to begin an empty book, which the first <b>${t('app.save')}</b> will
      then write to disk. That page is also what you see again after
      <b>${t('app.unlink')}</b>.</li>
  <li>Open <b>${t('app.settings')}</b> and set the language and the year you are keeping the book
      for. Under <b>${t('set.banks')}</b> and <b>${t('set.pays')}</b> you can name your accounts and
      how you pay; under <b>${t('set.groups')}</b> you decide how your bills are grouped
      (“Living”, “Insurance”, “Car” — whatever suits you), and under <b>${t('set.kak')}</b> you
      name the everyday categories.</li>
  <li>Now fill it: <b>${t('year.addKak')}</b> for an everyday category,
      <b>${t('year.addItem')}</b> for a bill that repeats, <b>${t('year.addIncome')}</b> for money
      coming in. The buttons sit in the month view and in the year view.</li>
  <li>Press <b>${t('app.save')}</b>. Nothing is stored automatically — while something is unsaved,
      the file name at the top is shown in bold red.</li>
</ol>
<p>With a file open FINA starts in the current month, with a fresh empty book in the year view —
in the month you work, in the year you build.</p>
${gshot('set-lists','Settings: every list has a code and a label of your own')}

<h4>The views</h4>
<p><b>${t('view.monat')}</b> — one month, close up. This is where you work day to day: you see every
amount due, and you tick off what you have paid. The tabs above take you from month to month. At the
top of the page sit the analytics line and, under it, one filter row for the whole month — a search
field, the due dates, the payment state —, and both stay at the top of the screen while you scroll,
together with the heading of the block you are in. Every block can be folded away with the arrow at
the left of its heading. A row on grey is done for this year; a double-click on an amount or on a
name opens the item.</p>
${gshot('month-out','The month view, block by block')}
<p><b>${t('view.jahr')}</b> — the whole year as a table: one row per item, one column per month.
This is where you plan and where you spot the gaps.</p>
${gshot('year-left','The year table with the code columns B, PT, DD and LP')}
<p><b>${t('view.prognose')}</b> — how the year ends. It adds up what is still to come and shows the
balance you can expect on 31 December.</p>
${gshot('forecast','The forecast: every month up to the year-end balance')}
<p>It is <b>one table across the full width</b>: a row per month, short headings that explain
themselves when you point at them, the current month highlighted, the settled months pale. On the
right sits <b>${t('prog.colFlow')}</b> — the same waterfall as in the month view, only over twelve
months, on a grid whose step is named in the heading.</p>
<p>The assumption the forecast works from for the coming months is kept where the twelve months are:
in the category window, by pencil or double-click. The average of the months that are already
settled stands there in orange above the amount — so you have both in front of you while you
type.</p>
<p>And there is a fourth tab, <b>${t('view.kakeibo')}</b> — the everyday spending in detail: what
each category costs in the chosen period and what it costs on average per month. It only appears
<b>once you have imported bookings</b> from Fast Budget, and it sits last, after
${t('view.prognose')}: it evaluates exactly those bookings, and without them it would show an empty
outline. Mind the name — the tab is called ${t('view.kakeibo')}, while the kind of money keeps its
own name, <b>${t('g.flex')}</b>, in the blocks and categories everywhere else.</p>
${gshot('flex-view','Flexible Payments: spending by category')}
<p>Its left-hand card carries a column <b>${t('kak.colKind')}</b> in front of every amount: it says
where that figure comes from — <b>${t('kak.kImp')}</b> from the import, <b>${t('kak.kCorr')}</b>
where you overwrote an imported month, <b>${t('kak.kDone')}</b> where you ticked one off,
<b>${t('kak.kFix')}</b> for a typed amount that is not an estimate, <b>${t('kak.kEst')}</b> for what
is still open. Over a whole year it counts the months per kind, the commonest first.</p>

<h4>The analytics area</h4>
<p>Above every month sits one thin line with the five figures of the month: what comes in, what
the everyday categories cost, what the bills cost, what of that is <b>still open</b>, and what is
left. Click anywhere on it and it opens — below the figures a timeline appears that shows how your
balance moves through the month.</p>
${gshot('ui-analytics','The analytics area, opened: figures, timeline, filter row')}
<p>It starts closed on purpose. The line sticks to the top of the screen while you scroll, so
closed it costs one row instead of six. Once you open it, it stays open until you close it again;
that choice belongs to the screen and is not kept in the file.</p>
<p><b>Five rows, in the order the month runs:</b> <b>${t('month.tlOpen')}</b> — what the months
before it left over —, then <b>${t('month.fDueA')}</b> (days 1–10), <b>${t('month.fDueM')}</b>
(11–20), <b>${t('month.fDueE')}</b> (from the 21st) and finally <b>${t('month.tlClose')}</b>. Every
row names its days, what moved in it, and the balance afterwards.</p>
<p><b>${t('month.tlOpen')} is not a period but a level:</b> the sum of the months before it in this
file — in January there is nothing to carry in. It is the only row that does not filter, because
nothing falls due in it.</p>
<p><b>${t('month.tlClose')} takes up everything without a payday:</b> the ${t('g.flex')}, the
balance correction, and every item you left without a due date. Its figure is therefore the balance
of the whole month.</p>
${gshot('ui-waterfall','The waterfall: every row starts where the row above it ended')}
<p><b>The bar is a waterfall.</b> The scale is the balance itself — the further right, the more is
left; left of the line lies the red area, right of it the green one. Every row starts at the
balance of the row above it and ends at its own, the dark tick. In between stands what made the
difference: money coming in grows to the right, money going out takes it back to the left, and
every piece is coloured by its kind — <b>green</b> ${t('g.income')}, <b>yellow</b> ${t('g.flex')},
<b>red</b> ${t('g.fixed')}, <b>blue</b> the balance correction.</p>
<p>A row can do both. First the salary arrives, then the rent goes off: the bar then reaches past
its own result and comes back, so you can see how much came in and how much of it went straight out
again. Hold the mouse over a colour and its amount appears — that is the only hint in this area,
the colours say the rest.</p>
<p>If your balance is far from zero — five figures on the account against four figures of movement
in the month — the scale is cut, otherwise the movements would shrink to nothing. The first bar
then frays out towards the left and the range it covers is printed under the chart.</p>
<p><b>A click filters.</b> Click a row and everything below shows only that part of the month — the
same as the due-date buttons in the filter row, only where you happen to be reading. Click it again
and the filter is off.</p>

<h4>A regular cost, step by step</h4>
<p>Click <b>${t('year.addItem')}</b>, or the little pencil next to an item that already exists. The
window that opens has three parts.</p>
<p><b>At the top, who and what:</b> the name, the group it belongs to, which account it is paid from,
how it is paid, on which day of the month it is due, and — if it ever stops — the month and year of
the last payment. There is also room for a link to the invoice or the contract. The group is not
preselected: a new item asks for it, and without one it is not saved.</p>
<p><b>In the middle, the amounts:</b> twelve boxes, one per month.
<b>An expense is written with a minus sign</b> — “-49,90”. Income has no sign. The sign shows while
you type: <span class="neg">red</span> from the minus, <span class="pos">green</span> from the
plus, in the twelve boxes as in the quick entry, in closed months just as in open ones. If you
would type the same amount into many months, use the quick entry above: type the amount once,
choose how often it repeats and from which month, and press <b>${t('item.apply')}</b>.</p>
<p><b>Below every month, a tick:</b> it means “this one is settled”. A ticked month locks its
amount so you cannot change it by accident; untick it and you can type again. Two buttons do this
in bulk: one closes every month that is already over, the other reopens all of them. The month you
are currently in is deliberately left open — it is not finished yet.</p>
${gshot('item-dialog','The item window')}
<p>Is an amount not fixed yet — the electricity bill, roughly? Tick the box
<b>“${t('item.est')}”</b>. FINA then shows the figure in yellow with a question mark, so you can see
at a glance which numbers are guesses. As soon as you tick the month off, the guess counts as
confirmed and the colour goes back to normal.</p>
<p>At the bottom of the window, next to Cancel, stands <b>${t('item.dup')}</b>. It opens the same
window once more with a copy of what is currently typed: all the master data and all twelve
amounts, but not a single tick and no notes, so every month is editable straight away. The copy is
created with <b>${t('g.save')}</b> and not before — cancelling leaves nothing behind, and the
original stays as it was in either case. The window for an everyday category has the same
button.</p>

<h4>Everyday spending</h4>
<p>Everyday spending works the same way, only with categories instead of contracts. Give a category
an amount per month and tick it off once the month is done. If you have never spent time on it, an
estimate is enough — FINA marks it as a guess; in the month view that mark sits at the right-hand
end of the row, because it says something about the figure, not about the name.</p>
<p>If you use the <b>Fast Budget</b> app on your phone, you can save yourself the typing: export
your transactions there as a CSV file and load it here with <b>${t('app.import')}</b>. The button
sits in the <b>top bar</b>, next to ${t('app.load')} and ${t('app.save')} — the way in cannot lie
inside a tab that only exists afterwards. It opens with a short window naming the app the file
comes from and the columns it must contain (<code>Datum</code>, <code>Wert (EUR)</code>,
<code>Hauptkategorie</code>). After that FINA reads
the file, shows you which months are in it, lets you deselect any of them and tells you exactly what
it is about to overwrite. Only the very last button changes anything, and the chosen months are
<b>replaced, not added to</b>. After that the app also knows your subcategories and every single
booking behind them.</p>
<p>Both ways can live side by side: months you imported show the real figures, months you did not
show the ones you typed. If an imported figure is wrong you can simply overwrite it — the month is
then marked as corrected, and the import is not lost.</p>

<h4>Reading the year table</h4>
<ul>
  <li>The narrow columns on the left carry the codes: <b>B</b> bank, <b>PT</b> payment type,
      <b>DD</b> due date, <b>LP</b> last payment.</li>
  <li>Every month has two columns: the amount, and a narrow one next to it for the mark. A
      <span class="mk-ok">✓</span> means paid, a <span class="mk-q">?</span> means the amount is
      still a guess, empty means still open.</li>
  <li>Amounts are <span class="pos">green</span> when positive and <span class="neg">red</span> when
      negative, <span class="est">yellow</span> while they are only estimated.</li>
  <li>The column <b>${t('year.end')}</b> holds the last payment of an item and colours how much of
      the term is left, the current month included:
      <span class="endkey e-now">this one only</span> <span class="endkey e-soon">2 to 3 months</span>
      <span class="endkey e-mid">4 to 6</span> <span class="endkey e-far">7 and more</span>. That way you
      see at a glance what is about to fall away.</li>
  <li>Rows on grey are done for this year — nothing is left to pay. They sink to the bottom of their
      group; <b>${t('year.hideSettled')}</b> hides them completely.</li>
  <li>A month whose name is struck through is fully ticked off. <b>${t('year.hideDone')}</b> folds
      those months away when you need the room; the total column keeps counting all twelve.</li>
  <li>Both buttons keep their label and show at a dark background that they are being applied; a
      second click switches them off. Neither is on to begin with, and both are stored in your file —
      the table comes back the way you left it.</li>
  <li>The search field in the same bar filters every row of the table that has content and searches
      all twelve months — as far as you allow it to, see below. It shares its word with the month
      view. Hit the name of a block or of a category, and that block stands there whole.
      <b>${t('year.balanceRow')}</b> is the exception: it belongs to the frame like the column
      headings and stays put whatever you type.</li>
  <li>The three block rows stay at the top of the screen while you scroll through their block.</li>
  <li>Clicking a month name takes you into that month; a double-click on an amount or on the name
      opens the item, the same window as the pencil.</li>
</ul>

<h4>Finding something</h4>
<p>The month view and the year view share one search field, and they share its word: type it in one
and it still applies in the other. It filters while you type, in parts of words and of figures and
without regard to capitals; “1.234,56” and “1234.56” find the same row. In the month view it looks
at the month on screen, in the year view at all twelve. Nothing in the file changes — only what you
see.</p>
<p>In front of the field sits a small <b>&#9776;</b> button, and it decides <b>what the word is
looked for in</b>: <b>${t('flt.fName')}</b>, <b>${t('flt.fNote')}</b>, <b>${t('flt.fAmount')}</b>,
<b>${t('flt.fTotal')}</b>, <b>${t('flt.fMeta')}</b>. Everything is ticked to begin with — that is
the search that looks everywhere. Take entries out and the filter narrows: only names, say, or only
figures. <b>${t('g.save')}</b> keeps the choice, <b>${t('g.cancel')}</b> drops it, and at least one
entry has to stay ticked — a filter with nothing to search would simply find nothing, so FINA says
so in red instead of saving.</p>
<p>The choice is part of your file, like the two buttons of the year view: set it once and it is
there again the next time you open the book. And you can see it without opening the window — the
button stands on a dark background as long as not everything is being searched.</p>
<p>The cursor stays where you are typing: after a tick, a filter button, a change of month or a
jump out of the year table into a month, it returns to the field — as long as something is in it.
An empty field is left alone. Opening a file clears it, so a new book never appears through the
filter of the old one.</p>

<h4>Notes</h4>
<p>The small lamp is a note. There are two kinds: the lamp <b>next to a name</b> holds a note about
the item itself and shows up wherever the item appears; the lamp <b>inside a month</b> belongs to
that one month only — “paid in cash”, “check the invoice”. A lit lamp means there is a note; hover
over it to read it.</p>
<p>The lamps work before anything has been saved: a brand new item and a brand new category have
them from the moment their window opens. What you write there travels with the item when you save
it and is dropped with it when you cancel.</p>
<p>A note keeps its lines. Where you start a new line, a new line is shown — in the bubble at the
lamp, in the two lines of preview under the name and in the month cells of the edit window. A note
can be a list.</p>

<h4>Saving and safety</h4>
<p>Nothing is ever written by itself. <b>${t('app.save')}</b> writes everything — figures and
settings — into your file. In Chrome and Edge it writes back into the very same file; other browsers
put a fresh copy in your downloads folder. <b>${t('app.unlink')}</b> puts the file down and empties
the screen; if anything is unsaved you are warned first.</p>
<p>The file is plain text and yours alone. Copy it, back it up, take it to another computer — FINA
will read it there just the same.</p>
`,

de:()=>`
<h4>Was FINA ist</h4>
<p>FINA ist ein Kassenbuch für genau ein Jahr. Du trägst ein, was hereinkommt und was hinausgeht,
Monat für Monat, und hakst ab, was tatsächlich bezahlt ist. Dafür sagt dir die Anwendung jederzeit,
wie viel dir in diesem Monat bleibt und wie das Jahr ausgehen wird.</p>
<p>Alles steht in <b>einer einzigen Datei auf deinem eigenen Rechner</b> — kein Konto, kein Server,
es wird nichts irgendwohin geschickt. Geschrieben wird nur, wenn du auf
<b>${t('app.save')}</b> klickst. Bewahre eine Kopie der Datei auf: sie ist der einzige Ort, an dem
deine Zahlen stehen.</p>

<h4>Die drei Arten von Geld</h4>
<p>FINA sortiert alles in drei Schubladen. Es hilft, sie vor dem ersten Eintrag zu kennen.</p>
<ul>
  <li><b>${t('g.income')}</b> — was hereinkommt: Lohn, Rückzahlungen, alles Positive.</li>
  <li><b>${t('g.fixed')}</b> — die Rechnungen, die wiederkehren und deren Höhe du vorher kennst:
      Miete, Versicherung, eine Rate, ein Abo. Je Vertrag eine Position.</li>
  <li><b>${t('g.flex')}</b> — die alltäglichen Ausgaben, die jeden Monat anders ausfallen:
      Lebensmittel, Sprit, Ausgehen. Hier wird nicht jeder einzelne Einkauf aufgeschrieben. Du
      pflegst eine Handvoll <i>Kategorien</i> und gibst jeder einen Betrag je Monat — entweder was
      du erwartest oder, sobald du es weißt, was es wirklich war.</li>
</ul>
<p>Über allen dreien steht eine einzelne Zeile namens <b>${t('bal.row')}</b>. Sie ist für die
Differenz da, die sich nicht erklären lässt — eine Rundung, eine Zahlung, die nie im Buch gelandet
ist. Du trägst den fehlenden Betrag dort ein, und der Saldo stimmt wieder.</p>
${gshot('month-bal','Die Saldokorrektur, über dem Einnahmenblock')}

<h4>Die ersten Schritte</h4>
<ol>
  <li>Klick auf <b>${t('app.load')}</b> und wähle deine Datei. Du fängst bei null an? Überspring den
      Schritt, trag etwas ein — beim ersten <b>${t('app.save')}</b> entsteht die Datei.</li>
  <li>Öffne <b>${t('app.settings')}</b> und stell die Sprache und das Jahr ein, für das du das Buch
      führst. Unter <b>${t('set.banks')}</b> und <b>${t('set.pays')}</b> benennst du deine Konten und
      Zahlungswege; unter <b>${t('set.groups')}</b> legst du fest, wie deine Rechnungen gruppiert
      sind („Wohnen", „Versicherungen", „Auto" — ganz wie es dir passt), und unter
      <b>${t('set.kak')}</b> benennst du die Alltagskategorien.</li>
  <li>Jetzt füllst du es: <b>${t('year.addKak')}</b> für eine Alltagskategorie,
      <b>${t('year.addItem')}</b> für eine Rechnung, die wiederkehrt, <b>${t('year.addIncome')}</b>
      für Geld, das hereinkommt. Die Knöpfe gibt es in der Monats- und in der Jahresansicht.</li>
  <li>Klick auf <b>${t('app.save')}</b>. Von selbst wird nichts gespeichert — solange etwas offen
      ist, steht der Dateiname oben fett und rot.</li>
</ol>
<p>Mit geladener Datei beginnt FINA im laufenden Monat, ohne Datei in der Jahresansicht — im Monat
wird gearbeitet, im Jahr angelegt.</p>
${gshot('set-lists','Die Einstellungen: jede Liste hat ein eigenes Kürzel und eine Bezeichnung')}

<h4>Die Ansichten</h4>
<p><b>${t('view.monat')}</b> — ein Monat aus der Nähe. Hier arbeitest du im Alltag: du siehst jeden
fälligen Betrag und hakst ab, was du bezahlt hast. Über die Reiter darüber gehst du von Monat zu
Monat. Ganz oben stehen die Auswertungszeile und darunter eine Filterzeile für den ganzen Monat —
Suchfeld, Fälligkeit, Zahlungsstand —; beide bleiben beim Scrollen oben stehen, zusammen mit der
Überschrift des Blocks, in dem du gerade liest. Jeden Block kannst du mit dem Pfeil links in seiner
Überschrift oder einem Doppelklick darauf zuklappen; beim Filtern klappt FINA sie von selbst auf und
zu. Eine Zeile auf grauem Grund ist für dieses Jahr erledigt; ein Doppelklick auf den Betrag oder
auf die Bezeichnung öffnet die Position.</p>
${gshot('month-out','Die Monatsansicht, Block für Block')}
<p><b>${t('view.jahr')}</b> — das ganze Jahr als Tabelle: je Position eine Zeile, je Monat eine
Spalte. Hier planst du, und hier fallen dir Lücken auf.</p>
${gshot('year-left','Die Jahrestabelle mit den Kürzelspalten B, PT, DD und LP')}
<p><b>${t('view.prognose')}</b> — wie das Jahr ausgeht. Sie rechnet zusammen, was noch kommt, und
zeigt den Saldo, der am 31. Dezember zu erwarten ist.</p>
${gshot('forecast','Die Prognose: jeder Monat bis zum Saldo am Jahresende')}
<p>Sie ist <b>eine Tabelle über die volle Breite</b>: eine Zeile je Monat, kurze Überschriften mit
Erklärung beim Überfahren, der laufende Monat hervorgehoben, die abgerechneten Monate blass. Ganz
rechts steht der <b>${t('prog.colFlow')}</b> — derselbe Wasserfall wie im Monat, nur über zwölf
Monate, mit einem Raster, dessen Schrittweite in der Überschrift steht.</p>
<p>Die Annahme, mit der die Prognose für die kommenden Monate rechnet, wird dort gepflegt, wo die
zwölf Monate stehen: im Fenster der Kategorie, über Stift oder Doppelklick. Der Mittelwert der
Monate, die schon feststehen, steht dort orange über dem Betrag — du hast beim Eintragen also beides
vor dir.</p>
<p>Und es gibt einen vierten Reiter, <b>${t('view.kakeibo')}</b> — die alltäglichen Ausgaben im
Einzelnen: was jede Kategorie im gewählten Zeitraum kostet und was sie im Schnitt je Monat kostet.
Ihn gibt es <b>nur mit importierten Buchungen</b> aus Fast Budget, und er steht als letzter, hinter
der ${t('view.prognose')}: er wertet genau diese Buchungen aus, ohne sie stünde dort eine leere
Gliederung. Achte auf den Namen — der Reiter heißt ${t('view.kakeibo')}, die Art von Geld behält
überall sonst ihren eigenen: <b>${t('g.flex')}</b>.</p>
${gshot('flex-view','Flexible Payments: die Ausgaben je Kategorie')}
<p>In seiner linken Karte steht vor jedem Betrag die Spalte <b>${t('kak.colKind')}</b>: sie sagt,
woher die Zahl stammt — <b>${t('kak.kImp')}</b> aus dem Import, <b>${t('kak.kCorr')}</b>, wo du
einen importierten Monat überschrieben hast, <b>${t('kak.kDone')}</b>, wo du abgehakt hast,
<b>${t('kak.kFix')}</b> für einen eingetippten Betrag, der keine Schätzung ist, und
<b>${t('kak.kEst')}</b> für das, was noch offen ist. Über ein ganzes Jahr zählt sie die Monate je
Art, die häufigste zuerst.</p>

<h4>Der Auswertungsbereich</h4>
<p>Über jedem Monat steht eine dünne Zeile mit den fünf Zahlen des Monats: was hereinkommt, was die
alltäglichen Kategorien kosten, was die Rechnungen kosten, was davon <b>noch offen</b> ist und was
übrig bleibt. Ein Klick irgendwo darauf klappt sie auf — unter den Zahlen erscheint ein Zeitstrahl,
der zeigt, wie sich dein Kontostand durch den Monat bewegt.</p>
${gshot('ui-analytics','Der Auswertungsbereich, aufgeklappt: Zahlen, Zeitstrahl, Filterzeile')}
<p>Zugeklappt ist Absicht. Die Zeile klebt beim Scrollen oben am Bildschirm; zugeklappt kostet sie
eine Zeile statt sechs. Einmal aufgeklappt bleibt sie offen, bis du sie wieder zuklappst — das
gehört zur Anzeige und wird nicht in der Datei gespeichert.</p>
<p><b>Fünf Zeilen in der Reihenfolge des Monats:</b> <b>${t('month.tlOpen')}</b> — was die Monate
davor übrig gelassen haben —, dann <b>${t('month.fDueA')}</b> (1. bis 10.),
<b>${t('month.fDueM')}</b> (11. bis 20.), <b>${t('month.fDueE')}</b> (ab dem 21.) und zuletzt
<b>${t('month.tlClose')}</b>. Jede Zeile nennt ihre Tage, was sich in ihr bewegt hat, und den
Kontostand danach.</p>
<p><b>${t('month.tlOpen')} ist kein Zeitraum, sondern ein Stand:</b> die Summe der Monate davor in
dieser Datei — im Januar kommt also nichts mit. Es ist die einzige Zeile, die nicht filtert, denn
fällig wird in ihr nichts.</p>
<p><b>${t('month.tlClose')} nimmt alles ohne Zahltag auf:</b> die ${t('g.flex')}, die
Saldokorrektur und jeden Posten, bei dem du keine Fälligkeit eingetragen hast. Ihre Zahl ist
deshalb der Saldo des ganzen Monats.</p>
${gshot('ui-waterfall','Der Wasserfall: jede Zeile fängt dort an, wo die Zeile darüber aufgehört hat')}
<p><b>Der Balken ist ein Wasserfall.</b> Der Maßstab ist der Kontostand selbst — je weiter rechts,
desto mehr bleibt übrig; links der Linie liegt der rote Bereich, rechts der grüne. Jede Zeile fängt
beim Kontostand der Zeile darüber an und endet bei ihrem eigenen, dem kräftigen Strich. Dazwischen
steht, was den Unterschied gemacht hat: die Zufuhr wächst nach rechts, der Abzug holt sie nach
links zurück, und jeder Anteil trägt die Farbe seiner Art — <b>grün</b> ${t('g.income')},
<b>gelb</b> ${t('g.flex')}, <b>rot</b> ${t('g.fixed')}, <b>blau</b> die Saldokorrektur.</p>
<p>Eine Zeile kann beides. Erst kommt das Gehalt, dann geht die Miete ab: der Balken reicht dann
über sein eigenes Ergebnis hinaus und kommt zurück — so siehst du, wie viel hereinkam und wie viel
davon gleich wieder abging. Führ die Maus über eine Farbe, und ihr Betrag erscheint; das ist der
einzige Hinweis in diesem Bereich, den Rest sagen die Farben.</p>
<p>Liegt dein Kontostand weit von der Null entfernt — fünfstellig auf dem Konto gegen vierstellige
Bewegungen im Monat —, wird der Maßstab beschnitten, sonst schrumpften die Bewegungen zu nichts
zusammen. Der erste Balken franst dann nach links aus, und unter der Grafik steht, welchen Bereich
sie zeigt.</p>
<p><b>Ein Klick filtert.</b> Klick auf eine Zeile, und alles darunter zeigt nur noch diesen Teil des
Monats — dasselbe wie die Fälligkeitsknöpfe in der Filterzeile, nur an der Stelle, an der du gerade
liest. Ein zweiter Klick nimmt den Filter wieder zurück.</p>

<h4>Regelmäßige Kosten, Schritt für Schritt</h4>
<p>Klick auf <b>${t('year.addItem')}</b> oder auf den kleinen Stift neben einer vorhandenen Position.
Das Fenster, das aufgeht, hat drei Teile.</p>
<p><b>Oben, wer und was:</b> der Name, die Gruppe, zu der die Position gehört, von welchem Konto sie
abgeht, wie bezahlt wird, an welchem Tag im Monat sie fällig ist und — falls sie einmal endet —
Monat und Jahr der letzten Zahlung. Dazu ist Platz für einen Link zur Rechnung oder zum Vertrag.
Die Gruppe ist nicht vorausgewählt: eine neue Position fragt danach und wird ohne sie nicht
gespeichert.</p>
<p><b>In der Mitte die Beträge:</b> zwölf Felder, eines je Monat.
<b>Eine Ausgabe wird mit Minus geschrieben</b> — „-49,90". Einnahmen bekommen kein Vorzeichen. Das
Vorzeichen zeigt sich beim Tippen: <span class="neg">rot</span> ab Minus,
<span class="pos">grün</span> ab Plus, in den zwölf Feldern wie in der schnellen Eingabe, im
abgeschlossenen Monat wie im offenen. Wenn
derselbe Betrag in viele Monate soll, nimm die schnelle Eingabe darüber: Betrag einmal eintippen,
Wiederholung und Startmonat wählen, auf <b>${t('item.apply')}</b> klicken.</p>
<p><b>Unter jedem Monat ein Haken:</b> er heißt „dieser ist erledigt". Ein abgehakter Monat sperrt
seinen Betrag, damit er nicht aus Versehen verrutscht; Haken weg, und du kannst wieder tippen. Zwei
Knöpfe erledigen das in einem Rutsch: der eine schließt alle Monate ab, die schon vorbei sind, der
andere öffnet sie alle wieder. Der laufende Monat bleibt dabei mit Absicht offen — er ist noch nicht
zu Ende.</p>
${gshot('item-dialog','Das Posten-Fenster')}
<p>Steht ein Betrag noch nicht fest — die Stromrechnung, ungefähr? Dann setz den Haken bei
<b>„${t('item.est')}"</b>. FINA zeigt die Zahl daraufhin gelb mit einem Fragezeichen, du siehst also
auf einen Blick, welche Zahlen geschätzt sind. Sobald du den Monat abhakst, gilt die Schätzung als
bestätigt und die Farbe wird wieder normal.</p>
<p>Unten im Fenster, neben „Abbrechen", steht <b>${t('item.dup')}</b>. Der Knopf öffnet dasselbe
Fenster noch einmal mit einer Kopie des gerade Getippten: alle Stammdaten und alle zwölf Beträge,
aber kein einziger Haken und keine Notiz — jeder Monat ist damit sofort änderbar. Angelegt wird die
Kopie erst mit <b>${t('g.save')}</b>; wer abbricht, hinterlässt nichts, und die Vorlage bleibt in
beiden Fällen, wie sie war. Das Fenster einer Alltagskategorie hat denselben Knopf.</p>

<h4>Die alltäglichen Ausgaben</h4>
<p>Die alltäglichen Ausgaben laufen genauso, nur mit Kategorien statt Verträgen. Gib einer Kategorie
einen Betrag je Monat und hak sie ab, wenn der Monat durch ist. Wer sich nicht festlegen mag, trägt
eine Schätzung ein — FINA kennzeichnet sie als solche; in der Monatsansicht steht diese Marke am
rechten Ende der Zeile, denn sie sagt etwas über die Zahl, nicht über den Namen.</p>
<p>Wenn du auf dem Handy die App <b>Fast Budget</b> benutzt, kannst du dir das Tippen sparen:
exportiere dort deine Transaktionen als CSV-Datei und lade sie hier über
<b>${t('app.import')}</b>. Der Knopf steht in der <b>Kopfzeile</b>, neben ${t('app.load')} und
${t('app.save')} — der Weg hinein darf nicht in einem Reiter liegen, den es erst danach gibt. Er
öffnet zuerst ein kurzes Fenster mit der App, aus der die Datei kommt, und den Spalten, die darin
stehen müssen (<code>Datum</code>, <code>Wert (EUR)</code>, <code>Hauptkategorie</code>). Danach
liest FINA die Datei, zeigt dir, welche Monate darin stehen, lässt dich
einzelne abwählen und sagt dir genau, was überschrieben wird. Erst der allerletzte Knopf ändert
etwas, und die gewählten Monate werden <b>ersetzt, nicht ergänzt</b>. Danach kennt die Anwendung
auch deine Unterkategorien und jede einzelne Buchung dahinter.</p>
<p>Beide Wege vertragen sich: importierte Monate zeigen die echten Zahlen, die übrigen deine
eigenen. Ist ein importierter Wert falsch, überschreib ihn einfach — der Monat gilt dann als
korrigiert, der Import geht dabei nicht verloren.</p>

<h4>Die Jahrestabelle lesen</h4>
<ul>
  <li>Die schmalen Spalten links tragen die Kürzel: <b>B</b> Bank, <b>PT</b> Zahlungsart,
      <b>DD</b> Fälligkeit, <b>LP</b> letzte Zahlung.</li>
  <li>Jeder Monat hat zwei Spalten: den Betrag und daneben eine schmale für das Zeichen. Ein
      <span class="mk-ok">✓</span> heißt bezahlt, ein <span class="mk-q">?</span> heißt, der Betrag
      ist noch geschätzt, leer heißt offen.</li>
  <li>Beträge sind <span class="pos">grün</span> im Plus und <span class="neg">rot</span> im Minus,
      <span class="est">gelb</span>, solange sie nur geschätzt sind.</li>
  <li>Die Spalte <b>${t('year.end')}</b> enthält die letzte Zahlung einer Position und färbt, wie
      viel Laufzeit noch bleibt, den laufenden Monat mitgezählt:
      <span class="endkey e-now">nur noch dieser</span> <span class="endkey e-soon">2 bis 3 Monate</span>
      <span class="endkey e-mid">4 bis 6</span> <span class="endkey e-far">7 und mehr</span>. So siehst du
      auf einen Blick, was demnächst wegfällt.</li>
  <li>Grau hinterlegte Zeilen sind für dieses Jahr erledigt — dort steht nichts mehr aus. Sie
      rutschen ans Ende ihrer Gruppe; <b>${t('year.hideSettled')}</b> blendet sie ganz aus.</li>
  <li>Ein durchgestrichener Monatsname heißt: vollständig abgehakt. <b>${t('year.hideDone')}</b>
      klappt solche Monate weg, wenn du Platz brauchst; die Gesamtspalte zählt weiter alle zwölf.</li>
  <li>Beide Knöpfe behalten ihre Beschriftung und zeigen am dunklen Grund, dass sie gelten; ein
      zweiter Klick schaltet sie ab. Keiner ist zu Anfang an, und beide stehen in deiner Datei —
      die Tabelle sieht beim nächsten Öffnen aus wie beim Zumachen.</li>
  <li>Das Suchfeld in derselben Leiste filtert jede Zeile der Tabelle, in der etwas steht, und sucht
      über alle zwölf Monate — soweit du es zulässt, siehe unten. Es teilt sein Wort mit der
      Monatsansicht. Triffst du den Namen eines Blocks oder einer Kategorie, steht dieser Block ganz
      da. Die Ausnahme ist <b>${t('year.balanceRow')}</b>: die Zeile gehört zum Gerüst wie die
      Spaltenköpfe und bleibt stehen, ganz gleich, was du tippst.</li>
  <li>Die drei Blockzeilen bleiben beim Scrollen oben stehen, solange ihr Block läuft.</li>
  <li>Ein Klick auf einen Monatsnamen bringt dich in diesen Monat; ein Doppelklick auf einen Betrag
      oder auf die Bezeichnung öffnet die Position — dasselbe Fenster wie der Stift.</li>
</ul>

<h4>Etwas wiederfinden</h4>
<p>Monats- und Jahresansicht teilen sich ein Suchfeld, und sie teilen sich sein Wort: was du in der
einen tippst, gilt in der anderen weiter. Es filtert beim Tippen, in Wortteilen und Zahlstücken und
ohne Rücksicht auf Groß- und Kleinschreibung; „1.234,56" und „1234.56" finden dieselbe Zeile. In
der Monatsansicht sieht es in den Monat auf dem Schirm, in der Jahresansicht in alle zwölf. In der
Datei ändert sich dabei nichts — nur, was du siehst.</p>
<p>Vor dem Feld steht ein kleiner <b>&#9776;</b>-Knopf, und der entscheidet, <b>worin</b> gesucht
wird: <b>${t('flt.fName')}</b>, <b>${t('flt.fNote')}</b>, <b>${t('flt.fAmount')}</b>,
<b>${t('flt.fTotal')}</b>, <b>${t('flt.fMeta')}</b>. Anfangs ist alles angekreuzt — das ist die
Suche, die überall hinsieht. Nimm Angaben heraus, und der Filter wird enger: nur die Namen etwa,
oder nur die Zahlen. <b>${t('g.save')}</b> behält die Wahl, <b>${t('g.cancel')}</b> verwirft sie,
und mindestens eine Angabe muss angekreuzt bleiben — ein Filter ohne etwas zu durchsuchen fände
schlicht nie etwas, deshalb sagt FINA es in Rot, statt zu speichern.</p>
<p>Die Wahl gehört zu deiner Datei, wie die beiden Knöpfe der Jahresansicht: einmal eingestellt,
steht sie beim nächsten Öffnen wieder da. Und du siehst sie, ohne das Fenster zu öffnen — der Knopf
steht auf dunklem Grund, solange nicht alles durchsucht wird.</p>
<p>Die Schreibmarke bleibt, wo du tippst: nach einem Haken, einem Filterknopf, einem Monatswechsel
und nach einem Sprung aus der Jahrestabelle in einen Monat kehrt sie ins Feld zurück — solange
etwas darin steht. Ein leeres Feld bleibt unangetastet. Beim Öffnen einer Datei wird es geleert,
damit kein neues Buch durch den Filter des alten erscheint.</p>

<h4>Notizen</h4>
<p>Die kleine Lampe ist eine Notiz. Es gibt sie zweimal: die Lampe <b>neben einem Namen</b> trägt
eine Notiz zur Position selbst und taucht überall auf, wo die Position vorkommt; die Lampe
<b>in einem Monat</b> gehört nur zu diesem einen Monat — „bar bezahlt", „Rechnung noch prüfen". Eine
leuchtende Lampe heißt: da steht etwas. Fahr mit der Maus darüber, um es zu lesen.</p>
<p>Die Lampen arbeiten schon vor dem ersten Speichern: ein ganz neuer Posten und eine ganz neue
Kategorie haben sie, sobald ihr Fenster aufgeht. Was du hineinschreibst, wandert mit der Position
in die Datei — und wird mit ihr verworfen, wenn du abbrichst.</p>
<p>Eine Notiz behält ihre Zeilen. Wo du eine neue Zeile anfängst, steht auch eine — in der
Sprechblase an der Lampe, in den zwei Zeilen Vorschau unter dem Namen und in den Monatsfeldern des
Bearbeitungsfensters. Eine Notiz darf also eine Liste sein.</p>

<h4>Speichern und Sicherheit</h4>
<p>Von allein wird nie geschrieben. <b>${t('app.save')}</b> schreibt alles — Zahlen und
Einstellungen — in deine Datei. Chrome und Edge schreiben dabei in genau dieselbe Datei zurück;
andere Browser legen eine frische Kopie im Download-Ordner ab. <b>${t('app.unlink')}</b> legt die
Datei aus der Hand und leert den Bildschirm; ist etwas ungespeichert, wirst du vorher gewarnt.</p>
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
<h4>26.8.7.1 <span class="pill">latest</span></h4>
<ul>
  <li><b>Income has categories of its own.</b> Under ${t('set.groups')} there are now two lists side
      by side: income on the left, expenses on the right. Every regular item belongs to exactly one
      of them, and a name may appear only once across both — that is what tells FINA whether an item
      brings money in or costs it. In the item window the two are one grouped list, green above red;
      the group headings themselves cannot be picked. Month and year view bundle income by category
      as soon as there is more than one.</li>
  <li><b>The forecast, rebuilt.</b> One table across the full width instead of two cards. The last
      column, <b>${t('prog.colFlow')}</b>, draws the balance through the year — the same waterfall as
      the timeline in the month view, one row per month, on a grid whose step is named in the
      heading. The current month is highlighted, settled months are pale, and the headings are short
      codes that explain themselves when you point at them.</li>
  <li><b>The name is the heading.</b> Items and Flexible Payments categories no longer have a name
      field. Click the heading and a small window opens with the name ready and selected, plus
      ${t('g.cancel')} and ${t('item.apply')}. Nothing is written until you save.</li>
  <li><b>The average, where you need it.</b> In the amounts window of a Flexible Payments category
      the average per month so far now stands in orange above the quick entry — counted over the
      months that are settled, and it moves as you type.</li>
  <li><b>Tooltips above or below.</b> The instant hints now appear over or under what you point at,
      never beside it, so they no longer cover the neighbouring cell.</li>
  <li><b>Details.</b> The Flexible Payment Details tab opens on the whole year with the first
      category chosen. The category is now in the same row as account, payment type and due date.
      The quick entry is flatter, its hint moved onto the button row. On the first screen the text
      runs as wide as the two buttons, and the line pointing to the guide carries its orange.</li>
</ul>

<h4>26.8.6.1</h4>
<ul>
  <li><b>A first screen.</b> With no file open FINA now greets you with one page that says what it
      is, and two ways on: <b>${t('wel.open')}</b> or <b>${t('wel.new')}</b>. The same page comes
      back after <b>${t('app.unlink')}</b>. Because a file is opened there, the top bar no longer
      carries an “open” button — with a book open it keeps <b>${t('app.save')}</b> and
      <b>${t('app.unlink')}</b>; on the first screen it keeps only this guide.</li>
  <li><b>${t('month.ana')} — the figures of the month became a door.</b> The five key figures now
      sit on one thin line with the word <b>${t('month.ana')}</b> above them. Click it and a
      timeline of the month opens underneath: <b>${t('month.tlOpen')}</b> — what the months before
      it left over —, <b>${t('month.fDueA')}</b>, <b>${t('month.fDueM')}</b>,
      <b>${t('month.fDueE')}</b> and <b>${t('month.tlClose')}</b>, which takes up everything
      without a payday. Each row says what moved in it and what the balance is afterwards.</li>
  <li><b>And a bar that shows what moved it.</b> The scale is the balance itself; every row starts
      where the row above it ended. Money coming in grows to the right, money going out takes it
      back to the left, and each piece is coloured by its kind — green income, yellow
      ${t('g.flex')}, red ${t('g.fixed')}, blue the balance correction. So a row where the salary
      arrives and the rent goes off shows both, one after the other. Hover a colour for its amount;
      a click on a row filters everything below to that part of the month.</li>
  <li><b>One filter row at the top, for the whole month.</b> It moved out of the regular costs and
      now applies to income, ${t('g.flex')} and regular costs at once — with a fifth due-date
      button, <b>${t('month.tlClose')}</b>, for everything without a payday. What a block is
      hiding stands next to its heading.</li>
  <li><b>Blocks fold away.</b> The arrow at the left of a heading — or a double-click on it —
      folds a block down to its heading and its total. Everything starts open, and what you fold
      is kept in your file for all twelve months. While you filter, FINA folds for you: blocks
      with nothing left close, blocks with a hit open. Your own setting comes back when the filter
      goes off.</li>
  <li><b>Smaller things.</b> Notes now stand upright with a line beside them instead of in
      italics; the quick entry has its buttons on the right, ${t('item.apply')} outermost; the
      legend under the month is set like the status line at the bottom of the page.</li>
</ul>

<h4>26.8.5.2</h4>
<ul>
  <li><b>The filter searches only where you want it to.</b> In front of every search field — in
      the month view as in the year view — there is now a small <b>&#9776;</b> button. It opens a
      window with five entries: <b>${t('flt.fName')}</b>, <b>${t('flt.fNote')}</b>,
      <b>${t('flt.fAmount')}</b>, <b>${t('flt.fTotal')}</b> and <b>${t('flt.fMeta')}</b>. The word
      you type is then looked for only in what is ticked — a name only among names, a figure only
      among the year totals. At least one entry has to stay ticked: <b>${t('g.save')}</b> refuses
      an empty choice and says so in red below. To begin with everything is ticked, your choice is
      kept in the file, and the button turns dark as soon as not everything is searched any
      more.</li>
  <li><b>${t('view.kakeibo')} — only with an import, and now last.</b> The tab evaluates the
      bookings from Fast Budget, so it appears once you have imported some, and it sits after
      ${t('view.prognose')}. Without an import there is nothing in it to read.</li>
  <li><b>${t('app.import')} moved to the top bar</b>, next to ${t('app.load')} and
      ${t('app.save')} — the way in must not sit inside a tab that only exists afterwards. It
      opens with a short window naming the app the file comes from and the columns it must
      contain (<code>Datum</code>, <code>Wert (EUR)</code>, <code>Hauptkategorie</code>);
      choosing the file then leads to the same two steps as before.</li>
  <li><b>The month names stay readable while scrolling.</b> In the year table a block row —
      ${t('g.income')}, ${t('g.flex')}, ${t('g.fixed')} — could slide over the row of month names
      at the end of its block and hide it. With a filter on, where blocks are short, that
      happened often. The headings now stay on top of everything.</li>
  <li><b>A new column in ${t('view.kakeibo')}: ${t('kak.colKind')}.</b> Left of the amount it says
      where that figure comes from — <b>${t('kak.kImp')}</b> from Fast Budget, <b>${t('kak.kCorr')}</b>
      where you overwrote an imported month, <b>${t('kak.kDone')}</b> where you ticked one off,
      <b>${t('kak.kFix')}</b> for a typed amount that is not an estimate, <b>${t('kak.kEst')}</b> for
      what is still open. Over the whole year it counts the months per kind.</li>
  <li><b>${t('view.prognose')} only calculates now — it no longer writes.</b> The assumption used
      to be typed into the right-hand card, and every keystroke went straight into all twelve
      months, past ones included. Both columns are now read-only, and below them stands what they
      are: where the assumption comes from and which months the Ø is calculated over. Where an
      assumption does not fit, open the category with the pencil or a double-click and change its
      twelve amounts.</li>
</ul>

<h4>26.8.5.1</h4>
<ul>
  <li><b>Duplicate an item or a category.</b> Both windows now carry a
      <b>${t('item.dup')}</b> button next to Cancel. It opens the same window again with a copy
      inside: name, block, account, link and all twelve amounts as they stand — but without a
      single tick and without notes, neither for the item itself nor for a month. Every month can
      therefore be changed straight away. The copy is created when you press
      <b>${t('g.save')}</b>; Cancel leaves nothing behind, and the original stays as it was either
      way.</li>
  <li><b>The sign shows while you type.</b> In both windows an amount turns red as soon as it is
      negative and green as soon as it is positive — in the twelve month fields and in the quick
      entry, in closed months just as in open ones. Zero and an empty field stay as they are.</li>
  <li><b>${t('year.balanceRow')} stays while you search.</b> In the year table the row belongs to
      the frame, like the column headings above it: it keeps its place under them while you
      scroll, whatever the search field holds. Until now it only stayed when the typed word
      happened to occur in its own name.</li>
  <li><b>Notes keep their lines.</b> Where you start a new line in a note, a new line is shown:
      in the bubble at the lamp, in the two lines under the name and in the month cells of the
      edit window. A note can be a list again.</li>
  <li><b>Note lamps from the first moment.</b> A new item and a new ${t('g.flex')} category
      show their lamps right away — one for the whole position, one per month. What you write is
      kept with the item when you save it and thrown away when you cancel.</li>
</ul>

<h4>26.8.4.1</h4>
<ul>
  <li><b>Double-click opens an item — everywhere.</b> In every view, a double-click on an
      <b>amount</b> or on the <b>name</b> opens the same window as the pencil: in the month, in the
      year table, in ${t('view.kakeibo')} and in ${t('view.prognose')}. Seals, pencils, note lamps,
      receipt links and input fields keep their own behaviour.</li>
  <li><b>The search field holds the cursor.</b> In the year view as in the month view, the cursor
      returns to the field after ticking, filtering or changing the month — but only while
      something is typed in it. An empty field is left alone. Opening a file clears it, so a new
      file is never shown through an old filter.</li>
  <li><b>The bar of the year view, rebuilt.</b> The search field sits at the far left, followed by
      the two buttons that also filter. <b>${t('year.hideDone')}</b> and
      <b>${t('year.hideSettled')}</b> keep their name and show at a dark background that they are
      being applied; a second click switches them off. Neither is on to begin with, and both are
      stored in your file. What ✓ and ? mean now stands to the right of the view tabs, and the
      three block rows stay at the top of the screen while you scroll through their block.</li>
</ul>

<h4>26.7.30.1</h4>
<p>The first complete version. Everything FINA does, in short:</p>
<ul>
  <li><b>One file, one year.</b> Everything lives in a JSON file on your own computer; nothing is
      sent anywhere and nothing is written until you press <b>${t('app.save')}</b>. Unsaved changes
      show up in bold red next to the file name.</li>
  <li><b>Three kinds of money</b> — ${t('g.income')}, ${t('g.fixed')} and ${t('g.flex')} —
      and above them the single row <b>${t('bal.row')}</b> for the difference that cannot be
      explained.</li>
  <li><b>Four views:</b> the month for the daily work, the year as one table, the everyday spending
      by category, and the forecast up to 31 December. With a file open FINA starts in the current
      month, without one in the year.</li>
  <li><b>Items and categories</b> are kept in one window: name, block, account, payment type, due
      date, last payment, receipt link, twelve amounts, a tick per month, and a quick entry that
      fills many months at once. Expenses are typed with a minus. An amount you are not sure of is
      marked as an estimate and shown in yellow with a question mark.</li>
  <li><b>Ticking off</b> is what the month view is for: every seal locks its amount, and the key
      figures at the top say what is left. Filters by due date and payment state, and a search
      field that filters while you type across name, amount, bank, payment type, category and
      note.</li>
  <li><b>The year table</b> shows one row per item and one column per month, with the code columns
      <b>B</b>, <b>PT</b>, <b>DD</b> and <b>LP</b>. The LP cell colours how much of the term is
      left; rows that are done for the year turn grey.</li>
  <li><b>Notes</b> hang on a small lamp — one for the item itself, one for each single month.</li>
  <li><b>CSV import from Fast Budget</b> replaces the everyday figures of the months you choose;
      corrected months keep both the import and your correction.</li>
  <li><b>Settings</b> hold language, year, column widths and the four lists — banks, payment types,
      regular categories and Flexible Payments categories. Renaming a category carries its figures
      along.</li>
  <li><b>This guide</b> opens beside the table and stays open while you work; its width can be
      dragged.</li>
</ul>
`,

de:()=>`
<h4>26.8.7.1 <span class="pill">neu</span></h4>
<ul>
  <li><b>Einnahmen haben eigene Kategorien.</b> Unter ${t('set.groups')} stehen jetzt zwei Listen
      nebeneinander: links die Einnahmen, rechts die Ausgaben. Jeder regelmäßige Posten gehört in
      genau eine davon, und ein Name darf über beide Listen hinweg nur einmal vorkommen — daran
      erkennt FINA, ob ein Posten Geld bringt oder kostet. Im Posten-Fenster sind beide eine
      gruppierte Liste, grün über rot; die Gruppenüberschriften selbst lassen sich nicht wählen.
      Monats- und Jahresansicht bündeln die Einnahmen nach Kategorie, sobald es mehr als eine
      gibt.</li>
  <li><b>Die Prognose neu gebaut.</b> Eine Tabelle über die volle Breite statt zweier Karten. Die
      letzte Spalte, <b>${t('prog.colFlow')}</b>, zeichnet den Kontostand durch das Jahr — derselbe
      Wasserfall wie der Zeitstrahl im Monat, eine Zeile je Monat, auf einem Raster, dessen
      Schrittweite in der Überschrift steht. Der laufende Monat ist hervorgehoben, die abgerechneten
      Monate stehen blass, und die Überschriften sind kurze Kürzel, die sich beim Überfahren
      erklären.</li>
  <li><b>Die Bezeichnung ist die Überschrift.</b> Posten und Flexible-Payments-Kategorien haben kein
      Namensfeld mehr. Ein Klick auf die Überschrift öffnet ein kleines Fenster, der Name fertig
      markiert, dazu ${t('g.cancel')} und ${t('item.apply')}. Geschrieben wird erst beim
      Speichern.</li>
  <li><b>Der Mittelwert, wo du ihn brauchst.</b> Im Beträge-Fenster einer Flexible-Payments-Kategorie
      steht der bisherige Mittelwert je Monat jetzt orange über der Schnelleingabe — gerechnet über
      die Monate, die feststehen, und er läuft beim Tippen mit.</li>
  <li><b>Sprechblasen über oder unter dem Element.</b> Die sofortigen Hinweise erscheinen nicht mehr
      daneben und verdecken damit nicht länger die Nachbarzelle.</li>
  <li><b>Kleinigkeiten.</b> Der Reiter Flexible Payment Details startet mit dem ganzen Jahr und der
      ersten Kategorie. Die Kategorie steht im Posten-Fenster in derselben Reihe wie Konto,
      Zahlungsart und Fälligkeit. Die Schnelleingabe ist flacher, ihr Hinweis steht bei den Knöpfen.
      Auf der ersten Seite läuft der Text so breit wie die beiden Knöpfe, und der Satz zur Anleitung
      trägt deren Orange.</li>
</ul>

<h4>26.8.6.1</h4>
<ul>
  <li><b>Eine erste Seite.</b> Ohne Datei begrüßt dich FINA jetzt mit einer Seite, die sagt, worum
      es geht, und zwei Wegen: <b>${t('wel.open')}</b> oder <b>${t('wel.new')}</b>. Dieselbe Seite
      kommt nach <b>${t('app.unlink')}</b> zurück. Weil dort geöffnet wird, hat die Kopfzeile
      keinen Knopf zum Öffnen mehr — mit offenem Buch bleiben <b>${t('app.save')}</b> und
      <b>${t('app.unlink')}</b>, auf der ersten Seite bleibt nur diese Anleitung.</li>
  <li><b>${t('month.ana')} — aus den Zahlen des Monats wurde eine Tür.</b> Die fünf Kennzahlen
      stehen jetzt auf einer dünnen Zeile, darüber klein das Wort <b>${t('month.ana')}</b>. Ein
      Klick darauf, und darunter klappt der Zeitstrahl des Monats auf:
      <b>${t('month.tlOpen')}</b> — was die Monate davor übrig gelassen haben —,
      <b>${t('month.fDueA')}</b>, <b>${t('month.fDueM')}</b>, <b>${t('month.fDueE')}</b> und
      <b>${t('month.tlClose')}</b>, der alles ohne Zahltag aufnimmt. Jede Zeile sagt, was sich in
      ihr bewegt hat und wie der Kontostand danach steht.</li>
  <li><b>Und ein Balken, der zeigt, was ihn bewegt hat.</b> Der Maßstab ist der Kontostand selbst;
      jede Zeile fängt dort an, wo die darüber aufgehört hat. Die Zufuhr wächst nach rechts, der
      Abzug holt sie nach links zurück, und jeder Anteil trägt die Farbe seiner Art — grün
      Einnahmen, gelb ${t('g.flex')}, rot ${t('g.fixed')}, blau die Saldokorrektur. Eine Zeile, in
      der erst das Gehalt kommt und dann die Miete abgeht, zeigt also beides nacheinander. Über
      einer Farbe steht ihr Betrag; ein Klick auf eine Zeile filtert alles darunter auf diesen Teil
      des Monats.</li>
  <li><b>Eine Filterzeile oben, für den ganzen Monat.</b> Sie ist aus den regelmäßigen Kosten
      herausgewandert und gilt jetzt für Einnahmen, ${t('g.flex')} und regelmäßige Kosten zugleich
      — mit einem fünften Fälligkeitsknopf, <b>${t('month.tlClose')}</b>, für alles ohne Zahltag.
      Was ein Block gerade versteckt, steht neben seiner Überschrift.</li>
  <li><b>Blöcke lassen sich zuklappen.</b> Der Pfeil links in einer Überschrift — oder ein
      Doppelklick darauf — klappt einen Block auf seine Überschrift und seine Summe zusammen. Zu
      Anfang ist alles offen, und was du zuklappst, steht in deiner Datei und gilt für alle zwölf
      Monate. Beim Filtern klappt FINA für dich: Blöcke ohne Treffer zu, Blöcke mit Treffer auf.
      Deine eigene Einstellung kommt zurück, sobald der Filter aus ist.</li>
  <li><b>Kleinigkeiten.</b> Notizen stehen jetzt aufrecht mit einem Strich daneben statt kursiv;
      die Schnelleingabe hat ihre Knöpfe rechts, ${t('item.apply')} ganz außen; die
      Zeichenerklärung unter dem Monat ist gesetzt wie die Statuszeile am Fuß der Seite.</li>
</ul>

<h4>26.8.5.2</h4>
<ul>
  <li><b>Der Filter sucht nur dort, wo du es willst.</b> Vor jedem Suchfeld — in der Monats- wie
      in der Jahresansicht — steht jetzt ein kleiner <b>&#9776;</b>-Knopf. Er öffnet ein Fenster
      mit fünf Angaben: <b>${t('flt.fName')}</b>, <b>${t('flt.fNote')}</b>,
      <b>${t('flt.fAmount')}</b>, <b>${t('flt.fTotal')}</b> und <b>${t('flt.fMeta')}</b>. Das
      getippte Wort wird danach nur noch in dem gesucht, was angekreuzt ist — ein Name also nur
      unter den Namen, eine Zahl nur unter den Jahressummen. Mindestens eine Angabe muss gewählt
      bleiben: <b>${t('g.save')}</b> weist die leere Wahl zurück und sagt es unten in Rot.
      Anfangs ist alles angekreuzt, deine Wahl steht in der Datei, und der Knopf wird dunkel,
      sobald nicht mehr alles durchsucht wird.</li>
  <li><b>${t('view.kakeibo')} — nur mit Import, und jetzt als letzter.</b> Der Reiter wertet die
      Buchungen aus Fast Budget aus; er erscheint also, sobald welche importiert sind, und steht
      hinter der ${t('view.prognose')}. Ohne Import gäbe es dort nichts zu lesen.</li>
  <li><b>${t('app.import')} steht jetzt in der Kopfzeile</b>, neben ${t('app.load')} und
      ${t('app.save')} — der Weg hinein darf nicht in einem Reiter liegen, den es erst danach
      gibt. Der Knopf öffnet zuerst ein kurzes Fenster: aus welcher App die Datei kommt und
      welche Spalten darin stehen müssen (<code>Datum</code>, <code>Wert (EUR)</code>,
      <code>Hauptkategorie</code>). Nach der Dateiwahl folgen dieselben zwei Schritte wie
      bisher.</li>
  <li><b>Die Monatsnamen bleiben beim Scrollen lesbar.</b> In der Jahrestabelle konnte eine
      Blockzeile — ${t('g.income')}, ${t('g.flex')}, ${t('g.fixed')} — am Ende ihres Blocks über
      die Zeile mit den Monatsnamen wandern und sie verdecken. Mit gesetztem Filter, wo die
      Blöcke kurz sind, geschah das oft. Die Köpfe liegen jetzt über allem.</li>
  <li><b>Eine neue Spalte in ${t('view.kakeibo')}: ${t('kak.colKind')}.</b> Links vor dem Betrag
      steht, woher die Zahl stammt — <b>${t('kak.kImp')}</b> aus Fast Budget,
      <b>${t('kak.kCorr')}</b>, wo du einen importierten Monat überschrieben hast,
      <b>${t('kak.kDone')}</b>, wo du abgehakt hast, <b>${t('kak.kFix')}</b> für einen
      eingetippten Betrag, der keine Schätzung ist, und <b>${t('kak.kEst')}</b> für das, was noch
      offen ist. Über das ganze Jahr zählt sie die Monate je Art.</li>
  <li><b>Die ${t('view.prognose')} rechnet nur noch — sie schreibt nicht mehr.</b> Die Annahme
      wurde in der rechten Karte getippt, und jedes Zeichen schrieb sich sofort in alle zwölf
      Monate, auch in vergangene. Beide Spalten sind jetzt nur noch zu lesen, und darunter steht,
      was sie sind: woher die Annahme kommt und über welche Monate der Ø gerechnet wird. Wo eine
      Annahme nicht passt, öffne die Kategorie mit dem Stift oder einem Doppelklick und ändere
      ihre zwölf Beträge.</li>
</ul>

<h4>26.8.5.1</h4>
<ul>
  <li><b>Posten und Kategorien duplizieren.</b> In beiden Fenstern steht neben „Abbrechen" jetzt
      <b>${t('item.dup')}</b>. Der Knopf öffnet dasselbe Fenster noch einmal, mit einer Kopie
      darin: Name, Block, Konto, Link und alle zwölf Beträge so, wie sie gerade dastehen — aber
      ohne einen einzigen Haken und ohne Notizen, weder zur Position noch zu einem Monat. Jeder
      Monat ist damit sofort änderbar. Angelegt wird die Kopie erst mit <b>${t('g.save')}</b>; wer
      abbricht, hinterlässt nichts, und das Original bleibt in beiden Fällen, wie es war.</li>
  <li><b>Das Vorzeichen zeigt sich beim Tippen.</b> In beiden Fenstern wird ein Betrag rot, sobald
      er negativ ist, und grün, sobald er positiv ist — in den zwölf Monatsfeldern wie in der
      schnellen Eingabe, im abgeschlossenen Monat wie im offenen. Die Null und das leere Feld
      bleiben, wie sie sind.</li>
  <li><b>„${t('year.balanceRow')}" bleibt beim Suchen stehen.</b> In der Jahrestabelle gehört die
      Zeile zum Gerüst, wie die Spaltenköpfe darüber: sie hält beim Scrollen ihren Platz unter
      ihnen, ganz gleich, was im Suchfeld steht. Bisher blieb sie nur, wenn das getippte Wort
      zufällig in ihrem eigenen Namen vorkam.</li>
  <li><b>Notizen behalten ihre Zeilen.</b> Wo du in einer Notiz eine neue Zeile anfängst, steht
      auch eine: in der Sprechblase an der Lampe, in den zwei Zeilen unter dem Namen und in den
      Monatszellen des Bearbeitungsfensters. Eine Notiz darf wieder eine Liste sein.</li>
  <li><b>Notizlampen von Anfang an.</b> Auch ein neuer Posten und eine neue
      ${t('g.flex')}-Kategorie haben ihre Lampen sofort — eine für die ganze Position, eine
      je Monat. Was du hineinschreibst, wandert beim Speichern mit und ist beim Abbrechen
      weg.</li>
</ul>

<h4>26.8.4.1</h4>
<ul>
  <li><b>Doppelklick öffnet die Position — überall.</b> In jeder Ansicht öffnet ein Doppelklick auf
      den <b>Betrag</b> oder auf die <b>Bezeichnung</b> dasselbe Fenster wie der Stift: im Monat,
      in der Jahrestabelle, in ${t('view.kakeibo')} und in der ${t('view.prognose')}. Siegel,
      Stift, Notizlampe, Beleglink und Eingabefelder behalten ihr eigenes Verhalten.</li>
  <li><b>Das Suchfeld hält die Schreibmarke.</b> In der Jahresansicht wie in der Monatsansicht
      kehrt sie nach dem Abhaken, Filtern oder Monatswechsel ins Feld zurück — aber nur, solange
      etwas darin steht. Ein leeres Feld bleibt unangetastet. Beim Öffnen einer Datei wird es
      geleert, damit keine neue Datei durch einen alten Filter erscheint.</li>
  <li><b>Die Leiste der Jahresansicht, neu geordnet.</b> Ganz links das Suchfeld, gleich dahinter
      die beiden Knöpfe, die ebenfalls filtern. <b>${t('year.hideDone')}</b> und
      <b>${t('year.hideSettled')}</b> behalten ihren Namen und zeigen am dunklen Grund, dass sie
      gelten; ein zweiter Klick schaltet sie ab. Keiner ist zu Anfang an, und beide stehen in
      deiner Datei. Was ✓ und ? bedeuten, steht jetzt rechts auf Höhe der Reiter, und die drei
      Blockzeilen bleiben beim Scrollen oben stehen, solange ihr Block läuft.</li>
</ul>

<h4>26.7.30.1</h4>
<p>Die erste vollständige Fassung. Alles, was FINA kann, in Kürze:</p>
<ul>
  <li><b>Eine Datei, ein Jahr.</b> Alles steht in einer JSON-Datei auf dem eigenen Rechner; es wird
      nichts irgendwohin geschickt und nichts geschrieben, bevor du auf <b>${t('app.save')}</b>
      klickst. Ungespeichertes steht fett und rot neben dem Dateinamen.</li>
  <li><b>Drei Arten von Geld</b> — ${t('g.income')}, ${t('g.fixed')} und ${t('g.flex')} —
      und darüber die einzelne Zeile <b>${t('bal.row')}</b> für die Differenz, die sich nicht
      erklären lässt.</li>
  <li><b>Vier Ansichten:</b> der Monat für die tägliche Arbeit, das Jahr als eine Tabelle, die
      alltäglichen Ausgaben je Kategorie und die Prognose bis zum 31. Dezember. Mit geladener Datei
      beginnt FINA im laufenden Monat, ohne Datei im Jahr.</li>
  <li><b>Posten und Kategorien</b> werden in einem Fenster gepflegt: Name, Block, Konto,
      Zahlungsart, Fälligkeit, letzte Zahlung, Beleglink, zwölf Beträge, je Monat ein Haken und
      eine schnelle Eingabe, die viele Monate auf einmal füllt. Ausgaben werden mit Minus
      geschrieben. Ein Betrag, der noch nicht feststeht, gilt als geschätzt und steht gelb mit
      einem Fragezeichen da.</li>
  <li><b>Abhaken</b> ist der Sinn der Monatsansicht: jedes Siegel sperrt seinen Betrag, und die
      Kennzahlen oben sagen, was bleibt. Dazu Filter nach Fälligkeit und Zahlungsstand und ein
      Suchfeld, das beim Tippen über Name, Betrag, Bank, Zahlungsart, Kategorie und Notiz
      filtert.</li>
  <li><b>Die Jahrestabelle</b> zeigt je Position eine Zeile und je Monat eine Spalte, mit den
      Kürzelspalten <b>B</b>, <b>PT</b>, <b>DD</b> und <b>LP</b>. Die LP-Zelle färbt die
      Restlaufzeit; Zeilen, die für das Jahr erledigt sind, werden grau.</li>
  <li><b>Notizen</b> hängen an einer kleinen Lampe — eine für die Position selbst, eine für jeden
      einzelnen Monat.</li>
  <li><b>CSV-Import aus Fast Budget</b> ersetzt die Alltagszahlen der gewählten Monate; korrigierte
      Monate behalten Import und Korrektur nebeneinander.</li>
  <li><b>Die Einstellungen</b> halten Sprache, Jahr, Spaltenbreiten und die vier Listen — Banken,
      Zahlungsarten, regelmäßige Kategorien und Flexible-Payments-Kategorien. Wird eine Kategorie
      umbenannt, wandern ihre Zahlen mit.</li>
  <li><b>Diese Anleitung</b> klappt neben der Tabelle auf und bleibt beim Arbeiten offen; ihre
      Breite lässt sich ziehen.</li>
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
let guideW=0, guideLang='', guideTab='steps';

function guideMax(){ return Math.max(GUIDE_MIN,Math.round(window.innerWidth*0.66)); }

function setGuideWidth(w){
  guideW=Math.min(Math.max(Math.round(w),GUIDE_MIN),guideMax());
  document.documentElement.style.setProperty('--guidew',guideW+'px');
  /* Die Seite ist jetzt schmaler: die mitlaufenden Leisten und
     die Spaltenköpfe der Jahresmatrix müssen neu gemessen
     werden. */
  if(typeof syncMatrixHead==='function') syncMatrixHead();
}

function guideOpen(){ return !!document.getElementById('guidePanel'); }

function openGuide(){
  if(guideOpen()) return;
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

/* Nach jedem Neuzeichnen (renderChrome in js/app.js): steht die
   Anleitung noch in der alten Sprache, wird sie neu gesetzt. Sonst
   bleibt sie stehen, wie sie ist — sie wird bei jedem Klick auf ein
   Siegel mit gezeichnet, und ein Neuaufbau je Klick wäre nichts als
   Arbeit. */
function renderGuide(){
  if(guideOpen()&&guideLang!==LANG()) fillGuide();
}

/* Inhalt und Beschriftungen. Die Leseposition überlebt den
   Neuaufbau nur innerhalb desselben Reiters — beim Wechsel fängt
   man oben an, das ist beim Lesen einer Anleitung auch richtig. */
function fillGuide(el){
  const box=el||document.getElementById('guidePanel'); if(!box) return;
  const sameTab=box.dataset.tab===guideTab;
  const scroll=box.querySelector('.gbody');
  const y=sameTab&&scroll?scroll.scrollTop:0;
  guideLang=LANG(); box.dataset.tab=guideTab;
  const text=(GUIDE[guideTab]||GUIDE.steps);
  const body=(text[LANG()]||text.en)();
  /* Der Hinweis auf die Bilder steht nur über einem Reiter, der
     welche hat — die Versionsliste kommt ohne aus. */
  const zoom=body.indexOf('<figure')>=0?`<p class="gzoom">${t('guide.zoom')}</p>`:'';
  box.innerHTML=`<div class="ghandle" id="gHandle" role="separator" aria-orientation="vertical"
      tabindex="0" title="${t('app.guideDrag')}" aria-label="${t('app.guideDrag')}"></div>
    <div class="ghead">
      <div><h3>${t('app.guide')} — FINA</h3></div>
      <button class="btn small" id="gClose" title="${t('g.close')}" aria-label="${t('g.close')}">&#10005;</button>
    </div>
    <div class="gtabs" role="tablist">${GUIDE_TABS.map(([k,lab])=>
      `<button role="tab" data-gtab="${k}" aria-selected="${k===guideTab}">${t(lab)}</button>`).join('')}</div>
    <div class="gbody guide">${zoom}${body}</div>`;
  box.querySelector('#gClose').onclick=()=>closeGuide();
  box.querySelectorAll('[data-gtab]').forEach(b=>b.onclick=()=>guideTo(b.dataset.gtab));
  bindGuideHandle(box.querySelector('#gHandle'));
  const nb=box.querySelector('.gbody'); if(nb) nb.scrollTop=y;
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
