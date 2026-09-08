/* ══════════════════════════════════════════════════════════════
   FINA — Ansicht „Monat"
   Abrechnung eines Monats: Einnahmen, Kakeibo und die
   regelmäßigen Kosten mit Filtern und Bezahlt-Siegeln.
   ══════════════════════════════════════════════════════════════ */

/* Unter dem Namen steht in dieser Ansicht nur, was zu genau
   diesem Monat gehört: die Metazeile und die Monatsnotiz. Die
   Notiz zur ganzen Position (notePreview) bleibt draußen — sie
   gilt in jedem Monat und geriete hier neben Siegel und
   Monatsnotiz in die Abbuchungslogik. Sie steht in der
   Jahresmatrix und im Flexible-Payments-Reiter; hier führt die
   Lampe zu ihr. */

/* Bank, Zahlungsart und Fälligkeit gibt es auf dem Telefon nicht
   mehr: die Metazeile unter dem Namen (metaLine) ist seit 22.8.26
   gestrichen — auf einem schmalen Schirm sind die drei Angaben
   Beiwerk, das jede Zeile doppelt so hoch machte. Wer sie braucht,
   öffnet die Position; die Links erreicht das Kettensymbol. */

/* Abbezahlt: für dieses Jahr steht nichts mehr aus (yearSettled in
   js/calc.js). Die Zeile bekommt denselben grauen Grund wie in der
   Jahresmatrix — es ist dieselbe Aussage, und wer zwischen den
   Ansichten wechselt, soll sie nicht zweimal lernen müssen. */
/* ── Bank, Zahlungsart und Fälligkeit als eigene Spalten ──────
   Am Schreibtisch stehen die drei Angaben rechts in festen
   Spalten (Mac-Redesign, Raster 96 · 76 · 46 px) — auf dem
   Telefon entfallen sie ganz (siehe oben). Die Restlaufzeit (LP)
   hängt als Sprechblase an der Fälligkeitszelle; die Links
   erreicht das Kettensymbol. */
/* Jede Zelle trägt beide Fassungen — den vollen Namen und das
   Kürzel der Jahresmatrix. Wird das Fenster eng, schaltet das
   Stylesheet auf die Kürzel um (media-Query in css/ledger.css);
   das Kürzel nennt den vollen Namen dann in der Sprechblase. */
function metaCells(it){
  const endTip=it.end?` data-tip="${esc(t('end.tip',endLabel(it)))}"`:'';
  const two=(full,abbr)=>full?`<span class="mfull">${full}</span><span class="mabbr" title="${full}">${abbr}</span>`:'';
  return `<td class="mcol mbank">${two(it.bank?esc(bankLabel(it.bank)):'',esc(it.bank))}</td>
    <td class="mcol mpay">${two(it.pay?esc(payLabel(it.pay)):'',esc(it.pay))}</td>
    <td class="mcol mdue"${endTip}>${two(it.dueDay?DUE_LABEL(it.dueDay):'',esc(DUE_SHORT(it.dueDay)))}</td>`;
}
const EMPTY_META='<td class="mcol"></td><td class="mcol"></td><td class="mcol"></td>';

/* Die Monatsnotiz steht am Schreibtisch in einer **eigenen Zeile**
   unter der Position (tr.noterow, dieselben Zustandsklassen): in
   der Namenszelle bräche sie vor den drei Meta-Spalten um — so
   läuft sie bis an den rechten Rand der Karte, und die
   Meta-Spalten bleiben auf der Höhe des Namens. Die Trennlinie
   zwischen Position und ihrer Notiz nimmt css/ledger.css weg
   (tr:has(+.noterow)). Das Telefon behält die Notiz in der Zelle —
   dort gibt es die Spalten nicht. */
function noteRow(cls2,dbl,note){
  return `<tr class="noterow ${cls2}"${dbl}><td colspan="3"></td>
    <td class="notecell" colspan="4"><div class="itemnote">${esc(note)}</div></td></tr>`;
}
function itemRow(it,m){
  const p=paidAt(it,m), e=estOf(it), note=it.notes[m-1], mob=isMobile();
  const cls2=(p?'paid':'')+(yearSettled(it)?' settled':'');
  return `<tr class="${cls2.trim()}"${dblItem(it.id)}>
    <td class="markcell"><button class="seal${!p&&e?' est':''}${p&&it.imp&&it.imp[m-1]?' imp':''}${p&&impOnceAt(it,m)?' once':''}" aria-pressed="${p}" data-paid="${it.id}"
      title="${p?(it.imp&&it.imp[m-1]?t(impOnceAt(it,m)?'c2.sealOnceTip':'c2.sealTip'):t('month.markOpen')):t('month.markPaid')}">${p&&it.imp&&it.imp[m-1]?IMPORT_SVG:((!p&&e)?EST_SVG:CHECK_SVG)}</button></td>
    <td class="num amt ${e&&!p?'est':cls(it.amounts[m-1])}">${eur(it.amounts[m-1])}</td>
    <td class="pencell"><div class="ptools"><button class="pencil" data-edit="${it.id}" title="${t('year.editTip')}">&#9998;</button>${linkIcon(it.links,'item',it.id)}${lampHtml('item',it.id,m)}</div></td>
    <td class="nm"><span class="iname">${esc(it.name)}</span>${isLastRate(it,m)?`<span class="pill last">${t('month.lastRate')}</span>`:''}
      ${mob&&note?`<div class="itemnote">${esc(note)}</div>`:''}</td>
    ${mob?'':metaCells(it)}</tr>${(!mob&&note)?noteRow(cls2.trim(),dblItem(it.id),note):''}`;
}

/* Die Saldokorrektur: eine einzige Zeile über den Einnahmen.
   Gepflegt wird sie über Stift und Notizlampe, gezeigt wird sie
   wie eine Kategorie (.balrow in css/ledger.css). Ein Löschknopf
   fehlt bewusst, die Zeile bleibt immer stehen.

   Ein Siegel hat sie nicht: der Betrag ist die Korrektur, die der
   Nutzer selbst einträgt — es gibt nichts zu bestätigen. Die
   leere Zelle bleibt trotzdem stehen, damit die Zeile mit den
   Karten darunter fluchtet. */
function balanceRow(m){
  const it=state.balance, v=it.amounts[m-1], note=it.notes[m-1], mob=isMobile();
  return `<div class="card sec-bal" data-fk="card:bal">
    <table class="ledger"><tr class="balrow"${dblItem(BALANCE_ID)}>
      <td class="markcell"></td>
      <td class="num amt ${cls(v)}">${eur(v)}</td>
      <td class="pencell"><div class="ptools"><button class="pencil" data-edit="${BALANCE_ID}"
        title="${t('bal.editTip')}">&#9998;</button>${linkIcon(state.balance.links,'item',BALANCE_ID)}${lampHtml('item',BALANCE_ID,m)}</div></td>
      <td class="nm"><span class="balname" data-tip="${esc(t('bal.tip'))}">${t('bal.row')}</span>
        ${(mob&&note)?`<div class="itemnote">${esc(note)}</div>`:''}</td>
      ${mob?'':EMPTY_META}</tr>${(!mob&&note)?`<tr class="balrow noterow"${dblItem(BALANCE_ID)}><td colspan="3"></td>
      <td class="notecell" colspan="4"><div class="itemnote">${esc(note)}</div></td></tr>`:''}</table></div>`;
}

/* Die Zeile eines flexiblen Postens ist seit 6.9.26 abends dieselbe
   wie die eines regulären (itemRow): er ist ein Posten. */

/* ══ Die Auswertung über dem Monat ═══════════════════════════
   Sie steht eingeklappt: eine einzige dünne Zeile, links die
   Überschrift „Auswertung", daneben die fünf Zahlen, die den Monat
   beschreiben. Ein Klick irgendwo auf die Zeile klappt sie auf, und
   darunter erscheint der Zeitstrahl. Einen Pfeil trägt sie nicht —
   ob sie offen ist, sagt der Zeitstrahl selbst; für die Tastatur
   und die Vorlesehilfe steht es in aria-expanded.

   Warum eingeklappt: die Leiste nimmt oben dauerhaft Platz weg,
   den die Liste darunter braucht. Aufgeklappt bleibt sie, bis man
   sie wieder zuklappt (ui.ana, nicht in der Datei).

   Unter der Auswertung steht die Filterzeile — sie gilt für alle
   drei Bereiche und gehört deshalb nach oben und nicht in eine der
   Karten. Alles zusammen steckt in einer .stickybar und bleibt beim
   Scrollen unter der Kopfzeile stehen.

   Die Zahlenzeile ist ein einziger Knopf — daher steht in den
   Kästchen kein weiteres anklickbares Element, nur data-tip für
   die Erklärung. Die Filterzeile steht daneben, nicht darin: sie
   hat ihre eigenen Knöpfe. */
/* ── Die Auswertung über der Monatsansicht ────────────────────
   Vier Zahlen: was hereinkommt, die Flexible Payments, die
   regelmäßigen Kosten, was davon noch offen ist. **Kein
   Kontostand.** Den zeigt die Jahresansicht — dort steht er neben
   den elf anderen Monaten und lässt sich lesen; hier stünde er
   allein und ohne Vergleich. Was der Monat mit dem Konto macht,
   sagt der Zeitstrahl darunter, Zeile für Zeile.

   **Gerechnet wird über `sel`** — die Zeilen, die nach dem Filtern
   übrig sind, dieselben, aus denen die Karten darunter ihre Summen
   ziehen. Die Leiste beschreibt damit nicht mehr den ganzen Monat,
   sondern das, was man gerade vor sich hat: wer nach einer
   Kategorie sucht, liest hier, was sie einbringt und kostet.
   Ungefiltert ist es dieselbe Zahl wie zuvor.

   Auch die Zahl hinter „noch offen" zählt nur die gezeigten
   Posten — sonst nennte die Sprechblase „3 von 20", während
   darunter drei Zeilen stehen. */
/* ── Die drei Filtergruppen der Monatsansicht ─────────────────
   Wert, Beschriftung, Sprechblase — eine Liste je Gruppe, benutzt
   vom Aufklappmenü der Filterzeile, vom Filtermenü der mobilen
   Fassung **und seit 6.9.26 von der Leiste der Jahresansicht**.
   'alle' trägt keine eigene Beschriftung: im Menü heißt es überall
   t('flt.all'). Das vierte Glied ist das Zeichen des Werts
   (data-ic am Eintrag → --ic-… in css/layout.css): jeder Wert
   trägt vorn sein eigenes, „Alle" überall den Stern. */
const FLT_SEC=()=>[['alle','',t('month.fSecAllTip'),'all'],['in',t('month.fSecIn'),t('month.fSecInTip'),'sec-in'],
  ['flex',t('month.fSecFlex'),t('month.fSecFlexTip'),'sec-flex'],['out',t('month.fSecOut'),t('month.fSecOutTip'),'sec-out']];
const FLT_DUE=()=>[['alle','',t('month.fDueAllTip'),'all'],['A',t('month.fDueA'),t('month.fDueATip'),'due-a'],
  ['M',t('month.fDueM'),t('month.fDueMTip'),'due-m'],['E',t('month.fDueE'),t('month.fDueETip'),'due-e'],
  ['Z',t('month.tlClose'),t('month.fDueZTip'),'due-z']];
const FLT_PAY=()=>[['alle','',t('month.fAllTip'),'all'],['offen',t('month.fOpen'),t('month.fOpenTip'),'pay-open'],
  ['unklar',t('month.fEst'),t('month.fEstTip'),'pay-est'],['bezahlt',t('month.fPaid'),t('month.fPaidTip'),'pay-paid']];

/* ── Ein Aufklappmenü der Filterzeile ─────────────────────────
   Der Knopf nennt Gruppe und gewählten Wert („Fälligkeit: Alle"),
   das Menü darunter die Werte, jeder mit seinem Zeichen vorn
   (data-ic, css/layout.css); der gewählte steht auf Orange
   (--accent-soft). **Es bleibt beim Wählen offen** — wer filtert,
   stellt meist mehr als eins ein: welcher Wert gewählt wurde,
   erledigt das gewohnte data-*-Attribut (toggleFilter in wire()),
   ob das Menü offen ist, sagt ui.fltMenu (Sitzung, nie Datei).
   Zu geht es am Knopf, mit Escape oder mit einem Klick daneben
   (beides in js/app.js). */
function fltDrop(id,kind,label,cur,opts){
  const open=ui.fltMenu===id;
  const curLab=cur==='alle'?t('flt.all'):((opts.find(o=>o[0]===cur)||['',''])[1]);
  return `<span class="fltdrop">
    <button class="btn small drophead" data-fltmenu="${id}" aria-expanded="${open}"
      aria-haspopup="menu" aria-pressed="${cur!=='alle'}">${label}: ${curLab} <span class="caret">&#9662;</span></button>
    ${open?`<span class="dropmenu${ui.menuDrawn===id?'':' popin'}" data-dm="${id}" role="menu">${opts.map(([v,l,tp,ic])=>
      `<button class="mi${cur===v?' sel':''}" role="menuitemradio" aria-checked="${cur===v}"
        data-${kind}="${esc(v)}" data-ic="${ic}"${tp?` data-tip="${esc(tp)}"`:''}>${v==='alle'?t('flt.all'):l}</button>`).join('')}</span>`:''}</span>`;
}

/* ── Die Monatsleiste ─────────────────────────────────────────
   Zwölf Kürzel: erledigt = grün und durchgestrichen, der gewählte
   als **schwarze** Pille (seit 23.8.26; vorher eine dunkle
   Einfassung). Der laufende Monat trägt immer seinen roten Ring
   (.mp, css/layout.css): ungewählt bleibt er ungefüllt — nur der
   Rahmen sagt „jetzt" —, gewählt füllt er sich orange, und der
   Ring bleibt rot. Wie viel schon abgehakt ist, sagt die
   Sprechblase.

   **Sie steht seit 22.8.26 unter der Filterzeile**, nicht mehr in
   der Kopfzeile: dort, wo die Jahresmatrix ihre Monate hat, und im
   selben Bild (css/layout.css, .months). Sie steckt in der
   .stickybar der Ansicht und klebt deshalb mit der Auswertung und
   der Filterzeile oben mit.

   Gebaut wird sie hier, verdrahtet über `data-mtab` in wire() —
   Regel 1. Das Merkmal heißt nicht `data-m`: das gehört den
   Monatszellen der Jahresmatrix (dblMonth). */
function monthTabs(){
  return `<div class="months" id="months" role="tablist" aria-label="${esc(t('app.chooseMonth'))}">${
    MONTHS.map((name,i)=>{
      const m=i+1, pt=monthParts(m);
      const done=pt.total>0&&pt.done===pt.total;
      return `<button class="mtab${done?' alldone':''}${m===CUR?' current':''}" role="tab"
        aria-selected="${ui.month===m}" data-mtab="${m}"
        title="${esc(t('month.done',pt.done,pt.total)+' · '+t('month.keyTip'))}"><span class="mp">${name}</span></button>`;
    }).join('')}</div>`;
}

function anaBar(m,sel,selAny){
  const open=!!ui.ana;
  const inc=sel.items.filter(isIncome);
  const due=sel.items.filter(isCost);
  const sum=arr=>arr.reduce((s,it)=>s+it.amounts[m-1],0);
  /* ── Die vierte Kachel ist der Saldo des Monats ──────────────
     Alles, was der Monat bringt, und alles, was er kostet —
     Einnahmen, Flexible Payments, regelmäßige Kosten und die
     Saldokorrektur. Also **dieselbe Zahl**, die die oberste Zeile
     der Jahresmatrix nennt (`year.totalRow`) und die auf dem
     Telefon als SALDO-Kachel steht; deshalb auch derselbe Name
     und dieselbe Farbe wie dort (--bg-sal, „alles zusammen").

     Bis 30.8.26 stand hier „Noch offen": die Summe dessen, was
     noch nicht abgehakt ist. Das war eine Zahl über den Fortschritt
     der Arbeit, während die drei Kacheln daneben von Geld handeln —
     und ob der Monat ins Plus oder ins Minus läuft, sagte keine
     von ihnen.

     Gerechnet wird über `sel`, wie alles in dieser Leiste: gefiltert
     nennt die Kachel den Saldo der Zeilen, die zu sehen sind. */
  const flexSum=sum(sel.items.filter(isFlex));
  const sal=sum(inc)+flexSum+sum(due)+(sel.bal?balanceFix(m):0);
  /* ── Der Pfeil, der beim Überfahren herausfährt ─────────────
     Die Zeile trägt von Haus aus keinen Pfeil: sie ist eine Reihe
     aus Zahlen, und ein fester Pfeil davor läse sich wie eine
     fünfte Angabe. Dass sie sich klappen lässt, sagt sie erst,
     wenn man mit der Maus darüber steht — dann fährt von links ein
     Pfeil vor die erste Beschriftung, und die rückt dafür nach
     rechts (`.anaarrow` in css/layout.css, seit 6.9.26). Er zeigt
     nach rechts, solange die Auswertung zu ist, und nach unten,
     wenn sie offen steht — dieselben Zeichen wie der Klapp-Pfeil
     der Karten (foldBtn). Nur die erste Kachel trägt ihn: ein Pfeil
     je Kachel sähe nach vier Klappen aus, es ist aber eins. */
  const arrow=`<span class="anaarrow" aria-hidden="true">${tri(open)}</span>`;
  const cell=(c,lab,val,vc,tip,first)=>`<span class="anak${c?' '+c:''}"${tip?` data-tip="${esc(tip)}"`:''}
      >${first?arrow:''}<span class="lab">${lab}</span><span class="val ${vc}">${eur(val)}</span></span>`;
  /* Die Zahlenzeile trägt keine Überschrift mehr („Auswertung" —
     mit dem Mac-Redesign gestrichen): sie ist EIN eingefasster
     Kasten aus vier Kacheln in den Bereichsfarben; dass sie sich
     klappen lässt, sagen Sprechblase, aria-expanded und der
     ausfahrende Pfeil. */
  /* ── Die Reihenfolge der Leiste ──────────────────────────────
     Filterzeile · Monatsleiste · Auswertung. Die Filterzeile steht
     **ganz oben und ohne Abstand** — sie dockt an der Kopfzeile an
     wie in der Jahresansicht, und in beiden Ansichten fängt die
     Ansicht damit mit derselben Bahn an. Darunter die Monate, und
     erst dann die Zahlen: die Auswertung fasst zusammen, was in den
     Karten steht, und steht deshalb direkt über ihnen.

     **Es sind zwei Leisten und nicht eine** (Lex, 8.9.26): der
     **Top-Bereich** ist allein die Filterzeile — die Bahn, die an
     der Kopfzeile andockt und in Monat und Jahr dieselbe ist. Sie
     trägt `viewtop` und bleibt beim Ansichtswechsel stehen
     (wrapViewBody in js/ui.js). Monatsleiste und Auswertung
     gehören zur Ansicht und nicht nach oben: sie stehen in einer
     zweiten Leiste (`anasub`), fahren mit der Ansicht mit und
     kleben unter der ersten (syncStickyTops in js/app.js). */
  return `<div class="stickybar anabar viewtop">
    <!-- Die Filterzeile: Suchfeld · ✕ · Filteroptionen · drei
         Aufklappmenüs (Bereich, Fälligkeit, Zahlungsstatus) — vom
         Groben ins Feine. Greift einer der Filter, färbt sich die
         ganze Leiste orange (.on): sie sagt dann, dass hier gerade
         etwas ausgeblendet wird; sonst bleibt sie hell. -->
    <div class="filterbar fbrow${(!!queryQ()||ui.filter!=='alle'||ui.dueFilter!=='alle'||ui.secFilter!=='alle')?' on':''}">
      ${filterField('flttop')}
      ${fltOptionsBtn()}
      ${fltDrop('sec','secfilter',t('month.fSec'),ui.secFilter,FLT_SEC())}
      ${fltDrop('due','duefilter',t('flt.due'),ui.dueFilter,FLT_DUE())}
      ${fltDrop('pay','filter',t('flt.state'),ui.filter,FLT_PAY())}
    </div>
  </div>
  <!-- Die zweite Leiste: Monatsleiste und Auswertung. Sie klebt
       unter der Filterzeile, gehört aber zur Ansicht — beim
       Wechsel fährt sie mit, sie fällt nicht von oben herein. Der
       Abstand zur Filterzeile ist ihr Polster (css/layout.css,
       .anasub), nicht mehr der Außenabstand der Monatsleiste: ein
       Außenabstand fiele durch die Leiste hindurch nach oben. -->
  <div class="stickybar anabar anasub">
    ${monthTabs()}
    <button class="anahead" data-ana="1" data-hk="ana" aria-expanded="${open}" aria-label="${esc(t('month.ana'))}"
      data-tip="${esc(open?t('month.anaClose'):t('month.anaOpen'))}">
      <span class="anarow">
        ${cell('t-in',t('month.kpiIncome'),sum(inc),'pos',null,true)}
        ${cell('t-flex',t('month.kak'),flexSum,'neg')}
        ${cell('t-out',t('month.kpiFixed'),sum(due),'neg')}
        ${cell('t-sal',t('month.kpiSaldo'),sal,sal<0?'neg':(sal>0?'pos':''),t('month.kpiSaldoTip'))}
      </span>
    </button>
    ${open?timeline(m,sel,selAny):''}</div>`;
}

/* ── Der Kopf der mobilen Monatsansicht ───────────────────────
   Unter 700 px (isMobile in js/app.js) ersetzt er die Auswertung:
   oben klebt die Suchzeile — Filterknopf und Suchfeld, beide
   gleich hoch —, darunter scrollen die Kennzahlen als Kacheln mit
   (2 Spalten, die SALDO-Zeile über beide). Der Zeitstrahl entfällt:
   auf 390 px ist er kein Maß mehr, an dem sich etwas ablesen ließe.

   **Alle Filter wohnen hinter dem einen Knopf** (data-mfilters,
   verdrahtet in wire): Fälligkeit und Zahlungsstand als dieselben
   Einträge wie in den Aufklappmenüs des Schreibtischs
   (data-duefilter, data-filter), dazu „Filter zurücknehmen" und der
   Weg in die Filteroptionen der Einstellungen (data-qfields). Das
   Menü ist seit 23.8.26 dasselbe Bild wie am Schreibtisch — eine
   weiße Karte als Overlay (css/mobile.css) —, und es bleibt nur bei
   den Werten von Fälligkeit und Zahlungsstand offen; „Alle",
   Zurücknehmen und die Optionen schließen es (wire in js/app.js).

   **Ein eigenes ✕ neben dem Suchfeld gibt es nicht mehr**: das
   Zurücknehmen steckt im Menü, und ein zweiter Knopf für dasselbe
   nähme der Suchzeile nur Breite weg. Wie viele Menü-Filter gerade
   greifen, sagt die rote Marke am Knopf — und **greift irgendein
   Filter, leuchtet der Knopf orange**: er ist auf dem Telefon das,
   was am Schreibtisch die orange Filterzeile ist.

   Gerechnet wird wie in anaBar über `sel` — die Kacheln nennen,
   was nach dem Filtern zu sehen ist, dieselben Zahlen wie die
   Karten darunter. **Es sind dieselben vier Kacheln wie am
   Schreibtisch** (seit 6.9.26), nur anders gestellt: Einnahmen und
   Saldo oben, regelmäßige Kosten und Flexible darunter — im 2 × 2
   liest man die erste Zeile zuerst, und dort sollen die beiden
   Zahlen stehen, die man zuerst wissen will. Bis
   dahin stand oben rechts „Noch offen" und der Saldo als eigene
   Zeile über beide Spalten — die Leiste nannte auf dem Telefon
   damit eine andere Zahl als am Schreibtisch, und der Saldo stand
   an einer anderen Stelle. Der Saldo ist die Summe samt
   Saldokorrektur: das Ergebnis dieses Monats, wie es die oberste
   Zeile der Jahresmatrix nennt (month.kpiSaldo, --bg-sal). */
function mobileTop(m,sel,sums){
  const sal=sums.inc+sums.flex+sums.out+(sel.bal?balanceFix(m):0);
  const nFlt=(ui.dueFilter!=='alle'?1:0)+(ui.filter!=='alle'?1:0);
  const open=!!ui.mFilters;
  const custom=QFIELDS.some(k=>!qField(k))||qAll();
  /* Orange am Knopf heißt dasselbe wie die orange Zeile am
     Schreibtisch: irgendein Filter blendet gerade etwas aus — auch
     ein Bereichsfilter, der nur dort gesetzt worden sein kann. */
  const anyOn=!!(ui.q||'').trim()||nFlt>0||ui.secFilter!=='alle';
  const tile=(c,lab,val,vc)=>`<span class="mk${c?' '+c:''}"><span class="lab">${lab}</span
    ><span class="val ${vc}">${eur(val)}</span></span>`;
  return `<div class="stickybar msearch">
    <!-- Der Filterknopf steht RECHTS vom Suchfeld (seit 23.8.26;
         vorher links): er steht damit genau unter dem ☰ der
         Kopfzeile und trägt dessen Maß — zwei Hamburger, eine
         Flucht. Das Menü klappt darum rechtsbündig auf
         (css/mobile.css). -->
    <div class="msrow">
      <input class="fltq msq" data-q type="search" value="${esc(ui.q||'')}"
        placeholder="${t('g.filter')}" aria-label="${t('g.filter')}">
      <button class="mfbtn${anyOn?' on':''}" data-mfilters="1" aria-expanded="${open}" aria-pressed="${nFlt>0}"
        aria-label="${esc(t('month.mFilters'))}" title="${esc(t('month.mFiltersTip'))}"
        >&#9776;${nFlt?`<span class="mfbadge">${nFlt}</span>`:''}</button>
    </div>
    ${open?`<div class="dropmenu mfmenu${ui.menuDrawn==='mf'?'':' popin'}" data-dm="mf" role="menu">
      <button class="mi mi-sep" data-qclear="1"${anyOn?'':' disabled'}>${t('g.clearFilter')}</button>
      <span class="mghead">${t('flt.due')}</span>
      ${FLT_DUE().map(([v,l,,ic])=>`<button class="mi${ui.dueFilter===v?' sel':''}" role="menuitemradio"
        aria-checked="${ui.dueFilter===v}" data-duefilter="${esc(v)}" data-ic="${ic}">${v==='alle'?t('flt.all'):l}</button>`).join('')}
      <span class="mghead">${t('flt.state')}</span>
      ${FLT_PAY().map(([v,l,,ic])=>`<button class="mi${ui.filter===v?' sel':''}" role="menuitemradio"
        aria-checked="${ui.filter===v}" data-filter="${esc(v)}" data-ic="${ic}">${v==='alle'?t('flt.all'):l}</button>`).join('')}
      <button class="mi mi-top" data-qfields="1" aria-pressed="${custom}">${t('flt.options')}</button>
    </div>`:''}
    ${monthTabs()}
  </div>
  <div class="mkpi">
    ${tile('t-in',t('month.kpiIncome'),sums.inc,'pos')}
    ${tile('t-sal',t('month.kpiSaldo'),sal,cls(sal))}
    ${tile('t-out',t('month.kpiFixed'),sums.out,'neg')}
    ${tile('t-flex',t('month.kak'),sums.flex,'neg')}
  </div>`;
}

/* ── Der Zeitstrahl ───────────────────────────────────────────
   Fünf Zeilen in der Reihenfolge des Monats — was er vorfindet,
   Anfang, Mitte, Ende, Abschluss. Jede Zeile nennt links ihren
   Namen samt Tagen, dann was sich in ihr bewegt und den Kontostand
   danach; rechts steht über die ganze übrige Breite der Balken.
   Gerechnet wird das in monthFlow() (js/calc.js) aus der
   Fälligkeit der einzelnen Positionen.

   **Die Fläche ist ein Wasserfall, und die Achse ist der
   Kontostand selbst** (flowScale in js/calc.js): 0 % der tiefste
   Stand des Monats — höchstens die Null —, 100 % der höchste. Wo
   die Null liegt, teilt den roten vom grünen Bereich; liegt der
   Monat ganz im Plus, ist die ganze Fläche grün. Jede Zeile
   beginnt beim Stand der Zeile darüber und endet bei ihrem
   eigenen, gebaut wird das in flowTrack() weiter oben.

   Die erste Zeile ist kein Zeitraum, sondern ein Stand: was die
   Monate davor übrig gelassen haben. In sie wird nichts fällig,
   sie ist kein Filter — deshalb ein span und kein Knopf. Ihr
   Balken geht von der Null bis zu ihrem Wert und steht damit dort,
   wo der Monat anfängt.

   Die Tage stehen jetzt in der Beschriftung der Zeile (1.–10.,
   11.–20., ab dem 21.) statt als Leiste darunter: die Breite
   gehört dem Betrag, nicht mehr der Zeit. Fällt der heutige Tag in
   eine Zeile, trägt sie eine Marke.

   Ein Klick auf eine Zeile filtert die regelmäßigen Kosten nach
   ihrer Fälligkeit — dieselben Werte wie die Filterknöpfe darunter
   (data-duefilter), nur an der Stelle, an der man gerade liest.
   Ein zweiter Klick nimmt ihn zurück. Ohne aufgeklappte Auswertung
   gibt es den Zeitstrahl nicht, also auch diesen Filter nicht. */

/* Die vier Geldarten des Balkens, in der Reihenfolge, in der sie
   gestapelt werden. */
/* Die Anteile eines Balkens baut flowParts() in js/ui.js — die
   Prognose zeichnet mit derselben Funktion. */

/* ── Die Balkenfläche einer Zeile ─────────────────────────────
   Ein Wasserfall: die Zeile beginnt beim Stand des Abschnitts
   davor (prev) und endet bei ihrem eigenen (run). Dazwischen
   liegt, was den Unterschied gemacht hat.

     • Zuflüsse wachsen von prev nach rechts bis zum höchsten
       Punkt der Zeile (top = prev + alle Zuflüsse).
     • Abflüsse holen von dort zurück nach links bis run.

   Beides kann in derselben Zeile vorkommen — erst kommt das
   Gehalt, dann geht die Miete ab —, und dann überdecken sich die
   beiden Strecken auf der Achse. Deshalb steht der Zufluss über
   dem Abfluss (Klasse `two`). Gibt es nur eine Richtung, steht sie
   allein in der Mitte — jede Zeile ist zwei Balken hoch (.tline
   .ttrack in css/layout.css), gefiltert wie ungefiltert.

   Dazu zwei Marken: eine feine Linie beim Stand davor und ein
   kräftiger Strich beim neuen Stand. Weil die Zeilen aneinander
   grenzen und der neue Stand der Zeile darüber der alte dieser
   Zeile ist, stehen sie genau untereinander — das ist die Treppe
   des Wasserfalls.

   Die erste Zeile ist keine Veränderung, sondern ein Stand: sie
   bekommt einen vollen Balken von der Null bis zu ihrem Wert. */
function flowTrack(f,pos,zero,zones,zout){
  const mark=`<span class="tmark" style="left:${pos(f.run)}%"></span>`;
  const up0=sumOf(f.up), down0=sumOf(f.down);
  const box=inner=>`<span class="ttrack${up0&&down0?' two':''}">${zones}${inner}</span>`;
  if(f.key==='P'){
    /* Die Monatseröffnung ist ein Hinweis: ihr Balken reicht von
       der Null bis zum Stand, den der Monat vorfindet — die Achse
       richtet sich nach ihm nicht (flowScale). Liegt die Null
       außerhalb der Fläche, reicht der Balken bis an deren Rand und
       franst dort aus (.tsum.cutl / .cutr in css/layout.css):
       ausgefranst wird an der Seite, an der die Null hinausfällt —
       steht sie links davon (Guthaben), kommt der Balken von links;
       steht sie rechts (Minus), läuft er nach rechts hinaus. Liegt
       sie **im** Bild, fängt er an ihr an und hat eine Kante. */
    const a=Math.max(0,Math.min(zero,pos(f.run))), b=Math.min(100,Math.max(zero,pos(f.run)));
    const fade=zout?(zero<0?' cutl':' cutr'):'';
    return box(`<span class="tsum solo${fade}" style="left:${a}%;width:${b-a}%"
      data-tip="${esc(eur(f.run))}"></span>${mark}`);
  }
  const up=sumOf(f.up), down=sumOf(f.down), top=f.prev+up;
  const solo=(up&&down)?'':' solo';
  const bar=(cls,from,to,inner)=>`<span class="${cls}${solo}"
    style="left:${pos(from)}%;width:${pos(to)-pos(from)}%">${inner}</span>`;
  return box((up?bar('tup',f.prev,top,flowParts(f.up,up,'up')):'')
    +(down?bar('tdown',f.run,top,flowParts(f.down,down,'down')):'')
    +`<span class="tconn" style="left:${pos(f.prev)}%"></span>${mark}`);
}

/* Name, Tage und Beschriftung eines Abschnitts — der Wasserfall
   und die gefilterte Fassung (partLine) beschriften damit dieselben
   Zeilen; zwei Fassungen liefen auseinander. */
const tlName=k=>({P:t('month.tlOpen'),A:t('month.fDueA'),M:t('month.fDueM'),
  E:t('month.fDueE'),Z:t('month.tlClose')})[k];
const tlDays=(k,last)=>({A:[1,10],M:[11,20],E:[21,last]})[k];
const tlToday=m=>(new Date().getFullYear()===YEAR&&m===CUR)?new Date().getDate():0;
/* Welche Zeile die Marke „Jetzt" trägt. Grundlage sind die Tage —
   1.–10., 11.–20., ab dem 21. Eine Ausnahme: steht man in den
   letzten Tagen (Monatsende) und dort ist kein Eintrag mehr offen,
   ist man in Wirklichkeit schon beim Monatsabschluss — die Marke
   rückt dann dorthin. Offen heißt wie überall: kein Haken; gefragt
   wird der ganze Monat (dueIn), nicht die gefilterte Auswahl —
   ein Filter soll die Marke nicht verschieben. */
function tlNowKey(m){
  const today=tlToday(m);
  if(!today)return '';
  const key=today<=10?'A':today<=20?'M':'E';
  if(key==='E'&&!dueIn(m).some(it=>dueGroup(it.dueDay)==='E'&&!paidAt(it,m)))
    return 'Z';
  return key;
}
function tlLabel(k,last,nowKey){
  const d=tlDays(k,last), now=k===nowKey;
  /* Die Tage stehen seit dem Mac-Redesign nicht mehr neben dem
     Namen, sondern in seiner Sprechblase — die Zeile bleibt eine
     ruhige Beschriftung, und wer wissen will, welche Tage gemeint
     sind, fährt darüber. Monatseröffnung und Monatsabschluss haben
     keine Tage; ihre Sprechblase sagt stattdessen, was die Zeile
     ist (month.tlOpenTip / month.tlCloseTip). */
  const tip=d?t('month.tlDaysTip',d[0],d[1])
    :t(k==='P'?'month.tlOpenTip':'month.tlCloseTip');
  /* Das Zeichen vor dem Namen (6.9.26 spät): dasselbe wie im
     Aufklappmenü „Fälligkeit" (FLT_DUE, css --ic-due-*); die
     Monatseröffnung hat dort keinen Eintrag und trägt das
     Spiegelbild des Abschlusses (--ic-due-p). */
  const ic={P:'due-p',A:'due-a',M:'due-m',E:'due-e',Z:'due-z'}[k];
  return `<span class="tname" data-ic="${ic}"><span data-tip="${esc(tip)}">${tlName(k)}</span>${
    now?`<b class="tnow">${t('month.tlNow')}</b>`:''}</span>`;
}

/* Die feinste Stufe der Leiter 1·2·5·10 …, bei der die Spanne in
   höchstens zehn Felder passt — dieselbe Regel wie die Achse der
   Prognose, nur bis in den Euro hinunter. Beide Fassungen des
   Zeitstrahls rastern damit. */
function tlStep(span){
  let s=1; for(let i=0;span/s>10;i++) s*=[2,2.5,2][i%3];
  return s;
}

/* ── Wie hoch eine Zeile des Zeitstrahls ist ──────────────────
   Gemessen in Balken, und für **alle** Zeilen gleich: drei passen
   von Haus aus hinein, auch dort, wo nur einer oder zwei stehen.
   Braucht eine einzige Zeile mehr — gefiltert können in einem
   Abschnitt alle vier Geldarten stehen —, wächst die ganze Fläche
   mit, damit sie beim Wechseln des Abschnitts nicht springt.

   Gesetzt wird das Maß als `--nbars` an `.tline`, gerechnet in
   css/layout.css; dieselbe Zahl richtet die Balken mittig aus.
   Die Balken selbst stehen darin untereinander — mittig ist die
   Gruppe, nicht der einzelne Balken. */
const TL_MINBARS=3;

/* Die Achszeile über dem Zeitstrahl: an jeder Rasterlinie der
   Betrag, für den sie steht — eine schmale Zeile, nur in der
   Spalte der Balken. Marken nahe der Kante legen sich an sie,
   statt hinauszuragen, wie die Achse der Prognose. */
function tlAxis(marks){
  const lab=marks.map(mk=>{
    const off=mk.x<6?'2px':(mk.x>94?'calc(-100% - 2px)':'-50%');
    return `<span class="tzlab" style="left:${mk.x}%;transform:translateX(${off})">${gnum(mk.v)}</span>`;
  }).join('');
  return `<span class="trow taxis" aria-hidden="true"><span class="ttrack">${lab}</span></span>`;
}

/* ── Ein gewählter Abschnitt: Balken je Geldart ───────────────
   Sobald nach einer Fälligkeit gefiltert wird — eine Zeile des
   Zeitstrahls oder die Knöpfe darunter, beides ui.dueFilter —,
   gibt es keinen Wasserfall mehr: eine einzelne Stufe ohne ihre
   Treppe sagte nichts. Die fünf Zeilen bleiben stehen — die
   Aufteilung des Monats soll man weiter sehen, und ein Klick auf
   eine andere Zeile wechselt den Abschnitt. Jede Zeile zeigt je
   Geldart einen Balken, linksbündig auf dem Grund der Zeile: die
   gewählte kräftig und mit ihrer Summe (der Veränderung der
   gezeigten Zeilen), die übrigen **blass** (.pale) und ohne Zahl —
   sie sind Umgebung, keine Auswahl. **Gerechnet werden sie über
   `selAny`**: dieselben Filter wie die gewählte Zeile, nur ohne
   den Fälligkeitsfilter, der ja gerade den Abschnitt wählt. Wer
   nach „Strom" sucht, sieht in jeder Zeile den Strom — und nicht
   in einer den Strom und daneben den ganzen Monat. Die
   Monatseröffnung hat keine Geldarten und behält nur Raster und
   Namen.

   Gewählt sagen die Trennlinien: über und unter der gewählten
   Zeile liegen sie in der Hervorhebungsfarbe (.tline.part in
   css/layout.css) — kein Rahmen nach innen, kein gefärbter Name.

   **Ohne gewählten Abschnitt** — wenn nur Suchbegriff oder
   Zahlungsstand filtern — ist keine Zeile Auswahl und keine
   Umgebung: dann trägt **jede** ihre eigene Summe, alle Balken
   sind kräftig, und eingefasst ist nichts. Auch dieser Fall
   gehört hierher und nicht zum Wasserfall: dessen Kontostand
   entsteht aus allem, was der Monat bewegt — mit weggefilterten
   Zeilen ist er kein Kontostand mehr, sondern eine Summe von
   Resten. Ein Klick auf eine Zeile wählt von hier aus ihren
   Abschnitt dazu.

   Kein Rot und kein Grün der Fläche: ohne die Achse des
   Kontostands gibt es kein Plus und kein Minus — das Vorzeichen
   steht im Betrag, die Länge ist sein Maß. Das Raster läuft über
   **alle** Zeilen und beginnt an der Trennlinie zur Zahlenseite;
   der längste Balken des Monats bestimmt die Schrittweite
   (tlStep), und über jeder Linie steht ihr Betrag (tlAxis). Die
   Linien tragen Farbe und Stärke des Wasserfalls — es ist
   dieselbe Grafik, nur anders gefüllt. Jede
   Zeile ist mindestens zwei Balken hoch (--nbars), damit die
   Fläche beim Wechseln des Abschnitts nicht springt — mehr Balken
   machen sie höher.

   Ein zweiter Klick auf die gewählte Zeile nimmt den Abschnitt
   zurück; ist danach gar kein Filter mehr gesetzt, gilt wieder
   der Wasserfall. */
function partLine(m,sel,selAny){
  const key=ui.dueFilter, one=key!=='alle';
  const flow=monthFlow(m,sel);
  /* Die Umgebungszeilen kommen ohne den Fälligkeitsfilter; ohne
     gewählten Abschnitt gibt es keine Umgebung — dann ist es
     dieselbe Rechnung. */
  const full=one?monthFlow(m,selAny):flow;
  const last=daysInMonth(m), nowKey=tlNowKey(m);
  /* Je Geldart ihr Ergebnis in einem Abschnitt: Zufuhr minus
     Abzug — für die gewählte Zeile dieselben Zahlen wie in den
     Karten darunter. */
  const valsOf=f=>FLOW_KINDS.map(k=>({k,v:(f.up[k]||0)-(f.down[k]||0)})).filter(x=>x.v);
  const ctx={};
  full.forEach(f=>{ if(f.key!=='P') ctx[f.key]=valsOf(f); });
  if(one) ctx[key]=valsOf(flow.find(x=>x.key===key));
  /* ── Die Achse: die Null trennt, beide Seiten enden am Wert ──
     Was hereinkommt, wächst nach rechts, was abgeht, nach links —
     dieselbe Leserichtung wie im Wasserfall, nur ohne Kontostand.
     Eine Zeile mit Einnahme und Kosten zeigt damit auf einen Blick,
     was von beidem überwiegt; linksbündig standen beide gleich
     herum und man musste die Farben lesen.

     **Jede Seite reicht nur so weit, wie es dort Werte gibt** —
     bis zur Rasterlinie hinter dem größten Betrag ihrer Richtung.
     Eine Fläche, die links bis −5.000 aufmacht, weil rechts 5.000
     stehen, verschenkt die halbe Breite an nichts; die Null steht
     dann eben nicht in der Mitte, sondern dort, wo die Werte sie
     hinsetzen. Neu gerechnet wird das bei jeder Änderung, denn es
     hängt allein an den Zahlen, die gerade zu sehen sind.

     **Der Maßstab bleibt für beide Seiten derselbe** (eine
     Schrittweite, ein Feldmaß): zwei Maßstäbe machten aus einem
     doppelt so langen Balken einen beliebigen Betrag.

     Gerechnet wird über alle Zeilen zusammen — die gewählte
     Auswahl zählt mit, ein Standfilter kann ihren Balken über den
     vollen Abschnitt hinausheben (nur die Zufuhr weggefiltert, der
     Abzug bleibt). Die Schrittweite kommt aus der ganzen Spanne
     und wird gröber, solange beide Seiten zusammen mehr als zehn
     Felder ergäben (aufgerundet wird ja auf jeder Seite). */
  const vs=Object.values(ctx).flat().map(x=>x.v);
  /* ── Nichts gefunden heißt: keine Fläche ─────────────────────
     Findet der Filter in diesem Monat keinen einzigen Betrag, gibt
     es nichts zu messen. Dann steht dort auch kein Maß: keine
     Rasterlinie, keine Null, keine Achszeile mit einer „0" darüber.
     Die fünf Abschnitte bleiben mit ihren Namen stehen — dass sie
     leer sind, sagt der fehlende Balken. Eine Null, die eine Fläche
     teilt, in der nichts steht, behauptet ein Maß, das es nicht
     gibt. */
  const empty=!vs.length;
  const maxPos=Math.max(0,...vs.filter(v=>v>0));
  const maxNeg=Math.max(0,...vs.filter(v=>v<0).map(v=>-v));
  let step=tlStep(Math.max(1,maxNeg+maxPos));
  while(Math.ceil(maxNeg/step)+Math.ceil(maxPos/step)>10) step=tlStep(step*10+1);
  const cellsL=Math.ceil(maxNeg/step);
  /* Ohne einen einzigen Betrag bliebe die Fläche breitenlos. */
  const cellsR=Math.ceil(maxPos/step)||(cellsL?0:1);
  const span=(cellsL+cellsR)*step;
  /* Von der Achse in die Fläche; `z` ist die Null in Prozent. */
  const pos=v=>(v+cellsL*step)/span*100;
  const z=pos(0);
  let grid='';
  const marks=[];
  if(!empty){
    /* ── Derselbe Grund wie im Wasserfall ────────────────────────
       Links der Null der rote Bereich, rechts der grüne — dieselben
       Farben wie die Einträge darunter (--bg-out / --bg-in) und
       dieselbe Aussage: was abgeht, wächst nach links, was
       hereinkommt, nach rechts. Die Fläche misst hier keinen
       Kontostand, aber ein Vorzeichen hat sie sehr wohl, und ihre
       Null steht mitten darin. Zwei Gründe für dieselbe Grafik
       ließen den Filter nach einer anderen Ansicht aussehen.
       **Zuerst gesetzt**, damit Raster, Null und Balken darüber
       liegen. */
    grid+=`<span class="tzone z-neg" style="width:${z}%"></span
      ><span class="tzone z-pos" style="left:${z}%;width:${100-z}%"></span>`;
    for(let k=1-cellsL;k<cellsR;k++){
      /* Die Null hat ihre eigene, kräftigere Linie; die beiden
         äußeren sind die Ränder der Fläche und stehen schon da. */
      if(!k) continue;
      grid+=`<span class="tgrid" style="left:${pos(k*step)}%"></span>`;
    }
    grid+=`<span class="tzero" style="left:${z}%"></span>`;
    for(let k=-cellsL;k<=cellsR;k++) marks.push({v:k*step,x:pos(k*step)});
  }
  /* Die längste Zeile bestimmt die Höhe **aller** Zeilen (siehe
     TL_MINBARS): verschieden hohe Zeilen ließen die Fläche bei
     jedem Wechsel des Abschnitts springen. */
  const nb=Math.max(TL_MINBARS,...Object.values(ctx).map(l=>l.length));
  const track=(list,pale)=>`<span class="ttrack tflat">${grid}${
    list.map((x,i)=>{
      /* Angesetzt wird immer **an** der Null: der Zufluss mit
         seiner linken Kante, der Abfluss mit seiner rechten. Über
         eine gerechnete linke Kante liefe der Abfluss sonst bei
         einem winzigen Betrag in die falsche Richtung — die
         Mindestbreite (2 px, damit er überhaupt zu sehen ist)
         wüchse nach rechts und legte ihn auf die Plusseite. */
      /* Senkrecht steht die **Gruppe** in der Mitte der Zeile, die
         Balken darin untereinander: nimmt ein Filter den zweiten
         Balken weg, klebte der übrige sonst oben, als fehlte
         darunter noch einer. Gerechnet wird von der Mitte aus —
         die halbe Gruppenhöhe hinauf, dann je Balken eine Stufe
         hinunter; dieselbe Rechnung wie in css/layout.css für die
         beiden festen Fälle des Wasserfalls. */
      const w=Math.abs(x.v)/span*100;
      const up=`(${list.length}*(var(--bh) + var(--bgap)) - var(--bgap))/2`;
      return `<span class="fbar b-${x.k}${pale?' pale':''}"
        style="top:50%;transform:translateY(calc(${i}*(var(--bh) + var(--bgap)) - ${up}));${
          x.v>0?`left:${z}`:`right:${100-z}`}%;width:${w}%"
        data-tip="${esc(eur(x.v))}"></span>`;
    }).join('')}</span>`;
  /* Eine Zeile ohne Bewegung bleibt leer — wie im Wasserfall. Vier
     Zeilen mit „—" untereinander lesen sich wie ein Fehler; dass
     dort nichts ist, sagt schon der fehlende Balken. */
  const sum=f=>f.sum?`<span class="trun ${cls(f.sum)}">${(f.sum>0?'+':'')+eur(f.sum)}</span>`:'';
  const rows=flow.map(x=>{
    if(x.key==='P') return `<span class="trow tp-P">${tlLabel('P',last,nowKey)
      }<span class="ttrack tflat">${grid}</span></span>`;
    /* Mit gewähltem Abschnitt trägt nur er seine Summe und volle
       Farbe; ohne einen ist keine Zeile ausgezeichnet, also
       bekommt jede beides. */
    const on=x.key===key;
    return `<button class="trow tp-${x.key}" data-tpart="${x.key}" aria-pressed="${on}"
      aria-label="${esc(tlName(x.key))}">${tlLabel(x.key,last,nowKey)}${
        one&&!on?'':sum(x)}${track(ctx[x.key],one&&!on)}</button>`;
  }).join('');
  /* Die Farberklärung nennt alles, was in der Fläche vorkommt —
     auch die blassen Balken tragen ihre Geldartfarbe. */
  const kinds=FLOW_KINDS.filter(k=>Object.values(ctx).some(l=>l.some(x=>x.k===k)));
  const chips=kinds.map(k=>`<span class="lk"><i class="b-${k}"></i>${t(FLOW_LABEL[k])}</span>`).join('');
  return `<div data-fk="body:tl" class="tline part" style="--nbars:${nb}">${empty?'':tlAxis(marks)}${rows}
    ${chips?`<div class="thint">${chips}</div>`:''}</div>`;
}

function timeline(m,sel,selAny){
  /* **Sobald irgendein Filter greift, gibt es keinen Wasserfall
     mehr.** Sein Maß ist der Kontostand, und der entsteht aus
     allem, was der Monat bewegt — mit weggefilterten Zeilen ist er
     kein Kontostand mehr, sondern eine Summe von Resten, die auf
     keinem Konto steht. Gezeigt wird dann, was man tatsächlich
     gefiltert hat: je Abschnitt seine Beträge als Balken
     (partLine). Das gilt für **jeden** Filter der Leiste — auch für
     den Bereichsfilter: ein Kontostand aus lauter Einnahmen ist
     keiner. */
  if(!!queryQ()||ui.filter!=='alle'||ui.dueFilter!=='alle'||ui.secFilter!=='alle')
    return partLine(m,sel,selAny);
  const flow=monthFlow(m,sel), sc=flowScale(flow), last=daysInMonth(m);
  const nowKey=tlNowKey(m);
  /* Von der Achse zur Fläche: 0 % ist der tiefste Stand des Monats
     (höchstens die Null), 100 % der höchste. */
  const pos=v=>(v-sc.lo)/sc.span*100;
  const zero=pos(0);
  /* **Gezoomt wird auf die Bewegungen des Monats** (flowScale in
     js/calc.js). Ob die Null dabei ins Bild kommt, entscheidet der
     Monat und nicht die Grafik: berührt er sie, steht sie als Linie
     zwischen Rot und Grün; sonst liegt sie außerhalb, die Fläche
     ist eine einzige Zone, und der Balken der Monatseröffnung franst
     zum Rand hin aus. Daran hängen vier Stellen — Linie, Raster,
     Ausfransen und der Maßstab in der Farberklärung; sie müssen
     dieselbe Frage stellen, sonst behauptet eine von ihnen etwas
     anderes als die Fläche daneben. */
  const zout=zero<0||zero>100;
  /* Links der Null der rote, rechts der grüne Bereich. Liegt der
     Monat ganz im Plus, steht die Null am linken Rand — dann ist
     die ganze Fläche grün, und genau das soll man sehen. */
  /* Die Null nur, wenn sie im Bild liegt: bei beschnittener Achse
     steht sie weit außerhalb, dann ist die ganze Fläche eine Zone. */
  const zc=Math.max(0,Math.min(100,zero));
  /* Das Raster der Fläche: Linien in festem Betragsabstand, in
     jeder Zeile an derselben Stelle (sie hängen an den Zonen und
     stehen damit in jeder Zeile). Die Null behält ihre kräftigere
     Linie und bekommt keine zweite; über jeder Linie steht ihr
     Betrag (tlAxis), die Null eingeschlossen. */
  const step=tlStep(sc.span);
  const marks=[]; let gridw='';
  for(let v=Math.ceil(sc.lo/step)*step; v<=sc.hi; v+=step){
    marks.push({v,x:pos(v)});
    if(zout||Math.abs(v)>=step/2) gridw+=`<span class="tgrid" style="left:${pos(v)}%"></span>`;
  }
  const zones=`<span class="tzone z-neg" style="width:${zc}%"></span
    ><span class="tzone z-pos" style="left:${zc}%;width:${100-zc}%"></span
    >${zout?'':`<span class="tzero" style="left:${zc}%"></span>`}${gridw}`;

  const row=f=>{
    const name=tlLabel(f.key,last,nowKey);
    const nums=`<span class="tflow ${cls(f.sum)}">${f.key==='P'||!f.sum?'':(f.sum>0?'+':'')+eur(f.sum)}</span
      ><span class="trun ${cls(f.run)}">${eur(f.run)}</span>`;
    /* Keine Sprechblase an der Zeile: sie zeigte beim Überfahren
       der halben Leiste etwas an. Was ein Anteil ist, sagt seine
       eigene Blase, und was ein Klick tut, der graue Satz darüber. */
    const track=flowTrack(f,pos,zero,zones,zout);
    if(f.key==='P') return `<span class="trow tp-P">${name}${nums}${track}</span>`;
    return `<button class="trow tp-${f.key}" data-tpart="${f.key}"
      aria-pressed="${ui.dueFilter===f.key}"
      aria-label="${esc(tlName(f.key))}">${name}${nums}${track}</button>`;
  };
  /* Unter den Zeilen die Farberklärung. Sie muss sein, seit an
     einem Anteil nur noch sein Betrag steht: die Farbe ist dann
     das Einzige, was die Geldart nennt. Die ganze Zeile trägt die
     Erklärung des Balkens als Sprechblase. */
  const chips=FLOW_KINDS.map(k=>`<span class="lk"><i class="b-${k}"></i>${t(FLOW_LABEL[k])}</span>`).join('')
    +`<span class="lk"><i class="lmark"></i>${t('month.tlMark')}</span>`;
  /* Liegt die Null außerhalb, gehört der Maßstab dazu — sonst läse
     man die Länge des ersten Balkens als seinen ganzen Betrag.
     Berührt der Monat die Null, steht sie in der Fläche und der
     Satz sagte nur noch einmal, was die Achszeile darüber schon
     Zahl für Zahl nennt. */
  const scale=zout?`<span class="lscale">${t('month.tlScale',eur(sc.lo),eur(sc.hi))}</span>`:'';
  /* Zwei Balken hat hier die höchste Zeile (Zufluss über Abfluss);
     hoch ist die Zeile trotzdem wie überall — gleiche Höhen in
     beiden Fassungen, nichts springt beim Filtern. */
  return `<div data-fk="body:tl" class="tline${zout?' cut':''}" style="--nbars:${TL_MINBARS}">${tlAxis(marks)}${flow.map(row).join('')}
    <div class="thint">${chips}${scale}</div></div>`;
}

/* Der Pfeil, der eine Karte zu- und aufklappt. Er steht ganz links
   in der Kopfzeile und ist so breit wie die Siegelspalte darunter
   (--markw) — dadurch steht er senkrecht über den Haken der
   Positionen. Er ist so groß wie ein Siegel; seine Farbe ist die
   des Bereichs, ein Wort braucht er nicht.

   **Solange gefiltert wird, gibt es ihn nicht.** Dann stehen alle
   Bereiche offen — der Filter zeigt, was er gefunden hat, und ein
   Pfeil, der dagegen anklappen wollte, hielte nicht, was er
   verspricht. Zurück bleibt ein leeres Feld
   derselben Breite, damit die Überschrift nicht springt. */
function foldBtn(key,on,hide){
  if(hide) return `<span class="foldpad" aria-hidden="true"></span>`;
  const lab=on?t('month.maxAreaTip'):t('month.minAreaTip');
  return `<button class="foldarrow" data-fold="${key}" aria-expanded="${!on}"
    aria-label="${esc(lab)}" title="${esc(lab)}">${tri(!on)}</button>`;
}
/* „(3 ausgeblendet)" neben der Überschrift. Von Hand zugeklappt
   sagt es nichts — dort ist ohnehin keine Zeile zu sehen. Beim
   Filtern ist nichts zugeklappt, dort steht es also immer. */
const hiddenNote=(all,use,folded)=>(!folded&&use<all)
  ?` <span class="note">${t('month.hidden',all-use)}</span>`:'';

function viewMonat(){
  const m=ui.month;

  /* ── Die Filter gelten für alle drei Bereiche ────────────────
     Suchfeld, Fälligkeit und Zahlungsstand stehen oben in der
     Leiste und filtern Einnahmen, Flexible Payments und
     regelmäßige Kosten zugleich. Sie gelten gleichzeitig — was
     übrig bleibt, erfüllt alle drei.

     Die Flexible Payments und die Saldokorrektur haben keinen
     Zahltag: sie gehören zum Monatsabschluss, also zu 'Z' (siehe
     dueGroup in js/format.js). Der Zahlungsstand einer
     Flexible-Payments-Kategorie ist kakDone(); die Saldokorrektur
     hat gar keinen — sie wird nicht abgehakt und bleibt vom
     Standfilter unberührt, wie sie auch kein Siegel trägt. */
  const q=queryQ();
  /* Der Haken „auch in den ausgeblendeten Positionen" (qAll() in
     js/state.js): mit ihm gewinnt der Suchbegriff gegen die
     übrigen Filter — und gegen den Monat selbst. Gesucht wird dann
     in **allen** Posten, auch in denen, die in diesem Monat keinen
     Betrag haben und deshalb gar nicht in seiner Liste stehen
     (dueIn in js/calc.js). Ohne Suchbegriff ändert er nichts. */
  const wide=!!q&&qAll();
  /* ── Der Bereichsfilter ──────────────────────────────────────
     Er wählt eine der drei Karten — Einnahmen, Flexible Payments,
     regelmäßige Kosten — und nimmt die beiden anderen weg, samt
     der Saldokorrektur: die gehört keinem der drei Bereiche an.
     Er greift **an derselben Stelle wie die übrigen Filter**, also
     an der Auswahl und nicht erst an den Karten; nur so rechnen
     Kennzahlen und Zeitstrahl mit dem, was zu sehen ist (siehe
     „Was ein Filter mit den Summen macht" in CLAUDE.md).
     Die weite Suche übergeht ihn wie die anderen. */
  /* ── Der Suchbegriff trifft auch den Namen eines Bereichs ────
     Wer „Einnahmen" oder „Flexible Payments" eintippt, meint die
     ganze Karte und nicht eine Zeile darin. Die Jahresansicht
     kann das seit jeher (hit() in js/views/jahr.js) — hier fehlte
     es, und derselbe Begriff fand im Monat nichts.

     Der Name eines Bereichs steht in keiner Zeile, er kommt also
     nicht über hayItem/hayKak herein. Verglichen wird mit der
     Beschriftung, die im Kartenkopf steht, und er hängt am selben
     Kästchen wie Kategorie, Bank und Fälligkeit (qField('meta')):
     wer die Kürzel abwählt, sucht auch nicht mehr über die
     Gliederung. Trifft der Name, gilt der Treffer für alles in
     der Karte — man sucht den Bereich, um ihn ganz zu sehen. */
  const secHit=lab=>!!q&&qField('meta')&&norm(lab).includes(q);
  const qIn=secHit(t('month.income')), qFlex=secHit(t('month.kak')),
        qOut=secHit(t('month.fixed')), qBal=secHit(t('bal.row'));
  /* Der Bereich eines Postens — Einnahme, flexibel oder regulär —
     entscheidet sich an seiner Kategorie (isIncome/isFlex in
     js/calc.js). */
  const secOf=it=>isIncome(it)?'in':(isFlex(it)?'flex':'out');
  const qOk=(it,mm)=>!q||(isIncome(it)?qIn:(isFlex(it)?qFlex:qOut))||hayItem(it,mm).includes(q);
  const secOk=s=> wide||ui.secFilter==='alle'||ui.secFilter===s;
  const dueOk=v=> ui.dueFilter==='alle'||dueGroup(v)===ui.dueFilter;
  const stateOk=it=> ui.filter==='alle'
    || (ui.filter==='offen'&&!paidAt(it,m))
    || (ui.filter==='unklar'&&estOf(it))
    || (ui.filter==='bezahlt'&&paidAt(it,m));
  const show=it=> secOk(secOf(it))&&qOk(it,m)&&(wide||(stateOk(it)&&dueOk(it.dueDay)));
  const balOn=secOk('bal')&&(!q||qBal||hayItem(state.balance,m).includes(q))&&(wide||dueOk(''));

  /* ── Dieselbe Auswahl ohne den Fälligkeitsfilter ─────────────
     Der gefilterte Zeitstrahl lässt die nicht gewählten Abschnitte
     stehen und zeigt ihre Balken als Umgebung. Gerechnet werden
     müssen sie über **dieselben** übrigen Filter — Suchbegriff und
     Zahlungsstand —, nur eben ohne den Fälligkeitsfilter, der ja
     gerade entscheidet, welcher Abschnitt der gewählte ist.
     Sonst zeigte eine Suche nach „Strom" in der gewählten Zeile
     den Strom und daneben den ganzen Monat.
     Genommen wird nur, was auch in einer Karte stünde (dieselbe
     Gruppierung), damit beide Zahlen aus derselben Quelle kommen. */
  const showAny=it=> secOk(secOf(it))&&qOk(it,m)&&(wide||stateOk(it));
  const balAny=secOk('bal')&&(!q||qBal||hayItem(state.balance,m).includes(q));

  /* Womit die Liste anfängt: gewöhnlich die Posten dieses Monats,
     bei weiter Suche alle. */
  const pool=wide?state.fixed:dueIn(m);
  const incAll=pool.filter(isIncome), incUse=incAll.filter(show);
  /* Einnahmen werden nach Kategorie gebündelt wie die Kosten —
     seit es mehr als eine geben kann, wäre eine flache Liste die
     einzige Stelle, an der man die Kategorie nicht sähe. Bei genau
     einer Kategorie entfällt die Zwischenzeile: sie stünde dann
     über allem und sagte nichts. */
  const incGroups=incomeGroups().map(g=>{
    const all=incAll.filter(it=>it.group===g);
    return {g,all,items:settledLast(all.filter(show)),any:all.filter(showAny)};
  });
  /* Die flexiblen Posten nach Kategorie gebündelt wie die Kosten
     (seit 6.9.26): dieselben Zeilen, dieselben Filter — ein flexibler
     Posten ist ein Posten (isFlex in js/calc.js). */
  const flexGroupsL=flexGroups().map(g=>{
    const all=pool.filter(it=>isFlex(it)&&it.group===g);
    return {g,all,items:settledLast(all.filter(show)),any:all.filter(showAny)};
  });
  const flexAll=pool.filter(isFlex);
  const flexUse=flexGroupsL.reduce((a,x)=>a.concat(x.items),[]);
  const outGroups=costGroups().map(g=>{
    const all=pool.filter(it=>isCost(it)&&it.group===g);
    return {g,all,items:settledLast(all.filter(show)),any:all.filter(showAny)};
  });
  /* Die gezeigten Kosten in einer flachen Liste — daraus kommen
     die Zahl neben der Überschrift, die Kartensumme und der
     Kostenanteil der Auswertung. */
  const outItems=outGroups.reduce((a,x)=>a.concat(x.items),[]);
  const outAll=outGroups.reduce((n,x)=>n+x.all.length,0);
  const outUse=outItems.length;

  /* ── Alles rechnet über das, was zu sehen ist ────────────────
     Jede Zahl dieser Ansicht — die vier Kennzahlen der
     Auswertung, der Zeitstrahl, die drei Kartensummen und die
     Zeile jeder Kategorie — rechnet über die **übrig
     gebliebenen** Zeilen, nicht über den Zustand. Eine Karte, die
     drei von zwanzig Posten zeigt und darüber die Summe aller
     zwanzig nennt, beantwortet eine Frage, die niemand gestellt
     hat: wer filtert, will wissen, was das Gefundene zusammen
     ausmacht. Ohne Filter ist beides dasselbe — dann bleibt jede
     Zahl, wie sie war.

     `sel` ist diese Auswahl in einem Stück, wie monthFlow() sie
     erwartet (js/calc.js). Sie entsteht aus **denselben** Listen,
     aus denen die Zeilen gebaut werden — Auswertung und Karten
     können deshalb nicht auseinanderlaufen.

     Was `sel` **nicht** anfasst: `carryIn(m)` in der ersten Zeile
     des Zeitstrahls. Das ist der Stand, den der Monat vorfindet,
     und den machen die Monate davor — die filtert niemand. */
  const sumIt=arr=>arr.reduce((s,it)=>s+it.amounts[m-1],0);
  const sel={items:incUse.concat(flexUse,outItems),bal:balOn};
  /* Dieselbe Auswahl ohne den Fälligkeitsfilter — nur der
     gefilterte Zeitstrahl braucht sie, für die Balken der nicht
     gewählten Abschnitte (siehe showAny oben). */
  const selAny={items:incGroups.concat(flexGroupsL,outGroups).reduce((a,x)=>a.concat(x.any),[]),bal:balAny};
  const incSum=sumIt(incUse);
  const flexSum=sumIt(flexUse);
  const outSum=sumIt(outItems);

  /* ── Wann ein Bereich zugeklappt ist ─────────────────────────
     Gewöhnlich sagt es die Datei (state.folded). **Ein Filter**
     klappt alles auf und lässt sich dabei nicht überstimmen, ohne
     die Datei anzurühren: er zeigt, was er gefunden hat, in allen
     drei Bereichen — wer sucht, will nicht daran denken müssen,
     dass der Treffer in einer zugeklappten Karte steckt. Solange
     er gilt, gibt es auch keinen Pfeil (foldBtn) und keinen
     Doppelklick; danach gilt wieder, was in der Datei steht.

     **Die offene Auswertung zählt seit 22.8.26 nicht mehr dazu.**
     Sie tat es, damit der Zeitstrahl sich in der Liste
     wiederfinden lässt — nur steht sie in vielen Büchern von Haus
     aus offen (state.anaOpen), und dann fehlten die Pfeile
     dauerhaft und ohne erkennbaren Grund: dieselbe Anwendung sah
     in zwei Dateien verschieden aus. Der Zeitstrahl bleibt auch
     über einer zugeklappten Karte lesbar; wer eine Zeile sucht,
     klappt sie auf. */
  const filterOn=!!q||ui.filter!=='alle'||ui.dueFilter!=='alle'||ui.secFilter!=='alle';
  const mob=isMobile();
  const openAll=filterOn;
  const foldOf=k=>openAll?false:isFolded(k);
  const fIn=foldOf('in'), fFlex=foldOf('flex'), fOut=foldOf('out');

  /* ── Beim Filtern verschwindet ein leerer Bereich ganz ────────
     Wer nach den regelmäßigen Kosten filtert, braucht die Karte der
     Einnahmen nicht: sie stünde als Kopfzeile mit „(4 ausgeblendet)"
     und dem Satz „Keine Posten für diesen Filter" da — drei Zeilen
     über der Liste, die man gerade liest, und keine davon sagt
     etwas. Dasselbe in der Jahresmatrix (siehe viewJahr).

     **Ohne Filter bleibt sie stehen.** Dort ist der leere Bereich
     die Auskunft: es gibt ihn, und es steht noch nichts darin — mit
     dem Knopf, der das ändert.

     Bleibt gar nichts übrig, steht statt der drei Karten eine Zeile
     (leerLine): eine leere Fläche sähe aus, als wäre etwas kaputt. */
  const keep=n=>!filterOn||n>0;
  const showIn=keep(incUse.length), showFlex=keep(flexUse.length), showOut=keep(outUse);

  /* Dieselbe Zeile wie im Kostenblock: Summe, Name, Zahl der
     ausgeblendeten. Gebaut mit derselben Funktion, damit beide
     Bereiche nicht auseinanderlaufen. Summiert werden die
     **gezeigten** Posten; wie viele fehlen, steht daneben. */
  const groupHead=(g,all,items,sum)=>`<tr class="group"><td></td><td class="num amt">${eur(sum!=null?sum:sumIt(items))}</td><td></td>
      <td colspan="${mob?1:4}">${esc(keyLabel(g))}${items.length!==all.length?` <span class="note">${t('month.hidden',all.length-items.length)}</span>`:''}</td></tr>`;
  /* **Die Kategoriezeile steht immer** (seit 6.9.26; bis dahin bei
     den Einnahmen nur ab zwei Kategorien): auch „… ohne Kategorie"
     ist eine Auskunft — die Posten darunter haben noch keine. In
     allen drei Bereichen dieselbe Regel. */
  let incRows='';
  if(!fIn){
    incGroups.forEach(({g,all,items})=>{
      if(!items.length) return;
      incRows+=groupHead(g,all,items);
      items.forEach(it=>{incRows+=itemRow(it,m);});
    });
  }
  let flexRows='';
  if(!fFlex){
    flexGroupsL.forEach(({g,all,items})=>{
      if(!items.length) return;
      flexRows+=groupHead(g,all,items);
      items.forEach(it=>{flexRows+=itemRow(it,m);});
    });
  }

  let outRows='';
  outGroups.forEach(({g,all,items})=>{
    if(!items.length||fOut) return;
    outRows+=groupHead(g,all,items);
    items.forEach(it=>{outRows+=itemRow(it,m);});
  });
  /* Ein Bereich ohne eine einzige Zeile. **Am Filter kann es nicht
     liegen** — dann gäbe es die Karte gar nicht mehr (keep() weiter
     oben). Bleibt der eine Fall: hier steht noch nichts. */
  const noRows=key=>`<tr><td class="note" colspan="${mob?4:7}">${t(key)}</td></tr>`;

  /* Die Auswertung bleibt beim Scrollen stehen — wie die
     Monatsreiter in der Kopfzeile darüber. Die Karten darunter
     werden lang, und die Frage „wie viel bleibt mir" soll man
     nicht durch Hochscrollen beantworten müssen. Eingeklappt ist
     sie eine Zeile; aufgeklappt kommt der Zeitstrahl dazu (anaBar
     weiter oben).

     Ganz unten steht die Zeichenerklärung (.legendbar). Sie
     gehört nicht in die Karte der regelmäßigen Kosten: dieselben
     Siegel stehen auch bei den Einnahmen und den Flexible
     Payments. Deshalb ein eigener grauer Kasten unter allen
     Karten. Bezahlt und Noch offen stehen nicht mehr darunter —
     beides sagt schon die Auswertung. */
  /* Die Anlege-Knöpfe stehen seit dem Mac-Redesign im
     Hamburger-Menü der Kopfzeile (fina-online.html) — der Kopf einer
     Karte trägt nur noch Pfeil, Beschriftung und Summe; nur der
     Sprung in die Transactions-Auswertung bleibt am Flex-Kopf, denn
     er führt zu genau diesem Monat. */
  const secHead=(fk,folded,titleHtml,totHtml,extraHtml='')=>
    `<div class="sechead"${openAll?'':` data-secfold="${fk}" data-hk="fold:${fk}"`}>${foldBtn(fk,folded,openAll)}<h2 style="margin:0">${titleHtml}</h2>
      ${mob?totHtml:`${extraHtml}${totHtml}`}</div>`;
  /* Der Sprung in die Auswertung („Import Details") ist seit 7.9.26
     weg — die Ansicht gibt es nicht mehr. */
  const flexExtra='';

  const cardIn=!showIn?'':`<div class="card sec-in${fIn?' folded':''}" data-fk="card:in">
    ${secHead('in',fIn,
      `${t('month.income')}${hiddenNote(incAll.length,incUse.length,fIn)}`,
      `<span class="tot pos">${eur(incSum)}</span>`)}
    ${fIn?'':`<table class="ledger" data-fk="body:in">${incRows||noRows('month.noIncome')}</table>`}
  </div>`;

  const cardFlex=!showFlex?'':`<div class="card sec-flex${fFlex?' folded':''}" data-fk="card:flex">
    ${secHead('flex',fFlex,
      `${t('month.kak')}${state.flexSource[m]?`<span class="pill">${esc(state.flexSource[m])}</span>`:''}${hiddenNote(flexAll.length,flexUse.length,fFlex)}`,
      `<span class="tot neg">${eur(flexSum)}</span>`,flexExtra)}
    ${fFlex?'':`<table class="ledger" data-fk="body:flex">${flexRows||noRows('month.noKak')}</table>`}
  </div>`;

  const cardOut=!showOut?'':`<div class="card sec-out${fOut?' folded':''}" data-fk="card:out">
    ${secHead('out',fOut,
      `${t('month.fixed')}${hiddenNote(outAll,outUse,fOut)}`,
      `<span class="tot neg">${eur(outSum)}</span>`)}
    ${fOut?'':`<table class="ledger" data-fk="body:out">${outRows||noRows('month.noFixed')}</table>`}
  </div>`;

  /* Nichts gefunden: die Karten sind alle weg, die Saldokorrektur
     auch. Dann sagt es eine Zeile — sonst stünde unter der
     Filterzeile nichts als Papier. */
  const leerLine=(cardIn||cardFlex||cardOut||balOn)?''
    :`<div class="card"><p class="note" style="margin:0">${t('month.noItems')}</p></div>`;

  /* Am Schreibtisch rollt die Liste in ihrer eigenen Fläche
     (#monthScroll), wie die Jahresmatrix: Filterzeile, Monatsleiste
     und Auswertung stehen darüber und rollen nicht mit, und der
     Rollbalken fängt erst unter ihnen an — dieselbe Antwort wie in
     der Jahresansicht, damit beim Ansichtswechsel nichts springt
     (body.monthview, sizeMonth in js/app.js). Auf dem Telefon
     bleibt es beim Rollen der Seite mit klebender Leiste. */
  /* Die Zeichenerklärung der Siegel (.legendbar) stand bis 23.8.26
     unter den Karten — sie ist weg: was die Siegel bedeuten, sagen
     ihre Sprechblasen und die Anleitung. Die Schlüssel
     (month.legTitle …) bleiben in js/i18n.js — sie gehören zur
     Anleitung. */
  const inner=`${balOn?balanceRow(m):''}
  ${leerLine}
  ${cardIn}
  ${cardFlex}
  ${cardOut}`;
  return `
  ${mob?mobileTop(m,sel,{inc:incSum,flex:flexSum,out:outSum}):anaBar(m,sel,selAny)}
  ${mob?inner:`<div class="monthscroll" id="monthScroll" data-fk="card:ms">${inner}</div>`}`;
}
