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

/* ── Vergleichsstoff für das Suchfeld ─────────────────────────
   Gesucht wird in dem, was an der Zeile zu sehen ist — aber nur
   in den Teilen, die der Nutzer dafür gewählt hat. m = 1…12
   nimmt nur diesen Monat (Monatsansicht), ohne m alle zwölf
   (Jahresansicht). Beträge kommen zweimal vor — als „-1.234,56"
   wie auf dem Schirm und als „-1234.56" wie in der Datei —, damit
   beide Schreibweisen ans Ziel führen; norm() macht dabei Punkt
   und Komma gleich.

   Die fünf Teile stehen in QFIELDS (js/state.js) und werden im
   Fenster hinter dem Hamburger-Knopf an- und abgewählt. Fehlt die
   Angabe — eine Datei von vor dieser Wahl —, gilt alles.

   Die Jahressumme steht nur in der Jahresmatrix, gesucht wird sie
   trotzdem in beiden Ansichten: es ist dieselbe Position, und wer
   nach ihr sucht, will sie auch im Monat finden. */
const qField=k=>!(state&&state.filterFields)||state.filterFields[k]!==false;
/* Ein Betrag in beiden Schreibweisen. */
const hayNum=v=>[eur(v),String(Math.round(v*100)/100)];

function hayItem(it,m){
  const v=m?[it.amounts[m-1]]:it.amounts;
  const n=m?[it.notes[m-1]||'']:it.notes;
  const p=[];
  if(qField('name')) p.push(it.name);
  if(qField('meta')) p.push(keyLabel(it.group),bankLabel(it.bank),payLabel(it.pay),DUE_LABEL(it.dueDay));
  if(qField('note')) p.push(it.note||'',...n);
  if(qField('amount')) p.push(...v.map(eur),...v.map(String));
  if(qField('total')) p.push(...hayNum(it.amounts.reduce((a,b)=>a+b,0)));
  return norm(p.join(' '));
}
function hayKak(k,m){
  const e=state.kak[k]; if(!e) return '';
  const all=MONTHS.map((_,i)=>kakVal(k,i+1));
  const v=m?[kakVal(k,m)]:all;
  const n=m?[e.notes[m-1]||'']:e.notes;
  const p=[];
  /* Der Name einer Flexible-Payments-Kategorie ist zugleich ihre
     Kategorie — er zählt zur Bezeichnung, nicht zu den Kürzeln. */
  if(qField('name')) p.push(keyLabel(k));
  if(qField('note')) p.push(e.note||'',...n);
  if(qField('amount')) p.push(...v.map(eur),...v.map(String));
  if(qField('total')) p.push(...hayNum(all.reduce((a,b)=>a+b,0)));
  return norm(p.join(' '));
}
/* Der getippte Suchbegriff, vergleichsfertig. Leer heißt: alles
   passt. */
const queryQ=()=>norm((ui.q||'').trim());

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

/* Gibt es überhaupt importierte Buchungen? Daran hängt der Reiter
   „Flexible Payment Details": er wertet genau sie aus, ohne
   Import stünde dort eine leere Gliederung. Gefragt wird nach
   beidem — den Buchungen und der Quelle je Monat —, damit auch
   eine von Hand zusammengestellte Datei erkannt wird. */
const hasImport=()=>!!state&&(((state.tx||[]).length>0)
  ||Object.keys(state.flexSource||{}).some(m=>state.flexSource[m]));
const kakOv=(k,m)=>{const e=state.kak[k];return e&&e.override&&e.override[m-1]!=null?e.override[m-1]:null;};
const kakVal=(k,m)=>{
  const o=kakOv(k,m); if(o!=null) return o;
  return hasActual(m)?(state.flexActual[m][k]||0):((state.kak[k]&&state.kak[k].plan[m-1])||0);
};
/* ── Woher der Wert eines Monats stammt ───────────────────────
   Dieselbe Rangfolge wie kakVal() und kakDone(), nur als Wort —
   damit die Ansicht zeigen kann, worauf sie sich stützt:

     corr  von Hand korrigierter Import
     imp   Ist-Wert aus Fast Budget
     done  kein Import, aber abgehakt
     fix   fester eingetippter Betrag, gilt damit als erfasst
     est   geschätzt und noch offen
     none  gar kein Betrag

   Wer die Rangfolge in kakVal/kakDone ändert, ändert sie hier
   mit: die Spalte behauptete sonst etwas anderes, als gerechnet
   wird. */
function flexKind(k,m){
  const e=state.kak[k]; if(!e) return 'none';
  if(kakOv(k,m)!=null) return 'corr';
  if(hasActual(m)) return 'imp';
  if(e.paid[m-1]) return 'done';
  if((e.plan[m-1]||0)===0) return 'none';
  return e.estimated?'est':'fix';
}
const FLEX_KIND_LABEL={corr:'kak.kCorr',imp:'kak.kImp',done:'kak.kDone',fix:'kak.kFix',est:'kak.kEst'};

function kakDone(k,m){
  const e=state.kak[k]; if(!e) return false;
  if(kakOv(k,m)!=null) return true;
  if(hasActual(m)) return true;
  if(e.paid[m-1]) return true;
  return !e.estimated && (e.plan[m-1]||0)!==0;   /* fester, eingetippter Wert gilt als erfasst */
}
const planSum=m=>kakCats().reduce((s,k)=>s+((state.kak[k]&&state.kak[k].plan[(m||1)-1])||0),0);

/* Wie weit ist das Jahr gelaufen? Im laufenden Jahr bis zum
   heutigen Monat, in einem vergangenen bis Dezember, in einem
   künftigen noch gar nicht. CUR allein reicht dafür nicht: dort
   steht für jedes fremde Jahr eine 1. */
function elapsedMonths(){
  const y=new Date().getFullYear();
  if(y>YEAR) return 12;
  if(y<YEAR) return 0;
  return CUR;
}

/* Und wie viele davon sind ganz vorbei? Der laufende Monat zählt
   hier nicht mit — er ist noch nicht abgerechnet. Alles, was
   „abschließen" heißt, hört deshalb einen Monat früher auf als
   elapsedMonths(). */
function completedMonths(){
  const y=new Date().getFullYear();
  if(y>YEAR) return 12;
  if(y<YEAR) return 0;
  return CUR-1;
}

/* Grundlage der Prognose-Annahme: **alle** bisherigen Monate,
   deren Werte feststehen — nicht nur die letzten paar. Feststehen
   heißt kakDone(): aus dem Import, aus einer Korrektur, abgehakt
   oder als fester Wert eingetippt. Ein Monat, in dem nur die
   geschätzte Annahme steht, zählt nicht mit; sonst rechnete die
   Annahme ihren eigenen Durchschnitt aus. */
function avgMonths(){
  const ms=[], last=elapsedMonths();
  for(let m=1;m<=last;m++) if(hasActual(m)||kakCats().some(k=>kakDone(k,m))) ms.push(m);
  return ms;
}

/* Der Durchschnitt einer Kategorie über diese Monate — gezählt
   werden nur die, in denen sie selbst einen feststehenden Wert
   hat. So zieht ein Monat, den eine andere Kategorie beigesteuert
   hat, den Schnitt nicht auf null. */
function avgActual(k,ms){
  const use=(ms||avgMonths()).filter(m=>kakDone(k,m));
  if(!use.length) return null;
  return Math.round(use.reduce((s,m)=>s+kakVal(k,m),0)/use.length*100)/100;
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
