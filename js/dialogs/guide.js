/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Anleitung"
   Die ganze Bedienung auf einer Seite, in der Sprache, die in den
   Einstellungen gewählt ist. Der Text steht hier und nicht in
   js/i18n.js: es sind lange Abschnitte, die zusammen gelesen und
   zusammen gepflegt werden.

   Bewusst ohne Bilder: Bildschirmfotos veralten mit jeder
   Änderung an der Oberfläche und sagen nichts, was der Text nicht
   sagen kann. Die Anleitung soll auch jemand verstehen, der die
   Anwendung noch nie gesehen hat — deshalb steht überall, wo ein
   Knopf gemeint ist, sein Name so da, wie er auf dem Bildschirm
   steht (über t(…), damit er die Sprache mitwechselt).
   ══════════════════════════════════════════════════════════════ */

const GUIDE={

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

<h4>The four views</h4>
<p><b>${t('view.monat')}</b> — one month, close up. This is where you work day to day: you see every
amount due, and you tick off what you have paid. The tabs above take you from month to month.</p>
<p><b>${t('view.jahr')}</b> — the whole year as a table: one row per item, one column per month.
This is where you plan and where you spot the gaps.</p>
<p><b>${t('view.kakeibo')}</b> — the everyday spending in detail: what each category costs in the
chosen period and what it costs on average per month.</p>
<p><b>${t('view.prognose')}</b> — how the year ends. It adds up what is still to come and shows the
balance you can expect on 31 December.</p>

<h4>A regular cost, step by step</h4>
<p>Click <b>${t('year.addItem')}</b>, or the little pencil next to an item that already exists. The
window that opens has three parts.</p>
<p><b>At the top, who and what:</b> the name, the group it belongs to, which account it is paid from,
how it is paid, on which day of the month it is due, and — if it ever stops — the month and year of
the last payment. There is also room for a link to the invoice or the contract.</p>
<p><b>In the middle, the amounts:</b> twelve boxes, one per month.
<b>An expense is written with a minus sign</b> — “-49,90”. Income has no sign. If you would type the
same amount into many months, use the quick entry above: type the amount once, choose how often it
repeats and from which month, and press <b>${t('item.apply')}</b>.</p>
<p><b>Below every month, a tick:</b> it means “this one is settled”. A ticked month locks its
amount so you cannot change it by accident; untick it and you can type again. Two buttons do this
in bulk: one closes every month that is already over, the other reopens all of them. The month you
are currently in is deliberately left open — it is not finished yet.</p>
<p>Is an amount not fixed yet — the electricity bill, roughly? Tick the box
<b>“${t('item.est')}”</b>. FINA then shows the figure in yellow with a question mark, so you can see
at a glance which numbers are guesses. As soon as you tick the month off, the guess counts as
confirmed and the colour goes back to normal.</p>

<h4>Everyday spending</h4>
<p>Everyday spending works the same way, only with categories instead of contracts. Give a category
an amount per month and tick it off once the month is done. If you have never spent time on it, an
estimate is enough — FINA marks it as a guess.</p>
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
  <li>Every month has two columns: the amount, and a narrow one next to it for the mark. A
      <span class="mk-ok">✓</span> means paid, a <span class="mk-q">?</span> means the amount is
      still a guess, empty means still open.</li>
  <li>Amounts are <span class="pos">green</span> when positive and <span class="neg">red</span> when
      negative, <span class="est">yellow</span> while they are only estimated.</li>
  <li>The column <b>${t('year.end')}</b> holds the last payment of an item and colours how much of
      the term is left, the current month included:
      <span class="endkey e-now">this one only</span> <span class="endkey e-soon">2 months</span>
      <span class="endkey e-mid">3 to 6</span> <span class="endkey e-far">more</span>. That way you
      see at a glance what is about to fall away.</li>
  <li>Rows on grey are done for this year — nothing is left to pay. They sink to the bottom of their
      group, and <b>${t('year.hideSettled')}</b> hides them completely.</li>
  <li>A month whose name is struck through is fully ticked off. Such months fold away to leave room;
      <b>${t('year.showAll')}</b> brings them back.</li>
  <li>Clicking a month name takes you into that month.</li>
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

<h4>Die vier Ansichten</h4>
<p><b>${t('view.monat')}</b> — ein Monat aus der Nähe. Hier arbeitest du im Alltag: du siehst jeden
fälligen Betrag und hakst ab, was du bezahlt hast. Über die Reiter darüber gehst du von Monat zu
Monat.</p>
<p><b>${t('view.jahr')}</b> — das ganze Jahr als Tabelle: je Position eine Zeile, je Monat eine
Spalte. Hier planst du, und hier fallen dir Lücken auf.</p>
<p><b>${t('view.kakeibo')}</b> — die alltäglichen Ausgaben im Einzelnen: was jede Kategorie im
gewählten Zeitraum kostet und was sie im Schnitt je Monat kostet.</p>
<p><b>${t('view.prognose')}</b> — wie das Jahr ausgeht. Sie rechnet zusammen, was noch kommt, und
zeigt den Saldo, der am 31. Dezember zu erwarten ist.</p>

<h4>Regelmäßige Kosten, Schritt für Schritt</h4>
<p>Klick auf <b>${t('year.addItem')}</b> oder auf den kleinen Stift neben einer vorhandenen Position.
Das Fenster, das aufgeht, hat drei Teile.</p>
<p><b>Oben, wer und was:</b> der Name, die Gruppe, zu der die Position gehört, von welchem Konto sie
abgeht, wie bezahlt wird, an welchem Tag im Monat sie fällig ist und — falls sie einmal endet —
Monat und Jahr der letzten Zahlung. Dazu ist Platz für einen Link zur Rechnung oder zum Vertrag.</p>
<p><b>In der Mitte die Beträge:</b> zwölf Felder, eines je Monat.
<b>Eine Ausgabe wird mit Minus geschrieben</b> — „-49,90". Einnahmen bekommen kein Vorzeichen. Wenn
derselbe Betrag in viele Monate soll, nimm die schnelle Eingabe darüber: Betrag einmal eintippen,
Wiederholung und Startmonat wählen, auf <b>${t('item.apply')}</b> klicken.</p>
<p><b>Unter jedem Monat ein Haken:</b> er heißt „dieser ist erledigt". Ein abgehakter Monat sperrt
seinen Betrag, damit er nicht aus Versehen verrutscht; Haken weg, und du kannst wieder tippen. Zwei
Knöpfe erledigen das in einem Rutsch: der eine schließt alle Monate ab, die schon vorbei sind, der
andere öffnet sie alle wieder. Der laufende Monat bleibt dabei mit Absicht offen — er ist noch nicht
zu Ende.</p>
<p>Steht ein Betrag noch nicht fest — die Stromrechnung, ungefähr? Dann setz den Haken bei
<b>„${t('item.est')}"</b>. FINA zeigt die Zahl daraufhin gelb mit einem Fragezeichen, du siehst also
auf einen Blick, welche Zahlen geschätzt sind. Sobald du den Monat abhakst, gilt die Schätzung als
bestätigt und die Farbe wird wieder normal.</p>

<h4>Die alltäglichen Ausgaben</h4>
<p>Die alltäglichen Ausgaben laufen genauso, nur mit Kategorien statt Verträgen. Gib einer Kategorie
einen Betrag je Monat und hak sie ab, wenn der Monat durch ist. Wer sich nicht festlegen mag, trägt
eine Schätzung ein — FINA kennzeichnet sie als solche.</p>
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
  <li>Jeder Monat hat zwei Spalten: den Betrag und daneben eine schmale für das Zeichen. Ein
      <span class="mk-ok">✓</span> heißt bezahlt, ein <span class="mk-q">?</span> heißt, der Betrag
      ist noch geschätzt, leer heißt offen.</li>
  <li>Beträge sind <span class="pos">grün</span> im Plus und <span class="neg">rot</span> im Minus,
      <span class="est">gelb</span>, solange sie nur geschätzt sind.</li>
  <li>Die Spalte <b>${t('year.end')}</b> enthält die letzte Zahlung einer Position und färbt, wie
      viel Laufzeit noch bleibt, den laufenden Monat mitgezählt:
      <span class="endkey e-now">nur noch dieser</span> <span class="endkey e-soon">2 Monate</span>
      <span class="endkey e-mid">3 bis 6</span> <span class="endkey e-far">mehr</span>. So siehst du
      auf einen Blick, was demnächst wegfällt.</li>
  <li>Grau hinterlegte Zeilen sind für dieses Jahr erledigt — dort steht nichts mehr aus. Sie
      rutschen ans Ende ihrer Gruppe, und <b>${t('year.hideSettled')}</b> blendet sie ganz aus.</li>
  <li>Ein durchgestrichener Monatsname heißt: vollständig abgehakt. Solche Monate klappen zu, um
      Platz zu schaffen; <b>${t('year.showAll')}</b> holt sie zurück.</li>
  <li>Ein Klick auf einen Monatsnamen bringt dich in diesen Monat.</li>
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
  document.body.appendChild(box); tabThroughFields(box);
  box.querySelector('#gClose').onclick=()=>closeModal(box);
  box.onclick=e=>{ if(e.target===box) closeModal(box); };
  box.querySelector('#gClose').focus();
}
