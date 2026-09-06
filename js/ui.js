/* ══════════════════════════════════════════════════════════════
   FINA — Gemeinsame Oberflächenteile
   Kurzmeldung, Fensterschließen und die Notizlampe, die in jeder
   Ansicht und in jedem Fenster vorkommt.
   ══════════════════════════════════════════════════════════════ */

/* ── Kurzmeldung am unteren Rand ──────────────────────────────
   **Es gibt zwei Sorten, und nur eine erscheint** (30.8.26):

   * `toast(msg)` ist die **Bestätigung** — „Datei geladen",
     „7 importierte Monate gelöscht", „Kategorie gelöscht". Sie
     sagte, was man ohnehin gerade sieht, und stand dafür
     viereinhalb Sekunden über der Statuszeile und dem unteren
     Rand der Tabelle. Sie ist **abgeschaltet**.
   * `warn(msg)` ist die **Absage** — „Speichern fehlgeschlagen",
     „Kategorie schon vergeben", „ohne Block kann nicht
     gespeichert werden". Sie kommt immer: ohne sie täte ein Klick
     auf „Speichern" nichts und sagte auch nicht, warum.

   Der Schalter steht hier und nicht an den Fundstellen — ein
   `true` bringt die Bestätigungen zurück. Wer eine neue Meldung
   baut, entscheidet an der Fundstelle: bestätigt sie, ist es
   `toast()`; verweigert sie etwas oder meldet einen Fehler, ist es
   `warn()`. Ein eigenes Aussehen braucht die Absage nicht — sie
   ist seitdem die einzige Meldung, die überhaupt erscheint. */
const TOASTS=false;
function showNote(msg){
  const el=document.createElement('div');el.className='toast';el.textContent=msg;
  document.body.appendChild(el);setTimeout(()=>el.remove(),4600);
}
function toast(msg){ if(TOASTS)showNote(msg); }
function warn(msg){ showNote(msg); }

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
   Element, das neben der Tabelle sitzt und sie führt. Innen liegt
   ein Streifen von genau der Breite der Tabelle — dadurch hat der
   Balken dieselbe Länge und dasselbe Verhältnis wie der, den die
   Tabelle selbst hätte. Die Prognose verbirgt ihren eigenen
   (css/layout.css), der Jahresmatrix wird er abgeschnitten
   (.yearpane in css/matrix.css) — gerollt wird in beiden Fällen
   weiter vom Browser selbst.

   Wo die Leiste steht, entscheidet die Ansicht: in der Jahresmatrix
   **unter** der Fläche (seit 6.9.26; bis dahin in der Knopfleiste,
   die oben klebt) — im Bild bleibt sie trotzdem nach tausend
   Zeilen, denn die Fläche ist nur so hoch, wie darüber Platz ist,
   und sizeMatrix() zieht die Leiste dabei mit ab. Damit das Maß
   stimmt, muss vorher feststehen, ob die Leiste überhaupt da ist
   (.off): syncMatrixHead() ruft deshalb fitRails() vor
   sizeMatrix(). In der Prognose steht sie in der Karte direkt
   über der Tabelle.

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
   Die einzelnen Filterwerte stehen seit dem Mac-Redesign in
   Aufklappmenüs (fltDrop in js/views/monat.js), nicht mehr als
   Knopfreihe.

   Das Suchfeld bekommt seine Sprechblase **nur von der Maus**
   (data-tiphover, siehe showTip weiter unten): der Fokus kehrt
   immer wieder dorthin zurück, und mit ihm stünde die Blase die
   ganze Zeit neben dem Feld, in das man gerade tippt. Beim
   Überfahren erklärt sie einmal, was das Feld tut. */

/* Das Suchfeld im Mac-Chrome: ein weißer, leicht eingedrückter
   Kasten mit der Lupe davor, rechts daneben das Kreuz, das den
   Filter zurücknimmt — Suchbegriff, Bereich, Fälligkeit und
   Zahlungsstand auf einmal. Es ist gesperrt, solange gar nichts
   gefiltert wird; die beiden Knöpfe der Jahresansicht rührt es
   nicht an (die stehen in der Datei).

   Der Weg zu den Filterfeldern (data-qfields) steht nicht mehr als
   ☰ vor dem Feld, sondern als beschrifteter Knopf dahinter —
   fltOptionsBtn(), von Monats- wie Jahresansicht gesetzt. */
function filterField(extra){
  const on=!!(ui.q||'').trim()||ui.filter!=='alle'||ui.dueFilter!=='alle'||ui.secFilter!=='alle';
  return `<span class="fltbox${extra?' '+extra:''}">
    <span class="fltfield"><span class="lens" aria-hidden="true">&#8981;</span
      ><input class="fltq" data-q type="search" value="${esc(ui.q||'')}"
      placeholder="${t('g.filter')}" aria-label="${t('g.filter')}"
      data-tip="${esc(t('g.filterTip'))}" data-tiphover="1"></span>
    <button class="btn small fltclear" data-qclear="1"${on?'':' disabled'}
      aria-label="${esc(t('g.clearFilter'))}" data-tip="${esc(t('g.clearFilterTip'))}">&#10005;</button></span>`;
}

/* „Filteroptionen…" öffnet die Einstellungen im Bereich „Filter" —
   dort wird gewählt, worin der Suchbegriff überhaupt sucht
   (js/dialogs/settings.js; bis 23.8.26 war das ein eigenes
   Fenster). Die Wahl steht in der Datei, und im Einstellungsfenster
   stehen die Angaben der Datei beisammen.
   Dunkel steht der Knopf, sobald die Suche anders eingestellt ist
   als von Haus aus — weniger Teile einer Zeile **oder** dazu die
   ausgeblendeten Positionen. */
function fltOptionsBtn(){
  const custom=QFIELDS.some(k=>!qField(k))||qAll();
  return `<button class="btn small fltopts" data-qfields="1" aria-pressed="${custom}"
    data-tip="${esc(t('flt.btnTip'))}">${t('flt.options')}</button>`;
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
  const o=findItem(key);
  const l=(o&&o.links)||[];
  if(!l.length) return;
  const name=o.name||'';
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
    if(links.length>=MAX_LINKS){ warn(t('link.max',MAX_LINKS)); return; }
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

  /* ── Ein Menü erklärt sich seitlich ──────────────────────────
     Über und unter einem Eintrag stehen in einer Liste die
     Nachbareinträge — genau die, zwischen denen man gerade
     wählt. Dort deckte die Blase zu, wovon sie handelt.

     Ein Menü meldet sich deshalb mit `data-tipside` an (das
     Hamburger-Menü der Kopfzeile in fina-online.html tut es):
     dann steht die Blase **rechts daneben**, und nur wenn dort
     kein Platz mehr ist, links. Senkrecht mittig zur Zeile — so
     zeigt sie auf den Eintrag, zu dem sie gehört. */
  if(el.closest&&el.closest('[data-tipside]')){
    const right=r.right+gap, left=r.left-gap-tr.width;
    let x;
    if(right+tr.width<=window.innerWidth-gap) x=right;
    else if(left>=gap) x=left;
    else x=(window.innerWidth-r.right>r.left)?right:left;
    x=Math.min(Math.max(gap,x),Math.max(gap,window.innerWidth-gap-tr.width));
    let ym=r.top+r.height/2-tr.height/2;
    ym=Math.min(Math.max(gap,ym),Math.max(gap,window.innerHeight-gap-tr.height));
    tipEl.style.left=Math.round(x)+'px';
    tipEl.style.top=Math.round(ym)+'px';
    return;
  }

  /* **Sonst immer über oder unter dem Element, nie daneben.** Neben dem
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
/* ── Erst nach einer Weile (seit 6.9.26, Lex) ───────────────────
   Die Blase kommt nicht mehr sofort, sondern nach TIP_DELAY
   (js/config.js, eine halbe Sekunde — der eine Wert für alle Hinweise):
   wer nur vorbeifährt, sieht keine; wer stehen bleibt, bekommt sie.
   Verlässt die Maus das Element vorher, fällt der Auftrag. */
let tipT=0;
function tipLater(el){
  clearTimeout(tipT); tipEl.hidden=true;
  tipT=setTimeout(()=>{ if(el.isConnected&&el.matches(':hover, :focus')) showTip(el); },TIP_DELAY);
}
const hideTip=()=>{ clearTimeout(tipT); tipEl.hidden=true; };

/* ── Auch title= wird zur Sprechblase (5.9.26) ─────────────────
   Bis dahin gab es zwei Sorten Hinweis: die eigene Blase (sofort,
   dunkel) an allem mit data-tip, und den Hinweis des Browsers
   (nach einer Sekunde, hell) an allem mit title. Jetzt ist es eine
   Sorte: sobald die Maus über ein Element mit title kommt, wandert
   der Text nach data-tip und der title fällt — sonst zeigte der
   Browser seinen Hinweis obendrein. Beim nächsten Zeichnen steht
   der title wieder da und wandert erneut; wer ihn zwischendurch
   setzt (cb.title=…, setSeal in js/dialogs/item.js), wird beim
   nächsten Überfahren genauso gelesen — deshalb gewinnt ein
   vorhandener title immer über eine ältere Blase.

   Nur die Maus: ein title zeigte sich nie beim Fokus, und das
   soll so bleiben (data-tiphover) — die Filterfelder des Wizards
   tragen einen und haben fast immer den Fokus. */
document.addEventListener('mouseover',e=>{
  const tl=e.target.closest&&e.target.closest('[title]');
  if(tl){
    const s=tl.getAttribute('title');
    tl.removeAttribute('title');
    if(s){ tl.setAttribute('data-tip',s); tl.setAttribute('data-tiphover','1'); }
  }
  const el=e.target.closest&&e.target.closest('[data-tip]');
  if(el) tipLater(el);
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
  if(el&&!el.hasAttribute('data-tiphover')) tipLater(el);
});
document.addEventListener('focusout',hideTip);
/* Wird die Seite wieder sichtbar (das Fenster war verdeckt), stehen
   Animationen, die währenddessen anfingen, mitunter auf ihrem
   ersten Bild fest — ein Menü bliebe unsichtbar, ein Fenster leer.
   Was dann gerade auf ist, wird ohne Animation fertig gestellt;
   das nächste Öffnen baut es ohnehin neu. */
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible') return;
  document.querySelectorAll('.tools.open,.dropmenu.popin,.c2fpop,.modal,.modal .box').forEach(el=>{ el.style.animation='none'; });
});
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
  return findItem(key);
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

/* Eine Notizvorschau unter dem Namen (notePreview, .noteprev) gab
   es bis 5.9.26 in der Jahresmatrix und in den Import Details. Sie
   ist weg: die Notiz zur Position zeigt die Lampe als Sprechblase,
   ausgeschrieben steht nur die Monatsnotiz in der Monatsansicht. */

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
  if(!target){ warn(t('note.gone')); return; }
  /* Ein Entwurf hat noch keinen Namen im Zustand — der steht im
     Namensfeld des Fensters, das ihn angemeldet hat. */
  const draft=draftOf(kind,key);
  const name=draft?draft.label():target.name;
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

/* ── Die importierten Daten im Fenster ────────────────────────
   Das Posten- und das Beträge-Fenster können rechts eine Liste
   aufklappen, die zeigt, was der CSV-Import an dieser Position
   hinterlassen hat — je Monat eine Gruppe: der Monat mit seinem
   Betrag und der Import-Marke (cyan gemerkt, rot einmalig),
   darunter jede Buchung als zwei Zeilen: Datum und Betrag, dann
   der Verwendungszweck. Beim regelmäßigen Posten kommen die
   Buchungen aus it.impRows (seit 30.8.26, siehe c2Apply in
   js/dialogs/csv2-wizard.js — ältere Importe haben sie nicht,
   dort bleibt es beim Monat mit seiner Summe), bei den flexiblen
   Kategorien aus state.tx. Sortiert wird nach Datum, bei gleichem
   Tag nach dem Verwendungszweck — wie ein Kontoauszug.

   Die Liste ist **kein eigenes Fenster**: .impon am .box macht
   das Fenster um die Spalte breiter — höher macht es sie nicht,
   die Liste steht absolut an der rechten Kante, läuft über die
   ganze Fensterhöhe und rollt in sich; ihre Monatsgruppen tragen
   das Gewand der .dgrp-Blöcke (css/components.css). Der Knopf
   dazu steht in der Fußzeile
   (#impBtn, von impSideWire beschriftet); ist das Browserfenster
   zu schmal für die Spalte, öffnet er stattdessen ein Fenster
   darüber. Die Wahl lebt in ui.impPanel — Sitzung, nie Datei.
   Daneben steht #impDel („Importdaten löschen") — seine Wirkung
   wohnt in den beiden Dialogen, denn nur sie kennen ihren
   Schlüssel; impSideWire nimmt beide Knöpfe heraus, wenn es
   nichts zu zeigen gibt. */
function impSideData(kind,ref){
  const out=[];
  /* Sortiert nach Datum, dann nach Verwendungszweck: dn ist der
     Tag als Zahl (Jahr·Monat·Tag), damit „05." vor „12." kommt
     und nicht alphabetisch. */
  const sorted=rows=>rows.sort((a,b)=>(a.dn-b.dn)||String(a.txt||'').localeCompare(String(b.txt||'')));
  const two=n=>String(n).padStart(2,'0');
  /* **Je Zeile die drei Referenzen** (5.9.26): neuere Importe
     tragen sie als Liste `r`, und die Liste zeigt sie je Referenz
     als eigene Zeile (impSideRows). Ältere Zeilen haben nur ihren
     zusammengesetzten Text — der steht dann als eine Zeile. `txt`
     ist in beiden Fällen der Sortierschlüssel (txText/impRowText
     in js/calc.js). */
  if(kind==='item'&&ref&&ref.imp){
    for(let i=0;i<12;i++){
      if(!ref.imp[i])continue;
      const src=(ref.impRows&&ref.impRows[i+1])||[];
      out.push({m:i+1,sum:ref.amounts[i]||0,once:ref.imp[i]===2,
        rows:sorted(src.map(r=>{
          const p=String(r.d||'').split('.');
          return {d:r.d||'',dn:(+p[2]||0)*10000+(+p[1]||0)*100+(+p[0]||0),v:r.v,r:r.r||null,txt:impRowText(r)};
        }))});
    }
  }
  /* Aus dem Wizard geöffnet (c2Detail): was diese Datei dem Ziel
     schon zugeordnet hat, aber noch nicht angewendet ist, kommt
     hellgelb dazu (nw, c2PendingRows in js/dialogs/csv2-wizard.js)
     — dieselbe Farbsprache wie der Zielbereich des Imports. Ein
     Monat, den erst diese Datei bringt, wird eine eigene Gruppe
     mit der Summe des Schwebenden und ohne Import-Marke: im Buch
     steht er ja noch nicht. Außerhalb des Wizards ist das Ergebnis
     leer, und die Liste zeigt wie bisher nur das Buch. */
  if(ref&&typeof c2PendingRows==='function'){
    const pend=c2PendingRows(kind,ref);
    Object.keys(pend).forEach(mk=>{
      const m=+mk,rows=pend[mk];
      let g=out.find(x=>x.m===m);
      if(!g){
        g={m:m,sum:Math.round(rows.reduce((s,r)=>s+r.v,0)*100)/100,once:false,nw:1,rows:[]};
        out.push(g);
      }
      g.rows=sorted(g.rows.concat(rows));
    });
    out.sort((a,b)=>a.m-b.m);
  }
  return out;
}
/* **Und die Liste steht gleich bei diesem Monat.** Ein Rahmen, den
   man erst suchen muss, ist keiner: die Gruppe kann die achte von
   zwölf sein und läge dann außerhalb der Rollfläche. Gemessen wird
   an den Kanten und nicht an offsetTop — die Rollfläche greift
   seitlich über ihre Spalte hinaus (css/components.css) und ist
   selbst nicht positioniert, ein offsetParent wäre also nicht
   verlässlich derselbe. Die 12 px sind ihr oberes Polster: die
   Gruppe soll an der Kante stehen, nicht daran kleben. */
function impScrollToAsk(root){
  const el=root.querySelector('.impmon.askmon');
  if(!el)return;
  const sc=el.closest('.impscroll');
  if(!sc)return;
  sc.scrollTop+=el.getBoundingClientRect().top-sc.getBoundingClientRect().top-12;
}
/* ── Was dieser Importlauf den Monaten bringt ─────────────────
   Ein Nachschlagewerk `{monat:{v,once}}` für die Monatskästchen
   der beiden Fenster (js/dialogs/item.js,
   js/dialogs/kakeibo-betraege.js). Sie zeigen den Monat so, wie
   „Anwenden" ihn hinterlassen wird — mit seinem Betrag, seinem
   Importzeichen und geschlossen —, nur auf hellgelbem Grund:
   dieselbe Farbsprache wie die Zeilen der Liste daneben und wie
   der Zielbereich des Wizards, Gelb heißt „kommt neu herein und
   steht noch nicht in der Datei".

   **Gerechnet wird wie beim Anwenden** (c2Apply): der Monat
   bekommt die Summe der zugeordneten Zeilen — er wird ersetzt und
   nicht dazugezählt —, und einmalig ist er, sobald **eine** seiner
   Zeilen aus einer nicht gemerkten Regel kam. Stünde hier eine
   andere Rechnung, verspräche die Vorschau etwas anderes, als das
   Buch bekommt.

   Außerhalb des Wizards ist das Ergebnis leer, und die Fenster
   sehen aus wie immer. */
function impPendingMonths(kind,ref){
  const out={};
  if(!ref||typeof c2PendingRows!=='function')return out;
  const p=c2PendingRows(kind,ref);
  Object.keys(p).forEach(mk=>{
    const rows=p[mk];
    if(!rows.length)return;
    out[+mk]={v:Math.round(rows.reduce((s,r)=>s+r.v,0)*100)/100,
              once:rows.some(r=>r.once)};
  });
  return out;
}
/* **Jeder Monat der Liste trägt seine Marke**, und ihre Farbe
   sagt, woher er kommt: Cyan, was schon im Buch steht (rot, wenn
   die Zuordnung nicht gemerkt wurde), Gelb, was dieser Lauf erst
   bringt. Bis 30.8.26 blieb ein rein schwebender Monat ohne
   Zeichen — daneben stand einer mit, und der Unterschied sah
   willkürlich aus, obwohl beide gleich importbereit sind. */
/* **Der Monat, dessentwegen das Fenster aufging, ist auch hier
   eingefasst** (30.8.26): kam man über einen Doppelklick auf einen
   Betrag oder über das Siegel eines geschätzten Monats, trägt seine
   Kachel links den gelben Rahmen (.askcell) — und seine Gruppe in
   der Liste denselben. Es ist dieselbe Frage („welcher Monat war
   das?"), und sie stellt sich rechts genauso: in einer Liste aus
   zwölf Gruppen sucht man ihn sonst am Namen ab. Gescrollt wird
   auch dorthin, siehe impSideWire(). */
function impSideRows(data,ask){
  const mark=g=>`<i class="statmark imp${g.nw?' nw':(g.once?' once':'')}" data-tip="${esc(t(g.nw?'c2.sealNewTip':(g.once?'c2.sealOnceTip':'c2.sealTip')))}">${IMPORT_SVG}</i>`;
  return `<div class="impscroll">`+data.map(g=>
    `<div class="impmon${g.m===ask?' askmon':''}" data-impm="${g.m}"><p class="impmh">${mark(g)}<b>${esc(MONTHS_LONG[g.m-1])}</b><span class="${cls(g.sum)}">${eur(g.sum)}</span></p>`+
    g.rows.map(x=>
      `<div class="improw${x.nw?' nw':''}"><p class="imprl"><span class="d">${esc(x.d)}</span><span class="v ${cls(x.v)}">${eur(x.v)}</span></p>`
      /* Je Referenz eine Zeile, mit ihrer Nummer davor — nur die,
         in denen etwas steht. Ohne Referenzen (ältere Importe) der
         eine zusammengesetzte Text. */
      +(x.r&&x.r.some(Boolean)
        ?x.r.map((v,i)=>v?`<p class="imprd ref"><span class="rl">${esc(t('impv.ref',i+1))}</span>${esc(v)}</p>`:'').join('')
        :(x.txt?`<p class="imprd">${esc(x.txt)}</p>`:''))+`</div>`).join('')
    +`</div>`).join('')+`</div>`;
}
/* ── Die Rückfrage vor „Alle Importdaten löschen" ─────────────
   (6.9.26) Drei Fälle, ein Satz: Monate im Buch, schwebende Zeilen
   des offenen Wizards, oder beides. `pend` ist die Zahl der Zeilen,
   die dieser Lauf dem Ziel zugeordnet hat — trocken gezählt über
   impPendingCount (c2Unassign in js/dialogs/csv2-wizard.js). */
function impWipeAsk(name,months,pend){
  if(!months)return t('c2.wipeAskPend',name,pend);
  return t('c2.mnWipeAsk',name,months)+(pend?' '+t('c2.wipeAlsoPend',pend):'');
}
/* Was der offene Import dem Ziel zugeordnet hat — 0 außerhalb des
   Wizards. `tid` wie im Wizard: 'i:<id>' oder 'k:<name>'. */
function impPendingCount(tid){
  return typeof c2Unassign==='function'?c2Unassign(tid,true):0;
}
/* Dasselbe Fenster frisch öffnen — aus dem Wizard heraus so, dass
   der Wizard beim Schließen neu zeichnet (c2Detail); sonst
   gewöhnlich. Ohne diesen Umweg hinge das neu geöffnete Fenster
   nicht mehr am Wizard, und was man darin ändert, käme im
   Zielbereich erst beim nächsten Zeichnen an. */
function impReopen(open){
  if(typeof c2Detail==='function'&&typeof W!=='undefined'&&W&&W.step===3)c2Detail(open);
  else open();
}
/* `ask` ist der Monat, dessentwegen das Fenster aufging (der
   focusMonth der beiden Dialoge) — oder nichts. */
function impSideWire(modal,kind,ref,ask){
  const btn=modal.querySelector('#impBtn'),del=modal.querySelector('#impDel');
  const data=impSideData(kind,ref);
  const boxEl=modal.querySelector('.box');
  /* **Ohne Importdaten bleibt der Knopf stehen und ist grau**
     (30.8.26; vorher fiel er ganz weg). Er sagt dann, dass es
     diesen Bereich gibt und an dieser Position nichts darin steht —
     ein Knopf, der je nach Posten da ist oder nicht, lässt die
     Fußzeile bei jedem Fenster anders aussehen. Der Löschknopf
     geht: er wohnt unter der Liste, und die gibt es hier nicht. */
  if(!data.length){
    if(del)del.remove();
    if(btn){btn.hidden=false;btn.disabled=true;btn.textContent=t('impv.show');}
    return;
  }
  if(!btn){if(del)del.remove();return;}
  /* **„Alle Importdaten löschen" steht, sobald die Liste etwas
     zeigt** (6.9.26) — auch wenn es nur Schwebendes aus dem offenen
     Wizard ist (nw). Bis dahin brauchte der Knopf etwas im Buch;
     wer aus dem Wizard heraus eine falsche Zuordnung sah, fand hier
     keinen Weg, sie loszuwerden. Was der Knopf löst, entscheiden
     die Fenster selbst (impDel in js/dialogs/item.js und
     js/dialogs/kakeibo-betraege.js): das Buch, die schwebende
     Zuordnung oder beides — siehe impWipeAsk unten. */
  const aside=document.createElement('aside');
  aside.className='impside';
  /* **Die Liste steht in denselben drei Zeilen wie das Fenster**
     (30.8.26): Überschrift, Rollfläche, Fußzeile — das Fenster
     wird bei offener Liste zu einem Raster aus zwei Spalten, und
     die Liste nimmt dessen Zeilen als `subgrid` (css/components.css).
     Dadurch fangen beide Rollflächen auf derselben Höhe an und
     hören auf derselben auf: man rollt links und rechts in
     symmetrischen Hälften. Vorher stand die Liste absolut von
     Fensterkante zu Fensterkante, und ein gemessenes Polster
     (--impalign) schob nur ihre erste Gruppe auf die Höhe des
     ersten Blocks — der Anfang stimmte, das Ende nicht.

     **Der Löschknopf wohnt in dieser Fußzeile** und nicht mehr in
     der des Fensters: er gehört zur Liste, und wo die Liste nicht
     zu sehen ist, soll er es auch nicht sein. */
  aside.innerHTML=`<h4>${t('impv.title')}</h4>`+impSideRows(data,ask)+`<div class="impfoot"></div>`;
  boxEl.appendChild(aside);
  const foot=aside.querySelector('.impfoot');
  if(del){del.hidden=false;foot.appendChild(del);}
  const narrow=()=>matchMedia('(max-width:980px)').matches;
  const lab=()=>{btn.textContent=t(boxEl.classList.contains('impon')&&!narrow()?'impv.hide':'impv.show');};
  /* **Sind Daten da, steht die Liste offen** — sobald das Fenster
     dafür breit genug ist. Sie ist der Grund, warum das Fenster
     aus dem Import heraus geöffnet wird; erst aufklappen zu müssen
     hieße, den Weg zweimal zu gehen. `ui.impPanel` merkt sich nur
     eine ausdrückliche Wahl (Sitzung, nie Datei) — deshalb die
     Frage auf `!==false` und nicht auf „wahr". */
  if(ui.impPanel!==false&&!narrow()){
    /* Geht das Fenster mit sichtbarer Liste auf, kommt die Liste
       erst, wenn das Fenster zu Ende gefallen ist (fina-dropin,
       220 ms): der Kasten ist von Anfang an breit, die Liste darin
       unsichtbar, dann fährt sie von rechts herein. */
    boxEl.classList.add('impon'); aside.style.visibility='hidden';
    setTimeout(()=>{ if(!boxEl.isConnected||!boxEl.classList.contains('impon')) return;
      aside.style.visibility=''; aside.classList.add('impin'); setTimeout(()=>aside.classList.remove('impin'),300); },260);
  }
  btn.hidden=false;
  lab();
  impScrollToAsk(aside);
  btn.onclick=()=>{
    /* Zu schmal für die Spalte: dieselben Daten als Fenster darüber
       — geschlossen wie jedes Fenster, auch mit Escape. Der
       Löschknopf zieht mit hinein; es ist **derselbe** Knopf und
       keine zweite Kopie, sonst liefen zwei Verdrahtungen für
       dieselbe Sache auseinander. */
    if(narrow()){
      const m=document.createElement('div');
      m.className='modal';m.style.zIndex=70;
      m.innerHTML=`<div class="box narrow impovl"><h3>${t('impv.title')}</h3>`
        +impSideRows(data,ask)
        +`<div class="row-end"><button class="btn" id="impOvlX">${t('g.close')}</button></div></div>`;
      document.body.appendChild(m);
      impScrollToAsk(m);
      const end=m.querySelector('.row-end');
      if(del)end.insertBefore(del,end.firstChild);
      tabThroughFields(m);
      const x=m.querySelector('#impOvlX');
      const back=()=>{if(del)foot.appendChild(del);m.remove();};
      x.onclick=back;
      /* Auch der Weg über Escape und den Klick daneben (js/ui.js)
         muss den Knopf zurückbringen — sonst nähme das Fenster ihn
         mit hinaus. */
      new MutationObserver((r,o)=>{if(!m.isConnected){o.disconnect();if(del&&!del.isConnected)foot.appendChild(del);}})
        .observe(document.body,{childList:true});
      x.focus();
      return;
    }
    /* **In zwei Zügen** (Lex, 6.9.26 spät): beim Einblenden wird erst
       das Fenster breiter — der Inhalt rückt mit der linken Kante
       nach links, rechts kommt Platz —, dann fährt die Liste von
       rechts herein. Beim Ausblenden erst die Liste nach rechts
       hinaus, dann das Fenster schmaler. Die Größenänderung läuft
       nicht über den ResizeObserver (der käme ein Bild zu spät und
       ließe das Fenster einmal springen), sondern sofort über
       flipBox mit der gemessenen alten Größe. */
    const from={w:boxEl.offsetWidth,h:boxEl.offsetHeight};
    clearTimeout(boxEl._impT);
    if(!boxEl.classList.contains('impon')){
      aside.classList.remove('impout'); aside.style.visibility='hidden';
      boxEl.classList.add('impon'); ui.impPanel=true; lab();
      const moved=flipBox(boxEl,from);
      boxEl._impT=setTimeout(()=>{ aside.style.visibility=''; aside.classList.add('impin');
        setTimeout(()=>aside.classList.remove('impin'),300); },moved?FLIP_MS:0);
    } else {
      /* Ausblenden **in einem Zug** (Lex): die Liste fährt nach rechts
         hinaus, während das Fenster schon schmaler wird. Dafür löst
         sich die Liste aus dem Raster — absolut an ihrer Stelle im
         Fenster —, damit der Kasten ohne sie umbauen und mit seinem
         Ausschnitt zusammenfahren kann; danach fällt alles wieder ab. */
      /* Nacheinander (Lex, endgültig): erst fährt die Liste ganz nach
         rechts hinaus, dann wird das Fenster schmaler. Beides zugleich
         sah aus, als klappte das Fenster in sich zusammen. */
      aside.classList.remove('impin'); aside.classList.add('impout');
      boxEl._impT=setTimeout(()=>{
        const f2={w:boxEl.offsetWidth,h:boxEl.offsetHeight};
        aside.classList.remove('impout'); boxEl.classList.remove('impon'); ui.impPanel=false; lab();
        flipBox(boxEl,f2);
      },230);
    }
  };
}

/* ── Der Klapp-Pfeil ist ein Dreieck, das herausfährt ──────────
   Ein Dreieck aus Rändern (.tri in css/components.css), kein
   Schriftzeichen: ▶ und ▼ sind je Schrift verschieden breit, und
   ein Zeichen lässt sich nicht „breiter, aber nicht länger"
   machen. `down` dreht es um 90° — offen zeigt der Pfeil nach
   unten, dorthin, wo das Aufgeklappte steht. Benutzt von der
   Auswertung (anaBar), den Kartenköpfen (foldBtn) und den
   Blockzeilen der Matrix (yfoldBtn). */
const tri=down=>`<i class="tri${down?' down':''}" aria-hidden="true"></i>`;

/* ── Ein ausgefahrener Pfeil bleibt beim Neuzeichnen stehen ────
   Die Pfeile sind in Ruhe nicht da und fahren erst heraus, wenn
   die Maus über der Zeile steht (css/layout.css, css/matrix.css).
   Ein Klick zeichnet die Ansicht aber neu, und der neue Pfeil
   finge dann wieder von links an — obwohl die Maus nie weg war.

   Deshalb merkt sich `hovKeys`, worüber die Maus gerade steht
   (das Merkmal data-hk: `ana`, `fold:in`, `yfold:out` …), und
   bindHoverStill() gibt einem frisch gebauten Element mit
   demselben Schlüssel die Klasse `still`: ausgefahren, ohne
   Bewegung. Erst wenn die Maus die Zeile verlässt, fällt die
   Klasse — und dann fährt der Pfeil wie gewohnt zurück. Ist die
   Maus während des Neuzeichnens weitergezogen, kam von der alten
   Zeile kein mouseleave mehr; zwei Bilder später wird deshalb
   nachgesehen, ob sie noch darüber steht. Aufgerufen in wire(). */
const hovKeys=new Set();
/* ── Und beim Klappen dreht sich der Pfeil ──────────────────────
   Der Klick baut die Zeile neu, und der neue Pfeil stünde sofort
   in seiner neuen Richtung. Deshalb merkt sich `hovState` je
   Schlüssel, wohin der Pfeil zuletzt zeigte; steht die neue Zeile
   unter der Maus (`still`) und zeigt ihr Pfeil anders, wird er
   erst ohne Übergang in die alte Richtung gestellt und dann
   losgelassen — die CSS-Transition (.tri, .c2fold svg in
   css/components.css) dreht ihn in derselben Zeit, in der er
   herausfährt. Der drehende Teil ist das Dreieck (.tri) oder das
   SVG des Import-Pfeils; „unten" heißt .tri.down bzw. .c2fold.open. */
const hovState=new Map();
function spinPart(el){
  const n=el.querySelector('.tri, .c2fold svg'); if(!n) return null;
  return {n,down:n.classList.contains('down')||!!n.closest('.c2fold.open')};
}
function bindHoverStill(root){
  const els=[...root.querySelectorAll('[data-hk]')];
  /* Ein Schlüssel ohne Element ist ein Rest der vorigen Ansicht —
     die Zeile, über der die Maus stand, gibt es nicht mehr. */
  [...hovKeys].forEach(k=>{ if(!els.some(e=>e.getAttribute('data-hk')===k)) hovKeys.delete(k); });
  els.forEach(el=>{
    const k=el.getAttribute('data-hk'), sp=spinPart(el);
    if(hovKeys.has(k)){
      el.classList.add('still');
      const was=hovState.get(k);
      if(sp&&was!==undefined&&was!==sp.down){
        sp.n.style.transition='none'; sp.n.style.transform=was?'rotate(90deg)':'rotate(0deg)';
        sp.n.getBoundingClientRect();
        sp.n.style.transition=''; sp.n.style.transform='';
      }
    }
    if(sp) hovState.set(k,sp.down);
    el.addEventListener('mouseenter',()=>hovKeys.add(k));
    el.addEventListener('mouseleave',()=>{hovKeys.delete(k);el.classList.remove('still');});
  });
  requestAnimationFrame(()=>requestAnimationFrame(()=>els.forEach(el=>{
    if(el.classList.contains('still')&&!el.matches(':hover')){
      hovKeys.delete(el.getAttribute('data-hk'));el.classList.remove('still');
    }
  })));
}

/* ── Ein Geist: die Kopie eines Elements, das gerade geht ──────
   (seit 6.9.26) Fenster, Menüs und Ansichten werden mit einem
   nackten `remove()` oder per innerHTML ersetzt — was hinausfahren
   soll, ist dann schon weg. ghostOf() baut aus dem alten Element
   eine Kopie fürs Auge: ohne Kennungen (getElementById fände sonst
   den Geist), ohne Klick (pointer-events in CSS), ohne Fokus
   (inert), mit den Feldwerten und Rollstellungen des Originals,
   sonst spränge der Inhalt im letzten Bild. Mit `rect` steht sie
   fest an genau dieser Stelle des Bildschirms — für alles, was
   nicht ohnehin den ganzen Schirm füllt. Sie entfernt sich nach
   der Animation selbst. Das Rechteck muss **vor** dem Entfernen
   gemessen werden: ein Element außerhalb des Dokuments hat keins. */
function ghostOf(n,cls,rect){
  const g=n.cloneNode(true);
  const src=n.querySelectorAll('input,textarea,select'), dst=g.querySelectorAll('input,textarea,select');
  /* Ein Datei-Feld lässt sich nicht befüllen — der Browser wirft
     dabei (InvalidStateError), und das brach das Wählen der CSV im
     ersten Schritt des Imports. Sein Wert ist ohnehin unsichtbar. */
  src.forEach((s,i)=>{ if(!dst[i]||s.type==='file') return;
    if(s.type==='checkbox'||s.type==='radio') dst[i].checked=s.checked; else dst[i].value=s.value; });
  g.removeAttribute('id'); g.className=cls; g.setAttribute('inert','');
  g.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
  /* data-hk bleibt: daran hängt in css/layout.css, dass die
     Klapp-Pfeile in Ruhe unsichtbar sind — ohne das Merkmal stünden
     sie in der Kopie plötzlich alle da. Angefasst wird die Kopie
     ohnehin nicht (inert, pointer-events). */
  if(rect) g.style.cssText+=`;position:fixed;top:${rect.top}px;left:${rect.left}px;right:auto;bottom:auto;width:${rect.width}px;height:${rect.height}px;margin:0`;
  document.body.appendChild(g);
  const sa=n.querySelectorAll('*'), da=g.querySelectorAll('*');
  sa.forEach((e,i)=>{ if(da[i]&&(e.scrollTop||e.scrollLeft)){ da[i].scrollTop=e.scrollTop; da[i].scrollLeft=e.scrollLeft; } });
  g.addEventListener('animationend',()=>g.remove());
  setTimeout(()=>g.remove(),700);
  return g;
}
/* Ein Menü oder Aufklappfenster geht: Geist an Ort und Stelle mit
   der Klasse fürs Zusammenklappen, dann weg damit. Für alles, das
   sich mit `remove()` schließt (die Menüs des CSV-Imports). */
function popOut(el){
  if(!el||!el.isConnected){ if(el) el.remove(); return; }
  ghostOf(el,el.className+' popout',el.getBoundingClientRect());
  el.remove();
}
/* Die Aufklappmenüs der Filterzeile leben in #view und gehen mit
   jedem render() — auch dann, wenn sie danach wieder dastehen
   (ein Wert gewählt, das Menü bleibt offen). Deshalb in zwei
   Schritten: vor dem Zeichnen merken (Rechteck und Element), nach
   dem Zeichnen nachsehen, welches fehlt — nur das bekommt seinen
   Geist. Erkannt wird ein Menü an data-dm (fltDrop, mobiles Menü). */
function snapMenus(root){
  return [...root.querySelectorAll('.dropmenu[data-dm]')].map(el=>({key:el.dataset.dm,el,rect:el.getBoundingClientRect()}));
}
function settleMenus(pending){
  pending.forEach(p=>{ if(!document.querySelector(`.dropmenu[data-dm="${p.key}"]`)) ghostOf(p.el,p.el.className.replace(' popin','')+' popout',p.rect); });
}

/* ── Die neue Ansicht fährt über die alte (seit 6.9.26) ──────────
   Monat · Jahr · Prognose · Import Details stehen in dieser Reihe
   (VIEWS). Wer nach rechts wechselt, sieht die neue Ansicht von
   rechts über die alte fahren; nach links umgekehrt. **Die alte
   bleibt stehen** und wird überlagert (Lex, 6.9.26 spät; bis dahin
   fuhr sie zur Seite hinaus). Aufgerufen in render() **vor** dem
   Ersetzen von #view: der Geist der alten Ansicht legt sich genau
   über ihre Fläche, unbewegt und unter der neuen (z-index in
   css/components.css); #view bekommt danach die Klasse fürs
   Hereinkommen und liegt so lange darüber. Beides fällt am Ende
   der Fahrt wieder ab. Solange die neue von der Seite kommt, ragt
   sie über den rechten Rand — die Klasse viewslide am
   Wurzelelement unterdrückt so lange den waagerechten Rollbalken.
   dir>0 heißt: die neue kommt von rechts. */
let viewSlideT=0, viewGhostTop=0, viewGhostBottom=0;
const VIEW_MS=460;
function slideViewOut(vbox,dir){
  const r=vbox.getBoundingClientRect(); viewGhostTop=r.top; viewGhostBottom=Math.min(r.bottom,innerHeight);
  const g=ghostOf(vbox,'viewghost stay',{top:r.top,left:r.left,width:r.width,height:Math.min(r.height,innerHeight-r.top)});
  setTimeout(()=>g.remove(),VIEW_MS+30);
}
function slideViewIn(vbox,dir){
  vbox.classList.remove('in-left','in-right');
  /* Die hereinfahrende Ansicht deckt die alte ganz zu: sie trägt
     dafür den Seitengrund und ist mindestens so hoch wie der Geist
     darunter (bis zum unteren Fensterrand) — sonst schienen die
     beiden Ansichten für einen Moment ineinander. */
  const top=vbox.getBoundingClientRect().top;
  /* Fängt die neue Ansicht tiefer an als die alte (die Ansichten
     haben verschieden viel Luft nach oben), bliebe darüber ein
     Streifen des Geistes zu sehen — der ::before-Streifen deckt ihn. */
  vbox.style.setProperty('--viewtop',top+'px');
  vbox.style.setProperty('--viewgap',Math.max(0,top-viewGhostTop)+'px');
  /* Der Streifen unter der Ansicht reicht genau bis zur Unterkante
     der Kopie — nicht weiter, sonst wüchse die Seite für die Dauer
     der Fahrt. */
  vbox.style.setProperty('--viewfill',Math.max(0,viewGhostBottom-vbox.getBoundingClientRect().bottom)+'px');
  void vbox.offsetWidth;
  vbox.classList.add(dir>0?'in-right':'in-left');
  document.documentElement.classList.add('viewslide');
  clearTimeout(viewSlideT);
  viewSlideT=setTimeout(()=>{ document.documentElement.classList.remove('viewslide'); vbox.classList.remove('in-left','in-right'); },VIEW_MS+30);
}
/* ── Ein Fenster ändert seine Größe weich (seit 6.9.26) ──────────
   Ein Schritt im Import, ein anderer Bereich der Einstellungen: der
   Kasten (.box) wird größer oder kleiner, und bisher sprang er. Ein
   ResizeObserver merkt sich je Kasten die letzte Größe; ändert sie
   sich, ruft er flipBox().

   **Animiert werden Ausschnitt und Lage, nicht das Maß.** Breite
   und Höhe zu bewegen hieße, den ganzen Kasten in jedem Bild neu zu
   setzen — mit den Tabellen des Imports ruckelte das sichtbar.
   clip-path und transform laufen auf der Grafikkarte. Das Fenster
   ist zentriert; wächst es, wandert seine Oberkante um die halbe
   Differenz nach oben. Damit der Inhalt — das Menü der
   Einstellungen — an dieser Kante hängt und mitfährt, wird der
   Kasten so verschoben, dass seine Oberkante zu Beginn auf der
   alten liegt, und fährt dann an seinen Platz; der Ausschnitt gibt
   dabei unten frei, was dazukommt. **Schrumpft** er, behält er für
   die Dauer die alten Maße, fährt um die halbe Differenz nach unten
   und der Ausschnitt schließt sich unten; erst danach fallen die
   Maße ab — die neue Oberkante liegt dann genau dort, wo er
   angekommen ist, nichts springt. `round 10px` hält die Rundung.
   `delay` lässt den Kasten warten, während der alte Inhalt noch
   ausblendet (boxSwap). Beim Ziehen des Browserfensters läuft
   nichts (lastResize): dort führt die Hand. Liefert, ob etwas
   animiert wurde. */
const boxSize=new WeakMap();
let lastResize=0; window.addEventListener('resize',()=>{lastResize=Date.now();});
const FLIP_MS=240;
function flipBox(box,from,delay=0){
  const to={w:box.offsetWidth,h:box.offsetHeight};
  boxSize.set(box,to);
  if(!from||(Math.abs(from.w-to.w)<1&&Math.abs(from.h-to.h)<1)) return false;
  if(Date.now()-lastResize<300) return false;
  /* Angehängt wird oben links (seit 6.9.26 spät, Lex): wird das
     Posten-Fenster breiter, weil die Importdaten rechts dazukommen,
     rückt sein Inhalt nach links und die Liste fährt rechts heraus —
     von der Mitte aus wüchse es nach beiden Seiten, und man sähe den
     Inhalt zur Seite wandern, ohne dass rechts etwas käme. */
  const dw=to.w-from.w, dh=to.h-from.h, grow=dw>=0&&dh>=0;
  const ins=(bot,right)=>`inset(0px ${Math.max(0,right)}px ${Math.max(0,bot)}px 0px round 10px)`;
  box.dataset.flip='1';
  /* Ohne Wechsel des Inhalts (der ResizeObserver hat gerufen) ist
     der neue Inhalt schon da: was .swapfade trägt, wird für die
     Dauer der Bewegung verborgen und blendet danach ein — der
     Inhalt erscheint erst, wenn das Fenster seine Größe hat. */
  if(!delay&&box.querySelector('.swapfade')&&!box.classList.contains('swapping')){
    box.classList.add('swapping'); clearTimeout(box._swapT);
    box._swapT=setTimeout(()=>box.classList.remove('swapping'),FLIP_MS);
  }
  box.style.transition='none';
  if(grow){ box.style.clipPath=ins(dh,dw); box.style.transform=`translate(${dw/2}px,${dh/2}px)`; }
  else { /* max-width/max-height lösen: ein Kasten, der schmaler wird,
            weil seine Klasse jetzt eine kleinere max-width hat, ließe
            sich sonst nicht auf den alten Maßen halten. */
         box.style.maxWidth='none'; box.style.maxHeight='none';
         box.style.width=from.w+'px'; box.style.height=from.h+'px'; box.style.overflow='hidden';
         box.style.clipPath=ins(0,0); box.style.transform='translate(0px,0px)'; }
  box.getBoundingClientRect();
  box.style.transition=`clip-path .22s ease-out ${delay}ms,transform .22s ease-out ${delay}ms`;
  if(grow){ box.style.clipPath=ins(0,0); box.style.transform='translate(0px,0px)'; }
  else { box.style.clipPath=ins(-dh,-dw); box.style.transform=`translate(${-dw/2}px,${-dh/2}px)`; }
  clearTimeout(box._flipT);
  box._flipT=setTimeout(()=>{ ['transition','clipPath','transform','width','height','overflow','maxWidth','maxHeight'].forEach(k=>box.style[k]='');
    delete box.dataset.flip; boxSize.set(box,{w:box.offsetWidth,h:box.offsetHeight}); },delay+FLIP_MS);
  return true;
}

/* ── Der Inhalt eines Fensters wechselt (seit 6.9.26) ─────────────
   Ein anderer Bereich der Einstellungen, der nächste Schritt im
   Import: erst blendet der alte Inhalt aus, dann nimmt das Fenster
   seine neue Größe an (flipBox, verzögert), dann blendet der neue
   Inhalt ein — auch bei gleicher Größe. `mutate` baut den neuen
   Inhalt; was dabei aus- und einblendet, trägt die Klasse .swapfade
   (die Bereiche der Einstellungen, die Arbeitsfläche des Imports),
   alles andere — Menü, Kopfzeile — bleibt stehen und fährt mit dem
   Kasten. Der alte Inhalt ist als Geist des ganzen Kastens an
   seiner Stelle (.boxslide-Rahmen), damit die Regeln von
   :is(.modal,…) .box greifen. */
const SWAP_MS=150;
function boxSwap(box,mutate){
  const r=box.getBoundingClientRect(), from={w:box.offsetWidth,h:box.offsetHeight};
  const wrap=document.createElement('div'); wrap.className='boxslide';
  wrap.style.cssText=`top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px`;
  document.body.appendChild(wrap);
  const g=ghostOf(box,box.className.replace(/\bswapping\b/,'')+' fadeout');
  g.style.cssText='width:100%;height:100%;max-width:none;max-height:none';
  wrap.appendChild(g);
  g.addEventListener('animationend',()=>wrap.remove()); setTimeout(()=>wrap.remove(),700);
  box.classList.add('swapping');
  mutate();
  const moved=flipBox(box,from,SWAP_MS);
  clearTimeout(box._swapT);
  box._swapT=setTimeout(()=>box.classList.remove('swapping'),SWAP_MS+(moved?FLIP_MS:0));
}

/* ── Ein Bereich klappt zu oder auf (seit 6.9.26) ───────────────
   Die drei Karten der Monatsansicht und die drei Blöcke der
   Jahresmatrix. render() baut alles neu, deshalb in zwei Schritten
   um das Zeichnen herum (aufgerufen aus render(), wenn ui.foldAnim
   gesetzt ist — toggleFold in js/app.js setzt es):

   **Vorher** (foldSnap) merkt sich jedes Element mit data-fk sein
   Rechteck: die Karten (`card:in` …) und ihre Tabellen
   (`body:in` …) im Monat, die tbody-Stücke der Matrix (`blk:n`).
   **Nachher** (foldPlay) fährt, was noch da ist und seine Höhe
   gewechselt hat, per transform von der alten an die neue Stelle
   (FLIP). Was verschwunden ist — die Tabelle einer zugeklappten
   Karte, die Zeilen eines zugeklappten Blocks — bleibt als Geist
   an seiner Stelle und klappt von unten her zu (.foldghost,
   clip-path). Was neu da ist, klappt auf: die Tabelle einer Karte
   über ihren Ausschnitt (.foldin), die Zeilen eines Blocks über die
   Deckkraft (.foldin-row — Zeilen einer Tabelle teilen sich keinen
   Ausschnitt). Alles transform, opacity, clip-path: nichts davon
   setzt die Seite neu. */
const bodyRows=tb=>[...tb.querySelectorAll(':scope>tr')].filter(tr=>!tr.matches('.spacer,.sec,.ghead'));
/* Die Kopie verschwundener Zeilen — Matrix wie Import: eine eigene
   Tabelle derselben Klasse, Spaltenbreiten aus der Kopfzeile der
   neuen Tabelle (table-layout fixed), so breit wie das Original und
   um dessen Rollstand versetzt; nur der sichtbare Teil der
   Rollfläche, damit die Kante beim Zuklappen im Bild bleibt. */
function rowsGhost(root,rows,scrollSel){
  if(!rows.length) return;
  const sc=root.querySelector(scrollSel), tbl=sc&&sc.querySelector('table'); if(!sc||!tbl) return;
  const sr=sc.getBoundingClientRect();
  const top=Math.max(rows[0].rect.top,sr.top), bottom=Math.min(rows[rows.length-1].rect.bottom,sr.bottom);
  if(bottom<=top) return;
  const g=document.createElement('div'); g.className='foldghost';
  g.style.cssText=`top:${top}px;left:${sr.left}px;width:${sr.width}px;height:${bottom-top}px`;
  const inner=document.createElement('div'); inner.style.cssText='overflow:hidden;width:100%;height:100%';
  const t2=document.createElement('table'); t2.className=tbl.className;
  t2.style.cssText=`table-layout:fixed;width:${tbl.offsetWidth}px;margin-top:${rows[0].rect.top-top}px;margin-left:${tbl.getBoundingClientRect().left-sr.left}px`;
  const cg=document.createElement('colgroup'), hdr=tbl.tHead&&tbl.tHead.rows[0];
  if(hdr) [...hdr.cells].forEach(c=>{ const col=document.createElement('col'); col.style.width=c.getBoundingClientRect().width+'px'; cg.appendChild(col); });
  t2.appendChild(cg);
  const tb=document.createElement('tbody'); rows.forEach(w=>tb.appendChild(w.el.cloneNode(true))); t2.appendChild(tb);
  inner.appendChild(t2); g.appendChild(inner); g.setAttribute('inert','');
  document.body.appendChild(g); g.addEventListener('animationend',()=>g.remove()); setTimeout(()=>g.remove(),700);
}
function foldSnap(root){
  const m=new Map();
  root.querySelectorAll('[data-fk]').forEach(el=>{
    const rows=el.matches('tbody')?bodyRows(el).map(tr=>({el:tr,rect:tr.getBoundingClientRect()})):null;
    m.set(el.dataset.fk,{el,rect:el.getBoundingClientRect(),rows:rows&&rows.length?rows:null});
  });
  return m;
}
function foldPlay(root,snap){
  const now=new Map(); root.querySelectorAll('[data-fk]').forEach(el=>now.set(el.dataset.fk,el));
  const SCROLL='.yearscroll, .c2top .c2scroll';
  /* 1) Fahren, was geblieben ist */
  now.forEach((el,k)=>{
    const was=snap.get(k); if(!was) return;
    /* Weiter als ein Fenster fährt nichts: was von weit unten kommt
       oder weit nach unten geht, ist am anderen Ende ohnehin nicht
       im Bild — und ein Weg über 2000 px in 280 ms ist kein
       Gleiten mehr. */
    const dy=Math.max(-innerHeight,Math.min(innerHeight,was.rect.top-el.getBoundingClientRect().top));
    if(Math.abs(dy)<1) return;
    el.style.transition='none'; el.style.transform=`translateY(${dy}px)`;
    el.getBoundingClientRect();
    el.style.transition='transform .28s cubic-bezier(.4,0,.2,1)'; el.style.transform='';
    setTimeout(()=>{el.style.transition='';},320);
  });
  /* 2) Zuklappen: Geist der Tabelle einer Karte … */
  snap.forEach((was,k)=>{
    if(k.startsWith('body:')&&!now.has(k)){
      /* Nur der sichtbare Teil: eine Tabelle über zwei Bildschirme
         klappte sonst in 280 ms von ganz unten zu — für das Auge ein
         Sprung. Ohne Karte darum (der Zeitstrahl) bleibt es beim
         nackten Geist. */
      const vis=Math.min(was.rect.bottom,innerHeight)-was.rect.top; if(vis<=0) return;
      const card=was.el.closest('.card');
      const g=document.createElement('div'); g.className=(card?card.className.replace(/\bfolded\b/,'')+' ':'')+'foldghost';
      g.style.cssText=`top:${was.rect.top}px;left:${was.rect.left}px;width:${was.rect.width}px;height:${vis}px`;
      g.appendChild(was.el.cloneNode(true)); g.setAttribute('inert','');
      document.body.appendChild(g); g.addEventListener('animationend',()=>g.remove()); setTimeout(()=>g.remove(),700);
    }
    /* … und der Zeilen eines Blocks (Matrix wie Import) */
    if(k.startsWith('blk:')&&was.rows){
      const el=now.get(k); if(el&&bodyRows(el).length) return;
      rowsGhost(root,was.rows,SCROLL);
    }
  });
  /* 2b) Zuklappen eines Ziels im Import: seine Quellzeilen
     (src:<tid>:n) sind weg — als Gruppe je Ziel. Ist das Ziel selbst
     mit weg (sein Block ist zugeklappt), deckt das der Block-Geist. */
  const gone={};
  snap.forEach((was,k)=>{ if(k.startsWith('src:')&&!now.has(k)){ const tid=k.slice(4,k.lastIndexOf(':')); if(now.has('row:'+tid)) (gone[tid]=gone[tid]||[]).push(was); } });
  Object.values(gone).forEach(list=>{ list.sort((a,b)=>a.rect.top-b.rect.top); rowsGhost(root,list,SCROLL); });
  /* 3) Aufklappen */
  now.forEach((el,k)=>{
    if(k.startsWith('src:')&&!snap.has(k)) el.classList.add('foldin-row');
    if(k.startsWith('body:')&&!snap.has(k)){
      /* Aufklappen über den Ausschnitt — aber nur über den Teil, der
         im Bild ist: die Kante läuft von der Oberkante bis zum
         unteren Fensterrand, der Rest darunter ist ohnehin verdeckt. */
      const H=el.offsetHeight, R=Math.max(0,Math.min(H,innerHeight-el.getBoundingClientRect().top));
      el.style.transition='none'; el.style.clipPath=`inset(0 0 ${H}px 0)`; el.style.opacity='0';
      el.getBoundingClientRect();
      el.style.transition='clip-path .28s cubic-bezier(.4,0,.2,1),opacity .2s ease-out';
      el.style.clipPath=`inset(0 0 ${Math.max(0,H-R)}px 0)`; el.style.opacity='';
      setTimeout(()=>{el.style.transition='';el.style.clipPath='';},320);
    }
    if(k.startsWith('blk:')){ const was=snap.get(k); if(was&&!was.rows) bodyRows(el).forEach(tr=>tr.classList.add('foldin-row')); }
  });
}

/* Gestellt wird im nächsten Bild, nicht im Beobachter selbst: wer
   dort die Größe ändert, bekommt vom Browser „ResizeObserver loop
   completed with undelivered notifications" — harmlos, aber eine
   Zeile in der Konsole bei jedem Wachsen. */
const boxWatch=(typeof ResizeObserver==='undefined')?null:new ResizeObserver(es=>es.forEach(e=>{
  const b=e.target; if(b.dataset.flip||!b.isConnected) return;
  const was=boxSize.get(b); boxSize.set(b,{w:b.offsetWidth,h:b.offsetHeight});
  requestAnimationFrame(()=>{ if(b.isConnected&&!b.dataset.flip) flipBox(b,was); });
}));

/* ── Fenster fahren nach oben hinaus (seit 6.9.26) ──────────────
   Geschlossen wird ein Fenster an vielen Stellen mit einem nackten
   `box.remove()` — und dann ist es weg, bevor irgendetwas laufen
   könnte. Statt jede Stelle umzubauen, sieht ein MutationObserver
   am Rumpf zu: fällt ein .modal heraus, legt er an seine Stelle
   einen Geist (.modalghost, siehe ghostOf), der per CSS nach oben
   hinausfährt. Fällt im selben Zug ein neues Fenster herein (die
   Einstellungen bauen sich bei „+", Entfernen, Sortieren komplett
   neu auf), gibt es keinen Geist, und das neue trägt .noanim —
   sonst flöge das alte hinaus, während das neue fällt, und man
   sähe zwei; sein Kasten wächst stattdessen aus der Größe des
   alten (flipBox). Für den Code ist der Geist unsichtbar: er trägt
   die Klasse .modal nicht, jede Abfrage nach offenen Fenstern
   übersieht ihn. Hier werden auch die Kästen neuer Fenster beim
   ResizeObserver angemeldet. */
(function(){
  if(!document.body||typeof MutationObserver==='undefined') return;
  const isModal=n=>n.nodeType===1&&n.classList.contains('modal');
  new MutationObserver(recs=>{
    const added=[],removed=[];
    recs.forEach(r=>{ r.addedNodes.forEach(n=>{if(isModal(n))added.push(n);});
                      r.removedNodes.forEach(n=>{if(isModal(n))removed.push(n);}); });
    /* Ein Neuaufbau ist nur, was durch **dasselbe** Fenster ersetzt
       wird — erkannt an der Klasse des Kastens (die Einstellungen
       durch die Einstellungen). Geht dabei zugleich ein anderes
       Fenster zu — das Strukturfenster über den Einstellungen, die
       sich beim Zurückkommen neu bauen —, fährt das nach oben hinaus
       wie jedes andere; sonst schiene es in die Einstellungen
       hinüberzugehen. */
    const kind=n=>{ const b=n.querySelector('.box'); return b?b.className.replace(/\b(swapping|in-left|in-right)\b/g,'').trim():''; };
    const left=[...removed];
    added.forEach(n=>{
      const b=n.querySelector('.box');
      const twin=left.findIndex(o=>kind(o)===kind(n));
      if(twin>=0){ const oldBox=left[twin].querySelector('.box'); left.splice(twin,1);
        n.classList.add('noanim'); if(b&&oldBox) flipBox(b,boxSize.get(oldBox)); }
      if(b&&boxWatch){ if(!boxSize.has(b)) boxSize.set(b,{w:b.offsetWidth,h:b.offsetHeight}); boxWatch.observe(b); }
    });
    left.forEach(n=>{ if(!n.isConnected) ghostOf(n,'modalghost'); });
  }).observe(document.body,{childList:true,subtree:true});
})();
