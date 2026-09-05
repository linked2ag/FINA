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
  /* Die Importkriterien der Kategorie (impRules) wohnen seit 5.9.26
     am Objekt selbst — sie ziehen mit dem Verschieben oben von
     selbst um; in state.csvMaps steht nur noch die Struktur einer
     Datei-Art, die keine Kategorie kennt. */
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

/* ── Die Importdaten einer Kategorie in einem Monat wegnehmen ──
   Der Weg zurück aus einem Import — aufgerufen vom Knopf
   „Importdaten löschen" im Beträge-Fenster und vom Zielmenü des
   CSV-Imports. Beide müssen dasselbe tun, deshalb steht es an
   einer Stelle.

   Vier Dinge fallen zusammen, und keins darf fehlen:

     • der Wert wird `null` — die Marke, an der flexImp()
       (js/calc.js) erkennt, dass dieser Monat für diese Kategorie
       kein importierter mehr ist. **Nicht 0:** eine 0 ist ein
       gültiger importierter Betrag.
     • die Korrektur darüber fällt mit: sie beschrieb den Import,
       und ohne ihn zeigte kakVal() weiter ihren Wert an — der
       Monat bliebe abgeschlossen.
     • der Haken geht ab, wie beim Posten. Er stand dort, weil ein
       importierter Monat im Fenster als abgehakt gespeichert wird;
       ohne Import behauptete er eine Bestätigung, die niemand
       gegeben hat.
     • die Buchungen des Monats fallen aus state.tx.

   **Die Quelle des Monats bleibt** (state.flexSource): sie gehört
   dem Monat, und die übrigen Kategorien stehen weiter darin. */
function wipeFlexImport(k,m){
  if(!k||!m) return;
  if(state.flexActual[m]) state.flexActual[m][k]=null;
  const e=state.kak[k];
  if(e){
    if(e.override) e.override[m-1]=null;
    if(e.paid) e.paid[m-1]=false;
  }
  state.tx=state.tx.filter(x=>!(x.m===m&&x.main===k));
}

/* ── Was an Importen im Buch steht — und alles auf einmal weg ──
   (5.9.26) Für den Knopf „Alle importierten Daten löschen" im
   Einstellungsfenster (Bereich Import). importCount() zählt, was
   die Rückfrage nennt: importierte Monatsbeträge regulärer Posten
   (samt Saldokorrektur), die einzelnen Buchungen der flexiblen
   Kosten und die Monate, die eine Quelle tragen. wipeAllImports()
   nimmt es weg — je Posten wie „Importdaten löschen" in seinem
   Fenster, je flexibler Kategorie und Monat über wipeFlexImport().

   **Danach hat das Buch keinen Import mehr**, nicht bloß lauter
   Nullen: flexActual und flexSource fangen je Monat leer an, wie in
   einem Buch, in das nie importiert wurde — der Reiter „Import
   Details" verschwindet damit von selbst (hasImport in js/calc.js).
   Die gemerkten Zuordnungen (state.csvMaps) bleiben: sie sind
   Kriterien für den nächsten Import, keine importierten Daten. */
function importCount(){
  let items=0,months=0;
  const all=(state.fixed||[]).concat(state.balance?[state.balance]:[]);
  all.forEach(it=>{ (it.imp||[]).forEach(v=>{ if(v) items++; }); });
  for(let m=1;m<=12;m++){
    if((state.flexSource&&state.flexSource[m])||Object.keys((state.flexActual&&state.flexActual[m])||{}).length) months++;
  }
  const tx=(state.tx||[]).length;
  return {items:items,tx:tx,months:months,any:items>0||tx>0||months>0};
}
function wipeAllImports(){
  const all=(state.fixed||[]).concat(state.balance?[state.balance]:[]);
  all.forEach(it=>{
    if(!it.imp) return;
    it.imp.forEach((v,i)=>{
      if(!v) return;
      it.amounts[i]=0; it.paid[i]=false; it.imp[i]=false;
      if(it.impRows) delete it.impRows[i+1];
    });
    if(it.impRows&&!Object.keys(it.impRows).length) delete it.impRows;
  });
  for(let m=1;m<=12;m++){
    (state.kakCats||[]).forEach(k=>wipeFlexImport(k,m));
    state.flexActual[m]={};
    state.flexSource[m]=null;
  }
  state.tx=[];
  state.lastImport=null;
  /* Ohne Buchungen gibt es keine Unterkategorien mehr — dieselbe
     Antwort wie beim Öffnen einer Datei ohne Import (afterLoad). */
  ui.kakDetail=false;
}
