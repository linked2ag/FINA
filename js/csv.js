/* ══════════════════════════════════════════════════════════════
   FINA — CSV-Import aus Fast Budget
   Der Export der App liefert je Buchung eine Zeile mit Datum,
   Haupt- und Unterkategorie. Die Hauptkategorien werden zu den
   Kakeibo-Zeilen der Jahresübersicht.
   ══════════════════════════════════════════════════════════════ */

/* Zerlegt eine CSV-Zeile und beachtet Anführungszeichen. */
function splitCsvLine(line,sep){
  const out=[];let cur='',q=false;
  for(let i=0;i<line.length;i++){const c=line[i];
    if(c==='"'){ if(q&&line[i+1]==='"'){cur+='"';i++;} else q=!q; }
    else if(c===sep&&!q){out.push(cur);cur='';}
    else cur+=c;}
  out.push(cur);return out.map(s=>s.trim());
}

/* Findet die Kopfzeile selbst — davor stehen im Export Metazeilen. */
function parseFastBudget(text){
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(l=>l.trim()!=='');
  const hIdx=lines.findIndex(l=>/Hauptkategorie/i.test(l));
  if(hIdx<0) throw new Error(t('imp.noHeader'));
  const sep=lines[hIdx].includes(';')?';':',';
  const head=splitCsvLine(lines[hIdx],sep).map(h=>h.replace(/^"|"$/g,''));
  const col=n=>head.findIndex(h=>h.toLowerCase()===n.toLowerCase());
  const iVal=col('Wert (EUR)')>=0?col('Wert (EUR)'):col('Wert');
  const iCat=col('Kategorie'),iMain=col('Hauptkategorie'),iDate=col('Datum'),iAcc=col('Konto'),iNote=col('Notizen');
  const rows=[];
  for(let i=hIdx+1;i<lines.length;i++){
    const c=splitCsvLine(lines[i],sep); if(c.length<3) continue;
    const d=(c[iDate]||'').match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/); if(!d) continue;
    rows.push({y:+d[3],m:+d[2],d:+d[1],main:(c[iMain]||'').trim(),cat:(c[iCat]||'').trim(),
      acc:(c[iAcc]||'').trim(),note:(c[iNote]||'').trim(),v:parseGermanNumber(c[iVal])});
  }
  return rows;
}

/* ── Vorschau ─────────────────────────────────────────────────
   Sieht die gelesenen Zeilen nur an und rührt den Zustand nicht
   an. Liefert, was das Import-Fenster zeigen muss: Zeitraum,
   Monate mit Anzahl und Summe, neue Hauptkategorien. */
function scanImport(rows){
  const mine=rows.filter(r=>r.y===YEAR);
  const per={};
  mine.forEach(r=>{
    const o=per[r.m]||(per[r.m]={m:r.m,count:0,sum:0});
    o.count++; o.sum=Math.round((o.sum+r.v)*100)/100;
  });
  const ord=r=>r.m*100+r.d;
  const edge=pick=>{
    const r=mine.reduce((a,b)=>a===null?b:(pick(ord(b),ord(a))?b:a),null);
    return r?`${String(r.d).padStart(2,'0')}.${String(r.m).padStart(2,'0')}.${r.y}`:'';
  };
  const known=new Set(kakCats());
  return {
    rows, mine,
    months:Object.values(per).sort((a,b)=>a.m-b.m),
    newCats:[...new Set(mine.map(r=>r.main||'(ohne Hauptkategorie)'))].filter(k=>!known.has(k)),
    skipped:rows.length-mine.length,
    first:edge((b,a)=>b<a), last:edge((b,a)=>b>a)
  };
}

/* Was in einem Monat heute schon steht — für die Rückfrage vor
   dem Überschreiben. */
function importTarget(m){
  return {
    tx:state.tx.filter(x=>x.m===m).length,
    src:state.flexSource[m]||null,
    corr:kakCats().filter(k=>state.kak[k]&&state.kak[k].override[m-1]!=null).length
  };
}

/* Übernimmt die Zeilen: die gewählten Monate werden vollständig
   ersetzt, neue Hauptkategorien selbständig angelegt. Ohne
   Monatsliste werden alle Monate der Datei genommen. */
function applyImport(rows,pick){
  const inYear=rows.filter(r=>r.y===YEAR);
  const months=(pick&&pick.length?pick.slice():[...new Set(inYear.map(r=>r.m))]).sort((a,b)=>a-b);
  const mine=inYear.filter(r=>months.includes(r.m));

  const added=[];
  mine.forEach(r=>{
    const k=r.main||'(ohne Hauptkategorie)';
    if(!state.kakCats.includes(k)){ state.kakCats.push(k); state.kak[k]=blankKak(0); added.push(k); }
  });

  state.tx=state.tx.filter(x=>!months.includes(x.m)).concat(mine);
  months.forEach(m=>{state.kakCats.forEach(k=>{state.flexActual[m][k]=0;
    if(state.kak[k]&&state.kak[k].override) state.kak[k].override[m-1]=null;});state.flexSource[m]='Fast Budget';});
  mine.forEach(r=>{const k=r.main||'(ohne Hauptkategorie)'; state.flexActual[r.m][k]=(state.flexActual[r.m][k]||0)+r.v;});
  for(let m=1;m<=12;m++) state.kakCats.forEach(k=>state.flexActual[m][k]=Math.round((state.flexActual[m][k]||0)*100)/100);

  state.lastImport=new Date().toLocaleString('de-DE');
  save();
  /* skipped = anderes Jahr, dropped = abgewählter Monat. */
  return {count:mine.length,months,added,
    skipped:rows.length-inYear.length, dropped:inYear.length-mine.length};
}
