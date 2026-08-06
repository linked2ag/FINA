/* ══════════════════════════════════════════════════════════════
   FINA — Laden und Speichern
   Einzige Ablage ist eine JSON-Datei, die der Nutzer auswählt.
   Kein Server, kein localStorage, keine Dauerverbindung.
   Gespeichert wird nur auf Klick; jede Änderung setzt dirty.
   ══════════════════════════════════════════════════════════════ */

let fileHandle=null, fileName='', dirty=false;

/* Chrome und Edge können in dieselbe Datei zurückschreiben.
   Fehlt die Schnittstelle (Safari, Firefox), wird heruntergeladen. */
const canFS=typeof window.showSaveFilePicker==='function';

/* Merkt nur vor, dass es ungespeicherte Änderungen gibt. */
function save(){ dirty=true; renderStatus(); }

function downloadJson(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=fileName||`fina-${YEAR}.json`;
  a.click(); URL.revokeObjectURL(a.href);
}

async function writeHandle(){
  const p=await fileHandle.queryPermission({mode:'readwrite'});
  if(p!=='granted'){ const r=await fileHandle.requestPermission({mode:'readwrite'}); if(r!=='granted') return false; }
  const w=await fileHandle.createWritable();
  await w.write(JSON.stringify(state,null,2)); await w.close();
  return true;
}

async function loadData(){
  try{
    if(canFS){
      const [h]=await window.showOpenFilePicker({types:[{description:t('store.fileKind'),accept:{'application/json':['.json']}}]});
      const f=await h.getFile(); const txt=await f.text();
      if(!txt.trim()) throw new Error(t('store.empty'));
      state=migrate(JSON.parse(txt));
      fileHandle=h; fileName=h.name; dirty=false;
      afterLoad(); ui.welcome=false;
      render(); toast(t('store.loaded',fileName));
    } else {
      document.getElementById('fileJson').click();
    }
  }catch(e){ if(e.name!=='AbortError') toast(t('store.loadFail',e.message)); }
}

async function saveData(){
  try{
    if(fileHandle){
      if(await writeHandle()){ dirty=false; renderStatus(); toast(t('store.saved',fileName)); return; }
    }
    if(canFS){
      const h=await window.showSaveFilePicker({suggestedName:fileName||`fina-${YEAR}.json`,
        types:[{description:t('store.fileKind'),accept:{'application/json':['.json']}}]});
      fileHandle=h; fileName=h.name;
      if(await writeHandle()){ dirty=false; render(); toast(t('store.saved',fileName)); }
    } else { downloadJson(); dirty=false; renderStatus(); toast(t('store.downloaded')); }
  }catch(e){ if(e.name!=='AbortError') toast(t('store.saveFail',e.message)); }
}

function unlinkData(){
  if(dirty && !confirm(t('store.unlinkAsk'))) return;
  fileHandle=null; fileName=''; dirty=false;
  state=emptyState(); afterLoad();
  /* Getrennt heißt: zurück auf Anfang. Die Begrüßung ist dann die
     einzige Seite, die es zu sehen gibt — sonst stünde man wieder
     vor einer leeren Matrix. */
  ui.welcome=true;
  render();
  toast(t('store.unlinked'));
}

/* Mit einem leeren Buch anfangen. Eine Datei gibt es dabei noch
   nicht: die entsteht erst beim ersten „Daten speichern", und bis
   dahin steht in der Statuszeile, dass noch nichts gesichert ist. */
function startEmpty(){
  fileHandle=null; fileName=''; dirty=false;
  state=emptyState(); afterLoad();
  ui.welcome=false;
  render();
  toast(t('store.started'));
}

/* Dateiname und Speicherstand in Kopf- und Fußzeile. Ungespeichert
   wird am Dateinamen gezeigt — fett und rot; die Knöpfe daneben
   bleiben schlicht. */
function renderStatus(){
  const fp=document.getElementById('filePath');
  if(fp){
    fp.textContent=fileName?(fileName+(dirty?t('store.unsaved'):'')):t('store.none');
    fp.classList.toggle('on',!!fileName);
    fp.classList.toggle('warnpath',dirty);
    fp.title=fileName?t('store.pathTip'):t('store.noFileTip');
  }
  /* Schließen geht immer, sobald ein Buch offen ist — auch bei
     einem frisch angefangenen, das noch keine Datei hat. Es ist
     der Weg zurück zur Begrüßungsseite, und der darf nicht davon
     abhängen, ob schon etwas darin steht. Auf der Begrüßungsseite
     selbst ist der Knopf ohnehin verborgen. */
  const ub=document.getElementById('btnUnlink'); if(ub) ub.disabled=!!ui.welcome;
  const sb=document.getElementById('btnSave'); if(sb) sb.disabled=!dirty&&!state.fixed.length&&!state.tx.length;
  const el=document.getElementById('storeStatus');
  if(el) el.innerHTML=(fileName?t('store.loadedFrom',esc(fileName)):t('store.noFile'))
    +(dirty?t('store.dirty'):t('store.clean'))
    +' &nbsp;·&nbsp; '+t('store.lastImport',state.lastImport||t('store.never'));
}

window.addEventListener('beforeunload',e=>{ if(dirty){ e.preventDefault(); e.returnValue=''; } });
