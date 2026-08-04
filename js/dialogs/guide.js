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
  <li><b>${t('view.kakeibo')}</b> — everyday spending that differs from month to month:
      groceries, fuel, going out. Not every single purchase — a handful of categories, one
      amount per month each.</li>
</ul>
<p>Rule of thumb: does it arrive as a bill or a contract? Then it is a regular cost. Do you spend
it in a shop? Then it is flexible.</p>

<h4>Step 1 — Find your way around the top bar</h4>
${gshot('ui-header','The top bar and, below it, the four views and the twelve months')}
<p>Nothing to do here yet, just two things to remember: <b>${t('app.load')}</b> opens a file that
already exists, <b>${t('app.save')}</b> writes your file. While something is unsaved, the file
name next to the buttons is shown in bold red.</p>
<p>Below the bar are the four views, and under them the months — those belong to
<b>${t('view.monat')}</b>, which is where you will work day to day.</p>
<p>Which view greets you depends on your file: with a file loaded FINA opens the <b>current
month</b>, because that is where the work happens; with no file open it starts in
<b>${t('view.jahr')}</b>, because that is where you build the book. (If the file belongs to
another year, “current” means January.)</p>

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
<p>Under <b>${t('set.groups')}</b> you decide how your bills are grouped: Home, Car, Insurance,
Subscriptions — whatever matches your life. Four to six groups are enough; they only exist to
keep the month view readable.</p>
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
income.</p>
${gshot('item-quick','Quick entry — one amount into many months at once')}
<p>Same amount every month? Use the quick entry: type the amount once, choose how often it repeats
and from which month, then press <b>${t('item.apply')}</b>.</p>
${gshot('item-months','The twelve month boxes, each with a tick and a note lamp')}
<p><b>At the bottom of every month: a tick.</b> It means “this one is settled”. A ticked month
locks its amount so you cannot change it by accident; remove the tick and you can type again.</p>
<p>Do not know the amount yet — the electricity bill, roughly? Tick
<b>“${t('item.est')}”</b>. FINA then shows the figure in yellow with a question mark, so you can
see at a glance which numbers are still guesses.</p>

<h4>Step 7 — Enter your everyday spending</h4>
${gshot('flex-dialog','The amounts window of a Flexible Payments category')}
<p>Press <b>${t('year.addKak')}</b>. It works exactly like a bill, only the thing you are
describing is a category, not a contract: “Groceries”, twelve amounts, done.</p>
<p>You cannot know these in advance — that is the point. Put in what you expect, tick
<b>“${t('item.est')}”</b>, and correct the figure once the month is over. Guessing here is not
sloppy; it is how the forecast learns what your life costs.</p>
${gshot('month-flex','The Flexible Payments block in the month view')}

<h4>Step 8 — What the three marks mean</h4>
${gshot('legend','The marks, as they appear below the month view')}
<p>The same three marks appear in every block:</p>
<ul>
  <li>an <b>empty circle</b> — due, not paid yet;</li>
  <li>a <b>green circle with a tick</b> — settled, and the amount is locked;</li>
  <li>a <b>yellow circle</b> — the amount is only an estimate.</li>
</ul>

<h4>Step 9 — Your monthly routine</h4>
${gshot('month-out','The regular costs of one month, with filters and seals')}
<p>This is the only part you repeat. Once a month, or whenever you have paid something:</p>
<ol>
  <li>Open <b>${t('view.monat')}</b> and pick the month at the top.</li>
  <li>Tick off what has actually left your account.</li>
  <li>Correct any amount that turned out different — remove the tick, type, tick again.</li>
  <li>Press <b>${t('app.save')}</b>.</li>
</ol>
<p>The row above the list is the filter, in the order in which you use it: the <b>search
field</b>, then the <b>due date</b> — all, start, middle or end of the month —, then the
<b>payment state</b>: ${t('month.fAll')}, ${t('month.fOpen')}, ${t('month.fEst')},
${t('month.fPaid')}. A dark button is one that is being applied; click it again and it is off.
Hold the mouse over any of them and it says what it does.</p>
<p>The search field works while you type and looks at everything the row shows: name, amount,
bank, payment type, category, note. Part of a word or of a figure is enough — “ele” finds
Electricity, “50” finds every amount containing 50. All three filters apply at once, and none of
them changes anything in the file — only what you see.</p>
<p>As long as something is typed in the field, the cursor returns to it after every tick: you can
work through a long list without reaching for the mouse. An empty field is left alone, so ticking
never pulls your cursor away from where it was.</p>
<p>And while you scroll, the heading of the block and the whole filter row stay at the top of the
screen — you always see which block you are in and what it costs, and you can filter from anywhere
in the list.</p>

<h4>Step 10 — Read the figures at the top</h4>
${gshot('ui-kpi','The key figures of the chosen month')}
<p>Left to right: what comes in, what the everyday categories cost, what the bills cost, what of
that is <b>still open</b> — and, at the right, what is left. If the last number is green, the
month carries itself.</p>

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
<b>double-click on any amount</b> opens that item — the same window as the pencil on the left,
from any of the twelve months and from the total column.</p>
<p>The three block rows — ${t('g.income')}, ${t('view.kakeibo')}, ${t('g.fixed')} — stay at the
top of the screen while you scroll through their block, the same way the headings do in the month
view.</p>
<p>The bar above the table starts with the same search field as the month view, and it holds the
same word: what you type in one view still applies in the other. Here it searches all twelve
months and it applies to every row. Type the name of a block or of a category and that block
appears whole, with everything under it — you look for a category in order to see it, not to find
it empty.</p>
<p>Next to it two buttons. <b>${t('year.hideDone')}</b> folds away every month in which nothing is
left open; <b>${t('year.hideSettled')}</b> hides the items that are fully paid for this year.
Neither is on to begin with. They keep their name and show at their dark background that they are
being applied, a second click switches them off — and both are remembered in your file, so the
table looks the way you left it when you open it again.</p>
${gshot('year','The year view: search field and the two filter buttons on the left, what they add on the right')}

<h4>Step 13 — Look ahead</h4>
${gshot('forecast','The Forecast view: the whole year, month by month')}
${gshot('forecast-plan','On the right, the assumption per category')}
<p><b>${t('view.prognose')}</b> adds up everything still to come and shows the balance you can
expect on 31 December. For the months you have not lived yet it needs an assumption per everyday
category — that is the right-hand column.</p>
<p>Once a few months are settled, press <b>${t('prog.takeAvg')}</b>: FINA takes the average of
those months and puts it in for the rest of the year. That is the moment the forecast stops being
a guess.</p>

<h4>Step 14 — Save, and keep the file safe</h4>
<p><b>${t('app.save')}</b> writes everything — figures and settings — into your file. Chrome and
Edge write back into the very same file; other browsers put a fresh copy in your downloads
folder.</p>
<p>The file is plain text and yours alone. Copy it somewhere safe now and then: it is the only
place your figures exist.</p>

<h4>Optional — if you use Fast Budget</h4>
<p>Export your transactions there as a CSV file and load it here with <b>${t('kak.import')}</b>.
FINA shows you which months are in the file, lets you deselect any of them, and tells you exactly
what it is about to overwrite. Only the very last button changes anything.</p>

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
  <li><b>${t('view.kakeibo')}</b> — die alltäglichen Ausgaben, die jeden Monat anders ausfallen:
      Lebensmittel, Sprit, Ausgehen. Nicht jeder Einkauf einzeln — eine Handvoll Kategorien mit je
      einem Betrag pro Monat.</li>
</ul>
<p>Faustregel: Kommt es als Rechnung oder Vertrag? Dann regelmäßige Kosten. Gibst du es im Laden
aus? Dann flexibel.</p>

<h4>Schritt 1 — Die Kopfzeile ansehen</h4>
${gshot('ui-header','Die Kopfzeile, darunter die vier Ansichten und die zwölf Monate')}
<p>Hier ist noch nichts zu tun, nur zwei Dinge zu merken: <b>${t('app.load')}</b> öffnet eine
Datei, die es schon gibt, <b>${t('app.save')}</b> schreibt deine Datei. Solange etwas
ungespeichert ist, steht der Dateiname daneben fett und rot.</p>
<p>Unter der Zeile stehen die vier Ansichten und darunter die Monate — die gehören zu
<b>${t('view.monat')}</b>, dort arbeitest du später im Alltag.</p>
<p>Womit du begrüßt wirst, hängt von der Datei ab: mit geladener Datei öffnet FINA den
<b>laufenden Monat</b>, denn dort wird gearbeitet; ohne Datei die <b>${t('view.jahr')}</b>-Ansicht,
denn dort legst du an. (Gehört die Datei zu einem anderen Jahr, ist der „laufende" Monat der
Januar.)</p>

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
<p>Unter <b>${t('set.groups')}</b> legst du fest, wie deine Rechnungen gruppiert sind: Wohnen,
Auto, Versicherungen, Abos — ganz wie es zu deinem Leben passt. Vier bis sechs Gruppen genügen;
sie sind nur dafür da, dass die Monatsansicht lesbar bleibt.</p>
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
Einnahme.</p>
${gshot('item-quick','Die schnelle Eingabe — ein Betrag in viele Monate auf einmal')}
<p>Jeden Monat derselbe Betrag? Nimm die schnelle Eingabe: Betrag einmal tippen, Wiederholung und
Startmonat wählen, auf <b>${t('item.apply')}</b> klicken.</p>
${gshot('item-months','Die zwölf Monatsfelder, jedes mit Haken und Notizlampe')}
<p><b>Unter jedem Monat ein Haken.</b> Er heißt „dieser ist erledigt". Ein abgehakter Monat sperrt
seinen Betrag, damit er nicht aus Versehen verrutscht; Haken weg, und du kannst wieder tippen.</p>
<p>Steht ein Betrag noch nicht fest — die Stromrechnung, ungefähr? Dann setz den Haken bei
<b>„${t('item.est')}"</b>. FINA zeigt die Zahl daraufhin gelb mit einem Fragezeichen; du siehst
auf einen Blick, welche Zahlen noch geschätzt sind.</p>

<h4>Schritt 7 — Die alltäglichen Ausgaben eintragen</h4>
${gshot('flex-dialog','Das Beträge-Fenster einer Flexible-Payments-Kategorie')}
<p>Klick auf <b>${t('year.addKak')}</b>. Das läuft genau wie eine Rechnung, nur beschreibst du
diesmal eine Kategorie statt eines Vertrags: „Lebensmittel", zwölf Beträge, fertig.</p>
<p>Diese Zahlen kannst du nicht vorher wissen — das ist der Sinn der Sache. Trag ein, womit du
rechnest, setz den Haken bei <b>„${t('item.est')}"</b>, und korrigier den Wert, wenn der Monat
vorbei ist. Schätzen ist hier nicht schlampig; so lernt die Prognose, was dein Leben kostet.</p>
${gshot('month-flex','Der Flexible-Payments-Block in der Monatsansicht')}

<h4>Schritt 8 — Was die drei Zeichen bedeuten</h4>
${gshot('legend','Die Zeichen, wie sie unter der Monatsansicht stehen')}
<p>Dieselben drei Zeichen gibt es in jedem Block:</p>
<ul>
  <li>ein <b>leerer Kreis</b> — fällig, noch nicht bezahlt;</li>
  <li>ein <b>grüner Kreis mit Haken</b> — erledigt, der Betrag ist gesperrt;</li>
  <li>ein <b>gelber Kreis</b> — der Betrag ist nur geschätzt.</li>
</ul>

<h4>Schritt 9 — Dein Monatsrhythmus</h4>
${gshot('month-out','Die regelmäßigen Kosten eines Monats, mit Filtern und Siegeln')}
<p>Nur das hier wiederholt sich. Einmal im Monat, oder immer wenn du etwas bezahlt hast:</p>
<ol>
  <li>Öffne <b>${t('view.monat')}</b> und wähl oben den Monat.</li>
  <li>Hak ab, was tatsächlich vom Konto gegangen ist.</li>
  <li>Korrigier, was anders ausgefallen ist — Haken weg, tippen, Haken wieder setzen.</li>
  <li>Klick auf <b>${t('app.save')}</b>.</li>
</ol>
<p>Die Zeile über der Liste ist der Filter, in der Reihenfolge, in der man ihn benutzt: das
<b>Suchfeld</b>, dann die <b>Fälligkeit</b> — alle, Anfang, Mitte oder Ende des Monats —, dann der
<b>Zahlungsstand</b>: ${t('month.fAll')}, ${t('month.fOpen')}, ${t('month.fEst')},
${t('month.fPaid')}. Ein dunkler Knopf gilt gerade; klick ihn noch einmal an, und er gilt nicht
mehr. Fahr mit der Maus darüber, und jeder sagt dir, was er tut.</p>
<p>Das Suchfeld filtert beim Tippen und sieht in alles hinein, was die Zeile zeigt: Name, Betrag,
Bank, Zahlungsart, Kategorie, Notiz. Ein Wortteil oder ein Stück der Zahl genügt — „str" findet
Strom, „50" jeden Betrag, in dem 50 vorkommt. Alle drei Filter gelten gleichzeitig, und keiner
ändert etwas in der Datei — nur, was du siehst.</p>
<p>Solange etwas im Feld steht, kehrt die Schreibmarke nach jedem Haken dorthin zurück: du kannst
eine lange Liste durcharbeiten, ohne zur Maus zu greifen. Ein leeres Feld bleibt unangetastet —
dann zieht dich das Abhaken nirgendwohin.</p>
<p>Und beim Scrollen bleiben die Überschrift des Blocks und die ganze Filterzeile oben stehen: du
siehst immer, in welchem Block du bist und was er kostet, und kannst von überall aus filtern.</p>

<h4>Schritt 10 — Die Zahlen oben lesen</h4>
${gshot('ui-kpi','Die Kennzahlen des gewählten Monats')}
<p>Von links nach rechts: was hereinkommt, was die Alltagskategorien kosten, was die Rechnungen
kosten, was davon <b>noch offen</b> ist — und ganz rechts, was übrig bleibt. Ist die letzte Zahl
grün, trägt sich der Monat selbst.</p>

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
und ein <b>Doppelklick auf einen Betrag</b> öffnet die Position — dasselbe Fenster wie der Stift
links, von jedem der zwölf Monate und von der Gesamtspalte aus.</p>
<p>Die drei Blockzeilen — ${t('g.income')}, ${t('view.kakeibo')}, ${t('g.fixed')} — bleiben beim
Scrollen oben stehen, solange du in ihrem Block liest; genau wie die Überschriften in der
Monatsansicht.</p>
<p>Die Leiste über der Tabelle fängt mit demselben Suchfeld an wie die Monatsansicht, und es
enthält dasselbe Wort: was du in der einen Ansicht eintippst, gilt in der anderen weiter. Hier
sucht es über alle zwölf Monate und gilt für jede Zeile. Tippst du den Namen eines Blocks oder
einer Kategorie, steht dieser Block ganz da, mit allem darunter — man sucht eine Kategorie
schließlich, um sie zu sehen, nicht um sie leer zu finden.</p>
<p>Daneben zwei Knöpfe. <b>${t('year.hideDone')}</b> klappt jeden Monat weg, in dem nichts mehr
offen ist; <b>${t('year.hideSettled')}</b> blendet die Positionen aus, die für dieses Jahr
abbezahlt sind. Keiner von beiden ist zu Anfang an. Sie behalten ihren Namen und zeigen am dunklen
Grund, dass sie gelten; ein zweiter Klick schaltet sie ab — und beide merkt sich deine Datei, die
Tabelle sieht beim nächsten Öffnen also aus wie beim Zumachen.</p>
${gshot('year','Die Jahresansicht: links Suchfeld und die beiden Filterknöpfe, rechts, was etwas anlegt')}

<h4>Schritt 13 — Nach vorn schauen</h4>
${gshot('forecast','Die Prognose: das ganze Jahr, Monat für Monat')}
${gshot('forecast-plan','Rechts die Annahme je Kategorie')}
<p><b>${t('view.prognose')}</b> rechnet zusammen, was noch kommt, und zeigt den Saldo, der am
31. Dezember zu erwarten ist. Für die Monate, die du noch nicht gelebt hast, braucht sie je
Alltagskategorie eine Annahme — das ist die rechte Spalte.</p>
<p>Sobald ein paar Monate abgerechnet sind, klick auf <b>${t('prog.takeAvg')}</b>: FINA nimmt den
Durchschnitt dieser Monate und trägt ihn für den Rest des Jahres ein. Ab da ist die Prognose keine
Vermutung mehr.</p>

<h4>Schritt 14 — Speichern und die Datei sichern</h4>
<p><b>${t('app.save')}</b> schreibt alles — Zahlen und Einstellungen — in deine Datei. Chrome und
Edge schreiben dabei in genau dieselbe Datei zurück; andere Browser legen eine frische Kopie im
Download-Ordner ab.</p>
<p>Die Datei ist einfacher Text und gehört dir allein. Kopier sie ab und zu an einen sicheren Ort:
sie ist der einzige Ort, an dem deine Zahlen stehen.</p>

<h4>Wenn du Fast Budget benutzt</h4>
<p>Exportiere dort deine Transaktionen als CSV-Datei und lade sie hier über
<b>${t('kak.import')}</b>. FINA zeigt dir, welche Monate darin stehen, lässt dich einzelne
abwählen und sagt genau, was überschrieben wird. Erst der allerletzte Knopf ändert etwas.</p>

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
  <li><b>${t('view.kakeibo')}</b> — everyday spending that changes from month to month: groceries,
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
  <li>Press <b>${t('app.load')}</b> and pick your file. Starting from nothing? Skip this step,
      type something in, and the first <b>${t('app.save')}</b> will create the file.</li>
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
<p>With a file open FINA starts in the current month, without one in the year view — in the month
you work, in the year you build.</p>
${gshot('set-lists','Settings: every list has a code and a label of your own')}

<h4>The four views</h4>
<p><b>${t('view.monat')}</b> — one month, close up. This is where you work day to day: you see every
amount due, and you tick off what you have paid. The tabs above take you from month to month. Above
the regular costs sits a filter row — a search field, the due dates, the payment state — and while
you scroll, the heading of each block and that filter row stay at the top of the screen.</p>
${gshot('month-out','The month view, block by block')}
<p><b>${t('view.jahr')}</b> — the whole year as a table: one row per item, one column per month.
This is where you plan and where you spot the gaps.</p>
${gshot('year-left','The year table with the code columns B, PT, DD and LP')}
<p><b>${t('view.kakeibo')}</b> — the everyday spending in detail: what each category costs in the
chosen period and what it costs on average per month.</p>
${gshot('flex-view','Flexible Payments: spending by category')}
<p><b>${t('view.prognose')}</b> — how the year ends. It adds up what is still to come and shows the
balance you can expect on 31 December.</p>
${gshot('forecast','The forecast: every month up to the year-end balance')}
${gshot('forecast-plan','It works from one assumption per category')}

<h4>A regular cost, step by step</h4>
<p>Click <b>${t('year.addItem')}</b>, or the little pencil next to an item that already exists. The
window that opens has three parts.</p>
<p><b>At the top, who and what:</b> the name, the group it belongs to, which account it is paid from,
how it is paid, on which day of the month it is due, and — if it ever stops — the month and year of
the last payment. There is also room for a link to the invoice or the contract. The group is not
preselected: a new item asks for it, and without one it is not saved.</p>
<p><b>In the middle, the amounts:</b> twelve boxes, one per month.
<b>An expense is written with a minus sign</b> — “-49,90”. Income has no sign. If you would type the
same amount into many months, use the quick entry above: type the amount once, choose how often it
repeats and from which month, and press <b>${t('item.apply')}</b>.</p>
<p><b>Below every month, a tick:</b> it means “this one is settled”. A ticked month locks its
amount so you cannot change it by accident; untick it and you can type again. Two buttons do this
in bulk: one closes every month that is already over, the other reopens all of them. The month you
are currently in is deliberately left open — it is not finished yet.</p>
${gshot('item-dialog','The item window')}
<p>Is an amount not fixed yet — the electricity bill, roughly? Tick the box
<b>“${t('item.est')}”</b>. FINA then shows the figure in yellow with a question mark, so you can see
at a glance which numbers are guesses. As soon as you tick the month off, the guess counts as
confirmed and the colour goes back to normal.</p>

<h4>Everyday spending</h4>
<p>Everyday spending works the same way, only with categories instead of contracts. Give a category
an amount per month and tick it off once the month is done. If you have never spent time on it, an
estimate is enough — FINA marks it as a guess; in the month view that mark sits at the right-hand
end of the row, because it says something about the figure, not about the name.</p>
<p>If you use the <b>Fast Budget</b> app on your phone, you can save yourself the typing: export
your transactions there as a CSV file and load it here with <b>${t('kak.import')}</b>. FINA reads
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
  <li>The search field in the same bar filters every row of the table and searches all twelve
      months — name, amount, bank, payment type, category, note. It shares its word with the month
      view. Hit the name of a block or of a category, and that block stands there whole.</li>
  <li>The three block rows stay at the top of the screen while you scroll through their block.</li>
  <li>Clicking a month name takes you into that month; a double-click on any amount opens the item,
      the same window as the pencil.</li>
</ul>

<h4>Notes</h4>
<p>The small lamp is a note. There are two kinds: the lamp <b>next to a name</b> holds a note about
the item itself and shows up wherever the item appears; the lamp <b>inside a month</b> belongs to
that one month only — “paid in cash”, “check the invoice”. A lit lamp means there is a note; hover
over it to read it.</p>

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
  <li><b>${t('view.kakeibo')}</b> — die alltäglichen Ausgaben, die jeden Monat anders ausfallen:
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

<h4>Die vier Ansichten</h4>
<p><b>${t('view.monat')}</b> — ein Monat aus der Nähe. Hier arbeitest du im Alltag: du siehst jeden
fälligen Betrag und hakst ab, was du bezahlt hast. Über die Reiter darüber gehst du von Monat zu
Monat. Über den regelmäßigen Kosten steht eine Filterzeile — Suchfeld, Fälligkeit, Zahlungsstand —,
und beim Scrollen bleiben die Überschrift jedes Blocks und diese Zeile oben stehen.</p>
${gshot('month-out','Die Monatsansicht, Block für Block')}
<p><b>${t('view.jahr')}</b> — das ganze Jahr als Tabelle: je Position eine Zeile, je Monat eine
Spalte. Hier planst du, und hier fallen dir Lücken auf.</p>
${gshot('year-left','Die Jahrestabelle mit den Kürzelspalten B, PT, DD und LP')}
<p><b>${t('view.kakeibo')}</b> — die alltäglichen Ausgaben im Einzelnen: was jede Kategorie im
gewählten Zeitraum kostet und was sie im Schnitt je Monat kostet.</p>
${gshot('flex-view','Flexible Payments: die Ausgaben je Kategorie')}
<p><b>${t('view.prognose')}</b> — wie das Jahr ausgeht. Sie rechnet zusammen, was noch kommt, und
zeigt den Saldo, der am 31. Dezember zu erwarten ist.</p>
${gshot('forecast','Die Prognose: jeder Monat bis zum Saldo am Jahresende')}
${gshot('forecast-plan','Sie rechnet mit einer Annahme je Kategorie')}

<h4>Regelmäßige Kosten, Schritt für Schritt</h4>
<p>Klick auf <b>${t('year.addItem')}</b> oder auf den kleinen Stift neben einer vorhandenen Position.
Das Fenster, das aufgeht, hat drei Teile.</p>
<p><b>Oben, wer und was:</b> der Name, die Gruppe, zu der die Position gehört, von welchem Konto sie
abgeht, wie bezahlt wird, an welchem Tag im Monat sie fällig ist und — falls sie einmal endet —
Monat und Jahr der letzten Zahlung. Dazu ist Platz für einen Link zur Rechnung oder zum Vertrag.
Die Gruppe ist nicht vorausgewählt: eine neue Position fragt danach und wird ohne sie nicht
gespeichert.</p>
<p><b>In der Mitte die Beträge:</b> zwölf Felder, eines je Monat.
<b>Eine Ausgabe wird mit Minus geschrieben</b> — „-49,90". Einnahmen bekommen kein Vorzeichen. Wenn
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

<h4>Die alltäglichen Ausgaben</h4>
<p>Die alltäglichen Ausgaben laufen genauso, nur mit Kategorien statt Verträgen. Gib einer Kategorie
einen Betrag je Monat und hak sie ab, wenn der Monat durch ist. Wer sich nicht festlegen mag, trägt
eine Schätzung ein — FINA kennzeichnet sie als solche; in der Monatsansicht steht diese Marke am
rechten Ende der Zeile, denn sie sagt etwas über die Zahl, nicht über den Namen.</p>
<p>Wenn du auf dem Handy die App <b>Fast Budget</b> benutzt, kannst du dir das Tippen sparen:
exportiere dort deine Transaktionen als CSV-Datei und lade sie hier über
<b>${t('kak.import')}</b>. FINA liest die Datei, zeigt dir, welche Monate darin stehen, lässt dich
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
  <li>Das Suchfeld in derselben Leiste filtert jede Zeile der Tabelle und sucht über alle zwölf
      Monate — Name, Betrag, Bank, Zahlungsart, Kategorie, Notiz. Es teilt sein Wort mit der
      Monatsansicht. Triffst du den Namen eines Blocks oder einer Kategorie, steht dieser Block
      ganz da.</li>
  <li>Die drei Blockzeilen bleiben beim Scrollen oben stehen, solange ihr Block läuft.</li>
  <li>Ein Klick auf einen Monatsnamen bringt dich in diesen Monat; ein Doppelklick auf einen Betrag
      öffnet die Position — dasselbe Fenster wie der Stift.</li>
</ul>

<h4>Notizen</h4>
<p>Die kleine Lampe ist eine Notiz. Es gibt sie zweimal: die Lampe <b>neben einem Namen</b> trägt
eine Notiz zur Position selbst und taucht überall auf, wo die Position vorkommt; die Lampe
<b>in einem Monat</b> gehört nur zu diesem einen Monat — „bar bezahlt", „Rechnung noch prüfen". Eine
leuchtende Lampe heißt: da steht etwas. Fahr mit der Maus darüber, um es zu lesen.</p>

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
<h4>26.8.4.1 <span class="pill">latest</span></h4>
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
  <li><b>Three kinds of money</b> — ${t('g.income')}, ${t('g.fixed')} and ${t('view.kakeibo')} —
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
<h4>26.8.4.1 <span class="pill">neu</span></h4>
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
  <li><b>Drei Arten von Geld</b> — ${t('g.income')}, ${t('g.fixed')} und ${t('view.kakeibo')} —
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
