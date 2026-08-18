/* ══════════════════════════════════════════════════════════════
   FINA — Ablaufsteuerung
   Zeichnet die gewählte Ansicht, hängt danach alle Klicks an und
   startet die Anwendung. Diese Datei wird als letzte geladen.
   ══════════════════════════════════════════════════════════════ */

/* ── Der Fokus und das Suchfeld ───────────────────────────────
   Solange im Suchfeld etwas steht, ist es der Platz, an dem
   gearbeitet wird: man tippt einen Begriff, macht unten etwas
   damit und tippt den nächsten. Der Fokus kehrt deshalb nach jedem
   Neuzeichnen dorthin zurück — aber nur, wenn dort etwas steht. Ein
   leeres Feld filtert nicht; die Schreibmarke hätte darin nichts
   verloren, und bei jedem Haken dorthin zu springen wäre lästig.

   ui.qFocus sagt, **wie** der Fokus zurückkommt:

     'end'  die Schreibmarke ans Ende — das setzt nur das Feld
            selbst, während getippt wird.
     'all'  der Begriff steht markiert da, das nächste Zeichen
            ersetzt ihn. So kommt man von überall sonst zurück:
            wer weitermacht, sucht meistens das Nächste.

   Wer nach dem Neuzeichnen nichts anderes zu tun hat, landet auch
   ohne Zutun wieder dort (siehe wire()). */
const keepQFocus=()=>{ ui.qFocus=(ui.q||'').trim()?'all':false; };

/* ── Die mobile Fassung ───────────────────────────────────────
   Unter 700 px bauen die drei Ansichten Monat, Jahr und Prognose
   ein eigenes Layout (Design in _TMP/Design - Mobile UI for FINA):
   Karten statt Matrix, Kacheln statt Kennzahlenleiste, unten die
   Reiterleiste. **Die eine Frage stellt jeder hier**: `isMobile()`
   liest die Fensterbreite, `body.mobile` trägt sie ins CSS
   (css/mobile.css) — dieselbe Grenze an beiden Stellen, sonst
   passte das Markup der Views nicht zu den Regeln des Stylesheets.

   Wechselt die Breite über die Grenze — Fenster gezogen, Telefon
   gedreht —, wird neu gezeichnet: die Views bauen je nach Antwort
   verschiedenes Markup, ein reiner CSS-Umbau reichte nicht. */
const MOBILE_MQ=matchMedia('(max-width:699px)');
const isMobile=()=>MOBILE_MQ.matches;
MOBILE_MQ.addEventListener('change',()=>render());

/* ── Kopfzeile: feste Beschriftungen, Ansichts- und Monatsreiter ─
   Alles mit data-t bekommt seinen Text aus js/i18n.js, data-ttip
   entsprechend den Tooltip. So wechselt die feste Kopfzeile die
   Sprache mit, ohne dass sie neu gebaut werden muss. */
function renderChrome(){
  document.documentElement.lang=LANG();
  document.querySelectorAll('[data-t]').forEach(el=>{ el.textContent=t(el.dataset.t); });
  document.querySelectorAll('[data-ttip]').forEach(el=>{ el.title=t(el.dataset.ttip); });
  const yl=document.getElementById('yearLbl'); if(yl) yl.textContent=t('app.sub',YEAR);
  /* Der Name wechselt die Sprache mit (FINA Buch / FINA Book) —
     Wortzeichen und Reitertitel kommen deshalb aus t(), nicht aus
     dem HTML (dort steht nur der englische Rückfall).

     Im Browser ist das Wortzeichen ein Link zur Startseite. In der
     App heißt der Web-Client selbst index.html (desktop/sync.mjs) —
     der Klick wäre dort ein stilles Neuladen mitsamt der
     ungespeicherten Arbeit, deshalb verliert der Link sein href
     (die dritte FINA_NATIVE-Stelle, siehe CLAUDE.md). */
  const bh=document.querySelector('.brand h1 a')||document.querySelector('.brand h1');
  if(bh){
    bh.textContent=t('app.name');
    if(bh.tagName==='A'){
      if(window.FINA_NATIVE){ bh.removeAttribute('href'); bh.removeAttribute('title'); }
      else bh.title=t('app.homeTip');
    }
  }
  document.title=t('app.name');

  /* Auf der Begrüßungsseite gibt es nichts zu wählen: weder Monat
     noch Ansicht. Und „Daten hochladen" steht nur dort — im
     geladenen Buch bleiben Speichern und Schließen. */
  /* Auf der Begrüßungsseite bleibt in der Kopfzeile nur die
     Anleitung: Öffnen und Anfangen bietet die Seite selbst an,
     alles andere hat ohne Datei keinen Sinn. Im geladenen Buch
     fehlt umgekehrt „Daten hochladen" — geladen wird auf der
     Seite, gearbeitet in der Anwendung. */
  const wel=!!ui.welcome;
  /* Auch die Anleitung und das Jahr: die Begrüßung ist bewusst
     leer — die Anleitung gehört ins geladene Buch, und ein Jahr
     gibt es ohne Datei noch nicht. */
  ['btnLoad','btnSave','btnBackup','btnUnlink','btnSettings','filePath','btnGuide','yearLbl'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.hidden=wel||id==='btnLoad';
  });

  /* Die Sprachwahl in der Kopfzeile: dieselben Kürzel EN · DE wie
     auf der Begrüßungsseite und den Verkaufsseiten, derselbe Weg
     (data-wlang). Auf der Begrüßungsseite bleibt sie weg — dort
     hat die Seite ihre eigene. */
  const hl=document.getElementById('hdrLangs');
  if(hl){
    hl.hidden=wel;
    hl.innerHTML=LANGS.map(([k,label])=>`<button class="wlang" data-wlang="${k}"
      aria-pressed="${LANG()===k}" title="${label}">${k.toUpperCase()}</button>`).join('');
    /* Verdrahtet gleich hier, wie die Monats- und Ansichtsreiter:
       renderChrome() läuft auch ohne wire() — nach dem
       Sprachwechsel im Einstellungsfenster etwa —, und die frisch
       gebauten Pillen wären sonst bis zum nächsten render() taub. */
    hl.querySelectorAll('.wlang').forEach(b=>b.onclick=()=>{
      if(!chooseLang(b.dataset.wlang)) return;
      if(!ui.welcome) save();
      render();
    });
  }

  /* Der Menüknopf der mobilen Kopfzeile (siehe Webclient.html und
     css/mobile.css). Auf der Begrüßungsseite wäre das Menü leer —
     dort gibt es ihn nicht. */
  const mb=document.getElementById('btnMenu');
  if(mb){
    mb.hidden=wel;
    mb.title=t('app.menu');
    mb.setAttribute('aria-label',t('app.menu'));
  }

  /* Die Jahresansicht füllt den Bildschirm: ihre Matrix rollt
     senkrecht selbst, die Seite darunter soll es nicht auch noch
     tun (siehe body.yearview in css/layout.css und sizeMatrix).
     **Nicht auf dem Telefon**: dort ist das Jahr eine Kartenliste
     und rollt wie jede andere Seite. */
  document.body.classList.toggle('mobile',isMobile());
  document.body.classList.toggle('yearview',!wel&&ui.view==='jahr'&&!isMobile());

  const mEl=document.getElementById('months');
  mEl.setAttribute('aria-label',t('app.chooseMonth'));
  mEl.style.display = (!wel&&ui.view==='monat') ? 'flex' : 'none';
  mEl.innerHTML=MONTHS.map((name,i)=>{
    const m=i+1, pt=monthParts(m);
    const s=pt.total===0?'':(pt.done===pt.total?'done':(pt.done>0?'partial':''));
    return `<button class="mtab${s==='done'?' alldone':''}${m===CUR?' current':''}" role="tab" aria-selected="${ui.month===m}" data-m="${m}"
      title="${t('month.done',pt.done,pt.total)}">${name}<span class="dot ${s}"></span></button>`;
  }).join('');
  /* Auch der Monatswechsel lässt den Fokus im Suchfeld: man hakt
     einen Monat ab, springt in den nächsten und tippt weiter. */
  mEl.querySelectorAll('.mtab').forEach(b=>b.onclick=()=>{ui.month=+b.dataset.m;ui.view='monat';keepQFocus();render();});
  /* Auf dem Telefon zeigt die Leiste nur sieben, acht Monate —
     der gewählte soll darin stehen, nicht rechts außerhalb.
     Gesetzt wird scrollLeft direkt: scrollIntoView zöge die ganze
     Seite mit. */
  if(isMobile()){
    const sel=mEl.querySelector('.mtab[aria-selected="true"]');
    if(sel) mEl.scrollLeft=sel.offsetLeft-(mEl.clientWidth-sel.offsetWidth)/2;
  }

  /* Die Anleitung steht neben der Seite und wechselt die Sprache
     mit, ohne dass man sie schließen muss. */
  renderGuide(); syncGuideBtn();

  const vEl=document.getElementById('views');
  vEl.setAttribute('aria-label',t('app.chooseView'));
  /* Auf dem Telefon entfallen die Reiter oben — dieselben stehen
     unten als .mtabs. Das Inline-display muss das wissen: es
     gewänne sonst gegen jede Regel in css/mobile.css. */
  vEl.style.display=(wel||isMobile())?'none':'flex';
  /* Rechts auf Höhe der Reiter steht, was die Zeichen der
     Jahresmatrix bedeuten — dort ist Platz, und in der Leiste der
     Matrix stünde es zwischen lauter Knöpfen. Nur im Jahr: in den
     anderen Ansichten gibt es diese Zeichen nicht. */
  const key=ui.view==='jahr'?`<span class="viewkey" role="presentation">${t('year.legend')}</span>`:'';
  /* An jedem Reiter steht sein Tastengriff — ein Griff, den niemand
     findet, gibt es nicht. Die Sprechblase ist die einzige Stelle,
     an der die vier Buchstaben stehen; eine eigene Zeile dafür wäre
     der Preis nicht wert. Woher der Buchstabe kommt: VIEW_KEYS
     unten in dieser Datei. */
  vEl.innerHTML=VIEWS.map(([k,l])=>`<button class="vtab" role="tab" aria-selected="${ui.view===k}"
    data-v="${k}" data-tip="${esc(t('view.keyTip',viewKey(k)))}">${l}</button>`).join('')+key;
  vEl.querySelectorAll('.vtab').forEach(b=>b.onclick=()=>{ui.view=b.dataset.v;render();});

  /* Auf dem Telefon stehen dieselben Reiter unten, am Daumen —
     dieselbe Liste (VIEWS), dieselbe Wirkung. Das Element gibt es
     immer (Webclient.html), sichtbar macht es erst css/mobile.css
     unter 700 px; auf der Begrüßungsseite bleibt es weg wie die
     Reiter oben. */
  const mt=document.getElementById('mtabs');
  if(mt){
    mt.hidden=wel;
    mt.setAttribute('aria-label',t('app.chooseView'));
    mt.innerHTML=VIEWS.map(([k,l])=>`<button class="mvtab" role="tab"
      aria-selected="${ui.view===k}" data-v="${k}">${l}</button>`).join('');
    mt.querySelectorAll('.mvtab').forEach(b=>b.onclick=()=>{ui.view=b.dataset.v;render();});
  }
}

/* ── Leisten, die stehen bleiben ──────────────────────────────
   Die Kopfzeile klebt oben, alles mit .stickybar klebt darunter:
   die Knopfleiste der Jahresmatrix, die Bedienleiste der
   Flexible Payments, die Kennzahlen von Monat und Prognose. Die
   Höhe der Kopfzeile ist je nach Ansicht verschieden — die
   Monatsreiter gibt es nur im Monat —, deshalb wird sie gemessen
   statt geraten. */
function syncStickyTops(){
  const h=document.querySelector('header'); if(!h) return;
  const top=h.offsetHeight;
  document.querySelectorAll('.stickybar').forEach(el=>{ el.style.top=top+'px'; });

  /* Darunter die Köpfe der Karten: sie kleben unter der Leiste
     der Ansicht (Auswertung und Filterzeile im Monat, Bedienleiste
     in den Flexible Payments). Auch diese Höhen sind je Ansicht
     verschieden — gemessen statt geraten, wie oben. */
  const bar=document.querySelector('#view > .stickybar');
  const base=top+(bar?bar.offsetHeight:0);
  document.querySelectorAll('.card > .sechead').forEach(sh=>{ sh.style.top=base+'px'; });
}

/* ── Die Jahresmatrix ist eine eigene Fläche ──────────────────
   Sie rollt in beiden Richtungen selbst; die Seite rollt in dieser
   Ansicht gar nicht. Genau daran hängt, dass Spaltenköpfe,
   Gesamtzeile und Blockzeilen mit `position:sticky` stehenbleiben:
   sticky richtet sich am nächsten Rollrahmen aus, und der ist jetzt
   die Matrix selbst. Der Browser hält sie fest, ohne dass jemand
   rechnet — deshalb steht hier so wenig.

   Früher rollte die Seite und die Zeilen wurden bei jedem
   Scroll-Ereignis per translateY nachgeschoben. Das lief dem
   Scrollen immer ein Bild hinterher: die Kopfzeile schwamm sichtbar
   und blieb bei jeder verpassten Messung stehen. Kein Maß der Welt
   macht das ruhig — die Rechnung musste weg, nicht schneller
   werden.

   Zu tun bleiben zwei Maße, und beide nur beim Zeichnen:

     die Höhe der Fläche — so viel, wie unter der Knopfleiste bis
     zum unteren Rand des Fensters bleibt, abzüglich der Statuszeile
     darunter,
     --headH und --pinH — die Höhen von Spaltenkopf und Gesamtzeile,
     an denen die Zeilen darunter kleben (css/matrix.css). */
function sizeMatrix(){
  const box=document.getElementById('yearScroll'); if(!box) return;
  const pane=box.parentElement;
  const head=box.querySelector('thead tr:first-child');
  const pin=box.querySelector('tr.balpin');
  if(head) box.style.setProperty('--headH',head.offsetHeight+'px');
  box.style.setProperty('--pinH',(pin?pin.offsetHeight:0)+'px');
  /* Erst die Höhen freigeben, dann messen: sonst misst man die vom
     letzten Mal mit. */
  pane.style.height=''; box.style.height='';
  const top=pane.getBoundingClientRect().top+window.scrollY;
  let h=Math.max(240,window.innerHeight-top);
  pane.style.height=h+'px'; box.style.height=h+'px';
  /* Was danach unter der Fläche noch steht — Statuszeile, Polster —
     macht die Seite wieder rollbar. Es wird nicht geschätzt,
     sondern gemessen und abgezogen: ein Überstand von sieben Pixeln
     reicht, damit die ganze Fläche beim Rollen davonwandert. */
  const over=document.documentElement.scrollHeight-window.innerHeight;
  if(over>0){ h=Math.max(240,h-over); pane.style.height=h+'px'; box.style.height=h+'px'; }
  /* Und zum Schluss der Kniff: die Fläche wird um die Höhe ihres
     waagerechten Rollbalkens **höher** als der Rahmen, der sie
     zeigt — der Balken liegt damit außerhalb und ist weg, ohne dass
     jemand das Rollen selbst in die Hand nehmen müsste.

     Gemessen wird er, nicht geraten: gestaltete Balken sind 11 px
     hoch, überlagernde (macOS) messen 0 und schweben trotzdem über
     der letzten Zeile. Deshalb mindestens 14 px, aber nur, wenn es
     waagerecht überhaupt etwas zu rollen gibt. */
  const c=getComputedStyle(box);
  const by=parseFloat(c.borderTopWidth)+parseFloat(c.borderBottomWidth);
  const bar=box.scrollWidth>box.clientWidth
    ? Math.max(box.offsetHeight-box.clientHeight-by,14) : 0;
  if(bar) box.style.height=(h+bar)+'px';
}

/* Der volle Weg nach jeder Änderung, die Höhen verschiebt:
   Zeichnen, Größenwechsel, die Breite der Anleitung. */
function syncMatrixHead(){
  syncStickyTops();
  sizeMatrix();
}

/* Beim Scrollen ist nichts zu tun: beide Tabellen rollen frei wie
   jede andere, und was oben klebt, hält der Browser über CSS
   (css/matrix.css). Kein Nachrollen, kein Einrasten — wer rollt,
   bestimmt selbst, wo es stehen bleibt.

   Wird das Fenster breiter, hat die Tabelle womöglich nichts mehr
   zu rollen — dann verschwindet die Leiste, und umgekehrt. */
addEventListener('resize',()=>{ syncMatrixHead(); fitRails(); });

/* Zeichnet alles neu und hält dabei die Scrollposition. */
function render(){
  /* „Fast Budget Details" gibt es nur mit Import (siehe
     VIEWS in js/config.js). Steht die Ansicht trotzdem noch —
     nach dem Trennen der Datei, nach einer Datei ohne Buchungen —,
     gäbe es einen Reiter weniger als Ansichten: keiner wäre
     ausgewählt. Dann tritt die Prognose an ihre Stelle, der
     Nachbar in der Reihe. */
  if(ui.view==='kakeibo'&&!hasImport()) ui.view='prognose';

  const sx=window.scrollX, sy=window.scrollY;
  const ysOld=document.getElementById('yearScroll');
  const yTop=ysOld?ysOld.scrollTop:null, yLeft=ysOld?ysOld.scrollLeft:null;

  renderChrome();
  const vbox=document.getElementById('view');
  /* Welche Ansicht gerade steht, trägt #view als Klasse — der
     Haken, an dem css/mobile.css die Monatszeilen umbaut, ohne
     die Tabellen der anderen Ansichten zu erwischen. */
  vbox.className=ui.welcome?'':('view-'+ui.view);
  vbox.innerHTML= ui.welcome ? viewWelcome()
    : ({monat:viewMonat,prognose:viewPrognose,kakeibo:viewKakeibo,jahr:viewJahr})[ui.view]();
  wire(); renderStatus();

  window.scrollTo(sx,sy);
  const ysNew=document.getElementById('yearScroll');
  if(ysNew&&yTop!=null){ ysNew.scrollTop=yTop; ysNew.scrollLeft=yLeft; }
  /* Die Rollleiste hat ihre Tabelle beim Verdrahten gemessen — da
     stand die noch am Anfang. Jetzt steht sie wieder dort, wo sie
     vorher stand, und der Griff gehört an dieselbe Stelle. Ebenso
     die Köpfe der Matrix hält der Browser selbst. */
  fitRails();
  checkUpdate();

  /* Die mobile Jahresansicht fängt beim laufenden Monat an: die
     abgerechneten Karten liegen darüber und sind per Scroll nach
     oben erreichbar — wer die Ansicht öffnet, will das Jetzt.
     Nur beim **Betreten** der Ansicht, nicht bei jedem Zeichnen:
     wer gescrollt hat und abhakt, bliebe sonst nicht, wo er ist.
     Wie weit die Karte unter den klebenden Leisten aufsetzt, sagt
     scroll-margin-top in css/mobile.css. */
  if(isMobile()&&!ui.welcome&&ui.view==='jahr'&&lastView!=='jahr'){
    const now=document.querySelector('.ymcard.now');
    if(now) now.scrollIntoView({block:'start'});
  }
  lastView=ui.welcome?'':ui.view;
}
/* Die zuletzt gezeichnete Ansicht — nur, um das Betreten einer
   Ansicht vom bloßen Neuzeichnen zu unterscheiden (siehe oben). */
let lastView='';

/* ── Die Hinweisleiste auf eine neue Fassung ──────────────────
   FINA gibt es dreimal: als Webseite, als Mac- und als
   Windows-App. Die Webseite ist immer die neueste — dort gäbe es
   nichts zu melden. Die beiden Apps tragen die Kopie der
   Webdateien vom Tag ihres Baus und erfahren von einer neuen
   Fassung nur, wenn sie nachfragen.

   **Das ist die einzige Netzverbindung, die FINA je aufbaut.** Sie
   holt eine Zahl und schickt nichts: kein Zählpixel, keine
   Kennung, kein Bericht. Im Browser läuft sie gar nicht erst an —
   `window.FINA_NATIVE` setzt desktop/preload.js, sonst niemand.

   Regel 4 („kein fetch") gilt dem **Laden der eigenen Dateien**:
   die müssen über `file://` per `<script>` hereinkommen. Eine
   Abfrage an eine fremde Adresse ist etwas anderes, und sie darf
   scheitern — ohne Netz bleibt die Leiste einfach weg (`catch`).

   **Gefragt wird einmal je Sitzung, und erst mit offenem Buch.**
   Einmal, weil ein Kassenbuch stundenlang offen steht und die
   Antwort sich darin nicht ändert; erst mit Buch, weil der
   Schalter dafür in der Datei steht (state.updateCheck) — auf der
   Begrüßungsseite ist er noch gar nicht gelesen. Wer ihn abschaltet,
   wird also nie wieder gefragt. Nichts davon wird gemerkt: FINA
   führt keine Ablage neben der Datei des Nutzers. */
let updAsked=false, updNew='';
function checkUpdate(){
  if(updNew){ showUpdateBar(); return; }
  if(updAsked||!window.FINA_NATIVE||ui.welcome||state.updateCheck===false) return;
  updAsked=true;
  fetch(VERSION_URL,{cache:'no-store'})
    .then(r=>r.ok?r.json():null)
    .then(d=>{ if(d&&newerVersion(d.version,VERSION)){ updNew=String(d.version); showUpdateBar(); } })
    .catch(()=>{});
}

/* Vergleicht zwei Nummern der Form Jahr.Monat.Tag — Stelle für
   Stelle als Zahl, nicht als Text: „26.8.9" wäre sonst neuer als
   „26.8.15". Was keine Zahl ist, zählt als 0. */
function newerVersion(a,b){
  const p=s=>String(s||'').split('.').map(n=>parseInt(n,10)||0);
  const x=p(a), y=p(b);
  for(let i=0;i<Math.max(x.length,y.length);i++){
    const d=(x[i]||0)-(y[i]||0);
    if(d) return d>0;
  }
  return false;
}

/* Eine schmale Leiste über der Kopfzeile: was es gibt, ein Weg
   dorthin, ein Weg daran vorbei. Sie steht **über** dem Kopf und
   klebt nicht — sie ist eine Nachricht und keine Bedienung, und
   sobald man zu arbeiten anfängt, soll sie aus dem Weg sein.
   „Später" blendet sie bis zum nächsten Start aus; heruntergeladen
   und ausgetauscht wird von Hand (die Datendatei bleibt dabei
   unangetastet, sie liegt außerhalb der App). */
function showUpdateBar(){
  if(!updNew||document.getElementById('updBar')) return;
  const wrap=document.querySelector('.wrap');
  const bar=document.createElement('div');
  bar.id='updBar'; bar.className='updatebar'; bar.setAttribute('role','status');
  bar.innerHTML=`<span>${esc(t('upd.avail',updNew))}</span>
    <button class="btn" id="updGet" title="${esc(t('upd.getTip'))}">${esc(t('upd.get'))}</button>
    <button class="btn" id="updHide" title="${esc(t('upd.hideTip'))}">${esc(t('upd.hide'))}</button>`;
  wrap.insertBefore(bar,wrap.firstChild);
  /* In der App fängt setWindowOpenHandler das ab und schickt die
     Adresse an den Browser des Nutzers (desktop/main.js). */
  bar.querySelector('#updGet').onclick=()=>window.open(DOWNLOAD_URL,'_blank');
  bar.querySelector('#updHide').onclick=()=>{ updNew=''; bar.remove(); };
}

/* ── Klicks der frisch gezeichneten Ansicht ───────────────── */
function wire(){
  /* Abhaken heißt weitermachen: wer gerade filtert, tippt danach
     die nächste Position, ohne zur Maus zu greifen — dafür geht
     der Fokus zurück ins Suchfeld. Ist das Feld leer, filtert
     niemand: dann bleibt der Fokus, wo er ist. Sonst spränge die
     Schreibmarke bei jedem Haken in ein Feld, das gar nicht
     gebraucht wird. */
  /* ── Ein geschätzter Betrag wird nicht einfach abgehakt ──────
     Abhaken heißt „so war es". Bei einem geschätzten Betrag stimmt
     das aber gerade nicht — der Haken machte aus einer Vermutung
     eine Tatsache, ohne dass jemand die Zahl angesehen hat.

     Deshalb öffnet der Klick auf das Siegel dort das Fenster der
     Position, mit dem Betrag **dieses** Monats fertig markiert:
     erst die Zahl richtigstellen, dann im Fenster abhaken, dann
     speichern. Wer abbricht, hat nichts geändert und nichts
     abgehakt.

     Nur beim Setzen des Hakens. Einen Haken wieder wegzunehmen
     ändert keine Zahl und braucht keinen Umweg. */
  const askFirst=(est,on)=>est&&!on;
  document.querySelectorAll('[data-paid]').forEach(b=>b.onclick=()=>{
    const it=findItem(b.dataset.paid); if(!it) return;
    if(askFirst(estOf(it),it.paid[ui.month-1])){ editItem(it,null,null,ui.month); return; }
    it.paid[ui.month-1]=!it.paid[ui.month-1];
    keepQFocus(); save();render();
  });
  document.querySelectorAll('[data-kpaid]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    const k=b.dataset.kpaid, e=state.kak[k]; if(!e) return;
    if(askFirst(e.estimated,e.paid[ui.month-1])){ editKak(k,null,ui.month); return; }
    e.paid[ui.month-1]=!e.paid[ui.month-1]; keepQFocus(); save();render();
  });
  /* Mehrere Links an einer Zeile: das Kettensymbol öffnet die
     Auswahl (openLinkList in js/ui.js). Bei genau einem Link ist
     das Symbol ein gewöhnlicher Link und kommt hier nicht an. */
  document.querySelectorAll('[data-links]').forEach(b=>b.onclick=()=>{
    const i=b.dataset.links.indexOf(':');
    openLinkList(b.dataset.links.slice(0,i),b.dataset.links.slice(i+1));
  });
  /* Der Strich, wo noch kein Link steht: er öffnet das Fenster der
     Position und darin gleich das Webseitenänderungsfenster — der
     Weg, den man ohnehin ginge, nur ohne die zwei Klicks dazwischen.
     Gedrückt wird dafür schlicht das Plus des frisch gebauten
     Fensters; so gibt es die Reihenfolge nur an einer Stelle. */
  document.querySelectorAll('[data-lnnew]').forEach(b=>b.onclick=()=>{
    const i=b.dataset.lnnew.indexOf(':');
    const kind=b.dataset.lnnew.slice(0,i), key=b.dataset.lnnew.slice(i+1);
    if(kind==='kak') editKak(key); else { const it=findItem(key); if(it) editItem(it); }
    const box=[...document.querySelectorAll('.modal')].pop();
    const add=box&&box.querySelector('[data-lnadd]');
    if(add) add.click();
  });

  /* Filter und Navigation. Ein zweiter Klick auf denselben Knopf
     nimmt den Filter wieder zurück — er springt dann auf „alle",
     und der helle Grund sagt: gilt gerade nicht. */
  const toggleFilter=(key,val)=>{ ui[key]=(ui[key]===val&&val!=='alle')?'alle':val;
    keepQFocus(); render(); };
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>toggleFilter('filter',b.dataset.filter));
  document.querySelectorAll('[data-duefilter]').forEach(b=>b.onclick=()=>toggleFilter('dueFilter',b.dataset.duefilter));
  /* Der Zeitstrahl filtert wie die Knöpfe darunter: ein Abschnitt
     ist eine Fälligkeit (A · M · E, Z = ohne Zahltag), ein zweiter
     Klick nimmt ihn zurück. Den Zeitstrahl gibt es nur, solange die
     Auswertung aufgeklappt ist — zugeklappt gibt es diese Knöpfe
     also gar nicht. */
  document.querySelectorAll('[data-tpart]').forEach(b=>b.onclick=()=>toggleFilter('dueFilter',b.dataset.tpart));
  /* Die Auswertung auf- und zuklappen. Sie steht in ui, nicht in
     der Datei: was gerade zu sehen ist, gehört zur Anzeige. */
  document.querySelectorAll('[data-ana]').forEach(b=>b.onclick=()=>{
    ui.ana=!ui.ana; keepQFocus(); render(); });
  /* Einen Bereich zuklappen (in · flex · out) — die Karten der
     Monatsansicht (data-fold) und die Blöcke der Jahresmatrix
     (data-yfold). Beide gelten für alle zwölf Monate und stehen
     deshalb in der Datei, jede Ansicht in ihrer eigenen Liste —
     wie die beiden Filter der Jahresansicht, also save() davor.

     Geklappt wird gegen das, was zu sehen ist; das sagt der Pfeil
     selbst (aria-expanded), und der Klick schreibt das Gegenteil in
     die Datei. Während gefiltert wird, gibt es weder Pfeil noch
     Doppelklick: dort steht ohnehin alles offen. */
  const toggleFold=(store,k,openNow)=>{
    if(!state[store]) state[store]=blankFolded();
    state[store][k]=openNow;
    keepQFocus(); save(); render();
  };
  /* Ein Doppelklick auf die Überschrift (Monat) oder die Blockzeile
     (Jahr) tut dasselbe wie der Pfeil — auf Knöpfen und Links darin
     nicht, die haben ihr eigenes Ziel. */
  [['fold','dblfold','folded'],['yfold','dblyfold','foldedYear']].forEach(([a,d,store])=>{
    document.querySelectorAll(`[data-${a}]`).forEach(b=>b.onclick=()=>
      toggleFold(store,b.getAttribute(`data-${a}`),b.getAttribute('aria-expanded')==='true'));
    document.querySelectorAll(`[data-${d}]`).forEach(h=>h.ondblclick=ev=>{
      if(ev.target.closest('button,a,input,select,textarea')) return;
      const sel=window.getSelection(); if(sel) sel.removeAllRanges();
      const arrow=h.querySelector(`[data-${a}]`);
      toggleFold(store,h.getAttribute(`data-${d}`),!arrow||arrow.getAttribute('aria-expanded')==='true');
    });
  });
  /* Das Suchfeld: es filtert beim Tippen, also wird bei jedem
     Zeichen neu gezeichnet. Damit der Fokus das überlebt, merkt
     ui.qFocus ihn vor und wire() setzt ihn danach zurück — samt
     Schreibmarke am Ende ('end'). Hier gilt das **immer**, auch
     beim letzten Rücklöschen: wer das Feld leert, steht noch
     darin. Markiert würde der Begriff hier gerade nicht — das
     nächste Zeichen löschte sonst, was man eben getippt hat. */
  document.querySelectorAll('[data-q]').forEach(i=>i.oninput=()=>{
    ui.q=i.value; ui.qFocus='end'; render();
  });
  /* Der Knopf dahinter nimmt den Filter zurück — alle drei auf
     einmal. Danach steht der Fokus im leeren Feld: wer
     zurücknimmt, sucht meistens gleich etwas anderes. */
  document.querySelectorAll('[data-qclear]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    ui.q=''; ui.filter='alle'; ui.dueFilter='alle'; ui.qFocus='all'; render();
  });
  /* Der Hamburger-Knopf davor: worin der Suchbegriff überhaupt
     sucht (js/dialogs/filter-fields.js). Die Wahl steht in der
     Datei, geändert wird sie erst mit „Speichern" im Fenster. */
  document.querySelectorAll('[data-qfields]').forEach(b=>b.onclick=()=>openFilterFields());
  /* Das Filtermenü der mobilen Monatsansicht: derselbe Knopf
     öffnet und schließt es. Darin stehen die gewohnten
     Filterknöpfe (data-filter, data-duefilter) — die sind oben
     schon verdrahtet und lassen das Menü beim Umschalten offen:
     wer filtert, stellt meist mehr als eins ein. */
  document.querySelectorAll('[data-mfilters]').forEach(b=>b.onclick=()=>{
    ui.mFilters=!ui.mFilters; render(); });
  /* Wechsel zwischen Haupt- und Unterkategorien: rechts stehen
     danach wieder die größten Einzelposten, nicht die Auswahl
     einer Zeile, die es so vielleicht gar nicht mehr gibt. */
  document.querySelectorAll('[data-kd]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    ui.kakDetail=b.dataset.kd==='1'; ui.kakPick=null; render();});
  /* Sprung aus der Jahresmatrix in einen Monat: das Suchfeld gibt
     es dort auch, und es trägt dasselbe Wort — also bleibt der
     Fokus darin, sofern etwas darin steht. */
  document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{ui.month=+b.dataset.goto;ui.view='monat';keepQFocus();render();});

  /* Kakeibo: Auswahl der rechten Spalte — eine Kategorie oder,
     ohne Auswahl, die größten Einzelposten. */
  document.querySelectorAll('[data-kpick]').forEach(b=>b.onclick=()=>{
    const [main,sub]=b.dataset.kpick.split('|');
    ui.kakPick=(ui.kakPick&&ui.kakPick.main===main&&(ui.kakPick.sub||'')===(sub||''))
      ?null:{main,sub:sub||''};
    render();
  });
  document.querySelectorAll('[data-ktop]').forEach(b=>b.onclick=()=>{ui.kakPick=null;render();});
  document.querySelectorAll('[data-kmonth]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    const d=b.dataset.kmonth;
    if(d==='jahr') ui.scope='jahr';
    /* Zurück ins Jetzt — aus dem ganzen Jahr wie aus jedem
       anderen Monat. */
    else if(d==='cur'){ ui.month=CUR; ui.scope='monat'; }
    else { ui.month=Math.min(12,Math.max(1,ui.month+(d==='next'?1:-1))); ui.scope='monat'; }
    render();
  });
  document.querySelectorAll('[data-kview]').forEach(b=>b.onclick=()=>{
    ui.month=+b.dataset.kview; ui.scope='monat'; ui.view='kakeibo'; ui.kakPick=null; render();
  });

  /* Die beiden Wege der Begrüßungsseite. */
  document.querySelectorAll('[data-wload]').forEach(b=>b.onclick=()=>loadData());
  document.querySelectorAll('[data-wnew]').forEach(b=>b.onclick=()=>startEmpty());
  /* Die Sprachwahl — auf der Begrüßungsseite und in der Kopfzeile
     des geladenen Buches (renderChrome). Sie schreibt über
     chooseLang() in state.lang **und** in den localStorage, gilt
     also auch für die Verkaufsseiten (siehe js/i18n.js). save() nur
     im geladenen Buch: dort ist die Sprache eine Einstellung der
     Datei wie im Einstellungsfenster; auf der Begrüßungsseite gibt
     es noch nichts, das schmutzig werden könnte. */
  document.querySelectorAll('[data-wlang]').forEach(b=>b.onclick=()=>{
    if(!chooseLang(b.dataset.wlang)) return;
    if(!ui.welcome) save();
    render();
  });

  /* Fenster öffnen */
  document.querySelectorAll('[data-lists]').forEach(b=>b.onclick=()=>editLists());
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editItem(findItem(b.dataset.edit)));
  document.querySelectorAll('[data-kedit]').forEach(b=>b.onclick=()=>editKak(b.dataset.kedit));
  /* Doppelklick auf Betrag oder Bezeichnung öffnet dasselbe
     Fenster wie der Stift — in jeder Ansicht, in der eine Zeile zu
     einer Position gehört. Es zählen nur diese beiden Zellen; auf
     Siegel, Lampe, Beleglink und Eingabefeld bleibt der
     Doppelklick, was er dort ist. Die Markierung, die er anlegt,
     wird vorher aufgehoben — sie stünde sonst blau hinter dem
     Fenster. */
  const DBLCELL='td.num,td.amt,td.lab,td.nm';
  /* **Welcher Monat war gemeint?** Der Doppelklick auf einen
     *Betrag* zeigt auf genau einen Monat — im Fenster wird dessen
     Feld hervorgehoben, damit man wiederfindet, worauf man geklickt
     hat. In der Jahresmatrix steht der Monat an der Zelle
     (`data-m`), in der Monatsansicht ist es der gezeigte Monat.
     Ein Doppelklick auf die **Bezeichnung** meint keinen Monat —
     dann bleibt das Fenster unmarkiert, wie beim Stift. */
  const dblMonth=cell=>{
    if(!cell) return null;
    if(cell.dataset.m) return +cell.dataset.m;
    if(cell.matches('td.amt')) return ui.month;
    if(cell.matches('td.num')&&ui.view==='kakeibo') return ui.scope==='monat'?ui.month:null;
    return null;
  };
  const dblOpen=(sel,open)=>document.querySelectorAll(sel).forEach(tr=>tr.ondblclick=ev=>{
    const cell=ev.target.closest(DBLCELL);
    if(!cell) return;
    if(ev.target.closest('button,a,input,select,textarea')) return;
    const s=window.getSelection(); if(s) s.removeAllRanges();
    open(tr,dblMonth(cell));
  });
  dblOpen('[data-dbledit]',(tr,m)=>editItem(findItem(tr.dataset.dbledit),null,null,m));
  dblOpen('[data-dblkedit]',(tr,m)=>editKak(tr.dataset.dblkedit,null,m));
  /* **Beides trägt in der Prognose die Zelle statt der Zeile.** Dort
     ist eine Zeile ein Monat und keine Position: der Doppelklick auf
     die Korrektur meint sie und nicht die fünf Zahlen daneben. Für
     `dblOpen` ändert das nichts — es hängt den Doppelklick an das
     Element mit dem Merkmal, und `td.num` ist eine der Zellen aus
     DBLCELL. Den Monat sagt auch hier `data-m`. */

  /* ── Der Anfangsbestand ──────────────────────────────────────
     Er gehört keinem Monat und steht deshalb nicht in einer Zeile,
     sondern in den Einstellungen. Seine einzige Zahl in einer
     Ansicht ist die Zeile über dem Januar in der Prognose — ein
     Doppelklick darauf führt dorthin, wo sie geändert wird: in den
     Bereich „Allgemein", mit der Schreibmarke im Feld und dem Wert
     fertig markiert.

     Ein Fenster statt einer Zelle: der Anfangsbestand ist eine
     Einstellung und keine Position, und er hat kein Fenster, das
     ihm allein gehörte. */
  document.querySelectorAll('[data-opening]').forEach(td=>td.ondblclick=()=>{
    const s=window.getSelection(); if(s) s.removeAllRanges();
    openSettings('sOpen');
  });
  /* Neu anlegen — in beiden Ansichten und in beiden Arten. Der
     Wert von data-newitem ist der vorgewählte Block ("1" = der
     erste der Liste). */
  document.querySelectorAll('[data-newitem]').forEach(b=>b.onclick=()=>editItem(null,b.dataset.newitem));
  document.querySelectorAll('[data-newkak]').forEach(b=>b.onclick=()=>newKakCat());
  bindNotes(document,()=>render());

  /* Die beiden Filter der Jahresansicht. Sie stehen in der Datei,
     nicht in ui — der Nutzer stellt sie einmal ein und findet sie
     beim nächsten Öffnen wieder. Deshalb save() davor. Und wie in
     der Monatsansicht: steht im Suchfeld etwas, geht der Fokus
     danach dorthin zurück. */
  const fb=document.getElementById('btnFold');
  if(fb) fb.onclick=()=>{state.hideDoneMonths=!state.hideDoneMonths;keepQFocus();save();render();};
  const hs=document.getElementById('btnHideSettled');
  if(hs) hs.onclick=()=>{state.hideSettled=!state.hideSettled;keepQFocus();save();render();};

  /* Die Prognose rechnet und zeigt; zu ändern gibt es dort zwei
     Zahlen, und beide hängen schon oben: die Saldokorrektur eines
     Monats (data-dbledit an der Zelle) und der Anfangsbestand
     (data-opening). Die Annahme der Flexible Payments wird im
     Fenster der Kategorie gepflegt. */

  /* Kakeibo: CSV-Import und Zeitraum (Ganzes Jahr oder ein Monat) */
  const km=document.getElementById('kMonth');
  if(km) km.onchange=()=>{
    if(km.value==='jahr') ui.scope='jahr';
    else { ui.scope='monat'; ui.month=+km.value; }
    render();
  };
  /* Derselbe Weg wie über die Kopfzeile: erst das Fenster mit den
     Spalten, dann die Dateiauswahl. */
  const imp=document.getElementById('btnImportK');
  if(imp) imp.onclick=()=>openImportInfo();

  /* Zum Schluss: Tab springt in der Ansicht nur noch von Feld zu
     Feld. Die Kopfzeile bleibt außen vor — über sie erreicht man
     Ansicht, Monat und Datei weiter mit der Tastatur. */
  tabThroughFields(document.getElementById('view'));

  /* Der Fokus kehrt ins Suchfeld zurück — ohne zu scrollen, die
     Seite steht danach ohnehin wieder auf ihrer alten Höhe.

     Zwei Wege führen dorthin. Der eine ist ui.qFocus: eine Stelle
     hat gesagt, dass sie den Fokus zurückgibt. Der andere ist der
     **Rückfall**: steht im Feld etwas und hat nach dem Neuzeichnen
     niemand sonst den Fokus, gehört er dorthin. So kommt man auch
     aus einem Fenster zurück, das gerade gespeichert hat — dessen
     Knopf gibt es nicht mehr, der Fokus läge sonst auf dem
     Dokument und die nächste Taste ginge ins Leere.

     Zwei Bedingungen hat der Rückfall: kein offenes Fenster (dort
     wird gerade getippt, ihm den Fokus zu nehmen wäre ein Fehler)
     und wirklich niemand sonst — `document.body` heißt „nichts". */
  const qEl=document.querySelector('[data-q]');
  const idle=!document.activeElement||document.activeElement===document.body;
  const back=ui.qFocus||(qEl&&qEl.value&&idle&&!document.querySelector('.modal')?'all':false);
  if(qEl&&back){
    qEl.focus({preventScroll:true});
    if(back==='end') qEl.setSelectionRange(qEl.value.length,qEl.value.length);
    else qEl.select();
  }
  ui.qFocus=false;

  /* Die Rollleisten über den beiden breiten Tabellen: Breite messen
     und beide Richtungen verdrahten. Nach jedem Zeichnen neu — die
     Tabelle darunter ist eine andere geworden. */
  bindRails();
  syncMatrixHead();
}

/* ── Strg/Cmd + Umschalt + Buchstabe: die Ansicht wechseln ───
   Ein Griff je Reiter, in der Reihenfolge der Reiter:

     M  Monat · Y  Jahr · F  Prognose · D  Fast Budget Details

   Die Buchstaben stehen für den **englischen** Namen und wechseln
   deshalb nicht mit der Sprache — wie B · PT · DD · LP in der
   Jahresmatrix und wie die Kürzel der Prognose. Y statt J, weil
   „Year"; F für „Forecast"; D für „Details" — F und B sind schon
   vergeben.

   Ins Suchfeld führte diese Taste einmal (Strg/Cmd+Umschalt+F).
   Den Weg gibt es nicht mehr: seit ein einzelner Buchstabe im
   Monat und im Jahr von selbst im Filter landet, war er der
   umständlichere von zweien.

   **Nur Reiter, die es gibt.** „Fast Budget Details"
   erscheint erst mit importierten Buchungen (VIEWS in
   js/config.js); ohne sie tut der Griff nichts, statt in eine
   Ansicht zu springen, die kein Reiter zeigt.

   Zwei Fälle bleiben außen vor: die Begrüßungsseite (dort gibt es
   keine Reiter) und ein offenes Fenster — dort wird gerade
   getippt, und die Ansicht darunter zu wechseln nähme dem Fenster
   den Boden. */
const VIEW_KEYS={m:'monat',y:'jahr',f:'prognose',d:'kakeibo'};
/* Der Buchstabe zu einer Ansicht — für die Sprechblase am Reiter
   (renderChrome). Groß geschrieben, wie man ihn auf der Taste
   sieht. */
const viewKey=v=>(Object.keys(VIEW_KEYS).find(k=>VIEW_KEYS[k]===v)||'').toUpperCase();
addEventListener('keydown',ev=>{
  if(!ev.shiftKey||!(ev.ctrlKey||ev.metaKey)||ev.altKey) return;
  const want=VIEW_KEYS[(ev.key||'').toLowerCase()];
  if(!want) return;
  if(ui.welcome||document.querySelector('.modal')) return;
  ev.preventDefault();
  if(!VIEWS.some(([k])=>k===want)||ui.view===want) return;
  ui.view=want; render();
});

/* ── Einfach lostippen ───────────────────────────────────────
   Wer in der Monats- oder Jahresansicht anfängt zu tippen, ohne
   vorher irgendwo hineingeklickt zu haben, meint den Filter: es
   gibt in diesen beiden Ansichten nichts anderes, in das ein
   Buchstabe gehören könnte. Das erste Zeichen holt also das
   Suchfeld nach vorn und steht gleich darin — der Weg über die
   Maus bleibt, wird aber selten gebraucht.

   Vier Fälle bleiben außen vor:

     • **Ein Feld hat schon den Fokus** — dort wird getippt, auch
       im Suchfeld selbst; dann macht der Browser das von allein.
     • **Ein offenes Fenster**, die Begrüßungsseite, eine Ansicht
       ohne Suchfeld: nichts zu filtern.
     • **Jede Taste mit Strg, Cmd oder Alt** — das sind Befehle,
       keine Zeichen; `key.length===1` hält Escape, Tabulator und
       die Pfeile ohnehin heraus.
     • **Das Leerzeichen bei leerem Feld.** Es filterte auf nichts
       und nähme dem Browser das Blättern weg.

   Geschrieben wird das Zeichen nicht ins Feld, sondern in `ui.q` —
   das Feld wird beim Zeichnen ohnehin neu gebaut. Die Schreibmarke
   steht danach am Ende ('end'), wie beim Tippen im Feld. */
addEventListener('keydown',ev=>{
  if(ev.defaultPrevented||ev.isComposing) return;
  if(ev.ctrlKey||ev.metaKey||ev.altKey||ev.key.length!==1) return;
  if(ui.welcome||document.querySelector('.modal')) return;
  const el=document.activeElement;
  if(el&&(el.matches('input,textarea,select')||el.isContentEditable)) return;
  const q=document.querySelector('[data-q]');
  if(!q) return;
  if(ev.key===' '&&!(ui.q||'')) return;
  ev.preventDefault();
  ui.q=(ui.q||'')+ev.key; ui.qFocus='end'; render();
});

/* ── Escape nimmt den Filter zurück ──────────────────────────
   Dieselbe Wirkung wie der Knopf rechts vom Suchfeld: Suchbegriff,
   Zahlungsstand und Fälligkeit auf einmal. Escape heißt überall
   „zurück" — im Fenster schließt es, in der Liste nimmt es den
   Filter weg.

   **Nur, wenn kein Fenster offen ist.** Dort gehört Escape dem
   Fenster (js/ui.js), und es schließt es; den Filter dabei
   nebenbei zu leeren wäre eine zweite, ungefragte Wirkung.

   Zwei Bedingungen sagen dasselbe, und beide werden gebraucht:
   `defaultPrevented` fängt den Druck, der gerade ein Fenster
   geschlossen hat — dessen Handler hängt am Dokument und läuft
   vorher, das Fenster ist hier also schon aus dem DOM und die
   Abfrage darauf ginge ins Leere. `.modal` fängt den Fall, dass ein
   Fenster offen ist und den Druck aus einem anderen Grund nicht
   angenommen hat.

   Und nur, wenn überhaupt gefiltert wird — sonst passiert nichts,
   und der Tastendruck bleibt für den Browser, was er ist. */
addEventListener('keydown',ev=>{
  if(ev.key!=='Escape'||ev.defaultPrevented) return;
  if(ui.welcome||document.querySelector('.modal')) return;
  if(!(ui.q||'').trim()&&ui.filter==='alle'&&ui.dueFilter==='alle') return;
  if(!document.querySelector('[data-q]')) return;
  ev.preventDefault();
  ui.q=''; ui.filter='alle'; ui.dueFilter='alle'; ui.qFocus='all'; render();
});

/* ── Ein Feld anklicken heißt: überschreiben ─────────────────
   Wer in ein Eingabefeld klickt, will dort fast immer einen neuen
   Wert eintragen und nicht den alten fortschreiben — bei zwölf
   Monatsbeträgen hintereinander erst recht. Beim Hineingehen steht
   der Inhalt deshalb **markiert** da: tippen ersetzt ihn, und wer
   ihn behalten will, drückt eine Pfeiltaste.

   **Nur einzeilige Eingabefelder.** Ein `textarea` bleibt außen vor
   — eine Notiz wird ergänzt, nicht ersetzt, und ein Klick mitten
   hinein meint genau diese Stelle. Kästchen, Schalter, Dateiwahl
   und Auswahllisten haben ohnehin keinen Text zu markieren.

   Zwei Dinge machen es sperrig, und beide stehen hier:

     • `focus` **steigt nicht auf** — der Handler hängt deshalb in
       der Einfangphase (`true`) am Fenster.
     • **Die Maus hebt die Markierung sofort wieder auf.** Der Klick
       setzt beim Loslassen die Schreibmarke; deshalb merkt sich
       `pending`, dass diese Auswahl gerade von einem Mausklick kam,
       und das folgende `mouseup` wird einmal abgefangen.

   Gemerkt wird auch, **ob der Fokus überhaupt von der Maus kam**
   (`byMouse`): wer mit dem Tabulator hineinspringt und danach in
   dasselbe Feld klickt, um die Schreibmarke zu setzen, soll das
   dürfen — dort gibt es kein neues `focus` und damit nichts
   abzufangen.

   Programmatisch gesetzter Fokus stört das nicht: wer danach selbst
   eine Auswahl setzt (das Suchfeld in `wire()` tut es), tut das
   nach `focus()` und behält damit das letzte Wort. */
const SELECT_TYPES=/^(?:text|search|url|tel|email|password|number)$/;
const selectable=el=>el instanceof HTMLInputElement
  && SELECT_TYPES.test(el.type) && !el.readOnly && !el.disabled;
let byMouse=false, pending=false;
addEventListener('mousedown',()=>{ byMouse=true; },true);
addEventListener('focus',ev=>{
  if(!selectable(ev.target)) return;
  ev.target.select();
  pending=byMouse;
},true);
addEventListener('mouseup',ev=>{
  if(pending&&selectable(ev.target)) ev.preventDefault();
  pending=false; byMouse=false;
},true);

/* ── Feste Schaltflächen der Kopfzeile ────────────────────── */
/* Das Werkzeugmenü der mobilen Kopfzeile: derselbe Knopf öffnet
   und schließt es, ein Klick daneben oder auf ein Werkzeug darin
   schließt mit. Nur eine Klasse an .tools — die Kopfzeile wird
   nicht neu gebaut, das Menü überlebt also jedes render(). Am
   Schreibtisch ist der Knopf per CSS weg und die Klasse wirkungslos. */
(()=>{
  const mb=document.getElementById('btnMenu');
  const tools=document.getElementById('hdrTools');
  if(!mb||!tools) return;
  const shut=()=>{ tools.classList.remove('open'); mb.setAttribute('aria-expanded','false'); };
  mb.onclick=ev=>{
    ev.stopPropagation();
    const on=!tools.classList.contains('open');
    tools.classList.toggle('open',on);
    mb.setAttribute('aria-expanded',String(on));
  };
  document.addEventListener('click',ev=>{ if(!tools.contains(ev.target)) shut(); });
  tools.addEventListener('click',ev=>{ if(ev.target.closest('button,a')) shut(); });
})();
document.getElementById('btnSettings').onclick=()=>openSettings();
/* Die Anleitung ist ein Bereich, kein Fenster: derselbe Knopf
   klappt sie auf und wieder zu. */
document.getElementById('btnGuide').onclick=()=>toggleGuide();
/* Beide Importe stehen im Einstellungsfenster, Bereich „Import" —
   in der Kopfzeile ist kein Knopf mehr dafür. */
document.getElementById('btnLoad').onclick=()=>loadData();
document.getElementById('btnSave').onclick=()=>saveData();
document.getElementById('btnBackup').onclick=()=>saveBackup();
document.getElementById('btnUnlink').onclick=()=>unlinkData();

/* Rückfallweg, wenn der Browser die File System Access API nicht kennt. */
document.getElementById('fileJson').onchange=e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{ state=migrate(JSON.parse(r.result)); fileName=f.name; fileHandle=null; dirty=false;
      afterLoad(); ui.welcome=false; render(); toast(t('store.loaded',f.name)); }
    catch(err){ toast(t('store.readFail')); } };
  r.readAsText(f,'utf-8'); e.target.value='';
};

/* Die Datei wird nur gelesen; geändert wird erst, wenn der Nutzer
   im Import-Fenster (js/dialogs/csv-import.js) beide Schritte
   bestätigt hat. */
document.getElementById('fileCsv').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const rows=parseFastBudget(r.result);
      if(!rows.length){toast(t('imp.noRows'));return;}
      openImport(rows,f.name);
    }catch(err){toast(t('imp.failed',err.message));}
  };
  r.readAsText(f,'utf-8'); e.target.value='';
};

/* Dieselbe Vorsicht für die FINA-Tabelle: gelesen wird sofort,
   geschrieben erst nach beiden Schritten des Fensters
   (js/dialogs/sheet-import.js). */
document.getElementById('fileSheet').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const sheet=parseFinaSheet(r.result);
      if(!sheet.blocks.length){toast(t('sheet.noBlocks'));return;}
      openSheetImport(sheet,f.name);
    }catch(err){toast(t('imp.failed',err.message));}
  };
  r.readAsText(f,'utf-8'); e.target.value='';
};

/* ── Start ────────────────────────────────────────────────────
   Leer und auf Englisch beginnen. Inhalte und Einstellungen
   kommen über „Load data" aus der JSON-Datei.

   Eine Ausnahme: die Sprachwahl (`finaLang` im localStorage) gilt
   hier als Vorgabe für das noch leere Buch — wer die Seite auf
   Deutsch liest, soll nicht auf einer englischen Begrüßung landen.
   Geschrieben wird sie von beiden Seiten: vom DE/EN-Schalter der
   Verkaufsseiten (js/landing.js) und von jeder ausdrücklichen Wahl
   in der Anwendung (chooseLang in js/i18n.js). Eine geladene Datei
   überstimmt die Vorgabe wie immer (state.lang kommt dann aus ihr)
   und schreibt ihrerseits nichts zurück. */
state=emptyState();
try{
  const siteLang=localStorage.getItem('finaLang');
  if(siteLang==='de'||siteLang==='en') state.lang=siteLang;
}catch(e){/* file:// ohne Speicher: englischer Start wie bisher */}
afterLoad();
render();
