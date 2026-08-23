/* ══════════════════════════════════════════════════════════════
   FINA — Die Umfrage

   **Gefragt wird in FINA selbst.** Kein fremdes Formular, keine
   fremde Seite: der Nutzer antwortet in diesem Fenster, FINA
   schickt die Antworten ab und wartet auf die Bestätigung —
   **erst danach** wird in seiner Datei vermerkt, dass diese
   Anfrage erledigt ist. Schlägt das Senden fehl, bleibt sie offen
   und kommt beim nächsten Öffnen wieder.

   In die Datei kommen drei Angaben und sonst nichts: die Nummer
   der Anfrage, ihr Status und der Tag der Antwort (siehe
   `state.surveys` in js/state.js). **Die Antworten selbst stehen
   nicht darin** — die liegen beim Absender, ohne Kennung des
   Nutzers. Genau das sagt das Fenster vor dem Absenden.

   ── Dieser Stand ist der Probelauf ───────────────────────────
   Der Knopf in der Kopfzeile (`#btnSurveyTest`) ist **vorläufig**
   und fliegt wieder heraus, sobald die Zeitregel steht: er öffnet
   das Fenster von Hand, damit sich einmal ansehen lässt, was
   ankommt und was in der Datei landet.

   Die Fragen holt dieser Stand **bei Formbricks selbst** — die
   erste veröffentlichte Umfrage des Arbeitsbereichs, mit ihren
   Fragen, ihrer Reihenfolge und ihren Antwortmöglichkeiten. Damit
   gibt es nichts abzutippen und nichts, was auseinanderlaufen
   könnte. Später kommen die Fragen aus einer eigenen Datei auf
   `fina-app.de` (eine je Umfrage, benannt nach ihrem Datum) — das
   Absenden und der Eintrag in der Datei bleiben dieselben.
   ══════════════════════════════════════════════════════════════ */

/* Die beiden Adressen der offenen Client-Schnittstelle. Sie
   arbeitet ohne Schlüssel: es steht nichts Geheimes im Code, und
   sie nimmt Anfragen aus jeder Umgebung an — also auch aus der
   Mac- und der Windows-App unter file://. */
const SURVEY_READ=`${SURVEY_HOST}/api/v1/client/${SURVEY_WS}/environment`;
const SURVEY_POST=`${SURVEY_HOST}/api/v1/client/${SURVEY_WS}/responses`;

/* Ein Text kommt bei Formbricks je Sprache: {default:'…'}. Ältere
   Fassungen schreiben ihn nackt hin — beides wird angenommen.

   Und er kommt als **HTML**: der Editor dort schreibt jede
   Überschrift als `<p class="fb-editor-paragraph">…`. Übernommen
   wird davon nichts — FINA hat seine eigene Schrift, und fremdes
   Markup gehört nicht ungeprüft auf den Schirm. Übrig bleibt der
   nackte Text. */
function srvText(v){
  let s='';
  if(typeof v==='string') s=v;
  else if(v&&typeof v==='object') s=String(v.default||v.en||v.de||'');
  if(s.indexOf('<')<0) return s;
  const d=document.createElement('div');
  d.innerHTML=s;
  return (d.textContent||'').replace(/\s+/g,' ').trim();
}

/* ── Die Fragen einer Umfrage ────────────────────────────────
   Formbricks hat seine Umfragen inzwischen in **Blöcke**
   gegliedert: `blocks[].elements[]`. Die alte flache Liste
   `questions[]` steht weiter im Bauplan, ist aber leer. Gelesen
   werden deshalb die Blöcke, und die Liste bleibt als Rückfall —
   eine ältere Umfrage soll nicht plötzlich leer sein. */
function srvQuestions(sv){
  const bl=Array.isArray(sv&&sv.blocks)?sv.blocks:[];
  const out=[];
  bl.forEach(b=>{ (Array.isArray(b.elements)?b.elements:[]).forEach(e=>{ if(e&&e.id) out.push(e); }); });
  if(out.length) return out;
  return Array.isArray(sv&&sv.questions)?sv.questions:[];
}

/* ── Das Fenster ─────────────────────────────────────────────
   Es steht sofort da und sagt, dass die Fragen geholt werden:
   eine Abfrage über das Netz kann dauern, und ein Knopf, nach dem
   eine Sekunde lang nichts passiert, sieht kaputt aus. */
function openSurveyTest(){
  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box form">
    <h3>${esc(t('srv.title'))}</h3>
    <p class="subline">${esc(t('srv.sub'))}</p>
    <div class="dgrp" id="srvBody"><p class="subline">${esc(t('srv.load'))}</p></div>
    <p class="subline">${esc(t('srv.note'))}</p>
    <p class="errline" id="srvErr" hidden></p>
    <div class="row-end">
      <button class="btn" id="srvLater">${t('srv.later')}</button>
      <button class="btn primary" id="srvSend" disabled>${t('srv.send')}</button>
    </div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);

  const body=box.querySelector('#srvBody'), err=box.querySelector('#srvErr'),
        send=box.querySelector('#srvSend');
  box.querySelector('#srvLater').onclick=()=>box.remove();

  const fail=msg=>{ body.innerHTML=''; err.textContent=msg; err.hidden=false; };

  let survey=null, qs=[];

  fetch(SURVEY_READ,{cache:'no-store'})
    .then(r=>r.ok?r.json():null)
    .then(d=>{
      /* Die Antwort ist zweimal in `data` eingepackt; ältere
         Fassungen packen sie nur einmal ein. Gesucht wird
         deshalb an beiden Stellen, statt sich auf eine zu
         verlassen. */
      const env=(d&&d.data&&d.data.data)||(d&&d.data)||{};
      const list=Array.isArray(env.surveys)?env.surveys:[];
      survey=list[0]||null;
      qs=survey?srvQuestions(survey):[];
      if(!survey||!qs.length){ fail(t('srv.failNone')); return; }
      body.innerHTML=qs.map(srvQuestion).join('');
      /* Die Zahlenknöpfe einer Bewertung: einer trägt die Wahl,
         ein zweiter Klick nimmt sie zurück — wie ein Filterknopf.
         Verdrahtet wird hier und nicht in `wire()`: das Fenster
         baut sich selbst und wird nicht neu gezeichnet (Regel 1
         gilt den Ansichten). */
      body.querySelectorAll('.srvnum').forEach(b=>{
        b.onclick=()=>{
          const on=!b.classList.contains('on');
          body.querySelectorAll(`.srvnum[data-sq="${CSS.escape(b.dataset.sq)}"]`)
              .forEach(o=>o.classList.remove('on'));
          b.classList.toggle('on',on);
        };
      });
      tabThroughFields(box);
      send.disabled=false;
    })
    .catch(()=>fail(t('srv.failNet')));

  /* ── Absenden ─────────────────────────────────────────────
     Gesammelt wird, was ausgefüllt ist; leere Fragen bleiben
     weg. Der Knopf sperrt sich, solange die Antwort aussteht —
     zweimal geklickt wären zwei Antworten desselben Nutzers. */
  send.onclick=()=>{
    if(!survey) return;
    const data=srvCollect(box,qs);
    if(!Object.keys(data).length){ err.textContent=t('srv.needOne'); err.hidden=false; return; }
    err.hidden=true;
    send.disabled=true; send.textContent=t('srv.sending');

    fetch(SURVEY_POST,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({surveyId:survey.id,data,finished:true,meta:{source:'FINA '+VERSION}})
    })
      .then(r=>{ if(!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(()=>{
        /* **Erst jetzt** kommt der Eintrag in die Datei — vorher
           stünde dort „beantwortet" für eine Antwort, die nie
           angekommen ist. */
        const nr=ymd();
        state.surveys=state.surveys||{};
        state.surveys[nr]={status:1,answered:isoToday()};
        save(); render();
        box.remove();
        toast(t('srv.ok',nr));
      })
      .catch(()=>{
        /* Fehlgeschlagen heißt: nichts wird vermerkt. Die Anfrage
           bleibt offen und kommt wieder. */
        send.disabled=false; send.textContent=t('srv.send');
        err.textContent=t('srv.failNet'); err.hidden=false;
      });
  };
}

/* ── Eine Frage als Feld ─────────────────────────────────────
   Die fünf Formen, die Formbricks kennt und die für eine kurze
   Umfrage in Frage kommen. Was hier nicht steht, wird zu einem
   gewöhnlichen Textfeld: lieber eine Frage, die man beantworten
   kann, als eine, die gar nicht erst erscheint. */
function srvQuestion(q,i){
  const head=`<label class="srvq">${i+1}. ${esc(srvText(q.headline))}</label>`;
  const sub=srvText(q.subheader);
  const subl=sub?`<p class="subline">${esc(sub)}</p>`:'';
  const ch=Array.isArray(q.choices)?q.choices:[];

  if(q.type==='multipleChoiceSingle'||q.type==='multipleChoiceMulti'){
    const multi=q.type==='multipleChoiceMulti';
    const rows=ch.map(c=>{
      const lab=esc(srvText(c.label));
      return `<label class="srvopt"><input type="${multi?'checkbox':'radio'}"
        name="q${i}" data-sq="${esc(q.id)}" value="${lab}"> ${lab}</label>`;
    }).join('');
    return `<div class="srvfield">${head}${subl}<div class="srvopts">${rows}</div></div>`;
  }

  if(q.type==='rating'||q.type==='nps'){
    /* NPS geht von 0 bis 10, eine Bewertung von 1 bis zur
       eingestellten Spanne. Die Zahl steht als Knopf da — auf
       einer Skala tippt niemand gern. */
    const lo=q.type==='nps'?0:1, hi=q.type==='nps'?10:(parseInt(q.range,10)||5);
    let out='';
    for(let n=lo;n<=hi;n++) out+=`<button type="button" class="btn small srvnum"
      data-sq="${esc(q.id)}" data-sv="${n}">${n}</button>`;
    /* Was die beiden Enden der Skala bedeuten, steht bei ihnen —
       eine Reihe nackter Zahlen sagt nicht, wo gut ist. */
    const lol=srvText(q.lowerLabel), hil=srvText(q.upperLabel);
    const ends=(lol||hil)
      ? `<p class="subline srvends"><span>${esc(lol)}</span><span>${esc(hil)}</span></p>` : '';
    return `<div class="srvfield">${head}${subl}<div class="srvnums">${out}</div>${ends}</div>`;
  }

  return `<div class="srvfield">${head}${subl}
    <textarea rows="2" data-sq="${esc(q.id)}"></textarea></div>`;
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
      const v=[...box.querySelectorAll(sel)].filter(e=>e.checked).map(e=>e.value);
      if(v.length) data[q.id]=v;
    }else if(q.type==='multipleChoiceSingle'){
      const e=[...box.querySelectorAll(sel)].find(e=>e.checked);
      if(e) data[q.id]=e.value;
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
