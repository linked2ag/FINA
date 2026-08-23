/* ══════════════════════════════════════════════════════════════
   FINA — Die Umfrage

   **Gefragt wird in FINA selbst.** Kein fremdes Formular, keine
   fremde Seite: der Nutzer antwortet in diesem Fenster, FINA
   schickt die Antworten ab und wartet auf die Bestätigung —
   **erst danach** wird in seiner Datei vermerkt, dass diese
   Anfrage erledigt ist. Schlägt das Senden fehl, bleibt sie offen
   und kommt beim nächsten Öffnen wieder.

   In die Datei kommt **eine** Auskunft: dass diese Umfrage
   beantwortet wurde, mit dem Tag der Antwort (`state.surveys` in
   js/state.js). Was geantwortet wurde, steht dort nicht — das
   liegt beim Absender, ohne Kennung des Nutzers. Genau das sagen
   die beiden Zeilen unter den Fragen.

   ── Nichts springt von selbst auf ────────────────────────────
   Eine offene Umfrage meldet sich als **Knopf in der Kopfzeile**,
   orange, links vom Hamburger — und wartet dort. Ein Fenster, das
   beim Öffnen eines Buches von selbst aufginge, stünde vor der
   Arbeit, wegen der man das Buch geöffnet hat. Der Knopf ist im
   Blick und stört nicht; wer antwortet, wird ihn los.

   ── Woher die Fragen kommen ──────────────────────────────────
   Aus dem Arbeitsbereich beim Absender selbst: die erste Umfrage,
   die dort läuft, mit ihren Fragen, ihrer Reihenfolge und ihren
   Antwortmöglichkeiten. Damit gibt es nichts abzutippen und
   nichts, was auseinanderlaufen könnte.

   **Gefragt wird einmal je Sitzung und erst mit offenem Buch** —
   dieselbe Regel wie bei `checkUpdate()` (js/app.js), und aus
   demselben Grund: ein Kassenbuch steht stundenlang offen, und
   ohne Buch gibt es nichts, worin ein „schon beantwortet" stehen
   könnte. Die Abfrage darf scheitern; dann bleibt der Knopf weg.
   ══════════════════════════════════════════════════════════════ */

/* Die beiden Adressen der offenen Client-Schnittstelle. Sie
   arbeitet ohne Schlüssel: es steht nichts Geheimes im Code — und
   sie kann **nur schreiben**. Die Antworten wieder auszulesen
   verlangt einen Schlüssel, den es hier nicht gibt (nachgeprüft:
   `401`). Deshalb darf die Workspace-Kennung offen in einer
   Anwendung stehen, die jeder herunterladen kann. */
const SURVEY_READ=`${SURVEY_HOST}/api/v1/client/${SURVEY_WS}/environment`;
const SURVEY_POST=`${SURVEY_HOST}/api/v1/client/${SURVEY_WS}/responses`;

/* Alle Umfragen, die gerade laufen — für diese Sitzung, nicht für
   die Datei. Welche davon dran ist, entscheidet `openSurveyNow()`
   bei jedem Zeichnen neu. */
let srvList=[], srvAsked=false;

/* ── Einmal je Sitzung nachsehen ────────────────────────────── */
function checkSurvey(){
  if(srvAsked||ui.welcome||isMobile()) return;
  srvAsked=true;
  fetch(SURVEY_READ,{cache:'no-store'})
    .then(r=>r.ok?r.json():null)
    .then(d=>{
      const env=(d&&d.data&&d.data.data)||(d&&d.data)||{};
      const list=Array.isArray(env.surveys)?env.surveys:[];
      srvList=list.filter(s=>s&&srvQuestions(s).length);
      if(!srvList.length) return;
      srvStamp();
      /* Der Knopf steckt in der Kopfzeile, und die wird nicht bei
         jedem Zeichnen neu gebaut — sie muss also einmal
         nachgeführt werden, wenn die Antwort eintrifft. */
      renderChrome();
      srvNudge();
    })
    .catch(()=>{});
}

/* ── Seit wann eine Umfrage bei diesem Buch ansteht ──────────
   **Wann sie beim Absender gestartet wurde, sagt die offene
   Schnittstelle nicht** — das Feld gibt sie nicht heraus. Gezählt
   wird deshalb ab dem Tag, an dem FINA sie hier zum ersten Mal
   gesehen hat; für den Nutzer ist das ohnehin der richtige Tag,
   denn vorher konnte er sie gar nicht beantworten.

   Der Vermerk lautet `{status:0, seen:'2026-08-23'}` und ist
   damit auch die Antwort auf „was heißt der Status": 0 kennt sie
   und wartet, 1 ist erledigt.

   **Ohne `save()`** — genau wie der Stempel `created` in
   `migrate()`: ein Buch, das allein vom Öffnen schmutzig wird,
   fragt beim Schließen nach Änderungen, die niemand gemacht hat.
   Der Vermerk wandert beim nächsten Speichern von selbst hinein;
   wird nie gespeichert, fängt die Frist eben wieder von vorn an —
   das fragt zu spät und nie zu früh. */
function srvStamp(){
  if(!state) return;
  state.surveys=state.surveys||{};
  const today=isoToday();
  srvList.forEach(sv=>{
    const e=state.surveys[sv.id];
    if(!e) state.surveys[sv.id]={status:0,seen:today};
    else if(e.status!==1&&!e.seen) e.seen=today;
  });
}

/* ── Nach drei Tagen fragt sie selbst ────────────────────────
   Der Knopf oben rechts lässt sich übersehen. Steht eine Umfrage
   drei Tage unbeantwortet, geht das Fenster deshalb **einmal**
   von selbst auf — und nicht sofort beim Öffnen, sondern eine
   Minute später: wer ein Buch aufmacht, will zuerst hineinsehen.

   **Drei und nicht zehn**, weil `seen` erst mit dem Speichern in
   der Datei landet. Wer sein Buch selten speichert, fängt die
   Frist jedes Mal von vorn an — bei zehn Tagen käme das Fenster
   bei ihm nie. Drei Tage überstehen auch eine Woche mit nur einem
   einzigen Speichern darin.

   **Nur wenn gerade kein anderes Fenster offen ist.** Über einem
   halb ausgefüllten Posten aufzuspringen wäre schlimmer als gar
   nicht zu fragen; dann wartet es noch eine Minute. Und höchstens
   einmal je Sitzung: wer „Später" drückt, meint es. */
const SRV_DAYS=3, SRV_DELAY=60000;
let srvNudged=false;
function srvNudge(){
  if(srvNudged) return;
  const sv=openSurveyNow();
  if(!sv) return;
  const e=(state.surveys||{})[sv.id];
  if(!e||!e.seen||daysSince(e.seen)<SRV_DAYS) return;
  srvNudged=true;
  const later=()=>{
    if(!openSurveyNow()) return;
    /* Ein offenes Fenster hat Vorfahrt — auch die Anleitung nicht,
       die ist ein Bereich und kein Fenster. */
    if(document.querySelector('.modal')){ setTimeout(later,SRV_DELAY); return; }
    openSurvey();
  };
  setTimeout(later,SRV_DELAY);
}

/* ── Erst nach dem ersten Speichern ──────────────────────────
   Wer FINA gerade zum ersten Mal öffnet, hat noch gar keine Datei.
   Ihn zu fragen, wie ihm FINA gefällt, wäre eine Frage an jemanden,
   der noch nichts gesehen hat — und der Vermerk der Antwort hätte
   ohnehin kein Zuhause. **Gefragt wird deshalb erst, wenn einmal
   gespeichert wurde.**

   Erkannt wird das an zwei Dingen, weil eines allein nicht reicht:
   `fileName` steht, sobald eine Datei geladen oder über die
   Dateiauswahl geschrieben wurde — in Browsern ohne diese Auswahl
   landet ein Speichern aber im Download-Ordner und lässt den Namen
   leer. Dort greift `state.v`: die Versionsnummer schreibt
   `stateJson()` beim Speichern hinein, ein frisch angefangenes Buch
   hat sie noch nicht. */
const srvSaved=()=>!!fileName||!!(state&&state.v);

/* ── Und auf dem Telefon gar nicht ───────────────────────────
   Dort gibt es kein „Daten speichern" (`.tools #btnSave` ist in
   css/mobile.css ausgeblendet). Der Vermerk käme also nie in die
   Datei, die Umfrage stünde beim nächsten Öffnen wieder da — und
   die Frage nach dem Speichern, die unter den Fragen steht, wäre
   eine Aufforderung zu etwas, das es hier nicht gibt.

   Gefragt wird deshalb nicht, und **nachgesehen auch nicht**:
   `checkSurvey()` hält am selben Schalter. Wird das Fenster breit
   gezogen, zeichnet `MOBILE_MQ` neu (js/app.js), und dann läuft
   beides nach. */

/* ── Welche Umfrage gerade dran ist ──────────────────────────
   **Höchstens eine am Tag, und immer nur eine auf einmal.** Laufen
   mehrere, kommen sie nacheinander: die erste noch unbeantwortete,
   und die nächste frühestens am folgenden Tag. Keine geht dabei
   verloren — sie warten, bis sie an der Reihe sind. Wer alle
   hintereinander vorgesetzt bekäme, antwortete auf die zweite
   schon nicht mehr ehrlich.

   Genau dafür steht der Tag der Antwort in der Datei: er ist die
   einzige Angabe, aus der sich „heute schon gefragt" ablesen
   lässt, ohne irgendwo daneben Buch zu führen. */
function openSurveyNow(){
  if(ui.welcome||!state||!srvList.length||!srvSaved()||isMobile()) return null;
  const done=state.surveys||{};
  const today=isoToday();
  for(const k in done) if(done[k]&&done[k].status===1&&done[k].answered===today) return null;
  return srvList.find(s=>{ const e=done[s.id]; return !(e&&e.status===1); })||null;
}
const surveyOpen=()=>!!openSurveyNow();

/* ── Die Fragen einer Umfrage ────────────────────────────────
   Sie stehen inzwischen in **Blöcken**: `blocks[].elements[]`.
   Die alte flache Liste `questions[]` gibt es weiter, sie ist
   aber leer — gelesen werden deshalb die Blöcke, und die Liste
   bleibt als Rückfall für ältere Umfragen. */
function srvQuestions(sv){
  const out=[];
  (Array.isArray(sv&&sv.blocks)?sv.blocks:[]).forEach(b=>{
    (Array.isArray(b.elements)?b.elements:[]).forEach(e=>{ if(e&&e.id) out.push(e); });
  });
  if(out.length) return out;
  return Array.isArray(sv&&sv.questions)?sv.questions:[];
}

/* Ein Text kommt je Sprache: {default:'…'}. Und er kommt als
   **HTML** — der Editor beim Absender schreibt jede Überschrift
   als `<p class="fb-editor-paragraph">…`. Übernommen wird davon
   nichts: FINA hat seine eigene Schrift, und fremdes Markup
   gehört nicht ungeprüft auf den Schirm. Übrig bleibt der nackte
   Text. */
function srvText(v){
  let s='';
  if(typeof v==='string') s=v;
  else if(v&&typeof v==='object') s=String(v.default||v.en||v.de||'');
  if(s.indexOf('<')<0) return s;
  const d=document.createElement('div');
  d.innerHTML=s;
  return (d.textContent||'').replace(/\s+/g,' ').trim();
}

/* ── Das Fenster ─────────────────────────────────────────────
   Jede Frage steht in einem eigenen Block — dieselbe Sprache wie
   das Posten-Fenster: heller Grund, Haarlinie, Radius 8. Darunter
   zwei Zeilen: erst rot der Hinweis aufs Speichern, dann in Ruhe,
   was in der Datei landet. Rot trägt der erste Satz, weil er das
   Einzige nennt, was danach noch zu tun ist. */
function openSurvey(){
  const sv=openSurveyNow();
  if(!sv) return;
  const qs=srvQuestions(sv);
  /* ── Überschrift und Vorspann kommen aus der Umfrage ───────
     Ihren **Namen** gibt die offene Schnittstelle nicht heraus
     (dort steht ausdrücklich „omitted from public API"). Was sie
     herausgibt, ist die **Willkommenskarte** — und die ist genau
     dafür da: Überschrift und ein Satz darunter, beides im
     Dashboard geschrieben.

     **Nur wenn sie eingeschaltet ist.** Abgeschaltet steht dort
     der Vorgabetext („Willkommen!"), und der ist kein Titel,
     sondern das, was Formbricks von Haus aus hinschreibt — dann
     sagt FINA lieber seinen eigenen Satz. Einschalten heißt also:
     „diese Überschrift ist gewollt". */
  const wc=(sv.welcomeCard&&sv.welcomeCard.enabled)?sv.welcomeCard:{};
  const head=srvText(wc.headline)||t('srv.title');
  const sub=srvText(wc.subheader)||t('srv.sub');

  const box=document.createElement('div');
  box.className='modal';
  /* ── Fest bleibt, was zu tun ist ───────────────────────────
     Dieselbe Bauform wie die drei großen Fenster (.split): der
     Rumpf rollt, die Knopfzeile steht. Nur ist der Schnitt hier
     ein anderer — die **Überschrift rollt mit**. Sie ist ein
     Gruß und keine Auskunft, die man beim Ausfüllen braucht;
     gebraucht wird unten, was noch zu tun ist: die Bitte ums
     Speichern, was in der Datei landet, und die beiden Knöpfe.
     Wer bei Frage sieben steht, soll „Absenden" sehen und nicht
     dorthin scrollen müssen. */
  box.innerHTML=`<div class="box form split srvbox">
    <div class="dbody">
      <h3>${esc(head)}</h3>
      <p class="subline">${esc(sub)}</p>
      ${qs.map(srvQuestion).join('')}
    </div>
    <p class="errline" id="srvErr" hidden></p>
    <!-- Die orange Bahn sagt, was noch zu tun ist; der Satz
         darunter, was in der Datei stehen wird. -->
    <p class="srvsave">${esc(t('srv.save'))}</p>
    <p class="subline srvnote">${esc(t('srv.note'))}</p>
    <div class="row-end">
      <button class="btn" id="srvLater">${t('srv.later')}</button>
      <button class="btn primary" id="srvSend">${t('srv.send')}</button>
    </div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);

  const err=box.querySelector('#srvErr'), send=box.querySelector('#srvSend');
  box.querySelector('#srvLater').onclick=()=>box.remove();

  /* Auswahl und Bewertung sind Knöpfe, keine Kästchen: **gewählt
     trägt Tinte** — dieselbe Sprache wie ein gedrückter
     Filterknopf. Bei einer Einfachauswahl und bei der Bewertung
     löscht die neue Wahl die alte, bei einer Mehrfachauswahl
     nicht; ein zweiter Klick nimmt sie überall zurück. */
  box.querySelectorAll('.srvpick').forEach(b=>{
    b.onclick=()=>{
      const on=!b.classList.contains('on');
      if(b.dataset.one==='1')
        box.querySelectorAll(`.srvpick[data-sq="${CSS.escape(b.dataset.sq)}"]`)
           .forEach(o=>o.classList.remove('on'));
      b.classList.toggle('on',on);
      err.hidden=true;
    };
  });

  send.onclick=()=>{
    const data=srvCollect(box,qs);
    if(!Object.keys(data).length){ err.textContent=t('srv.needOne'); err.hidden=false; return; }
    err.hidden=true;
    send.disabled=true; send.textContent=t('srv.sending');

    fetch(SURVEY_POST,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({surveyId:sv.id,data,finished:true,meta:{source:'FINA '+VERSION}})
    })
      .then(r=>{ if(!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(()=>{
        /* **Erst jetzt** kommt der Vermerk in die Datei — vorher
           stünde dort „beantwortet" für eine Antwort, die nie
           angekommen ist. Mit ihm verschwindet der Knopf. */
        state.surveys=state.surveys||{};
        const seen=(state.surveys[sv.id]||{}).seen;
        state.surveys[sv.id]={status:1,answered:isoToday()};
        if(seen) state.surveys[sv.id].seen=seen;
        save(); render();
        box.remove();
        toast(t('srv.ok'));
      })
      .catch(()=>{
        /* Fehlgeschlagen heißt: nichts wird vermerkt. Die Umfrage
           bleibt offen und der Knopf stehen. */
        send.disabled=false; send.textContent=t('srv.send');
        err.textContent=t('srv.failNet'); err.hidden=false;
      });
  };
}

/* ── Eine Frage als Block ────────────────────────────────────
   Drei Formen decken alles ab, was eine kurze Umfrage braucht:
   ein Feld zum Schreiben, eine Liste zum Ankreuzen, eine Skala.
   Was hier nicht steht, wird zum Textfeld — lieber eine Frage,
   die man beantworten kann, als eine, die gar nicht erscheint. */
function srvQuestion(q,i){
  const head=`<p class="srvhead"><span class="srvnr">${i+1}</span>${esc(srvText(q.headline))}</p>`;
  const sub=srvText(q.subheader);
  const subl=sub?`<p class="subline">${esc(sub)}</p>`:'';
  const wrap=inner=>`<div class="dgrp srvq">${head}${subl}${inner}</div>`;

  if(q.type==='multipleChoiceSingle'||q.type==='multipleChoiceMulti'){
    const one=q.type==='multipleChoiceSingle'?'1':'0';
    const rows=(Array.isArray(q.choices)?q.choices:[]).map(c=>{
      const lab=esc(srvText(c.label));
      return `<button type="button" class="btn srvpick" data-sq="${esc(q.id)}"
        data-one="${one}" data-sv="${lab}">${lab}</button>`;
    }).join('');
    return wrap(`<div class="srvopts">${rows}</div>`);
  }

  if(q.type==='rating'||q.type==='nps'){
    /* NPS geht von 0 bis 10, eine Bewertung von 1 bis zur
       eingestellten Spanne. Die Zahlen stehen als Knöpfe da — auf
       einer Skala tippt niemand gern. */
    const lo=q.type==='nps'?0:1, hi=q.type==='nps'?10:(parseInt(q.range,10)||5);
    let out='';
    for(let n=lo;n<=hi;n++) out+=`<button type="button" class="btn srvpick srvnum"
      data-sq="${esc(q.id)}" data-one="1" data-sv="${n}">${n}</button>`;
    /* Was die beiden Enden bedeuten, steht bei ihnen — eine Reihe
       nackter Zahlen sagt nicht, wo gut ist. Und es steht **unter
       der Skala**, nicht über die ganze Fensterbreite gespannt. */
    const lol=srvText(q.lowerLabel), hil=srvText(q.upperLabel);
    const ends=(lol||hil)
      ? `<div class="srvends"><span>${esc(lol)}</span><span>${esc(hil)}</span></div>` : '';
    return wrap(`<div class="srvscale"><div class="srvnums">${out}</div>${ends}</div>`);
  }

  return wrap(`<textarea class="srvtext" rows="2" data-sq="${esc(q.id)}"
    placeholder="${esc(srvText(q.placeholder))}"></textarea>`);
}

/* ── Was der Nutzer angekreuzt hat ───────────────────────────
   Der Schlüssel ist die Kennung der Frage, der Wert ihr Text —
   genau so erwartet es die Schnittstelle. Mehrfachauswahl kommt
   als Liste, eine Bewertung als Zahl. */
function srvCollect(box,qs){
  const data={};
  qs.forEach(q=>{
    const sel=`[data-sq="${CSS.escape(q.id)}"]`;
    if(q.type==='multipleChoiceMulti'){
      const v=[...box.querySelectorAll(sel+'.on')].map(e=>e.dataset.sv);
      if(v.length) data[q.id]=v;
    }else if(q.type==='multipleChoiceSingle'){
      const e=box.querySelector(sel+'.on');
      if(e) data[q.id]=e.dataset.sv;
    }else if(q.type==='rating'||q.type==='nps'){
      const e=box.querySelector(sel+'.on');
      if(e) data[q.id]=parseInt(e.dataset.sv,10);
    }else{
      const e=box.querySelector(sel);
      if(e&&e.value.trim()) data[q.id]=e.value.trim();
    }
  });
  return data;
}
