/* ══════════════════════════════════════════════════════════════
   FINA — Datenmodell
   Aufbau des Zustands und Reparatur älterer Dateien beim Laden.
   Die Anwendung startet leer: sämtliche Inhalte — Banken,
   Zahlungsarten, Kategorien, Posten — stehen in der JSON-Datei.
   ══════════════════════════════════════════════════════════════ */

/* state  — die geladene Datei, im Speicher
   ui     — was gerade angezeigt wird; wird nicht mitgespeichert */
let state=null;
/* q ist das Suchfeld der Monatsansicht, qFocus merkt, dass der
   Fokus nach dem Neuzeichnen wieder dorthin gehört (siehe wire()
   in js/app.js). */
let ui={month:CUR,view:'jahr',filter:'alle',dueFilter:'alle',scope:'monat',kakPick:null,
  q:'',qFocus:false};

/* Ergänzt fehlende Felder einer Position auf zwölf Monate. */
function normalize(it){
  it.note=it.note||'';                  /* Notiz zur ganzen Position */
  it.notes=it.notes||Array(12).fill(''); /* Notiz je Monat */
  it.paid=it.paid||Array(12).fill(false);
  if(Array.isArray(it.unclear)){ it.estimated=it.unclear.some(Boolean); delete it.unclear; }
  it.estimated=!!it.estimated;
  while(it.notes.length<12) it.notes.push('');
  while(it.paid.length<12) it.paid.push(false);
  it.bank=it.bank||''; it.pay=it.pay||''; it.dueDay=it.dueDay||''; it.url=it.url||'';
  if(it.end===undefined) it.end=null;
  return it;
}

/* ── Saldokorrektur ───────────────────────────────────────────
   Eine einzige, feste Position über den Einnahmen: hier trägt der
   Nutzer von Hand nach, was über die Monate an Ungenauigkeit
   aufgelaufen ist. Sie wird wie ein regelmäßiger Posten gepflegt
   (dasselbe Fenster, dieselben zwölf Monate), steht aber
   absichtlich NICHT in state.fixed — dort geriete sie in jede
   Summe, jeden Filter und jede Kategorie der regelmäßigen Kosten.
   Löschen lässt sie sich nicht; ohne Beträge ist sie einfach
   leer. */
const BALANCE_ID='balance-correction';
function blankBalance(){
  return normalize({id:BALANCE_ID,name:'Balance Correction',group:'',
    amounts:Array(12).fill(0),estimated:false});
}

/* Leerer Zustand ohne jede Vorgabe. Listen, die der Nutzer schon
   gepflegt hat, bleiben beim Trennen der Datei erhalten. */
function emptyState(){
  const o={},src={};
  for(let m=1;m<=12;m++){o[m]={};src[m]=null;}
  return {
    year:(state&&state.year)||new Date().getFullYear(),
    lang:(state&&state.lang)||'en',
    banks:(state&&state.banks)?state.banks:[],
    pays:(state&&state.pays)?state.pays:[],
    groups:(state&&state.groups)?state.groups:[],
    fixed:[], balance:blankBalance(),
    flexActual:o, flexSource:src, tx:[], plan:{},
    kakCats:[], kak:{}, labWidth:250, monWidth:100, topMin:50, lastImport:null,
    /* Die beiden Filter der Jahresansicht. Sie gehören in die
       Datei, nicht in ui: der Nutzer stellt sie einmal ein und
       will sie beim nächsten Öffnen wiederfinden. Vorgabe: kein
       Filter aktiv, es ist alles zu sehen. */
    hideDoneMonths:false, hideSettled:false
  };
}

/* Neue Kakeibo-Kategorie: Planwerte, Haken, Notizen, Korrekturen
   und ein Link — dieselbe Ausstattung wie ein regelmäßiger
   Posten, nur ohne Bank, Zahlungsart und Fälligkeit. */
function blankKak(v){
  return {plan:Array(12).fill(v||0),paid:Array(12).fill(false),estimated:true,
    note:'',notes:Array(12).fill(''),override:Array(12).fill(null),url:''};
}

/* Einmal beim Öffnen einer Datei: was die Ansicht daraus macht.
   Ohne importierte Buchungen gibt es keine Unterkategorien — dann
   startet die Flexible-Payments-Ansicht bei den Hauptkategorien,
   sonst stünde man vor einer Gliederung, die es nicht gibt.
   Danach entscheidet der Nutzer; deshalb steht das hier und nicht
   in der View, die bei jedem Zeichnen läuft. */
function afterLoad(){
  ui.kakDetail=!!(state&&state.tx&&state.tx.length);
  ui.kakPick=null;

  /* Womit man begrüßt wird. Mit Datei fängt man im laufenden
     Monat an — das ist die Ansicht, in der gearbeitet wird:
     abhaken, nachtragen, nachsehen, was noch offen ist. Ohne
     Datei wäre dort nur ein leerer Monat zu sehen; dann steht
     das Jahr vorn, denn dort legt man an.

     `fileName` gehört js/storage.js und wird gesetzt, bevor
     afterLoad() läuft — beim Trennen ebenso, dort auf ''.
     Der Monat kommt aus CUR: in einer Datei aus einem anderen
     Jahr ist das der Januar. */
  ui.view=fileName?'monat':'jahr';
  ui.month=CUR;
  /* Eine frisch geöffnete Datei wird nicht gefiltert: der
     Suchbegriff der letzten stünde sonst noch im Feld und
     versteckte die halbe Datei. */
  ui.q=''; ui.qFocus=false;
}

/* Bringt eine geladene Datei auf den aktuellen Aufbau. */
function migrate(s){
  /* Einstellungen: fehlen sie, gilt das Jahr der Datei und
     Englisch — so verhalten sich ältere Dateien wie ein
     frischer Start. */
  if(!s.year) s.year=new Date().getFullYear();
  if(s.lang!=='de'&&s.lang!=='en') s.lang='en';
  if(!s.banks) s.banks=[];
  if(!s.pays) s.pays=[];
  if(!s.groups) s.groups=[];
  if(!s.fixed) s.fixed=[];
  if(!s.flexActual) s.flexActual={};
  if(!s.flexSource) s.flexSource={};
  for(let m=1;m<=12;m++){
    if(!s.flexActual[m]) s.flexActual[m]={};
    if(s.flexSource[m]===undefined) s.flexSource[m]=null;
  }
  s.fixed.forEach(it=>{
    /* frühere Feldnamen: status[] / booked[] statt paid[] */
    if(it.status&&!it.paid){
      it.paid=it.status.map(v=>v==='booked');
      if(it.estimated===undefined) it.estimated=it.status.some(v=>v==='unclear');
    }
    if(it.booked&&!it.paid) it.paid=it.booked.slice();
    delete it.status; delete it.booked;
    normalize(it);
  });
  /* Dateien von vor der Saldokorrektur bekommen eine leere Zeile.
     Die Kennung ist fest — daran erkennen Fenster und Ansichten
     die Position wieder. */
  s.balance=s.balance?normalize(s.balance):blankBalance();
  if(!Array.isArray(s.balance.amounts)) s.balance.amounts=Array(12).fill(0);
  while(s.balance.amounts.length<12) s.balance.amounts.push(0);
  s.balance.id=BALANCE_ID;
  if(!s.balance.name) s.balance.name='Balance Correction';
  s.balance.group='';
  /* Sie wird nicht abgehakt und ist nie „geschätzt": ihr Betrag
     IST die Korrektur, die der Nutzer von Hand einträgt. Ältere
     Dateien tragen dort noch Haken — die haben keine Bedeutung
     mehr und werden beim Laden zurückgesetzt. */
  s.balance.paid=Array(12).fill(false);
  s.balance.estimated=false;
  if(!s.plan) s.plan={};
  if(!s.kakCats||!s.kakCats.length) s.kakCats=s.kak?Object.keys(s.kak):[];
  if(!s.kak) s.kak={};
  s.kakCats.forEach(k=>{
    const e=s.kak[k]||(s.kak[k]={});
    if(!Array.isArray(e.plan)) e.plan=Array(12).fill(s.plan[k]||0);
    while(e.plan.length<12) e.plan.push(0);
    if(!Array.isArray(e.paid)) e.paid=Array(12).fill(false);
    if(!Array.isArray(e.notes)) e.notes=Array(12).fill('');
    if(typeof e.note!=='string') e.note='';
    if(!Array.isArray(e.override)) e.override=Array(12).fill(null);
    while(e.override.length<12) e.override.push(null);
    if(e.estimated===undefined) e.estimated=true;
    if(typeof e.url!=='string') e.url='';
  });
  if(!s.labWidth) s.labWidth=250;
  if(!s.monWidth) s.monWidth=100;
  if(typeof s.topMin!=='number'||!(s.topMin>=0)) s.topMin=50;
  if(!s.tx) s.tx=[];
  /* Ältere Dateien kennen die beiden Jahresfilter nicht — dann
     gilt die Vorgabe: nichts ausgeblendet. */
  s.hideDoneMonths=!!s.hideDoneMonths;
  s.hideSettled=!!s.hideSettled;
  return s;
}
