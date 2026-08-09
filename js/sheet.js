/* ══════════════════════════════════════════════════════════════
   FINA — Import einer FINA-Tabelle (CSV)

   Die Vorlage ist die Tabelle, aus der FINA entstanden ist: eine
   Zeile je Position, zwölf Monatsspalten, davor ein paar Spalten
   mit Kürzeln. Der Export einer Tabellenkalkulation kennt keine
   Gliederung — er liefert nur Zeilen. Die Gliederung steht
   trotzdem darin, und zwar in den Summen:

     * Eine **Blockzeile** trägt hinter jedem Monat ein „/“.
       Das sind GESAMT, EINNAHMEN, FLEXIBLE PAYMENTS,
       REGULAR COSTS — die vier Summenzeilen der Tabelle.
     * Eine **Kategoriezeile** hat keine Kürzel, und ihre zwölf
       Monatswerte sind genau die Summe der Zeilen darunter.
       Genau daran wird sie erkannt (`claim()`): eine Überschrift
       ist, was seine Kinder zusammenzählt.
     * Alles Übrige ist eine **Position**.

   Deshalb wird hier nichts geraten, was sich rechnen lässt. Was
   sich nicht rechnen lässt — welcher Block die Einnahmen sind —,
   entscheidet der Nutzer im Fenster (js/dialogs/sheet-import.js);
   geraten wird dort nur die Vorauswahl.

   Gelesen wird die Datei hier vollständig, geändert wird nichts:
   `parseFinaSheet()` liefert ein Bild der Tabelle, `applySheet()`
   schreibt es — und erst das ruft der letzte Knopf des Fensters.
   ══════════════════════════════════════════════════════════════ */

/* Monatsnamen, die in der Kopfzeile stehen dürfen — deutsch und
   englisch, kurz und lang. Die Tabelle ist älter als die Sprach-
   umschaltung von FINA und kann in beiden Sprachen geführt sein. */
const SHEET_MONTHS=(()=>{
  const o={}, add=arr=>arr.forEach((n,i)=>{ o[n]=i+1; });
  add(['jan','feb','mrz','apr','mai','jun','jul','aug','sep','okt','nov','dez']);
  add(['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']);
  add(['januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember']);
  add(['january','february','march','april','may','june','july','august','september','october','november','december']);
  o['maerz']=3;                         /* Tabellen ohne Umlaute */
  return o;
})();
/* „Mrz." und „MRZ“ sind derselbe Monat. */
const sheetKey=s=>String(s==null?'':s).trim().toLowerCase().replace(/\.$/,'');

/* Beträge werden in Cent verglichen: 0,1+0,2 ist als Fließkomma
   nicht 0,3, und eine Überschrift würde ihre Kinder dann nicht
   wiedererkennen. */
const sheetCents=v=>Math.round((v||0)*100);

/* Ein Kürzel, das nur einen Strich enthält, ist keine Angabe —
   so schreibt die Tabelle „hier steht nichts“. */
const sheetCode=v=>{ const s=String(v==null?'':v).trim(); return (s==='-'||s==='–'||s==='—')?'':s; };

/* ── Die letzte Zahlung ───────────────────────────────────────
   In der Spalte „Deadline“ steht meist ein Monat: „25-08“ ist der
   August 2025, „26-1“ der Januar 2026. Zweistellige Jahre gehören
   in dieses Jahrhundert. Steht dort etwas anderes — „Variabel“,
   „mtl. kündbar“ —, ist es kein Datum, sondern eine Bemerkung:
   sie wandert in die Notiz der Position, statt verloren zu gehen. */
function sheetEnd(v){
  const s=String(v==null?'':v).trim();
  if(!s||s==='-'||s==='–'||s==='—') return null;
  const m=s.match(/^(\d{2}|\d{4})\s*[-./]\s*(\d{1,2})$/);
  if(!m) return null;
  const mo=+m[2]; if(mo<1||mo>12) return null;
  const y=m[1].length===2?2000+ +m[1]:+m[1];
  return {y,m:mo};
}

/* ── Die Kopfzeile finden ─────────────────────────────────────
   Sie ist die erste Zeile, in der alle zwölf Monatsnamen der
   Reihe nach stehen. Davor dürfen beliebig viele Zeilen stehen. */
function sheetMonthCols(cells){
  const col=Array(12).fill(-1);
  cells.forEach((c,i)=>{ const m=SHEET_MONTHS[sheetKey(c)]; if(m&&col[m-1]<0) col[m-1]=i; });
  if(col.some(i=>i<0)) return null;
  for(let i=1;i<12;i++) if(col[i]<=col[i-1]) return null;
  return col;
}

function parseFinaSheet(text){
  const lines=String(text).replace(/^﻿/,'').split(/\r?\n/);
  /* Semikolon oder Komma — genommen wird, was häufiger vorkommt.
     Eine deutsche Tabellenkalkulation trennt mit Semikolon, der
     Export aus Google Sheets mit Komma. */
  const head=lines.slice(0,40).join('\n');
  const sep=(head.split(';').length>head.split(',').length)?';':',';

  const rows=lines.map(l=>splitCsvLine(l,sep));
  let hIdx=-1,mCol=null;
  for(let i=0;i<rows.length;i++){ const c=sheetMonthCols(rows[i]); if(c){ hIdx=i; mCol=c; break; } }
  if(hIdx<0) throw new Error(t('sheet.noMonths'));

  const H=rows[hIdx];
  const label=i=>sheetKey(H[i]);

  /* Die Spalte mit den Bezeichnungen trägt in der Kopfzeile das
     Jahr der Tabelle — daran ist sie zu erkennen, und daher weiß
     FINA auch, für welches Jahr die Zahlen gelten. Fehlt das Jahr,
     wird die letzte beschriftete Spalte vor den Monaten genommen;
     die Summenspalte („Gesamt“) zählt dabei nicht, sie steht
     dazwischen. */
  let labCol=-1,year=null;
  for(let i=0;i<mCol[0];i++){
    const m=label(i).match(/^(19|20)\d{2}$/);
    if(m){ labCol=i; year=+label(i); }
  }
  if(labCol<0){
    for(let i=0;i<mCol[0];i++) if(label(i)&&!/^(gesamt|summe|total|sum)$/.test(label(i))) labCol=i;
  }
  if(labCol<0) labCol=Math.max(0,mCol[0]-2);

  /* Die Kürzelspalten. Sie stehen links der Bezeichnung und
     heißen in der Tabelle wie in der Jahresmatrix von FINA:
     B · Z (PT) · T (DD) · Deadline (LP). „P“ — wie viele Zahlungen
     im Jahr — hat in FINA kein Gegenstück: die zwölf Monats-
     beträge sagen dasselbe genauer. Gelesen wird die Spalte
     trotzdem, denn sie verrät, dass eine Zeile eine Position ist
     und keine Überschrift. */
  const find=re=>{ for(let i=0;i<labCol;i++) if(re.test(label(i))) return i; return -1; };
  const cEnd=find(/^(deadline|frist|lp|last ?payment|laufzeit)$/),
        cBank=find(/^(b|bank)$/),
        cPay=find(/^(z|pt|zahlungsart|payment ?type)$/),
        cDue=find(/^(t|dd|due|due ?date|fällig|faellig|zahltag)$/),
        cFreq=find(/^(p|periode|rhythmus|freq)$/);

  /* Hinter jeder Monatsspalte steht eine schmale Spalte ohne
     Überschrift. In den Summenzeilen trägt sie ein „/“ — daran
     werden die Blöcke erkannt. */
  const kCol=mCol.map((c,i)=>{
    const nxt=c+1;
    if(i<11&&nxt>=mCol[i+1]) return -1;
    return label(nxt)?-1:nxt;
  });

  const cell=(r,i)=>(i>=0&&i<r.length)?String(r[i]||'').trim():'';
  const out=[];
  for(let i=hIdx+1;i<rows.length;i++){
    const r=rows[i];
    const vals=mCol.map(c=>parseGermanNumber(cell(r,c)));
    const marks=kCol.map(c=>cell(r,c));
    const name=cell(r,labCol);
    if(!name&&vals.every(v=>v===0)){ out.push({blank:true}); continue; }
    const bank=sheetCode(cell(r,cBank)), pay=sheetCode(cell(r,cPay)),
          due=sheetCode(cell(r,cDue)), freq=sheetCode(cell(r,cFreq));
    const dl=cell(r,cEnd), end=sheetEnd(dl);
    out.push({blank:false,name,vals,
      block:marks.some(x=>x==='/'),
      /* Ein Kürzel macht aus einer Zeile eine Position: eine
         Überschrift hat keine Bank und keine Fälligkeit. */
      meta:!!(bank||pay||due||freq),
      bank,pay,due,end,
      /* Was in der Deadline-Spalte steht und kein Monat ist, geht
         nicht verloren: es steht danach in der Notiz. */
      endNote:end?'':sheetCode(dl)});
  }

  return sheetTree(out,year);
}

/* ── Aus Zeilen wird eine Gliederung ──────────────────────────
   Blockzeile, darunter Kategorien, darunter Positionen. Erkannt
   wird eine Kategorie daran, dass sie ihre Kinder zusammenzählt —
   siehe claim(). Zwei Ebenen sind es höchstens: was unter einer
   Kategorie noch einmal gliedert, wird zu einer Kategorie
   daneben. Mehr braucht FINA nicht, und die Zahlen bleiben
   dieselben. */
function sheetTree(rows,year){
  const blocks=[];
  let cur=null;
  rows.forEach(r=>{
    if(r.blank){ if(cur) cur.rows.push(r); return; }
    if(r.block){ cur={name:r.name,vals:r.vals,rows:[],cats:[],kind:null}; blocks.push(cur); return; }
    if(cur) cur.rows.push(r);
  });

  blocks.forEach(b=>{
    const rs=b.rows;
    const used=Array(rs.length).fill(false);

    /* Zählt eine mögliche Überschrift ihre Nachbarn zusammen?
       Genommen wird die **kürzeste** Folge, die passt: sie endet
       genau dort, wo die Überschrift aufgeht. */
    const claim=at=>{
      const want=rs[at].vals.map(sheetCents);
      const run=Array(12).fill(0);
      for(let j=at+1;j<rs.length;j++){
        if(rs[j].blank||rs[j].block) break;
        rs[j].vals.forEach((v,k)=>{ run[k]+=sheetCents(v); });
        if(run.every((v,k)=>v===want[k])) return j;
      }
      return -1;
    };

    /* Der Rückfall, wenn die Summe nicht aufgeht — etwa weil in
       der Tabelle eine Zeile von Hand überschrieben wurde: eine
       Zeile ohne Kürzel, die nach einer Leerzeile anfängt, ist
       eine Überschrift, und alles bis zur nächsten Leerzeile
       gehört zu ihr. Erkennbar bleibt der Fall im Fenster: die
       Blocksumme stimmt dann nicht mit dem überein, was FINA
       gelesen hat. */
    const untilBlank=at=>{
      let j=at;
      while(j+1<rs.length&&!rs[j+1].blank&&!rs[j+1].block) j++;
      return j>at?j:-1;
    };

    let afterBlank=true;
    rs.forEach((r,i)=>{
      if(r.blank){ afterBlank=true; return; }
      const startsGroup=afterBlank; afterBlank=false;
      if(used[i]) return;
      if(r.meta||!r.name) return;                 /* eine Position */
      let to=claim(i);
      if(to<0&&startsGroup) to=untilBlank(i);
      if(to<0) return;                            /* doch eine Position */
      const items=[];
      for(let j=i+1;j<=to;j++){ used[j]=true; if(!rs[j].blank) items.push(rs[j]); }
      used[i]=true;
      b.cats.push({name:r.name,vals:r.vals,items});
    });

    /* Was keiner Kategorie zugefallen ist, steht unmittelbar unter
       dem Block. Es bekommt eine Kategorie mit dem Namen des
       Blocks — ohne Kategorie hätte die Position in FINA keinen
       Platz. */
    const loose=rs.filter((r,i)=>!r.blank&&!used[i]);
    if(loose.length) b.cats.push({name:b.name,vals:null,items:loose,loose:true});

    /* Was FINA gelesen hat, gegen das, was in der Blockzeile
       steht. Beides gehört ins Fenster: stimmt es überein, ist
       die Gliederung sicher erkannt. */
    b.sum=Array(12).fill(0);
    b.cats.forEach(c=>c.items.forEach(it=>it.vals.forEach((v,k)=>{ b.sum[k]+=v; })));
    b.sum=b.sum.map(v=>Math.round(v*100)/100);
    b.ok=b.sum.every((v,k)=>sheetCents(v)===sheetCents(b.vals[k]));
    b.count=b.cats.reduce((n,c)=>n+c.items.length,0);
  });

  /* ── Welcher Block ist was? ─────────────────────────────────
     Die Zeile, die alle anderen zusammenzählt, ist die
     Gesamtsumme: sie wird nicht importiert, ihre Zahlen stehen
     schon in den anderen. Der Rest wird am Namen erraten und,
     wo der nichts hergibt, an der Reihenfolge — geändert wird
     die Zuordnung im Fenster. */
  const many=blocks.filter(b=>b.count>0);
  blocks.forEach(b=>{
    if(b.count) return;
    const rest=many.map(o=>o.vals);
    if(!rest.length) return;
    const s=Array(12).fill(0);
    rest.forEach(v=>v.forEach((x,k)=>{ s[k]+=x; }));
    if(s.every((v,k)=>sheetCents(v)===sheetCents(b.vals[k]))) b.kind='';
  });
  const guess=n=>{
    const s=String(n||'').toLowerCase();
    if(/einnahm|income|revenue|verdien|gehalt|earning/.test(s)) return 'in';
    if(/flex|kakeibo|variabel|alltag|daily|haushalt/.test(s)) return 'flex';
    if(/kosten|cost|ausgab|expense|regelmäßig|regelmaessig|regular|fix/.test(s)) return 'out';
    return null;
  };
  const open=['in','flex','out'];
  blocks.forEach(b=>{ if(b.kind===null&&b.count){ const g=guess(b.name);
    if(g&&open.includes(g)){ b.kind=g; open.splice(open.indexOf(g),1); } } });
  blocks.forEach(b=>{ if(b.kind===null) b.kind=b.count?(open.shift()||''):''; });

  return {year,blocks};
}

/* ── Was der Import anlegen würde ─────────────────────────────
   Reine Vorschau für das Fenster: dieselbe Rechnung wie
   applySheet(), nur ohne zu schreiben. */
function scanSheet(sheet){
  const of=k=>sheet.blocks.filter(b=>b.kind===k);
  const cats=k=>of(k).flatMap(b=>b.cats);
  const flexCats=cats('flex').flatMap(c=>c.items.length?c.items:[c]);
  const items=[...cats('in'),...cats('out')].flatMap(c=>c.items);
  const codes=(f)=>[...new Set(items.map(f).filter(Boolean))];
  return {
    groups:cats('out').map(c=>c.name),
    incomeGroups:cats('in').map(c=>c.name),
    kakCats:flexCats.map(c=>c.name),
    items:items.length,
    banks:codes(i=>i.bank).filter(c=>!(state.banks||[]).some(x=>x.code===c)),
    pays:codes(i=>i.pay).filter(c=>!(state.pays||[]).some(x=>x.code===c))
  };
}

/* ── Übernehmen ───────────────────────────────────────────────
   Eine FINA-Tabelle ist ein ganzes Buch, kein Nachtrag: sie bringt
   Kategorien, Positionen und Flexible Payments für alle zwölf
   Monate mit. Deshalb wird **ersetzt** und nicht ergänzt — sonst
   stünde nach dem zweiten Import alles doppelt da, und niemand
   sähe, welche Zeile die neue ist. Das Fenster sagt das vorher
   und zeigt, was dabei verschwindet.

   Unangetastet bleiben die Dinge, die nicht in der Tabelle
   stehen: die Saldokorrektur, der Anfangsbestand, die Sprache und
   alles unter „Darstellung“.

   opt.year   — das Abrechnungsjahr auf das der Tabelle setzen
   opt.tick   — abgeschlossene Monate gleich abhaken */
function applySheet(sheet,opt){
  opt=opt||{};
  if(opt.year&&sheet.year) state.year=sheet.year;
  /* Erst nach dem Jahr fragen: „abgeschlossen“ heißt in einem
     vergangenen Jahr alle zwölf Monate, im laufenden nur die
     Monate vor diesem. */
  const last=opt.tick?completedMonths():0;
  const done=(v,i)=>v!==0&&i+1<=last;

  const of=k=>sheet.blocks.filter(b=>b.kind===k);
  const cats=k=>of(k).flatMap(b=>b.cats);

  state.fixed=[];
  /* Die Saldokorrektur gehört dem Buch, nicht dem Nutzer: sie sagt,
     was in **diesen** zwölf Monaten an Ungenauigkeit aufgelaufen
     ist. Bliebe sie stehen, trüge das eingelesene Jahr die
     Korrekturen eines anderen — und zwar unsichtbar, denn sie steht
     in einer einzigen Zeile über den Einnahmen. Der Anfangsbestand
     bleibt dagegen: er ist eine Einstellung, steht an einer Stelle
     und ist dort in einem Griff geändert. */
  state.balance=blankBalance();
  state.groups=[]; state.incomeGroups=[];
  state.kakCats=[]; state.kak={}; state.plan={};
  /* Die importierten Buchungen zeigen auf Kategorien, die es
     gleich nicht mehr gibt — und ein Monat mit Quelle überstimmt
     in kakVal() jeden Planwert. Beides muss weg, sonst stünde in
     der Ansicht etwas anderes als in der Tabelle. */
  state.tx=[];
  for(let m=1;m<=12;m++){ state.flexActual[m]={}; state.flexSource[m]=null; }

  /* Ein Kürzel, das die Liste nicht kennt, trüge im Posten-Fenster
     ein Fragezeichen. Neue Kürzel kommen deshalb in die Liste —
     als Bezeichnung zunächst das Kürzel selbst, ausschreiben kann
     der Nutzer sie in den Einstellungen. */
  const banks=(state.banks||[]).slice(), pays=(state.pays||[]).slice();
  const added={banks:0,pays:0};
  const addCode=(arr,code,what)=>{
    if(!code||arr.some(x=>x.code===code)) return;
    arr.push({code,label:code}); added[what]++;
  };

  const mkItem=(r,group)=>{
    const it=normalize({id:uid(),name:r.name,group,amounts:r.vals.slice()});
    it.bank=r.bank; it.pay=r.pay; it.dueDay=r.due; it.end=r.end;
    /* Die Beträge stehen so in der Tabelle, wie sie geflossen
       sind — geschätzt ist daran nichts. */
    it.estimated=false;
    if(r.endNote) it.note=t('sheet.noteEnd',r.endNote);
    it.paid=it.amounts.map(done);
    addCode(banks,r.bank,'banks'); addCode(pays,r.pay,'pays');
    state.fixed.push(it);
    return it;
  };

  /* Ein Kategoriename darf über **beide** Listen zusammen nur
     einmal vorkommen: isIncome() entscheidet allein am Namen, ob
     ein Posten Geld bringt oder kostet (siehe js/calc.js). Zwei
     Überschriften desselben Namens werden deshalb
     auseinandergehalten und nicht zusammengelegt — zusammengelegt
     stimmte danach keine der beiden Summen mehr mit der Tabelle
     überein. */
  const taken=new Set();
  const fill=(k,list)=>cats(k).forEach(c=>{
    let name=c.name,n=2;
    while(taken.has(name)) name=`${c.name} (${n++})`;
    taken.add(name); list.push(name);
    c.items.forEach(r=>mkItem(r,name));
  });
  fill('in',state.incomeGroups);
  fill('out',state.groups);

  /* Die Flexible Payments kennen in FINA nur **eine** Ebene. Die
     Tabelle gliedert sie zweistufig — „KAKEIBO“ über „D-AILY“ —,
     deshalb werden die untersten Zeilen zu den Kategorien: dort
     stehen die Zahlen, die man vergleicht. Eine Kategorie ohne
     Zeilen darunter ist selbst die unterste. */
  cats('flex').forEach(c=>{
    (c.items.length?c.items:[c]).forEach(r=>{
      /* Zwei Zeilen dürfen gleich heißen, zwei Kategorien nicht:
         der Name ist hier der Schlüssel (Regel 2). Kommt er
         zweimal vor, tritt die Überschrift dazu, unter der die
         Zeile stand — sie ist der Unterschied. */
      const base=r.name||c.name;
      let name=base;
      if(state.kak[name]&&c.name!==base) name=`${base} (${c.name})`;
      let n=2; while(state.kak[name]) name=`${base} (${n++})`;
      const e=blankKak(0);
      e.plan=r.vals.slice();
      /* Was in der Tabelle steht, ist geschehen und keine
         Annahme: damit gilt der Monat als erfasst (kakDone in
         js/calc.js) und die Prognose rechnet ihren Durchschnitt
         daraus. */
      e.estimated=false;
      e.paid=e.plan.map(done);
      state.kakCats.push(name); state.kak[name]=e;
    });
  });
  state.kakCats.forEach(ensureKakCat);

  state.banks=banks; state.pays=pays;
  /* Ohne Einnahme-Kategorie gäbe es keine Einnahmen mehr — dann
     kehrt die Vorgabe zurück (siehe js/state.js). */
  if(!state.incomeGroups.length) state.incomeGroups=['EINNAHMEN'];
  state.lastImport=new Date().toLocaleString('de-DE');
  save();

  return {items:state.fixed.length,groups:state.groups.length,
    incomeGroups:state.incomeGroups.length,kakCats:state.kakCats.length,
    banks:added.banks,pays:added.pays,ticked:last};
}
