/* ══════════════════════════════════════════════════════════════
   FINA — Gemeinsame Oberflächenteile
   Kurzmeldung, Fensterschließen und die Notizlampe, die in jeder
   Ansicht und in jedem Fenster vorkommt.
   ══════════════════════════════════════════════════════════════ */

/* Kurzmeldung am unteren Rand. */
function toast(msg){
  const el=document.createElement('div');el.className='toast';el.textContent=msg;
  document.body.appendChild(el);setTimeout(()=>el.remove(),4600);
}

/* Escape schließt immer das oberste Fenster. Fenster, die beim
   Schließen aufräumen müssen, legen ihren eigenen Weg in
   box._close ab (siehe js/dialogs/settings.js).

   **Der Tastendruck ist damit verbraucht** (preventDefault): hinter
   diesem Handler hängt der in js/app.js, der Escape sonst als
   „Filter zurücknehmen" versteht. Er läuft, weil dieser hier am
   Dokument hängt und jener am Fenster — und er sähe das Fenster
   nicht mehr, es ist an dieser Stelle schon weg. Ein Escape würde
   sonst zweierlei tun: das Fenster schließen und nebenbei den
   Filter leeren, hinter dem die halbe Liste steht. */
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  const all=[...document.querySelectorAll('.modal')];
  if(!all.length) return;
  const top=all[all.length-1];
  e.preventDefault();
  (top._close||closeModal)(top);
});

/* Schließt ein Fenster, ohne dass die Seite nach oben springt. */
function closeModal(box){
  const sx=window.scrollX, sy=window.scrollY;
  const ys=document.getElementById('yearScroll');
  const yTop=ys?ys.scrollTop:null, yLeft=ys?ys.scrollLeft:null;
  box.remove();
  window.scrollTo(sx,sy);
  if(ys&&yTop!=null){ ys.scrollTop=yTop; ys.scrollLeft=yLeft; }
}

/* ── Die Rollleiste über einer Tabelle ────────────────────────
   Eine breite Tabelle scrollt waagerecht, und ihr Rollbalken sitzt
   von Haus aus **in** ihr: am unteren Rand des Rollrahmens, also
   quer über der letzten Zeile — und bei der Jahresmatrix erst nach
   Hunderten von Zeilen, weil die Tabelle in voller Länge im
   Dokument steht. Ein Balken, den man erst suchen muss, ist keiner.

   Deshalb steht er außerhalb: `scrollRail(id)` liefert ein eigenes
   Element, das über der Tabelle sitzt und sie führt. Innen liegt
   ein Streifen von genau der Breite der Tabelle — dadurch hat der
   Balken dieselbe Länge und dasselbe Verhältnis wie der, den die
   Tabelle selbst hätte. Die Prognose verbirgt ihren eigenen
   (css/layout.css), der Jahresmatrix wird er abgeschnitten
   (.yearpane in css/matrix.css) — gerollt wird in beiden Fällen
   weiter vom Browser selbst.

   Wo die Leiste steht, entscheidet die Ansicht: in der Jahresmatrix
   in der Knopfleiste, die ohnehin oben klebt — damit steht sie auch
   nach tausend Zeilen noch im Bild und wird von syncMatrixHead()
   von selbst mitgemessen. In der Prognose steht sie in der Karte
   direkt über der Tabelle.

   Beide Richtungen werden verdrahtet. Nach einem Zug an der Leiste
   wird sie 180 ms lang **nicht** nachgeführt: eine Tabelle, die
   noch ausrollt, zöge ihr sonst den Griff unter dem Finger weg.
   Danach schon, sonst stünde er nach dem Loslassen am falschen
   Platz. Umgekehrt läuft sie einer Tabelle, die per Rad oder Taste
   rollt, ohne Verzug nach.

   Was die Leiste selbst gesetzt bekommt, gibt sie nicht weiter
   (`<1`): sonst schöbe jede Nachführung die Tabelle erneut an. */
const scrollRail=id=>`<div class="scrollrail" data-rail="${id}" aria-hidden="true"><div></div></div>`;

function bindRails(){
  document.querySelectorAll('.scrollrail[data-rail]').forEach(rail=>{
    const box=document.getElementById(rail.dataset.rail); if(!box) return;
    let led=0, tid=0;
    const pull=()=>{ rail.scrollLeft=box.scrollLeft; };
    rail.addEventListener('scroll',()=>{
      if(Math.abs(rail.scrollLeft-box.scrollLeft)<1) return;
      led=Date.now(); box.scrollLeft=rail.scrollLeft;
    },{passive:true});
    box.addEventListener('scroll',()=>{
      const wait=led+180-Date.now();
      clearTimeout(tid);
      if(wait<=0) pull(); else tid=setTimeout(pull,wait);
    },{passive:true});
    fitRail(rail,box);
  });
}

/* Breite und Sichtbarkeit. Passt die Tabelle ins Fenster, gibt es
   nichts zu rollen — dann steht dort auch keine Leiste, statt einer
   leeren Rille. Nach jedem Zeichnen und bei jeder Größenänderung. */
function fitRail(rail,box){
  box=box||document.getElementById(rail.dataset.rail); if(!box) return;
  rail.classList.toggle('off',box.scrollWidth-box.clientWidth<=1);
  rail.firstElementChild.style.width=box.scrollWidth+'px';
  rail.scrollLeft=box.scrollLeft;
}

function fitRails(){ document.querySelectorAll('.scrollrail[data-rail]').forEach(r=>fitRail(r)); }

/* ── Filterzeile ──────────────────────────────────────────────
   Zwei Bausteine, die Monats- und Jahresansicht sich teilen.

   Ein Filterknopf trägt seinen Wert im data-Attribut, das ihn in
   wire() verdrahtet: `data-filter`, `data-duefilter`. Er zeigt am
   dunklen Grund, dass er angewendet ist, und ein zweiter Klick
   nimmt ihn wieder zurück (siehe wire()). Die Erklärung steht als
   data-tip daran und erscheint ohne Verzögerung.

   Das Suchfeld bekommt seine Sprechblase **nur von der Maus**
   (data-tiphover, siehe showTip weiter unten): der Fokus kehrt
   immer wieder dorthin zurück, und mit ihm stünde die Blase die
   ganze Zeit neben dem Feld, in das man gerade tippt. Beim
   Überfahren erklärt sie einmal, was das Feld tut — und mit
   welcher Taste man es von überall erreicht. */
function fbtn(kind,val,label,tip,cur){
  return `<button class="btn small" data-${kind}="${esc(val)}" aria-pressed="${cur===val}"
    data-tip="${esc(tip)}">${label}</button>`;
}

/* Vor dem Feld steht der Hamburger-Knopf: er öffnet das Fenster,
   in dem gewählt wird, worin der Suchbegriff überhaupt sucht
   (js/dialogs/filter-fields.js). Ist nicht mehr alles gewählt,
   steht er auf dunklem Grund — wie ein angewendeter Filter, denn
   genau das ist er.

   Knopf und Feld stecken zusammen in .fltbox, und die ist so
   breit, wie das Feld allein es war (--leadw): die Filterknöpfe
   dahinter fangen dadurch weiter genau über der
   Bezeichnungsspalte an. */
function filterField(extra){
  /* Dunkel steht der Hamburger, sobald die Suche anders eingestellt
     ist als von Haus aus — weniger Teile einer Zeile **oder** dazu
     die ausgeblendeten Positionen. */
  const custom=QFIELDS.some(k=>!qField(k))||qAll();
  /* Und dahinter der Knopf, der den Filter zurücknimmt: Suchbegriff,
     Zahlungsstand und Fälligkeit auf einmal. Er steht rechts vom
     Feld, weil er das Gegenstück zum Tippen ist, und ist gesperrt,
     solange gar nichts gefiltert wird — ein Knopf, der nichts tut,
     soll auch nicht so aussehen. Die beiden Knöpfe der
     Jahresansicht rührt er nicht an: sie stehen in der Datei und
     sind eine Einstellung, kein Handgriff. */
  /* Der Bereichsfilter zählt mit: das Kreuz nimmt alle vier
     Handgriffe der Zeile zurück, also muss es auch angehen,
     wenn nur er gesetzt ist. In der Jahresansicht gibt es ihn
     nicht — dort steht secFilter auf 'alle' und ändert nichts. */
  const on=!!(ui.q||'').trim()||ui.filter!=='alle'||ui.dueFilter!=='alle'||ui.secFilter!=='alle';
  return `<span class="fltbox${extra?' '+extra:''}">
    <button class="btn small fltmenu" data-qfields="1" aria-pressed="${custom}"
      aria-label="${esc(t('flt.title'))}" data-tip="${esc(t('flt.btnTip'))}">&#9776;</button>
    <input class="fltq" data-q type="search" value="${esc(ui.q||'')}"
      placeholder="${t('g.filter')}" aria-label="${t('g.filter')}"
      data-tip="${esc(t('g.filterTip'))}" data-tiphover="1">
    <button class="btn small fltclear" data-qclear="1"${on?'':' disabled'}
      aria-label="${esc(t('g.clearFilter'))}" data-tip="${esc(t('g.clearFilterTip'))}">&#10005;</button></span>`;
}

/* ── Die Anteile eines Balkens ────────────────────────────────
   Ein Balken zerfällt in die vier Geldarten, jede in ihrer Farbe.
   Die Breiten sind Anteile des Balkens, nicht der Achse — wie
   breit der Balken selbst ist, rechnet die Ansicht.

   In der Sprechblase steht nur der Betrag: welche Geldart ein
   Anteil ist, sagt schon seine Farbe. Der Klick gehört weiter der
   Zeile, in der der Balken steht.

   Beide Grafiken zeichnen damit — der Zeitstrahl eines Monats
   (js/views/monat.js) und der Verlauf über das Jahr in der
   Prognose (js/views/prognose.js). Deshalb steht die Funktion
   hier und nicht in einer der beiden Ansichten: sonst hinge die
   eine unsichtbar an der anderen. */
const FLOW_LABEL={in:'g.income',flex:'g.flex',out:'g.fixed',bal:'bal.row'};
function flowParts(o,total,dir){
  return FLOW_KINDS.map(k=>{
    const v=o[k]; if(!v) return '';
    return `<i class="b-${k}" style="width:${v/total*100}%"
      data-tip="${esc(eur(dir==='up'?v:-v))}"></i>`;
  }).join('');
}

/* ── Das kleine Fenster für eine Bezeichnung ──────────────────
   Die Bezeichnung eines Postens wie einer Flexible-Payments-
   Kategorie steht nicht als Feld zwischen den übrigen Angaben:
   sie benennt die Sache, sie beschreibt sie nicht. Geändert wird
   sie über die Überschrift (.titlebtn), und die öffnet dieses
   Fenster — mit Abbrechen und Übernehmen, damit ein Vertippen
   folgenlos bleibt.

   Der Wert kommt fertig markiert: wer die Bezeichnung ersetzen
   will, tippt einfach los; wer sie ändern will, drückt einmal
   nach rechts. Beides ohne Umweg über die Maus.

   Übernommen wird nur ins offene Fenster, nicht in die Datei —
   geschrieben wird erst mit „Speichern" dort. Deshalb heißt der
   Knopf „Übernehmen" und nicht „Speichern".

   txt trägt die Texte des aufrufenden Fensters: {title, sub, ph}.
   taken(v) sagt, ob der Name schon vergeben ist, und gibt ihn
   zurück — die Prüfung gehört dem Aufrufer, weil nur er weiß, wie
   die Sache gerade heißt und ob ihr Name überhaupt ein Schlüssel
   ist. Bei Posten ist er keiner: zwei dürfen gleich heißen. */
function askName(cur,txt,taken,onOk){
  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box narrow">
    <h3>${txt.title}</h3>
    <p class="subline">${txt.sub}</p>
    <div class="field"><label>${t('item.name')}</label>
      <input id="nmVal" value="${esc(cur||'')}" placeholder="${esc(txt.ph||'')}"></div>
    <p class="errline" id="nmErr" hidden></p>
    <div class="row-end">
      <button class="btn" id="nmCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="nmOk">${t('item.apply')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);

  const inp=box.querySelector('#nmVal'), err=box.querySelector('#nmErr');
  const fail=msg=>{ err.textContent=msg; err.hidden=false; inp.focus(); inp.select(); };
  const ok=()=>{
    const v=inp.value.trim();
    if(!v) return fail(t('g.nameEmpty'));
    const bad=taken?taken(v):'';
    if(bad) return fail(t('set.taken',bad));
    closeModal(box); onOk(v);
  };
  box.querySelector('#nmOk').onclick=ok;
  box.querySelector('#nmCancel').onclick=()=>closeModal(box);
  box.onclick=ev=>{ if(ev.target===box) closeModal(box); };
  /* Enter bestätigt — in einem Fenster mit einem einzigen Feld ist
     das der erwartete Weg. Escape bricht ab, das erledigt oben der
     Zuhörer für jedes oberste Fenster von selbst. */
  inp.onkeydown=ev=>{ if(ev.key==='Enter'){ ev.preventDefault(); ok(); } };
  inp.focus(); inp.select();
}

/* ── Zugehörige Links ─────────────────────────────────────────
   Eine Position trägt eine Liste von Links (siehe normLinks() in
   js/state.js). Angezeigt wird der **Name**, den der Nutzer
   vergeben hat — und wenn er keinen vergeben hat, die Adresse
   selbst: lieber eine lange Adresse als eine leere Zeile, unter
   der sich nichts finden lässt. */
const linkLabel=l=>((l&&l.name&&l.name.trim())?l.name.trim():((l&&l.url)||''));

/* Das Kettensymbol vor einer Bezeichnung, in allen drei Ansichten
   dasselbe.

   **Ein Link führt direkt hin, mehrere öffnen die Auswahl.** Ein
   Symbol je Link stünde bei zehn Links zehnmal vor dem Namen und
   nähme der Bezeichnungsspalte der Jahresmatrix den Platz, den sie
   ohnehin knapp hat. Beim Überfahren nennt die Sprechblase, wohin
   es geht — bei mehreren, wie viele es sind.

   `kind` und `key` sagen, wessen Links gemeint sind: 'item' mit
   der Kennung, 'kak' mit dem Namen der Kategorie. Verdrahtet wird
   `data-links` einmal in wire() (js/app.js). */
function linkIcon(links,kind,key){
  const l=(links||[]).filter(x=>x&&x.url);
  /* **Ohne Links ein Strich.** Eine leere Zelle sagt nur, dass hier
     nichts ist; der Strich sagt, dass hier etwas hinkönnte — und
     ein Klick darauf führt direkt dorthin: Fenster der Position
     auf, Webseitenänderungsfenster gleich hinterher. Zeilen ohne
     Position (Summen, Gruppen) bekommen ihn nicht — dort gibt es
     nichts, dem ein Link gehören könnte; erkennbar am fehlenden
     Schlüssel. */
  if(!l.length) return key?`<button type="button" class="linkicon linkdash" data-lnnew="${esc(kind+':'+key)}"
    aria-label="${esc(t('link.add'))}" data-tip="${esc(t('link.addTip'))}">&ndash;</button>`:'';
  /* **In der Sprechblase steht nur die Bezeichnung.** Sie ist das,
     was der Nutzer vergeben hat, und seit ein Link ohne Namen gar
     nicht erst angelegt wird (editLink weiter unten), sagt sie
     immer etwas. Die Adresse dahinter war eine zweite Zeile
     Kleingedrucktes über einem Symbol von 15 px — wer sie sehen
     will, sieht sie in der Statuszeile des Browsers. */
  if(l.length===1) return `<a class="linkicon" href="${esc(l[0].url)}" target="_blank" rel="noopener"
    data-tip="${esc(linkLabel(l[0]))}">${LINK_SVG}</a>`;
  return `<button type="button" class="linkicon" data-links="${esc(kind+':'+key)}"
    aria-label="${esc(t('link.pick'))}" data-tip="${esc(t('link.pickTip',l.length))}">${LINK_SVG}</button>`;
}

/* Das Fenster, das bei mehreren Links die Auswahl zeigt. Es ist so
   hoch, wie es sein muss: zehn Links sind die Obergrenze
   (MAX_LINKS), und zehn Zeilen passen auf jeden Bildschirm —
   deshalb rollt hier nichts. */
function openLinkList(kind,key){
  const o=kind==='kak'?(state.kak&&state.kak[key]):findItem(key);
  const l=(o&&o.links)||[];
  if(!l.length) return;
  const name=kind==='kak'?keyLabel(key):(o.name||'');
  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box narrow">
    <h3>${esc(t('link.title'))}</h3>
    <p class="subline">${esc(name)}</p>
    <ul class="linklist">${l.map(x=>`<li><a href="${esc(x.url)}" target="_blank" rel="noopener"
      data-tip="${esc(x.url)}">${esc(linkLabel(x))}</a></li>`).join('')}</ul>
    <div class="row-end"><button class="btn" id="llClose">${t('g.close')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);
  box.querySelector('#llClose').onclick=()=>closeModal(box);
  box.onclick=ev=>{ if(ev.target===box) closeModal(box); };
  /* Wer einen Link wählt, hat das Fenster erledigt — es soll nicht
     hinter dem neuen Reiter stehen bleiben. */
  box.querySelectorAll('.linklist a').forEach(a=>a.addEventListener('click',()=>closeModal(box)));
  const first=box.querySelector('.linklist a'); if(first) first.focus();
}

/* ── Das Webseitenänderungsfenster ────────────────────────────
   Zwei Felder: oben der Name, unter dem der Link erscheinen soll,
   darunter die Adresse. Der Name ist freiwillig — bleibt er leer,
   steht später die Adresse selbst da.

   Die Reihenfolge ist Absicht: man liest zuerst, **wofür** der
   Link steht, und dann erst, wohin er zeigt. In der Liste sieht
   man es später genauso.

   Enter bestätigt, Escape bricht ab (das erledigt der Zuhörer für
   jedes oberste Fenster). Übernommen wird nur ins aufrufende
   Fenster — in die Datei kommt es erst mit dessen „Speichern",
   deshalb heißt der Knopf „Übernehmen". */
function editLink(cur,onOk){
  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box narrow">
    <h3>${esc(t(cur?'link.edit':'link.add'))}</h3>
    <p class="subline">${esc(t('link.sub'))}</p>
    <div class="field"><label>${t('link.name')}</label>
      <input id="lnName" value="${esc((cur&&cur.name)||'')}" placeholder="${esc(t('link.namePh'))}"></div>
    <div class="field"><label>${t('link.url')}</label>
      <input id="lnUrl" value="${esc((cur&&cur.url)||'')}" placeholder="https://…"></div>
    <p class="errline" id="lnErr" hidden></p>
    <div class="row-end">
      <button class="btn" id="lnCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="lnOk">${t('item.apply')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);

  const nm=box.querySelector('#lnName'), ur=box.querySelector('#lnUrl'), err=box.querySelector('#lnErr');

  /* ── Der Name kommt aus der Adresse ─────────────────────────
     Wer eine Adresse einfügt, soll den Namen nicht auch noch
     tippen müssen: aus `https://www.telekom.de/…` wird „Telekom"
     (siteName in js/format.js).

     **Nur solange niemand selbst etwas hingeschrieben hat.** Der
     eingetragene Name gehört dem Nutzer; ihn beim nächsten
     Buchstaben in der Adresse zu überschreiben wäre ein
     Übergriff. Gemerkt wird das an `auto`: gefüllt wird nur, was
     leer war oder was zuletzt von hier kam. Sobald der Nutzer im
     Namensfeld tippt, ist Schluss — auch wenn er es wieder
     leert. */
  let auto=!(cur&&cur.name);

  /* ── Ohne Namen wird nichts übernommen ──────────────────────
     Der Name ist das Einzige, was der Link später zeigt: in der
     Liste, in der Auswahl und in der Sprechblase des
     Kettensymbols. Bliebe er leer, stünde dort die nackte Adresse
     — eine Zeile, unter der sich nichts finden lässt.

     Meistens merkt der Nutzer davon nichts, weil siteName() ihn
     aus der Adresse holt. Kommt dabei nichts heraus (eine
     IP-Adresse, ein Verzeichnis, etwas, das keine Adresse ist),
     **umrandet das Namensfeld sich rot**, sobald in der Adresse
     etwas steht. Der Rahmen ist der Hinweis, nicht die Sperre —
     er zeigt schon beim Tippen, was noch fehlt, statt erst beim
     Klick auf „Übernehmen" zu widersprechen. */
  const mark=()=>{
    nm.classList.toggle('bad',!nm.value.trim()&&!!ur.value.trim());
    err.hidden=true;
  };

  nm.oninput=()=>{ auto=false; mark(); };
  ur.oninput=()=>{
    if(auto) nm.value=siteName(ur.value.trim());
    mark();
  };
  mark();

  const ok=()=>{
    const url=ur.value.trim();
    /* Ohne Adresse gibt es nichts zu öffnen — ein Link, der
       nirgendwohin führt, ist kein Eintrag, sondern ein Fehler. */
    if(!url){ err.textContent=t('link.urlEmpty'); err.hidden=false; ur.focus(); return; }
    /* Eingefügt und sofort mit Enter bestätigt: dann hat `oninput`
       zwar gefeuert, aber wer die Adresse per Tastatur einsetzt und
       gleich abschickt, soll den Namen trotzdem bekommen. */
    const name=nm.value.trim()||(auto?siteName(url):'');
    if(!name){
      nm.value=''; mark();
      err.textContent=t('link.nameEmpty'); err.hidden=false; nm.focus(); return;
    }
    /* Ohne Schema hält der Browser die Adresse für einen Pfad —
       „example.com" landete sonst auf der eigenen Seite. linkUrl()
       steht in js/state.js, weil auch das Laden älterer Dateien es
       braucht. */
    closeModal(box);
    onOk({name,url:linkUrl(url)});
  };
  box.querySelector('#lnOk').onclick=ok;
  box.querySelector('#lnCancel').onclick=()=>closeModal(box);
  box.onclick=ev=>{ if(ev.target===box) closeModal(box); };
  [nm,ur].forEach(i=>{ i.onkeydown=ev=>{ if(ev.key==='Enter'){ ev.preventDefault(); ok(); } }; });
  /* Bei einem neuen Eintrag steht die Schreibmarke in der Adresse:
     ohne sie geht es nicht weiter, der Name ist die Zugabe. Beim
     Ändern vorn im Namen — meistens ist genau er gemeint. */
  const f=cur?nm:ur; f.focus(); f.select();
}

/* ── Der Weg in die Einstellungen ─────────────────────────────
   Ein Fenster, in dem aus einer Liste gewählt wird, sagt auch, wo
   diese Liste gepflegt wird: eine dünne Zeile **über** den Feldern,
   ein Weg je Liste. Das Posten-Fenster führt so zu den Kategorien,
   den Banken und den Zahlungsarten, das Kategorie-Fenster der
   Flexible Payments zu deren Kategorien — jeder Weg in den Bereich,
   um den es geht, und nicht bloß „in die Einstellungen".

   `bindSetLinks(box,after)` hängt sie an: das Einstellungsfenster
   geht **über** dem aufrufenden auf, ohne es zu schließen, und
   `after` läuft, wenn es wieder weg ist — dort holt sich das Fenster
   die neuen Einträge ab (siehe openSettings in
   js/dialogs/settings.js).

   Das Merkmal heißt `data-setlist` und nicht `data-lists`: jenes
   gehört den Ansichten und wird in wire() bei jedem Zeichnen neu
   verdrahtet — es überschriebe den Rückweg. */
const setLinks=list=>list.filter(Boolean)
  .map(([pane,lab])=>`<button type="button" class="linkish" data-setlist="${esc(pane)}">${esc(lab)}</button>`)
  .join('<span class="lsep">·</span>');
const bindSetLinks=(box,after)=>box.querySelectorAll('[data-setlist]')
  .forEach(b=>{ b.onclick=()=>openSettings(b.dataset.setlist,after); });

/* Die Überschrift des Linkbereichs — dieselbe Bauart wie die
   Listen im Einstellungsfenster (listHead in js/dialogs/settings.js):
   das Pluszeichen steht **direkt hinter** der Beschriftung, nicht am
   rechten Rand. Dort suchte man es, und bei einer langen Liste stünde
   es weit weg von dem, was es ergänzt. */
const linkHead=()=>`<label>${t('item.links')}<button type="button" class="plusmini" data-lnadd="1"
  title="${esc(t('link.addTip'))}" aria-label="${esc(t('link.addTip'))}">+</button></label>`;

/* Die Liste der Links in einem Fenster: je Zeile der Stift links,
   der Link als Text, das Kreuz rechts. Gebaut vom aufrufenden
   Fenster, verdrahtet von bindLinks() darunter.

   **Ohne Links steht dort nichts.** Ein Satz „noch keine Links"
   sagte nur, was die leere Fläche schon zeigt, und machte aus einer
   Zeile Überschrift drei Zeilen Fenster. */
function linkRows(links){
  if(!links.length) return '';
  return `<ul class="linklist edit">${links.map((x,i)=>`<li draggable="true" data-lnrow="${i}">
    <span class="grip" title="${esc(t('set.dragTip'))}">&#8942;&#8942;</span>
    <button type="button" class="pencil" data-lnedit="${i}" title="${esc(t('link.editTip'))}">&#9998;</button>
    <a href="${esc(x.url)}" target="_blank" rel="noopener" data-tip="${esc(x.url)}">${esc(linkLabel(x))}</a>
    <button type="button" class="lndel" data-lndel="${i}"
      aria-label="${esc(t('link.del'))}" data-tip="${esc(t('link.delTip'))}">&#10005;</button>
  </li>`).join('')}</ul>`;
}

/* Hängt die Klicks an eine frisch gebaute Linkliste. `links` ist
   die Liste des offenen Fensters, `redraw` zeichnet den Bereich
   neu — beides gehört dem Aufrufer, hier steht nur, was passiert.

   Gelöscht wird erst nach Rückfrage: ein Link ist schnell
   angelegt, aber niemand weiß hinterher, welche Adresse dort
   stand. */
function bindLinks(root,links,redraw){
  root.querySelectorAll('[data-lnedit]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.lnedit;
    editLink(links[i],v=>{ links[i]=v; redraw(); });
  });
  root.querySelectorAll('[data-lndel]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.lndel;
    if(!confirm(t('link.delAsk',linkLabel(links[i])))) return;
    links.splice(i,1); redraw();
  });
  const add=root.querySelector('[data-lnadd]');
  if(add) add.onclick=()=>{
    if(links.length>=MAX_LINKS){ toast(t('link.max',MAX_LINKS)); return; }
    editLink(null,v=>{ links.push(v); redraw(); });
  };

  /* ── Die Reihenfolge ziehen ─────────────────────────────────
     Dieselbe Mechanik wie die Listen im Einstellungsfenster
     (js/dialogs/settings.js): der Griff ⋮⋮ ganz links, `.dragging`
     an der Zeile, die man hält, `.over` an der, auf der man steht.

     Welche Reihenfolge gilt, ist keine Kleinigkeit: der erste Link
     ist der, den das Kettensymbol in den Ansichten öffnet, wenn es
     nur einen gibt — und der, der in der Auswahl oben steht. */
  const rows=[...root.querySelectorAll('[data-lnrow]')];
  let from=null;
  rows.forEach(row=>{
    row.addEventListener('dragstart',ev=>{
      from=+row.dataset.lnrow;
      row.classList.add('dragging'); ev.dataTransfer.effectAllowed='move';
      try{ ev.dataTransfer.setData('text/plain',String(from)); }catch(e){}
    });
    row.addEventListener('dragend',()=>{
      row.classList.remove('dragging');
      rows.forEach(r=>r.classList.remove('over'));
    });
    row.addEventListener('dragover',ev=>{
      if(from===null) return;
      ev.preventDefault(); ev.dataTransfer.dropEffect='move'; row.classList.add('over');
    });
    row.addEventListener('dragleave',()=>row.classList.remove('over'));
    row.addEventListener('drop',ev=>{
      ev.preventDefault();
      const to=+row.dataset.lnrow;
      if(from===null||to===from) return;
      links.splice(to,0,links.splice(from,1)[0]);
      from=null; redraw();
    });
  });
}

/* Die Überschrift eines Fensters als Knopf, der seine Bezeichnung
   ändert. Zurück kommt showName() — der Aufrufer ruft es, wenn
   sich der Name geändert hat. */
function bindTitle(btn,get,set,txt,taken,isNew){
  const showName=()=>{
    const n=get();
    btn.textContent=n?keyLabel(n):txt.pick;
    btn.classList.toggle('empty',!n);
  };
  showName();
  btn.onclick=()=>askName(get(),txt,taken,v=>{ set(v); showName(); });
  return showName;
}

/* ── Doppelklick öffnet die Position ──────────────────────────
   In jeder Ansicht dasselbe: ein Doppelklick auf den Betrag oder
   auf die Bezeichnung öffnet das Fenster, das auch der Stift
   öffnet. Das Merkmal sitzt an der Zeile; welche Zelle getroffen
   war, prüft wire() in js/app.js — es zählen nur Betrag und
   Bezeichnung (td.num, td.amt, td.lab, td.nm), und nichts, worauf
   man ohnehin klickt: Knöpfe, Links, Eingabefelder.

   Die Bezeichnungsspalte trägt dafür überall `nm` (die Jahres-
   matrix nennt sie `lab`), damit die Regel nicht an der Stellung
   der Zelle hängt. */
const dblItem=id=>` data-dbledit="${esc(id)}"`;
const dblKak=k=>` data-dblkedit="${esc(k)}"`;

/* ── Sofort-Tooltip ───────────────────────────────────────────
   Der Browser zeigt title= erst nach etwa einer Sekunde. Alles
   mit data-tip="…" bekommt stattdessen sofort eine Sprechblase
   neben dem Element.

   Ein einziges Element für die ganze Seite, angehängt an <body>
   und fest positioniert — in den Tabellenzellen liegt overflow
   auf hidden, dort würde die Blase abgeschnitten. Die Ereignisse
   hängen an document, überstehen also jedes Neuzeichnen. */
const tipEl=document.createElement('div');
tipEl.className='tip'; tipEl.hidden=true;
document.body.appendChild(tipEl);

function showTip(el){
  const txt=el.getAttribute('data-tip');
  if(!txt) return;
  tipEl.textContent=txt;
  tipEl.hidden=false;
  tipEl.style.left='0px'; tipEl.style.top='0px';   /* erst messen, dann setzen */

  const r=el.getBoundingClientRect(), tr=tipEl.getBoundingClientRect();
  const gap=8;
  /* **Immer über oder unter dem Element, nie daneben.** Neben dem
     Element verdeckte die Blase den Nachbarn — in einer Tabelle
     die Zelle daneben, in einer Leiste den nächsten Knopf, und
     das ist regelmäßig genau das, womit man das Überfahrene
     vergleichen will. Über und unter dem Element liegt der
     eigene Zeilenabstand, dort steht nichts, was man gerade liest.

     Zuerst darüber; passt es dort nicht, darunter. Ist beides zu
     eng, gewinnt die Seite mit mehr Luft, und die Blase wird ins
     Fenster geschoben.

     Waagerecht steht sie mittig zum Element — so zeigt sie auf
     das, wozu sie gehört, auch wenn sie breiter ist. */
  const above=r.top-gap-tr.height, below=r.bottom+gap;
  let y;
  if(above>=gap) y=above;
  else if(below+tr.height<=window.innerHeight-gap) y=below;
  else y=(r.top>window.innerHeight-r.bottom)?above:below;
  y=Math.min(Math.max(gap,y),Math.max(gap,window.innerHeight-gap-tr.height));

  let x=r.left+r.width/2-tr.width/2;
  x=Math.min(Math.max(gap,x),Math.max(gap,window.innerWidth-gap-tr.width));

  tipEl.style.left=Math.round(x)+'px';
  tipEl.style.top=Math.round(y)+'px';
}
const hideTip=()=>{ tipEl.hidden=true; };

document.addEventListener('mouseover',e=>{
  const el=e.target.closest&&e.target.closest('[data-tip]');
  if(el) showTip(el);
});
document.addEventListener('mouseout',e=>{
  if(e.target.closest&&e.target.closest('[data-tip]')) hideTip();
});
document.addEventListener('focusin',e=>{
  const el=e.target.closest&&e.target.closest('[data-tip]');
  /* `data-tiphover` heißt: nur die Maus. Ein Feld, in dem
     gearbeitet wird, bekommt den Fokus immer wieder zurück (siehe
     wire() in js/app.js) — seine Sprechblase stünde sonst die
     ganze Zeit daneben, statt einmal zu erklären. */
  if(el&&!el.hasAttribute('data-tiphover')) showTip(el);
});
document.addEventListener('focusout',hideTip);
document.addEventListener('keydown',e=>{ if(e.key==='Escape') hideTip(); });
window.addEventListener('scroll',hideTip,true);

/* ── Tab läuft durch die Felder ───────────────────────────────
   Zwischen den Eingabefeldern stehen überall Symbole: Notizlampe,
   Siegel, Stift, Beleglink. Mit der Maus stören sie nicht, mit
   Tab schon — man käme nur jeden dritten Sprung an ein Feld.
   Deshalb nimmt diese Funktion alles aus der Tab-Reihenfolge, was
   kein Eingabefeld ist; anklickbar bleibt es unverändert.

   Zwei Ausnahmen mit Absicht: die Knöpfe der Fußzeile (.row-end)
   bleiben drin — sie sind der Weg aus dem Fenster heraus —, und
   die Kopfzeile der Seite wird gar nicht erst angefasst, damit
   Ansicht, Monat und Datei weiter mit der Tastatur erreichbar
   sind. */
function tabThroughFields(root){
  if(!root) return;
  root.querySelectorAll('button,a[href]').forEach(el=>{
    /* Die Fußzeile eines Fensters und die Begrüßungsseite bleiben
       drin: dort sind die Knöpfe der Inhalt, nicht das Beiwerk.
       Ebenso die Bezeichnung im Kopf (.titlebtn) — sie ist kein
       Symbol neben einem Feld, sondern der einzige Weg zu einer
       Angabe, und ohne Tab wäre sie mit der Tastatur unerreichbar. */
    if(el.closest('.row-end,.welcome')||el.classList.contains('titlebtn')) return;
    el.tabIndex=-1;
  });
}

/* ── Vorzeichen schon beim Tippen ─────────────────────────────
   Ausgaben stehen mit Minus in der Datei (siehe saldo() in
   js/calc.js). Damit man beim Eintippen nicht erst nachrechnen
   muss, färbt sich das Feld nach dem Vorzeichen: rot bei Minus,
   grün bei Plus. Die Null und das leere Feld bleiben, wie sie
   sind — dort gibt es kein Vorzeichen zu zeigen.

   Betroffen sind nur Felder mit der Klasse `signed`; die anderen
   Zahlenfelder (etwa das Jahr der letzten Zahlung) sind keine
   Beträge. Die Farben stehen in css/components.css. */
function signValue(inp){
  const v=parseGermanNumber(inp.value);
  inp.classList.toggle('neg',v<0);
  inp.classList.toggle('pos',v>0);
}
const signValues=root=>root.querySelectorAll('.signed').forEach(signValue);

/* Einmal beim Öffnen färben und danach bei jedem Zeichen. Was
   ein Knopf ins Feld schreibt (Schnelleingabe, Leeren), löst
   kein input aus — dort ruft das Fenster signValues() selbst. */
function bindSign(root){
  root.querySelectorAll('.signed').forEach(inp=>{
    signValue(inp);
    inp.addEventListener('input',()=>signValue(inp));
  });
}

/* ── Entwürfe ─────────────────────────────────────────────────
   Ein Fenster, das eine Position erst anlegt — „neu" oder ein
   Duplikat —, hat sie noch nicht im Zustand: findItem() und
   state.kak finden sie nicht. Damit die Notizlampen trotzdem
   schon arbeiten, meldet das Fenster seinen Entwurf hier an.

   Er gilt nur, solange sein Kasten im Dokument hängt. Deshalb
   muss ihn niemand abmelden: ein geschlossenes Fenster nimmt
   seinen Entwurf von selbst mit — auch das, das über Escape oder
   einen Klick daneben verschwindet. */
let noteDraft=null;
function useDraft(kind,key,obj,label,box){
  noteDraft=obj?{kind,key,obj,label,box}:null;
}
function draftOf(kind,key){
  const d=noteDraft;
  return (d&&d.box.isConnected&&d.kind===kind&&String(d.key)===String(key))?d:null;
}

/* ── Notizen ──────────────────────────────────────────────────
   kind ist 'item' (regelmäßiger Posten) oder 'kak' (Kakeibo).
   m = 1…12 meint die Notiz eines Monats, m = 0 die Notiz zur
   ganzen Position — die gilt in jedem Monat und steht in jeder
   Ansicht neben dem Namen. */
function noteTarget(kind,key){
  const d=draftOf(kind,key);
  if(d) return d.obj;
  return kind==='kak'?state.kak[key]:findItem(key);
}
function noteOf(kind,key,m){
  const tg=noteTarget(kind,key);
  if(!tg) return '';
  return m?(tg.notes[m-1]||''):(tg.note||'');
}

/* Die Lampe nutzt data-tip statt title — die Notiz soll ohne
   Verzögerung erscheinen. Der volle Text wird gezeigt, die Blase
   bricht ihn um. Ohne Notiz gibt es keine Blase: in der Jahres-
   ansicht steht in jeder Monatszelle eine Lampe, da wäre ein
   „Notiz hinzufügen" beim Überfahren nur im Weg. Was die leere
   Lampe kann, sagt weiterhin das aria-label. */
function lampHtml(kind,key,m){
  const n=noteOf(kind,key,m);
  return `<button class="lamp${n?' on':''}" data-note="${esc(kind+'|'+key+'|'+m)}"
    ${n?`data-tip="${esc(n)}"`:''} aria-label="${esc(n?t('note.is',n):t('note.add'))}">${LAMP_SVG}</button>`;
}

/* Die Lampe zur ganzen Position — steht neben dem Namen. */
function lampPos(kind,key){
  const n=noteOf(kind,key,0);
  return `<button class="lamp pos${n?' on':''}" data-note="${esc(kind+'|'+key+'|0')}"
    ${n?`data-tip="${esc(n)}"`:''} aria-label="${esc(n?t('note.isPos',n):t('note.addPos'))}">${LAMP_SVG}</button>`;
}

/* Die ersten Zeilen der Notiz, klein unter dem Namen. Sie stehen
   dort, damit man eine Notiz überhaupt bemerkt, ohne die Maus zu
   bewegen — nach zwei Zeilen bricht css/tokens.css sie ab.

   Bewusst ohne data-tip: die Sprechblase gehört der Lampe. Führe
   die Maus über die Vorschau, passiert nichts; erst die Lampe
   zeigt den vollen Text. Sonst spränge die Blase schon beim
   Überqueren der Zeile auf. */
function notePreview(kind,key){
  const n=noteOf(kind,key,0);
  return n?`<div class="noteprev">${esc(n)}</div>`:'';
}

/* Hängt an alle Lampen unterhalb von root das Notizfenster. */
function bindNotes(root,after){
  root.querySelectorAll('[data-note]').forEach(b=>b.onclick=ev=>{
    ev.stopPropagation();
    const [kind,key,m]=b.dataset.note.split('|');
    openNote(kind,key,+m,()=>{
      const n=noteOf(kind,key,+m);
      const pos=b.classList.contains('pos');
      b.classList.toggle('on',!!n);
      if(n) b.setAttribute('data-tip',n); else b.removeAttribute('data-tip');
      b.setAttribute('aria-label',n?(pos?t('note.isPos',n):t('note.is',n)):(pos?t('note.addPos'):t('note.add')));
      hideTip();
      if(after) after(b);
    });
  });
}

function openNote(kind,key,m,done){
  const cur=noteOf(kind,key,m);
  const target=noteTarget(kind,key);
  if(!target){ toast(t('note.gone')); return; }
  /* Ein Entwurf hat noch keinen Namen im Zustand — der steht im
     Namensfeld des Fensters, das ihn angemeldet hat. */
  const draft=draftOf(kind,key);
  const name=draft?draft.label():(kind==='kak'?key:target.name);
  const box=document.createElement('div');
  box.className='modal'; box.style.zIndex=70;
  box.innerHTML=`<div class="box" style="max-width:680px">
    <h3>${t('note.title',m?MONTHS_LONG[m-1]:t('note.whole'))}</h3>
    <p class="subline">${esc(name)}${m?'':t('note.allMonths')}</p>
    <div class="field"><label>${t('note.text')}</label>
      <textarea id="nTxt" rows="7" placeholder="${t('note.ph')}">${esc(cur)}</textarea></div>
    <div class="row-end">
      ${cur?`<button class="linkish" id="nDel" style="margin-right:auto">${t('note.del')}</button>`:''}
      <button class="btn" id="nCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="nSave">${t('g.save')}</button></div></div>`;
  document.body.appendChild(box); tabThroughFields(box);
  /* Die Notiz eines Entwurfs steht noch in keiner Datei — sie
     wandert erst mit „Speichern" des Fensters hinein. Deshalb
     bleibt der dirty-Zustand hier unberührt. */
  const finish=()=>{if(!draft)save();box.remove();if(done)done();};
  box.querySelector('#nCancel').onclick=()=>closeModal(box);
  box.onclick=ev=>{if(ev.target===box)closeModal(box);};
  const put=v=>{ if(m) target.notes[m-1]=v; else target.note=v; };
  const del=box.querySelector('#nDel');
  if(del) del.onclick=()=>{ put(''); finish(); };
  box.querySelector('#nSave').onclick=()=>{ put(box.querySelector('#nTxt').value.trim()); finish(); };

  /* Das Feld wächst mit dem Text: eine lange Notiz soll ganz zu
     sehen sein, ohne im Feld zu scrollen. Nach unten eine feste
     Mindesthöhe, damit ein leeres Feld nicht zum Schlitz wird,
     nach oben das Fensterhöhenmaß — sonst wüchse das Fenster aus
     dem Bildschirm heraus. */
  const ta=box.querySelector('#nTxt');
  const grow=()=>{
    ta.style.height='auto';
    const max=Math.max(200,Math.round(window.innerHeight*0.62));
    ta.style.height=Math.min(Math.max(ta.scrollHeight+2,150),max)+'px';
  };
  grow();
  ta.addEventListener('input',grow);
  ta.focus();
}
