/* ══════════════════════════════════════════════════════════════
   FINA — der generische CSV-Import (Wizard im Popup).

   Drei Schritte: 1 Datei & Art (kleines Fenster) · 2 Spalten &
   Felder (das Fenster streckt sich fast auf die ganze Fläche) ·
   3 Zuordnen (oben die Jahrestabelle aus dem Buch, unten die CSV
   mit Filtern). „Anwenden“ schreibt ins offene Buch: reguläre
   Posten bekommen ihre Monatsbeträge und das blaue Import-Siegel,
   flexible Kosten laufen wie der Fast-Budget-Import in tx,
   flexActual und flexSource. Die Zuordnung wird je Datei-Art in
   state.csvMaps gemerkt (Fingerabdruck der Spaltenköpfe) — beim
   nächsten Hochladen läuft sie von selbst.

   Entstanden aus dem Prototyp in _BusinessCenter/FRAMEWORK CSV
   Import; die Regeln von dort gelten weiter: Regeln laufen in
   ihrer Reihenfolge, die erste, die trifft, bekommt die Zeile,
   und eine vergebene (gelbe) Zeile nimmt keiner mehr.
   ══════════════════════════════════════════════════════════════ */

/* ── Die Datei lesen — verlässt sich auf nichts ─────────────── */

/* Bytes → Text: erst UTF-8 im strengen Modus, sonst ist es ein
   alter Windows-Export (ISO-8859/CP1252, Sparkassen-Auszug). */
function c2Decode(buf){
  const b=new Uint8Array(buf);
  if(b[0]===0xEF&&b[1]===0xBB&&b[2]===0xBF)
    return {text:new TextDecoder('utf-8').decode(b.subarray(3)),enc:'UTF-8'};
  try{ return {text:new TextDecoder('utf-8',{fatal:true}).decode(b),enc:'UTF-8'}; }
  catch(e){ return {text:new TextDecoder('windows-1252').decode(b),enc:'Windows'}; }
}

/* Trennzeichen raten: was in den ersten Zeilen am verlässlichsten
   außerhalb von Anführungszeichen steht. */
function c2Sep(text){
  const head=text.slice(0,6000).split(/\r?\n/).filter(l=>l.trim()!=='').slice(0,8);
  let best=';',bestScore=-1;
  for(const sep of [';',',','\t','|']){
    let lines=0,total=0;
    for(const line of head){
      let q=false,c=0;
      for(const ch of line){
        if(ch==='"')q=!q;
        else if(ch===sep&&!q)c++;
      }
      if(c>0)lines++;
      total+=c;
    }
    const score=lines*1000+total;
    if(score>bestScore){bestScore=score;best=sep;}
  }
  return best;
}

/* Der ganze Text in Datensätze — Anführungszeichen zählen, auch
   Zeilenumbrüche innerhalb eines Feldes gehen nicht verloren. */
function c2Records(text,sep){
  const recs=[];let row=[],cur='',q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(q){
      if(c==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else q=false; }
      else cur+=c;
    }else if(c==='"'){ q=true; }
    else if(c===sep){ row.push(cur);cur=''; }
    else if(c==='\n'||c==='\r'){
      if(c==='\r'&&text[i+1]==='\n')i++;
      row.push(cur);cur='';
      if(row.length>1||row[0].trim()!=='')recs.push(row);
      row=[];
    }
    else cur+=c;
  }
  row.push(cur);
  if(row.length>1||row[0].trim()!=='')recs.push(row);
  return recs.map(r=>r.map(s=>s.trim()));
}

/* Die Kopfzeile ist unter den ersten zehn Datensätzen der mit den
   meisten gefüllten Zellen: Metazeilen davor haben weniger, und
   Datenzeilen lassen Spalten leer. */
function c2FindHeader(recs){
  let best=0,bestN=-1;
  for(let i=0;i<Math.min(10,recs.length);i++){
    const n=recs[i].filter(c=>c!=='').length;
    if(n>bestN){bestN=n;best=i;}
  }
  return best;
}

/* Der Fingerabdruck der Spaltenköpfe — der Schlüssel, unter dem
   die Zuordnung im Buch gemerkt wird. */
function c2Fp(header){
  const s=header.join('¦');
  let h=5381;
  for(let i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;
  return 'h'+h.toString(36)+'_'+header.length;
}

/* Welche Zeile die Beschriftungen trägt, entscheidet alles Weitere:
   die Namen der Spalten, die Datenzeilen darunter und der
   Fingerabdruck, unter dem die Zuordnung gemerkt wird. Geraten wird
   sie beim Einlesen (c2FindHeader) — **gewählt** wird sie in
   Schritt 2, und dann läuft dieselbe Rechnung noch einmal. Alle
   Datensätze bleiben dafür in `recs` liegen, auch die vor der
   Kopfzeile: sonst gäbe es nichts mehr zu wählen.

   Der Platzhalter für eine leere Kopfzelle bleibt bewusst deutsch
   und unübersetzt: er geht in den Fingerabdruck ein, und der darf
   nicht mit der Sprache wechseln. */
function c2UseHeader(csv,hIdx){
  csv.hIdx=Math.max(0,Math.min(csv.recs.length-1,hIdx));
  csv.header=csv.recs[csv.hIdx].map((h,i)=>h!==''?h:('Spalte '+(i+1)));
  csv.rows=csv.recs.slice(csv.hIdx+1).map(r=>{
    const o=r.slice(0,csv.header.length);
    while(o.length<csv.header.length)o.push('');
    return o;
  });
  csv.fp=c2Fp(csv.header);
  return csv;
}

function c2Parse(buf,name){
  const dec=c2Decode(buf);
  const sep=c2Sep(dec.text);
  const recs=c2Records(dec.text,sep);
  if(recs.length<2)throw new Error('rows');
  const csv=c2UseHeader({name:name,enc:dec.enc,sep:sep,recs:recs},c2FindHeader(recs));
  if(!csv.rows.length)throw new Error('rows');
  return csv;
}

/* Betrag lesen — deutsches und englisches Format, Währungszeichen,
   nachgestelltes Minus. parseGermanNumber reicht hier nicht: der
   Kontoauszug schreibt „-73,25“, mancher Export „12.34-“. */
function c2Amount(s){
  if(s==null)return NaN;
  let x=String(s).replace(/[€$£\s]/g,'').replace(/EUR|USD|CHF|GBP/gi,'');
  if(!x||!/\d/.test(x))return NaN;
  let neg=false;
  if(/-$/.test(x)){neg=true;x=x.slice(0,-1);}
  if(x[0]==='-'){neg=true;x=x.slice(1);}
  if(x[0]==='+')x=x.slice(1);
  if(/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(x))      x=x.replace(/\./g,'').replace(',','.');
  else if(/^\d{1,3}(,\d{3})*(\.\d+)?$/.test(x)) x=x.replace(/,/g,'');
  else                                          x=x.replace(',','.');
  const v=parseFloat(x);
  return isNaN(v)?NaN:(neg?-v:v);
}

/* Datum lesen: 24.08.26 · 24.08.2026 · 2026-08-24 · 8/24/2026;
   zweistellige Jahre heißen 20xx. */
function c2Date(s){
  if(!s)return null;
  const t2=String(s).trim();
  let m=t2.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/);
  if(m)return c2DOk(+m[3]<100?2000+ +m[3]:+m[3],+m[2],+m[1]);
  m=t2.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if(m)return c2DOk(+m[1],+m[2],+m[3]);
  m=t2.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if(m)return c2DOk(+m[3]<100?2000+ +m[3]:+m[3],+m[1],+m[2]);
  return null;
}
function c2DOk(y,m,d){return(m>=1&&m<=12&&d>=1&&d<=31)?{y:y,m:m,d:d}:null;}

/* Der Klapp-Pfeil ist **ein** Zeichen, das sich dreht — kein Paar
   aus ▸ und ▾. Zwei Schriftzeichen haben verschiedene Breiten und
   Höhen, und die Zeile sprang beim Auf- und Zuklappen. Ein Dreieck
   als SVG behält seine Maße; offen liegt es um 90° gedreht. */
const C2_TRI='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 1.5l5.5 4.5L4 10.5z"/></svg>';
/* Die Breite der Markierspalte im dritten Schritt — sie steht hier
   und nicht im Stylesheet, weil die CSV-Tabelle ihre Gesamtbreite
   selbst ausrechnet (Summe der Spaltenbreiten aus Schritt 2). */
const C2_PICKW=30;

/* ── Die sechs Importfelder (5.9.26) ──────────────────────────
   **Datum, Betrag, Referenz 1 bis 4 — und sonst nichts**, für
   reguläre wie für flexible Posten dieselben. Bis dahin trug der
   reguläre Import „Beschreibung" und der flexible „Hauptkategorie ·
   Unterkategorie · Beschreibung", und die beiden Arten liefen
   verschieden: die flexible bildete ihre Ziele an der
   Hauptkategorie-Spalte von selbst. Jetzt gilt für beide dasselbe:
   **zugeordnet wird allein über Filterkriterien**, und die Felder
   sind die Grundlage dafür — ein Kriterium sagt „Referenz 1 enthält
   Miete", nie „Spalte 4 enthält Miete". Deshalb kommen aus Schritt 2
   **nur die verknüpften Spalten** nach Schritt 3 (c2GoStep3): eine
   Spalte ohne Feld hätte dort keinen Namen, auf den sich ein
   Kriterium beziehen könnte.

   Daraus folgt die Trennung in der Datei (Struktur v260905-3):
   * **Die CSV-Struktur** (state.csvMaps, je Datei-Art) merkt sich
     allein, welche Spalte welches Feld trägt — nichts sonst. Sie
     gilt für reguläre wie für flexible Importe; die Art wählt man
     jedes Mal in Schritt 1.
   * **Die Importkriterien** wohnen **am Posten** (it.impRules) und
     **an der flexiblen Kategorie** (state.kak[k].impRules), als
     Regeln aus Bedingungen über die sechs Felder. Sie hängen an
     keiner Datei-Art: eine zweite Bank liefert dieselben Felder,
     und dieselben Regeln greifen — sofern die Felder verknüpft sind.
     Die Fenster der beiden zeigen sie als Block „Importkriterien".

   **Die Referenzen sind eine Rangfolge**, wie Überschrift 1 · 2 · 3 ·
   4: Referenz 1 ist die oberste Angabe zu einer Zeile, die weiteren
   stehen darunter. Ins Buch wandern sie an den Quellzeilen eines
   Posten (it.impRows[m][].r) und an den Buchungen der flexiblen
   Kosten (tx[].r), als Liste in dieser Reihenfolge — leere Enden
   werden abgeschnitten, eine Lücke in der Mitte bleibt (Referenz 2
   muss Referenz 2 bleiben). Gezeigt werden sie in der
   Importdaten-Liste der beiden Fenster (impSideRows in js/ui.js),
   je Referenz eine Zeile; im Reiter „Import Details" steht Referenz
   1 an der Stelle der früheren Unterkategorie (txSub/txNote in
   js/calc.js). Ältere Zuordnungen mit main/cat/desc und mit Regeln
   je Datei-Art übersetzt migrate() (js/state.js). */
const C2_REFS=['ref1','ref2','ref3','ref4'];
const C2_FIELDS=['date','amount'].concat(C2_REFS);
function c2BlankF(){const f={date:-1,amount:-1};C2_REFS.forEach(k=>{f[k]=-1;});return f;}
function c2Refs(row){
  const r=C2_REFS.map(f=>W.f[f]>=0?String(row[W.f[f]]==null?'':row[W.f[f]]).trim().slice(0,160):'');
  while(r.length&&!r[r.length-1])r.pop();
  return r;
}
/* Der Name eines Feldes, wie er dem Nutzer begegnet — in den
   Filterzeilen, im Kopf der CSV-Tabelle, in den Kriterien-Fenstern
   und in den Einstellungen. 'q' ist der Schnellfilter über alle
   Felder; er wird nie gemerkt. */
function c2FieldLabel(f){
  if(f==='date')return t('c2.fDate');
  if(f==='amount')return t('c2.fAmount');
  if(f==='q')return t('c2.allCols');
  const n=C2_REFS.indexOf(f);
  return n>=0?t('c2.fRef',n+1):String(f);
}
/* Welches Feld eine Spalte der offenen Datei trägt — oder nichts. */
function c2FieldOf(ci){return C2_FIELDS.find(f=>W.f[f]===ci)||null;}
/* Der Posten oder die flexible Kategorie hinter einem Ziel — dort
   wohnen seine Importkriterien. Ein Ziel, das erst mit „Fertig"
   entsteht („n:…"), hat noch keinen. */
function c2Host(tid){
  tid=String(tid||'');
  if(tid.indexOf('i:')===0)return state.fixed.find(x=>String(x.id)===tid.slice(2))||null;
  if(tid.indexOf('k:')===0)return (state.kak&&state.kak[tid.slice(2)])||null;
  return null;
}
/* Eine Bedingung, wie sie in der Datei steht: Feld, Vergleichsart,
   Wert — bereinigt. Ohne Feld oder ohne Wert ist es keine. */
function c2CleanTerms(terms){
  return (terms||[]).map(tm=>({f:String(tm.f||''),op:tm.op||'has',val:String(tm.val==null?'':tm.val).trim()}))
    .filter(tm=>C2_FIELDS.includes(tm.f)&&tm.val!=='');
}

/* ── Die Anleitung neben dem Wizard (5.9.26) ───────────────────
   Der Knopf „Anleitung" ganz links in der Knopfzeile teilt das
   Fenster: drei Viertel bleiben der Schritt, das rechte Viertel
   erklärt ihn — grob, in einfacher Sprache, wie der Guide der
   Anwendung (js/dialogs/guide.js). Die Texte stehen hier und nicht
   in js/i18n.js, nach demselben Vorbild: es sind Absätze, keine
   Beschriftungen. Gewählt wird die Sprache der Oberfläche. Wer
   einen Absatz ergänzt, schreibt ihn in beiden Sprachen und im Ton
   der Anleitung: kurze Sätze, ein Gedanke je Absatz. */
const C2_GUIDE={
  2:{
    en:`<h4>Layout</h4>
      <p>This window shows your file as a table: the first rows, with the column names on top. Above the table stand three numbered steps and two buttons that select or deselect all columns. Every column name is a button. A chosen column gets a selection list for its FINA field above it. On the left, the column HDR marks the row that holds the column names.</p>
      <h4>What you do here</h4>
      <p>You tell FINA which column holds which FINA field. There are six fields: Date, Amount and Reference 1 to 4. Date and Amount are required.</p>
      <p>The references are a ranking, like heading 1 to 4: Reference 1 is the main note about a row, the others are details beneath it.</p>
      <h4>Step by step</h4>
      <ol>
        <li>Check the row with the column names. In the column HDR on the left, the filled circle marks it. Usually the first row is right; click another circle to change it.</li>
        <li>Click a column header to select the column. It turns orange, and a field list appears above it.</li>
        <li>In that list, choose the field: Date, Amount or a reference. FINA suggests a field when it recognises the header.</li>
        <li>Repeat for every column you need. A column without a field is dropped on the way to step 3.</li>
      </ol>
      <h4>Then</h4>
      <p>Click “Save columns and continue”. FINA asks for a name and remembers the structure for this kind of file. Next time you upload such a file, “Prepare CSV structure automatically” fills this step in for you. You check it and click “Continue”.</p>
      <h4>Good to know</h4>
      <ul>
        <li>The structure is only about columns and fields. Which rows go to which entry is decided in step 3.</li>
        <li>Costs with a minus are recognised on their own.</li>
        <li>The ✕ at the top closes the wizard. Nothing is written to your book before the last step.</li>
      </ul>`,
    de:`<h4>Layout</h4>
      <p>Dieses Fenster zeigt deine Datei als Tabelle: die ersten Zeilen, oben die Spaltennamen. Über der Tabelle stehen drei nummerierte Schritte und zwei Knöpfe, die alle Spalten wählen oder abwählen. Jeder Spaltenname ist ein Knopf. Eine gewählte Spalte bekommt darüber eine Auswahlliste für ihr FINA-Feld. Links markiert die Spalte BZ die Zeile mit den Spaltennamen.</p>
      <h4>Was du hier tust</h4>
      <p>Du sagst FINA, welche Spalte welches FINA-Feld trägt. Es gibt sechs Felder: Datum, Betrag und Referenz 1 bis 4. Datum und Betrag müssen sein.</p>
      <p>Die Referenzen sind eine Rangfolge wie Überschrift 1 bis 4: Referenz 1 ist die wichtigste Angabe zu einer Zeile, die anderen stehen darunter.</p>
      <h4>Schritt für Schritt</h4>
      <ol>
        <li>Prüfe die Zeile mit den Spaltennamen. In der Spalte BZ links markiert sie der gefüllte Kreis. Meist ist die erste Zeile richtig; ein Klick auf einen anderen Kreis ändert es.</li>
        <li>Klicke auf eine Spaltenüberschrift, um die Spalte zu wählen. Sie wird orange, und darüber erscheint eine Feldliste.</li>
        <li>Wähle in dieser Liste das Feld: Datum, Betrag oder eine Referenz. FINA schlägt ein Feld vor, wenn es die Überschrift erkennt.</li>
        <li>Wiederhole das für jede Spalte, die du brauchst. Eine Spalte ohne Feld fällt auf dem Weg zu Schritt 3 weg.</li>
      </ol>
      <h4>Danach</h4>
      <p>Klicke auf „Spalten speichern und weiter“. FINA fragt nach einem Namen und merkt sich die Struktur für diese Art von Datei. Beim nächsten Mal füllt „Automatisch CSV-Datenstruktur vorbereiten“ diesen Schritt für dich aus. Du prüfst ihn und klickst auf „Weiter“.</p>
      <h4>Gut zu wissen</h4>
      <ul>
        <li>Die Struktur betrifft nur Spalten und Felder. Welche Zeilen zu welchem Posten gehören, entscheidest du in Schritt 3.</li>
        <li>Kosten mit Minus erkennt FINA von selbst.</li>
        <li>Das ✕ oben schließt den Wizard. Ins Buch geschrieben wird erst im letzten Schritt.</li>
      </ul>`},
  3:{
    en:`<h4>Layout</h4>
      <p>The window has three areas, one above the other:</p>
      <ul>
        <li><b>Entries</b> (top): the entries of your book with their twelve months — income and regular costs, or the flexible categories. The entry you click becomes the target and turns orange.</li>
        <li><b>Assignment bar</b> (middle): the buttons that assign rows. From the left: the ☰ menu, “One-time assignment mode”, “Assign and remember”, “Create new and assign”. On the right, if entries carry import criteria: “Apply remembered criteria…”.</li>
        <li><b>File rows</b> (bottom): the rows of your CSV file, one column per FINA field. Above the columns: a filter field per column, and above the table the quick filter across all fields.</li>
      </ul>
      <p>The grey bar between the areas can be dragged to change their heights.</p>
      <h4>What you do here</h4>
      <p>You tell FINA which rows of the file belong to which entry. There are two ways: with criteria, which FINA stores at the entry for the next import — or by hand, once.</p>
      <h4>Assign with criteria</h4>
      <ol>
        <li>In Entries, click the entry that should receive the rows.</li>
        <li>In File rows, narrow the rows down: type into a column filter, a fragment is enough. Or click a value in a row — it goes straight into the filter of its column.</li>
        <li>Press Enter to pin the criterion. The ☰ at the filter field sets how it compares: contains, starts with, exactly, and so on. Several criteria narrow down together.</li>
        <li>In the Assignment bar, click “Assign and remember”. The rows move to the entry, and the criteria are stored at the entry as its import criteria.</li>
      </ol>
      <p>Assigned rows leave File rows. To see them, open the entry with the small arrow, or double-click its row.</p>
      <h4>Assign by hand, once</h4>
      <p>Some rows fit no criterion — a one-off payment, a refund. You assign those by hand. Nothing is stored for the next import.</p>
      <ol>
        <li>In the Assignment bar, click “One-time assignment mode”. The button stays dark while the mode is on, and a tick column appears in File rows.</li>
        <li>Tick the rows. A click anywhere on a row ticks it. The quick filter still narrows the list; the column filters are off in this mode.</li>
        <li>In Entries, click the target.</li>
        <li>Click “Assign once”. A window lists the rows — confirm.</li>
        <li>Click “One-time assignment mode” again to end the mode.</li>
      </ol>
      <h4>Remembered criteria</h4>
      <p>Entries keep the import criteria from earlier imports. “Apply remembered criteria…” on the right of the Assignment bar shows which entries would receive rows now; you choose which ones. The ☰ at a single entry offers the same for that entry, plus “Search by amount”.</p>
      <h4>The ☰ menu in the Assignment bar</h4>
      <ul>
        <li>“Cancel filter and show all unassigned CSV data” clears every filter.</li>
        <li>“Show all remembered import criteria” lists the criteria of every entry; you can change them there.</li>
      </ul>
      <h4>Colours</h4>
      <ul>
        <li>Orange: the chosen target.</li>
        <li>Yellow: assigned in this run, not yet in the book.</li>
        <li>Blue: imported earlier, already in the book.</li>
        <li>Grey: already in the book with the same amount — this import changes nothing there.</li>
      </ul>
      <h4>Finishing</h4>
      <p>“Finish” writes everything that is assigned into your book and stores the criteria. “Reset import and close” throws the current work away. Save your file afterwards.</p>`,
    de:`<h4>Layout</h4>
      <p>Das Fenster hat drei Bereiche, untereinander:</p>
      <ul>
        <li><b>Posten</b> (oben): die Posten deines Buches mit ihren zwölf Monaten — Einnahmen und regelmäßige Kosten, oder die flexiblen Kategorien. Der Posten, den du anklickst, wird zum Ziel und ist orange.</li>
        <li><b>Zuordnungsleiste</b> (Mitte): die Knöpfe, die Zeilen zuordnen. Von links: das ☰-Menü, „Modus: Einmalige Zuordnung“, „Zuordnen und merken“, „Neu anlegen und zuordnen“. Rechts, wenn Posten Importkriterien tragen: „Gemerkte Importkriterien anwenden…“.</li>
        <li><b>Dateizeilen</b> (unten): die Zeilen deiner CSV-Datei, je FINA-Feld eine Spalte. Über den Spalten: je Spalte ein Filterfeld, und über der Tabelle der Schnellfilter über alle Felder.</li>
      </ul>
      <p>Den grauen Griff zwischen den Bereichen kannst du ziehen, um ihre Höhe zu ändern.</p>
      <h4>Was du hier tust</h4>
      <p>Du sagst FINA, welche Zeilen der Datei zu welchem Posten gehören. Dafür gibt es zwei Wege: mit Kriterien, die FINA sich am Posten für den nächsten Import merkt — oder von Hand, einmalig.</p>
      <h4>Zuordnen mit Kriterien</h4>
      <ol>
        <li>Klicke unter Posten den Posten an, der die Zeilen bekommen soll.</li>
        <li>Grenze unter Dateizeilen die Zeilen ein: tippe in ein Spaltenfilter, ein Teilstück genügt. Oder klicke auf einen Wert in einer Zeile — er steht sofort im Filter seiner Spalte.</li>
        <li>Drücke Enter, um das Kriterium anzuheften. Das ☰ am Filterfeld stellt ein, wie verglichen wird: enthält, fängt mit, genau, und so weiter. Mehrere Kriterien grenzen zusammen ein.</li>
        <li>Klicke in der Zuordnungsleiste auf „Zuordnen und merken“. Die Zeilen wandern zum Posten, und die Kriterien werden am Posten als seine Importkriterien gespeichert.</li>
      </ol>
      <p>Zugeordnete Zeilen verschwinden aus den Dateizeilen. Sehen kannst du sie, wenn du den Posten mit dem kleinen Pfeil aufklappst oder auf seine Zeile doppelklickst.</p>
      <h4>Von Hand zuordnen, einmalig</h4>
      <p>Manche Zeilen passen zu keinem Kriterium — eine einmalige Zahlung, eine Rückerstattung. Die ordnest du von Hand zu. Für den nächsten Import wird nichts gemerkt.</p>
      <ol>
        <li>Klicke in der Zuordnungsleiste auf „Modus: Einmalige Zuordnung“. Der Knopf bleibt dunkel, solange der Modus läuft, und unter Dateizeilen erscheint eine Spalte mit Kästchen.</li>
        <li>Hake die Zeilen ab. Ein Klick irgendwo auf die Zeile genügt. Der Schnellfilter grenzt die Liste weiter ein; die Spaltenfilter sind in diesem Modus aus.</li>
        <li>Klicke unter Posten das Ziel an.</li>
        <li>Klicke auf „Einmalig zuordnen“. Ein Fenster zeigt die Zeilen — bestätige.</li>
        <li>Klicke noch einmal auf „Modus: Einmalige Zuordnung“, um den Modus zu beenden.</li>
      </ol>
      <h4>Gemerkte Kriterien</h4>
      <p>Posten behalten die Importkriterien aus früheren Importen. „Gemerkte Importkriterien anwenden…“ rechts in der Zuordnungsleiste zeigt, welche Posten jetzt Zeilen bekämen; du wählst aus. Das ☰ an einem einzelnen Posten bietet dasselbe für diesen Posten, dazu „Suchen nach Betrag“.</p>
      <h4>Das ☰-Menü in der Zuordnungsleiste</h4>
      <ul>
        <li>„Filter zurücknehmen und alle nicht zugeordneten CSV-Daten zeigen“ leert alle Filter.</li>
        <li>„Alle gemerkten Importkriterien zeigen“ listet die Kriterien aller Posten; dort kannst du sie ändern.</li>
      </ul>
      <h4>Farben</h4>
      <ul>
        <li>Orange: das gewählte Ziel.</li>
        <li>Gelb: in diesem Lauf zugeordnet, noch nicht im Buch.</li>
        <li>Blau: früher importiert, schon im Buch.</li>
        <li>Grau: schon mit demselben Betrag im Buch — dieser Import ändert dort nichts.</li>
      </ul>
      <h4>Zum Schluss</h4>
      <p>„Fertig“ schreibt alles Zugeordnete ins Buch und speichert die Kriterien. „Import zurücksetzen und schließen“ wirft die aktuelle Arbeit weg. Speichere danach deine Datei.</p>`}
};

/* ── Der Arbeitsstand des Wizards — lebt nur, solange das Fenster
   offen ist. Ins Buch schreibt allein c2Apply(). ── */
let W=null;

/* ── Filter und Regeln ────────────────────────────────────────
   Ein Filter ist eine Liste von Bedingungen (terms): je Bedingung
   ein **Feld** (f: 'date', 'amount', 'ref1' … 'ref4'; 'q' heißt
   Schnellfilter über alle verknüpften Felder), eine Vergleichsart
   op (has · not · is · starts · ends · amt — das ☰-Menü am Feld)
   und der Wert. Bedingungen entstehen live beim Tippen (W.flt je
   Feld, W.q der Schnellfilter) oder angeheftet als Filterzeile über
   dem Feld (W.chips, mit Enter). Eine Regel trägt dieselbe Liste in
   r.terms — und so steht sie auch am Posten (impRules). Alte
   Regeln mit Spaltennummern übersetzt migrate() in js/state.js. */
function c2Norm(s){return String(s==null?'':s).toLowerCase().replace(/,/g,'.');}
function c2Term(row,tm){
  /* **Eine Bedingung nennt ein Feld, keine Spalte** (5.9.26):
     welche Spalte das Feld in dieser Datei trägt, sagt W.f. Ist
     das Feld hier nicht verknüpft, kann die Bedingung nicht
     zutreffen — die Regel greift dann in dieser Datei nicht, und
     das Wahl-Fenster der gemerkten Kriterien sagt „trifft keine
     Zeile". 'q' ist der Schnellfilter über alle verknüpften
     Felder. */
  if(tm.f==='q'){
    const v=c2Norm(tm.val).trim();
    return C2_FIELDS.some(f=>W.f[f]>=0&&c2Norm(row[W.f[f]]).includes(v));
  }
  const ci=W.f[tm.f];
  if(ci==null||ci<0)return false;
  const cell=c2Norm(row[ci]).trim(),v=c2Norm(tm.val).trim();
  if(tm.op==='is')return cell===v;
  if(tm.op==='starts')return cell.startsWith(v);
  if(tm.op==='ends')return cell.endsWith(v);
  /* **„Enthält nicht" ist die einzige Bedingung, die etwas
     wegnimmt** (30.8.26). Sie wird gebraucht, wo eine Spalte fast
     immer passt und nur ein paar Zeilen woandershin gehören —
     „alles von der Tankstelle außer den Waschanlagen": mit den
     vier bisherigen Arten musste man dafür die passenden Zeilen
     einzeln aufzählen. Ein leerer Wert käme hier nie an: die
     Filterzeile lässt ihn gar nicht erst zu einer Bedingung
     werden (c2LiveTerms), und im Regel-Fenster hält er das
     Speichern auf — sonst hieße „enthält nicht nichts" so viel
     wie „keine Zeile". */
  if(tm.op==='not')return !cell.includes(v);
  /* **„Betrag ist einer von"** (5.9.26): der Wert ist eine Liste
     von Beträgen, getrennt durch „|". Verglichen wird als Zahl
     **mit Vorzeichen** — „-55,08" trifft nur eine Zahlung, keine
     Gutschrift über denselben Betrag. Nur eine Datei, die alles
     ohne Vorzeichen führt (eine Ausgabenliste, !W.neg), wird ohne
     Vorzeichen verglichen: dort steht die Richtung nicht an der
     Zahl. Gelesen wird die **rohe** Zelle, nicht die normierte:
     c2Norm macht aus „1.234,56" ein „1.234.56", und das ist keine
     Zahl mehr. Der Weg hierher ist „Suchen nach Betrag" im ☰-Menü
     eines Ziels (c2RowMenu). */
  if(tm.op==='amt'){
    const cv=c2Amount(row[ci]);
    if(isNaN(cv))return false;
    const loose=!(W&&W.neg);
    return String(tm.val).split('|').some(s=>{
      const x=c2Amount(s);
      if(isNaN(x))return false;
      return loose?Math.abs(Math.abs(x)-Math.abs(cv))<0.005:Math.abs(x-cv)<0.005;
    });
  }
  return cell.includes(v);
}
function c2Match(row,terms){return terms.every(tm=>c2Term(row,tm));}
/* Angeheftete Filterzeilen und das gerade Getippte, als eine
   Liste. „=" vorn heißt weiterhin: genau dieser Wert. */
function c2LiveTerms(){
  const ts=W.chips.slice();
  for(const k in W.flt){
    let v=String(W.flt[k]).trim();
    if(!v)continue;
    let op=W.fltOp[k]||'has';
    if(v[0]==='='){op='is';v=v.slice(1).trim();if(!v)continue;}
    ts.push({f:k,op:op,val:v});
  }
  const q=String(W.q||'').trim();
  if(q)ts.push({f:'q',op:'has',val:q});
  return ts;
}
function c2OpLabel(op){
  return op==='is'?t('c2.opOnly'):op==='starts'?t('c2.opStart')
    :op==='ends'?t('c2.opEnd'):op==='not'?t('c2.opNot')
    :op==='amt'?t('c2.opAmt'):t('c2.opHas');
}
function c2OpShort(op){
  return op==='is'?t('c2.opOnlyS'):op==='starts'?t('c2.opStartS')
    :op==='ends'?t('c2.opEndS'):op==='not'?t('c2.opNotS')
    :op==='amt'?t('c2.opAmtS'):t('c2.opHasS');
}
/* Die Reihenfolge im ☰-Menü **und** in der Auswahlliste des
   Regel-Fensters: „enthält" und sein Gegenteil stehen beieinander,
   danach das Genauere, zuletzt der Betragsvergleich. Wer eine Art
   hinzufügt, trägt sie hier ein und in c2OpLabel/c2OpShort — sonst
   steht sie an einer der beiden Stellen nicht zur Wahl. **Und in
   „FINA Strukturen und Objekte"**: die Vergleichsart steht in der
   Datei (state.csvMaps), eine neue ist eine Änderung der Struktur. */
const C2_OPS=['has','not','starts','ends','is','amt'];

function c2Meta(){
  W.meta=W.csv.rows.map(r=>{
    const d=W.f.date>=0?c2Date(r[W.f.date]):null;
    const v=W.f.amount>=0?c2Amount(r[W.f.amount]):NaN;
    return {d:d,v:v,in:!!(d&&d.y===YEAR&&!isNaN(v))};
  });
  /* Stehen die meisten Beträge im Minus, sind Kosten in dieser
     Datei negativ — der übliche Kontoauszug. Gefragt wird nicht:
     die Zeilen sagen es selbst. */
  let neg=0,pos=0;
  W.meta.forEach(m=>{if(isNaN(m.v))return;if(m.v<0)neg++;else if(m.v>0)pos++;});
  W.neg=neg>=pos;
}

/* **Zwei Arten von Regel.** Die gewöhnliche hat Bedingungen und
   findet ihre Zeilen selbst wieder — auch in der Datei vom nächsten
   Monat. Die von Hand markierte hat eine Liste von Zeilennummern
   (`pick`); die gilt nur für **diese** Datei und wird deshalb nie
   gemerkt (sie trägt immer `once`). Ohne diesen zweiten Weg
   verlöre eine Handauswahl ihre Zeilen beim nächsten Neurechnen,
   denn `c2ApplyRules()` baut die Zuordnung jedes Mal neu auf. */
function c2ApplyRules(){
  W.asg=W.csv.rows.map(()=>-1);
  W.rules.forEach((r,ri)=>{
    if(r.pick){
      r.pick.forEach(i=>{if(W.asg[i]<0&&W.meta[i]&&W.meta[i].in)W.asg[i]=ri;});
      return;
    }
    W.csv.rows.forEach((row,i)=>{
      if(W.asg[i]>=0)return;
      if(!W.meta[i].in)return;
      if(c2Match(row,r.terms))W.asg[i]=ri;
    });
  });
}

function c2Hits(){
  const terms=c2LiveTerms();
  const out={free:[],taken:[],own:[],off:[]};
  W.csv.rows.forEach((row,i)=>{
    if(!c2Match(row,terms))return;
    if(!W.meta[i].in)out.off.push(i);
    else if(W.asg[i]<0)out.free.push(i);
    else if(W.editRule!=null&&W.asg[i]===W.editRule)out.own.push(i);
    else out.taken.push(i);
  });
  return out;
}

/* ── Aus dem CSV-Vorzeichen wird die Buchrichtung ────────────
   FINA führt Kosten mit Minus und Einnahmen mit Plus — dasselbe,
   was ein Kontoauszug tut. **Führt die Datei es genauso
   (`W.neg`), wird nichts gedreht:** −500 bleibt eine Zahlung, und
   +937,08 bleibt eine Gutschrift, auch wenn sie an einem Posten
   der Kosten hängt. Eine Rückzahlung ist kein negativer Betrag,
   und die Zeile soll das sagen.

   Führt die Datei dagegen alles positiv (eine Ausgabenliste ohne
   Vorzeichen, `!W.neg`), dreht sich das Vorzeichen für Kostenziele
   — dort ist die Richtung nicht an der Zahl, sondern am Ziel
   abzulesen.

   **Dieselbe Rechnung steht im flexiblen Zweig von c2Apply()**;
   wer eine ändert, ändert die andere mit. Bis 30.8.26 drehte diese
   Funktion in beiden Fällen und schrieb Kosten mit Plus ins Buch —
   die Blocksummen der Jahresmatrix gingen dadurch nicht auf. */
function c2BookVal(i,income){
  const v=W.meta[i].v;
  if(isNaN(v))return 0;
  if(W.neg)return v;
  return income?v:-v;
}

/* ── Was diese Sitzung schon zugeordnet hat ──────────────────
   Für die Importdaten-Liste der Detailfenster (impSideData in
   js/ui.js): wird ein Posten oder eine Kategorie **aus dem
   Wizard heraus** geöffnet (c2Detail), zeigt die Liste auch die
   Zeilen, die im dritten Schritt diesem Ziel zugeordnet, aber
   noch nicht mit „Anwenden" ins Buch geschrieben sind. Je Monat
   eine Liste, jede Zeile mit nw:1 — die Liste hinterlegt sie
   hellgelb, dieselbe Farbsprache wie im Wizard: Gelb heißt
   „kommt neu herein". Wert und Text entstehen mit denselben
   Regeln wie beim Anwenden (c2Apply), sonst zeigte die Vorschau
   andere Zahlen, als das Buch bekommt. Ohne offenen dritten
   Schritt gibt es nichts Schwebendes — leeres Ergebnis. */
function c2PendingRows(kind,ref){
  const out={};
  if(!W||!W.csv||W.step!==3||!W.rules.length)return out;
  const tid=kind==='item'?('i:'+String(ref&&ref.id)):('k:'+ref);
  const two=n=>String(n).padStart(2,'0');
  W.csv.rows.forEach((row,i)=>{
    const ri=W.asg[i];
    if(ri==null||ri<0)return;
    const r=W.rules[ri];
    if(!r||!r.t||r.t.tid!==tid)return;
    const me=W.meta[i];
    if(!me||!me.in||!me.d)return;
    const d=me.d;
    const v=W.kind==='reg'?c2BookVal(i,r.t.income):(W.neg?me.v:-me.v);
    /* Die vier Referenzen, wie sie „Fertig" ins Buch schreibt
       (c2Refs) — die Liste zeigt sie je Referenz als Zeile; `txt`
       ist nur ihr Sortierschlüssel. */
    const rr=c2Refs(row);
    /* `once` wandert mit: die Vorschau in den Monatskacheln soll
       denselben Kreis zeigen, den „Anwenden" hinterlässt — rot,
       wenn die Zuordnung nicht gemerkt wird. */
    (out[d.m]=out[d.m]||[]).push({d:two(d.d)+'.'+two(d.m)+'.'+two(d.y%100),
      dn:(d.y%100)*10000+d.m*100+(d.d||0),v:v,r:rr,txt:refsText(rr),nw:1,once:!!r.once});
  });
  return out;
}

/* Je Ziel die zugeordneten Zeilen und Monatssummen. */
function c2Buckets(){
  const order=[],by={};
  W.rules.forEach(r=>{
    if(!by[r.t.tid]){
      by[r.t.tid]={t:r.t,rows:[],sum:0,months:Array(13).fill(0),cnt:Array(13).fill(0)};
      order.push(r.t.tid);
    }
  });
  W.csv.rows.forEach((row,i)=>{
    const ri=W.asg[i];
    if(ri==null||ri<0)return;
    const b=by[W.rules[ri].t.tid],m=W.meta[i],v=c2BookVal(i,W.rules[ri].t.income);
    b.rows.push(i);b.sum+=v;b.months[m.d.m]+=v;b.cnt[m.d.m]++;
  });
  order.forEach(tid=>{const b=by[tid];
    b.sum=Math.round(b.sum*100)/100;
    for(let m=1;m<=12;m++)b.months[m]=Math.round(b.months[m]*100)/100;
  });
  return {order:order,by:by};
}

/* ── Ziele: Posten (regulär) oder Hauptkategorien (flexibel).
   Vorhandene kommen aus dem Buch, neue tragen 'n:'+Name. ── */
function c2Targets(){
  if(W.kind==='flex'){
    return [[t('c2.blkFlex'),kakCats().map(n=>({tid:'k:'+n,name:n,income:false}))],
            [t('c2.blkNew'),W.newT]];
  }
  const it=state.fixed;
  return [
    [t('c2.blkIn'),it.filter(x=>isIncome(x)).map(x=>({tid:'i:'+x.id,name:x.name,income:true}))],
    [t('c2.blkOut'),it.filter(x=>!isIncome(x)).map(x=>({tid:'i:'+x.id,name:x.name,income:false}))],
    [t('c2.blkNew'),W.newT]];
}
function c2Find(tid){
  for(const g of c2Targets()){const x=g[1].find(y=>y.tid===tid);if(x)return x;}
  const r=W.rules.find(x=>x.t.tid===tid);
  return r?r.t:null;
}
function c2ByName(nm){
  const q=nm.trim().toLowerCase();
  for(const g of c2Targets()){const x=g[1].find(y=>y.name.trim().toLowerCase()===q);if(x)return x;}
  return null;
}

/* ── Einfach lostippen ───────────────────────────────────────
   Dieselbe Regel wie in der Monats- und der Jahresansicht (siehe
   „Einfach lostippen" in js/app.js): wer im dritten Schritt zu
   tippen anfängt, ohne vorher in ein Feld geklickt zu haben, meint
   den Schnellfilter — etwas anderes, wohin ein Buchstabe gehörte,
   gibt es dort nicht. Dieselben vier Ausnahmen: ein Feld hat schon
   den Fokus, ein Fenster liegt über dem Wizard, jede Taste mit
   Strg/Cmd/Alt (`key.length===1` hält Escape, Tabulator und die
   Pfeile ohnehin heraus), und das Leerzeichen bei leerem Feld.

   Der Handler hängt am **Dokument** und nicht am Fenster: ohne
   Fokus im Fenster kommt ein Tastendruck dort gar nicht an — er
   geht an `document.body`. Der Handler in js/app.js steigt bei
   offenem `.modal` aus, die beiden treten sich also nicht auf die
   Füße. Geschrieben wird ins Feld und danach `c2RefreshAssign()` —
   genau, was das Tippen im Feld selbst tut; ein voller Neuaufbau
   wäre für ein Zeichen zu viel. */
function c2Keys(ev){
  if(!W||W.step!==3||ev.defaultPrevented||ev.isComposing) return;
  if(ev.ctrlKey||ev.metaKey||ev.altKey||ev.key.length!==1) return;
  /* Ein weggeräumtes Fenster (Escape, Klick daneben) nimmt den
     Handler mit: dort steht kein Feld mehr, in das etwas gehörte. */
  if(!W.modal.isConnected){ document.removeEventListener('keydown',c2Keys); return; }
  const stack=document.querySelectorAll('.modal');
  if(stack[stack.length-1]!==W.modal) return;
  const el=document.activeElement;
  if(el&&(el.matches('input,textarea,select')||el.isContentEditable)) return;
  const q=W.box.querySelector('#c2Q');
  if(!q) return;
  if(ev.key===' '&&!(W.q||'')) return;
  ev.preventDefault();
  W.q=(W.q||'')+ev.key;
  q.value=W.q;
  q.classList.add('on');
  q.focus();
  q.setSelectionRange(q.value.length,q.value.length);
  c2RefreshAssign();
}

/* Ein Fenster über dem Wizard öffnen und danach neu zeichnen.
   Das Posten- und das Kategorie-Fenster kennen keinen Rückweg
   (anders als `openSettings(where,done)`), und der Wizard zeigt
   Zahlen aus dem Buch, die dort gerade geändert werden können.
   Beobachtet wird deshalb, wann das Fenster wieder verschwindet —
   ein Wächter, der sich selbst abmeldet. */
function c2Detail(open){
  const before=new Set(document.querySelectorAll('.modal'));
  open();
  const fresh=[...document.querySelectorAll('.modal')].find(m=>!before.has(m));
  if(!fresh)return;
  const obs=new MutationObserver(()=>{
    if(fresh.isConnected)return;
    obs.disconnect();
    if(W&&W.modal&&W.modal.isConnected)c2Render();
  });
  obs.observe(document.body,{childList:true});
}

/* ── Das Fenster ─────────────────────────────────────────────── */
function openCsvWizard(){
  W={step:1,kind:null,csv:null,cols:[],f:c2BlankF(),neg:true,
     meta:[],rules:[],newT:[],asg:[],flt:{},fltOp:{},chips:[],q:'',colw:{},colnat:{},open:{},
     target:'',editRule:null,ignoreMap:false,once:false,pick:{},
     mapRules:null,autoDone:false,
     /* **Die Spalten kamen aus der gemerkten CSV-Struktur** (5.9.26,
        „Automatisch CSV-Datenstruktur vorbereiten" in Schritt 1):
        die Art ist dann gesetzt und gesperrt, und Schritt 2 geht mit
        „Weiter" in die Zuordnung, ohne nach einem Namen zu fragen —
        gemerkt ist die Struktur ja schon. „CSV-Datenstruktur neu
        anordnen" und eine neue Datei nehmen es zurück. */
     autoCols:false,
     /* **Die Art kam aus der gemerkten Struktur** (5.9.26 spät):
        dann darf sie nicht wie eine eigene Wahl weiterleben — „Neu
        anordnen" und eine neue Datei nehmen sie mit zurück, eine
        von Hand gewählte bleibt (Schritt-1-Handler in c2Wire). */
     kindFromMap:false,
     /* Ob die Anleitung rechts neben dem Schritt steht, und der
        Name, unter dem die Spalten gemerkt sind (c2AskMapName). */
     guide:false,mapName:'',
     /* Wie die beiden Flächen des dritten Schritts die Höhe teilen
        (Anteil des Zielbereichs). Jedes Öffnen fängt bei halb/halb
        an — der Wert lebt nur in W und nie in der Datei. */
     split:.5};
  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML='<div class="box c2box"></div>';
  /* **Escape schließt den Wizard nur im ersten Schritt.** Danach
     nimmt es den Filter zurück — und sonst nichts. Ein Import ist
     eine Arbeit über mehrere Minuten mit Dutzenden von Handgriffen;
     ein versehentliches Escape warf sie bisher weg, und zwar in
     jedem Schritt. Geschlossen wird ab Schritt 2 über ✕. Der Weg
     dorthin führt über `box._close`, das der Escape-Handler in
     js/ui.js abfragt, bevor er ein Fenster entfernt. */
  box._close=c2Esc;
  document.body.appendChild(box);
  W.modal=box;W.box=box.querySelector('.box');
  document.addEventListener('keydown',c2Keys);
  /* Das Fenster wächst mit dem Browserfenster — die verteilten
     Spaltenbreiten der CSV-Tabelle müssen mit (c2FitCols). */
  window.addEventListener('resize',c2FitCols);
  c2Render();
}

/* Escape im Wizard: den Filter zurücknehmen, mehr nicht — das
   Fenster bleibt stehen. */
function c2Esc(){
  if(!W)return;
  /* **Im ersten Schritt schließt Escape.** Dort ist noch nichts
     getan — eine Datei gewählt und eine Art angekreuzt, beides in
     einem Klick wieder hergestellt; Escape und das ✕ meinen da
     dasselbe. Ab dem zweiten Schritt hängt Arbeit im Fenster
     (Spalten, Felder, Regeln, Zuordnungen), und dann darf ein
     Tastendruck sie nicht wegwerfen. */
  if(W.step===1){c2Close();return;}
  if(W.step!==3)return;
  /* **Escape arbeitet sich von innen nach außen** (30.8.26).
     Steht die Schreibmarke in einem Spaltenfilter, leert der erste
     Druck dessen Eintrag; ist das Feld schon leer, wandert der
     Fokus in die CSV-Fläche. Erst wenn kein Spaltenfilter den
     Fokus hat, nimmt Escape den Schnellfilter zurück — und der
     Fokus geht ebenfalls in die Fläche. Die angehefteten
     Filterzeilen und die Vergleichsarten sind Arbeit über mehrere
     Handgriffe; sie nimmt nur „Filter zurücknehmen" im ☰-Menü
     links zurück (c2ClearFlt). */
  const csvFocus=()=>{
    const sc=W.box.querySelector('.c2bot .c2scroll');
    if(sc)sc.focus({preventScroll:true});
  };
  const ae=document.activeElement;
  if(ae&&ae.dataset&&ae.dataset.c2flt!=null){
    const ci=ae.dataset.c2flt;
    if(String(ae.value||'').trim()||String(W.flt[ci]||'').trim()){
      ae.value='';delete W.flt[ci];
      ae.classList.remove('on');
      c2RefreshAssign();
      ae.focus();
      return;
    }
    csvFocus();
    return;
  }
  W.q='';W.chips=W.chips.filter(c=>c.f!=='q');
  c2Render();
  csvFocus();
}
function c2Close(){
  document.removeEventListener('keydown',c2Keys);
  window.removeEventListener('resize',c2FitCols);
  if(W&&W.modal)W.modal.remove();
  W=null;
}

/* Die Knöpfe, die durch den Wizard führen, stehen in **jedem**
   Schritt an derselben Stelle: oben in der Kopfzeile, gleich neben
   den Schritten — dort, wo auch steht, wo man gerade ist. Vorher
   saßen sie je Schritt woanders (unten im ersten, in der Leiste im
   zweiten, in der Mittelleiste im dritten), und man suchte den Weg
   weiter bei jedem Wechsel neu. Abbrechen braucht es hier nicht:
   das ✕ steht daneben. */
function c2Nav(){
  const b=(a,cls,lab,dis,tip)=>`<button class="btn${cls}" data-c2="${a}"${dis?' disabled':''}${tip?` title="${esc(tip)}"`:''}>${lab}</button>`;
  /* **Der erste Schritt geht von selbst weiter** — sobald Datei und
     Art gewählt sind (c2Advance). **Seinen „Weiter"-Knopf hat er
     trotzdem** (5.9.26; für ein paar Stunden war er heraus): er
     steht an derselben Stelle wie in jedem Schritt, und er ist der
     Weg nach vorn für den, der aus Schritt 2 zurückkommt. Sonst sagt
     der Klick, was fehlt (c2WireNav) — oder dass zuerst der Kasten
     über den Angaben zu beantworten ist, wenn FINA die Datei-Art
     kennt.
     **Schwarz, sobald es weitergehen kann** (5.9.26; vorher orange):
     der Weg nach vorn ist in jedem Schritt derselbe schwarze Knopf
     — „Weiter", „Spalten speichern und weiter", „Fertig". */
  if(W.step===1)return b('to2',c2Step1Ready()?' primary':'',t('c2.next'));
  /* **Der Knopf nach vorn wird schwarz, sobald alles beisammen ist** —
     mindestens eine Spalte, dazu Datum und Betrag als FINA-Bezug.
     Vorher ist er ein gewöhnlicher Knopf: er sagt dann, dass noch
     etwas fehlt, und das Fenster dahinter (c2Missing) sagt, was.
     Nachgeführt wird er bei jedem Umbau der Tabelle (c2RefreshNav). */
  /* **Ganz links die Anleitung** (Schritt 2 und 3): gedrückt teilt
     sie das Fenster (c2GuidePanel). **Orange gefüllt, weiße
     Schrift** (.accent) — sie soll ins Auge fallen, nicht wie ein
     Weg unter vielen aussehen; gedrückt eine Stufe dunkler
     (.c2gbtn[aria-pressed] in css/components.css). */
  const guide=`<button class="btn accent c2gbtn" data-c2="guide" aria-pressed="${W.guide?'true':'false'}" title="${esc(t('c2.guideTip'))}">${esc(t('app.guide'))}</button>`;
  /* **„Spalten speichern und weiter"** (5.9.26): der Knopf sagt, was
     er tut — FINA merkt sich die Spalten unter einem Namen, den ein
     Fenster vorher erfragt (c2AskMapName), und erst dann geht es in
     die Datenzuordnung. **Kamen die Spalten aus der gemerkten
     Struktur und stehen noch so da** (W.autoCols, c2ColsSame), heißt
     er nur „Weiter": gemerkt ist dann nichts mehr — der Name wird
     nicht noch einmal erfragt. Wer nach dem automatischen Weg eine
     Spalte umstellt, sieht den Knopf wieder zu „Spalten speichern
     und weiter" werden: die Änderung soll in die Datei. */
  if(W.step===2){
    const same=W.autoCols&&c2ColsSame();
    return guide+b('to1','',t('c2.back'))
      +b('to3',c2Step2Ready()?' primary':'',same?t('c2.next'):t('c2.saveCols'),false,same?t('c2.nextTip'):t('c2.saveColsTip'));
  }
  /* Die gemerkte Zuordnung wohnt seit 5.9.26 **nicht mehr hier**,
     sondern in der Leiste zwischen den beiden Flächen, links vor
     dem Modus-Knopf (c2Step3) — und sie ordnet nichts mehr in
     einem Zug zu: ein Fenster zeigt vorher die Posten, die etwas
     bekämen, und man wählt (c2MapPick).
     **„Fertig" statt „Anwenden"** (5.9.26): aus Sicht des Nutzers
     ist der Import getan, sobald alles zugeordnet ist — der Knopf
     schließt ab und schreibt dabei ins Buch (c2Apply); die
     Sprechblase sagt beides. **Ganz links „Import zurücksetzen und
     schließen"**, noch vor der Anleitung — das frühere ✕ dieses
     Schritts, jetzt mit Namen und im Bild der löschenden Knöpfe
     (.delbtn), denn es wirft Arbeit weg; am äußersten Rand steht
     es am weitesten weg von „Fertig", mit dem man es nicht
     verwechseln soll. Ein ✕ am Rand gibt es in Schritt 3 deshalb
     nicht mehr (c2Render); data-c2="close" ist dasselbe Merkmal
     und wird in c2Wire mitverdrahtet. */
  return b('close',' delbtn',t('c2.xUndoBtn'),false,t('c2.xUndoTip'))
    +guide+b('to2','',t('c2.back'))
    +b('apply',' primary',t('c2.finish'),false,t('c2.closeWizTip'));
}
function c2Step2Ready(){
  return W.cols.length>0&&W.f.date>=0&&W.f.amount>=0;
}
/* **Wartet der Kasten der gemerkten CSV-Struktur noch auf eine
   Antwort?** FINA kennt die Datei-Art, und weder „Automatisch
   vorbereiten" (W.autoCols) noch „Neu anordnen" (W.ignoreMap) ist
   gedrückt. Solange das so ist, geht es aus Schritt 1 nicht weiter:
   die Entscheidung gehört dem Nutzer. */
function c2MapPending(){
  return !!(W.csv&&state.csvMaps[W.csv.fp])&&!W.ignoreMap&&!W.autoCols;
}
/* **Die Art, die mit der gemerkten CSV-Struktur kam** — oder null.
   Gesetzt, sobald „Automatisch CSV-Datenstruktur vorbereiten"
   gedrückt ist und die Struktur eine Art kennt (5.9.26 spät, auf
   ausdrücklichen Wunsch; am Nachmittag war die Art für ein paar
   Stunden aus der Struktur heraus): dann ist sie in Schritt 1
   gesperrt — dieselbe Datei-Art füttert immer dieselben Posten,
   und wer es einmal anders will, nimmt „CSV-Datenstruktur neu
   anordnen". Eine Struktur ohne Art (gemerkt am Nachmittag des
   5.9.26) sperrt nichts: die Art wird dann einmal gewählt und beim
   Weitergehen nachgetragen (c2WireNav, to3). */
function c2LockedKind(){
  const m=W.autoCols&&W.csv&&state.csvMaps[W.csv.fp];
  return (m&&(m.kind==='reg'||m.kind==='flex'))?m.kind:null;
}
/* Dieselbe Frage wie c2Advance, nur ohne zu gehen: Datei und Art
   da, und kein Kasten der gemerkten Struktur, der zuerst eine
   Antwort will. */
function c2Step1Ready(){
  return !!(W.csv&&W.kind)&&!c2MapPending();
}
/* **Stehen Spalten, Felder und Art noch so da, wie FINA sie sich
   für diese Datei-Art gemerkt hat?** Daran hängt in Schritt 2, ob
   der Knopf „Weiter" heißt oder „Spalten speichern und weiter"
   (c2Nav): was schon gemerkt ist, muss nicht noch einmal gemerkt
   werden. Verglichen wird mit der Datei, nicht mit einem Merker —
   wer eine Spalte umstellt und wieder zurückstellt, ist wieder
   beim Gemerkten. */
function c2ColsSame(){
  const m=W.csv&&state.csvMaps[W.csv.fp];
  if(!m)return false;
  /* Verglichen werden allein die Felder (5.9.26). Eine gewählte
     Spalte ohne Feld zählt nicht — sie kommt ohnehin nicht nach
     Schritt 3. Die Art gehört seit dem Abend zwar zur Struktur,
     kann hier aber nicht abweichen: auf dem automatischen Weg ist
     sie gesperrt (c2LockedKind), und nur der fragt hier nach. */
  const mf=m.f||{};
  return C2_FIELDS.every(k=>+(W.f[k]==null?-1:W.f[k])===+(mf[k]==null?-1:mf[k]));
}
/* Nur die Knopfreihe der Kopfzeile neu bauen — Schritt 2 zeichnet
   bei jedem Klick auf eine Spalte nur seine Tabelle neu (redraw in
   c2Wire), und der „Weiter"-Knopf soll trotzdem mitgehen. */
function c2RefreshNav(){
  const nav=W.box.querySelector('.c2nav');
  if(!nav)return;
  nav.innerHTML=c2Nav();
  nav.querySelectorAll('.btn').forEach(b=>{b.tabIndex=0;});
  c2WireNav();
}
/* **Von Datei und Art aus geht es von selbst weiter.** Nur nicht,
   solange FINA diese Datei-Art kennt und noch nicht gesagt ist, ob
   die gemerkte CSV-Struktur übernommen oder neu angeordnet wird —
   dieser Kasten steht über den beiden Angaben und will zuerst
   beantwortet sein (c2MapPending). */
function c2Advance(){
  if(!W.csv||!W.kind)return false;
  if(c2MapPending())return false;
  W.step=2;c2Render();
  return true;
}

function c2Render(){
  W.modal.querySelectorAll('.c2fpop').forEach(p=>p.remove());
  /* **Der Zielbereich springt beim Filtern nicht.** Gefiltert wird
     unten, gelesen oben — und wer eine Zeile im Blick hat, während
     er den Filter eingrenzt, verlöre sie bei jedem Zeichen. Beide
     Flächen behalten deshalb ihren Rollstand über den Neuaufbau
     hinweg; gemessen wird vorher, gesetzt danach. */
  const keep=[...W.box.querySelectorAll('.c2scroll')].map(el=>[el.scrollTop,el.scrollLeft]);
  W.box.classList.toggle('c2big',W.step>1);
  const steps=[t('c2.steps1'),t('c2.steps2'),t('c2.steps3')];
  const head=`<div class="c2head"><h3>${t('c2.title')}</h3>
    <span class="c2steps">${steps.map((s,i)=>
      `<span class="c2stp${W.step===i+1?' on':(W.step>i+1?' ok':'')}">${i+1} ${esc(s)}</span>`).join('<i>›</i>')}</span>
    <span class="c2nav">${c2Nav()}</span>
    ${W.step===3?'':`<button class="btn c2x" data-c2="close" title="${esc(t('c2.xClose'))}">✕</button>`}</div>`;
  /* Das ✕ heißt „Wizard schließen" und steht in Schritt 1 und 2 —
     dort geht nichts verloren, die Spalten sind mit dem Weitergehen
     gespeichert. In Schritt 3 gibt es kein ✕: dort steht sein Weg
     als Knopf mit Namen in der Knopfzeile, „Import zurücksetzen und
     schließen" (c2Nav). */
  /* **Schritt 2 und 3 stehen in `.c2main`**, und daneben, wenn die
     Anleitung offen ist, ihr rechtes Viertel (`.c2gpanel`). Beide
     zusammen sind `.c2work`, die Fläche unter der Kopfzeile. Die
     Höhe verteilt sich darin wie zuvor im Fenster selbst; Schritt 1
     ist klein und braucht das nicht. */
  if(W.step===1)W.box.innerHTML=head+c2Step1();
  else W.box.innerHTML=head+`<div class="c2work"><div class="c2main">${W.step===2?c2Step2():c2Step3()}</div>${W.guide?c2GuidePanel():''}</div>`;
  c2Wire();
  tabThroughFields(W.box);
  /* Die Wizard-Knöpfe bleiben in der Tab-Reihenfolge: sie sind der
     Weg durch das Fenster, kein Beiwerk neben einem Feld — dieselbe
     Ausnahme, die eine Fußzeile (.row-end) ohnehin hat. */
  W.box.querySelectorAll('.c2nav .btn').forEach(b=>{b.tabIndex=0;});
  const now=[...W.box.querySelectorAll('.c2scroll')];
  if(now.length===keep.length)
    now.forEach((el,i)=>{el.scrollTop=keep[i][0];el.scrollLeft=keep[i][1];});
}

/* ── Schritt 1: Datei & Art ──────────────────────────────────── */
function c2Step1(){
  const c=W.csv
    ?`<b>${esc(W.csv.name)}</b> · ${t('c2.meta',W.csv.rows.length,W.csv.header.length,
        esc(W.csv.enc),W.csv.sep==='\t'?t('c2.tab'):'„'+W.csv.sep+'“')}`
    :t('c2.noFile');
  const km=(W.csv&&!W.ignoreMap)?state.csvMaps[W.csv.fp]:null;
  /* **Der Kasten der gemerkten CSV-Struktur** (umgebaut 5.9.26).
     Genannt wird der **Name**, den der Nutzer selbst vergeben hat
     (c2AskMapName), nicht das Datum und nicht mehr die Zahl der
     Regeln: der Kasten handelt von der **Struktur** der Datei —
     welche Spalten was sind —, und Regeln gehören zur Zuordnung
     der Zeilen, die erst in Schritt 3 kommt. Genau das sagt der
     zweite Satz daneben: beim automatischen Lesen der Struktur
     wird noch nichts zugeordnet. Das Wort „Mapping" kommt hier
     nicht mehr vor — es klang nach der Zuordnung der Zeilen, und
     um die geht es hier gerade nicht.

     Zwei Wege: **„Automatisch CSV-Datenstruktur vorbereiten"**
     (schwarz, der erste Griff) übernimmt Spalten, Felder und Art
     aus dem Gemerkten und zeigt sie in Schritt 2 — nicht mehr
     gleich Schritt 3, man soll sehen, was übernommen wurde; die Art
     ist dabei gesperrt. **„CSV-Datenstruktur neu anordnen"** fängt
     in Schritt 2 leer an, mit wählbarer Art. */
  const kmKind=km&&(km.kind==='reg'||km.kind==='flex')?t(km.kind==='reg'?'c2.kindReg':'c2.kindFlex'):'';
  const kmH=km?`<div class="c2known">
      <div class="c2knowncols">
        <p>${t('c2.known',esc(km.file||km.date||'—'))}</p>
        ${kmKind?`<p>${t('c2.knownKind',esc(kmKind))}</p>`:''}
        <p>${t('c2.knownNote')}</p>
      </div>
      <div class="c2row">
        <button class="btn primary" data-c2="applyMap">${t('c2.knownApply')}</button>
        <button class="btn" data-c2="ignoreMap">${t('c2.knownNew')}</button>
      </div></div>`:'';
  /* **Die Art gehört zur Struktur** (5.9.26 spät, auf ausdrücklichen
     Wunsch; am Nachmittag war sie für ein paar Stunden draußen und
     wurde jedes Mal gewählt): „Automatisch vorbereiten" bringt sie
     mit und **sperrt** die beiden Knöpfe (c2LockedKind) — der
     gewählte bleibt Tinte, der andere tritt zurück, und die
     Sprechblase sagt, wie man sie wieder frei bekommt. Gesperrt
     heißt aria-disabled und kein Klick, nicht `disabled`: ein
     gesperrter Knopf soll seine Sprechblase noch zeigen. Eine Zeile
     unter den Knöpfen gibt es nicht mehr — der automatische Weg
     geht gleich nach Schritt 2, hier steht nur noch, wer
     zurückkommt. */
  const lock=c2LockedKind();
  const kb=k=>`<button class="c2kind${W.kind===k?' sel':''}${lock?' klock':''}" data-c2kind="${k}"${lock?` aria-disabled="true" data-tip="${esc(t('c2.kindLockTip'))}"`:''}>`;
  return `<p class="subline">${t('c2.sub')}</p>
    <div class="c2grp">
      <div class="c2row"><button class="btn" data-c2="pick">${t('c2.pick')}</button>
        <span class="c2meta">${c}</span></div>
      ${kmH}
    </div>
    <div class="c2grp">
      <p class="c2lbl">${t('c2.kindQ')}</p>
      <div class="c2kinds">
        ${kb('reg')}${t('c2.kindReg')}<small>${t('c2.kindRegSub')}</small></button>
        ${kb('flex')}${t('c2.kindFlex')}<small>${t('c2.kindFlexSub')}</small></button>
      </div>
    </div>
    <input type="file" id="c2File" accept=".csv,.txt,text/csv,text/plain" hidden>`;
}

/* ── Schritt 2: Spalten & Felder in einem Bild ───────────────
   Gewählt wird am Spaltenkopf (orange = gewählt); über jeder
   gewählten Spalte sitzt die Feld-Auswahl, die mit der Tabelle
   waagerecht rollt. */
function c2FOpts(i){
  /* Die sechs Felder, für beide Arten dieselben (siehe C2_FIELDS oben). */
  const fields=C2_FIELDS.map(f=>[f,c2FieldLabel(f)]);
  let cur='';
  fields.forEach(f=>{if(W.f[f[0]]===i)cur=f[0];});
  return '<option value=""'+(cur===''?' selected':'')+'>—</option>'+
    fields.map(f=>`<option value="${f[0]}"${cur===f[0]?' selected':''}>${esc(f[1])}</option>`).join('');
}

function c2InfoLine(){
  if(W.f.date<0||W.f.amount<0)return '';
  c2Meta();
  const readable=W.meta.filter(m=>m.d&&!isNaN(m.v)).length;
  const inY=W.meta.filter(m=>m.in).length;
  let s=t('c2.info',W.csv.rows.length,readable,inY,YEAR);
  const other=readable-inY;
  if(other)s+=t('c2.infoOther',other);
  return s;
}

/* Die Vorschau zeigt die Datensätze **ab dem ersten** — auch die
   vor der Beschriftungszeile, denn genau die muss man sehen, um
   eine andere zu wählen. Links je Zeile ein Knopf: „das ist die
   Beschriftungszeile". Was darüber steht, wird nicht eingelesen und
   tritt deshalb zurück. */
function c2ColsTable(){
  const h=W.csv.hIdx;
  const recs=W.csv.recs.slice(0,h+41);
  const cell=(r,i)=>{const v=r[i]==null?'':r[i];return {v:v,t:esc(v)};};
  return `<table class="c2tab c2coltab">
    <thead>
      <tr class="c2maprow"><th class="hpick"></th>${W.csv.header.map((c,i)=>
        `<th${W.cols.includes(i)?' class="selcol"':''}>${W.cols.includes(i)?`<select data-c2f="${i}">${c2FOpts(i)}</select>`:''}</th>`).join('')}</tr>
      <tr><th class="hpick" title="${esc(t('c2.hrowTip'))}">${t('c2.hrowCol')}</th>${W.csv.header.map((c,i)=>{
        const on=W.cols.includes(i);
        return `<th class="c2pick${on?' selcol':''}"><button class="c2colbtn${on?' on':''}"
          data-c2col="${i}" aria-pressed="${on}">${esc(c)}</button></th>`;
      }).join('')}</tr>
    </thead>
    <tbody>${recs.map((r,ri)=>{
      const isH=ri===h, pre=ri<h;
      return `<tr class="${isH?'hrow':(pre?'prerow':'')}">
        <td class="hpick"><button class="c2hbtn${isH?' on':''}" data-c2hrow="${ri}"
          aria-pressed="${isH}" title="${esc(isH?t('c2.hrowIs'):t('c2.hrowPick'))}">${isH?'&#9679;':'&#9675;'}</button></td>`+
        W.csv.header.map((c,i)=>{const x=cell(r,i);
          return `<td class="${W.cols.includes(i)?'selc':''}" title="${x.t}">${x.t}</td>`;}).join('')+'</tr>';
    }).join('')}</tbody>
  </table>`;
}

/* **Oben steht die Anweisung, in drei Schritten** (5.9.26): erst
   die Zeile mit den Spaltenbeschriftungen wählen (Spalte HDR), dann
   die Spalten, die für die Zuordnung zählen, dann über jeder
   gewählten Spalte ihr FINA-Bezug. Vorher stand dort ein Satz, der
   alles auf einmal erklärte — in der Reihenfolge, in der man es
   tut, liest es sich als Liste. Die Vorschau-Zeile (die ersten 40
   Datensätze) steht als Auskunft in der Leiste daneben. */
function c2Step2(){
  return `<ol class="c2howto">
      <li>${t('c2.how1',t('c2.hrowCol'))}</li>
      <li>${t('c2.how2')}</li>
      <li>${t('c2.how3')}</li>
    </ol>
    <div class="c2bar">
      <button class="btn" data-c2="selAll">${t('c2.selAll')}</button>
      <button class="btn" data-c2="selNone">${t('c2.selNone')}</button>
      <span class="c2meta" id="c2Cnt">${t('c2.colsCnt',W.cols.length,W.csv.header.length)}</span>
      <span class="c2meta" id="c2Info">${c2InfoLine()}</span>
      <span class="c2meta">${t('c2.preview',Math.min(40,W.csv.rows.length),W.csv.rows.length)}</span>
    </div>
    <div class="c2scroll" id="c2ColsWrap">${c2ColsTable()}</div>`;
}

/* Beim Wählen einer Spalte ihr Feld raten — nur, wenn das Feld
   noch frei ist; der Nutzer behält das letzte Wort. */
function c2GuessCol(i){
  const H=W.csv.header[i],probe=W.csv.rows.slice(0,60);
  let dates=0,nums=0;
  probe.forEach(r=>{
    const c=r[i];if(c==='')return;
    if(c2Date(c))dates++;
    else if(!isNaN(c2Amount(c)))nums++;
  });
  const free=f=>W.f[f]<0||!W.cols.includes(W.f[f]);
  if(free('date')&&(dates>probe.length/3||/^buchungstag$|^datum$|^date$/i.test(H))){W.f.date=i;return;}
  if(free('amount')&&(/^wert \(eur\)$|^betrag$|^amount$/i.test(H)||(nums>probe.length/2&&/betrag|wert|amount|summe|umsatz/i.test(H)))){W.f.amount=i;return;}
  /* **Eine Textspalte bekommt die nächste freie Referenz** — in der
     Reihenfolge, in der die Spalten gewählt werden: die erste
     gewählte Textspalte ist Referenz 1. Bei „Alles wählen" ist das
     die Reihenfolge der Datei. Textspalte heißt: eine, deren Name
     nach Kategorie, Empfänger, Verwendungszweck oder Notiz klingt;
     Kontonummern und Kürzel bleiben ohne Feld — man kann sie
     trotzdem zum Filtern wählen. Mehr als drei bekommen nichts. */
  if(/haupt|main ?cat|kategorie|category|beguenstigt|begünstigt|empf|auftraggeber|zahlungspflichtig|payee|von\/zu|verwendungszweck|purpose|notiz|memo|beschreib|description|zweck|buchungstext|text/i.test(H)){
    const f=C2_REFS.find(free);
    if(f){W.f[f]=i;return;}
  }
}

/* ── Schritt 3: Zuordnen ─────────────────────────────────────
   Oben die Jahrestabelle aus dem Buch — ganz links die
   Mapping-Spalte: ein ✕ löst die Zuordnungen eines Ziels wieder.
   Unten die CSV mit Filter je Spalte. */
function c2Bmap(){const m={};(state.banks||[]).forEach(b=>{if(b&&b.code)m[b.code]=b.label||b.code;});return m;}
function c2Pmap(){const m={};(state.pays||[]).forEach(p=>{if(p&&p.code)m[p.code]=p.label||p.code;});return m;}

function c2TopTable(){
  const B=c2Buckets();
  /* **B · PT · DD · LP stehen hier nicht.** In der Jahresmatrix
     sind die vier Kürzel am Platz — dort liest man den Posten. Hier
     ordnet man Zeilen einer Datei zu, und dafür braucht es den
     Namen und die zwölf Monate; die vier Spalten nahmen nur die
     Breite weg, die die zugeordneten Zeilen darunter brauchen. */
  /* Summenzeilen tragen keine Zeichen — dort ist nichts abgehakt. */
  /* **Der laufende Monat trägt dieselbe Marke wie die Jahresmatrix**:
     roter Ring um den Spaltennamen, zwei rote Linien um die Spalte
     (Klasse cm an jeder Zelle — hier ist eine Zelle die ganze
     Spalte, links und rechts liegen beide Linien an ihr). */
  const cm=m=>m===CUR?' cm':'';
  const numCells=arr=>arr.map((v,i)=>`<td class="num${cm(i+1)} ${cls(v)}">${v?eur(v):''}</td>`).join('');
  const sumOf=list=>{
    const s=Array(12).fill(0);
    list.forEach(a=>a.forEach((v,i)=>{s[i]+=+v||0;}));
    return s.map(v=>Math.round(v*100)/100);
  };
  const Z=()=>Array(12).fill(0);
  /* Dieselben Kreise wie in Monats- und Jahresansicht (.statmark). */
  const IMP=`<i class="c2mk statmark imp" title="${esc(t('c2.sealTip'))}">${IMPORT_SVG}</i>`;
  const IMP1=`<i class="c2mk statmark imp once" title="${esc(t('c2.sealOnceTip'))}">${IMPORT_SVG}</i>`;
  const OK=`<i class="c2mk statmark" title="${esc(t('year.paidTip'))}">${CHECK_SVG}</i>`;
  /* **Was der Import schreiben wird, steht schon da.** Füllt er
     einen Monat, zeigt die Zelle seinen Betrag und nicht den aus
     dem Buch: „Anwenden" ersetzt ihn genau so. Ohne Zuordnung
     bleibt der Monat, wie er ist. */
  const eff=e=>{
    const b=B.by[e.tid];
    return e.amounts.map((v,i)=>(b&&b.cnt[i+1])?b.months[i+1]:v);
  };
  /* Das Zeichen je Monat — dieselbe Sprache wie die Jahresmatrix:
     blauer Pfeil für importiert, grüner Haken für von Hand
     abgehakt, sonst nichts. Was dieser Import gerade zuordnet,
     zählt schon als importiert. */
  /* Ob **dieser** Lauf den Monat einmalig schreibt, steht an den
     Regeln seiner Zeilen — dieselbe Frage wie beim Anwenden
     (c2Apply), und sie muss dieselbe Antwort geben: der Kreis
     zeigt vorher, was danach in der Datei steht. */
  const willOnce=(e,m)=>{
    const b=B.by[e.tid];
    return !!(b&&b.rows.some(i=>W.meta[i].d.m===m&&(W.rules[W.asg[i]]||{}).once));
  };
  const symOf=(e,m,fromImport)=>{
    if(fromImport)return willOnce(e,m)?IMP1:IMP;
    if(e.raw)return paidAt(e.raw,m)?((e.raw.imp&&e.raw.imp[m-1])?(impOnceAt(e.raw,m)?IMP1:IMP):OK):'';
    if(e.kk)return kakDone(e.kk,m)?(flexKind(e.kk,m)==='imp'?(flexImpOnce(e.kk,m)?IMP1:IMP):OK):'';
    return '';
  };
  /* Zeichen und Notizlampe stehen **rechts vom Betrag**, in einem
     eigenen Feld am Zellenrand — dieselbe Reihenfolge wie in der
     Jahresmatrix, wo beide in der Zelle hinter dem Monat stehen.
     Der Platz dafür ist an jeder Zelle reserviert (padding-right in
     css/components.css), damit die Zahlen weiter auf einer Linie
     rechtsbündig stehen.

     **Die Lampe steht immer da**, auch ohne Notiz — genau wie im
     Jahr: sie ist der Weg, eine anzulegen, und ein Weg, der nur
     erscheint, wenn es ihn schon gibt, ist keiner. Ein Ziel, das es
     im Buch noch gar nicht gibt („n:…"), bekommt keine: dort wäre
     nichts, woran eine Notiz hinge. */
  const lampOf=(e,m)=>e.raw?lampHtml('item',e.raw.id,m):(e.kk?lampHtml('kak',e.kk,m):'');
  const monthCells=e=>{
    const b=B.by[e.tid],vals=eff(e);
    return vals.map((v,i)=>{
      const sym=symOf(e,i+1,!!(b&&b.cnt[i+1]));
      return `<td class="num${cm(i+1)} ${cls(v)}">${v?eur(v):''}<i class="c2marks">${sym}${lampOf(e,i+1)}</i></td>`;
    }).join('');
  };
  /* Der Klapp-Pfeil zwischen ✕ und Namen: er sagt, **ob** an diesem
     Ziel zugeordnete Zeilen hängen — blau, wenn ja, grau, wenn
     nicht —, und klappt sie auf. Zu bleiben sie von Haus aus: die
     Ziele sind die Liste, die man liest, die einzelnen Buchungen
     sieht man sich an, wenn man an einer zweifelt. */
  /* Wer einen Pfeil bekommt, kommt hier hinein — der Kopf der
     Spalte braucht die Liste, um zu wissen, ob es überhaupt etwas
     zu klappen gibt und ob gerade etwas offen steht. Gesammelt
     wird beim Bauen und nicht aus `W.open`: dort können Ziele
     stehen, die es nach einem Filter gar nicht mehr gibt. */
  const openable=[];
  const foldCell=e=>{
    const n=(B.by[e.tid]?B.by[e.tid].rows.length:0)+prevLines(e).length;
    if(!n)return `<td class="foldc"><span class="c2fold off" title="${esc(t('c2.foldNone'))}">${C2_TRI}</span></td>`;
    openable.push(e.tid);
    const open=!!W.open[e.tid];
    return `<td class="foldc"><button class="c2fold${open?' open':''}" data-c2fold="${esc(e.tid)}" aria-expanded="${open}"
      title="${esc(t(open?'c2.foldHide':'c2.foldShow',n))}">${C2_TRI}</button></td>`;
  };
  /* Steht in diesem Monat schon ein importierter Wert im Buch, und
     welcher? */
  const impAt=(e,m)=>e.raw?!!(e.raw.imp&&e.raw.imp[m-1])
    :(e.kk?flexKind(e.kk,m)==='imp':false);
  const bookAt=(e,m)=>e.raw?(e.raw.amounts[m-1]||0):(e.kk?kakVal(e.kk,m):0);
  /* **Ändert „Anwenden" an diesem Monat etwas?** Daran hängen hier
     alle Farben — und nicht daran, ob überhaupt etwas zugeordnet
     ist. Wer dieselbe Art Datei ein zweites Mal einliest, bekommt
     über die gemerkte Zuordnung auch seine alten Zeilen wieder
     zugeordnet; sie stünden sonst als „neu" da, obwohl sie längst
     im Buch stehen. Neu ist ein Monat also, wenn er noch offen ist
     — oder wenn dabei ein **anderer** Betrag herauskäme als der,
     der schon dort steht. **Abgehakt genügt, die imp-Marke ist
     keine Bedingung:** Importe aus der Zeit vor der Marke haben nur
     den grünen Haken hinterlassen, und mit der Marke als Bedingung
     stünden ihre Zeilen bei jedem weiteren Import auf Gelb, obwohl
     „Anwenden" keinen Betrag ändert. */
  const doneAt=(e,m)=>e.raw?!!paidAt(e.raw,m):(e.kk?!!kakDone(e.kk,m):false);
  const changes=(e,m)=>{
    const b=B.by[e.tid];
    if(!b||!b.cnt[m])return false;
    if(!doneAt(e,m))return true;
    return Math.round((b.months[m]-bookAt(e,m))*100)!==0;
  };
  /* **Von Hand zugeordnet heißt immer neu.** Der Grau-Vergleich
     („Anwenden ändert nichts") gilt nur den Zeilen, die die
     gemerkte Zuordnung von selbst wiedergefunden hat (fromMap) —
     wer in dieser Sitzung selbst zuordnet, hat gerade etwas getan
     und soll es gelb wiederfinden, auch wenn derselbe Betrag schon
     im Buch steht: sonst sieht die eigene Zuordnung aus, als wäre
     sie ins Leere gegangen. */
  const handRow=i=>!(W.rules[W.asg[i]]||{}).fromMap;
  const hasNew=e=>{
    const b=B.by[e.tid];
    if(!b)return false;
    if(b.rows.some(handRow))return true;
    for(let m=1;m<=12;m++)if(changes(e,m))return true;
    return false;
  };

  /* **Cyan heißt: dieser Posten trägt Einträge aus einem früheren
     Import** (imp-Marken bzw. flexSource). Der Posten selbst steht
     kräftig cyan, seine Daten darunter heller (css/components.css)
     — Gelb (dieser Lauf bringt Neues) und Orange (gewählt)
     gewinnen dagegen. Importe aus der Zeit vor den Marken haben
     keine und bleiben ungefärbt — mehr weiß die Datei nicht. */
  const imped=e=>{
    if(e.raw&&e.raw.imp)return e.raw.imp.some(Boolean);
    if(e.kk)return MONTHS.some((_,i)=>flexKind(e.kk,i+1)==='imp');
    return false;
  };
  /* **Was frühere Importe hinterlassen haben**, steht mit unter dem
     Posten — grau, denn es steht schon im Buch und diese Datei
     ändert daran nichts. Einzelne Buchungen sind davon nicht mehr
     übrig (ein Posten führt nur seine zwölf Monatsbeträge), also
     zeigt jede Zeile einen **Monat**. Was dieser Lauf ohnehin neu
     schreibt, bleibt hier weg: dort gilt der neue Wert. */
  /* **Mit den Buchungen, aus denen der Monat entstand**: reguläre
     Posten tragen sie seit 30.8.26 als it.impRows im Buch (siehe
     c2Apply), flexible Kategorien haben sie ohnehin in state.tx.
     Ältere Importe haben beides nicht — dann bleibt es bei der
     einen Monatszeile mit Summe und „aus einem früheren Import". */
  const prevLines=e=>{
    const b=B.by[e.tid],out=[];
    for(let m=1;m<=12;m++){
      if(b&&b.cnt[m])continue;
      if(!impAt(e,m))continue;
      let rows=null;
      if(e.raw&&e.raw.impRows&&e.raw.impRows[m]&&e.raw.impRows[m].length)
        rows=e.raw.impRows[m];
      else if(e.kk){
        const tx=state.tx.filter(x=>x.m===m&&x.main===e.kk);
        if(tx.length)rows=tx.map(x=>({d:x.d?x.d+'.'+m+'.':'',v:x.v,x:txText(x)}));
      }
      out.push({m:m,v:bookAt(e,m),rows:rows,
        once:e.raw?impOnceAt(e.raw,m):(e.kk?flexImpOnce(e.kk,m):false)});
    }
    return out;
  };
  const trow=(e,tint)=>{
    const has=B.by[e.tid]&&B.by[e.tid].rows.length>0;
    /* Wo etwas hängt — aus dieser Datei oder aus einem früheren
       Import —, steht links ein ☰ statt des früheren ✕: es gibt dort
       mehr als einen Weg (zurücksetzen, ändern, frühere Importe
       löschen), und ein Kreuz verspricht nur einen. */
    /* Das ☰ steht an **jedem** Posten, den es im Buch gibt — auch
       ohne Zuordnung: „Posten öffnen" gilt immer. Nur ein Ziel,
       das erst mit „Anwenden" entsteht („n:…") und an dem nichts
       hängt, hat kein Menü — es wäre leer. */
    /* Das ☰ ist **immer weiß** (30.8.26; einen Tag lang trug es die
       Farbe des Imports): es ist ein Handgriff und keine Herkunft —
       woher ein Monat kommt, sagen die Statuskreise in den Zellen. */
    const men=has||prevLines(e).length||e.tid.indexOf('n:')!==0;
    /* `open` sagt der Zeile, ob unter ihr ihre eigenen Zeilen
       stehen — daran hängt, ob sie unten eine kräftige Linie
       bekommt (siehe css/components.css). */
    const isOpen=!!W.open[e.tid]&&(has||prevLines(e).length>0);
    /* **Zugeordnet, aber nichts Neues** — dieselbe Aussage wie das
       Grau der Zeilen darunter: „hier ändert ‚Anwenden' nichts".
       Das trifft die Posten, die eine gemerkte Zuordnung gerade
       wiedergefunden hat, obwohl ihre Monate längst im Buch
       stehen. Gelb bliebe eine Ankündigung, die nicht eintritt. */
    const fresh=hasNew(e);
    return `<tr class="c2trow ${tint}${has&&!fresh?' old':''}${imped(e)?' imped':''}${fresh?' has':''}${isOpen?' open':''}${W.target===e.tid?' sel':''}" data-c2t="${esc(e.tid)}">
      <td class="mapc">${men?`<button class="c2rowmenu" data-c2menu="${esc(e.tid)}" title="${esc(t('c2.rowMenu'))}">&#9776;</button>`:''}</td>
      ${foldCell(e)}
      <td class="tn">${esc(e.name)}${e.isNew?`<i class="c2newtag">${t('c2.newTag')}</i>`:''}</td>`+
      monthCells(e)+'</tr>';
  };
  /* Die zugeordneten CSV-Zeilen landen weiß unter ihrem Ziel und
     laufen über die ganze Zeile: die Werte beginnen gleich hinter
     der ✕-Spalte und stehen in **denselben Spaltenbreiten wie die
     CSV unten** (c2ColW), in der Reihenfolge aus c2Order(). Der
     Inhalt liegt absolut in der aufgespannten Zelle, damit eine
     lange Beschreibung die Monatsspalten nicht auseinanderdrückt.
     Ein Klick öffnet die Regel der Zeile zum Anpassen. */
  /* Eine zugeordnete Zeile ist gebaut wie eine Zielzeile: ganz
     links dieselben beiden schmalen Spalten, dann **die Spalte des
     Ziels** — und darin Datum und Betrag, zusammen genau so breit
     wie der Name darüber. Beide kleben damit beim seitlichen Rollen
     an derselben Stelle wie die Zielspalte; alles Weitere aus der
     Datei steht rechts davon über den Monaten und rollt mit. Das
     sind die zwei Angaben, an denen man eine Buchung wiedererkennt
     — sie sollen stehen bleiben, wenn man nach Dezember rollt. */
  const SRCSPAN=12,SRCCAP=20;
  const srcOrd=c2Order();
  const srcRest=srcOrd.filter(c=>c!==W.f.date&&c!==W.f.amount);
  const srcLines=e=>{
    /* Aufgeklappt wird je Ziel und nur auf Wunsch (W.open) — sonst
       stünden unter jedem zugeordneten Posten zwanzig Zeilen, und
       die Liste der Ziele wäre nicht mehr zu überblicken.

       **Grau heißt: hier ändert „Anwenden" nichts.** Oben die
       früheren Importe, die diese Datei gar nicht berührt (je ein
       Monat), darunter die Zeilen der Datei selbst — und von denen
       ebenfalls grau, was nur einen Monat wiederbringt, der schon
       importiert im Buch steht. Gelb bleibt, was wirklich
       hineinkommt. Die Zeilen der Datei stehen dabei in ihrer
       eigenen Reihenfolge und werden nicht nach Farbe sortiert: man
       liest sie nach Datum, nicht nach Zustand. */
    if(!W.open[e.tid])return '';
    const b=B.by[e.tid];
    const line=(cls2,lead,inner,attr)=>`<tr class="c2src ${cls2}"${attr||''}><td class="mapc"></td><td class="foldc"></td>
      <td class="tn c2srclead"><div><b>↳</b>${lead}</div></td>
      <td colspan="${SRCSPAN}" class="c2srcline"><div>${inner}</div></td></tr>`;
    const lead=(a,v)=>`<span class="d">${a}</span><span class="v">${v}</span>`;
    let out='';
    prevLines(e).forEach(x=>{
      /* Liegen die Quellzeilen vor, stehen sie einzeln da — Datum,
         Betrag, Text wie bei den Zeilen dieser Datei; nur ohne sie
         bleibt die eine Monatszeile mit der Summe. */
      if(x.rows){
        x.rows.forEach(r2=>{
          /* Neuere Quellzeilen tragen ihre Referenzen (r), ältere
             einen zusammengesetzten Text (x) — siehe impRowText. */
          const tx2=impRowText(r2);
          out+=line('prev'+(x.once?' once':''),lead(esc(r2.d),eur(r2.v)),
            `<span title="${esc(tx2)}">${esc(tx2)}</span>`,
            ` title="${esc(t('c2.prevImpTip'))}"`);
        });
        return;
      }
      out+=line('prev'+(x.once?' once':''),lead(MONTHS[x.m-1],eur(x.v)),
        `<span>${esc(t('c2.prevImp'))}</span>`,` title="${esc(t('c2.prevImpTip'))}"`);
    });
    if(b&&b.rows.length){
      b.rows.slice(0,SRCCAP).forEach(i=>{
        const row=W.csv.rows[i];
        const md=W.meta[i].d,old=!handRow(i)&&!!md&&!changes(e,md.m);
        /* Rot sagt „einmalig", grau sagt „ändert nichts" — zwei
           verschiedene Aussagen, also beide zugleich möglich: eine
           graue Zeile in roter Schrift ist ein früher einmalig
           importierter Monat, den diese Datei noch einmal bringt. */
        const one=!!(W.rules[W.asg[i]]||{}).once;
        const cells=srcRest.map(c=>`<span title="${esc(row[c])}">${esc(row[c])}</span>`).join('');
        out+=line('cur'+(old?' old':'')+(one?' once':''),
          lead(esc(W.f.date>=0?row[W.f.date]:''),esc(W.f.amount>=0?row[W.f.amount]:'')),cells,
          ` data-c2ri="${W.asg[i]}" title="${t(old?'c2.rowTipOld':'c2.rowTip',esc(e.name))}"`);
      });
      if(b.rows.length>SRCCAP)
        out+=`<tr class="c2src cur c2srcmore"><td class="mapc"></td><td class="foldc"></td><td class="tn"></td><td colspan="${SRCSPAN}">${t('c2.srcMore',b.rows.length-SRCCAP)}</td></tr>`;
    }
    return out;
  };
  /* Die Summen der Block- und Kategoriezeilen rechnen über
     dieselben Werte wie die Zeilen darunter (eff): sonst nennte die
     Überschrift eine andere Zahl als ihre Posten. */
  const gsum=list=>sumOf(list.map(eff));
  const grow=(cls2,label)=>`<tr class="${cls2}"><td class="mapc"></td><td class="foldc"></td><td class="tn">${label}</td>`;
  let body='';
  if(W.kind==='reg'){
    const fresh=W.newT.filter(x=>x.group).map(x=>({tid:x.tid,name:x.name,group:x.group,
      bank:x.bank||'',pay:x.pay||'',due:x.due||'',end:null,amounts:Z(),income:x.income,isNew:true}));
    const all=state.fixed.map(i=>({tid:'i:'+i.id,name:i.name,group:i.group,
      bank:i.bank,pay:i.pay,due:i.dueDay,end:i.end,amounts:i.amounts,raw:i,
      income:isIncome(i),isNew:false})).concat(fresh);
    [[t('c2.blkIn'),'g-in','r-in',all.filter(e=>e.income)],
     [t('c2.blkOut'),'g-out','r-out',all.filter(e=>!e.income)]]
    .forEach(bl=>{
      const list=bl[3];
      if(!list.length)return;
      body+=grow('ghead '+bl[1],esc(bl[0]))+numCells(gsum(list))+'</tr>';
      const cats=[];
      list.forEach(e=>{if(!cats.includes(e.group))cats.push(e.group);});
      cats.forEach(c=>{
        const sub=list.filter(e=>e.group===c);
        if(cats.length>1)
          body+=grow('gcat '+bl[1],esc(keyLabel(c)))+numCells(gsum(sub))+'</tr>';
        sub.forEach(e=>{body+=trow(e,bl[2])+srcLines(e);});
      });
    });
  }else{
    const list=kakCats().map(k=>({tid:'k:'+k,name:k,kk:k,
      amounts:MONTHS.map((_,x)=>kakVal(k,x+1)),isNew:false}))
      .concat(W.newT.map(x=>({tid:x.tid,name:x.name,amounts:Z(),isNew:true})));
    if(list.length){
      body+=grow('ghead g-flex',esc(t('c2.blkFlex')))+numCells(gsum(list))+'</tr>';
      list.forEach(e=>{body+=trow(e,'r-flex')+srcLines(e);});
    }
  }
  if(!body)body=`<tr><td class="c2empty" colspan="15">${t('c2.emptyT',t('c2.newAssign'))}</td></tr>`;
  /* **Der Pfeil über der Pfeilspalte klappt alle.** Steht irgendwo
     einer offen, klappt er zu — ein Knopf, der immer aufklappt,
     ließe das Zuklappen als Weg über zwanzig einzelne Klicks
     übrig. Was er gerade tut, sagt seine Richtung, wie bei jedem
     Pfeil darunter. Gebaut wird er **nach** dem Rumpf: erst dann
     steht fest, was es zu klappen gibt. */
  function foldAllCell(){
    if(!openable.length)return `<span class="c2fold off">${C2_TRI}</span>`;
    const any=openable.some(tid=>W.open[tid]);
    return `<button class="c2fold${any?' open':''}" data-c2foldall="${any?'0':'1'}"
      aria-expanded="${any}" title="${esc(t(any?'c2.foldAllHide':'c2.foldAllShow',openable.length))}">${C2_TRI}</button>`;
  }
  /* **Keine Gesamtspalte**: hier wird zugeordnet, nicht bilanziert —
     die Jahressumme steht in der Jahresmatrix. Die Spalte nahm nur
     die Breite weg, die die zugeordneten Zeilen brauchen. */
  return `<table class="c2ttab">
    <thead><tr><th class="mapc"></th><th class="foldc">${foldAllCell()}</th><th class="tn">${t('c2.tgt')}</th>
      ${MONTHS.map((m,i)=>`<th class="num${cm(i+1)}">${i+1===CUR?`<span class="c2now">${m}</span>`:m}</th>`).join('')}</tr></thead>
    <tbody>${body}</tbody></table>`;
}

/* Die Spalten in Schritt 3, in der Reihenfolge der Felder: Datum,
   Betrag, Referenz 1 bis 4 — **nur die verknüpften** (5.9.26). Eine
   gewählte Spalte ohne Feld kommt nicht mit; c2GoStep3 wählt sie
   beim Weitergehen ab. */
function c2Order(){
  return C2_FIELDS.map(f=>W.f[f]).filter(i=>i>=0);
}
/* Die Breite einer CSV-Spalte — gemessen in Schritt 2; sie gilt in
   der CSV-Tabelle unten UND in den zugeordneten Zeilen oben. */
function c2ColW(i){return W.colw[i]||160;}

/* ── Wie breit jede Spalte in Schritt 3 steht ────────────────
   **Gemessen wird an einer unsichtbaren Kopie der Tabelle**, nicht
   an dem, was gerade auf dem Schirm steht. Zwei Gründe:

   * Die Tabelle in Schritt 2 füllt die Fläche (`min-width:100%`)
     und zeigt außerdem **alle** Spalten, auch die abgewählten. Ihre
     Spaltenbreiten sind daher eine Aussage über das Fenster, nicht
     über die Werte in den übernommenen Spalten.
   * Und bis 5.9.26 gab es **zwei Wege** nach Schritt 3: über den
     Knopf „Weiter" und über eine gemerkte Zuordnung, die Schritt 2
     übersprang. Auf dem zweiten Weg stand gar keine Tabelle da, an
     der sich etwas messen ließ — dort blieben alle Spalten auf dem
     Ersatzmaß von 160 px stehen. Genau das war zu sehen. Heute
     führt jeder Weg durch Schritt 2 (c2GoStep3); die Kopie bleibt
     trotzdem, denn die Tabelle dort zeigt weiter alle Spalten.

   Die Kopie trägt dieselben Klassen und damit dieselbe Schrift und
   dasselbe Polster; `table-layout:auto` lässt den Browser die
   Breiten aus dem Inhalt bestimmen, `max-width:340px` an `.c2tab td`
   deckelt sie. Gemessen wird über die ersten 400 Zeilen — was
   danach kommt, verschiebt das Bild nicht mehr.

   **Einmal und dann fest:** in Schritt 3 sind je nach Filter andere
   Zeilen zu sehen, und Spalten, die bei jedem Tastendruck ihre
   Breite änderten, wären nicht zu lesen. */
function c2MeasureCols(){
  W.colw={};W.colnat={};
  const ord=c2Order();
  if(!ord.length||!W.csv)return;
  const hold=document.createElement('div');
  hold.style.cssText='position:absolute;left:-99999px;top:0;visibility:hidden;width:99999px';
  const tb=document.createElement('table');
  tb.className='c2tab c2csvtab';
  tb.style.cssText='table-layout:auto;width:max-content;min-width:0';
  const rows=W.csv.rows,cap=Math.min(rows.length,400);
  let h='<thead><tr>'+ord.map(i=>`<th>${esc(W.csv.header[i]||'')}</th>`).join('')+'</tr></thead><tbody>';
  for(let r=0;r<cap;r++)
    h+='<tr>'+ord.map(i=>`<td>${esc(rows[r][i]||'')}</td>`).join('')+'</tr>';
  tb.innerHTML=h+'</tbody>';
  hold.appendChild(tb);document.body.appendChild(hold);
  const ths=tb.querySelectorAll('thead th');
  ord.forEach((i,k)=>{
    if(!ths[k])return;
    /* Neben dem gedeckelten Maß bleibt das **natürliche** stehen
       (colnat): daran liest c2FitCols(), wie breit eine Spalte sein
       wollte — der Deckel weiß das nicht mehr. */
    const nat=Math.max(90,Math.ceil(ths[k].getBoundingClientRect().width));
    W.colnat[i]=nat;
    W.colw[i]=Math.min(340,nat);
  });
  hold.remove();
}

/* ── Die Spalten füllen das Fenster — genau das Fenster ──────
   **Alle in Schritt 2 gewählten Spalten stehen im Bild**, ohne
   seitliches Rollen; die Fläche wird dafür in beide Richtungen
   eingepasst:

   * Ist Platz übrig, bekommen ihn die Spalten, die mehr wollten
     (colnat über dem gedeckelten colw) — anteilig nach dem, was
     ihnen fehlt, und keine mehr als ihr natürliches Maß.
   * Ist es zu breit, werden dieselben Spalten gestaucht —
     anteilig nach dem, was sie hergeben können, keine unter
     90 px; der Inhalt bricht dann um (white-space:normal steht
     an den Zellen ohnehin). Erst wenn alle am Boden sind, rollt
     die Fläche wieder.

   **Datum und Betrag bleiben in beiden Richtungen außen vor**:
   ihre Werte sind kurz und gleichförmig, eine breite Datumsspalte
   liest sich nicht, eine umgebrochene ist keine.
   Geschrieben wird in die colgroup der Tabelle, nicht in W.colw:
   das gemessene Maß bleibt die Wahrheit, die Verteilung ist eine
   Antwort auf die gerade verfügbare Fläche und rechnet sich bei
   jedem Zeichnen und jeder Fenstergröße neu (resize-Handler in
   openCsvWizard). */
function c2FitCols(){
  if(!W||!W.box)return;
  const wrap=W.box.querySelector('.c2bot .c2scroll');
  const tb=wrap?wrap.querySelector('table.c2csvtab'):null;
  if(!tb||!wrap.clientWidth)return;
  const ord=c2Order();
  const w={};ord.forEach(i=>{w[i]=c2ColW(i);});
  const flex=ord.filter(i=>i!==W.f.date&&i!==W.f.amount);
  const avail=wrap.clientWidth-(W.once?C2_PICKW:0);
  const base=ord.reduce((a,i)=>a+w[i],0);
  if(base<avail){
    const need={};let total=0;
    flex.forEach(i=>{need[i]=Math.max(0,(W.colnat[i]||w[i])-w[i]);total+=need[i];});
    if(total>0){
      const grant=Math.min(avail-base,total);
      flex.forEach(i=>{w[i]+=Math.floor(grant*need[i]/total);});
    }
  }else if(base>avail){
    const MIN=90;
    const give={};let total=0;
    flex.forEach(i=>{give[i]=Math.max(0,w[i]-MIN);total+=give[i];});
    if(total>0){
      const cut=Math.min(base-avail,total);
      /* Aufgerundet und am Boden festgeklemmt: abgerundet bliebe je
         Spalte bis zu ein Pixel stehen, und die Summe stünde um
         diese Pixel über — ein Rollbalken für nichts. */
      flex.forEach(i=>{w[i]=Math.max(MIN,w[i]-Math.ceil(cut*give[i]/total));});
    }
  }
  const cols=tb.querySelectorAll('colgroup col');
  let ci=W.once?1:0;
  ord.forEach(i=>{if(cols[ci])cols[ci].style.width=w[i]+'px';ci++;});
  tb.style.width=(ord.reduce((a,i)=>a+w[i],0)+(W.once?C2_PICKW:0))+'px';
}

/* **Welche Zeilen stehen gerade in der CSV-Tabelle?** Die Frage
   stellen zwei: die Tabelle selbst und die einmalige Zuordnung, die
   nur das übernehmen darf, was man auch sieht. Zwei getrennte
   Rechnungen liefen auseinander, und dann übernähme der Knopf eine
   Zeile, die der Filter längst weggenommen hat. */
function c2Visible(){
  const terms=c2LiveTerms(),out=[];
  for(let i=0;i<W.csv.rows.length;i++){
    const ri=W.asg[i];
    if(ri>=0&&!(W.editRule!=null&&ri===W.editRule))continue;
    if(!c2Match(W.csv.rows[i],terms))continue;
    out.push(i);
  }
  return out;
}
/* Markiert **und** sichtbar — das ist die Auswahl, mit der die
   einmalige Zuordnung arbeitet. Wer markiert und danach den Filter
   enger zieht, hat die verschwundenen Zeilen damit abgewählt. */
function c2Picked(){
  return c2Visible().filter(i=>W.pick[i]&&W.meta[i].in&&W.asg[i]<0);
}

function c2CsvBody(){
  const ord=c2Order();
  const vis=c2Visible();
  let out='',shown=0,hidden=0;
  for(const i of vis){
    const row=W.csv.rows[i];
    const ri=W.asg[i];
    if(shown>=500){hidden++;continue;}
    shown++;
    const cls=!W.meta[i].in?'off':(ri>=0?'done':'');
    const tn=ri>=0?W.rules[ri].t.name:'';
    const tip=c=>ri>=0?esc(t('c2.rowTip',tn)+'\n'+row[c]):esc(row[c]);
    /* Im Markier-Modus steht vorn ein Kästchen — aber nur an
       Zeilen, die überhaupt zugeordnet werden können: eine schon
       zugeordnete oder eine außerhalb des Jahres wäre ein Angebot,
       das der Knopf danach nicht einlöst. */
    const can=W.meta[i].in&&ri<0;
    const box=W.once?`<td class="c2pk">${can
      ?`<input type="checkbox" data-c2pick="${i}"${W.pick[i]?' checked':''}>`:''}</td>`:'';
    /* **Die letzte Zelle ist leer und hat kein Maß.** Die Tabelle
       ist so breit wie die Summe ihrer Spalten; ist das weniger
       als die Fläche, streckte `min-width:100%` sonst jede Spalte
       anteilig — und die Breiten aus Schritt 2 wären wieder dahin.
       Die Füllspalte nimmt den Rest und lässt die anderen in Ruhe. */
    out+=`<tr class="${cls}${W.once&&W.pick[i]&&can?' picked':''}" data-c2i="${i}"${ri>=0?` data-c2ri="${ri}"`:''}>`+box+
      ord.map(c=>`<td data-c2f="${c2FieldOf(c)}" title="${tip(c)}">${esc(row[c])}</td>`).join('')+'<td class="c2fill"></td></tr>';
  }
  const span=W.cols.length+(W.once?1:0)+1;
  if(hidden)out+=`<tr class="morerow"><td colspan="${span}">${t('c2.more',hidden)}</td></tr>`;
  if(!out)out=`<tr class="morerow"><td colspan="${span}">${t('c2.noneFound')}</td></tr>`;
  return out;
}

function c2RefreshAssign(){
  const body=W.box.querySelector('#c2Body');
  if(body)body.innerHTML=c2CsvBody();
  /* **Erst mit gefüllten Zeilen messen**: ob die Fläche einen
     senkrechten Rollbalken braucht, steht erst jetzt fest — vorher
     gemessen fehlte seine Breite, und die Tabelle stand um genau
     dieses Maß über (waagerechter Rollbalken aus dem Nichts). */
  c2FitCols();
  const btn1=W.box.querySelector('#c2Once');
  /* **Der Modus-Knopf ist immer zu haben.** Er hängt an keinem
     Filter und an keinem Ziel — er schaltet nur die Markierspalte
     ein; gewählt und übernommen wird danach. Wäre er gesperrt,
     solange kein Filter steht, käme man an ihn gerade dann nicht
     heran, wenn man ihn braucht: beim Zuordnen ohne Filter. */
  /* **Die Beschriftung wechselt nicht mit.** Der Knopf heißt immer,
     was er tut; ob der Modus läuft, sagt allein die Hervorhebung
     (aria-pressed) — wie bei den beiden Ausblenden-Knöpfen der
     Jahresansicht. */
  if(btn1){
    btn1.textContent=t('c2.assignOnce');
    btn1.disabled=false;
    btn1.setAttribute('aria-pressed',W.once?'true':'false');
  }
  c2RefreshBtns();
  c2RefreshHead();
}

/* **Die beiden Zuordnen-Knöpfe neben dem ☰** — der erste wechselt
   seine Beschriftung mit dem Modus (er tut ja je Modus etwas
   anderes: merken oder einmalig), der zweite legt ein neues Ziel
   an und geht in beiden. In Klammern steht, wie viele Zeilen es
   träfe; gesperrt sagt die Sprechblase, was noch fehlt. Der
   frühere Auskunftstext an dieser Stelle (#c2Tgt/#c2Hit) ist
   weg — was gewählt ist, zeigt die orange Zeile oben, was der
   Filter trifft, sagen die Knöpfe selbst.
   Eine eigene Funktion, weil auch das Markieren im Einmal-Modus
   sie nachführen muss — dort wird kein tbody neu gebaut. */
function c2RefreshBtns(){
  const bGo=W.box.querySelector('#c2Do'),bNew=W.box.querySelector('#c2New');
  if(!bGo)return;
  const h=c2Hits(),on=c2LiveTerms().length>0,edit=W.editRule!=null;
  const n=h.free.length+(edit?h.own.length:0);
  const np=c2Picked().length;
  const canFlt=!W.once&&on&&n>0&&!!W.target;
  const canPick=W.once&&np>0&&!!W.target;
  const can=W.once?canPick:canFlt,cnt=W.once?np:n;
  bGo.textContent=(W.once?t('c2.assignPick'):(edit?t('c2.adjust'):t('c2.doAssign')))
    +(can?` (${cnt})`:'');
  bGo.disabled=!can;
  /* Sobald alles beisammen ist — ein gewähltes Ziel und Zeilen,
     die der Filter trifft oder die markiert sind —, leuchtet der
     Knopf orange wie der gedrückte Modus-Knopf rechts: er ist
     dann der nächste Handgriff. */
  bGo.classList.toggle('ready',can);
  bGo.title=can?(W.once?t('c2.pickHowTip'):t('c2.assignTip'))
    :(!W.target&&cnt>0?t('c2.tNoTarget',t('c2.newAssign')):t('c2.mnNoSel'));
  /* **„Neu anlegen und zuordnen" ist nie gesperrt.** Ein neues
     Ziel lässt sich immer anlegen — was gerade markiert oder
     gefiltert ist, geht danach gleich an es; ist nichts gewählt,
     entsteht eben nur der Posten. Ein gesperrter Knopf stünde
     genau dann im Weg, wenn man mit dem neuen Ziel anfangen
     will. */
  bNew.textContent=t('c2.newAssign')+(cnt>0?` (${cnt})`:'');
  bNew.disabled=false;
  bNew.title=t('c2.newAssignTip');
}

/* Eine angeheftete Filterzeile: links das Kreuz, das sie löscht,
   daneben zwei Zeilen — oben die Vergleichsart, darunter der
   Wert. Ein Spalten-Chip steht in seiner Spalte und braucht deren
   Namen nicht; nur der Schnellfilter-Chip nennt „alle Spalten". */
/* **Ein Doppelklick holt die Zeile zurück ins Feld** (5.9.26): der
   Wert steht dann markiert im Filterfeld seiner Spalte, die
   Vergleichsart ist gesetzt, die Zeile ist weg — anpassen, Enter,
   wieder angeheftet. Vorher musste man die Zeile löschen und den
   Wert neu tippen. Das ✕ bleibt daneben der Weg, sie nur
   loszuwerden. Verdrahtet in c2Wire über data-c2chip. */
function c2ChipHtml(ix,tm){
  const col=c2FieldLabel(tm.f);
  const op=(tm.f==='q'?esc(col)+' · ':'')+esc(c2OpShort(tm.op));
  return `<span class="c2fchip" data-c2chip="${ix}" title="${esc(col+' · '+c2OpLabel(tm.op)+': '+tm.val+'\n'+t('c2.chipEditTip'))}"><button class="c2fcx" data-c2cx="${ix}" title="${t('c2.chipDel')}">✕</button><span class="c2fbody"><i>${op}</i><b>${esc(tm.val)}</b></span></span>`;
}

function c2Step3(){
  /* „Je Hauptkategorie automatisch" stand hier bis 5.9.26 für die
     flexiblen Kosten: je Wert der Hauptkategorie-Spalte eine Regel.
     Mit den sechs Importfeldern (C2_FIELDS) gibt es diese Spalte nicht
     mehr — zugeordnet wird für beide Arten allein über
     Filterkriterien, und ein Knopf, der an einem Feld hing, das es
     nicht mehr gibt, ist heraus. */
  const ord=c2Order(),wOf=c2ColW;
  /* **Im Markier-Modus wird nicht gefiltert.** Die Felder stehen
     gesperrt da statt zu verschwinden — die Spalte behielte sonst
     ihren Kopf und verlöre ihre Zeile, und die Tabelle spränge bei
     jedem Umschalten. Ihre ☰-Menüs sind weg: ein Menü, das nichts
     einstellen kann, ist keins. Der Schnellfilter oben bleibt: er
     ist der Weg, die Auswahl einzugrenzen, bevor man markiert. */
  /* **Filter, Filterzeilen und Zellen sprechen vom Feld**, nicht von
     der Spalte (5.9.26): der Schlüssel ist 'date', 'amount' oder
     'ref1'…'ref4' — genau das, was eine gemerkte Regel später sagt.
     Jede Spalte in Schritt 3 trägt ein Feld (c2Order). */
  const fltCell=i=>{
    const f=c2FieldOf(i),op=W.fltOp[f]||'has';
    return `<th><div class="c2fwrap"><input data-c2flt="${f}" class="${String(W.flt[f]||'').trim()?'on':''}" value="${esc(W.flt[f]||'')}"${W.once?` disabled title="${esc(t('c2.fltOff'))}"`:` title="${t('c2.fltTip')}"`}>
      ${W.once?'':`<button class="c2fmenu${op!=='has'?' on':''}" data-c2fmenu="${f}" title="${esc(c2OpLabel(op))}">☰</button>`}</div></th>`;
  };
  /* Die angehefteten Spaltenfilter stehen UNTER der Filterzeile,
     und zwar jeder **in seiner Spalte** — dort, wo er filtert.
     Die Zeile klebt mit; ihr top misst c2Wire() nach. Die Chips
     des Schnellfilters stehen bei dessen Feld (c2qbar). */
  const colChips=i=>{const f=c2FieldOf(i);return W.chips.map((tm,ix)=>tm.f===f?c2ChipHtml(ix,tm):'').join('');};
  /* Der Kopf der Markierspalte wählt alles **Sichtbare** an oder
     ab — dieselbe Auswahl, mit der der Knopf danach arbeitet. */
  const vis=W.once?c2Visible().filter(i=>W.meta[i].in&&W.asg[i]<0):[];
  const allOn=vis.length>0&&vis.every(i=>W.pick[i]);
  const pickHead=W.once?`<th class="c2pk"><input type="checkbox" data-c2pickall="${allOn?'0':'1'}"${allOn?' checked':''}
    title="${esc(t(allOn?'c2.pickNone':'c2.pickAll',vis.length))}"></th>`:'';
  const chipRow=W.chips.some(tm=>tm.f!=='q')
    ?`<tr class="c2chiprow">${W.once?'<th class="c2pk"></th>':''}${ord.map(i=>{
        const c=colChips(i);
        return `<th>${c?`<div class="c2fchips">${c}</div>`:''}</th>`;
      }).join('')}<th class="c2fill"></th></tr>`:'';
  const qchips=W.chips.map((tm,ix)=>tm.f==='q'?c2ChipHtml(ix,tm):'').join('');
  /* **Der Spaltenkopf nennt das Feld, darunter klein die Spalte der
     Datei** (5.9.26): die Kriterien beziehen sich auf das Feld, und
     so steht der Name, den eine Regel später trägt, direkt über
     dem Filter. */
  const colHead=i=>`<th title="${esc(W.csv.header[i])}"><span class="c2fh">${esc(c2FieldLabel(c2FieldOf(i)))}<small>${esc(W.csv.header[i])}</small></span></th>`;
  /* **Die gemerkte Zuordnung steht als schwarzer Knopf links vor
     dem Modus-Knopf** (5.9.26; bis dahin orange in der Kopfzeile
     neben „Zurück"): sie gehört zur Leiste, in der zugeordnet wird,
     nicht zu den Knöpfen, die durch den Wizard führen. Schwarz,
     weil er der erste Griff im dritten Schritt ist. Er ordnet
     **nichts von selbst** zu — er öffnet das Fenster, in dem man
     die Posten wählt (c2MapPick). Grau und gesperrt steht er da,
     wenn alles angewendet ist: dass er einmal gedrückt wurde, ist
     die Auskunft, wegen der man ihn sucht. Ohne gemerkte Zuordnung
     gibt es ihn nicht. */
  let auto='';
  if(W.mapRules&&W.mapRules.length)
    auto=`<button class="btn primary" data-c2="autoMap" title="${esc(t('c2.autoMapTip',W.mapRules.length))}">${t('c2.autoMap')}</button>`;
  else if(W.autoDone)
    auto=`<button class="btn" data-c2="autoMap" disabled title="${esc(t('c2.autoMapDone'))}">${t('c2.autoMap')}</button>`;
  /* **Zwischen den Flächen liegt ein Griff** (5.9.26, .c2split):
     Ziehen verschiebt die Teilung, ein Doppelklick stellt halb/halb
     wieder her. Der Anteil steht in W.split und wird als flex-grow
     an beide Hälften geschrieben — beim nächsten Öffnen gilt wieder
     halb/halb (openCsvWizard). */
  const s=W.split;
  return `<div class="c2half c2top" style="flex:${s} 1 0"><div class="c2scroll">${c2TopTable()}</div></div>
    <div class="c2split" title="${esc(t('c2.splitTip'))}"></div>
    <div class="c2mid">
      <div class="c2row">
        <button class="btn c2burger" id="c2Menu"
          title="${esc(t('c2.menuTip'))}" aria-label="${esc(t('c2.menuTip'))}">&#9776;</button>
        <!-- **Der Modus-Knopf steht zwischen ☰ und „Zuordnen"**
             (5.9.26; vorher ganz rechts): er entscheidet, was der
             Knopf daneben tut — merken oder einmalig —, und gehört
             deshalb unmittelbar davor. Weiß in Ruhe, schwarz,
             solange der Modus läuft (.onceb in css/components.css). -->
        <button class="btn onceb" id="c2Once" data-c2="assignOnce" aria-pressed="false"
          title="${esc(t('c2.assignOnceTip'))}">${t('c2.assignOnce')}</button>
        <button class="btn c2go" id="c2Do" data-c2="goAssign"></button>
        <button class="btn" id="c2New" data-c2="newTAssign"></button>
        <span class="c2spacer"></span>
        ${auto}
      </div>
    </div>
    <div class="c2half c2bot" style="flex:${1-s} 1 0"><div class="c2botwrap">
      <div class="c2qbar">
        <input id="c2Q" class="c2q${String(W.q||'').trim()?' on':''}" value="${esc(W.q||'')}"
          placeholder="${t('c2.q')}" title="${t('c2.qTip')}">
        ${qchips?`<div class="c2fchips c2qchips">${qchips}</div>`:''}
      </div>
      <!-- tabindex: Escape gibt der Fläche den Fokus (c2Esc), und
           mit ihm rollen die Pfeiltasten die CSV. -->
      <div class="c2scroll" tabindex="-1">
      <table class="c2tab c2csvtab" style="width:${ord.reduce((a,i)=>a+wOf(i),0)+(W.once?C2_PICKW:0)}px">
        <colgroup>${W.once?`<col style="width:${C2_PICKW}px">`:''}${ord.map(i=>`<col style="width:${wOf(i)}px">`).join('')}<col></colgroup>
        <thead>
          <tr>${pickHead}${ord.map(colHead).join('')}<th class="c2fill"></th></tr>
          <tr class="c2fltrow">${W.once?'<th class="c2pk"></th>':''}${ord.map(fltCell).join('')}<th class="c2fill"></th></tr>
          ${chipRow}
        </thead>
        <tbody id="c2Body"></tbody>
      </table>
      </div>
    </div></div>`;
}

/* Eine bestehende Zuordnung zum Anpassen laden — ihr Filter
   steht danach als Filterzeilen über den Feldern. */
function c2EditRule(ri){
  const r=W.rules[ri];
  if(!r)return;
  /* Eine Handauswahl hat keine Bedingungen, die man anpassen
     könnte — sie ist eine Liste von Zeilen. Wer sie loswerden
     will, löst sie über das ☰ links am Ziel. */
  if(r.pick){warn(t('c2.pickNoEdit'));return;}
  W.editRule=ri;W.target=r.t.tid;
  W.chips=r.terms.map(tm=>({f:tm.f,op:tm.op,val:tm.val}));
  W.flt={};W.q='';
  c2Render();
}

/* Enter im Filterfeld: der Eintrag wird zur Filterzeile unter der
   Filterleiste, das Feld leert sich, gefiltert wird ab jetzt mit
   den Zeilen. ci -1 ist der Schnellfilter; das Anwenden eines
   Spaltenfilters leert auch dessen Feld. */
function c2Pin(ci,raw){
  let v=String(raw||'').trim();
  if(!v)return;
  let op=ci==='q'?'has':(W.fltOp[ci]||'has');
  if(v[0]==='='){op='is';v=v.slice(1).trim();if(!v)return;}
  W.chips.push({f:ci,op:op,val:v});
  /* Geleert wird nur das Feld, dessen Wert gerade zur Filterzeile
     wurde: der Schnellfilter beim Schnellfilter, das Spaltenfeld
     bei einer Spalte. Ein Spaltenfilter nimmt dem Schnellfilter
     nichts weg — beide grenzen zusammen ein (seit 30.8.26; vorher
     leerte jedes Anheften auch den Schnellfilter). */
  if(ci==='q')W.q='';
  else delete W.flt[ci];
  c2Render();
  /* **Die Schreibmarke bleibt, wo sie war.** Ein angehefteter
     Filter ist selten der letzte: man engt weiter ein, und der
     nächste Wert gehört meistens in dieselbe Spalte. `c2Render()`
     baut die Felder neu, der Fokus wäre danach beim Körper —
     deshalb wird er hier gesetzt. Zurückgenommen wird die
     Filterung mit Escape. */
  const el=W.box.querySelector(ci==='q'?'#c2Q':`[data-c2flt="${ci}"]`);
  if(el)el.focus();
}

/* Das ☰-Menü am Filterfeld: wie diese Spalte vergleicht. Es hängt
   am Fenster, nicht in der Zelle — die Zellen des Tabellenkopfs
   schneiden ab (overflow), und dort verschwände es im
   Zeilenbereich. Fest positioniert bleibt es ganz sichtbar. */
function c2FltMenu(btn,ci){
  const old=W.modal.querySelector('.c2fpop');
  const again=old&&old.dataset.ci===String(ci);
  if(old)old.remove();
  if(again)return;
  const pop=document.createElement('div');
  pop.className='c2fpop';pop.dataset.ci=ci;
  const cur=W.fltOp[ci]||'has';
  pop.innerHTML=C2_OPS.map(o=>
    `<button data-op="${o}" class="${cur===o?'on':''}">${esc(c2OpLabel(o))}</button>`).join('');
  W.modal.appendChild(pop);
  const r=btn.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
  pop.style.left=Math.max(8,Math.min(r.right-w,innerWidth-w-8))+'px';
  pop.style.top=(r.bottom+3+h>innerHeight?Math.max(8,r.top-3-h):r.bottom+3)+'px';
  const close=()=>{
    pop.remove();
    document.removeEventListener('click',away,true);
    document.removeEventListener('scroll',away,true);
  };
  /* **Der Knopf selbst gehört nicht zum „daneben".** Sonst schlösse
     dieser Wächter das Menü, und der Klick auf denselben Knopf
     öffnete es unmittelbar danach wieder — ein zweiter Klick täte
     dann gar nichts. So sieht ihn nur `again` oben, und der zweite
     Klick schließt. */
  const away=e2=>{if(!pop.contains(e2.target)&&!btn.contains(e2.target))close();};
  pop.querySelectorAll('button').forEach(b=>{
    b.onclick=e=>{
      e.stopPropagation();
      W.fltOp[ci]=b.dataset.op;
      btn.classList.toggle('on',b.dataset.op!=='has');
      btn.title=c2OpLabel(b.dataset.op);
      close();
      c2RefreshAssign();
      /* Nach der Wahl steht die Schreibmarke im Feld daneben: die
         Vergleichsart wählt man, um gleich danach zu tippen — und
         mit Enter ist der Filter angeheftet. Was schon darin steht,
         ist markiert, wie beim Klick in eine Zelle. */
      const inp=W.box.querySelector(`[data-c2flt="${ci}"]`);
      if(inp){inp.focus();inp.select();}
    };
  });
  setTimeout(()=>{
    document.addEventListener('click',away,true);
    document.addEventListener('scroll',away,true);
  },0);
}

/* ── Das ☰ an einer Ziel-Zeile ────────────────────────────────
   Drei Wege, und sie betreffen zweierlei: die Zuordnung **dieser**
   Datei (zurücksetzen, ändern) und das, was **frühere** Importe ins
   Buch geschrieben haben (löschen). Deshalb ein Menü und kein
   Kreuz: ein Kreuz verspricht genau eine Wirkung.

   Gelöscht wird nur nach Rückfrage, und die nennt die Zahl der
   Monate — es ist der einzige Weg hier, der das Buch anfasst. */
/* ── Zuordnen und merken ─────────────────────────────────────
   Der Weg aus dem Filter: was die Bedingungen gerade treffen,
   bekommt eine Regel — und die wandert beim Anwenden in die Datei.
   Erreicht wird er über den Knopf #c2Do in der Leiste
   (c2RefreshBtns beschriftet ihn je Modus). */
function c2DoAssign(){
      if(!W.target){warn(t('c2.tNoTarget',t('c2.newAssign')));return;}
      const terms=c2LiveTerms();
      if(!terms.length){warn(t('c2.tNoFlt'));return;}
      const h=c2Hits(),edit=W.editRule!=null;
      if(!h.free.length&&!(edit&&h.own.length)){
        warn(edit?t('c2.tNoHitEdit'):t('c2.tNoHit'));return;
      }
      const x=c2Find(W.target);
      /* Vor dem Neuzeichnen: wo die Zeilen gerade stehen — sie
         fliegen gleich sichtbar unter ihr Ziel. */
      const mv={};
      h.free.concat(edit?h.own:[]).forEach(i=>{mv[i]=1;});
      const flights=[];
      const tbEl=W.box.querySelector('#c2Body');
      if(tbEl&&!matchMedia('(prefers-reduced-motion: reduce)').matches)
        tbEl.querySelectorAll('tr[data-c2i]').forEach(tr=>{
          if(flights.length>=6||!mv[+tr.dataset.c2i])return;
          const r=tr.getBoundingClientRect();
          if(r.bottom<0||r.top>innerHeight)return;
          flights.push({r:r,text:tr.textContent.trim().replace(/\s+/g,' ').slice(0,90)});
        });
      let ri;
      if(edit){ri=W.editRule;W.rules[ri]={terms:terms,t:x};}
      else{W.rules.push({terms:terms,t:x});ri=W.rules.length-1;}
      c2ApplyRules();
      const n=W.asg.filter(v=>v===ri).length;
      /* Danach ist der Tisch wieder frei: Filter leer, kein Ziel
         mehr schwarz — der nächste Posten fängt bei null an. */
      W.flt={};W.fltOp={};W.chips=[];W.q='';W.editRule=null;W.target='';
      c2Render();
      c2Fly(flights,x.tid);
      toast(edit?t('c2.tAdjusted',n,x.name):t('c2.tAssigned',n,x.name));
}

/* ── Das Menü links in der Leiste ────────────────────────────
   Zwei Wege rund um die Filter (seit 30.8.26; die Zuordnen-
   Einträge sind heraus — sie standen als dieselben zwei Knöpfe
   ohnehin daneben und waren im Menü nur ein zweiter Weg):

   * **Filter zurücknehmen** — der Knopf, der bis dahin rechts in
     der Leiste stand; er ist ein Aufräum-Handgriff und kein
     Arbeitsschritt, deshalb wohnt er jetzt hinter dem ☰.
   * **Alle gemerkten Importkriterien zeigen** — das Fenster mit
     den Regeln aller Posten der gewählten Art (openImpRules): je
     Regel ein Block mit Posten und Bedingungen. Hat noch kein
     Posten welche, sagt es eine Kurzmeldung.

   Gebaut wie das Zeilenmenü darüber (c2RowMenu): dieselbe
   Sprechblase, dieselbe Art zu schließen. */
function c2ClearFlt(){W.flt={};W.fltOp={};W.chips=[];W.q='';W.editRule=null;c2Render();}
function c2AssignMenu(btn){
  const old=W.modal.querySelector('.c2fpop');
  const again=old&&old.dataset.tid==='assign';
  if(old)old.remove();
  if(again)return;
  const item=(act,lab,tip)=>`<button data-do="${act}" title="${esc(tip)}">${esc(lab)}</button>`;
  const pop=document.createElement('div');
  pop.className='c2fpop c2amenu';pop.dataset.tid='assign';
  pop.innerHTML=
    item('clearFlt',t('c2.clearFlt'),t('c2.clearFlt'))+
    item('crit',t('c2.mnCrit'),t('c2.mnCritTip'));
  W.modal.appendChild(pop);
  const r=btn.getBoundingClientRect(),w=pop.offsetWidth,hh=pop.offsetHeight;
  pop.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';
  pop.style.top=(r.bottom+3+hh>innerHeight?Math.max(8,r.top-3-hh):r.bottom+3)+'px';
  const close=()=>{
    pop.remove();
    document.removeEventListener('click',away,true);
    document.removeEventListener('scroll',away,true);
  };
  const away=e2=>{if(!pop.contains(e2.target)&&!btn.contains(e2.target))close();};
  pop.querySelectorAll('button').forEach(b=>{
    b.onclick=e=>{
      e.stopPropagation();
      close();
      if(b.dataset.do==='clearFlt'){c2ClearFlt();return;}
      /* Die Kriterien stehen an den Posten (impRules) — gezeigt wird,
         was der nächste Import dieser Art von selbst anwendet. */
      openImpRules(W.kind);
    };
  });
  setTimeout(()=>{
    document.addEventListener('click',away,true);
    document.addEventListener('scroll',away,true);
  },0);
}

/* ── Die gemerkten Importkriterien eines Ziels ─────────────────
   (5.9.26) Seit die Kriterien am Posten wohnen (it.impRules bzw.
   state.kak[k].impRules, siehe C2_REFS oben), liest der Wizard sie
   dort: c2LoadMapRules holt beim Eintritt in Schritt 3 die Regeln
   **aller** Posten der gewählten Art als Angebot (W.mapRules, mit
   fromMap und dem Rückverweis book auf die Regel im Buch);
   c2MapRulesFor liefert sie für ein einzelnes Ziel (Eintrag
   „CSV-Daten nach gespeicherten Importkriterien zuordnen" im ☰ der
   Zielzeile). Was schon in W.rules steht, kommt nicht noch einmal —
   verglichen wird über Ziel und Bedingungen (c2RuleKey). Eine
   Datei-Art spielt dabei keine Rolle mehr: die Bedingungen nennen
   Felder, und die trägt jede Datei, deren Struktur sie verknüpft. */
const c2RuleKey=r=>String(r.t&&r.t.tid)+'|'+JSON.stringify((r.terms||[]).map(tm=>[String(tm.f),tm.op,String(tm.val)]));

/* Ein Ziel im Buch wiederfinden — über den **Namen**. Wer beim
   Import ein Ziel anlegt, führt es bis „Fertig" als „n:Name";
   danach ist es ein Posten oder eine Kategorie mit diesem Namen. */
function c2BookByName(nm){
  const qn=String(nm||'').trim().toLowerCase();
  if(W.kind==='flex'){
    const k=kakCats().find(n=>n.trim().toLowerCase()===qn);
    return k?{tid:'k:'+k,name:k,income:false}:null;
  }
  const it=state.fixed.find(x=>x.name.trim().toLowerCase()===qn);
  return it?{tid:'i:'+it.id,name:it.name,income:isIncome(it)}:null;
}

function c2LoadMapRules(){
  const have=new Set(W.rules.map(c2RuleKey));
  const list=[];
  const add=(host,tgt)=>{
    (host.impRules||[]).forEach(r=>{
      const terms=c2CleanTerms(r&&r.terms);
      if(!terms.length)return;
      const fresh={terms:terms,t:tgt,fromMap:true,book:r};
      if(!have.has(c2RuleKey(fresh)))list.push(fresh);
    });
  };
  if(W.kind==='flex')kakCats().forEach(k=>{if(state.kak[k])add(state.kak[k],{tid:'k:'+k,name:k,income:false});});
  else state.fixed.forEach(it=>add(it,{tid:'i:'+it.id,name:it.name,income:isIncome(it)}));
  W.mapRules=list.length?list:null;
  if(list.length)W.autoDone=false;
}

function c2MapRulesFor(tid){
  const host=c2Host(tid),x=c2Find(tid);
  if(!host||!x)return [];
  const have=new Set(W.rules.map(c2RuleKey));
  const out=[];
  (host.impRules||[]).forEach(r=>{
    const terms=c2CleanTerms(r&&r.terms);
    if(!terms.length)return;
    const fresh={terms:terms,t:{tid:x.tid,name:x.name,income:!!x.income},fromMap:true,book:r};
    if(!have.has(c2RuleKey(fresh)))out.push(fresh);
  });
  return out;
}

function c2RowMenu(btn,tid){
  const old=W.modal.querySelector('.c2fpop');
  const again=old&&old.dataset.tid===tid;
  if(old)old.remove();
  if(again)return;
  const x=c2Find(tid);
  const ri=W.rules.findIndex(r=>r.t.tid===tid);
  /* **„CSV-Daten nach gespeicherten Importkriterien zuordnen"**
     (5.9.26): hat die gemerkte Zuordnung dieser Datei-Art Regeln
     für genau dieses Ziel, steht hier der Weg, sie **für diesen
     einen Posten** anzuwenden — ohne das Wahl-Fenster über alle
     (c2MapPick). In Rot, damit man ihn findet: er ist der Grund,
     das Menü an einem Posten mit gemerkten Kriterien zu öffnen.
     Dahinter steht, wie viele freie Zeilen die Regeln gerade
     träfen; treffen sie keine, ist der Eintrag grau. Was schon in
     W.rules steht, wird nicht noch einmal angeboten. */
  const critRules=c2MapRulesFor(tid);
  const critHits=critRules.length
    ?W.csv.rows.filter((row,i)=>W.asg[i]<0&&W.meta[i].in&&critRules.some(r=>c2Match(row,r.terms))).length:0;
  const impMonths=()=>{
    if(tid.indexOf('i:')===0){
      const it=findItem(tid.slice(2));
      return it&&it.imp?it.imp.map((v,i)=>v?i+1:0).filter(Boolean):[];
    }
    if(tid.indexOf('k:')===0){
      const k=tid.slice(2);
      return MONTHS.map((_,i)=>flexKind(k,i+1)==='imp'?i+1:0).filter(Boolean);
    }
    return [];
  };
  const months=impMonths();
  /* **„Posten öffnen" steht zuoberst**: das gewohnte Fenster der
     Position, mit allem, was schon importiert ist, an seinen
     Monaten. Der Doppelklick auf die Zeile gehört seit 30.8.26 dem
     Auf- und Zuklappen — dieses Menü ist jetzt der Weg ins
     Fenster. Ein Ziel, das es im Buch noch nicht gibt („n:…"),
     hat nichts zu öffnen. */
  const canOpen=(tid.indexOf('i:')===0&&findItem(tid.slice(2)))||tid.indexOf('k:')===0;
  /* **„Suchen nach Betrag"** (5.9.26): die Beträge, die dieser
     Posten im Buch führt, als Filter auf die Betragsspalte der
     Datei — jeder verschiedene Betrag einmal, alle zusammen als
     **eine** Filterzeile mit „einer von" (c2Term, op amt). Mehrere
     Zeilen gingen nicht: Filterzeilen gelten zusammen, und keine
     Zeile hat zugleich 500 und 520. **Mit Vorzeichen**, wie der
     Posten es im Buch führt: Kosten mit Minus, Einnahmen mit Plus —
     so steht es auch im Kontoauszug. Der Posten wird dabei als Ziel
     gewählt; der Filter steht als Zeile da, man kann ihn anpassen,
     und „Zuordnen und merken" macht daraus die Regel. */
  const amts=()=>{
    let vals=[];
    if(tid.indexOf('i:')===0){const it=findItem(tid.slice(2));vals=it?it.amounts.slice():[];}
    else if(tid.indexOf('k:')===0){const k=tid.slice(2);vals=MONTHS.map((_,i)=>kakVal(k,i+1));}
    const seen=new Set(),out=[];
    vals.forEach(v=>{
      const a=Math.round((+v||0)*100)/100;
      if(!a||seen.has(a))return;
      seen.add(a);out.push(a);
    });
    return out;
  };
  const amtList=W.f.amount>=0&&canOpen?amts():[];
  const pop=document.createElement('div');
  pop.className='c2fpop';pop.dataset.tid=tid;
  /* „Zuordnung für diese Datei anlegen" stand hier vom 30.8. bis
     zum 5.9.26 — es wählte den Posten als Ziel und stellte die
     Schreibmarke in den Schnellfilter. Das tut ein Klick auf die
     Zeile ohnehin, und „Suchen nach Betrag" ist der Griff, der
     wirklich etwas anlegt. Ein Menüeintrag, der nur einen Klick
     wiederholt, ist heraus. */
  pop.innerHTML=
    (canOpen?`<button data-do="open">${esc(t('c2.mnOpen'))}</button>`:'')+
    (critRules.length?`<button data-do="crit1" class="hot"${critHits?'':' disabled'} title="${esc(critHits?t('c2.mnApplyCritTip',critRules.length,critHits):t('c2.mnApplyCritNone'))}">${esc(t('c2.mnApplyCrit'))}</button>`:'')+
    (ri>=0?`<button data-do="edit">${esc(t('c2.mnEdit'))}</button>
            <button data-do="reset">${esc(t('c2.mnReset'))}</button>`:'')+
    (W.f.amount>=0&&canOpen?`<button data-do="amt"${amtList.length?'':' disabled'} title="${esc(amtList.length?t('c2.mnAmtTip',amtList.length):t('c2.mnAmtNone'))}">${esc(t('c2.mnAmt'))}</button>`:'')+
    (months.length?`<button data-do="wipe" class="danger">${esc(t('c2.mnWipe',months.length))}</button>`:'');
  if(!pop.innerHTML)return;
  W.modal.appendChild(pop);
  const r=btn.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
  pop.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';
  pop.style.top=(r.bottom+3+h>innerHeight?Math.max(8,r.top-3-h):r.bottom+3)+'px';
  const close=()=>{
    pop.remove();
    document.removeEventListener('click',away,true);
    document.removeEventListener('scroll',away,true);
  };
  /* Wie beim Filtermenü: der öffnende Knopf zählt nicht als
     „daneben", damit der zweite Klick darauf schließt. */
  const away=e2=>{if(!pop.contains(e2.target)&&!btn.contains(e2.target))close();};
  pop.querySelectorAll('button').forEach(b=>{
    b.onclick=e=>{
      e.stopPropagation();close();
      const what=b.dataset.do;
      if(what==='open'){
        if(tid.indexOf('i:')===0){
          const it=findItem(tid.slice(2));
          if(it)c2Detail(()=>editItem(it));
        }else if(tid.indexOf('k:')===0)c2Detail(()=>editKak(tid.slice(2)));
        return;
      }
      if(what==='edit'){ c2EditRule(ri); return; }
      if(what==='crit1'){
        if(!critRules.length||!critHits)return;
        const from=W.rules.length;
        const keys=new Set(critRules.map(c2RuleKey));
        W.rules=W.rules.concat(critRules);
        /* Was hier angewendet wird, wartet nicht mehr im
           Wahl-Fenster der gemerkten Zuordnung; ist dort nichts
           mehr übrig, steht der Knopf in der Leiste grau. */
        if(W.mapRules){
          W.mapRules=W.mapRules.filter(r=>!keys.has(c2RuleKey(r)));
          if(!W.mapRules.length){W.mapRules=null;W.autoDone=true;}
        }
        W.target='';W.editRule=null;
        c2ApplyRules();c2Render();
        toast(t('c2.tAssigned',W.asg.filter(v=>v>=from).length,x?x.name:tid));
        return;
      }
      if(what==='amt'){
        if(!amtList.length)return;
        W.target=tid;W.editRule=null;
        /* Eine frühere Betragszeile derselben Spalte wird ersetzt,
           nicht gestapelt — zwei „einer von" derselben Spalte
           träfen nur noch die Schnittmenge. */
        W.chips=W.chips.filter(c=>!(c.f==='amount'&&c.op==='amt'));
        W.chips.push({f:'amount',op:'amt',val:amtList.map(v=>nf.format(v)).join(' | ')});
        c2Render();
        return;
      }
      if(what==='reset'){
        const n=W.asg.filter((v,i)=>v>=0&&W.rules[v].t.tid===tid).length;
        W.rules=W.rules.filter(rr=>rr.t.tid!==tid);
        W.editRule=null;
        c2ApplyRules();c2Render();
        toast(t('c2.tUnmapped',x?x.name:tid,n));
        return;
      }
      /* Frühere Importe löschen: die Monate, die eine Datei
         geschrieben hat, werden wieder leer und offen. */
      if(!confirm(t('c2.mnWipeAsk',x?x.name:tid,months.length)))return;
      if(tid.indexOf('i:')===0){
        const it=findItem(tid.slice(2));
        if(it)months.forEach(m=>{it.amounts[m-1]=0;it.paid[m-1]=false;it.imp[m-1]=false;
          if(it.impRows)delete it.impRows[m];});
      }else if(tid.indexOf('k:')===0){
        const k=tid.slice(2);
        /* Dieselbe Hand wie „Importdaten löschen" im
           Beträge-Fenster (wipeFlexImport in js/categories.js):
           der Monat ist danach für diese Kategorie kein
           importierter mehr, nicht bloß einer mit 0. */
        months.forEach(m=>wipeFlexImport(k,m));
      }
      save();c2Render();render();
      toast(t('c2.mnWiped',x?x.name:tid,months.length));
    };
  });
  setTimeout(()=>{
    document.addEventListener('click',away,true);
    document.addEventListener('scroll',away,true);
  },0);
}

/* Die Bewegung beim Zuordnen: die getroffenen Zeilen fliegen als
   weiße Streifen aus der CSV hinauf unter ihr Ziel. Nur Zierrat —
   wer Bewegung abgeschaltet hat, bekommt keine (flights bleibt
   dann leer, siehe „assign" in c2Wire). */
function c2Fly(flights,tid){
  if(!flights.length)return;
  let dest=null;
  W.box.querySelectorAll('tr.c2trow').forEach(tr=>{if(tr.dataset.c2t===tid)dest=tr;});
  if(!dest)return;
  let last=dest;
  while(last.nextElementSibling&&last.nextElementSibling.classList.contains('c2src'))
    last=last.nextElementSibling;
  last.scrollIntoView({block:'nearest'});
  const dr=last.getBoundingClientRect();
  flights.forEach((f,k)=>{
    const g=document.createElement('div');
    g.className='c2ghost';
    g.textContent=f.text;
    g.style.left=f.r.left+'px';g.style.top=f.r.top+'px';
    g.style.width=Math.min(f.r.width,520)+'px';g.style.height=f.r.height+'px';
    document.body.appendChild(g);
    requestAnimationFrame(()=>{requestAnimationFrame(()=>{
      g.style.transition=`transform .5s cubic-bezier(.25,.6,.3,1) ${k*45}ms,opacity .55s ease ${k*45}ms`;
      g.style.transform=`translate(${dr.left-f.r.left}px,${dr.top-f.r.top}px)`;
      g.style.opacity='0';
    });});
    setTimeout(()=>g.remove(),750+k*45);
  });
}

/* ── Verdrahten — je Schritt das, was er braucht ─────────────── */
function c2Wire(){
  const box=W.box;
  const on=(a,fn)=>{box.querySelectorAll(`[data-c2="${a}"]`).forEach(b=>{b.onclick=fn;});};
  on('close',c2Close);

  if(W.step===1){
    const file=box.querySelector('#c2File');
    on('pick',()=>file.click());
    file.onchange=()=>{
      const f=file.files[0];
      if(!f)return;
      const r=new FileReader();
      r.onload=()=>{
        try{
          W.csv=c2Parse(r.result,f.name);
          W.cols=[];W.f=c2BlankF();
          W.rules=[];W.newT=[];W.asg=[];W.flt={};W.fltOp={};W.chips=[];W.q='';
          W.colw={};W.target='';W.editRule=null;W.ignoreMap=false;W.autoCols=false;
          W.mapRules=null;W.autoDone=false;W.mapName='';
          if(W.kindFromMap){W.kind=null;W.kindFromMap=false;}
        }catch(e){W.csv=null;warn(t('c2.readFail',e.message));}
        if(!c2Advance())c2Render();
      };
      r.readAsArrayBuffer(f);
    };
    /* Ein Klick auf die Art geht weiter — auch auf die schon
       gewählte: wer aus Schritt 2 zurückkommt, findet so den Weg
       wieder nach vorn, ohne einen eigenen Knopf dafür. */
    box.querySelectorAll('[data-c2kind]').forEach(b=>{
      b.onclick=()=>{
        if(c2LockedKind())return;
        const k=b.dataset.c2kind;
        if(W.kind&&W.kind!==k&&W.rules.length){W.rules=[];W.newT=[];W.target='';W.asg=[];}
        W.kind=k;W.kindFromMap=false;
        if(!c2Advance())c2Render();
      };
    });
    /* **„Automatisch CSV-Datenstruktur vorbereiten"** (5.9.26; bis
       dahin „Mit gemerkter Zuordnung weiter", und das sprang gleich
       in Schritt 3): die Feldverknüpfung kommt aus dem Gemerkten,
       und es geht nach **Schritt 2** — dort sieht man, was
       übernommen wurde, und kann es prüfen. Die gemerkten
       Kriterien der Posten kommen erst beim Weitergehen von dort
       (c2GoStep3): gelesen wird hier nur die Struktur, zugeordnet
       wird nichts — genau, was der Kasten verspricht. **Die Art
       kommt mit** (5.9.26 spät) und ist danach gesperrt
       (c2LockedKind); deshalb geht es von hier **gleich** nach
       Schritt 2, ohne dass in Schritt 1 noch etwas zu wählen wäre.
       Nur eine Struktur ohne Art (vom Nachmittag) hält an: dann
       wird die Art hier einmal gewählt, und der Klick darauf geht
       weiter (c2Advance). */
    on('applyMap',()=>{
      const m=state.csvMaps[W.csv.fp];
      if(!m)return;
      W.mapName=m.file||'';
      if(m.kind==='reg'||m.kind==='flex'){W.kind=m.kind;W.kindFromMap=true;}
      W.f=Object.assign(c2BlankF(),m.f||{});
      C2_FIELDS.forEach(f=>{if(W.f[f]>=W.csv.header.length)W.f[f]=-1;});
      W.cols=c2Order();
      W.rules=[];W.newT=[];W.asg=[];W.target='';W.editRule=null;
      W.mapRules=null;W.autoDone=false;
      W.autoCols=true;W.ignoreMap=false;
      if(!c2Advance())c2Render();
    });
    /* **„CSV-Datenstruktur neu anordnen"**: Schritt 2 fängt leer an,
       die Art ist wieder wählbar. Auch wer vorher „Automatisch"
       gedrückt hatte und zurückkommt, fängt hier von vorn an —
       „neu anordnen" heißt genau das. */
    on('ignoreMap',()=>{
      /* Eine Art, die aus der Struktur kam, geht mit zurück: „neu
         anordnen" verspricht die Wahl (c2.kindLockTip), und mit der
         alten Art im Zustand ginge es sonst ohne sie gleich nach
         Schritt 2. Eine von Hand gewählte bleibt. */
      if(W.kindFromMap){W.kind=null;W.kindFromMap=false;}
      W.ignoreMap=true;W.autoCols=false;W.mapRules=null;W.autoDone=false;
      W.cols=[];W.f=c2BlankF();
      W.rules=[];W.newT=[];W.asg=[];W.target='';W.editRule=null;
      if(!c2Advance())c2Render();
    });
  }

  if(W.step===2){
    const wrap=box.querySelector('#c2ColsWrap');
    const redraw=()=>{
      const sl=wrap.scrollLeft,st=wrap.scrollTop;
      wrap.innerHTML=c2ColsTable();
      rewire();
      wrap.scrollLeft=sl;wrap.scrollTop=st;
      const cc=box.querySelector('#c2Cnt');
      if(cc)cc.textContent=t('c2.colsCnt',W.cols.length,W.csv.header.length);
      const inf=box.querySelector('#c2Info');
      if(inf)inf.innerHTML=c2InfoLine();
      c2RefreshNav();
    };
    const rewire=()=>{
      wrap.querySelectorAll('[data-c2col]').forEach(th=>{
        th.onclick=()=>{
          const i=+th.dataset.c2col;
          if(W.cols.includes(i)){
            W.cols=W.cols.filter(x=>x!==i);
            for(const f in W.f)if(W.f[f]===i)W.f[f]=-1;
          }else{
            W.cols=W.cols.concat(i).sort((a,b)=>a-b);
            c2GuessCol(i);
          }
          redraw();
        };
      });
      /* Eine andere Beschriftungszeile wählen: Namen, Datenzeilen
         und Fingerabdruck werden neu gerechnet. Die Spaltenwahl
         bleibt — sie steht an der Stelle, nicht am Namen —, und was
         danach noch frei ist, rät `c2GuessCol()` mit den neuen
         Namen. Was gerade zugeordnet war, ist hinfällig: die
         Datenzeilen sind andere. */
      wrap.querySelectorAll('[data-c2hrow]').forEach(b=>{
        b.onclick=e=>{
          e.stopPropagation();
          const idx=+b.dataset.c2hrow;
          if(idx===W.csv.hIdx)return;
          c2UseHeader(W.csv,idx);
          W.cols=W.cols.filter(i=>i<W.csv.header.length);
          W.cols.forEach(i=>c2GuessCol(i));
          W.meta=[];W.asg=[];W.rules=[];W.newT=[];W.target='';W.editRule=null;
          /* Mit der Beschriftungszeile wechselt der Fingerabdruck —
             die gemerkte Struktur gilt dann nicht mehr als
             übernommen, und die Art ist wieder wählbar (sie bleibt
             stehen: man arbeitet gerade mit ihr). Auch ihr Name
             gehört zur alten Datei-Art — im Namensfenster stünde er
             sonst als vergeben da. */
          W.ignoreMap=false;W.autoCols=false;W.mapRules=null;W.autoDone=false;
          W.mapName='';W.kindFromMap=false;
          c2Render();
        };
      });
      wrap.querySelectorAll('[data-c2f]').forEach(sel=>{
        sel.onclick=e=>e.stopPropagation();
        sel.onchange=()=>{
          const i=+sel.dataset.c2f,f=sel.value;
          for(const k in W.f)if(W.f[k]===i)W.f[k]=-1;
          if(f){
            /* Ein Feld wohnt nur in einer Spalte. */
            if(W.f[f]>=0)W.f[f]=-1;
            W.f[f]=i;
          }
          redraw();
        };
      });
    };
    rewire();
    on('selAll',()=>{W.cols=W.csv.header.map((h,i)=>i);W.cols.forEach(i=>c2GuessCol(i));c2Render();});
    on('selNone',()=>{W.cols=[];W.f=c2BlankF();c2Render();});
  }

  c2WireNav();

  if(W.step===3){
    /* Der Griff zwischen den Flächen: Ziehen teilt neu, Doppelklick
       stellt halb/halb her. Gesetzt wird direkt am Element — ein
       Neuaufbau je Mausbewegung wäre zu viel; W.split hält den
       Stand für den nächsten c2Render(). Nach dem Loslassen misst
       c2FitCols() die CSV-Spalten nach: die untere Fläche kann jetzt
       einen Rollbalken mehr oder weniger haben. */
    const sp=box.querySelector('.c2split');
    if(sp){
      const top=box.querySelector('.c2top'),bot=box.querySelector('.c2bot');
      const put=s=>{W.split=s;top.style.flex=`${s} 1 0`;bot.style.flex=`${1-s} 1 0`;};
      sp.onpointerdown=e=>{
        e.preventDefault();
        const total=top.offsetHeight+bot.offsetHeight,y0=e.clientY,h0=top.offsetHeight;
        sp.setPointerCapture(e.pointerId);
        sp.classList.add('drag');
        sp.onpointermove=ev=>put(Math.max(.12,Math.min(.88,(h0+ev.clientY-y0)/total)));
        sp.onpointerup=sp.onpointercancel=()=>{
          sp.onpointermove=sp.onpointerup=sp.onpointercancel=null;
          sp.classList.remove('drag');
          c2FitCols();
        };
      };
      sp.ondblclick=()=>{put(.5);c2FitCols();};
    }
    box.querySelectorAll('[data-c2t]').forEach(tr=>{
      tr.onclick=e=>{
        if(e.target.closest('.c2rowmenu'))return;
        const tid=tr.dataset.c2t;
        if(W.target===tid){W.target='';tr.classList.remove('sel');}
        else{
          W.target=tid;
          box.querySelectorAll('.c2trow.sel').forEach(x=>x.classList.remove('sel'));
          tr.classList.add('sel');
        }
        c2RefreshAssign();
      };
    });
    const fa=box.querySelector('[data-c2foldall]');
    if(fa)fa.onclick=e=>{
      e.stopPropagation();
      if(fa.dataset.c2foldall==='1')
        box.querySelectorAll('[data-c2fold]').forEach(b=>{W.open[b.dataset.c2fold]=1;});
      else W.open={};
      c2Render();
    };
    box.querySelectorAll('[data-c2fold]').forEach(b=>{
      b.onclick=e=>{
        e.stopPropagation();
        const tid=b.dataset.c2fold;
        if(W.open[tid])delete W.open[tid]; else W.open[tid]=1;
        c2Render();
      };
    });
    /* Ein Doppelklick irgendwo auf der Zielzeile klappt sie auf
       oder zu (seit 30.8.26; vorher öffnete er das Posten-Fenster —
       das wohnt jetzt als „Posten öffnen" im ☰-Menü der Zeile).
       Knöpfe und Lampen behalten ihr eigenes Ziel; eine Zeile ohne
       zugeordnete oder importierte Zeilen hat nichts zu klappen —
       erkennbar am fehlenden Pfeil-Knopf. Der Einfachklick wählt
       weiter das Ziel; beim Doppelklick heben sich die beiden
       Klicks von selbst wieder auf. */
    box.querySelectorAll('[data-c2t]').forEach(tr=>{
      tr.ondblclick=e=>{
        if(e.target.closest('button,a,input'))return;
        const tid=tr.dataset.c2t;
        if(!tr.querySelector('[data-c2fold]'))return;
        if(W.open[tid])delete W.open[tid]; else W.open[tid]=1;
        c2Render();
      };
    });
    box.querySelectorAll('[data-c2menu]').forEach(b=>{
      b.onclick=e=>{
        e.stopPropagation();
        c2RowMenu(b,b.dataset.c2menu);
      };
    });
    box.querySelectorAll('[data-c2flt]').forEach(inp=>{
      inp.oninput=()=>{
        W.flt[inp.dataset.c2flt]=inp.value;
        inp.classList.toggle('on',inp.value.trim()!=='');
        c2RefreshAssign();
      };
      inp.onkeydown=e=>{
        if(e.key!=='Enter')return;
        e.preventDefault();
        c2Pin(inp.dataset.c2flt,inp.value);
      };
    });
    const qIn=box.querySelector('#c2Q');
    if(qIn){
      qIn.oninput=()=>{
        W.q=qIn.value;
        qIn.classList.toggle('on',qIn.value.trim()!=='');
        c2RefreshAssign();
      };
      qIn.onkeydown=e=>{
        if(e.key!=='Enter')return;
        e.preventDefault();
        c2Pin('q',qIn.value);
      };
    }
    box.querySelectorAll('[data-c2cx]').forEach(b=>{
      b.onclick=e=>{
        e.stopPropagation();
        W.chips.splice(+b.dataset.c2cx,1);
        c2Render();
      };
    });
    /* Doppelklick auf eine Filterzeile: zurück ins Feld, zum
       Anpassen (siehe c2ChipHtml). Das ✕ ist davon ausgenommen —
       zwei schnelle Klicks darauf sind zwei Klicks, kein Doppelklick.
       Der Schnellfilter-Chip geht in sein eigenes Feld. */
    box.querySelectorAll('[data-c2chip]').forEach(ch=>{
      ch.ondblclick=e=>{
        if(e.target.closest('.c2fcx'))return;
        e.preventDefault();
        const tm=W.chips[+ch.dataset.c2chip];
        if(!tm)return;
        W.chips.splice(+ch.dataset.c2chip,1);
        if(tm.f==='q')W.q=tm.val;
        else{W.flt[tm.f]=tm.val;W.fltOp[tm.f]=tm.op;}
        c2Render();
        const el=box.querySelector(tm.f==='q'?'#c2Q':`[data-c2flt="${tm.f}"]`);
        if(el){el.focus();el.select();}
      };
    });
    box.querySelectorAll('[data-c2fmenu]').forEach(b=>{
      b.onclick=e=>{
        e.stopPropagation();
        c2FltMenu(b,b.dataset.c2fmenu);
      };
    });
    /* Wer über einer zugeordneten Zeile schwebt, sieht ihre
       Ziel-Zeile mit den roten Trennlinien — als schwebte die
       Maus über der Hauptzeile selbst. CSS kennt kein „Zeile
       davor", deshalb setzt die Maus die Klasse. */
    box.querySelectorAll('tr.c2src').forEach(tr=>{
      let own=tr.previousElementSibling;
      while(own&&!own.classList.contains('c2trow'))own=own.previousElementSibling;
      if(own){
        tr.onmouseenter=()=>own.classList.add('hov');
        tr.onmouseleave=()=>own.classList.remove('hov');
      }
      if(tr.dataset.c2ri!=null)tr.onclick=()=>c2EditRule(+tr.dataset.c2ri);
    });
    const tb=box.querySelector('#c2Body');
    if(tb)tb.onclick=e=>{
      /* **Über den Körper und nicht am einzelnen Kästchen.** Jeder
         Tastendruck im Filter ersetzt `#c2Body` komplett
         (c2RefreshAssign); ein Handler am Kästchen selbst wäre
         danach weg, und die Häkchen ließen sich nicht mehr
         setzen. Beim Klick steht der neue Stand schon in `checked`. */
      const pk=e.target.closest('[data-c2pick]');
      if(pk){
        const i=+pk.dataset.c2pick;
        if(pk.checked)W.pick[i]=1; else delete W.pick[i];
        pk.closest('tr').classList.toggle('picked',pk.checked);
        c2RefreshHead();c2RefreshBtns();
        return;
      }
      /* **Im Markier-Modus trifft die ganze Zeile.** Ein Kästchen
         von 13 px zwanzigmal genau zu treffen ist Arbeit, und
         etwas anderes gibt es hier gerade nicht zu tun: die
         Spaltenfilter sind im Modus ohnehin gesperrt. Also zählt
         der Klick irgendwo auf die Zeile wie der Klick auf ihr
         Kästchen. */
      if(W.once){
        const row=e.target.closest('tr[data-c2i]');
        const cb=row&&row.querySelector('[data-c2pick]');
        if(cb){
          const i=+cb.dataset.c2pick;
          if(W.pick[i]){delete W.pick[i];cb.checked=false;}
          else {W.pick[i]=1;cb.checked=true;}
          row.classList.toggle('picked',!!W.pick[i]);
          c2RefreshHead();c2RefreshBtns();
        }
        return;
      }
      const tr=e.target.closest('tr[data-c2ri]');
      if(tr){c2EditRule(+tr.dataset.c2ri);return;}
      const td=e.target.closest('td[data-c2f]');
      if(!td)return;
      const val=td.getAttribute('title')||td.textContent;
      if(!val.trim())return;
      const ci=td.dataset.c2f;
      W.flt[ci]=val;
      const inp=box.querySelector(`[data-c2flt="${ci}"]`);
      /* Der Wert steht markiert im Feld und das Feld hat den
         Fokus: anpassen, Enter — und der Filter ist angeheftet. */
      if(inp){inp.value=val;inp.classList.add('on');inp.focus();inp.select();}
      c2RefreshAssign();
    };
    on('newT',()=>c2NewTarget());
    /* **Die gemerkte Zuordnung anwenden — auf Knopfdruck.**
       Erst hier wandern ihre Regeln in W.rules; von da an sind sie
       gewöhnliche Regeln und lassen sich einzeln zurücknehmen.

       **Was sie getan hat, sagt ein Fenster** und keine
       Kurzmeldung: sie ordnet in einem Zug zu, was vielleicht
       hundert Zeilen sind. Gezählt wird dasselbe wie beim
       automatischen Zuordnen — Ziele, die etwas bekommen haben,
       und Zeilen, die daran hängen. */
    on('autoMap',c2MapPick);
    /* **Ein Knopf, eine Bedeutung:** an und aus. Er räumt beim
       Verlassen auf — eine Markierung, die man nicht mehr sieht,
       ist keine.

       Eine einmalige Zuordnung **aus dem Filter heraus** gibt es
       damit nicht als eigenen Weg, und sie fehlt auch nicht: im
       Modus zeigt die Tabelle die gefilterten Zeilen, das Kästchen
       im Spaltenkopf markiert sie alle, und „Einmalig zuordnen"
       übernimmt sie. Das ist derselbe Handgriff, nur sichtbar —
       man sieht vorher, was man übernimmt. */
    /* **Beim Einschalten fallen die Spaltenfilter weg, der
       Schnellfilter bleibt** (5.9.26; bis dahin fiel auch er). Die
       Spaltenfelder sind im Modus gesperrt, und ein Spaltenfilter,
       der unsichtbar weiter eingrenzt, ließe die halbe Datei ohne
       erkennbaren Grund fehlen — getippte wie angeheftete gehen
       deshalb heraus. Der Schnellfilter über alle Spalten steht im
       Modus sichtbar da und ist dort der Weg, die Auswahl
       einzugrenzen, bevor man markiert; was darin steht, hat man
       gerade erst getippt und soll nicht mit dem Umschalten
       verschwinden — samt seiner angehefteten Zeilen. Beim
       Ausschalten bleibt alles, wie es steht. */
    on('assignOnce',()=>{
      W.once=!W.once;W.pick={};
      if(W.once){W.flt={};W.chips=W.chips.filter(c=>c.f==='q');}
      c2Render();
    });
    /* Die beiden Knöpfe neben dem ☰ — was sie tun, entscheidet der
       Modus, genau wie im Menü dahinter. */
    on('goAssign',()=>{W.once?c2PickAssign():c2DoAssign();});
    on('newTAssign',()=>c2NewTarget(()=>{W.once?c2PickAssign():c2DoAssign();}));
    const mb=box.querySelector('#c2Menu');
    if(mb)mb.onclick=e=>{e.stopPropagation();c2AssignMenu(mb);};
    const pa=box.querySelector('[data-c2pickall]');
    if(pa)pa.onclick=e=>{
      e.stopPropagation();
      const on2=pa.dataset.c2pickall==='1';
      c2Visible().forEach(i=>{
        if(!W.meta[i].in||W.asg[i]>=0)return;
        if(on2)W.pick[i]=1; else delete W.pick[i];
      });
      c2Render();
    };
    /* Die Chip-Zeile klebt unter der Filterzeile; wie hoch die ist,
       wird gemessen — geraten wäre es beim ersten Umbau falsch. */
    const fltTh=box.querySelector('.c2fltrow th'),chipThs=box.querySelectorAll('.c2chiprow th');
    if(fltTh&&chipThs.length){
      const sc=fltTh.closest('.c2scroll');
      if(sc){
        const top=(fltTh.getBoundingClientRect().bottom-sc.getBoundingClientRect().top)+'px';
        chipThs.forEach(th2=>{th2.style.top=top;});
      }
    }
    c2RefreshAssign();
    const selRow=box.querySelector('.c2trow.sel');
    if(selRow)selRow.scrollIntoView({block:'nearest'});
  }
}

/* Die Knöpfe der Kopfzeile, je Schritt — in einer eigenen Funktion,
   weil Schritt 2 sie bei jedem Umbau seiner Tabelle neu baut
   (c2RefreshNav), ohne das ganze Fenster neu zu zeichnen. */
function c2WireNav(){
  const box=W.box;
  const on=(a,fn)=>{box.querySelectorAll(`[data-c2="${a}"]`).forEach(b=>{b.onclick=fn;});};
  if(W.step===1){
    on('to2',()=>{
      if(!W.csv){warn(t('c2.needFile'));return;}
      /* FINA kennt die Datei-Art, und der Kasten über den Angaben
         wartet auf die Antwort — die Struktur automatisch
         vorbereiten oder neu anordnen. Das kommt **vor** der Art:
         der automatische Weg bringt sie mit, und „sag zuerst, was in
         der Datei steckt" wäre dann die falsche Auskunft. Ein
         „Weiter", das stillschweigend eins von beiden wählte, träfe
         eine Entscheidung, die dem Nutzer gehört. */
      if(c2MapPending()){warn(t('c2.nextKnown'));return;}
      if(!W.kind){warn(t('c2.needKind'));return;}
      c2Advance();
    });
  }
  if(W.step===2){
    on('to1',()=>{W.step=1;c2Render();});
    on('to3',()=>{
      if(!W.cols.length){warn(t('c2.noCols'));return;}
      const miss=[];
      if(W.f.date<0)miss.push(t('c2.fDate'));
      if(W.f.amount<0)miss.push(t('c2.fAmount'));
      if(miss.length){c2Missing(miss);return;}
      c2Meta();
      if(!W.meta.some(m=>m.in)){warn(t('c2.noYear',YEAR));return;}
      /* **Stehen die Spalten noch so da, wie sie gemerkt sind**
         (automatischer Weg, nichts umgestellt), geht es ohne Frage
         weiter: der Knopf heißt dann „Weiter" (c2Nav), und ein
         Namensfenster für etwas, das schon gemerkt ist, wäre eine
         Frage ohne Antwortbedarf. */
      if(W.autoCols&&c2ColsSame()){
        /* Eine Struktur ohne Art (gemerkt am Nachmittag des 5.9.26)
           bekommt hier die eben gewählte nachgetragen — still, ohne
           Namensfrage: der Name steht ja schon. */
        const m=state.csvMaps[W.csv.fp];
        if(m&&m.kind!==W.kind){m.kind=W.kind;save();}
        c2GoStep3();return;
      }
      /* Sonst erst der Name, dann der Schritt: Abbrechen im Fenster
         lässt alles stehen, Speichern legt die Spalten ab
         (c2SaveCols) und geht weiter. */
      c2AskMapName(c2GoStep3);
    });
  }
  if(W.step===3){
    on('to2',()=>{W.editRule=null;W.step=2;c2Render();});
    on('apply',c2Apply);
  }
  if(W.step>1)on('guide',()=>{W.guide=!W.guide;c2Render();});
}

/* **Der eine Weg in den dritten Schritt** (5.9.26) — ob mit oder
   ohne Namensfrage, ob die Spalten aus dem Gemerkten kamen oder
   von Hand: Spaltenbreiten messen, die gemerkten Regeln der
   Datei-Art bereitlegen (als Angebot in der Leiste, nicht als
   Zuordnung — siehe c2LoadMapRules), zuordnen, was schon in W.rules
   steht, und zeichnen. Bis dahin standen diese vier Zeilen zweimal
   da, und der automatische Weg übersprang Schritt 2. */
function c2GoStep3(){
  /* **Nur verknüpfte Spalten kommen mit** (5.9.26): was in Schritt 2
     gewählt, aber keinem Feld zugeordnet ist, wird hier abgewählt.
     Die Kriterien in Schritt 3 beziehen sich auf Felder, und eine
     Spalte ohne Feld hätte dort keinen Namen. */
  W.cols=c2Order();
  c2Meta();
  c2MeasureCols();
  c2LoadMapRules();
  c2ApplyRules();
  W.step=3;c2Render();
}

/* ── Die gemerkte Zuordnung anwenden — nach Wahl ──────────────
   **Nichts wird von selbst zugeordnet** (5.9.26). Das Fenster
   zeigt, welche Posten aus der gemerkten Zuordnung dieser Datei-Art
   etwas bekämen — gegliedert wie der Zielbereich: Einnahmen und
   regelmäßige Kosten je Kategorie, flexible Kosten in einem Block —,
   jeder mit einem Kästchen, alle angekreuzt. Dahinter steht, wie
   viele freie Zeilen seine Regeln gerade träfen. „Anwenden" ordnet
   nur den angekreuzten zu; die übrigen Regeln bleiben in W.mapRules
   liegen — der Knopf bleibt für sie schwarz, und c2StoreRules()
   legt sie bei „Fertig" mit an den Posten ab, damit nichts verloren
   geht.

   Bis 30.8.26 lief die gemerkte Zuordnung ungefragt beim Weitergehen
   aus dem ersten Schritt, danach in einem Zug auf Knopfdruck; jetzt
   sieht man vorher, wen es trifft, und kann einzelne auslassen. */
function c2MapPick(){
  const rules=W.mapRules||[];
  if(!rules.length)return;
  /* Wie viele freie Zeilen jede Regel träfe — in der Reihenfolge der
     Regeln, die erste nimmt, wie beim Zuordnen selbst. */
  const taken=W.asg.slice(),cnt=rules.map(()=>0);
  rules.forEach((r,ri)=>{
    if(r.pick)return;
    W.csv.rows.forEach((row,i)=>{
      if(taken[i]>=0||!W.meta[i].in)return;
      if(c2Match(row,r.terms)){taken[i]=1e6+ri;cnt[ri]++;}
    });
  });
  const byT={},order=[];
  rules.forEach((r,ri)=>{
    const tid=r.t.tid;
    if(!byT[tid]){byT[tid]={t:r.t,n:0};order.push(tid);}
    byT[tid].n+=cnt[ri];
  });
  /* Kategorie und Geldart eines Ziels: aus dem Buch, bei einem noch
     nicht angelegten aus W.newT. */
  const groupOf=tid=>{
    if(tid.indexOf('i:')===0){const it=findItem(tid.slice(2));return it?it.group:'';}
    const nt=W.newT.find(x=>x.tid===tid);
    return nt&&nt.group?nt.group:'';
  };
  const row=tid=>{
    const b=byT[tid];
    return `<label class="c2mprow"><input type="checkbox" data-c2mp="${esc(tid)}" checked>
      <span class="n">${esc(b.t.name)}${tid.indexOf('n:')===0?`<i class="c2newtag">${t('c2.newTag')}</i>`:''}</span>
      <span class="c${b.n?'':' none'}">${b.n?t('c2.mpRows',b.n):t('c2.mpNone')}</span></label>`;
  };
  let body='';
  if(W.kind==='reg'){
    [[t('c2.blkIn'),'g-in',order.filter(tid=>byT[tid].t.income)],
     [t('c2.blkOut'),'g-out',order.filter(tid=>!byT[tid].t.income)]].forEach(bl=>{
      if(!bl[2].length)return;
      body+=`<div class="c2mpgrp ${bl[1]}"><p class="c2mph">${esc(bl[0])}</p>`;
      const cats=[];
      bl[2].forEach(tid=>{const g=groupOf(tid);if(!cats.includes(g))cats.push(g);});
      cats.forEach(g=>{
        const sub=bl[2].filter(tid=>groupOf(tid)===g);
        if(cats.length>1||g)body+=`<p class="c2mpcat">${esc(g?keyLabel(g):'—')}</p>`;
        body+=sub.map(row).join('');
      });
      body+='</div>';
    });
  }else{
    body+=`<div class="c2mpgrp g-flex"><p class="c2mph">${esc(t('c2.blkFlex'))}</p>${order.map(row).join('')}</div>`;
  }
  const m=document.createElement('div');
  m.className='modal';
  m.innerHTML=`<div class="box narrow split c2mpbox">
    <h3>${t('c2.mpTitle')}</h3>
    <p class="subline">${t('c2.mpSub',esc(W.csv.name))}</p>
    <div class="dbody c2mplist">${body}</div>
    <div class="row-end c2mpend">
      <button class="btn small" id="c2mpAll">${t('c2.selAll')}</button>
      <button class="btn small" id="c2mpNone">${t('c2.selNone')}</button>
      <span class="c2spacer"></span>
      <button class="btn" id="c2mpCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="c2mpOk">${t('c2.apply')}</button></div></div>`;
  document.body.appendChild(m);
  tabThroughFields(m);
  const boxes=()=>[...m.querySelectorAll('[data-c2mp]')];
  const close=()=>m.remove();
  m.querySelector('#c2mpAll').onclick=()=>boxes().forEach(b=>{b.checked=true;});
  m.querySelector('#c2mpNone').onclick=()=>boxes().forEach(b=>{b.checked=false;});
  m.querySelector('#c2mpCancel').onclick=close;
  m.querySelector('#c2mpOk').onclick=()=>{
    const on=new Set(boxes().filter(b=>b.checked).map(b=>b.dataset.c2mp));
    close();
    if(!on.size)return;
    const from=W.rules.length;
    W.rules=W.rules.concat(rules.filter(r=>on.has(r.t.tid)));
    W.mapRules=rules.filter(r=>!on.has(r.t.tid));
    if(!W.mapRules.length){W.mapRules=null;W.autoDone=true;}
    c2ApplyRules();c2Render();
    const nc=c2NewCount(from);
    c2AutoDone(nc.targets,nc.rows,t('c2.kTitle'));
  };
  m.querySelector('#c2mpOk').focus();
}

/* Das kleine Fenster über dem Wizard: welche FINA-Felder noch
   fehlen, bevor die Zuordnung anfangen kann. */
function c2Missing(miss){
  const m=document.createElement('div');
  m.className='modal';
  m.innerHTML=`<div class="box narrow">
    <h3>${t('c2.missTitle')}</h3>
    <p class="subline">${t('c2.missSub')}</p>
    <ul class="c2misslist">${miss.map(x=>`<li><b>${esc(x)}</b></li>`).join('')}</ul>
    <div class="row-end"><button class="btn primary" id="c2MissOk">${t('c2.okBtn')}</button></div></div>`;
  document.body.appendChild(m);
  tabThroughFields(m);
  m.querySelector('#c2MissOk').onclick=()=>m.remove();
  m.querySelector('#c2MissOk').focus();
}

/* ── Die Spalten merken, bevor es weitergeht (5.9.26) ─────────
   „Spalten speichern und weiter" fragt nach einem Namen — vorgeschlagen
   ist der Name der Datei, bei einer schon gemerkten Datei-Art deren
   bisheriger Name — und legt Spalten, Felder und Art in
   state.csvMaps ab. Bis dahin entstand der Eintrag erst beim
   Anwenden, und wer den Wizard vorher schloss, fing beim nächsten
   Hochladen wieder bei der Spaltenwahl an.

   **Geprüft wird zweierlei**: kennt FINA die Datei-Art schon, sagt
   das Fenster, unter welchem Namen und seit wann — Speichern
   ersetzt dann nur die Spaltenzuordnung, die Regeln bleiben. Und
   ein Name, den eine **andere** Zuordnung schon trägt, wird
   abgewiesen: in den Einstellungen stünden sonst zwei gleiche
   Zeilen, und man wüsste nicht, welche man vergisst. Der Name ist
   die Beschriftung (`file`), wiedererkannt wird am Fingerabdruck —
   wie in den Einstellungen. Abbrechen bleibt im Schritt. */
function c2AskMapName(done){
  const fp=W.csv.fp,ex=state.csvMaps[fp];
  const m=document.createElement('div');
  m.className='modal';
  m.innerHTML=`<div class="box narrow c2new">
    <h3>${t('c2.mapNameTitle')}</h3>
    <p class="subline">${t('c2.mapNameSub')}</p>
    <div class="dgrp"><div class="field"><label for="c2mName">${t('set.csvMapName')}</label>
      <input type="text" id="c2mName" value="${esc(W.mapName||(ex&&ex.file)||W.csv.name)}"></div></div>
    ${ex?`<p class="subline c2mapknown">${t('c2.mapNameKnown',esc(ex.file||'—'),esc(ex.date||'—'))}</p>`:''}
    <div class="row-end"><button class="btn" id="c2mCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="c2mOk">${t('g.save')}</button></div></div>`;
  document.body.appendChild(m);
  tabThroughFields(m);
  const nm=m.querySelector('#c2mName');nm.focus();nm.select();
  const close=()=>m.remove();
  const ok=()=>{
    const name=nm.value.trim();
    if(!name){warn(t('c2.mapNameEmpty'));nm.focus();return;}
    const q=name.toLowerCase();
    const clash=Object.keys(state.csvMaps||{}).find(k=>k!==fp&&String((state.csvMaps[k]||{}).file||'').trim().toLowerCase()===q);
    if(clash){warn(t('c2.mapNameTaken',name));nm.focus();nm.select();return;}
    c2SaveCols(name);
    close();
    toast(t('c2.mapSaved',name));
    done();
  };
  m.querySelector('#c2mCancel').onclick=close;
  m.querySelector('#c2mOk').onclick=ok;
  nm.onkeydown=e=>{if(e.key==='Enter')ok();};
}
/* Spalten, Felder und Art unter dem Namen ablegen — der Eintrag wird
   ganz ersetzt; Regeln stehen nicht darin, sie wohnen an den Posten
   (c2StoreRules). Das Datum ist das des Merkens. */
function c2SaveCols(name){
  const fp=W.csv.fp,d=new Date();
  W.mapName=name;
  /* **Nur die Struktur** (5.9.26): Name, Feldverknüpfung, die
     Spaltenköpfe (für die Anzeige in den Einstellungen) — und seit
     dem Abend die **Art** (Struktur v260905-4): beim nächsten
     Hochladen dieser Datei-Art steht sie damit fest. Keine Regeln —
     die wohnen an den Posten (c2StoreRules). */
  state.csvMaps[fp]={
    date:d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear(),
    file:name,kind:W.kind,f:Object.assign({},W.f),header:W.csv.header.slice()};
  save();
}

/* ══ Eine gemerkte CSV-Struktur ändern (5.9.26 spät) ═══════════
   Hinter dem Stift in den Einstellungen (Import → Gemerkte
   CSV-Strukturen). Links stehen die FINA-Felder — Datum, Betrag,
   Referenz 1 bis 4 —, rechts je ein Auswahlmenü mit den Spalten der
   Datei (aus `header`, sonst „Spalte n"); darüber die Art. Es ist
   dasselbe, was Schritt 2 des Imports festlegt, nur ohne die Datei
   — deshalb dieselben Regeln: ein Feld wohnt in einer Spalte (wer
   eine belegte Spalte wählt, nimmt sie dem anderen Feld), und ohne
   Datum und Betrag wird nicht gespeichert. Gearbeitet wird auf
   einer Kopie, in die Datei kommt erst „Speichern"; `header` und
   der Fingerabdruck bleiben, wie sie sind — sie sind die Datei-Art
   selbst. `done` ist der Rückweg in die Einstellungen (reopen),
   damit die Zeile dort die neue Art zeigt. */
function openCsvStructure(fp,done){
  const m=state.csvMaps[fp];
  if(!m){ if(done)done(); return; }
  const hd=m.header||[];
  const f=Object.assign(c2BlankF(),m.f||{});
  let kind=(m.kind==='reg'||m.kind==='flex')?m.kind:'';
  /* So viele Spalten, wie die Datei hat — oder wie die Verknüpfung
     nennt, falls eine ältere Struktur keine Spaltenköpfe kennt. */
  const nCols=Math.max(hd.length,...C2_FIELDS.map(k=>(f[k]|0)+1));
  const colName=ci=>hd[ci]!=null?hd[ci]:t('c2.colN',ci+1);
  const box=document.createElement('div');
  box.className='modal';
  document.body.appendChild(box);
  const opts=k=>`<option value="-1"${f[k]<0?' selected':''}>—</option>`
    +Array.from({length:nCols},(_,ci)=>`<option value="${ci}"${f[k]===ci?' selected':''}>${esc(colName(ci))}</option>`).join('');
  const close=()=>{ box.remove(); if(done)done(); };
  const draw=()=>{
    box.innerHTML=`<div class="box narrow csbox">
      <h3>${esc(t('cs.title'))}</h3>
      <p class="subline">${esc(m.file||'—')} · ${esc(t('set.csvMapMeta',m.date||'—'))}</p>
      <div class="dgrp csgrid">
        <label for="csKind">${esc(t('cs.kind'))}</label>
        <select id="csKind">${kind?'':'<option value="" selected>—</option>'}
          <option value="reg"${kind==='reg'?' selected':''}>${esc(t('c2.kindReg'))}</option>
          <option value="flex"${kind==='flex'?' selected':''}>${esc(t('c2.kindFlex'))}</option></select>
        ${C2_FIELDS.map(k=>`<label for="cs_${k}">${esc(c2FieldLabel(k))}</label>
        <select id="cs_${k}" data-csf="${k}">${opts(k)}</select>`).join('')}
      </div>
      <p class="errline" id="csErr" hidden></p>
      <div class="row-end"><button class="btn" id="csCancel">${esc(t('g.cancel'))}</button>
        <button class="btn primary" id="csSave">${esc(t('g.save'))}</button></div></div>`;
    box.querySelector('#csKind').onchange=e=>{ kind=e.target.value; };
    box.querySelectorAll('[data-csf]').forEach(s=>{ s.onchange=()=>{
      const k=s.dataset.csf,ci=+s.value;
      if(ci>=0)C2_FIELDS.forEach(o=>{ if(o!==k&&f[o]===ci)f[o]=-1; });
      f[k]=ci;
      /* Neu gebaut wird das ganze Fenster (ein anderes Feld kann seine
         Spalte verloren haben); der Fokus bleibt auf dem Feld, an dem
         man war — mit der Tastatur wechselte sonst jeder Pfeil das Ziel. */
      draw();
      const again=box.querySelector(`[data-csf="${k}"]`);
      if(again)again.focus();
    }; });
    box.querySelector('#csCancel').onclick=close;
    box.querySelector('#csSave').onclick=()=>{
      if(f.date<0||f.amount<0){
        const err=box.querySelector('#csErr');
        err.textContent=t('cs.need'); err.hidden=false;
        return;
      }
      m.f=Object.assign({},f);
      if(kind)m.kind=kind; else delete m.kind;
      save();
      close();
      toast(t('cs.saved'));
    };
    tabThroughFields(box);
  };
  box._close=close;          /* auch für Escape (js/ui.js) */
  draw();
}

/* Das rechte Viertel: die Anleitung zum Schritt (C2_GUIDE oben). Sie
   trägt `.guide`, damit Absätze und Überschriften aussehen wie im
   Guide der Anwendung; zu geht sie am ✕ oder am Knopf, der sie
   geöffnet hat. */
function c2GuidePanel(){
  const g=C2_GUIDE[W.step];
  if(!g)return '';
  const lang=(state&&state.lang==='de')?'de':'en';
  return `<aside class="c2gpanel guide">
    <div class="c2ghead"><b>${esc(t('app.guide'))}</b>
      <button class="btn c2gx" data-c2="guide" title="${esc(t('c2.guideOff'))}">✕</button></div>
    ${g[lang]}</aside>`;
}

/* ── Neues Ziel — das gewöhnliche Eintragsfenster: EINE
   Kategorienliste, die Kategorie entscheidet die Geldart. ── */
/* `done` läuft, nachdem das Ziel angelegt und gewählt ist — der
   Weg „Neu anlegen und zuordnen": erst der Posten, dann geht das,
   was gerade markiert oder gefiltert ist, an ihn. Ohne `done` ist
   es das gewohnte „+ Neu…". */
function c2NewTarget(done){
  if(W.kind==='flex'){c2NewFlex(done);return;}
  const bm=c2Bmap(),pm=c2Pmap();
  const opt=list=>list.map(g=>`<option value="${esc(g)}">${esc(keyLabel(g))}</option>`).join('');
  const codes=map=>Object.keys(map).map(c=>`<option value="${esc(c)}">${esc(map[c])} (${esc(c)})</option>`).join('');
  /* Die Auswahllisten stehen in einer eigenen Funktion: nach den
     Einstellungen werden sie neu gebaut, und was getippt war,
     bleibt stehen (relist weiter unten). **Ohne Kategorien geht
     das Fenster trotzdem auf** — bis 26.8.30 wies es mit einer
     Kurzmeldung ab, und der Nutzer stand vor einem Knopf, der
     nichts tat. Jetzt steht über den Listen der Weg dorthin, wo
     Kategorien entstehen. */
  const groupSel=()=>{
    const inc=incomeGroups(),out=(state.groups||[]);
    return `<option value="">${t('item.blockPick')}</option>
      ${inc.length?`<optgroup label="${t('c2.blkIn')}">${opt(inc)}</optgroup>`:''}
      ${out.length?`<optgroup label="${t('c2.blkOut')}">${opt(out)}</optgroup>`:''}`;
  };
  /* **Der Weg zur Liste steht unter der Liste, je Bereich einer.**
     Bis 30.8.26 stand darüber eine Zeile mit allen drei Wegen; dort
     musste man erst lesen, welcher zu welchem Feld gehört. Unter dem
     Feld sagt der Satz selbst, was er pflegt — und wenn die Liste
     leer ist, steht er als Einziges darunter.

     Er steht **nicht** in einem `.field` einer `.cols`-Reihe: dort
     teilen sich die Felder ein Raster aus zwei Zeilen, und ein
     drittes Kind bricht es (siehe „Felder nebeneinander fluchten"
     in CLAUDE.md). Für Bank und Zahlungsart steht er deshalb unter
     der Reihe — beide wohnen ohnehin im selben Bereich. */
  const care=(pane,what)=>`<p class="carelink"><button type="button" class="linkish"
    data-setlist="${pane}">${esc(t('c2.care',what))}</button></p>`;
  const m=document.createElement('div');
  m.className='modal';
  /* Dieselbe Bauform wie jedes andere FINA-Fenster: die Felder in
     einem Block (.dgrp), jedes als .field mit genau zwei Kindern,
     die Reihe als .cols — dadurch fluchten Beschriftung und
     Eingabe, und die Auswahllisten können schrumpfen, statt das
     Fenster mit ihrem längsten Eintrag aufzuspreizen. */
  m.innerHTML=`<div class="box narrow c2new">
    <h3>${t('menu.newOut')}</h3>
    <div class="dgrp">
      <div class="field"><label for="c2nName">${t('c2.nName')}</label>
        <input type="text" id="c2nName"></div>
      <div class="field"><label for="c2nGroup">${t('c2.nGroup')}</label>
        <select id="c2nGroup">${groupSel()}</select></div>
      ${care('groups',t('set.groups'))}
      <div class="cols c2new3">
        <div class="field"><label for="c2nBank">${t('c2.nBank')}</label>
          <select id="c2nBank"><option value="">—</option>${codes(bm)}</select></div>
        <div class="field"><label for="c2nPay">${t('c2.nPay')}</label>
          <select id="c2nPay"><option value="">—</option>${codes(pm)}</select></div>
        <!-- Die Fälligkeit ist **dieselbe Auswahlliste wie im
             Posten-Fenster** (5.9.26; vorher ein Zahlenfeld 1–31):
             Anfang · Mitte · Ende des Monats oder ein Tag, aus
             DUE_OPTS in js/config.js — ein Posten, der hier entsteht,
             soll dieselben Werte tragen wie einer aus dem Fenster. -->
        <div class="field"><label for="c2nDue">${t('item.due')}</label>
          <select id="c2nDue">${DUE_OPTS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>
      </div>
      ${care('banks',t('set.navBanks'))}
    </div>
    <p class="subline">${t('c2.nHint',t('c2.save'),t('c2.assign'))}</p>
    <div class="row-end"><button class="btn" id="c2nCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="c2nOk">${t('c2.save')}</button></div></div>`;
  document.body.appendChild(m);
  tabThroughFields(m);
  const nm=m.querySelector('#c2nName');nm.focus();
  const close=()=>m.remove();

  /* Zurück aus den Einstellungen: die drei Listen werden neu
     gebaut, **gewählt bleibt, was gewählt war** — nur wenn es den
     Eintrag nicht mehr gibt, fällt die Wahl auf leer. Getipptes im
     Namensfeld bleibt ohnehin stehen, das Feld wird nicht angefasst.
     Dieselbe Mechanik wie relist() im Posten-Fenster. */
  const relist=()=>{
    const keep=(sel,html)=>{
      const had=sel.value;
      sel.innerHTML=html;
      sel.value=had;
      if(sel.selectedIndex<0)sel.value='';
    };
    keep(m.querySelector('#c2nGroup'),groupSel());
    const bm2=c2Bmap(),pm2=c2Pmap();
    keep(m.querySelector('#c2nBank'),`<option value="">—</option>${codes(bm2)}`);
    keep(m.querySelector('#c2nPay'),`<option value="">—</option>${codes(pm2)}`);
  };
  /* Das Einstellungsfenster legt sich **über** dieses hier, ohne es
     zu schließen: gestapelt wird über die Reihenfolge im Dokument,
     und `done` ist der Rückweg — er läuft auf jedem Weg hinaus
     (Speichern, Abbrechen, Escape, Klick daneben). */
  bindSetLinks(m,relist);

  const ok=()=>{
    const name=nm.value.trim();
    if(!name){nm.focus();return;}
    const group=m.querySelector('#c2nGroup').value;
    if(!group){warn(t('c2.nNoCat'));return;}
    const ex=c2ByName(name);
    if(ex){W.target=ex.tid;close();c2Render();warn(t('c2.nDup',name));if(done)done();return;}
    W.newT.push({tid:'n:'+name,name:name,income:incomeGroups().includes(group),group:group,
      bank:m.querySelector('#c2nBank').value,pay:m.querySelector('#c2nPay').value,
      due:m.querySelector('#c2nDue').value||''});
    W.target='n:'+name;
    close();c2Render();
    if(done)done();
  };
  m.querySelector('#c2nCancel').onclick=close;
  m.querySelector('#c2nOk').onclick=ok;
  m.querySelectorAll('input').forEach(f=>{f.onkeydown=e=>{if(e.key==='Enter')ok();};});
}

/* Eine neue flexible Kategorie hat nur ihren Namen. */
function c2NewFlex(done){
  const m=document.createElement('div');
  m.className='modal';
  m.innerHTML=`<div class="box narrow c2new">
    <h3>${t('c2.newCatT')}</h3>
    <div class="dgrp"><div class="field"><label for="c2nName">${t('c2.nName')}</label>
      <input type="text" id="c2nName"></div></div>
    <p class="subline">${t('c2.nCatHint',t('c2.save'))}</p>
    <div class="row-end"><button class="btn" id="c2nCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="c2nOk">${t('c2.save')}</button></div></div>`;
  document.body.appendChild(m);
  tabThroughFields(m);
  const nm=m.querySelector('#c2nName');nm.focus();
  const close=()=>m.remove();
  const ok=()=>{
    const name=nm.value.trim();
    if(!name){nm.focus();return;}
    const ex=c2ByName(name);
    if(ex){W.target=ex.tid;warn(t('c2.nDup',name));}
    else{W.newT.push({tid:'n:'+name,name:name,income:false});W.target='n:'+name;}
    close();c2Render();
    if(done)done();
  };
  m.querySelector('#c2nCancel').onclick=close;
  m.querySelector('#c2nOk').onclick=ok;
  nm.onkeydown=e=>{if(e.key==='Enter')ok();};
}

/* Flexible Kosten mit Kategoriespalte: je Wert eine Regel mit
   genauem Vergleich — vorhandene Kategorien am Namen erkannt. */
/* Nach einem Klick auf ein Kästchen wird **nicht** neu gezeichnet:
   die Tabelle darunter ist lang, und wer zwanzig Zeilen markiert,
   verlöre bei jedem Haken seine Stelle. Nachgeführt wird nur, was
   sich wirklich ändert — der Zähler am Knopf und das Kästchen im
   Spaltenkopf. */
function c2RefreshHead(){
  const pa=W.box.querySelector('[data-c2pickall]');
  if(pa){
    const vis=c2Visible().filter(i=>W.meta[i].in&&W.asg[i]<0);
    const allOn=vis.length>0&&vis.every(i=>W.pick[i]);
    pa.checked=allOn;
    pa.dataset.c2pickall=allOn?'0':'1';
    pa.title=t(allOn?'c2.pickNone':'c2.pickAll',vis.length);
  }
}

/* ── Einmalig zuordnen, was von Hand markiert ist ─────────────
   **Gefragt wird vorher.** Eine Handauswahl entsteht über viele
   Klicks und ist von außen nicht nachzuvollziehen — anders als ein
   Filter, den man in der Zeile darüber liest. Das Fenster zeigt
   deshalb noch einmal, welche Zeilen wohin gehen; wer abbricht,
   behält seine Markierung und hat nichts verändert. */
function c2PickAssign(){
  const sel=c2Picked();
  if(!sel.length||!W.target)return;
  const x=c2Find(W.target);
  if(!x)return;
  const CAP=12;
  const line=i=>{
    const r=W.csv.rows[i],d=W.meta[i].d;
    const dt=d?`${String(d.d).padStart(2,'0')}.${String(d.m).padStart(2,'0')}.`:'';
    const txt=refsText(c2Refs(r));
    return `<p class="c2plrow"><span class="d">${esc(dt)}</span>
      <span class="v">${eur(c2BookVal(i,x.income))}</span>
      <span class="n">${esc(String(txt||''))}</span></p>`;
  };
  const m=document.createElement('div');
  m.className='modal';
  m.innerHTML=`<div class="box narrow">
    <h3>${t('c2.pickTitle')}</h3>
    <p class="subline">${t('c2.pickIntro',sel.length,esc(x.name))}</p>
    <div class="dgrp c2plist">${sel.slice(0,CAP).map(line).join('')}
      ${sel.length>CAP?`<p class="c2plmore">${t('c2.srcMore',sel.length-CAP)}</p>`:''}</div>
    <p class="subline">${t('c2.pickNote')}</p>
    <div class="row-end"><button class="btn" id="c2pCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="c2pOk">${t('c2.pickOk')}</button></div></div>`;
  document.body.appendChild(m);
  tabThroughFields(m);
  const close=()=>m.remove();
  m.querySelector('#c2pCancel').onclick=close;
  m.querySelector('#c2pOk').onclick=()=>{
    /* Erst hier entsteht die Regel — vorher ist nichts geschehen.
       `once` steht fest: eine Liste von Zeilennummern lässt sich
       nicht merken (siehe c2ApplyRules). */
    W.rules.push({pick:sel.slice(),t:x,once:true});
    c2ApplyRules();
    /* **Der Modus bleibt an** (seit 30.8.26): wer einmalig zuordnet,
       hat meist mehrere Posten vor sich — der nächste fängt gleich
       mit dem Markieren an. Aus dem Modus führt nur der Knopf. */
    W.pick={};W.target='';
    close();c2Render();
    toast(t('c2.tAssignedOnce',sel.length,x.name));
  };
  m.querySelector('#c2pOk').focus();
}

/* Was der Knopf getan hat, sagt ein Fenster und keine Kurzmeldung.
   Es sind zwei Zahlen und eine Farbe — eine Kurzmeldung, die nach
   drei Sekunden verschwindet, ist der falsche Ort dafür: sie ist
   das Einzige, was erklärt, warum die halbe Liste plötzlich gelb
   ist, und man liest sie im selben Moment, in dem man die Änderung
   ansieht. */
/* **Gezählt wird, was wirklich neu ist** — dieselbe Frage wie das
   Gelb im Zielbereich (changes/hasNew in c2TopTable): eine Zeile
   zählt, wenn ihr Monat noch offen ist oder ein anderer Betrag
   herauskäme als der, der schon im Buch steht; was die gemerkte
   Zuordnung nur wiedergefunden hat, zählt nicht. Sonst meldete
   das Fenster „19 Zeilen zugeordnet", obwohl 16 davon längst im
   Buch stehen — und genau die Zahl ist es, deretwegen man das
   Fenster liest. */
/* `from` zählt nur Zeilen an Regeln ab dieser Nummer — das Fenster
   nach dem Anwenden der gemerkten Zuordnung soll sagen, was **dieser**
   Handgriff gebracht hat, nicht, was in der Sitzung schon davor
   zugeordnet war. */
function c2NewCount(from){
  const B=c2Buckets();
  from=from||0;
  let targets=0,rows=0;
  B.order.forEach(tid=>{
    const b=B.by[tid];
    if(!b.rows.length)return;
    const raw=tid.indexOf('i:')===0?state.fixed.find(x=>'i:'+x.id===tid):null;
    const kk=tid.indexOf('k:')===0?tid.slice(2):null;
    const doneAt=m=>raw?!!paidAt(raw,m):(kk?!!kakDone(kk,m):false);
    const bookAt=m=>raw?(raw.amounts[m-1]||0):(kk?kakVal(kk,m):0);
    const changes=m=>{
      if(!b.cnt[m])return false;
      if(!doneAt(m))return true;
      return Math.round((b.months[m]-bookAt(m))*100)!==0;
    };
    const nu=b.rows.filter(i=>{
      if(W.asg[i]<from)return false;
      if(!(W.rules[W.asg[i]]||{}).fromMap)return true;
      const d=W.meta[i].d;
      return !!d&&changes(d.m);
    });
    if(nu.length){targets++;rows+=nu.length;}
  });
  return {targets:targets,rows:rows};
}

function c2AutoDone(made,lines,title){
  const m=document.createElement('div');
  m.className='modal';
  m.innerHTML=`<div class="box narrow">
    <h3>${title||t('c2.autoTitle')}</h3>
    <div class="dgrp c2sum">
      <p class="c2sumrow"><b>${made}</b><span>${t('c2.autoTargets')}</span></p>
      <p class="c2sumrow"><b>${lines}</b><span>${t('c2.autoLines')}</span></p>
    </div>
    <p class="subline">${t('c2.autoMark')}</p>
    <div class="row-end"><button class="btn primary" id="c2aOk">${t('g.close')}</button></div></div>`;
  document.body.appendChild(m);
  tabThroughFields(m);
  const ok=m.querySelector('#c2aOk');
  ok.onclick=()=>m.remove();
  ok.focus();
}

/* ── Anwenden: erst jetzt wird das Buch angefasst ────────────
   Regulär: je Ziel die Monatssummen in amounts, dazu paid und
   das blaue imp-Siegel; neue Posten entstehen über normalize().
   Flexibel: wie der Fast-Budget-Import — die berührten Monate
   werden ersetzt (tx, flexActual, flexSource), neue Kategorien
   entstehen über blankKak(). Danach die Zuordnung ins Buch
   merken (state.csvMaps), save() und render(). */
function c2Apply(){
  const B=c2Buckets();
  /* **Ohne Zuordnung schließt der Knopf nur** (5.9.26): er heißt
     „Wizard schließen", und wer nichts zugeordnet hat, erwartet
     genau das — keine Meldung, die ihn festhält. Gemerkt wird, was
     zu merken ist (eine Regel, die gerade keine Zeile trifft, ist
     trotzdem eine Regel); die Kurzmeldung sagt, dass nichts
     importiert wurde. */
  if(!B.order.length){
    if(c2StoreRules())save();
    c2Close();render();
    toast(t('c2.closedNone'));
    return;
  }
  if(W.kind==='reg'){
    let nItems=0,nMonths=0;
    B.order.forEach(tid=>{
      const b=B.by[tid];
      let it=null;
      if(tid.indexOf('i:')===0){
        const id=tid.slice(2);
        it=state.fixed.find(x=>String(x.id)===id)||state.fixed.find(x=>x.name===b.t.name);
      }else{
        /* Sicherheitsgurt gegen Zwillinge: heißt ein „neues" Ziel
           wie ein vorhandener Posten, ist es dieser Posten —
           angelegt wird nur, was es wirklich noch nicht gibt
           (dieselbe Versöhnung wie beim Anwenden der gemerkten
           Zuordnung, siehe applyMap in c2Wire). */
        it=state.fixed.find(x=>x.name===b.t.name);
      }
      if(!it){
        const nt=W.newT.find(x=>x.tid===tid)||b.t;
        it=normalize({id:uid(),name:b.t.name,group:nt.group||'',amounts:Array(12).fill(0)});
        it.bank=nt.bank||'';it.pay=nt.pay||'';it.dueDay=nt.due||'';
        state.fixed.push(it);
      }
      nItems++;
      /* **Die Quellzeilen wandern mit ins Buch** (it.impRows, je
         Monat eine Liste aus Datum, Betrag und den drei
         Referenzen): ein Posten führt sonst nur seine zwölf
         Summen, und beim nächsten Import stünde unter „aus einem
         früheren Import" nichts als der Monat — die Buchungen, aus
         denen er entstand, will man aber wiedersehen (srcLines in
         c2TopTable). Bis 5.9.26 stand hier ein zusammengesetzter
         Text aus allen übrigen Spalten (`x`); ältere Dateien tragen
         ihn weiter, gelesen wird beides (impRowText). */
      for(let m=1;m<=12;m++){
        if(!b.cnt[m])continue;
        it.amounts[m-1]=b.months[m];
        it.paid[m-1]=true;
        /* **1 gemerkt, 2 einmalig** (siehe impOnceAt in js/calc.js).
           Einmalig ist der Monat, sobald **eine** seiner Zeilen aus
           einer nicht gemerkten Regel kam: der Wert als Ganzes käme
           beim nächsten Import dann nicht mehr zustande, und genau
           das sagt der rote Kreis. */
        it.imp[m-1]=b.rows.some(i=>W.meta[i].d.m===m&&(W.rules[W.asg[i]]||{}).once)?2:1;
        it.impRows=it.impRows||{};
        it.impRows[m]=b.rows.filter(i=>W.meta[i].d.m===m).map(i=>{
          const row=W.csv.rows[i],d=W.meta[i].d;
          return {d:String(d.d).padStart(2,'0')+'.'+String(d.m).padStart(2,'0')+'.'+String(d.y%100).padStart(2,'0'),
            v:c2BookVal(i,b.t.income),r:c2Refs(row)};
        });
        nMonths++;
      }
    });
    c2StoreRules();
    save();c2Close();render();
    toast(t('c2.doneReg',nItems,nMonths));
  }else{
    /* Die berührten Monate werden ersetzt — dieselbe Regel wie
       applyImport() in js/csv.js, nur mit unseren Zeilen. */
    const months=new Set();
    W.csv.rows.forEach((row,i)=>{if(W.asg[i]>=0)months.add(W.meta[i].d.m);});
    /* Gab es vorher keine Buchungen, stand „Fast Budget Details"
       auf „nur Hauptkategorien" und der Knopf daneben war gesperrt
       (afterLoad in js/state.js). Mit dem ersten Import gibt es
       Unterkategorien — dann sollen sie auch zu sehen sein. Wer sie
       später selbst abwählt, behält seine Wahl. Dieselbe Regel wie
       im Fast-Budget-Import (js/dialogs/csv-import.js). */
    const hadTx=state.tx.length>0;
    const added=[];
    B.order.forEach(tid=>{
      const k=B.by[tid].t.name;
      if(!state.kakCats.includes(k)){state.kakCats.push(k);state.kak[k]=blankKak(0);added.push(k);}
    });
    state.tx=state.tx.filter(x=>!months.has(x.m));
    months.forEach(m=>{
      state.kakCats.forEach(k=>{state.flexActual[m][k]=0;
        if(state.kak[k]&&state.kak[k].override)state.kak[k].override[m-1]=null;});
      state.flexSource[m]=W.csv.name;
    });
    let nTx=0;
    W.csv.rows.forEach((row,i)=>{
      const ri=W.asg[i];
      if(ri==null||ri<0)return;
      const d=W.meta[i].d,main=W.rules[ri].t.name;
      const v=W.neg?W.meta[i].v:-W.meta[i].v;
      /* Eine Buchung trägt seit 5.9.26 ihre vier Referenzen (r)
         statt Unterkategorie, Konto und Beschreibung — die alten
         Felder cat/acc/note schreibt der Import nicht mehr, ältere
         Buchungen behalten sie (txSub/txNote in js/calc.js lesen
         beides). */
      const x={y:d.y,m:d.m,d:d.d,main:main,v:v,r:c2Refs(row)};
      /* Nur gesetzt, wenn es zutrifft — ein `once:false` an jeder
         Buchung bläht die Datei um ein Feld auf, das nichts sagt. */
      if(W.rules[ri].once) x.once=1;
      state.tx.push(x);
      state.flexActual[d.m][main]=(state.flexActual[d.m][main]||0)+v;
      nTx++;
    });
    months.forEach(m=>{state.kakCats.forEach(k=>{
      state.flexActual[m][k]=Math.round((state.flexActual[m][k]||0)*100)/100;});});
    state.lastImport=new Date().toLocaleString('de-DE');
    if(!hadTx&&W.f.ref1>=0) ui.kakDetail=true;
    c2StoreRules();
    save();c2Close();render();
    toast(t('c2.doneFlex',nTx,months.size));
  }
}

/* ── Die Kriterien am Posten ablegen ──────────────────────────
   (5.9.26; bis dahin c2Remember, das die Regeln je Datei-Art in
   state.csvMaps schrieb.) Jeder Posten der gewählten Art bekommt
   als Importkriterien genau die Regeln, die im Wizard auf ihn
   zeigen — aus W.rules (angewendet) und W.mapRules (gemerkt, aber in
   diesem Lauf nicht angewendet: sie sollen nicht verloren gehen,
   nur weil man sie diesmal nicht gebraucht hat). Ein Posten, auf
   den keine mehr zeigt, verliert seine: wer eine Zuordnung im
   Wizard zurücksetzt, meint das so. Posten der **anderen** Art
   bleiben unberührt — ihre Regeln waren nie im Wizard.

   **Einmalige Zuordnungen bleiben draußen** — das ist ihr ganzer
   Zweck —, ebenso Handauswahlen (pick) und der Schnellfilter
   ('q': eine Sichthilfe über alle Felder, keine Aussage über eine
   Zeile). Eine Regel, die nur daraus bestand, wird nicht gemerkt.

   **Ein Ziel, das es noch nicht gibt** („n:…") und Regeln trägt,
   wird angelegt — auch ohne eine einzige Zeile in dieser Datei: die
   Regel soll beim nächsten Import greifen, und dafür braucht sie
   ihren Posten. Ein regulärer Posten braucht dafür seine Kategorie
   (aus W.newT); fehlt sie, fällt die Regel weg. */
function c2StoreRules(){
  const by={};
  W.rules.concat(W.mapRules||[]).forEach(r=>{
    if(!r||r.once||r.pick||!r.t||!r.t.tid)return;
    const terms=c2CleanTerms((r.terms||[]).filter(tm=>tm.f!=='q'));
    if(!terms.length)return;
    (by[r.t.tid]=by[r.t.tid]||[]).push({terms:terms});
  });
  Object.keys(by).forEach(tid=>{
    if(tid.indexOf('n:')!==0)return;
    const nm=tid.slice(2);
    let x=c2BookByName(nm);
    if(!x){
      if(W.kind==='flex'){
        if(!state.kakCats.includes(nm))state.kakCats.push(nm);
        state.kak[nm]=state.kak[nm]||blankKak(0);
      }else{
        const nt=W.newT.find(y=>y.tid===tid);
        if(nt&&nt.group){
          const it=normalize({id:uid(),name:nm,group:nt.group,amounts:Array(12).fill(0)});
          it.bank=nt.bank||'';it.pay=nt.pay||'';it.dueDay=nt.due||'';
          state.fixed.push(it);
        }
      }
      x=c2BookByName(nm);
    }
    if(x)by[x.tid]=(by[x.tid]||[]).concat(by[tid]);
    delete by[tid];
  });
  let changed=false;
  const put=(host,tid)=>{
    const rules=by[tid]||[];
    const before=JSON.stringify(host.impRules||null);
    if(rules.length)host.impRules=rules; else delete host.impRules;
    if(JSON.stringify(host.impRules||null)!==before)changed=true;
  };
  if(W.kind==='flex')kakCats().forEach(k=>{if(state.kak[k])put(state.kak[k],'k:'+k);});
  else state.fixed.forEach(it=>put(it,'i:'+it.id));
  return changed;
}

/* ══ Alle Importkriterien auf einmal ═══════════════════════════
   (5.9.26) Erreichbar über das ☰-Menü in der Zuordnungsleiste des
   Imports: „Alle gemerkten Importkriterien zeigen". Bis dahin stand
   hier das Fenster „Filterkriterien" **einer Datei-Art** — auch
   hinter dem Stift in den Einstellungen. Seit die Kriterien am
   Posten wohnen, zeigt es je Posten der gewählten Art seine Regeln:
   je Regel ein Block mit dem Posten oben und den Bedingungen
   darunter — Feld · Vergleichsart · Wert · ✕ —, dazu „+ Bedingung"
   und ein ✕ an der Regel. Der Posten steht nur da und ist nicht zu
   ändern: ein anderer Name wäre ein anderer Posten.

   Gearbeitet wird auf einer **Arbeitskopie**; in die Datei kommt
   erst „Speichern". Zwei Grenzen wie im Block „Importkriterien" der
   Fenster: eine Bedingung bleibt stehen (eine Regel ohne träfe jede
   Zeile), ein leerer Wert hält das Speichern auf. Steht der Wizard
   dabei offen, liest er die Regeln danach neu ein (c2LoadMapRules),
   damit sein Angebot zum Buch passt. */
function openImpRules(kind,done){
  /* **`kind` ist 'reg', 'flex' oder 'all'** (5.9.26 spät): der
     Import ruft es für seine Art, die Einstellungen (#impCrit) für
     alles. Gegliedert wird wie der Zielbereich des Imports —
     Einnahmen · Regelmäßige Kosten, darin je Kategorie, dann die
     Flexible Payments —, damit man einen Posten dort findet, wo man
     ihn im Import sieht. Die Regel-Blöcke bleiben eine flache Liste
     (`groups`, daran hängen die Kennungen gi.ri.ti); die Gliederung
     ist nur Überschrift. Die Bedingungen nennen FINA-Felder, nie
     Spalten — sie gelten für jede Datei-Art. */
  const all=kind==='all';
  const rulesOf=e=>(e.impRules||[]).map(r=>({terms:c2CleanTerms(r&&r.terms)})).filter(r=>r.terms.length);
  const mk=hosts=>hosts.map(h=>({name:h.name,e:h.e,cat:h.cat||'',rules:rulesOf(h.e)})).filter(g=>g.rules.length);
  const regs=(all||kind==='reg')?(state.fixed||[]).map(it=>({name:it.name,e:it,income:isIncome(it),cat:it.group||''})):[];
  const flex=(all||kind==='flex')?kakCats().map(k=>({name:k,e:state.kak[k]})).filter(h=>h.e):[];
  const sections=[
    {cls:'g-in',label:t('c2.blkIn'),groups:mk(regs.filter(h=>h.income))},
    {cls:'g-out',label:t('c2.blkOut'),groups:mk(regs.filter(h=>!h.income))},
    {cls:'g-flex',label:t('c2.blkFlex'),groups:mk(flex)}].filter(s=>s.groups.length);
  const groups=[];
  sections.forEach(s=>s.groups.forEach(g=>groups.push(g)));
  if(!groups.length){ warn(t('cme.none')); if(done)done(); return; }
  const box=document.createElement('div');
  box.className='modal';
  document.body.appendChild(box);
  const termRow=(gi,ri,ti,tm)=>`<div class="cmerow">
      <select data-cmf="${gi}.${ri}.${ti}">
        ${C2_FIELDS.map(f=>`<option value="${f}"${tm.f===f?' selected':''}>${esc(c2FieldLabel(f))}</option>`).join('')}
      </select>
      <select data-cmop="${gi}.${ri}.${ti}">
        ${C2_OPS.map(o=>`<option value="${o}"${tm.op===o?' selected':''}>${esc(c2OpLabel(o))}</option>`).join('')}
      </select>
      <input data-cmval="${gi}.${ri}.${ti}" value="${esc(tm.val)}" placeholder="${esc(t('cme.val'))}">
      <button type="button" class="linkish" data-cmtrm="${gi}.${ri}.${ti}" title="${esc(t('cme.delTerm'))}">&#10005;</button>
    </div>`;
  /* **Der Rollstand bleibt**: jede Änderung baut das Fenster neu,
     gemessen wird vor dem Umbau, gesetzt danach. */
  const draw=()=>{
    const was=box.querySelector('.dbody');
    const st=was?was.scrollTop:0;
    let body='';
    const block=(g,gi)=>g.rules.map((r,ri)=>`<div class="dgrp cmerule">
      <div class="cmehead"><span class="cmelab">${esc(t('cme.assigns'))}</span>
        <b>${esc(g.name)}</b>
        <button type="button" class="linkish cmedel" data-cmrule="${gi}.${ri}"
          title="${esc(t('cme.delRule'))}">&#10005;</button></div>
      ${r.terms.map((tm,ti)=>termRow(gi,ri,ti,tm)).join('')}
      <button type="button" class="btn small" data-cmadd="${gi}.${ri}">${esc(t('cme.addTerm'))}</button>
    </div>`).join('');
    sections.forEach(s=>{
      const live=s.groups.filter(g=>g.rules.length);
      if(!live.length)return;
      body+=`<p class="c2mph cmesec ${s.cls}">${esc(s.label)}</p>`;
      /* Je Kategorie eine Zwischenzeile — nur, wo es mehr als eine
         gibt oder sie einen Namen hat, wie im Fenster der gemerkten
         Kriterien (c2MapPick). */
      const cats=[];
      live.forEach(g=>{if(!cats.includes(g.cat))cats.push(g.cat);});
      cats.forEach(c=>{
        if(cats.length>1||c)body+=`<p class="c2mpcat">${esc(c?keyLabel(c):'—')}</p>`;
        live.filter(g=>g.cat===c).forEach(g=>{body+=block(g,groups.indexOf(g));});
      });
    });
    if(!body)body=`<p class="note">${esc(t('cme.gone'))}</p>`;
    box.innerHTML=`<div class="box narrow split cmebox">
      <h3>${esc(t('cme.title'))}</h3>
      <p class="subline">${esc(t('cme.sub'))}</p>
      <div class="dbody">${body}</div>
      <p class="errline" id="cmeErr" hidden></p>
      <div class="row-end"><button class="btn" id="cmeCancel">${esc(t('g.cancel'))}</button>
        <button class="btn primary" id="cmeSave">${esc(t('g.save'))}</button></div></div>`;
    wire();
    tabThroughFields(box);
    const now=box.querySelector('.dbody');
    if(now)now.scrollTop=st;
  };
  const at=key=>{const [a,b,c]=key.split('.').map(Number);return groups[a].rules[b].terms[c];};
  const close=()=>{ box.remove(); if(done)done(); };
  box._close=close;          /* auch für Escape (js/ui.js) */
  const wire=()=>{
    box.querySelectorAll('[data-cmf]').forEach(s=>{s.onchange=()=>{at(s.dataset.cmf).f=s.value;};});
    box.querySelectorAll('[data-cmop]').forEach(s=>{s.onchange=()=>{at(s.dataset.cmop).op=s.value;};});
    box.querySelectorAll('[data-cmval]').forEach(i=>{i.oninput=()=>{at(i.dataset.cmval).val=i.value;};});
    box.querySelectorAll('[data-cmtrm]').forEach(b=>{b.onclick=()=>{
      const [gi,ri,ti]=b.dataset.cmtrm.split('.').map(Number);
      if(groups[gi].rules[ri].terms.length<2){ warn(t('cme.keepOne')); return; }
      groups[gi].rules[ri].terms.splice(ti,1);draw();
    };});
    box.querySelectorAll('[data-cmadd]').forEach(b=>{b.onclick=()=>{
      const [gi,ri]=b.dataset.cmadd.split('.').map(Number);
      const r=groups[gi].rules[ri];
      r.terms.push({f:r.terms.length?r.terms[0].f:'ref1',op:'has',val:''});
      draw();
      const nv=box.querySelector(`[data-cmval="${gi}.${ri}.${r.terms.length-1}"]`);
      if(nv)nv.focus();
    };});
    box.querySelectorAll('[data-cmrule]').forEach(b=>{b.onclick=()=>{
      const [gi,ri]=b.dataset.cmrule.split('.').map(Number);
      groups[gi].rules.splice(ri,1);draw();
    };});
    box.querySelector('#cmeCancel').onclick=close;
    box.querySelector('#cmeSave').onclick=()=>{
      const bad=groups.some(g=>g.rules.some(r=>r.terms.some(tm=>!String(tm.val).trim())));
      const err=box.querySelector('#cmeErr');
      if(bad){
        err.textContent=t('cme.needVal');err.hidden=false;
        const e2=[...box.querySelectorAll('[data-cmval]')].find(i=>!i.value.trim());
        if(e2)e2.focus();
        return;
      }
      groups.forEach(g=>{
        const rules=g.rules.map(r=>({terms:c2CleanTerms(r.terms)})).filter(r=>r.terms.length);
        if(rules.length)g.e.impRules=rules; else delete g.e.impRules;
      });
      save();
      if(W&&W.step===3&&W.modal&&W.modal.isConnected&&(all||W.kind===kind)){c2LoadMapRules();c2ApplyRules();c2Render();}
      close();
      toast(t('cme.saved'));
    };
  };
  draw();
}

/* ══ Importkriterien im Posten- und im Kategorie-Fenster ═══════
   Unter den Monatskacheln steht seit 5.9.26 ein Block mit den
   Regeln, die ein CSV-Import **auf diesen** Posten (oder diese
   flexible Kategorie) anwendet — seine Bedingungen, in derselben
   Bauform wie das Fenster „Importkriterien" (openImpRules): Feld ·
   Vergleichsart · Wert · ✕, dazu „+ Bedingung" und rechts unten
   „Importkriterien löschen". Ohne Regel gibt es den Block nicht: die
   meisten Posten haben keine, und ein leerer Kasten in jedem
   Fenster sagte nichts.

   **Gearbeitet wird auf einer Arbeitskopie** (impCritLoad), und in
   die Datei kommt sie mit „Speichern" des Fensters (impCritCommit)
   — wie Name, Beträge und Links. Wer abbricht, hinterlässt nichts,
   auch nach „Importkriterien löschen" nicht. Die Regeln wohnen am
   Posten selbst (it.impRules / kak[k].impRules, Struktur
   v260905-3); ein anderes Ziel gibt es hier nicht zu wählen.

   Dieselben Grenzen wie dort: eine Bedingung bleibt stehen (eine
   Regel ohne träfe jede Zeile), und ein leerer Wert hält das
   Speichern auf (impCritCheck). Neue Regeln entstehen hier nicht —
   dafür braucht es die Zeilen einer Datei, also den Wizard. */
/* **Steht der Wizard im dritten Schritt, gilt sein Stand** für die
   Posten seiner Art. Aus dem Wizard heraus öffnet „Posten öffnen"
   das Fenster, und was dort gerade zugeordnet und gemerkt ist
   (W.rules) oder noch aus dem Buch wartet (W.mapRules), ist die
   Wahrheit dieser Sitzung — die Datei bekommt sie erst mit „Fertig"
   (c2StoreRules). Läse das Fenster allein den Posten, fehlte die
   eben angelegte Regel, und eine im Wizard geänderte stünde mit
   ihren alten Bedingungen da. Einmalige Zuordnungen (once),
   Handauswahlen (pick) und der Schnellfilter ('q') bleiben draußen:
   sie werden nicht gemerkt. `ref` ist die Regel im Wizard, `book`
   ihre Fassung am Posten, falls es sie gibt; beides braucht
   impCritCommitLive(). */
function impCritLive(tid){
  if(!W||W.step!==3||!W.csv)return null;
  const mine=(W.kind==='flex')===(String(tid).indexOf('k:')===0);
  if(!mine)return null;
  const rs=[];
  [W.rules,W.mapRules].forEach(list=>(list||[]).forEach(r=>{
    if(!r||!r.t||r.t.tid!==tid||r.once||r.pick)return;
    const terms=c2CleanTerms((r.terms||[]).filter(tm=>tm.f!=='q'));
    if(terms.length)rs.push({ref:r,book:r.book||null,terms:terms});
  }));
  return {host:c2Host(tid),rules:rs,del:false,live:true};
}
function impCritLoad(tid){
  const live=impCritLive(tid);
  if(live)return live.rules.length?[live]:[];
  const host=c2Host(tid);
  if(!host)return [];
  const rs=(host.impRules||[]).map((r,ri)=>({ri:ri,terms:c2CleanTerms(r&&r.terms)})).filter(r=>r.terms.length);
  return rs.length?[{host:host,rules:rs,del:false}]:[];
}
function impCritHtml(work){
  if(!work.length)return '';
  const live=work.filter(w=>!w.del);
  const termRow=(wi,ri,ti,tm)=>{
    const key=`${wi}.${ri}.${ti}`;
    return `<div class="cmerow">
      <select data-icf="${key}">
        ${C2_FIELDS.map(f=>`<option value="${f}"${tm.f===f?' selected':''}>${esc(c2FieldLabel(f))}</option>`).join('')}
      </select>
      <select data-icop="${key}">
        ${C2_OPS.map(o=>`<option value="${o}"${tm.op===o?' selected':''}>${esc(c2OpLabel(o))}</option>`).join('')}
      </select>
      <input data-icval="${key}" value="${esc(tm.val)}" placeholder="${esc(t('cme.val'))}">
      <button type="button" class="linkish" data-ictrm="${key}" title="${esc(t('cme.delTerm'))}">&#10005;</button>
    </div>`;
  };
  /* Mehrere Regeln stehen mit einer Haarlinie dazwischen.
     **„Importkriterien löschen" steht auf derselben Zeile wie das
     letzte „+ Bedingung"**, rechts außen: beide sind Handgriffe an
     der Liste, nicht an einer einzelnen Bedingung. */
  const rules=[];
  live.forEach(w=>{const wi=work.indexOf(w);w.rules.forEach((r,ri)=>rules.push([w,wi,r,ri]));});
  const body=rules.length?rules.map((x,n)=>{
    const [w,wi,r,ri]=x,lastOne=n===rules.length-1;
    /* **Hellgelb, was erst der offene Import bringt** (w.live ohne
       r.book): dieselbe Farbe wie die schwebenden Monate darüber
       und die Zeilen der Liste daneben — „kommt neu herein und
       steht noch nicht in der Datei". Die Sprechblase kommt nur von
       der Maus (data-tiphover): drinnen wird getippt. */
    const pend=w.live&&!r.book;
    return `<div class="icrule${pend?' pend':''}"${pend?` data-tip="${esc(t('icrit.pendTip'))}" data-tiphover="1"`:''}>
      ${r.terms.map((tm,ti)=>termRow(wi,ri,ti,tm)).join('')}
      <div class="icbar"><button type="button" class="btn small" data-icadd="${wi}.${ri}">${esc(t('cme.addTerm'))}</button>
        ${lastOne?`<button type="button" class="btn small icdel" data-icdel>${esc(t('icrit.del'))}</button>`:''}</div>
    </div>`;
  }).join(''):`<p class="note icgone">${esc(t('icrit.gone'))}</p>`;
  return `<div class="dgrp impcrit" id="impCrit"><div class="field">
    <label>${esc(t('icrit.title'))}</label>
    <p class="note">${esc(t('icrit.sub'))}</p>
    ${body}</div></div>`;
}
/* `nameOf` liest den Namen aus dem Fenster — im Zustand kann er
   gerade umbenannt worden sein. */
function impCritWire(box,work,nameOf){
  const root=box.querySelector('#impCrit');
  if(!root)return;
  const at=key=>{const [a,b,c]=key.split('.').map(Number);return work[a].rules[b].terms[c];};
  /* Der Block baut sich nach jeder Änderung neu — in der Rollfläche
     des Fensters, die dabei stehen bleibt, wo sie war. */
  const redraw=()=>{
    const sc=box.querySelector('.dbody'),st=sc?sc.scrollTop:0;
    root.outerHTML=impCritHtml(work);
    const fresh=box.querySelector('#impCrit');
    if(fresh)tabThroughFields(fresh);
    impCritWire(box,work,nameOf);
    if(sc)sc.scrollTop=st;
  };
  root.querySelectorAll('[data-icf]').forEach(s=>{s.onchange=()=>{at(s.dataset.icf).f=s.value;};});
  root.querySelectorAll('[data-icop]').forEach(s=>{s.onchange=()=>{at(s.dataset.icop).op=s.value;};});
  root.querySelectorAll('[data-icval]').forEach(i=>{i.oninput=()=>{at(i.dataset.icval).val=i.value;};});
  root.querySelectorAll('[data-ictrm]').forEach(b=>{b.onclick=()=>{
    const [wi,ri,ti]=b.dataset.ictrm.split('.').map(Number);
    const r=work[wi].rules[ri];
    if(r.terms.length<2){warn(t('cme.keepOne'));return;}
    r.terms.splice(ti,1);redraw();
  };});
  root.querySelectorAll('[data-icadd]').forEach(b=>{b.onclick=()=>{
    const [wi,ri]=b.dataset.icadd.split('.').map(Number);
    const r=work[wi].rules[ri];
    r.terms.push({f:r.terms.length?r.terms[0].f:'ref1',op:'has',val:''});
    redraw();
    const last=[...box.querySelectorAll(`[data-icval^="${wi}.${ri}."]`)].pop();
    if(last)last.focus();
  };});
  const del=root.querySelector('[data-icdel]');
  if(del)del.onclick=()=>{
    if(!confirm(t('icrit.delAsk',nameOf())))return;
    work.forEach(w=>{w.del=true;});
    redraw();
  };
}
/* Vor dem Speichern: kein leerer Wert. Gesagt wird es als
   Kurzmeldung, und die Schreibmarke steht danach im leeren Feld. */
function impCritCheck(box,work){
  for(const w of work){
    if(w.del)continue;
    for(const r of w.rules)for(const tm of r.terms){
      if(String(tm.val).trim())continue;
      warn(t('cme.needVal'));
      const el=[...box.querySelectorAll('[data-icval]')].find(i=>!i.value.trim());
      if(el)el.focus();
      return false;
    }
  }
  return true;
}
/* Die Arbeitskopie an den Posten schreiben. */
function impCritCommit(work){
  work.forEach(w=>{
    if(w.live){impCritCommitLive(w);return;}
    const host=w.host;
    if(!host)return;
    if(w.del){delete host.impRules;return;}
    const rules=w.rules.map(r=>({terms:c2CleanTerms(r.terms)})).filter(r=>r.terms.length);
    if(rules.length)host.impRules=rules; else delete host.impRules;
  });
}
/* **Mit offenem Wizard schreibt sich das Fenster in den Wizard.**
   Seine Regeln stehen erst mit „Fertig" am Posten — also ändert das
   Fenster sie an Ort und Stelle (r.ref, die Regel in W.rules oder
   W.mapRules) und ordnet danach neu zu, damit der Zielbereich das
   Geänderte zeigt, sobald das Fenster zugeht (c2Detail zeichnet ihn
   dann). Der Schnellfilter einer Regel ('q') bleibt dabei stehen:
   das Fenster kennt ihn nicht, und ohne ihn träfe die Regel mehr
   Zeilen als vorher.

   **Was schon am Posten steht, wird dort mitgeschrieben** (r.book):
   „Speichern" im Fenster ist ein Speichern — wer den Wizard danach
   ohne Import schließt, soll seine Änderung nicht verlieren. Eine
   Regel, die es nur im Wizard gibt, kann nur er schreiben; bis
   dahin steht sie hellgelb (impCritHtml).

   Beim Löschen fällt die Regel aus beiden Listen und vom Posten;
   die gerade bearbeitete Regel (W.editRule) wird am Objekt
   wiedergefunden, denn ihre Nummer verschiebt sich dabei. */
function impCritCommitLive(w){
  if(!W||W.step!==3)return;
  const host=w.host;
  if(w.del){
    const drop=new Set(w.rules.map(r=>r.ref));
    const books=new Set(w.rules.map(r=>r.book).filter(Boolean));
    const er=W.editRule!=null?W.rules[W.editRule]:null;
    W.rules=W.rules.filter(r=>!drop.has(r));
    W.editRule=er&&!drop.has(er)?W.rules.indexOf(er):null;
    if(W.mapRules){
      W.mapRules=W.mapRules.filter(r=>!drop.has(r));
      if(!W.mapRules.length){W.mapRules=null;W.autoDone=true;}
    }
    if(host&&Array.isArray(host.impRules)&&books.size){
      host.impRules=host.impRules.filter(r=>!books.has(r));
      if(!host.impRules.length)delete host.impRules;
    }
  }else{
    w.rules.forEach(r=>{
      const terms=c2CleanTerms(r.terms);
      r.ref.terms=(r.ref.terms||[]).filter(tm=>tm.f==='q').concat(terms);
      if(r.book)r.book.terms=terms.map(tm=>({f:tm.f,op:tm.op,val:tm.val}));
    });
  }
  c2ApplyRules();
}
