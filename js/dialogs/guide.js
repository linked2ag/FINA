/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Anleitung"
   Die ganze Bedienung auf einer Seite, in der Sprache, die in den
   Einstellungen gewählt ist. Der Text steht hier und nicht in
   js/i18n.js: es sind lange Abschnitte, die zusammen gelesen und
   zusammen gepflegt werden.

   Die Bilder liegen als PNG in doc/ und werden über <img>
   eingebunden — kein fetch, damit die Seite auch per Doppelklick
   über file:// funktioniert. Fehlt eine Datei, bleibt nur der
   Text stehen (onerror blendet das Bild aus).
   ══════════════════════════════════════════════════════════════ */

function guideShot(name,cap){
  return `<figure class="shot">
    <img src="doc/${name}" alt="${esc(cap)}" loading="lazy" onerror="this.closest('figure').remove()">
    <figcaption>${esc(cap)}</figcaption></figure>`;
}

const GUIDE={

en:()=>`
<h4>What this is</h4>
<p>FINA is a cash book for one year. It holds three kinds of money: <b>income</b>, <b>recurring costs</b>
(rent, instalments, subscriptions) and <b>Flexible Payments</b> — the everyday spending you import from Fast
Budget. Above them sits a single <b>Balance Correction</b> row for what does not add up.
Everything lives in a single JSON file that you choose yourself. There is no server, no account and no
automatic saving: the app only writes when you click <b>${t('app.save')}</b>.</p>

<h4>First steps</h4>
<ol>
  <li><b>${t('app.load')}</b> opens your JSON file. Chrome and Edge can write back into the same file;
      in other browsers saving produces a download.</li>
  <li><b>${t('app.settings')}</b> is where you set the language, the accounting year, the column widths
      and the four lists: banks, payment types, recurring categories and Flexible Payments categories.</li>
  <li>Everything you change is kept in memory first. The file name in the header turns <b>bold and red</b>
      as long as something is unsaved.</li>
</ol>
${guideShot('guide-en-jahr.png','Year view — one row per item, one column pair per month')}

<h4>The four views</h4>
<p><b>${t('view.monat')}</b> — one month in detail. Tick off what you paid, the circle on the left is the
seal. Filters narrow the list by payment state and by due date.</p>
<p><b>${t('view.jahr')}</b> — the whole year as a matrix. The left columns stay put while you scroll
sideways, the header row and the button bar stay put while you scroll down.</p>
<p><b>${t('view.kakeibo')}</b> — the analysis of the imported bookings, by main and subcategory. The arrow
on a row shows its bookings on the right; “${t('kak.top')}” lists everything from ${nf.format(topMin())} —
the threshold sits in the settings — grouped by main category.</p>
<p><b>${t('view.prognose')}</b> — how the year is going to end. Months without an import are calculated
with the assumption you keep on the right.</p>
${guideShot('guide-en-monat.png','Month view — seal, amount, pencil and note lamp')}

<h4>Reading the year matrix</h4>
<ul>
  <li>Amounts are <span class="pos">green</span> when positive and <span class="neg">red</span> when
      negative. <span class="est">Yellow with a ?</span> means the amount is only estimated and not yet
      ticked off — once you tick it, it counts as confirmed and turns red or green.</li>
  <li>The <b>End</b> cell shows the last payment and colours the remaining term, the current month
      included: <span class="endkey e-now">this one only</span> <span class="endkey e-soon">2 months</span>
      <span class="endkey e-mid">3 to 6</span> <span class="endkey e-far">more</span>.</li>
  <li>Rows on grey are fully paid — nothing is left for this year. They move to the bottom of their
      category, and <b>${t('year.hideSettled')}</b> takes them out of sight altogether. Items whose
      term has run out move down as well, even when an old month was never ticked; those keep their
      colour so the missing tick stays visible.</li>
  <li>A struck-through month in the header is completely ticked off. Such months collapse; the button
      <b>${t('year.showAll')}</b> brings them back.</li>
</ul>

<h4>Items</h4>
<p>The pencil opens an item: name, block, bank, payment type, due date, end of term, a link to the
receipt and the twelve monthly amounts. <b>Expenses are entered with a minus.</b> The quick entry fills
a rhythm — every month, every two months, once a year — from a chosen month up to the end.</p>
<p>Two note lamps belong to every item: the one <b>next to the name</b> is the note for the whole item and
shows up in every view, the one <b>in a month cell</b> belongs to that single month. A grey lamp means
there is no note yet, and it stays quiet when you hover over it.</p>

<h4>Balance Correction</h4>
<p>One fixed row above the income block, in the month view as well as in the year matrix, marked in pale
blue. It takes a manual amount per month for whatever did not add up — a rounding difference, a booking
that never made it into the book. It counts into the balance, appears as its own column in the forecast,
and is maintained through the same window as any other item. It cannot be deleted; leave it empty and it
simply reads as a dash.</p>

<h4>Flexible Payments and the CSV import</h4>
<p>Export your transactions from Fast Budget as CSV and load them with <b>${t('kak.import')}</b>. The file
is only read at first. A window then shows which months it contains and lets you deselect any of them; a
second window shows, month by month, what will be deleted and what will take its place. Only the last
button changes anything — the chosen months are <b>replaced, not added to</b>.</p>
${guideShot('guide-en-kakeibo.png','Flexible Payments — categories on the left, their bookings on the right')}

<h4>Saving</h4>
<p>Nothing is written automatically. <b>${t('app.save')}</b> writes the whole state — data and settings —
into your JSON file. <b>${t('app.unlink')}</b> lets go of the file and empties the view; unsaved changes
are pointed out first. Keep a copy of the file: it is the only place your figures live.</p>
`,

de:()=>`
<h4>Worum es geht</h4>
<p>FINA ist ein Kassenbuch für ein Jahr. Es führt drei Arten von Geld: <b>Einnahmen</b>, <b>regelmäßige
Kosten</b> (Miete, Raten, Abos) und <b>Flexible Payments</b> — die alltäglichen Ausgaben, die aus Fast
Budget importiert werden. Darüber steht eine einzelne Zeile <b>Balance Correction</b> für das, was nicht
aufgeht. Alles steht in einer einzigen JSON-Datei, die du selbst auswählst. Es gibt keinen
Server, kein Konto und kein automatisches Speichern: geschrieben wird nur auf Klick auf
<b>${t('app.save')}</b>.</p>

<h4>Die ersten Schritte</h4>
<ol>
  <li><b>${t('app.load')}</b> öffnet deine JSON-Datei. Chrome und Edge schreiben in dieselbe Datei zurück;
      in anderen Browsern entsteht beim Speichern ein Download.</li>
  <li>Unter <b>${t('app.settings')}</b> stehen Sprache, Abrechnungsjahr, Spaltenbreiten und die vier
      Listen: Banken, Zahlungsarten, regelmäßige Kategorien und Flexible-Payments-Kategorien.</li>
  <li>Änderungen bleiben zunächst im Speicher. Der Dateiname in der Kopfzeile steht <b>fett und rot</b>,
      solange etwas ungespeichert ist.</li>
</ol>
${guideShot('guide-de-jahr.png','Jahresansicht — je Position eine Zeile, je Monat zwei Spalten')}

<h4>Die vier Ansichten</h4>
<p><b>${t('view.monat')}</b> — ein Monat im Detail. Hier hakst du ab, was bezahlt ist; der Kreis links ist
das Siegel. Die Filter engen die Liste nach Zahlungsstand und Fälligkeit ein.</p>
<p><b>${t('view.jahr')}</b> — das ganze Jahr als Matrix. Die linken Spalten bleiben beim seitlichen
Scrollen stehen, die Kopfzeile und die Knopfleiste beim Scrollen nach unten.</p>
<p><b>${t('view.kakeibo')}</b> — die Auswertung der importierten Buchungen nach Haupt- und
Unterkategorie. Der Pfeil an einer Zeile zeigt rechts ihre Buchungen; „${t('kak.top')}" listet alles ab
${nf.format(topMin())} — die Grenze steht in den Einstellungen — gebündelt nach Hauptkategorie.</p>
<p><b>${t('view.prognose')}</b> — wie das Jahr ausgeht. Monate ohne Import rechnet die App mit der
Annahme, die du rechts pflegst.</p>
${guideShot('guide-de-monat.png','Monatsansicht — Siegel, Betrag, Stift und Notizlampe')}

<h4>Die Jahresmatrix lesen</h4>
<ul>
  <li>Beträge sind <span class="pos">grün</span> im Plus und <span class="neg">rot</span> im Minus.
      <span class="est">Gelb mit ?</span> heißt: der Betrag ist nur geschätzt und noch nicht abgehakt.
      Sobald du ihn abhakst, gilt er als bestätigt und wird rot oder grün.</li>
  <li>Die Zelle <b>Ende</b> zeigt die letzte Zahlung und färbt die Restlaufzeit, den laufenden Monat
      mitgezählt: <span class="endkey e-now">nur noch dieser</span>
      <span class="endkey e-soon">2 Monate</span> <span class="endkey e-mid">3 bis 6</span>
      <span class="endkey e-far">mehr</span>.</li>
  <li>Grau hinterlegte Zeilen sind abbezahlt — dort steht im Jahr nichts mehr aus. Sie rutschen ans
      Ende ihrer Kategorie, und <b>${t('year.hideSettled')}</b> blendet sie ganz aus. Auch
      ausgelaufene Positionen rutschen nach unten, selbst wenn ein alter Monat nie abgehakt wurde —
      die bleiben farbig, damit der fehlende Haken sichtbar bleibt.</li>
  <li>Ein durchgestrichener Monat in der Kopfzeile ist vollständig abgehakt. Solche Monate klappen zu;
      der Knopf <b>${t('year.showAll')}</b> holt sie zurück.</li>
</ul>

<h4>Positionen</h4>
<p>Der Stift öffnet eine Position: Name, Block, Bank, Zahlungsart, Fälligkeit, Ende der Laufzeit, ein Link
zum Beleg und die zwölf Monatsbeträge. <b>Ausgaben werden mit Minus eingetragen.</b> Die Schnelleingabe
füllt einen Rhythmus — jeden Monat, alle zwei Monate, einmal im Jahr — vom gewählten Monat bis zum
Ende.</p>
<p>Zu jeder Position gehören zwei Notizlampen: die <b>neben dem Namen</b> ist die Notiz zur ganzen
Position und taucht in jeder Ansicht auf, die <b>in einer Monatszelle</b> gehört nur zu diesem Monat.
Eine graue Lampe heißt: noch keine Notiz — sie bleibt beim Überfahren stumm.</p>

<h4>Balance Correction</h4>
<p>Eine feste Zeile über dem Einnahmenblock, in der Monatsansicht wie in der Jahresmatrix, hellblau
hinterlegt. Dort trägst du je Monat von Hand nach, was nicht aufgeht — eine Rundungsdifferenz, eine
Buchung, die nie im Kassenbuch gelandet ist. Sie geht in den Saldo ein, steht in der Prognose als eigene
Spalte und wird über dasselbe Fenster gepflegt wie jeder andere Posten. Löschen lässt sie sich nicht;
bleibt sie leer, steht dort nur ein Gedankenstrich.</p>

<h4>Flexible Payments und der CSV-Import</h4>
<p>Exportiere in Fast Budget deine Transaktionen als CSV und lade sie über <b>${t('kak.import')}</b>. Die
Datei wird zuerst nur gelesen. Ein Fenster zeigt dann, welche Monate darin stehen, und lässt dich einzelne
abwählen; ein zweites zeigt je Monat, was gelöscht und was dafür eingesetzt wird. Erst der letzte Knopf
ändert etwas — die gewählten Monate werden <b>ersetzt, nicht ergänzt</b>.</p>
${guideShot('guide-de-kakeibo.png','Flexible Payments — links die Kategorien, rechts ihre Buchungen')}

<h4>Speichern</h4>
<p>Automatisch wird nichts geschrieben. <b>${t('app.save')}</b> schreibt den ganzen Stand — Daten und
Einstellungen — in deine JSON-Datei. <b>${t('app.unlink')}</b> lässt die Datei los und leert die Ansicht;
auf ungespeicherte Änderungen weist die App vorher hin. Halte eine Kopie der Datei bereit: sie ist der
einzige Ort, an dem deine Zahlen stehen.</p>
`
};

function openGuide(){
  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box guide" style="max-width:900px">
    <h3>${t('app.guide')} — FINA</h3>
    <p class="subline">${t('app.guideTip')}</p>
    ${(GUIDE[LANG()]||GUIDE.en)()}
    <div class="row-end"><button class="btn primary" id="gClose">${t('g.close')}</button></div>
  </div>`;
  document.body.appendChild(box);
  box.querySelector('#gClose').onclick=()=>closeModal(box);
  box.onclick=e=>{ if(e.target===box) closeModal(box); };
  box.querySelector('#gClose').focus();
}
