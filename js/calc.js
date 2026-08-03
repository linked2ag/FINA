/* ══════════════════════════════════════════════════════════════
   FINA — Berechnungen
   Alle abgeleiteten Zahlen. Lesen den Zustand, ändern ihn nie.
   ══════════════════════════════════════════════════════════════ */

/* ── Listen aus dem Zustand ───────────────────────────────── */
const kakCats=()=>((state&&state.kakCats)||[]);
const costGroups=()=>(state&&state.groups?state.groups:[]);
const allGroups=()=>['EINNAHMEN'].concat(costGroups());
const bankLabel=c=>{const b=(state.banks||[]).find(x=>x.code===c);return b?b.label:c;};
const payLabel=c=>{const p=(state.pays||[]).find(x=>x.code===c);return p?p.label:c;};

/* ── Regelmäßige Posten ───────────────────────────────────── */
const isIncome=it=>it.group==='EINNAHMEN';
const paidAt=(it,m)=>!!it.paid[m-1];
const estOf=it=>!!it.estimated;

/* Eine Position über ihre Kennung. Die Saldokorrektur steht nicht
   in state.fixed (siehe js/state.js), wird aber über dieselben
   Wege bearbeitet und benotet — deshalb kennt sie diese eine
   Nachschlagestelle mit. */
const isBalanceItem=it=>!!it&&it.id===BALANCE_ID;
function findItem(id){
  if(!state) return null;
  if(id===BALANCE_ID) return state.balance||null;
  return state.fixed.find(x=>x.id===id)||null;
}

/* ── Saldokorrektur ───────────────────────────────────────────
   Geht als eigener Summand in den Monatssaldo ein und taucht in
   der Prognose als eigene Spalte auf. In income()/fixedCost()
   gehört sie ausdrücklich nicht. */
const balanceFix=m=>(state&&state.balance?(state.balance.amounts[m-1]||0):0);

/* Nur Posten, die in diesem Monat überhaupt einen Betrag haben. */
function dueIn(m){return state.fixed.filter(it=>it.amounts[m-1]!==0);}
function sumF(m,f){return dueIn(m).filter(f).reduce((s,it)=>s+it.amounts[m-1],0);}

const income=m=>sumF(m,isIncome);
const fixedCost=m=>sumF(m,it=>!isIncome(it));
const paidCost=m=>sumF(m,it=>!isIncome(it)&&paidAt(it,m));
const openCost=m=>sumF(m,it=>!isIncome(it)&&!paidAt(it,m));
const unclearCount=m=>dueIn(m).filter(it=>!isIncome(it)&&estOf(it)&&!paidAt(it,m)).length;

/* Position ist für dieses Jahr erledigt: sie hat überhaupt
   Beträge und jeder davon ist abgehakt — es steht also keine
   Zahlung mehr aus. Die Jahresansicht streicht solche Zeilen
   durch. */
const yearSettled=it=>!!it&&it.amounts.some(v=>v!==0)&&it.amounts.every((v,i)=>v===0||!!it.paid[i]);

/* Erledigt ist auch, was ausgelaufen ist: die Laufzeit endete vor
   dem laufenden Monat und ab dem laufenden Monat steht kein Betrag
   mehr an. So rutscht auch eine Position nach unten, bei der ein
   alter Monat nie abgehakt wurde — grau wird sie deswegen nicht,
   der fehlende Haken bleibt also sichtbar. */
function yearFinished(it){
  if(!it||!it.amounts.some(v=>v!==0)) return false;
  if(yearSettled(it)) return true;
  const n=endIn(it);
  return n!=null&&n<1&&it.amounts.every((v,i)=>i+1<CUR||v===0);
}

/* Erledigte Positionen wandern ans Ende ihrer Kategorie, die
   Reihenfolge der übrigen bleibt wie in der Datei. */
const settledLast=arr=>arr.slice().sort((a,b)=>(yearFinished(a)?1:0)-(yearFinished(b)?1:0));

/* ── Kakeibo ──────────────────────────────────────────────────
   Rangfolge je Monat: von Hand korrigierter Wert (override),
   sonst Ist-Wert aus dem Import, sonst der geplante Wert. */
const hasActual=m=>!!state.flexSource[m];
const kakOv=(k,m)=>{const e=state.kak[k];return e&&e.override&&e.override[m-1]!=null?e.override[m-1]:null;};
const kakVal=(k,m)=>{
  const o=kakOv(k,m); if(o!=null) return o;
  return hasActual(m)?(state.flexActual[m][k]||0):((state.kak[k]&&state.kak[k].plan[m-1])||0);
};
function kakDone(k,m){
  const e=state.kak[k]; if(!e) return false;
  if(kakOv(k,m)!=null) return true;
  if(hasActual(m)) return true;
  if(e.paid[m-1]) return true;
  return !e.estimated && (e.plan[m-1]||0)!==0;   /* fester, eingetippter Wert gilt als erfasst */
}
const planSum=m=>kakCats().reduce((s,k)=>s+((state.kak[k]&&state.kak[k].plan[(m||1)-1])||0),0);

/* Grundlage der Prognose-Annahme: die letzten drei Monate mit
   Fast-Budget-Import und der Durchschnitt einer Kategorie darin. */
function avgMonths(){
  const ms=[]; for(let m=1;m<=12;m++) if(hasActual(m)) ms.push(m);
  return ms.slice(-3);
}
function avgActual(k,ms){
  const use=ms||avgMonths();
  if(!use.length) return null;
  return Math.round(use.reduce((s,m)=>s+(state.flexActual[m][k]||0),0)/use.length*100)/100;
}
const kakeiboFor=m=>kakCats().reduce((s,k)=>s+kakVal(k,m),0);

/* ── Monatssaldo ──────────────────────────────────────────────
   Kosten sind negativ gespeichert, deshalb wird addiert. Die
   Saldokorrektur kommt als vierter Summand dazu. */
const saldo=m=>income(m)+fixedCost(m)+kakeiboFor(m)+balanceFix(m);

/* ── Fortschritt eines Monats ─────────────────────────────── */
function monthParts(m){
  const items=dueIn(m);
  const total=items.length+kakCats().length;
  const done=items.filter(it=>paidAt(it,m)).length+kakCats().filter(k=>kakDone(k,m)).length;
  return {total,done};
}
function monthDone(m){const p=monthParts(m);return p.total>0&&p.done===p.total;}
