/* ══════════════════════════════════════════════════════════════
   FINA — Ansicht „Prognose"
   Hochrechnung auf das Restjahr. Für Monate ohne Fast-Budget-
   Import rechnet die App mit den hier gepflegten Annahmen.
   ══════════════════════════════════════════════════════════════ */

/* ── Der Verlauf als Spalte ───────────────────────────────────
   Dieselbe Grafik wie der Zeitstrahl der Monatsansicht, nur eine
   Ebene höher: eine Zeile je Monat, die Achse ist der Kontostand
   über das Jahr. Der Monat beginnt beim Stand des Monats davor
   (prev) und endet bei seinem eigenen (run); dazwischen steht,
   was den Unterschied gemacht hat — Zuflüsse von prev nach rechts
   bis zum höchsten Punkt, Abflüsse von dort zurück nach run,
   jeder Anteil in der Farbe seiner Geldart.

   Eine eigene Karte bräuchte Monatsnamen und Achse ein zweites
   Mal — beides steht in der Tabelle schon. Als Spalte liest man
   Zahl und Form in derselben Zeile.

   Die Balken sind flacher als im Zeitstrahl (--bh an .ytrack):
   dort trägt eine Zeile eine von fünf, hier eine von zwölf, und
   die Tabelle daneben gibt die Zeilenhöhe vor. */
function yearTrack(f,pos,cut){
  const up=sumOf(f.up), down=sumOf(f.down), top=f.prev+up;
  const solo=(up&&down)?'':' solo';
  const clamp=v=>Math.max(0,Math.min(100,v));
  const bar=(cls,from,to,inner)=>{
    /* Bei beschnittener Achse liegt der Anfang des Januars
       außerhalb der Fläche. Der Balken franst dann zum Rand hin
       aus — dieselbe Aussage wie beim Balken der Monatseröffnung
       im Zeitstrahl, und aus demselben Grund keine Marke: sie
       behauptete eine Kante, wo der Balken weiterläuft. */
    const fade=cut?(pos(from)<0?' cutl':pos(to)>100?' cutr':''):'';
    const a=clamp(pos(from)), b=clamp(pos(to));
    return `<span class="${cls}${solo}${fade}" style="left:${a}%;width:${b-a}%">${inner}</span>`;
  };
  /* Ohne Hintergrund: der Balken steht auf dem Papier der Zeile
     wie jede Zahl daneben. Die roten und grünen Flächen des
     Zeitstrahls sagen hier nichts — über zwölf Monate liest man
     den Stand an den Rasterlinien ab, nicht an einer Tönung, und
     zwei Farbflächen unter zwölf farbigen Balken waren vor allem
     unruhig. */
  return `<span class="ttrack ytrack${up&&down?' two':''}">${
    up?bar('tup',f.prev,top,flowParts(f.up,up,'up')):''}${
    down?bar('tdown',f.run,top,flowParts(f.down,down,'down')):''
    }<span class="tconn" style="left:${clamp(pos(f.prev))}%"></span
    ><span class="tmark" style="left:${clamp(pos(f.run))}%"></span></span>`;
}

/* ── Die Spaltenköpfe ─────────────────────────────────────────
   Kurz, weil die Kopfzeile sonst die Spaltenbreite bestimmt: über
   „CORRECTION" stehen zehn Zeichen für eine Spalte, in der
   meistens nur ein Strich steht, und jedes Zeichen fehlt hinten
   der Grafik. Was die Abkürzung bedeutet und wozu die Spalte da
   ist, sagt die Sprechblase — sofort, nicht erst nach einer
   Sekunde.

   Die Kürzel sind in **beiden Sprachen dieselben**, wie B · PT ·
   DD · LP in der Jahresmatrix: sie stehen für den Begriff, nicht
   für ein Wort, und ein übersetztes Kürzel wäre in keiner der
   beiden Sprachen eingeführt. Deshalb stehen sie hier und nicht
   in js/i18n.js — dort stehen nur der volle Name und der Satz
   dazu, aus denen die Sprechblase gebaut wird. */
const PROG_COLS=[
  {ab:'M',    cls:'',           name:'g.month',          tip:'prog.tipMonth'},
  {ab:'IN',   cls:'num',        name:'prog.colIncome',   tip:'prog.tipIncome'},
  {ab:'REG',  cls:'num',        name:'prog.colFixed',    tip:'prog.tipFixed'},
  {ab:'FLEX', cls:'num',        name:'prog.colKak',      tip:'prog.tipKak'},
  {ab:'COR',  cls:'num balcol', name:'prog.colBal',      tip:'prog.tipBal'},
  {ab:'BAL',  cls:'num',        name:'prog.colBalance',  tip:'prog.tipBalance'},
  {ab:'CUM',  cls:'num',        name:'prog.colCum',      tip:'prog.tipCum'},
];

/* Das Rastermaß in der Spaltenüberschrift: ganze Zahl mit
   Tausenderpunkt und ohne Währung — es steht in Klammern hinter
   dem Wort und soll so kurz wie möglich sein. */
/* `||0` fängt die **negative Null**. Die Rasterlinien sind
   Vielfache der Schrittweite, gerechnet über `Math.ceil(lo/step)` —
   und `Math.ceil(-0.58)` ist in JavaScript `-0`. Ohne diesen Griff
   stünde über der Nulllinie „-0", und eine Null hat kein
   Vorzeichen. */
const gnum=v=>(Math.round(v)||0).toLocaleString(LANG()==='de'?'de-DE':'en-US');

function viewPrognose(){
  /* Die Kumulation läuft über das ganze Jahr: die letzte Zeile ist
     damit der Saldo zum Jahresende, die Zeile vor dem laufenden
     Monat der Stand von heute. */
  const flow=yearFlow();
  let sc=yearScale(flow);
  const pos=v=>(v-sc.lo)/sc.span*100;
  /* ── Das Raster ──────────────────────────────────────────────
     Ohne Linien sagt ein Balken nur „mehr" oder „weniger"; mit
     ihnen liest man ab, um wie viel. Gewählt wird die gröbste
     Stufe, die noch genug Linien übrig lässt — Tausender bei
     kleinen Jahren, Zehntausender bei großen. Zu viele Linien
     wären ein Gitter, zu wenige sagten nichts.

     Die Linien stehen in `zones` und damit in jeder Zeile an
     derselben Stelle: nur dadurch fluchten sie über die zwölf
     Monate und man sieht die Treppe gegen ein festes Maß. */
  /* Die Leiter bleibt im Tausenderbereich und wird nach oben
     gröber. Gewählt wird die **feinste** Stufe, die höchstens zehn
     Linien ergibt: mehr wären ein Gitter, in dem der Balken
     untergeht, weniger sagten zu wenig. Bei einem Jahr über rund
     13.000 sind das die Zweitausender — sieben Linien, gut 60 px
     auseinander. */
  const lines=v=>Math.floor(sc.hi/v)-Math.ceil(sc.lo/v)+1;
  const step=[1000,2000,2500,5000,10000,25000,50000].find(v=>lines(v)<=10)||100000;

  /* ── Mit Anfangsbestand fängt die Achse nicht bei null an ────
     Wer mit 10.000 anfängt, bewegt sich das ganze Jahr zwischen
     10.000 und 20.000 — die Hälfte der Fläche wäre leer, und die
     Bewegungen, um die es geht, hätten die andere Hälfte. Deshalb
     läuft die Achse dann über die Werte selbst (`cut`), so wie der
     Zeitstrahl es bei einem hohen Kontostand ohnehin tut.

     Dazu bekommt sie **einen Rasterschritt Luft unter dem
     Anfangsbestand**: genau so weit reicht sein Balken in der
     Zeile darüber, und ohne diesen Platz wäre er nicht zu sehen.
     Das geht erst hier, denn die Schrittweite steht erst nach der
     ersten Rechnung fest — sie bleibt, nur die Grenze wandert. */
  const op0=opening();
  if(op0){
    const edge=op0>0?op0-step:op0+step;
    const lo=Math.min(sc.lo,edge), hi=Math.max(sc.hi,edge);
    sc={lo,hi,span:(hi-lo)||1,cut:true};
  }
  /* Links der Null der rote, rechts der grüne Bereich — wie im
     Zeitstrahl. Bei beschnittener Achse liegt die Null außerhalb,
     dann ist die ganze Fläche eine Zone. */
  const zc=Math.max(0,Math.min(100,pos(0)));
  const grid=[];
  /* ── Die Achse in der Kopfzeile ──────────────────────────────
     Über der Spalte steht keine Beschriftung mehr, sondern die
     Achse selbst: an jeder Rasterlinie der Betrag, für den sie
     steht. „Verlauf (Raster 2.000)" nannte nur den Abstand — man
     musste sich von der Null aus durchzählen, um eine Linie zu
     lesen. Jetzt steht die Zahl dort, wo die Linie ist.

     Die Marke sitzt mittig über ihrer Linie; ganz außen würde sie
     über den Rand der Spalte hinausragen und legt sich deshalb an
     die Kante. Was die Spalte überhaupt zeigt, sagt weiter die
     Sprechblase. */
  const axis=[];
  const mark=v=>{
    const x=pos(v), off=x<6?'0':(x>94?'-100%':'-50%');
    axis.push(`<span class="tax" style="left:${x}%;transform:translateX(${off})">${gnum(v)}</span>`);
  };
  for(let v=Math.ceil(sc.lo/step)*step; v<=sc.hi; v+=step){
    /* Die Null hat schon ihre eigene, kräftigere Linie. */
    if(!sc.cut&&Math.abs(v)<step/2) continue;
    grid.push(`<span class="tgrid" style="left:${pos(v)}%"></span>`);
    mark(v);
  }
  /* Die Null ist auch eine Linie und bekommt ihre Zahl — bei
     beschnittener Achse gibt es sie nicht, dann fällt sie weg. */
  if(!sc.cut) mark(0);
  /* Das Raster liegt in der **Zelle**, nicht im Balken: nur so
     reicht es über die ganze Zeilenhöhe, und weil die Zeilen
     aneinandergrenzen, werden aus zwölf kurzen Strichen zwölf
     durchgehende Linien. Im Balken hörten sie nach 22 px auf und
     die Tabelle zerfiel in Streifen. */
  const rails=grid.join('')+(sc.cut?'':`<span class="tzero" style="left:${zc}%"></span>`);

  /* ── Wie schmal die Spalte werden darf ───────────────────────
     Die Untergrenze gilt dem einzelnen **Rasterfeld**: der Abstand
     von einer Linie zur nächsten soll so breit sein wie die
     Monatsspalte daneben. Zwei Linien im Abstand von 40 px sind
     kein Maß mehr, an dem sich etwas ablesen ließe.

     Wie viele Felder die Achse hat, weiß nur diese Rechnung — die
     Spanne geteilt durch die Schrittweite. Die Zahl geht als
     `--flowcells` an die Tabelle, die Breite selbst steht als
     `--progleadw` in css/ledger.css. Reicht das Fenster nicht,
     scrollt die Tabelle waagerecht; die Monatsspalte bleibt
     stehen. */
  const cells=Math.max(1,sc.span/step);

  /* Steht in einer Spalte in **jeder** Zeile nur ein Strich, ist
     sie so schmal wie ihre Überschrift — und rechtsbündig klebten
     die Striche dann an der Kante und läsen sich wie ein Teil der
     Nachbarspalte. Dann stehen sie mittig. Betrifft in der Praxis
     die Korrektur: die meisten Bücher brauchen sie nie. */
  const corEmpty=MONTHS.every((_,i)=>!balanceFix(i+1));

  /* Die Kumulation fängt beim Anfangsbestand an — dem Kontostand
     vor dem Januar (opening() in js/state.js). Ohne einen ist es
     die Null wie bisher. Dieselbe Zahl steht als erster Wert im
     Verlauf daneben (yearFlow), beide dürfen nicht auseinander-
     laufen. */
  let cum=opening();

  /* ── Die Zeile über dem Januar ──────────────────────────────
     Der Anfangsbestand bekommt eine **eigene Zeile**, so wie die
     Monatseröffnung im Zeitstrahl der Monatsansicht eine eigene
     Zeile ist: er ist keine Bewegung eines Monats, sondern der
     Stand, auf dem das Jahr aufsetzt. Im Januarbalken sähe er aus
     wie etwas, das der Januar bewegt hätte.

     Zahlen stehen darin nur zwei: der Name und derselbe Betrag in
     „Kumuliert" — die Spalten dazwischen beschreiben Bewegungen,
     und die gibt es hier nicht.

     **Sein Balken wird abgeschnitten, sobald er länger ist als ein
     Rasterschritt.** Bei 120.000 auf einem Raster von 2.000 wären
     es sechzig Schritte: ein Balken, der die ganze Zeile füllt und
     nichts mehr aussagt. Gezeigt wird dann der letzte Schritt vor
     dem Stand, und der franst zum Rand hin aus — dieselbe Aussage
     wie beim beschnittenen Balken der Monatsansicht („er kommt von
     weiter außerhalb") und dasselbe Mittel: ein Farbverlauf ins
     Durchsichtige, keine Kante. Ausgefranst wird an der Seite, aus
     der er kommt: bei einem Guthaben links, bei einem Minus
     rechts. */
  const openRow=(()=>{
    const op=opening(); if(!op) return '';
    const long=Math.abs(op)>step;
    const from=long?(op>0?op-step:op+step):0;
    const a=pos(from), b=pos(op);
    const l=Math.max(0,Math.min(100,Math.min(a,b))), r=Math.max(0,Math.min(100,Math.max(a,b)));
    const fade=(long||sc.cut)?(op>0?' cutl':' cutr'):'';
    /* Die Zeile ist so hoch wie jede andere (`two`), und ihr Balken
       steht darin mittig (`solo`) — eine flachere erste Zeile sähe
       aus wie ein halber Monat. Am Ende derselbe schwarze Strich
       wie in den Monatszeilen: er markiert überall den Stand, mit
       dem die Zeile schließt. */
    return `<tr class="openrow"><td>${t('set.opening')}</td>
      <td class="num"></td><td class="num"></td><td class="num"></td>
      <td class="num balcol${corEmpty?' mid':''}"></td><td class="num"></td>
      <td class="num ${cls(op)}">${eur(op)}</td>
      <td class="flowcell">${rails}<span class="ttrack ytrack two"
        ><span class="tsum yopen solo${fade}" style="left:${l}%;width:${r-l}%"></span
        ><span class="tmark" style="left:${Math.max(0,Math.min(100,pos(op)))}%"></span></span></td></tr>`;
  })();

  const rows=MONTHS.map((name,i)=>{
    const m=i+1,s=saldo(m);
    cum+=s;
    /* Blass werden nur die Zahlenspalten (siehe css/ledger.css):
       der Verlauf behält seine Farbe. Er ist eine Kurve über das
       ganze Jahr — ein Stück davon auszubleichen unterbräche sie
       genau dort, wo man sie am ehesten liest. */
    return `<tr${m<CUR?' class="past"':(m===CUR?' class="now"':'')}>
      <td>${name}</td>
      <td class="num pos">${eur(income(m))}</td>
      <td class="num neg">${eur(fixedCost(m))}</td>
      <td class="num neg">${eur(kakeiboFor(m))}</td>
      <td class="num balcol${corEmpty?' mid':''} ${cls(balanceFix(m))}">${eur(balanceFix(m))}</td>
      <td class="num ${cls(s)}">${eur(s)}</td>
      <td class="num ${cls(cum)}">${eur(cum)}</td>
      <td class="flowcell">${rails}${yearTrack(flow[i],pos,sc.cut)}</td></tr>`;
  }).join('');

  /* Die Farberklärung gehört unter die Tabelle: an einem Anteil
     steht nur sein Betrag, die Geldart sagt allein die Farbe. Bei
     beschnittener Achse kommt ihr Maßstab dazu — sonst läse man
     die Länge des Januarbalkens als seinen ganzen Betrag. */
  const chips=FLOW_KINDS.map(k=>`<span class="lk"><i class="b-${k}"></i>${t(FLOW_LABEL[k])}</span>`).join('')
    +`<span class="lk"><i class="lmark"></i>${t('month.tlMark')}</span>`
    +(sc.cut?`<span class="lscale">${t('month.tlScale',eur(sc.lo),eur(sc.hi))}</span>`:'');

  /* Kennzahlen: was ab dem laufenden Monat noch kommt, und die
     beiden Salden — Stand heute und Stand zum Jahresende. */
  const from=MONTHS[CUR-1];
  let incRest=0,fixRest=0,openRest=0,kakRest=0,soFar=opening();
  for(let m=CUR;m<=12;m++){ incRest+=income(m); fixRest+=fixedCost(m); openRest+=openCost(m); kakRest+=kakeiboFor(m); }
  /* „Saldo bisher" ist der Kontostand von heute, also dieselbe Zahl
     wie „Kumuliert" in der Zeile vor dem laufenden Monat — deshalb
     auch hier der Anfangsbestand als Startwert. */
  for(let m=1;m<CUR;m++) soFar+=saldo(m);
  const yearEnd=cum;

  /* Die Kennzahlen bleiben beim Scrollen stehen: die Tabelle
     darunter ist lang, und sie sind die Zusammenfassung dazu.

     Gesetzt wie die Auswertung der Monatsansicht — eine dünne
     Zeile, Beschriftung und Wert nebeneinander statt untereinander,
     die Überschrift klein darüber. Zwei Ansichten, die dasselbe
     tun, sollen auch gleich aussehen; die alte, hohe Fassung nahm
     der Tabelle Platz weg, den sie hier braucht.

     Was früher als dritte Zeile im Kästchen stand, hängt jetzt als
     Sprechblase daran: in einer dünnen Zeile ist dafür kein Raum,
     verloren gehen soll es trotzdem nicht. */
  const cell=(c,lab,val,vc,tip)=>`<span class="anak${c?' '+c:''}"${tip?` data-tip="${esc(tip)}"`:''}
      ><span class="lab">${lab}</span><span class="val ${vc}">${eur(val)}</span></span>`;
  return `
  <div class="stickybar anabar">
    <div class="anahead">
      <span class="analab">${t('prog.kpiLab',YEAR)}</span>
      <span class="anarow">
        ${cell('t-in',t('prog.kpiIncome',from),incRest,'pos')}
        ${cell('t-out',t('prog.kpiFixed',from),fixRest,'neg',t('prog.kpiOpen',eur(openRest)))}
        ${cell('t-flex',t('prog.kpiKak',from),kakRest,'neg',t('prog.kpiPerMonth',eur(planSum(CUR))))}
        ${cell('',t('prog.kpiSoFar'),soFar,cls(soFar),CUR>1?t('prog.kpiSoFarSub',MONTHS[CUR-2]):t('prog.kpiSoFarNone'))}
        ${cell('',t('prog.kpiEnd'),yearEnd,cls(yearEnd),t('prog.kpiEndSub',YEAR))}
      </span>
    </div>
  </div>
  <!-- Eine Spalte, nicht zwei: die Tabelle bekommt die volle
       Breite, damit der Verlauf auch auf einem 13"-Bildschirm
       eine Aussage ist und nicht ein Strich. Die Annahmen der
       Flexible Payments standen früher rechts daneben; sie stehen
       jetzt dort, wo sie gepflegt werden — im Fenster der
       Kategorie, mit dem Mittelwert über der Schnelleingabe. -->
  <div class="card"><h2>${t('prog.title',YEAR)}</h2>
    <div class="scroll" style="border:0"><table class="ledger progtable"
      style="--flowcells:${cells.toFixed(3)}">
      <tr>${PROG_COLS.map(c=>`<th class="${c.cls}${c.ab==='COR'&&corEmpty?' mid':''}"
        data-tip="${esc(t(c.name)+' — '+t(c.tip))}">${c.ab}</th>`).join('')}
        <th class="flowcell axishead"
          data-tip="${esc(t('prog.colFlow')+' — '+t('prog.colFlowTip'))}">${axis.join('')}</th></tr>
      ${openRow}${rows}</table></div>
    <div class="thint">${chips}</div>
    <p class="note" style="margin-top:10px">${t('prog.greyed',MONTHS_LONG[CUR-1])}</p></div>`;
}
