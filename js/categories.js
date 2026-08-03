/* ══════════════════════════════════════════════════════════════
   FINA — Kategorien umbenennen, anlegen, entfernen

   Beide Kategoriearten werden nur über ihren Namen referenziert:
   eine Position merkt sich `group`, die Kakeibo-Werte hängen als
   Schlüssel in `kak`, `plan`, `flexActual` und `tx[].main`.

   Deshalb darf ein Name NIE direkt in `state.groups` oder
   `state.kakCats` überschrieben werden — sonst zeigen die
   Referenzen ins Leere und die Zeilen verschwinden. Immer diese
   Funktionen benutzen; sie ziehen alles Abhängige mit.
   ══════════════════════════════════════════════════════════════ */

/* ── Regelmäßige Kategorien (groups) ──────────────────────── */

function groupUseCount(name){
  return state.fixed.filter(it=>it.group===name).length;
}

/* Benennt die Kategorie um und führt alle Positionen nach. */
function renameGroup(oldName,newName){
  if(!oldName||!newName||oldName===newName) return;
  state.fixed.forEach(it=>{ if(it.group===oldName) it.group=newName; });
}

/* Entfernt die Kategorie; vorhandene Positionen ziehen um. */
function dropGroup(name,moveTo){
  if(!name) return;
  state.fixed.forEach(it=>{ if(it.group===name) it.group=moveTo||''; });
}

/* ── Kakeibo-Kategorien (kakCats) ─────────────────────────── */

/* Legt fehlende Datenfächer an — Plan, Haken, Notizen, Ist-Werte. */
function ensureKakCat(name){
  if(!name) return;
  if(!state.kak[name]) state.kak[name]=blankKak(0);
  for(let m=1;m<=12;m++){
    if(!state.flexActual[m]) state.flexActual[m]={};
    if(state.flexActual[m][name]===undefined) state.flexActual[m][name]=0;
  }
}

/* Benennt um und nimmt Plan, Ist-Werte, Korrekturen und die
   importierten Buchungen mit. */
function renameKakCat(oldName,newName){
  if(!oldName||!newName||oldName===newName) return;
  if(state.kak[oldName]){ state.kak[newName]=state.kak[oldName]; delete state.kak[oldName]; }
  if(state.plan&&state.plan[oldName]!==undefined){ state.plan[newName]=state.plan[oldName]; delete state.plan[oldName]; }
  for(let m=1;m<=12;m++){
    const fa=state.flexActual[m];
    if(fa&&fa[oldName]!==undefined){ fa[newName]=fa[oldName]; delete fa[oldName]; }
  }
  state.tx.forEach(x=>{ if((x.main||'(ohne Hauptkategorie)')===oldName) x.main=newName; });
  ensureKakCat(newName);
}

/* Entfernt die Kategorie samt aller Zahlen — Plan, Ist-Werte,
   Korrekturen und die importierten Buchungen. Bleiben die
   Buchungen liegen, tauchen sie in der Kakeibo-Auswertung wieder
   als Kategorie auf, obwohl sie in der Liste nicht mehr steht. */
function dropKakCat(name){
  if(!name) return;
  delete state.kak[name];
  if(state.plan) delete state.plan[name];
  for(let m=1;m<=12;m++){ if(state.flexActual[m]) delete state.flexActual[m][name]; }
  state.tx=state.tx.filter(x=>(x.main||'(ohne Hauptkategorie)')!==name);
}

const kakTxCount=name=>state.tx.filter(x=>(x.main||'(ohne Hauptkategorie)')===name).length;

function kakHasData(name){
  const e=state.kak[name];
  if(e&&(e.plan.some(v=>v!==0)||e.override.some(v=>v!=null)||e.notes.some(Boolean))) return true;
  return kakTxCount(name)>0;
}
