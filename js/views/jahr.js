/* ══════════════════════════════════════════════════════════════
   FINA — Ansicht „Jahr"
   Die Jahresmatrix: links die Position, dann je Monat zwei Zellen
   (Betrag und Haken), rechts die Jahressumme.
   ══════════════════════════════════════════════════════════════ */

/* Vollständig abgehakte Monate werden eingeklappt — aber nur,
   wenn der Nutzer den Knopf dafür gedrückt hat. Die Vorgabe ist
   das ganze Jahr; der Schalter steht in der Datei
   (state.hideDoneMonths, siehe js/state.js). */
function visMonths(){
  if(!state||!state.hideDoneMonths) return MONTHS.map((_,i)=>i+1);
  const open=MONTHS.map((_,i)=>i+1).filter(m=>!monthDone(m));
  return open.length?open:MONTHS.map((_,i)=>i+1);
}

/* Der sichtbar davorliegende Monat. Seine graue Trennlinie wird
   entfernt, damit die rote Markierung des laufenden Monats links
   und rechts gleich aussieht. */
function preCurMonth(){
  const V=visMonths(), i=V.indexOf(CUR);
  return i>0?V[i-1]:0;
}

/* Klassen für die beiden Zellen eines Monats. */
const cmAmt=m=>(m===CUR?' cm-l':'');
const cmMark=m=>(m===CUR?' cm-r':'')+(m===preCurMonth()?' cm-pre':'');

const COLS=()=>`<colgroup><col class="c-ed"><col class="c-ln"><col class="c-nt"><col class="c-lab"><col class="c-b"><col class="c-z"><col class="c-f"><col class="c-e">${
  visMonths().map(()=>'<col class="c-m"><col class="c-mk">').join('')}<col class="c-t"></colgroup>`;

/* Die vier schmalen Spalten heißen B (bank), PT (payment type),
   DD (due date) und LP (last payment) — in beiden Sprachen
   gleich, wie „Fast Budget" auch. Die Klassen cB/cZ/cF/cE
   behalten ihre alten Namen: sie stehen in css/matrix.css an
   einem guten Dutzend Stellen und sagen nur, welche Spalte
   gemeint ist. */
/* `extra` ist die Saldozeile: sie steht **im Kopf**, nicht im
   Rumpf. Sie gehört zum Gerüst wie die Spaltennamen — sie hat keine
   Zeilen unter sich, kein Filter nimmt sie weg, und man liest jede
   andere Zeile gegen sie. Im Kopf klebt sie außerdem von selbst
   unter den Spaltennamen: `position:sticky` hält nur innerhalb
   desselben Elternteils, und eine Zeile im Rumpf hörte am Ende
   ihres `tbody` auf zu kleben. */
function matrixHead(extra){
  return `<thead><tr><th class="ed"></th><th class="ln"></th><th class="nt"></th><th class="lab">${t('g.position')}</th>
    <th class="code cB"><button class="codehead" data-lists="1" title="${t('year.bankTip')}">B</button></th>
    <th class="code cZ"><button class="codehead" data-lists="1" title="${t('year.payTip')}">PT</button></th>
    <th class="code cF" title="${t('year.dueTip')}">DD</th>
    <th class="code cE" title="${t('year.endTip')}">${t('year.end')}</th>
    ${visMonths().map(m=>{const done=monthDone(m);
      return `<th class="${cmAmt(m).trim()}"><button class="mhead${done?' done':''}" data-goto="${m}"
        title="${done?t('year.monthDone'):''}${t('year.monthTip',MONTHS_LONG[m-1])}">${MONTHS[m-1]}</button></th>
      <th class="mkh${cmMark(m)}"></th>`;}).join('')}
    <th class="toth">${t('g.total')}</th></tr>${extra||''}</thead>`;
}

/* Der Pfeil, der einen Block der Matrix zu- und aufklappt. Er steht
   in der ersten Spalte der Blockzeile — dort, wo bei einer Position
   der Stift sitzt —, in der Farbe des Blocks und ohne Wort.
   Zugeklappt bleibt die Blockzeile mit ihren zwölf Summen stehen;
   was darunter hing, wird gar nicht erst gebaut.

   Wie in der Monatsansicht gibt es ihn nicht, solange gefiltert
   wird: dann steht jeder Block offen, und ein Pfeil dagegen hielte
   nicht, was er verspricht (siehe foldBtn in js/views/monat.js). */
function yfoldBtn(key,on){
  const lab=on?t('year.maxAreaTip'):t('year.minAreaTip');
  return `<button class="foldarrow" data-yfold="${key}" aria-expanded="${!on}"
    aria-label="${esc(lab)}" title="${esc(lab)}">${on?'&#9654;':'&#9660;'}</button>`;
}

/* Eine Matrixzeile. opt.item = regelmäßiger Posten, opt.kak =
   Kakeibo-Kategorie, ohne beides eine Summen- oder Gruppenzeile.
   Nur echte Positionen — Posten wie Kakeibo — bekommen .itemrow
   und damit farbige Beträge; Kategorie- und Summenzeilen bleiben
   schwarz (siehe matrix.css).

   opt.asCat verbindet beides: die Zeile hat einen Posten mit
   Stift, Lampe und Haken, wird aber wie eine Kategorie gezeigt.
   Das braucht genau die Saldokorrektur. */
function mrow(label,vals,opt={}){
  const it=opt.item||null, kk=opt.kak||null;
  const sum=vals.reduce((a,b)=>a+b,0);
  const edit=it?`data-edit="${it.id}"`:(kk?`data-kedit="${esc(kk)}"`:'');
  const pencil=edit?`<button class="pencil" ${edit} title="${opt.editTip||t('year.editTip')}">&#9998;</button>`:'';
  /* Der Beleglink — Posten wie Flexible Payments haben einen. */
  const url=it?it.url:(kk&&state.kak[kk]?state.kak[kk].url:'');
  const link=url?`<a class="linkicon" href="${esc(url)}" target="_blank" rel="noopener" title="${t('year.linkTip')}">${LINK_SVG}</a>`:'';
  /* Geschätzt gilt je Monat und nur, solange nicht abgehakt: ein
     bezahlter Betrag ist bestätigt und wird nach Vorzeichen
     eingefärbt, nicht mehr gelb. */
  const estAt=m=>it?(estOf(it)&&!paidAt(it,m))
    :(kk?(state.kak[kk].estimated&&!kakDone(kk,m)):false);
  const estTot=vals.some((v,i)=>v!==0&&estAt(i+1));
  const mark=m=>{
    let sym='';
    /* Die Saldokorrektur wird nicht abgehakt: ihr Betrag ist die
       Korrektur selbst, da ist nichts zu bestätigen. Die Zelle
       behält nur ihre Notizlampe. */
    if(isBalanceItem(it)) sym='';
    else if(it) sym=it.amounts[m-1]===0?'':(paidAt(it,m)?'<span class="mk-ok">&#10003;</span>':(estOf(it)?'<span class="mk-q">?</span>':''));
    /* Wie beim Posten: wo kein Betrag steht, steht auch kein
       Fragezeichen — sonst wäre eine noch leere Kategorie eine
       Reihe aus zwölf Fragezeichen. */
    else if(kk) sym=kakDone(kk,m)?'<span class="mk-ok">&#10003;</span>'
      :((state.kak[kk].estimated&&vals[m-1]!==0)?'<span class="mk-q">?</span>':'');
    else return '';
    const lamp=it?lampHtml('item',it.id,m):lampHtml('kak',kk,m);
    return `<span class="mkcell"><span class="mksym">${sym}</span>${lamp}</span>`;
  };
  const bank=it?it.bank:'', pay=it?it.pay:'';
  /* Nichts steht mehr aus: die ganze Zeile tritt grau zurück und
     die Ampel in „Ende" entfällt — es ist nichts mehr zu planen.
     Kategoriezeilen (opt.asCat) bleiben davon unberührt: sie
     tragen ihre Blockfarbe. */
  const settled=!opt.asCat&&yearSettled(it);
  const done=settled?' settled':'';
  const posLamp=it?lampPos('item',it.id):(kk?lampPos('kak',kk):'');
  /* Die ersten Zeilen der Notiz stehen klein unter dem Namen. */
  const notePrev=it?notePreview('item',it.id):(kk?notePreview('kak',kk):'');
  /* Doppelklick auf Betrag oder Bezeichnung öffnet dieselbe
     Position wie der Stift links (siehe dblItem in js/ui.js).
     Zeilen ohne Posten — Summen, Gruppen — bekommen das Merkmal
     nicht. */
  const dbl=it?dblItem(it.id):(kk?dblKak(kk):'');
  /* Blockzeilen klappen ihren Block zu: der Pfeil steht in der
     Stiftspalte — eine Blockzeile hat dort nichts —, und ein
     Doppelklick auf die Zeile tut dasselbe. Beides gibt es nur,
     wenn opt.fold gesetzt ist; beim Filtern lässt viewJahr() es
     weg. */
  const fold=opt.fold||null;
  const arrow=fold?yfoldBtn(fold.key,fold.on):'';
  const dblFold=fold?` data-dblyfold="${esc(fold.key)}"`:'';
  return `<tr class="${opt.cls||''}${((it||kk)&&!opt.asCat)?' itemrow':''}${done}"${dbl}${dblFold}><td class="ed">${arrow||pencil}</td><td class="ln">${link}</td>
    <td class="nt">${posLamp}</td><td class="lab">${label}${notePrev}</td>
    <td class="code cB"${bank?` title="${esc(bankLabel(bank))}"`:''}>${esc(bank)}</td>
    <td class="code cZ"${pay?` title="${esc(payLabel(pay))}"`:''}>${esc(pay)}</td>
    <td class="code cF"${it&&it.dueDay?` title="${esc(DUE_LABEL(it.dueDay))}"`:''}>${it?esc(DUE_SHORT(it.dueDay)):''}</td>
    <td class="code cE ${it&&!settled?endClass(it):''}"${it&&it.end?` title="${esc(endHint(it))}"`:''}>${esc(endShort(it))}</td>
    ${visMonths().map(m=>`<td class="num ${estAt(m)&&vals[m-1]!==0?'est':cls(vals[m-1])}${cmAmt(m)}">${eur(vals[m-1])}</td>
      <td class="mk${cmMark(m)}">${mark(m)}</td>`).join('')}
    <td class="num tot ${estTot?'est':cls(sum)}">${eur(sum)}</td></tr>`;
}

/* Die Leerzeile zwischen zwei Blöcken. Sie trägt **keine Marke des
   laufenden Monats**: die grauen Trennlinien der Monate setzen hier
   aus, und die beiden roten Linien sollen es genauso tun — sonst
   liefe der laufende Monat als einzige Spalte durch die Lücke
   hindurch. Sichtbar wurde das beim Scrollen: die Blockzeilen
   kleben oben und wandern über die Lücke, die roten Stücke blieben
   darin stehen, wo längst keine Zeile mehr ist. */
const spacer=()=>`<tr class="spacer">${'<td></td>'.repeat(8)}${visMonths().map(()=>
  `<td></td><td></td>`).join('')}<td class="tot"></td></tr>`;

function viewJahr(){
  /* „Abgeschlossene ausblenden" versteckt nur Zeilen, in denen
     nichts mehr aussteht. Die Summen bleiben davon unberührt.

     Dazu das Suchfeld: dasselbe wie in der Monatsansicht, nur über
     alle zwölf Monate. Es gilt für **jede** Zeile — auch für den
     Saldo, die Saldokorrektur und die drei Blockzeilen; sonst
     stünde nach einer Suche immer noch das halbe Gerüst da.

     Trifft der Suchbegriff einen Namen, unter dem etwas hängt —
     einen Block wie „Regelmäßige Kosten" oder eine Kategorie wie
     „WOHNEN" —, gilt der Treffer für alles darunter: man sucht die
     Kategorie, um sie ganz zu sehen, nicht um sie leer zu finden.
     Die Kategorie eines Posten steckt ohnehin in seinem
     Vergleichsstoff (hayItem in js/calc.js); hier kommen die
     Blocknamen dazu, die in keiner Zeile stehen. */
  const q=queryQ();
  /* Block- und Kategorienamen sind der Zeile ihre Kategorie —
     sie hängen deshalb am selben Kästchen wie Bank, Zahlungsart
     und Fälligkeit (qField('meta'), siehe js/calc.js). Wer die
     Kürzel abwählt, sucht auch nicht mehr über die Gliederung. */
  const hit=s=>!q||(qField('meta')&&norm(s).includes(q));
  const qOk=it=>!q||hayItem(it).includes(q);
  /* Der Haken „auch in den ausgeblendeten Positionen" (qAll() in
     js/state.js): mit ihm gewinnt der Suchbegriff gegen alles, was
     sonst eine Zeile wegnimmt — „Abgeschlossene ausblenden" und
     die Regel, dass eine Position ohne jeden Betrag nicht in der
     Matrix steht. Ohne Suchbegriff ändert er nichts. */
  const wide=!!q&&qAll();
  const base=it=>wide||(it.amounts.some(v=>v!==0)&&!(state.hideSettled&&yearSettled(it)));
  /* Die Zahl hinter „Abgeschlossene ausblenden" zählt nur, was
     dieser Knopf versteckt — nicht, was der Suchbegriff wegnimmt. */
  let hiddenRows=0;
  const countHidden=arr=>{hiddenRows+=arr.filter(it=>it.amounts.some(v=>v!==0)&&state.hideSettled&&yearSettled(it)).length;};

  /* ── Wann ein Block zugeklappt ist ───────────────────────────
     Wie in der Monatsansicht: gewöhnlich sagt es die Datei
     (state.foldedYear, eine eigene Liste neben der des Monats).
     **Solange gefiltert wird, steht alles offen** — und lässt sich
     auch nicht zuklappen: der Pfeil entfällt, der Doppelklick
     ebenso. Wer sucht, soll den Treffer sehen und nicht daran
     denken müssen, in welchem zugeklappten Block er steckt.

     Gemeint sind die Filter, die Zeilen wegnehmen: das Suchfeld und
     „Abgeschlossene ausblenden". „Erledigte Monate ausblenden"
     nimmt Spalten weg — in einem Block verbirgt sich dadurch
     nichts, dieser Knopf klappt also nichts auf. */
  const filterOn=!!q||!!state.hideSettled;
  const foldOf=k=>filterOn?false:isFoldedYear(k);
  const fIn=foldOf('in'), fFlex=foldOf('flex'), fOut=foldOf('out');
  /* Die Blockzeile bekommt ihren Pfeil nur, wenn geklappt werden
     darf; sonst steht ihre erste Spalte leer wie bisher. */
  const foldOpt=(k,on)=>filterOn?{}:{fold:{key:k,on}};

  /* Je Block ein Stück; die Leerzeilen kommen erst am Ende
     dazwischen — ein weggefilterter Block hinterlässt sonst eine
     doppelte Lücke. */
  const parts=[];

  /* Der Saldo je Monat bleibt beim Scrollen unter den Spalten-
     köpfen stehen (.balpin in css/matrix.css) — er fasst zusammen,
     was darunter Zeile für Zeile aufgeschlüsselt wird. Gebaut wird
     er hier, eingehängt wird er in den **Kopf** (matrixHead).

     Ihn nimmt der Suchbegriff **nicht** weg. Er gehört zum Gerüst
     wie die Spaltenköpfe, nicht zum Inhalt: er hat keine Zeilen
     unter sich, die man suchen könnte, und er ist die Zeile,
     gegen die man alles andere liest. Verschwände er beim
     Filtern, verlöre die Tabelle beim Scrollen genau die Zeile,
     für die das Kleben gebaut ist — und der Suchbegriff müsste
     zufällig in „Saldo je Monat" vorkommen, damit sie bleibt. */
  const balRow=mrow(t('year.balanceRow'),MONTHS.map((_,i)=>saldo(i+1)),{cls:'sec r-sal balpin'});

  /* Die Saldokorrektur steht über den Einnahmen: eine einzige
     Zeile, wie eine Kategorie gezeigt, aber über den Stift wie
     jeder Posten zu pflegen. */
  if(qOk(state.balance)||hit(t('bal.row')))
    parts.push(mrow(`<span data-tip="${esc(t('bal.tip'))}">${t('bal.row')}</span>`,
      state.balance.amounts,{item:state.balance,asCat:true,cls:'sec r-bal',editTip:t('bal.editTip')}));

  const inc=state.fixed.filter(isIncome); countHidden(inc);
  const secIn=hit(t('g.income'));
  /* Einnahmen stehen nach Kategorie gebündelt wie die Kosten —
     seit es mehr als eine geben kann. Bei genau einer entfällt die
     Zwischenzeile: sie stünde über allem und sagte nichts. */
  let incRows='';
  const incMany=incomeGroups().filter(g=>inc.some(it=>it.group===g)).length>1;
  incomeGroups().forEach(g=>{
    const items=inc.filter(it=>it.group===g);
    if(!items.length) return;
    /* Trifft der Name der Kategorie, steht sie mit allem darunter
       da — genau wie im Kostenblock. */
    const gHit=secIn||hit(keyLabel(g));
    const vis=settledLast(items).filter(it=>base(it)&&(gHit||qOk(it)));
    if(!vis.length) return;
    if(incMany) incRows+=mrow(esc(keyLabel(g)),MONTHS.map((_,i)=>items.reduce((s,it)=>s+it.amounts[i],0)),{cls:'grp r-in'});
    vis.forEach(it=>{incRows+=mrow(esc(it.name),it.amounts,{item:it,cls:'r-in'});});
  });
  if(incRows||secIn)
    parts.push(mrow(t('g.income'),MONTHS.map((_,i)=>income(i+1)),
      {cls:'sec r-in secpin',...foldOpt('in',fIn)})+(fIn?'':incRows));

  /* Alle Flexible Payments stehen hier, auch die noch leeren —
     eine Kategorie ohne Zahlen ist genau die, an die man denken
     soll. Über den Stift bekommt sie ihre Monatswerte. */
  const secFlex=hit(t('year.kakRow'));
  const kakRows=kakCats().filter(k=>state.kak[k]&&(secFlex||!q||hayKak(k).includes(q)))
    .map(k=>mrow(esc(keyLabel(k)),MONTHS.map((_,i)=>kakVal(k,i+1)),{kak:k,cls:'r-flex'})).join('');
  /* Nur der Name des Blocks. Der Hinweis auf den Import stand
     früher klein darunter — er erklärt aber nicht die Zeile,
     sondern eine Funktion, und dafür gibt es die Anleitung. */
  if(kakRows||secFlex)
    parts.push(mrow(t('year.kakRow'),MONTHS.map((_,i)=>kakeiboFor(i+1)),
      {cls:'sec r-flex secpin',...foldOpt('flex',fFlex)})+(fFlex?'':kakRows));

  const secOut=hit(t('g.fixed'));
  let outRows='';
  costGroups().forEach(g=>{
    const items=state.fixed.filter(it=>it.group===g);
    if(!items.length) return;
    countHidden(items);
    /* Trifft der Name der Kategorie, steht sie mit allem darunter
       da — auch mit den Posten, die für sich genommen nicht
       passen. */
    const gHit=secOut||hit(keyLabel(g));
    const vis=settledLast(items).filter(it=>base(it)&&(gHit||qOk(it)));
    if(!vis.length) return;
    outRows+=mrow(esc(keyLabel(g)),MONTHS.map((_,i)=>items.reduce((s,it)=>s+it.amounts[i],0)),{cls:'grp r-out'});
    vis.forEach(it=>{outRows+=mrow(esc(it.name),it.amounts,{item:it,cls:'r-out'});});
  });
  if(outRows||secOut)
    parts.push(mrow(t('g.fixed'),MONTHS.map((_,i)=>fixedCost(i+1)),
      {cls:'sec r-out secpin',...foldOpt('out',fOut)})+(fOut?'':outRows));

  /* Je Block ein eigener `tbody` — eine Gliederung, die man liest,
     wenn man die Tabelle einmal von Hand durchgeht, und die Stelle,
     an der die Leerzeile zwischen zwei Blöcken hängt.

     Fürs Kleben der Blockzeilen tut er nichts: `position:sticky` an
     einer Tabellenzeile wird vom `tbody` nicht begrenzt. Welche der
     drei Zeilen oben zu sehen ist, entscheidet die Stapelfolge in
     css/matrix.css. */
  const body=parts.map((p,i)=>`<tbody>${i?spacer():''}${p}</tbody>`).join('');

  const V=visMonths(), hidden=12-V.length;
  /* Die Leiste fängt links mit dem Filter an und führt gleich die
     beiden Knöpfe mit, die ebenfalls filtern: alle drei tun
     dasselbe, nämlich weniger zeigen. Rechts steht, was etwas
     anlegt. Die Knöpfe behalten ihre Beschriftung und sagen über
     den dunklen Grund, ob sie gerade gelten — wie die Filter der
     Monatsansicht. Was die Zeichen ✓ und ? bedeuten, steht auf
     Höhe der Reiter (siehe renderChrome in js/app.js). */
  return `<div class="sechead yearbar stickybar" id="yearBar">
      <span class="fbgroup">
        ${filterField('fltyear')}
        <button class="btn small" id="btnFold" aria-pressed="${!!state.hideDoneMonths}"
          data-tip="${esc(t('year.hideDoneTip'))}">${t('year.hideDone')}${hidden?` (${hidden})`:''}</button>
        <button class="btn small" id="btnHideSettled" aria-pressed="${!!state.hideSettled}"
          data-tip="${esc(t('year.hideSettledTip'))}">${t('year.hideSettled')}${hiddenRows?` (${hiddenRows})`:''}</button>
      </span>
      <span class="fbgroup">
        <button class="btn small" data-newkak="1">${t('year.addKak')}</button>
        <button class="btn small" data-newitem="1">${t('year.addItem')}</button></span>
      <!-- Der waagerechte Rollbalken der Matrix, außerhalb der
           Tabelle: in ihr säße er quer über der letzten Zeile, und
           die steht bei zweihundert Positionen weit unterhalb des
           Bildschirms. Hier klebt er mit der Leiste unter der
           Kopfzeile und ist immer zu greifen. -->
      ${scrollRail('yearScroll')}</div>
    <!-- Unter der Tabelle steht nichts mehr. Der lange Hinweis, der
         hier stand — Stift und Doppelklick, die Kürzel B · PT · DD ·
         LP, die Ampel der Restlaufzeit, der graue Grund, der
         durchgestrichene Monat, der laufende Monat —, erklärte die
         Ansicht ein zweites Mal: jede dieser Angaben trägt ihre
         eigene Sprechblase, und die Anleitung sagt es ausführlich.
         Am Ende einer Tabelle, die man ohnehin scrollt, las ihn
         niemand. Die Texte stehen weiter in js/i18n.js (year.hint …
         year.current) — sie gehören zur Anleitung. -->
    <!-- Der Rahmen schneidet den waagerechten Rollbalken ab: die
         Fläche darin ist genau um seine Höhe höher als er zeigt
         (sizeMatrix in js/app.js). Gerollt wird dadurch weiter vom
         Browser selbst — nur den Balken sieht man nicht, den gibt
         es oben in der Leiste. -->
    <div class="yearpane"><div class="scroll yearscroll" id="yearScroll" style="--labw:${state.labWidth}px;--monw:${state.monWidth}px"><table class="matrix" style="width:calc(392px + var(--labw) + ${V.length} * (var(--monw) + 46px))">${COLS()}${matrixHead(balRow)}${body}</table></div></div>`;
}
