/* ══════════════════════════════════════════════════════════════
   FINA — Kategorien umbenennen, anlegen, entfernen

   Kategorien werden nur über ihren Namen referenziert: eine
   Position merkt sich `group` — Einnahmen, flexible und reguläre
   Posten gleichermaßen (seit 6.9.26 abends stehen alle drei in
   state.fixed).

   Deshalb darf ein Name NIE direkt in `state.groups`,
   `state.incomeGroups` oder `state.flexGroups` überschrieben werden
   — sonst zeigen die Referenzen ins Leere und die Zeilen
   verschwinden. Immer diese Funktionen benutzen; sie ziehen alles
   Abhängige mit.
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

/* ── Flexible Kategorien (flexGroups, seit 6.9.26) ───────────
   Die flexiblen Posten sind seit 6.9.26 abends gewöhnliche Posten in
   state.fixed (siehe migrateKak in js/state.js) — ihre Kategorie
   hängt an `group` wie bei jedem Posten. Umbenennen und Entfernen
   gehen deshalb dieselben Wege wie bei den regulären Kategorien;
   entfernt eine flexible Kategorie, ziehen ihre Posten nach
   „Flexibel ohne Kategorie" (NOCAT_FLEX), das immer da ist. */
const flexGroupUseCount=groupUseCount;
const renameFlexGroup=renameGroup;
function dropFlexGroup(name){ dropGroup(name,NOCAT_FLEX); }

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
  for(let m=1;m<=12;m++){ if(state.flexSource&&state.flexSource[m]) months++; }
  const tx=flexTx().length;
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
  for(let m=1;m<=12;m++){ state.flexSource[m]=null; }
  state.lastImport=null;
  /* Ohne Buchungen gibt es keine Unterkategorien mehr — dieselbe
     Antwort wie beim Öffnen einer Datei ohne Import (afterLoad). */
  ui.kakDetail=false;
}
