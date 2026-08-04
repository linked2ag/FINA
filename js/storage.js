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
      afterLoad();
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
  state=emptyState(); afterLoad(); render();
  toast(t('store.unlinked'));
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
  const ub=document.getElementById('btnUnlink'); if(ub) ub.disabled=!fileName&&!dirty;
  const sb=document.getElementById('btnSave'); if(sb) sb.disabled=!dirty&&!state.fixed.length&&!state.tx.length;
  const el=document.getElementById('storeStatus');
  if(el) el.innerHTML=(fileName?t('store.loadedFrom',esc(fileName)):t('store.noFile'))
    +(dirty?t('store.dirty'):t('store.clean'))
    +' &nbsp;·&nbsp; '+t('store.lastImport',state.lastImport||t('store.never'));
}

window.addEventListener('beforeunload',e=>{ if(dirty){ e.preventDefault(); e.returnValue=''; } });
