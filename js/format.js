/* ══════════════════════════════════════════════════════════════
   FINA — Formatierung
   Zahlen, Text und Beschriftungen. Reine Funktionen ohne Zugriff
   auf den Zustand.
   ══════════════════════════════════════════════════════════════ */

const nf=new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});

/* Nullbeträge erscheinen als Gedankenstrich, nicht als 0,00. */
const eur=n=>(n===0||n==null?'—':nf.format(n));

/* Vorzeichenklasse für die Einfärbung. */
const cls=n=>n<0?'neg':(n>0?'pos':'');

const uid=()=>'i'+Math.random().toString(36).slice(2,9);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* „1.234,56" und „-1.234,56 €" werden zu Zahlen. */
function parseGermanNumber(s){
  if(s==null) return 0;
  s=String(s).trim().replace(/\s/g,'').replace(/€/g,'');
  if(!s) return 0;
  s=s.replace(/\./g,'').replace(',','.');
  const v=parseFloat(s); return isNaN(v)?0:v;
}

/* ── Fälligkeit ───────────────────────────────────────────────
   Gespeichert wird entweder A/M/E oder ein Tag als Zahl. */
const DUE_LABEL=v=>({A:t('due.A'),M:t('due.M'),E:t('due.E')}[v]||(v?t('due.day',v):''));
const DUE_SHORT=v=>({A:'A',M:'M',E:'E'}[v]||(v?`${v}.`:''));

/* Ordnet auch einen Zahltag einem der drei Abschnitte zu:
   1.–10. Monatsanfang · 11.–20. Monatsmitte · ab 21. Monatsende. */
function dueGroup(v){
  if(v==='A'||v==='M'||v==='E') return v;
  const day=parseInt(v,10);
  if(!isNaN(day)){ if(day<=10) return 'A'; if(day<=20) return 'M'; return 'E'; }
  return '';
}

/* ── Laufzeitende einer Position ──────────────────────────── */
const endShort=it=>it&&it.end?`${String(it.end.m).padStart(2,'0')}.${String(it.end.y).slice(2)}`:'';
const endLabel=it=>it.end?`${MONTHS[it.end.m-1]} ${it.end.y}`:'';
const isLastRate=(it,m)=>it.end&&it.end.y===YEAR&&it.end.m===m;

/* Wie viele Monate stehen noch an, den laufenden mitgezählt?
   August und letzte Rate im August ergibt 1, im Oktober 3.
   0 oder weniger heißt „schon gelaufen", null „kein Ende". */
function endIn(it){
  if(!it||!it.end) return null;
  return (it.end.y-YEAR)*12+(it.end.m-CUR)+1;
}

/* Ampel für die Spalte „Ende" der Jahresansicht: je näher die
   letzte Rate, desto ruhiger die Farbe. Nur die Zelle wird
   eingefärbt, die Farben stehen in css/tokens.css. */
function endClass(it){
  const n=endIn(it);
  if(n==null||n<1) return '';
  if(n===1) return 'e-now';
  if(n===2) return 'e-soon';
  if(n<=6) return 'e-mid';
  return 'e-far';
}

/* Beschriftung dazu — steht als Tooltip an derselben Zelle. */
function endHint(it){
  const n=endIn(it);
  if(n==null) return '';
  if(n<1) return t('end.past',endLabel(it));
  if(n===1) return t('end.now',endLabel(it));
  return t('end.in',endLabel(it),n);
}
