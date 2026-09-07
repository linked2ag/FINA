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

/* ── Die Bausteine der Anleitung (7.9.26) ─────────────────────
   Die Anleitung ist seit dem 7.9.26 nach der Vorlage
   `_BusinessCenter/DESIGN/260907 Guide für FINA (von GPT).html`
   gebaut: nummerierte Schritte, ein hervorgehobener Merksatz
   (Callout), Kärtchen für die Bereiche, je Funktion ein Block mit
   Titel links und Text rechts, und im Reiter „Was ist neu" je
   Version eine Karte mit Überschrift, einem Satz und einer
   Häkchenliste. Die Regeln dazu stehen in css/components.css
   (Abschnitt „Anleitung"). Jeder Baustein ist eine Funktion, damit
   die Reiter in beiden Sprachen dasselbe Gerüst tragen und die
   Klassen an einer Stelle stehen. */
const gcall=(title,body)=>`<div class="gcall"><b>${title}</b>${body}</div>`;
const gstep=(n,title,body)=>`<div class="gstep"><span class="gnum">${n}</span><div><h3>${title}</h3>${body}</div></div>`;
const gcard=(cls,title,body)=>`<div class="gcard ${cls}"><h3>${title}</h3><p>${body}</p></div>`;
const gfeat=(title,sub,body)=>`<div class="gfeat"><div class="gfh"><h3>${title}</h3><p>${sub}</p></div><div class="gfb">${body}</div></div>`;
/* Eine Version im Reiter „Was ist neu". `cur` ist die Beschriftung
   der Marke an der neuesten Fassung — nur sie trägt eine. */
const gver=(v,title,body,cur)=>`<article class="gver${cur?' cur':''}"><span class="gtag">${v}</span>${cur?`<span class="pill">${cur}</span>`:''}<h3>${title}</h3>${body}</article>`;

const GUIDE={

/* ── Reiter 1: Schritt für Schritt ─────────────────────────── */
steps:{

en:()=>`
<h3 class="gtitle">Up and running in about 30 minutes</h3>
<p class="glead">You need no prior knowledge. Set up your year once. After that you keep your
book in a few minutes a month. Everything else is in <b>${t('guide.tabProduct')}</b>.</p>
${gcall('The simple rule',`<p>A contract is <b>regular</b>. What you spend day to day is
<b>flexible</b>. Money that comes in is <b>income</b>. The category you pick decides which
of the three an entry belongs to.</p>`)}

<div class="gsteps">
${gstep(1,'Start a book',`
<p>With no file open you see two buttons. <b>${t('wel.new')}</b> begins an empty book. Do you
already have a FINA file? Then press <b>${t('wel.open')}</b>. Top right you choose the
language. One book holds exactly one calendar year.</p>
${gshot('welcome','The first screen: open a file, or start from scratch')}`)}

${gstep(2,'Year, language and opening balance',`
<p>Open the menu <b>☰</b> at the top right and press <b>${t('app.settings')}</b>. In
<b>${t('set.navGeneral')}</b> choose the language and the year. Under
<b>${t('set.opening')}</b> type what was in your account before January. Leave it empty and
FINA starts at zero.</p>
${gshot('set-general','Settings, section General')}`)}

${gstep(3,'Accounts, payment types and categories',`
<p>Still in the settings. Under <b>${t('set.navBanks')}</b> name your accounts, for example
“Current account”, and how you pay, for example “Direct debit”. Each gets a short code.</p>
<p>Under <b>${t('set.groups')}</b> stand three lists: income, flexible, regular. A few per
list are plenty, say “Groceries”, “Car” and “Leisure”. A name may appear only once across the
three lists. Press <b>${t('g.save')}</b> in the window.</p>
${gshot('set-groups','Settings, section Categories: three lists, one per area')}`)}

${gstep(4,'Enter your salary and your fixed bills',`
<p>Open the menu and press <b>${t('menu.newOut')}</b>. Give the entry a name, a category, an
account, a payment type and a due day. Then the amounts: twelve boxes, one per month.
<b>An expense gets a minus</b>, for example “-49,90”. The same amount every month? Type it once
in <b>${t('item.quick')}</b> and press <b>${t('item.apply')}</b>.</p>
<p>Press <b>${t('g.save')}</b>. Repeat for every income and every contract.</p>
${gshot('item-dialog','Menu → New entry: name, assignment, twelve months')}`)}

${gstep(5,'Plan your everyday spending',`
<p>Same window, same button. Pick a category from the <b>${t('g.flex')}</b> group, for
example “Groceries”. Estimate an amount per month and switch on <b>${t('g.estimated')}</b>.
It then shows in yellow with a question mark.</p>
<p>Later you replace the estimate with the real number. Or you let FINA read it from your bank
statement with a CSV import.</p>
${gshot('item-flex','A flexible entry: one estimate per month, the past months settled')}`)}

${gstep(6,'Update once a month',`
<p>Open the tab <b>${t('view.monat')}</b>. Click the circle in front of a row as soon as the
payment has left your account. Correct a different amount with a double-click on the amount
or the name. Estimated amounts are never ticked off in passing: their circle opens the entry
first, so you check the number.</p>
<p>Want to find something? Just start typing. The first letter goes into the search field.</p>
${gshot('month-page','The month view. Green: paid · Blue: from a CSV import · Question mark: estimated')}`)}

${gstep(7,'Save and back up',`
<p>Press <b>${t('app.save')}</b> to write your changes into the file. As soon as there is
something to save, the button steps out of the menu and stands next to ☰ with a red frame.</p>
<p><b>${t('app.backup')}</b> puts a dated copy in your downloads folder. Make one before a big
change or an import. Nothing is ever saved by itself.</p>`)}
</div>

<p class="gend">That is the whole book. Everything else — the year table, the forecast, the
filters, the CSV import — is in <b>${t('guide.tabProduct')}</b>.</p>
`,

de:()=>`
<h3 class="gtitle">In etwa 30 Minuten startklar</h3>
<p class="glead">Du brauchst kein Vorwissen. Richte dein Jahr einmal ein. Danach pflegst du
dein Buch in wenigen Minuten pro Monat. Alles Weitere steht in
<b>${t('guide.tabProduct')}</b>.</p>
${gcall('Die einfache Regel',`<p>Ein Vertrag ist <b>regulär</b>. Was du im Alltag ausgibst,
ist <b>flexibel</b>. Geld, das hereinkommt, ist eine <b>Einnahme</b>. Die Kategorie, die du
wählst, entscheidet, zu welchem der drei Bereiche ein Eintrag gehört.</p>`)}

<div class="gsteps">
${gstep(1,'Ein Buch anfangen',`
<p>Ohne Datei siehst du zwei Knöpfe. <b>${t('wel.new')}</b> beginnt ein leeres Buch. Hast du
schon eine FINA-Datei? Dann wähle <b>${t('wel.open')}</b>. Oben rechts wählst du die Sprache.
Ein Buch steht immer für genau ein Kalenderjahr.</p>
${gshot('welcome','Die erste Seite: Datei öffnen oder neu anfangen')}`)}

${gstep(2,'Jahr, Sprache und Anfangsbestand',`
<p>Öffne das Menü <b>☰</b> oben rechts und drücke <b>${t('app.settings')}</b>. Unter
<b>${t('set.navGeneral')}</b> wählst du Sprache und Jahr. Trage beim
<b>${t('set.opening')}</b> ein, was vor Januar auf deinem Konto war. Ohne Wert fängt FINA bei
null an.</p>
${gshot('set-general','Die Einstellungen, Bereich Allgemein')}`)}

${gstep(3,'Konten, Zahlungsarten und Kategorien',`
<p>Noch in den Einstellungen. Unter <b>${t('set.navBanks')}</b> nennst du deine Konten, etwa
„Girokonto“, und wie du zahlst, etwa „Lastschrift“. Jedes bekommt ein Kürzel.</p>
<p>Unter <b>${t('set.groups')}</b> stehen drei Listen: Einnahmen, Flexibel, Regulär. Wenige
je Liste genügen, etwa „Lebensmittel“, „Auto“ und „Freizeit“. Ein Name darf über alle drei
Listen nur einmal vorkommen. Drücke <b>${t('g.save')}</b> im Fenster.</p>
${gshot('set-groups','Die Einstellungen, Bereich Kategorien: drei Listen, eine je Bereich')}`)}

${gstep(4,'Gehalt und feste Rechnungen eintragen',`
<p>Öffne das Menü und drücke <b>${t('menu.newOut')}</b>. Gib dem Eintrag einen Namen, eine
Kategorie, Konto, Zahlungsart und Fälligkeit. Dann die Beträge: zwölf Kästchen, eins je Monat.
<b>Eine Ausgabe bekommt ein Minus</b>, zum Beispiel „-49,90“. Jeden Monat derselbe Betrag?
Tipp ihn einmal in die <b>${t('item.quick')}</b> und drücke <b>${t('item.apply')}</b>.</p>
<p>Drücke <b>${t('g.save')}</b>. Wiederhole das für jede Einnahme und jeden Vertrag.</p>
${gshot('item-dialog','Menü → Neuer Eintrag: Name, Zuordnung, zwölf Monate')}`)}

${gstep(5,'Alltagsausgaben planen',`
<p>Dasselbe Fenster, derselbe Knopf. Wähle eine Kategorie aus dem Bereich
<b>${t('g.flex')}</b>, etwa „Lebensmittel“. Schätze einen Betrag je Monat und schalte
<b>${t('g.estimated')}</b> ein. Er steht dann gelb mit einem Fragezeichen.</p>
<p>Später ersetzt du die Schätzung durch den tatsächlichen Wert. Oder du lässt FINA ihn per
CSV-Import aus deinem Kontoauszug lesen.</p>
${gshot('item-flex','Ein flexibler Eintrag: je Monat eine Schätzung, die vergangenen Monate abgeschlossen')}`)}

${gstep(6,'Einmal im Monat aktualisieren',`
<p>Öffne den Reiter <b>${t('view.monat')}</b>. Klicke den Kreis vor einer Zeile an, sobald die
Zahlung vom Konto abgegangen ist. Einen abweichenden Betrag korrigierst du per Doppelklick auf
Betrag oder Namen. Geschätzte Beträge werden nie nebenbei abgehakt: ihr Kreis öffnet zuerst den
Eintrag, damit du die Zahl prüfst.</p>
<p>Du suchst etwas? Einfach lostippen. Der erste Buchstabe landet im Suchfeld.</p>
${gshot('month-page','Die Monatsansicht. Grün: bezahlt · Blau: aus dem CSV-Import · Fragezeichen: geschätzt')}`)}

${gstep(7,'Speichern und sichern',`
<p>Drücke <b>${t('app.save')}</b>, um deine Änderungen in die Datei zu schreiben. Sobald es
etwas zu speichern gibt, tritt der Knopf aus dem Menü heraus und steht mit rotem Rahmen neben
dem ☰.</p>
<p><b>${t('app.backup')}</b> legt eine datierte Kopie in deinen Download-Ordner. Mach eine vor
einer großen Änderung oder einem Import. Von selbst wird nie gespeichert.</p>`)}
</div>

<p class="gend">Das ist das ganze Buch. Alles Weitere — die Jahrestabelle, die Prognose, die
Filter, der CSV-Import — steht in <b>${t('guide.tabProduct')}</b>.</p>
`},

/* ── Reiter 2: Was FINA kann ───────────────────────────────── */
product:{

en:()=>`
<p class="glead">FINA answers three practical questions: What is still due? Where does my
money go? And how does my balance develop until the end of the year?</p>
${gcall('Amounts come in two ways',`<p>You type payments yourself, check them and tick them
off. Or you import transactions from a CSV file and let FINA take over the matching values.
The import starts under <b>☰ → ${t('menu.csv')}</b>.</p>`)}

<div class="gcards">
${gcard('t-in',t('g.income'),'Salary, refunds and every positive amount.')}
${gcard('t-out',t('g.fixed'),'Contracts that repeat: rent, insurance, subscriptions.')}
${gcard('t-flex',t('g.flex'),'Everyday spending: groceries, fuel, going out.')}
${gcard('t-bal',t('bal.row'),'For a difference you cannot explain. Type it, and the balance is right again.')}
</div>
<p>Everything lives in <b>one file on your own computer</b>. No account, no cloud, no server.
FINA writes to that file only when you press <b>${t('app.save')}</b>.</p>

${gfeat(t('view.monat'),'Your working view',`
<p>Open the tab <b>${t('view.monat')}</b> at the top. This is where you do the running work
of one month.</p>
<ul>
  <li>Pick the month in the bar at the top. The current month has a red ring.</li>
  <li>Tick off payments once they have left your account.</li>
  <li>Use search and filters to find open, estimated or due entries quickly.</li>
  <li>The analytics line shows income, flexible, regular and <b>${t('month.kpiSaldo')}</b>.
      Click it and the timeline of the month opens: five rows, one waterfall, your balance
      as the scale.</li>
  <li>A click on a card heading folds the card. A double-click on an amount or a name opens
      the entry.</li>
</ul>
${gshot('month-slim','The month view with the analytics opened')}`)}

${gfeat(t('view.jahr'),'Plan and keep the overview',`
<p>Open the tab <b>${t('view.jahr')}</b>. The year table shows every entry as a row and every
month as a column.</p>
<ul>
  <li>Spot the gaps and check the plan for the whole year.</li>
  <li>The narrow columns on the left carry the codes: <b>B</b> bank, <b>PT</b> payment type,
      <b>DD</b> due day, <b>LP</b> last payment. The colour of LP says how long a contract
      still runs.</li>
  <li><b>${t('year.totalRow')}</b> at the top is what that month brings in and costs. The
      three blocks below break it down.</li>
  <li>Click a month name to jump into that month.</li>
  <li>Hide completed months or finished entries when you need the room. Both buttons are for
      this session only.</li>
  <li>Double-click an amount or a name to open the entry. A click on a block row folds the
      block.</li>
</ul>
${gshot('year-left','The year table with the code columns B, PT, DD and LP')}`)}

${gfeat(t('view.prognose'),'Look ahead to the year end',`
<p>Open the tab <b>${t('view.prognose')}</b>. It adds up everything planned and entered and
shows how your balance develops month by month.</p>
<ul>
  <li><b>START</b> is the balance the month begins with.</li>
  <li><b>SUM</b> is the total of all movements in the month.</li>
  <li><b>PROG</b> is the expected balance after this month. Read down the column, it is the
      course of your finances over the year. The chart on the right draws the same.</li>
  <li>Change the amounts in the entry; the forecast recalculates by itself. Double-click a
      month in <b>COR</b> and the balance correction opens at that month.</li>
</ul>
${gshot('forecast','The forecast: every month up to the year-end balance')}`)}

${gfeat('The entry window','One window for everything',`
<p>The pencil next to a row opens it, and so does a double-click. The window is the same for
income, regular and flexible entries, built in blocks from top to bottom:</p>
<ol>
  <li><b>The name</b> as heading. Click it to change it.</li>
  <li><b>Assignment:</b> category, bank, payment type, due day, and the last payment if the
      contract ends. Above the fields a link per list opens the settings on top of the window.</li>
  <li><b>${t('item.links')}:</b> contract, invoice, customer account. Paste an address and the
      name fills itself in.</li>
  <li><b>${t('item.quick')}:</b> one amount, how often it repeats, from which month.
      <b>${t('g.estimated')}</b> marks all amounts as guesses.</li>
  <li><b>The twelve months</b> with a tick each. A ticked month locks its amount. A month with
      the blue arrow came from a CSV and stays locked until you delete the import data of the
      entry.</li>
</ol>
<p><b>${t('item.dup')}</b> opens a copy of what is typed, without ticks and notes.</p>
${gshot('item-months','The twelve months: amount, tick, note lamp')}`)}

${gfeat('CSV import','Take over transactions faster',`
<p>Open <b>☰ → ${t('menu.csv')}</b>. The import wizard leads you through three steps:
<b>${t('c2.steps1')}</b>, <b>${t('c2.steps2')}</b> and <b>${t('c2.steps3')}</b>.</p>
<ul>
  <li>Recurring matches can be remembered. FINA stores the criteria at the entry and applies
      them on your command in the next import.</li>
  <li>One-off transactions you assign by hand, without a rule.</li>
  <li>Rows already in the book are recognised and never imported twice. An import adds to a
      month; it never replaces what is there.</li>
  <li>The exact step-by-step guide is inside the wizard: in steps 2 and 3 press
      <b>${t('app.guide')}</b>.</li>
</ul>
<p>What FINA has learned, structures and criteria, is under <b>${t('app.settings')}</b> →
<b>${t('set.navImport')}</b>.</p>
${gshot('csv-step3','Step 3 of the import: entries above, file rows below, the guide beside it')}`)}

${gfeat('Search, filter, notes','Try without risk',`
<p>Filters never change your file. They only decide which rows you see. Search by name, amount,
category or payment state. While a filter is on, the filter row is yellow, and every number on
screen follows what is shown: card totals, category rows, the analytics line.</p>
<p><b>${t('flt.options')}</b> next to the search field says where the search looks. The
<b>✕</b> or Escape takes every filter back.</p>
<p>The small lamp is a note. Next to a name it belongs to the entry, inside a month to that
month only. A lit lamp has a note; point at it to read it.</p>
${gshot('ui-filter','A filter at work: the row turns yellow, the cards show only the hits')}`)}

${gfeat('On the phone','For looking things up',`
<p>Below 700 px FINA builds a layout of its own: the month as a card list with large circles,
the year as twelve month cards, the forecast with its chart to swipe. The view is chosen at
the bottom. Saving is not available there, only <b>${t('app.backup')}</b>.</p>`)}

${gcall('Important: saving never happens by itself.',`<p>Your data stays in a file on your
computer. Only <b>${t('app.save')}</b> writes changes into it. Chrome and Edge write back into
the same file; other browsers put a dated copy in your downloads folder.</p>`)}

${gfeat('What FINA is not','Honest limits',`
<ul>
  <li><b>Not a bank connection.</b> FINA never talks to your bank. You type, or you import a
      CSV file you exported yourself.</li>
  <li><b>Not a cloud.</b> One file, on your computer. You take care of copies.</li>
  <li><b>Not a multi-year book.</b> One file holds one year. Start a new file for the next
      year and give it last year's closing balance as its opening balance.</li>
  <li><b>Not finished.</b> FINA is in its pilot phase: everything is unlocked and free.
      Instead of a price we ask for your opinion — an orange <b>${t('srv.open')}</b> button
      in the header when a survey is running.</li>
</ul>`)}
`,

de:()=>`
<p class="glead">FINA beantwortet drei praktische Fragen: Was ist noch fällig? Wofür geht mein
Geld weg? Und wie entwickelt sich mein Kontostand bis zum Jahresende?</p>
${gcall('Beträge auf zwei Arten erfassen',`<p>Du trägst Zahlungen selbst ein, prüfst sie und
hakst sie ab. Oder du importierst Umsätze aus einer CSV-Datei und lässt FINA die passenden
Werte übernehmen. Den Import startest du über <b>☰ → ${t('menu.csv')}</b>.</p>`)}

<div class="gcards">
${gcard('t-in',t('g.income'),'Gehalt, Rückzahlungen und alle positiven Beträge.')}
${gcard('t-out',t('g.fixed'),'Wiederkehrende Verträge wie Miete, Versicherung oder Abos.')}
${gcard('t-flex',t('g.flex'),'Alltagsausgaben wie Lebensmittel, Tanken oder Freizeit.')}
${gcard('t-bal',t('bal.row'),'Für eine Differenz, die du nicht erklären kannst. Eintragen, und der Saldo stimmt wieder.')}
</div>
<p>Alles steht in <b>einer Datei auf deinem eigenen Rechner</b>. Kein Konto, keine Cloud, kein
Server. FINA schreibt in diese Datei nur, wenn du <b>${t('app.save')}</b> drückst.</p>

${gfeat(t('view.monat'),'Deine Arbeitsansicht',`
<p>Öffne oben den Reiter <b>${t('view.monat')}</b>. Hier erledigst du die laufende Arbeit eines
Monats.</p>
<ul>
  <li>Wähle den Monat in der Leiste oben. Der laufende Monat trägt einen roten Ring.</li>
  <li>Hake Zahlungen ab, sobald sie vom Konto abgegangen sind.</li>
  <li>Nutze Suche und Filter, um offene, geschätzte oder fällige Einträge schnell zu finden.</li>
  <li>Die Auswertungszeile zeigt Einnahmen, Flexibel, Regulär und den
      <b>${t('month.kpiSaldo')}</b>. Ein Klick darauf öffnet den Zeitstrahl des Monats: fünf
      Zeilen, ein Wasserfall, dein Kontostand als Maßstab.</li>
  <li>Ein Klick auf einen Kartenkopf klappt die Karte zu. Ein Doppelklick auf Betrag oder Namen
      öffnet den Eintrag.</li>
</ul>
${gshot('month-slim','Die Monatsansicht mit aufgeklappter Auswertung')}`)}

${gfeat(t('view.jahr'),'Planen und Überblick behalten',`
<p>Öffne den Reiter <b>${t('view.jahr')}</b>. Die Jahrestabelle zeigt jeden Eintrag als Zeile
und jeden Monat als Spalte.</p>
<ul>
  <li>Erkenne Lücken und prüfe die Planung des ganzen Jahres.</li>
  <li>Die schmalen Spalten links tragen die Kürzel: <b>B</b> Bank, <b>PT</b> Zahlungsart,
      <b>DD</b> Fälligkeit, <b>LP</b> letzte Zahlung. Die Farbe von LP sagt, wie lange ein
      Vertrag noch läuft.</li>
  <li><b>${t('year.totalRow')}</b> ganz oben ist, was dieser Monat bringt und kostet. Die drei
      Blöcke darunter schlüsseln es auf.</li>
  <li>Klicke auf einen Monatsnamen, um in diesen Monat zu springen.</li>
  <li>Blende abgeschlossene Monate oder erledigte Einträge aus, wenn du Platz brauchst. Beide
      Knöpfe gelten nur für diese Sitzung.</li>
  <li>Doppelklicke auf Betrag oder Namen, um den Eintrag zu öffnen. Ein Klick auf eine
      Blockzeile klappt den Block zu.</li>
</ul>
${gshot('year-left','Die Jahrestabelle mit den Kürzelspalten B, PT, DD und LP')}`)}

${gfeat(t('view.prognose'),'Bis zum Jahresende vorausblicken',`
<p>Öffne den Reiter <b>${t('view.prognose')}</b>. Sie rechnet alles Geplante und Eingetragene
zusammen und zeigt, wie sich dein Kontostand Monat für Monat entwickelt.</p>
<ul>
  <li><b>START</b> ist der Kontostand zu Monatsbeginn.</li>
  <li><b>SUM</b> ist die Summe aller Bewegungen im Monat.</li>
  <li><b>PROG</b> ist der erwartete Stand nach diesem Monat. Von oben nach unten gelesen ist
      die Spalte der Verlauf deiner Finanzen über das Jahr. Die Grafik rechts zeichnet
      dasselbe.</li>
  <li>Ändere die Beträge im jeweiligen Eintrag; die Prognose rechnet von selbst neu. Ein
      Doppelklick auf einen Monat in <b>COR</b> öffnet die Saldokorrektur mit diesem
      Monat.</li>
</ul>
${gshot('forecast','Die Prognose: jeder Monat bis zum Saldo am Jahresende')}`)}

${gfeat('Das Fenster eines Eintrags','Ein Fenster für alles',`
<p>Der Stift neben einer Zeile öffnet es, ein Doppelklick ebenso. Das Fenster ist für
Einnahmen, reguläre und flexible Einträge dasselbe, in Blöcken von oben nach unten:</p>
<ol>
  <li><b>Der Name</b> als Überschrift. Klick darauf, um ihn zu ändern.</li>
  <li><b>Zuordnung:</b> Kategorie, Bank, Zahlungsart, Fälligkeit und die letzte Zahlung, wenn
      der Vertrag endet. Über den Feldern öffnet ein Weg je Liste die Einstellungen über dem
      Fenster.</li>
  <li><b>${t('item.links')}:</b> Vertrag, Rechnung, Kundenkonto. Adresse einfügen, der Name
      füllt sich von selbst.</li>
  <li><b>${t('item.quick')}:</b> ein Betrag, wie oft er sich wiederholt, ab welchem Monat.
      <b>${t('g.estimated')}</b> markiert alle Beträge als Schätzung.</li>
  <li><b>Die zwölf Monate</b> mit je einem Haken. Ein abgehakter Monat sperrt seinen Betrag.
      Ein Monat mit dem blauen Pfeil kam aus einer CSV und bleibt gesperrt, bis du die
      Importdaten des Eintrags löschst.</li>
</ol>
<p><b>${t('item.dup')}</b> öffnet eine Kopie des Getippten, ohne Haken und Notizen.</p>
${gshot('item-months','Die zwölf Monate: Betrag, Haken, Notizlampe')}`)}

${gfeat('CSV-Import','Umsätze schneller übernehmen',`
<p>Öffne <b>☰ → ${t('menu.csv')}</b>. Der Import-Assistent führt dich durch drei Schritte:
<b>${t('c2.steps1')}</b>, <b>${t('c2.steps2')}</b> und <b>${t('c2.steps3')}</b>.</p>
<ul>
  <li>Wiederkehrende Zuordnungen kannst du merken lassen. FINA speichert die Kriterien am
      Eintrag und wendet sie beim nächsten Import auf dein Kommando an.</li>
  <li>Einmalige Umsätze ordnest du von Hand zu, ohne Regel.</li>
  <li>Bereits importierte Zeilen erkennt FINA und importiert sie nicht doppelt. Ein Import
      ergänzt einen Monat; er ersetzt nie, was schon da ist.</li>
  <li>Die genaue Schritt-für-Schritt-Anleitung steht im Assistenten selbst: in Schritt 2 und
      3 über den Knopf <b>${t('app.guide')}</b>.</li>
</ul>
<p>Was FINA gelernt hat, Strukturen und Kriterien, steht unter <b>${t('app.settings')}</b> →
<b>${t('set.navImport')}</b>.</p>
${gshot('csv-step3','Schritt 3 des Imports: oben die Einträge, unten die Dateizeilen, daneben die Anleitung')}`)}

${gfeat('Suchen, filtern, Notizen','Ohne Risiko ausprobieren',`
<p>Filter ändern nie deine Datei. Sie entscheiden nur, welche Zeilen du siehst. Suche nach Name,
Betrag, Kategorie oder Zahlungsstatus. Solange ein Filter greift, ist die Filterzeile gelb, und
jede Zahl auf dem Schirm folgt dem, was gezeigt wird: Kartensummen, Kategoriezeilen, die
Auswertungszeile.</p>
<p><b>${t('flt.options')}</b> neben dem Suchfeld sagt, worin die Suche sucht. Das <b>✕</b>
oder Escape nimmt jeden Filter zurück.</p>
<p>Die kleine Lampe ist eine Notiz. Neben einem Namen gehört sie zum Eintrag, in einem Monat nur
zu diesem Monat. Eine leuchtende Lampe hat eine Notiz; zeig darauf, um sie zu lesen.</p>
${gshot('ui-filter','Ein Filter greift: die Zeile wird gelb, die Karten zeigen nur die Treffer')}`)}

${gfeat('Auf dem Telefon','Zum Nachsehen',`
<p>Unter 700 px baut FINA ein eigenes Layout: der Monat als Kartenliste mit großen Kreisen, das
Jahr als zwölf Monatskarten, die Prognose mit ihrer Grafik zum Wischen. Die Ansicht wählst du
unten. Speichern gibt es dort nicht, nur <b>${t('app.backup')}</b>.</p>`)}

${gcall('Wichtig: Speichern passiert nie automatisch.',`<p>Deine Daten bleiben in einer
Datei auf deinem Rechner. Erst <b>${t('app.save')}</b> schreibt Änderungen hinein. Chrome und
Edge schreiben in dieselbe Datei zurück; andere Browser legen eine datierte Kopie in den
Download-Ordner.</p>`)}

${gfeat('Was FINA nicht ist','Ehrliche Grenzen',`
<ul>
  <li><b>Keine Bankverbindung.</b> FINA redet nie mit deiner Bank. Du tippst, oder du
      importierst eine CSV-Datei, die du selbst exportiert hast.</li>
  <li><b>Keine Cloud.</b> Eine Datei, auf deinem Rechner. Um Kopien kümmerst du dich.</li>
  <li><b>Kein Mehrjahresbuch.</b> Eine Datei fasst ein Jahr. Fürs nächste Jahr fängst du eine
      neue Datei an und gibst ihr den Endstand des alten als Anfangsbestand.</li>
  <li><b>Nicht fertig.</b> FINA ist in der Pilotphase: alles ist freigeschaltet und kostenlos.
      Statt eines Preises fragen wir nach deiner Meinung — ein oranger Knopf
      <b>${t('srv.open')}</b> in der Kopfzeile, solange eine Umfrage läuft.</li>
</ul>`)}
`},

/* ── Reiter 3: Was ist neu ─────────────────────────────────────
   Die Versionsliste, neueste Fassung oben. Seit dem 7.9.26 ist
   jede Version eine Karte (gver): die Nummer als Marke, eine
   Überschrift, die in einem Satz sagt, was der Nutzer davon hat,
   ein Satz dazu und darunter eine Häkchenliste — je Punkt eine
   Zeile. Nur die neueste trägt die gelbe Marke „Aktuelle Version"
   und den gelben Rahmen.

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
<p class="glead">The most important changes of the last versions — without technical
details, and with what they mean for you.</p>
<div class="gvers">
${gver('26.9.7','A guide you can read in half an hour',`
<p>All three tabs of this guide are rebuilt: numbered steps with a picture each, cards for
the four areas, one block per function, and every version as a card like this one. The
pictures show the current FINA.</p>
<ul class="gcheck">
  <li>The guide beside the CSV import has the same head: EN · DE, a button for a full page,
      and a handle to drag its width — at least a third of the window.</li>
  <li>Both guides slide in from the right and out again.</li>
  <li>The assignment bar of the import no longer scrolls: when the window is narrow, its
      buttons move into the ☰ menu, except “${t('c2.assign')}” and “${t('c2.newAssign')}”.</li>
  <li>The column that marks the header row is called HDR in both languages.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`,'Current version')}

${gver('26.9.6','One kind of entry, a smarter import, and everything moves',`
<p>Flexible entries are now entries like any other: same window, same fields, one
“${t('menu.newOut')}”. The import knows what it has already seen. And the whole interface
moves.</p>
<ul class="gcheck">
  <li>The category decides between income, flexible and regular. Each area keeps an “N/A”
      category for entries without one.</li>
  <li>Rows already in the book, and rows assigned in this run, stay in the file table, grey
      with a cross in the column “X”. A button hides and shows them.</li>
  <li>An import adds to a month instead of replacing it. A fifth reference field.</li>
  <li>In step 3 the three area rows fold their block; “${t('c2.foldAllBtnShow')}” /
      “${t('c2.foldAllBtnHide')}” does it for all at once.</li>
  <li>A month with the blue arrow is locked until you delete the import data of the entry.</li>
  <li>The year view has the three filter menus, struck-through completed months and the
      scrollbar below the table.</li>
  <li><b>${t('set.navImport')}</b> in the settings has three sections; a remembered CSV
      structure opens as a window with its own delete button. The table import is gone.</li>
  <li>Views slide in sideways, windows drop in from the top, menus unfold, cards and blocks
      fold smoothly. One click folds. Switched off if your system asks for reduced motion.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.9.5','The import wizard in three clear steps',`
<p>The CSV import now leads you through <b>${t('c2.steps1')}</b>,
<b>${t('c2.steps2')}</b> and <b>${t('c2.steps3')}</b>. The help stands right next to the
step.</p>
<ul class="gcheck">
  <li>FINA remembers the column structure of a recurring file export.</li>
  <li>Matching rules are stored at the entry as its import criteria.</li>
  <li>In the next matching import you apply the remembered rules on your command.</li>
  <li>“${t('app.guide')}” in steps 2 and 3 explains the step beside the window.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.30','Saving is easier to see',`
<p>Unsaved changes now catch the eye. FINA still saves only when you say so.</p>
<ul class="gcheck">
  <li>“${t('app.save')}” steps out of the menu as soon as there is something to save, with a
      red frame next to ☰. An open survey sits to its left.</li>
  <li>When the header gets too narrow, a red dot on ☰ says that something inside is waiting.</li>
  <li>“${t('app.load')}” and “${t('menu.csv')}” are their own group at the top of the menu.</li>
  <li>The fourth box of the analytics line is the <b>${t('month.kpiSaldo')}</b> of the month —
      the same number the year view calls <b>${t('year.totalRow')}</b>.</li>
  <li>The forecast has a new column <b>SUM</b>; the balance column is now called <b>PROG</b>.</li>
  <li>Under <b>${t('set.navView')}</b> you decide whether the month opens with its analytics and
      whether the year opens with completed months hidden.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.24','Import any CSV file',`
<p>Bank statement, card export, budget app: FINA reads them all through the same import
wizard.</p>
<ul class="gcheck">
  <li>Pick the file, choose columns and fields, then match the rows to your entries with
      filters.</li>
  <li>Imported months carry a blue symbol and cannot be overwritten by accident.</li>
  <li>For recurring file types FINA remembers the mapping.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.23','Free while we pilot, better filters, a reworked phone',`
<p>Everything is unlocked and free. Instead of a price we ask what you think.</p>
<ul class="gcheck">
  <li>An orange <b>${t('srv.open')}</b> button waits in the header while a survey is running.</li>
  <li>“${t('flt.options')}” leads straight to the new section <b>${t('set.navFilter')}</b> in
      the settings: names, notes, amounts, categories.</li>
  <li>On the phone the view is chosen at the bottom, the filter menu works like on the
      desktop, the year shows four coloured boxes per month.</li>
  <li>The month view scrolls like the year view; filter row, month bar and analytics stay put.</li>
  <li>Windows hold still while you scroll: name on top, buttons at the bottom.</li>
  <li>The fourth tab is called “${t('view.kakeibo')}”, shortcut Ctrl/Cmd + Shift + I.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.22','Mac style',`
<ul class="gcheck">
  <li>The whole interface in its new Mac look: toolbar, segmented control, white cards.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.20','Bug fixing',`
<ul class="gcheck">
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.19','Faster through months and analytics',`
<p>The month view is quicker to work in without losing the overview.</p>
<ul class="gcheck">
  <li>Ctrl/Cmd + ← / → steps through the months in the month view.</li>
  <li>Areas without a hit disappear while a filter is on.</li>
  <li>The analytics can be open when a book opens: a tick under <b>${t('set.navView')}</b>.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.18','FINA on the phone',`
<p>Below 700 px FINA uses a simplified layout of its own.</p>
<ul class="gcheck">
  <li>The month as a readable card list with large seals.</li>
  <li>Year and forecast are made for swiping and looking up.</li>
  <li>The views are switched at the bottom edge.</li>
  <li>Your language is remembered on this computer; an open book decides for itself.</li>
  <li>The timeline follows the due-date filter: only the chosen row keeps its numbers.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.16','Language on the welcome page',`
<ul class="gcheck">
  <li>EN · DE at the top right of the first screen, before any file is open.</li>
  <li>The word mark at the top left leads back to the FINA page.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.15','FINA is now FINA Book',`
<ul class="gcheck">
  <li>The name in the window, the browser tab and the icon; in running text it stays FINA.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.13','Change the forecast where it stands',`
<ul class="gcheck">
  <li>Double-click a month in <b>COR</b> and the balance correction opens at that month.</li>
  <li>Double-click the <b>${t('set.opening')}</b> row and the settings open with that field.</li>
  <li>Every window shows the way to its lists; the settings open on top of it.</li>
  <li>A new book is really empty: no categories, no banks, no payment types.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.11','Filtering adds up what you see',`
<ul class="gcheck">
  <li>Block totals, category totals and the analytics line count the visible rows only.</li>
  <li><b>${t('year.totalRow')}</b> is the top row of the year table.</li>
  <li>Both ways of importing live in the settings, section <b>${t('set.navImport')}</b>.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.9','Links, a steadier year view, a guide of its own',`
<ul class="gcheck">
  <li>Column names, total row and block rows stay put while you scroll.</li>
  <li>Every entry can carry several links, each with a name of its own.</li>
  <li>An estimated amount is no longer ticked off blindly: the seal opens the entry first.</li>
  <li>The guide has its own language and opens on a full page.</li>
  <li><b>${t('app.backup')}</b>: a dated copy in your downloads folder, in every browser.</li>
  <li>Clicking a field selects what is in it, so typing replaces it.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.8','The opening balance, and shortcuts',`
<ul class="gcheck">
  <li><b>${t('set.opening')}</b>: the balance your book starts from.</li>
  <li>The year view folds like the month view. While you filter, every block stands open.</li>
  <li>Just start typing to search; ✕ or Escape takes it all back.</li>
  <li>A shortcut per view: Ctrl/Cmd + Shift + M · Y · F.</li>
  <li><b>${t('flt.fHidden')}</b>: a search term beats the other filters.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.7','Income categories and a rebuilt forecast',`
<ul class="gcheck">
  <li>Income has categories of its own.</li>
  <li>The forecast is one table with a column that draws the balance through the year.</li>
  <li>The name is the heading of the entry window.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.6','A first screen and the analytics',`
<ul class="gcheck">
  <li>A first screen with no file open: open a file, or start from scratch.</li>
  <li><b>${t('month.ana')}</b>: the numbers of the month open its timeline.</li>
  <li>One filter row at the top, for all three blocks at once. Blocks fold away.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.5','The filter searches where you want',`
<ul class="gcheck">
  <li>You choose what the search field looks through.</li>
  <li>The forecast only calculates; it no longer writes.</li>
  <li>Duplicate an entry: same window, copy inside.</li>
  <li>The sign shows while you type; notes keep their line breaks.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.8.4','Double-click opens an entry',`
<ul class="gcheck">
  <li>In every view, on the amount or on the name.</li>
  <li>The search field holds the cursor while you tick things off.</li>
  <li>Bug fixing and cosmetic touch-ups.</li>
</ul>`)}

${gver('26.7.30','The first complete version',`
<ul class="gcheck">
  <li>One file, one year, on your own computer. Nothing is written until you save.</li>
  <li>Three kinds of money — ${t('g.income')}, ${t('g.fixed')}, ${t('g.flex')} — and
      ${t('bal.row')} above them.</li>
  <li>Four views: month, year, everyday spending, forecast.</li>
  <li>One window per entry: twelve amounts, a tick per month, quick entry.</li>
  <li>Filters, notes and a CSV import.</li>
</ul>`)}
</div>
`,

de:()=>`
<p class="glead">Die wichtigsten Änderungen der letzten Versionen — ohne technische Details
und mit dem, was sie für dich bedeuten.</p>
<div class="gvers">
${gver('26.9.7','Eine Anleitung, die man in einer halben Stunde liest',`
<p>Alle drei Reiter dieser Anleitung sind neu gebaut: nummerierte Schritte mit je einem
Bild, Kärtchen für die vier Bereiche, je Funktion ein Block, und jede Version als Karte wie
diese. Die Bilder zeigen das heutige FINA.</p>
<ul class="gcheck">
  <li>Die Anleitung neben dem CSV-Import hat denselben Kopf: EN · DE, ein Knopf für die
      ganze Seite und ein Griff für die Breite — mindestens ein Drittel des Fensters.</li>
  <li>Beide Anleitungen fahren von rechts herein und wieder hinaus.</li>
  <li>Die Zuordnungsleiste des Imports rollt nicht mehr: ist das Fenster schmal, wandern ihre
      Knöpfe ins ☰-Menü, außer „${t('c2.assign')}“ und „${t('c2.newAssign')}“.</li>
  <li>Die Spalte, die die Beschriftungszeile markiert, heißt in beiden Sprachen HDR.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`,'Aktuelle Version')}

${gver('26.9.6','Eine Art von Eintrag, ein klügerer Import, und alles bewegt sich',`
<p>Flexible Einträge sind jetzt Einträge wie alle anderen: dasselbe Fenster, dieselben Felder,
ein „${t('menu.newOut')}“. Der Import weiß, was er schon kennt. Und die ganze Oberfläche
bewegt sich.</p>
<ul class="gcheck">
  <li>Die Kategorie entscheidet zwischen Einnahme, flexibel und regulär. Jeder Bereich behält
      eine Kategorie „N/A“ für Einträge ohne eigene.</li>
  <li>Zeilen, die schon im Buch stehen, und Zeilen aus diesem Lauf bleiben in der Dateitabelle:
      grau mit Kreuz in der Spalte „X“. Ein Knopf verbirgt und zeigt sie.</li>
  <li>Ein Import ergänzt einen Monat, statt ihn zu ersetzen. Ein fünftes Referenzfeld.</li>
  <li>In Schritt 3 klappen die drei Bereichszeilen ihren Block; „${t('c2.foldAllBtnShow')}“ /
      „${t('c2.foldAllBtnHide')}“ tut es für alle auf einmal.</li>
  <li>Ein Monat mit dem blauen Pfeil ist gesperrt, bis du die Importdaten des Eintrags
      löschst.</li>
  <li>Die Jahresansicht hat die drei Filtermenüs, durchgestrichene abgeschlossene Monate und
      den Rollbalken unter der Tabelle.</li>
  <li><b>${t('set.navImport')}</b> in den Einstellungen hat drei Abschnitte; eine gemerkte
      CSV-Struktur öffnet sich als Fenster mit eigenem Löschknopf. Der Tabellenimport ist
      weg.</li>
  <li>Ansichten fahren seitwärts herein, Fenster fallen von oben ein, Menüs entfalten sich,
      Karten und Blöcke klappen weich. Ein Klick klappt. Aus, wenn dein System weniger
      Bewegung wünscht.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.9.5','Der Import-Assistent in drei klaren Schritten',`
<p>Der CSV-Import führt jetzt durch <b>${t('c2.steps1')}</b>, <b>${t('c2.steps2')}</b> und
<b>${t('c2.steps3')}</b>. Die Hilfe steht direkt neben dem Schritt.</p>
<ul class="gcheck">
  <li>FINA merkt sich die Spaltenstruktur eines wiederkehrenden Datei-Exports.</li>
  <li>Zuordnungsregeln werden am Eintrag als seine Importkriterien gespeichert.</li>
  <li>Beim nächsten passenden Import wendest du die gemerkten Regeln auf dein Kommando an.</li>
  <li>„${t('app.guide')}“ in Schritt 2 und 3 erklärt den Schritt neben dem Fenster.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.30','Speichern ist besser zu sehen',`
<p>Ungespeicherte Änderungen fallen jetzt auf. FINA speichert weiterhin nur, wenn du es
sagst.</p>
<ul class="gcheck">
  <li>„${t('app.save')}“ tritt aus dem Menü heraus, sobald es etwas zu speichern gibt, mit
      rotem Rahmen neben dem ☰. Eine offene Umfrage steht links daneben.</li>
  <li>Wird die Kopfzeile zu eng, sagt ein roter Punkt am ☰, dass drinnen etwas wartet.</li>
  <li>„${t('app.load')}“ und „${t('menu.csv')}“ stehen als eigene Gruppe oben im Menü.</li>
  <li>Die vierte Kachel der Auswertung ist der <b>${t('month.kpiSaldo')}</b> des Monats —
      dieselbe Zahl, die die Jahresansicht <b>${t('year.totalRow')}</b> nennt.</li>
  <li>Die Prognose hat eine neue Spalte <b>SUM</b>; der Kontostand heißt jetzt <b>PROG</b>.</li>
  <li>Unter <b>${t('set.navView')}</b> entscheidest du, ob der Monat mit aufgeklappter
      Auswertung aufgeht und ob das Jahr die abgeschlossenen Monate versteckt.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.24','Jede CSV-Datei importieren',`
<p>Kontoauszug, Kartenexport, Budget-App: FINA liest sie alle über denselben
Import-Assistenten.</p>
<ul class="gcheck">
  <li>Datei wählen, Spalten und Felder festlegen, dann die Zeilen mit Filtern deinen Einträgen
      zuordnen.</li>
  <li>Importierte Monate tragen ein blaues Symbol und lassen sich nicht versehentlich
      überschreiben.</li>
  <li>Für wiederkehrende Dateiarten merkt sich FINA die Zuordnung.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.23','Kostenlos in der Pilotphase, bessere Filter, ein neues Telefon',`
<p>Alles ist freigeschaltet und kostenlos. Statt eines Preises fragen wir nach deiner
Meinung.</p>
<ul class="gcheck">
  <li>Ein oranger Knopf <b>${t('srv.open')}</b> wartet in der Kopfzeile, solange eine Umfrage
      läuft.</li>
  <li>„${t('flt.options')}“ führt direkt in den neuen Bereich <b>${t('set.navFilter')}</b> der
      Einstellungen: Namen, Notizen, Beträge, Kategorien.</li>
  <li>Auf dem Telefon wählst du die Ansicht unten, das Filtermenü arbeitet wie am Schreibtisch,
      das Jahr zeigt je Monat vier farbige Kästchen.</li>
  <li>Die Monatsansicht rollt wie die Jahresansicht; Filterzeile, Monatsleiste und Auswertung
      bleiben stehen.</li>
  <li>Die Fenster halten beim Scrollen still: Name oben, Knöpfe unten.</li>
  <li>Der vierte Reiter heißt „${t('view.kakeibo')}“, Tastengriff Strg/Cmd + Umschalt + I.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.22','Mac Style',`
<ul class="gcheck">
  <li>Die ganze Oberfläche im neuen Mac-Gewand: Toolbar, Ansichtswahl, weiße Karten.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.20','Bugfixing',`
<ul class="gcheck">
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.19','Schneller durch Monate und Auswertung',`
<p>Die Monatsansicht lässt sich zügiger bedienen, ohne die Übersicht zu verlieren.</p>
<ul class="gcheck">
  <li>Strg/Cmd + ← / → wechselt in der Monatsansicht den Monat.</li>
  <li>Bereiche ohne Treffer verschwinden, solange ein Filter greift.</li>
  <li>Die Auswertung kann beim Öffnen eines Buchs schon aufgeklappt sein: ein Haken unter
      <b>${t('set.navView')}</b>.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.18','FINA auf dem Telefon',`
<p>Unter 700 Pixeln Breite verwendet FINA eine eigene, vereinfachte Darstellung.</p>
<ul class="gcheck">
  <li>Der Monat als gut lesbare Kartenliste mit großen Siegeln.</li>
  <li>Jahr und Prognose sind fürs Wischen und Nachsehen gemacht.</li>
  <li>Die Ansichten wechselst du am unteren Rand.</li>
  <li>Deine Sprache bleibt auf diesem Rechner gemerkt; ein offenes Buch entscheidet selbst.</li>
  <li>Der Zeitstrahl folgt dem Fälligkeitsfilter: nur die gewählte Zeile behält ihre Zahlen.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.16','Sprachwahl auf der Begrüßungsseite',`
<ul class="gcheck">
  <li>EN · DE oben rechts auf der ersten Seite, noch bevor eine Datei offen ist.</li>
  <li>Das Wortzeichen oben links führt zur FINA-Seite zurück.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.15','FINA heißt jetzt FINA Book',`
<ul class="gcheck">
  <li>Der Name im Fenster, im Reiter des Browsers und im Symbol; im Fließtext bleibt es FINA.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.13','Die Prognose dort ändern, wo sie steht',`
<ul class="gcheck">
  <li>Doppelklick auf einen Monat in <b>COR</b> öffnet die Saldokorrektur mit diesem Monat.</li>
  <li>Doppelklick auf die Zeile <b>${t('set.opening')}</b> öffnet die Einstellungen mit diesem
      Feld.</li>
  <li>Jedes Fenster zeigt den Weg zu seinen Listen; die Einstellungen gehen darüber auf.</li>
  <li>Ein neues Buch ist wirklich leer: keine Kategorien, keine Banken, keine Zahlungsarten.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.11','Filtern rechnet über das, was du siehst',`
<ul class="gcheck">
  <li>Bereichssummen, Kategoriesummen und die Auswertung zählen nur die sichtbaren Zeilen.</li>
  <li><b>${t('year.totalRow')}</b> ist die oberste Zeile der Jahrestabelle.</li>
  <li>Beide Wege des Imports stehen in den Einstellungen, Bereich <b>${t('set.navImport')}</b>.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.9','Links, eine ruhigere Jahresansicht, eine eigene Anleitung',`
<ul class="gcheck">
  <li>Spaltennamen, Gesamtzeile und Blockzeilen bleiben beim Scrollen stehen.</li>
  <li>Jeder Eintrag kann mehrere Links tragen, jeder mit eigenem Namen.</li>
  <li>Ein geschätzter Betrag wird nicht mehr blind abgehakt: das Siegel öffnet zuerst den
      Eintrag.</li>
  <li>Die Anleitung hat ihre eigene Sprache und geht über die ganze Seite auf.</li>
  <li><b>${t('app.backup')}</b>: eine datierte Kopie im Download-Ordner, in jedem Browser.</li>
  <li>Ein Feld anklicken markiert seinen Inhalt, tippen ersetzt ihn.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.8','Der Anfangsbestand, und Tastengriffe',`
<ul class="gcheck">
  <li><b>${t('set.opening')}</b>: der Stand, bei dem dein Buch anfängt.</li>
  <li>Die Jahresansicht klappt wie die Monatsansicht. Solange du filterst, steht jeder Block
      offen.</li>
  <li>Einfach lostippen zum Suchen; ✕ oder Escape nimmt alles zurück.</li>
  <li>Ein Tastengriff je Ansicht: Strg/Cmd + Umschalt + M · Y · F.</li>
  <li><b>${t('flt.fHidden')}</b>: ein Suchbegriff schlägt die übrigen Filter.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.7','Einnahme-Kategorien und eine neue Prognose',`
<ul class="gcheck">
  <li>Einnahmen haben eigene Kategorien.</li>
  <li>Die Prognose ist eine Tabelle mit einer Spalte, die den Kontostand durch das Jahr
      zeichnet.</li>
  <li>Der Name ist die Überschrift des Fensters.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.6','Eine erste Seite und die Auswertung',`
<ul class="gcheck">
  <li>Eine erste Seite ohne Datei: öffnen oder neu anfangen.</li>
  <li><b>${t('month.ana')}</b>: die Zahlen des Monats öffnen seinen Zeitstrahl.</li>
  <li>Eine Filterzeile oben, für alle drei Blöcke zugleich. Blöcke lassen sich zuklappen.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.5','Der Filter sucht dort, wo du es willst',`
<ul class="gcheck">
  <li>Du wählst, worin das Suchfeld sucht.</li>
  <li>Die Prognose rechnet nur noch; sie schreibt nicht mehr.</li>
  <li>Einträge duplizieren: dasselbe Fenster, eine Kopie darin.</li>
  <li>Das Vorzeichen zeigt sich beim Tippen; Notizen behalten ihre Zeilen.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.8.4','Doppelklick öffnet den Eintrag',`
<ul class="gcheck">
  <li>In jeder Ansicht, auf Betrag oder Bezeichnung.</li>
  <li>Das Suchfeld hält die Schreibmarke, während du abhakst.</li>
  <li>Bugfixing und kosmetische Anpassungen.</li>
</ul>`)}

${gver('26.7.30','Die erste vollständige Fassung',`
<ul class="gcheck">
  <li>Eine Datei, ein Jahr, auf dem eigenen Rechner. Geschrieben wird erst beim Speichern.</li>
  <li>Drei Arten von Geld — ${t('g.income')}, ${t('g.fixed')}, ${t('g.flex')} — und darüber
      ${t('bal.row')}.</li>
  <li>Vier Ansichten: Monat, Jahr, alltägliche Ausgaben, Prognose.</li>
  <li>Ein Fenster je Position: zwölf Beträge, je Monat ein Haken, schnelle Eingabe.</li>
  <li>Filter, Notizen und ein CSV-Import.</li>
</ul>`)}
</div>
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

/* Zu geht der Bereich animiert (7.9.26): er fährt nach rechts
   hinaus (fina-impout in css/components.css) und nimmt sich danach
   selbst weg — per animationend und zur Sicherheit per Uhr. Die
   Kennung fällt sofort ab: guideOpen() sagt damit schon „zu", und
   ein neues Öffnen während der Fahrt legt einen frischen Bereich
   über den hinausfahrenden. */
function closeGuide(){
  const el=document.getElementById('guidePanel'); if(!el) return;
  el.removeAttribute('id'); el.classList.add('closing'); el.setAttribute('inert','');
  const done=()=>el.remove();
  el.addEventListener('animationend',done); setTimeout(done,400);
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
