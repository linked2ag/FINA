/* ══════════════════════════════════════════════════════════════
   FINA — der generische CSV-Import (Wizard im Popup).

   Drei Schritte: 1 Datei (kleines Fenster) · 2 Spalten & Felder
   (das Fenster streckt sich fast auf die ganze Fläche) · 3 Zuordnen
   (oben die Jahrestabelle aus dem Buch — Einnahmen, Flexible
   Payments, regelmäßige Kosten, gegliedert wie die Jahresmatrix —,
   unten die CSV mit Filtern). „Fertig“ schreibt ins offene Buch:
   reguläre Posten bekommen ihre Monatsbeträge und das blaue
   Import-Siegel, flexible Kategorien laufen wie der
   Fast-Budget-Import in tx, flexActual und flexSource. **Eine Art
   der Datei gibt es seit 6.9.26 nicht mehr**: Importkriterien
   gelten für reguläre wie für flexible Posten gleich, deshalb
   stehen im dritten Schritt alle drei Bereiche, und was eine Zeile
   bekommt, entscheidet allein ihr Ziel. Die Spaltenstruktur wird je
   Datei-Art in state.csvMaps gemerkt (Fingerabdruck der
   Spaltenköpfe) — beim nächsten Hochladen bietet Schritt 1 sie an.

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
  /* **So viele Spalten, wie die breiteste Zeile der Datei hat**
     (6.9.26) — nicht so viele, wie die gewählte Beschriftungszeile
     hat. Wer in Schritt 2 versehentlich eine Titelzeile mit einer
     Zelle als Beschriftung wählt, sah bis dahin nur noch diese eine
     Spalte, und die Datei schien geschrumpft. Die Spalten ohne
     Beschriftung heißen „Spalte n". Der Fingerabdruck kommt weiter
     allein aus den Zellen der Beschriftungszeile: bei einer
     richtigen Wahl ist sie die breiteste, und eine schon gemerkte
     Datei-Art wird weiter erkannt. */
  const n=Math.max(...csv.recs.map(r=>r.length));
  const raw=csv.recs[csv.hIdx].map((h,i)=>h!==''?h:('Spalte '+(i+1)));
  csv.header=raw.slice();
  while(csv.header.length<n)csv.header.push('Spalte '+(csv.header.length+1));
  csv.rows=csv.recs.slice(csv.hIdx+1).map(r=>{
    const o=r.slice(0,n);
    while(o.length<n)o.push('');
    return o;
  });
  csv.fp=c2Fp(raw);
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

/* ── Betrag lesen ────────────────────────────────────────────
   Was Kontoauszüge und Tabellenprogramme an Geld schreiben, und
   das ist mehr, als man denkt (8.9.26 erweitert):

     -73,25 · 73,25- · (73,25)     Minus vorn, hinten, in Klammern
     1.234,56 · 1,234.56           deutsche und englische Tausender
     1'234.56 · 1 234,56           Schweizer Hochkomma, schmales
                                   Leerzeichen (auch geschütztes)
     12,34 € · EUR 12,34 · $12.34  Zeichen und Kürzel, vorn wie hinten
     −12,34 · –12,34               Unicode-Minus und Gedankenstrich

   `parseGermanNumber` reicht dafür nicht. **Erkannt wird nur, was
   auch gerechnet werden kann**: dieselbe Funktion liest die Spalte
   beim Import und entscheidet in Schritt 2, ob eine Spalte das
   Betragsfeld bekommt (c2ColKind). Wer ein Format ergänzt, ergänzt
   damit beides. */
const C2_CUR=/€|\$|£|¥|₣|\bEUR\b|\bUSD\b|\bCHF\b|\bGBP\b|\bJPY\b|\bPLN\b|\bCZK\b|\bSEK\b|\bNOK\b|\bDKK\b|\bHUF\b|\bRON\b/gi;
function c2Amount(s){
  if(s==null)return NaN;
  /* Erst die Hülle: Währung, alle Arten von Leerzeichen (auch
     geschützte und schmale — Excel schreibt sie als Tausender),
     das Schweizer Hochkomma. */
  let x=String(s).replace(C2_CUR,'').replace(/[\s   ']/g,'').replace(/’/g,'');
  if(!x||!/\d/.test(x))return NaN;
  let neg=false;
  /* Klammern heißen Minus — so schreibt es jede Tabellenkalkulation
     im englischen Raum. */
  if(/^\(.*\)$/.test(x)){neg=true;x=x.slice(1,-1);}
  x=x.replace(/[−–—]/g,'-');    /* Unicode-Minus, Gedankenstriche */
  if(/-$/.test(x)){neg=true;x=x.slice(0,-1);}
  if(x[0]==='-'){neg=true;x=x.slice(1);}
  if(x[0]==='+')x=x.slice(1);
  if(!/^[\d.,]+$/.test(x))return NaN;
  if(/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(x))      x=x.replace(/\./g,'').replace(',','.');
  else if(/^\d{1,3}(,\d{3})*(\.\d+)?$/.test(x)) x=x.replace(/,/g,'');
  else                                          x=x.replace(',','.');
  const v=parseFloat(x);
  return isNaN(v)?NaN:(neg?-v:v);
}

/* ── Datum lesen ─────────────────────────────────────────────
   Die gängigen Schreibweisen (8.9.26 erweitert):

     24.08.2026 · 24.08.26 · 24.8.26      Punkt (deutsch)
     2026-08-24 · 2026-08-24T10:15:00     ISO, mit und ohne Uhrzeit
     2026/08/24 · 24-08-2026              Jahr vorn mit Schrägstrich,
                                          Tag vorn mit Strich
     08/24/2026 · 24/08/2026              Schrägstrich (siehe unten)
     20260824                             kompakt, achtstellig
     24. Aug 2026 · 24 August 2026        Monatsname hinter dem Tag
     Aug 24, 2026 · August 24 2026        Monatsname vor dem Tag

   Zweistellige Jahre heißen 20xx.

   **Beim Schrägstrich ist die Reihenfolge nicht zu sehen**:
   `03/04/2026` ist in den USA der 4. März und in Europa der
   3. April. Steht die erste Zahl über 12, kann sie nur der Tag
   sein (Tag zuerst); steht die zweite über 12, nur umgekehrt.
   Bleibt es zweideutig, gilt **Monat zuerst** — so hat FINA es
   immer gelesen, und ein stiller Wechsel verschöbe die Buchungen
   alter Importe. Wer es anders braucht, ändert das Datum im
   Posten-Fenster.

   Wie beim Betrag gilt: **erkannt wird nur, was auch gelesen
   werden kann** — dieselbe Funktion entscheidet in Schritt 2, ob
   eine Spalte das Datumsfeld bekommt (c2ColKind). */
const C2_MON={jan:1,january:1,januar:1,feb:2,february:2,februar:2,mar:3,march:3,mrz:3,'mär':3,maerz:3,'märz':3,
  apr:4,april:4,may:5,mai:5,jun:6,june:6,juni:6,jul:7,july:7,juli:7,aug:8,august:8,
  sep:9,sept:9,september:9,oct:10,october:10,okt:10,oktober:10,nov:11,november:11,dec:12,december:12,dez:12,dezember:12};
function c2Mon(w){const k=String(w||'').toLowerCase().replace(/\.$/,'');return C2_MON[k]||0;}
function c2Yr(y){return +y<100?2000+ +y:+y;}
function c2Date(s){
  if(!s)return null;
  const t2=String(s).trim();
  /* `(?!\d)` und nicht `\b`: nach dem Datum darf alles stehen, nur
     keine weitere Ziffer — sonst risse `2026-08-24T10:15:00` ab,
     weil zwischen `4` und `T` keine Wortgrenze liegt. */
  let m=t2.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?!\d)/);
  if(m)return c2DOk(c2Yr(m[3]),+m[2],+m[1]);
  m=t2.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?!\d)/);
  if(m)return c2DOk(+m[1],+m[2],+m[3]);
  m=t2.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})(?!\d)/);
  if(m)return c2DOk(c2Yr(m[3]),+m[2],+m[1]);
  m=t2.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?!\d)/);
  if(m){
    const a=+m[1],b=+m[2],y=c2Yr(m[3]);
    if(a>12)return c2DOk(y,b,a);                 /* nur der Tag kann über 12 stehen */
    if(b>12)return c2DOk(y,a,b);
    return c2DOk(y,a,b);                          /* zweideutig: Monat zuerst */
  }
  /* 24. Aug 2026 · 24 August 2026 */
  m=t2.match(/^(\d{1,2})\.?\s+([A-Za-zÄÖÜäöü]{3,10})\.?,?\s+(\d{2,4})(?!\d)/);
  if(m&&c2Mon(m[2]))return c2DOk(c2Yr(m[3]),c2Mon(m[2]),+m[1]);
  /* Aug 24, 2026 · August 24 2026 */
  m=t2.match(/^([A-Za-zÄÖÜäöü]{3,10})\.?\s+(\d{1,2})\.?,?\s+(\d{2,4})(?!\d)/);
  if(m&&c2Mon(m[1]))return c2DOk(c2Yr(m[3]),c2Mon(m[1]),+m[2]);
  /* 20260824 — nur mit glaubhaftem Jahr, sonst wäre jede
     achtstellige Zahl ein Datum. */
  m=t2.match(/^(19|20)(\d{2})(\d{2})(\d{2})$/);
  if(m)return c2DOk(+(m[1]+m[2]),+m[3],+m[4]);
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

/* ── Die sieben Importfelder (5.9.26, seit 6.9.26 spät sieben) ──
   **Datum, Betrag, Referenz 1 bis 5 — und sonst nichts**, für
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

   Daraus folgt die Trennung in der Datei (Struktur v260905,
   ohne Art seit v260906):
   * **Die CSV-Struktur** (state.csvMaps, je Datei-Art) merkt sich
     allein, welche Spalte welches Feld trägt — nichts sonst. Sie
     gilt für reguläre wie für flexible Importe.
   * **Die Importkriterien** wohnen **am Posten** (it.impRules) und
     **an der flexiblen Kategorie** (state.kak[k].impRules), als
     Regeln aus Bedingungen über die sechs Felder. Sie hängen an
     keiner Datei-Art: eine zweite Bank liefert dieselben Felder,
     und dieselben Regeln greifen — sofern die Felder verknüpft sind.
     Die Fenster der beiden zeigen sie als Block „Importkriterien".

   **Die fünf Referenzen sind gleichrangig** (6.9.26; bis dahin
   als Rangfolge wie Überschrift 1 bis 4 beschrieben): fünf freie
   Felder, in die man legt, was zum Zuordnen taugt — Empfänger,
   Verwendungszweck, Kategorie, Notiz —, und ein Kriterium nennt
   eines davon. Die Nummer ist nur ihr Name. Ins Buch wandern sie an
   den Quellzeilen eines Posten (it.impRows[m][].r) und an den
   Buchungen der flexiblen Kosten (tx[].r), als Liste in dieser
   Reihenfolge — leere Enden werden abgeschnitten, eine Lücke in der
   Mitte bleibt (Referenz 2 muss Referenz 2 bleiben). Gezeigt werden
   sie in der Importdaten-Liste der beiden Fenster (impSideRows in
   js/ui.js), je Referenz eine Zeile; im Reiter „Import Details"
   steht Referenz 1 an der Stelle der früheren Unterkategorie
   (txSub/txNote in js/calc.js). Ältere Zuordnungen mit main/cat/desc
   und mit Regeln je Datei-Art übersetzt migrate() (js/state.js). */
/* Fünf seit 6.9.26 spät (Referenz 5 auf Lex' Wunsch); davor vier. */
const C2_REFS=['ref1','ref2','ref3','ref4','ref5'];
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
   der Anleitung: kurze Sätze, ein Gedanke je Absatz.

   **Seit dem 7.9.26 nach der Vorlage `_BusinessCenter/DESIGN/260907
   Guide für Wizard (von GPT).html`**: zuerst „Kurz erklärt" — die
   drei Bereiche des Fensters in drei Zeilen —, dann die Tabelle
   „Was möchtest du tun?" (wenn du … dann wähle …), dann je Weg
   seine Schritte, ein Tipp als Merksatz (.gcall), zum Schluss die
   Farben und „Abschließen oder abbrechen". Die Knopfnamen stehen
   wörtlich so, wie sie in js/i18n.js stehen. Kein „Oben: …
   Darunter: …". */
const C2_GUIDE={
  2:{
    en:`<h4>At a glance</h4>
      <p>You tell FINA which column of your file holds which FINA field. There are seven fields: <b>Date</b>, <b>Amount</b> and <b>Reference 1 to 5</b>. Date and Amount are required.</p>
      <ol>
        <li><b>Column HDR (left):</b> the filled circle marks the row with the column names. Usually the first row is right.</li>
        <li><b>Column names (top):</b> every name is a button. A chosen column turns orange and gets a field list above it.</li>
        <li><b>Field list:</b> Date, Amount or a reference. You can change the field at any time.</li>
      </ol>
      <p><b>Every column you select gets a field right away.</b> A column of dates becomes <b>Date</b>, a column of amounts becomes <b>Amount</b>, and every other column gets the next free reference: the first one you pick becomes Reference 1, the second Reference 2. Deselect a column and its reference is free again — the next column you pick takes it.</p>
      <p>Two buttons above the table select or deselect all columns.</p>
      <h4>What would you like to do?</h4>
      <table class="gtab"><tr><th>If you want to …</th><th>then …</th></tr>
        <tr><td>bring a new kind of file into FINA</td><td>choose the columns, give each its field, press <b>“Save columns and continue”</b></td></tr>
        <tr><td>check a structure FINA has prepared for you</td><td>look over the fields, press <b>“Continue”</b></td></tr>
        <tr><td>match on payee, purpose or category later</td><td>give those columns a <b>Reference</b> field</td></tr>
        <tr><td>correct the header row</td><td>click another circle in the column HDR</td></tr>
      </table>
      <h4>Step by step</h4>
      <ol>
        <li>Check the row with the column names. Click another circle in HDR to change it.</li>
        <li>Click a column name to select the column. FINA gives it a field on the spot.</li>
        <li>Check the field in the list above it, and change it if you want it elsewhere.</li>
        <li>Repeat for every column you need. The five references are free fields, all alike: payee, purpose, category, note — whatever helps with matching in step 3.</li>
        <li>Press <b>“Save columns and continue”</b>. FINA asks for a name and remembers the structure for this kind of file.</li>
      </ol>
      <div class="gcall"><b>Tip</b><p>A selected column without a field does not go to step 3. When you continue, FINA names it and offers to deselect it.</p></div>
      <h4>Good to know</h4>
      <ul>
        <li>The structure is only about columns and fields. Which rows go to which entry is decided in step 3.</li>
        <li>Costs with a minus are recognised on their own. So are the usual ways of writing a date (24.08.2026 · 2026-08-24 · 08/24/2026 · 24 Aug 2026) and an amount (-73,25 · 1.234,56 · 1,234.56 · (73,25) · 12,34 €).</li>
        <li>A column of plain numbers without decimals — a document number, an account number — is not taken for an amount. It gets a reference.</li>
        <li>Two date columns? The second one gets a reference: a field lives in one column only.</li>
        <li>Next time you upload such a file, <b>“Prepare CSV structure automatically”</b> fills this step in for you.</li>
        <li>The ✕ at the top closes the wizard. Nothing is written to your book before the last step.</li>
        <li>This guide opens by itself. The tick <b>“Open the guide alongside”</b> in the settings, under <b>Appearance</b>, turns that off.</li>
      </ul>`,
    de:`<h4>Kurz erklärt</h4>
      <p>Du sagst FINA, welche Spalte deiner Datei welches FINA-Feld trägt. Es gibt sieben Felder: <b>Datum</b>, <b>Betrag</b> und <b>Referenz 1 bis 5</b>. Datum und Betrag müssen sein.</p>
      <ol>
        <li><b>Spalte HDR (links):</b> der gefüllte Kreis markiert die Zeile mit den Spaltennamen. Meist ist die erste Zeile richtig.</li>
        <li><b>Spaltennamen (oben):</b> jeder Name ist ein Knopf. Eine gewählte Spalte wird orange und bekommt darüber eine Feldliste.</li>
        <li><b>Feldliste:</b> Datum, Betrag oder eine Referenz. Du kannst das Feld jederzeit ändern.</li>
      </ol>
      <p><b>Jede Spalte, die du wählst, bekommt sofort ein Feld.</b> Eine Spalte mit Datumsangaben wird <b>Datum</b>, eine Spalte mit Beträgen wird <b>Betrag</b>, und jede andere Spalte bekommt die nächste freie Referenz: die erste, die du wählst, wird Referenz 1, die zweite Referenz 2. Wählst du eine Spalte wieder ab, ist ihre Referenz wieder frei — die nächste Spalte bekommt sie.</p>
      <p>Zwei Knöpfe über der Tabelle wählen alle Spalten oder wählen sie ab.</p>
      <h4>Was möchtest du tun?</h4>
      <table class="gtab"><tr><th>Wenn du …</th><th>dann …</th></tr>
        <tr><td>eine neue Art von Datei in FINA holen willst</td><td>wähle die Spalten, gib jeder ihr Feld, drücke <b>„Spalten speichern und weiter“</b></td></tr>
        <tr><td>eine Struktur prüfen willst, die FINA für dich vorbereitet hat</td><td>sieh die Felder durch, drücke <b>„Weiter“</b></td></tr>
        <tr><td>später nach Empfänger, Zweck oder Kategorie zuordnen willst</td><td>gib diesen Spalten ein <b>Referenz</b>-Feld</td></tr>
        <tr><td>die Beschriftungszeile ändern willst</td><td>klicke in der Spalte HDR auf einen anderen Kreis</td></tr>
      </table>
      <h4>Schritt für Schritt</h4>
      <ol>
        <li>Prüfe die Zeile mit den Spaltennamen. Ein Klick auf einen anderen Kreis in HDR ändert sie.</li>
        <li>Klicke auf einen Spaltennamen, um die Spalte zu wählen. FINA gibt ihr sofort ein Feld.</li>
        <li>Prüfe das Feld in der Liste darüber und ändere es, wenn du es woanders haben willst.</li>
        <li>Wiederhole das für jede Spalte, die du brauchst. Die fünf Referenzen sind freie Felder, alle gleichrangig: Empfänger, Verwendungszweck, Kategorie, Notiz — was in Schritt 3 beim Zuordnen hilft.</li>
        <li>Drücke <b>„Spalten speichern und weiter“</b>. FINA fragt nach einem Namen und merkt sich die Struktur für diese Art von Datei.</li>
      </ol>
      <div class="gcall"><b>Tipp</b><p>Eine gewählte Spalte ohne Feld kommt nicht in Schritt 3. Beim Weitergehen nennt FINA sie und bietet an, sie abzuwählen.</p></div>
      <h4>Gut zu wissen</h4>
      <ul>
        <li>Die Struktur betrifft nur Spalten und Felder. Welche Zeilen zu welchem Eintrag gehören, entscheidest du in Schritt 3.</li>
        <li>Kosten mit Minus erkennt FINA von selbst. Ebenso die gängigen Schreibweisen für ein Datum (24.08.2026 · 2026-08-24 · 08/24/2026 · 24. Aug 2026) und für einen Betrag (-73,25 · 1.234,56 · 1,234.56 · (73,25) · 12,34 €).</li>
        <li>Eine Spalte aus glatten Zahlen ohne Nachkommastellen — eine Belegnummer, eine Kontonummer — hält FINA nicht für einen Betrag. Sie bekommt eine Referenz.</li>
        <li>Zwei Datumsspalten? Die zweite bekommt eine Referenz: ein Feld wohnt nur in einer Spalte.</li>
        <li>Beim nächsten Mal füllt <b>„Automatisch CSV-Datenstruktur vorbereiten“</b> diesen Schritt für dich aus.</li>
        <li>Das ✕ oben schließt den Wizard. Ins Buch geschrieben wird erst im letzten Schritt.</li>
        <li>Diese Anleitung geht von selbst auf. Der Haken <b>„Anleitung mit aufschlagen“</b> in den Einstellungen, unter <b>Darstellung</b>, schaltet das ab.</li>
      </ul>`},
  3:{
    en:`<p>In this step you assign the rows of your CSV file to the matching entries of your book. You can assign <b>once</b>, or save the assignment as a rule <b>for future imports</b>.</p>
      <h4>At a glance</h4>
      <ol>
        <li><b>Entries (top):</b> choose the entry in your book. The chosen entry is highlighted in orange. A click on a block row folds the block; <b>“Expand all”</b> / <b>“Collapse all”</b> at the right of the heading does it for all three.</li>
        <li><b>Assignment bar (middle):</b> choose a one-time assignment, save a rule, or create a new entry.</li>
        <li><b>File rows (bottom):</b> here you see, filter and assign the transactions of the imported file.</li>
      </ol>
      <p>Drag the grey bar between the areas if you need more room for one of them.</p>
      <h4>What would you like to do?</h4>
      <table class="gtab"><tr><th>If you want to …</th><th>then choose …</th></tr>
        <tr><td>have recurring transactions recognised automatically next time</td><td><b>“Assign and remember for next time”</b></td></tr>
        <tr><td>assign one unusual transaction</td><td><b>“One-time assignment mode”</b></td></tr>
        <tr><td>create a suitable entry first</td><td><b>“Create new and assign”</b></td></tr>
        <tr><td>review the rules FINA has remembered</td><td><b>“Automatically assign with remembered criteria…”</b></td></tr>
      </table>
      <h4>Assign recurring transactions and remember them</h4>
      <ol>
        <li>Click the matching <b>entry</b> at the top.</li>
        <li>Narrow the <b>file rows</b> down. Type a fragment into a column filter, or click a value in a row: it goes straight into the filter of its column. The ☰ at the filter field sets how it compares: contains, does not contain, starts with, ends with, amount. The quick filter above the table only helps you find rows; it is not saved.</li>
        <li>Press <b>Enter</b> to pin each criterion. Several criteria narrow down together.</li>
        <li>Click <b>“Assign and remember for next time”</b>.</li>
      </ol>
      <p>FINA stores the criteria at the entry and can propose matching transactions in the next import.</p>
      <div class="gcall"><b>Tip</b><p>Before you save, check that only the intended rows are visible. A rule that is too wide catches similar transactions.</p></div>
      <h4>Assign single transactions once</h4>
      <ol>
        <li>Switch on <b>“One-time assignment mode”</b>. The button stays dark while the mode is on, and a tick column appears in the file rows.</li>
        <li>Tick the rows. A click anywhere on a row ticks it.</li>
        <li>Choose the <b>target entry</b> at the top.</li>
        <li>Click <b>“Assign once”</b> and confirm the summary.</li>
        <li>Switch the mode off again.</li>
      </ol>
      <p>No rule is saved for this assignment.</p>
      <h4>Review and apply remembered rules</h4>
      <ol>
        <li>Click <b>“Automatically assign with remembered criteria…”</b>.</li>
        <li>Check the proposed entries and transactions.</li>
        <li>Untick entries or rows that should not be taken over.</li>
        <li>Adjust criteria with the pencil at an entry if needed.</li>
      </ol>
      <p>The ☰ at a single entry also offers <b>“Search by remembered criteria”</b> and <b>“Search by amount”</b>.</p>
      <h4>Already assigned rows</h4>
      <ul>
        <li><b>Yellow:</b> assigned in this import, not yet in your book.</li>
        <li><b>Light blue:</b> taken over in an earlier import.</li>
        <li><b>Grey with ×:</b> already assigned; it cannot be imported again.</li>
      </ul>
      <p><b>“Hide already assigned CSV entries”</b> takes these rows out of the table and brings them back.</p>
      <h4>More in the ☰ menu</h4>
      <ul>
        <li><b>“Cancel filter and show all unassigned CSV data”</b> clears every filter.</li>
        <li><b>“Show all remembered import criteria”</b> opens an overview of all rules for editing.</li>
      </ul>
      <p>Is the window too narrow for the assignment bar? Then its buttons move into this menu, one after the other: first <b>“Automatically assign with remembered criteria…”</b>, then <b>“Hide already assigned CSV entries”</b>, then <b>“One-time assignment mode”</b>. <b>“Assign and remember for next time”</b> (or <b>“Assign once”</b>) and <b>“Create new and assign”</b> always stay in sight.</p>
      <h4>Finish or cancel</h4>
      <ul>
        <li><b>“Finish”</b> writes every assignment into your book and stores the new rules.</li>
        <li><b>✕</b> closes the wizard without taking over the current assignments.</li>
      </ul>
      <p>Save your file afterwards, so the changes stay.</p>
      <p>This guide opens by itself with every import. The tick <b>“Open the guide alongside”</b> in the settings, under <b>Appearance</b>, turns that off.</p>`,
    de:`<p>In diesem Schritt ordnest du die Zeilen deiner CSV-Datei den passenden Einträgen in deinem Buch zu. Du kannst <b>einmalig</b> zuordnen, oder die Zuordnung als Regel <b>für spätere Importe merken</b>.</p>
      <h4>Kurz erklärt</h4>
      <ol>
        <li><b>Einträge (oben):</b> wähle den Eintrag in deinem Buch. Der gewählte Eintrag ist orange hervorgehoben. Ein Klick auf eine Blockzeile klappt den Block zu; <b>„Alle aufklappen“</b> / <b>„Alle zuklappen“</b> rechts in der Kopfzeile tut es für alle drei.</li>
        <li><b>Zuordnungsleiste (Mitte):</b> wähle einmalige Zuordnung, Regel merken oder neuen Eintrag anlegen.</li>
        <li><b>Dateizeilen (unten):</b> hier siehst, filterst und ordnest du die Umsätze der importierten Datei zu.</li>
      </ol>
      <p>Ziehe den grauen Griff zwischen den Bereichen, wenn du für einen mehr Platz brauchst.</p>
      <h4>Was möchtest du tun?</h4>
      <table class="gtab"><tr><th>Wenn du …</th><th>dann wähle …</th></tr>
        <tr><td>wiederkehrende Umsätze künftig automatisch erkennen lassen willst</td><td><b>„Zuordnen und merken für die Zukunft“</b></td></tr>
        <tr><td>einen einzelnen, ungewöhnlichen Umsatz zuordnen willst</td><td><b>„Modus: Einmalige Zuordnung“</b></td></tr>
        <tr><td>noch keinen passenden Eintrag hast</td><td><b>„Neu anlegen und zuordnen“</b></td></tr>
        <tr><td>gemerkte Regeln prüfen willst</td><td><b>„Automatisch zuordnen mit gemerkten Importkriterien…“</b></td></tr>
      </table>
      <h4>Wiederkehrende Umsätze zuordnen und merken</h4>
      <ol>
        <li>Klicke oben auf den passenden <b>Eintrag</b>.</li>
        <li>Grenze die <b>Dateizeilen</b> ein. Tipp ein Teilstück in einen Spaltenfilter, oder klicke auf einen Wert in einer Zeile: er steht sofort im Filter seiner Spalte. Das ☰ am Filterfeld legt fest, wie verglichen wird: enthält, enthält nicht, fängt mit, endet mit, Betrag. Der Schnellfilter über der Tabelle hilft nur beim Finden; er wird nicht gemerkt.</li>
        <li>Drücke <b>Enter</b>, um jedes Kriterium anzuheften. Mehrere Kriterien grenzen zusammen ein.</li>
        <li>Klicke auf <b>„Zuordnen und merken für die Zukunft“</b>.</li>
      </ol>
      <p>FINA speichert die Kriterien am Eintrag und kann passende Umsätze beim nächsten Import vorschlagen.</p>
      <div class="gcall"><b>Tipp</b><p>Prüfe vor dem Merken, ob nur die gewünschten Zeilen sichtbar sind. Eine zu breite Regel erfasst ähnliche Umsätze.</p></div>
      <h4>Einzelne Umsätze einmalig zuordnen</h4>
      <ol>
        <li>Schalte <b>„Modus: Einmalige Zuordnung“</b> ein. Der Knopf bleibt dunkel, solange der Modus läuft, und in den Dateizeilen erscheint eine Spalte mit Kästchen.</li>
        <li>Hake die Zeilen ab. Ein Klick irgendwo auf die Zeile genügt.</li>
        <li>Wähle oben den <b>Zieleintrag</b>.</li>
        <li>Klicke auf <b>„Einmalig zuordnen“</b> und bestätige die Zusammenfassung.</li>
        <li>Schalte den Modus wieder aus.</li>
      </ol>
      <p>Für diese Zuordnung wird keine Regel gemerkt.</p>
      <h4>Gemerkte Regeln prüfen und anwenden</h4>
      <ol>
        <li>Klicke auf <b>„Automatisch zuordnen mit gemerkten Importkriterien…“</b>.</li>
        <li>Prüfe die vorgeschlagenen Einträge und Umsätze.</li>
        <li>Nimm den Haken bei Einträgen oder Zeilen weg, die nicht übernommen werden sollen.</li>
        <li>Passe Kriterien bei Bedarf über den Stift am Eintrag an.</li>
      </ol>
      <p>Das ☰ an einem einzelnen Eintrag bietet außerdem <b>„Suchen nach gemerkten Kriterien“</b> und <b>„Suchen nach Betrag“</b>.</p>
      <h4>Schon zugeordnete Zeilen</h4>
      <ul>
        <li><b>Gelb:</b> in diesem Import zugeordnet, noch nicht im Buch.</li>
        <li><b>Hellblau:</b> in einem früheren Import übernommen.</li>
        <li><b>Grau mit ×:</b> schon zugeordnet; kein erneuter Import möglich.</li>
      </ul>
      <p><b>„Schon zugeordnete CSV-Zeilen verbergen“</b> nimmt diese Zeilen aus der Tabelle und holt sie wieder.</p>
      <h4>Mehr im ☰-Menü</h4>
      <ul>
        <li><b>„Filter zurücknehmen und alle nicht zugeordneten CSV-Daten zeigen“</b> leert alle Filter.</li>
        <li><b>„Alle gemerkten Importkriterien zeigen“</b> öffnet eine Übersicht aller Regeln zum Bearbeiten.</li>
      </ul>
      <p>Ist das Fenster für die Zuordnungsleiste zu schmal? Dann wandern ihre Knöpfe in dieses Menü, einer nach dem anderen: erst <b>„Automatisch zuordnen mit gemerkten Importkriterien…“</b>, dann <b>„Schon zugeordnete CSV-Zeilen verbergen“</b>, dann <b>„Modus: Einmalige Zuordnung“</b>. <b>„Zuordnen und merken für die Zukunft“</b> (oder <b>„Einmalig zuordnen“</b>) und <b>„Neu anlegen und zuordnen“</b> bleiben immer zu sehen.</p>
      <h4>Abschließen oder abbrechen</h4>
      <ul>
        <li><b>„Fertig“</b> übernimmt alle Zuordnungen ins Buch und speichert die neuen Regeln.</li>
        <li><b>✕</b> schließt den Wizard, ohne die aktuellen Zuordnungen zu übernehmen.</li>
      </ul>
      <p>Speichere danach deine Datei, damit die Änderungen bleiben.</p>
      <p>Diese Anleitung geht bei jedem Import von selbst auf. Der Haken <b>„Anleitung mit aufschlagen“</b> in den Einstellungen, unter <b>Darstellung</b>, schaltet das ab.</p>`}
};

/* ── Der Arbeitsstand des Wizards — lebt nur, solange das Fenster
   offen ist. Ins Buch schreibt allein c2Apply(). ── */
let W=null;

/* ── Filter und Regeln ────────────────────────────────────────
   Ein Filter ist eine Liste von Bedingungen (terms): je Bedingung
   ein **Feld** (f: 'date', 'amount', 'ref1' … 'ref5'; 'q' heißt
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
  const skip=W.skip||{};
  W.rules.forEach((r,ri)=>{
    if(r.pick){
      r.pick.forEach(i=>{if(W.asg[i]<0&&W.meta[i]&&W.meta[i].in&&!W.inBook.has(i))W.asg[i]=ri;});
      return;
    }
    const tid=r.t&&r.t.tid;
    W.csv.rows.forEach((row,i)=>{
      if(W.asg[i]>=0)return;
      if(!W.meta[i].in)return;
      /* Schon im Buch (c2ScanBook): bleibt liegen, für jede Regel. */
      if(W.inBook.has(i))return;
      /* Im Wahl-Fenster der gemerkten Kriterien einzeln abgewählt
         (W.skip): die Zeile bleibt frei, als hätte die Regel sie
         nicht getroffen — von Hand lässt sie sich weiter zuordnen. */
      if(skip[tid+'|'+i])return;
      if(c2Match(row,r.terms))W.asg[i]=ri;
    });
  });
}

function c2Hits(){
  const terms=c2LiveTerms();
  const out={free:[],taken:[],own:[],off:[],book:[]};
  W.csv.rows.forEach((row,i)=>{
    if(!c2Match(row,terms))return;
    if(W.inBook.has(i))out.book.push(i);
    else if(!W.meta[i].in)out.off.push(i);
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
  const tid='i:'+String(ref&&ref.id);
  const two=n=>String(n).padStart(2,'0');
  W.csv.rows.forEach((row,i)=>{
    const ri=W.asg[i];
    if(ri==null||ri<0)return;
    const r=W.rules[ri];
    if(!r||!r.t||r.t.tid!==tid)return;
    const me=W.meta[i];
    if(!me||!me.in||!me.d)return;
    const d=me.d;
    /* Dieselbe Rechnung für beide Arten: eine flexible Kategorie ist
       ein Kostenziel (income:false) — siehe c2BookVal. */
    const v=c2BookVal(i,r.t.income);
    /* Die Referenzen, wie sie „Fertig" ins Buch schreibt
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

/* ── Ziele: Posten (Einnahmen, regelmäßige Kosten) und die
   Hauptkategorien der Flexible — **alle zusammen** (6.9.26;
   bis dahin je nach Art die einen oder die anderen). Vorhandene
   kommen aus dem Buch, neue tragen 'n:'+Name; `flex` sagt, ob ein
   Ziel eine flexible Kategorie ist — daran hängt, was „Fertig"
   damit tut (c2Apply). ── */
function c2Targets(){
  const it=state.fixed;
  return [
    [t('c2.blkIn'),it.filter(isIncome).map(x=>({tid:'i:'+x.id,name:x.name,income:true}))],
    [t('c2.blkFlex'),it.filter(isFlex).map(x=>({tid:'i:'+x.id,name:x.name,income:false,flex:true,group:x.group}))],
    [t('c2.blkOut'),it.filter(isCost).map(x=>({tid:'i:'+x.id,name:x.name,income:false}))],
    [t('c2.blkNew'),W.newT]];
}
/* Ist ein Ziel eine flexible Kategorie? Vorhandene am Schlüssel,
   neue an ihrem Vermerk in W.newT. */
function c2IsFlex(tid){
  tid=String(tid||'');
  if(tid.indexOf('i:')===0){const it=findItem(tid.slice(2));return !!(it&&isFlex(it));}
  if(tid.indexOf('n:')===0){const nt=W.newT.find(x=>x.tid===tid);return !!(nt&&nt.flex);}
  return false;
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
  W={step:1,csv:null,cols:[],f:c2BlankF(),neg:true,
     meta:[],rules:[],newT:[],asg:[],flt:{},fltOp:{},chips:[],q:'',colw:{},colnat:{},open:{},
     target:'',editRule:null,ignoreMap:false,once:false,pick:{},
     /* **Was schon im Buch steht** (6.9.26 abends): die Zeilen der
        Datei, die als Quellzeile irgendwo im Buch stehen (c2ScanBook).
        Sie tragen in der Spalte „X" ein Kreuz, stehen grau und lassen
        sich nicht zuordnen — weder von Hand noch über einen Filter.
        `showOld` sagt, ob sie in der Tabelle stehen (der Schalter in
        der Zuordnungsleiste) — **und seit 6.9.26 spät ebenso die
        Zeilen, die dieser Lauf zugeordnet hat**: die verschwanden bis
        dahin aus der Tabelle, jetzt stehen sie genauso grau mit
        Kreuz da, bis der Schalter sie verbirgt (c2Visible). */
     inBook:new Set(),showOld:true,
     mapRules:null,autoDone:false,
     /* **Die Spalten kamen aus der gemerkten CSV-Struktur** (5.9.26,
        „Automatisch CSV-Datenstruktur vorbereiten" in Schritt 1):
        Schritt 2 geht dann mit „Weiter" in die Zuordnung, ohne nach
        einem Namen zu fragen — gemerkt ist die Struktur ja schon.
        „CSV-Datenstruktur von Grund auf neu anordnen" und eine neue
        Datei nehmen es zurück. */
     autoCols:false,
     /* **Welche gemerkte Struktur gemeint ist** (6.9.26): der
        Schlüssel in state.csvMaps — eine Datei-Art kann mehrere
        tragen (c2MapsFor), und Schritt 1 lässt wählen. Leer heißt:
        die erste, die es gibt (c2MapKey). */
     mapKey:'',
     /* **Zeilen, die eine gemerkte Regel auslassen soll** (6.9.26):
        Schlüssel „ziel|zeile", gesetzt im Wahl-Fenster der gemerkten
        Kriterien (c2MapPick), wenn dort ein einzelner Haken
        weggenommen wird. c2ApplyRules übergeht sie — nur für
        Regeln mit Bedingungen; eine Handauswahl trifft, was sie
        nennt. */
     skip:{},
     /* Ob die Anleitung rechts neben dem Schritt steht, und der
        Name, unter dem die Spalten gemerkt sind (c2AskMapName).

        **Aufgeschlagen fängt sie an, solange die Datei es sagt**
        (8.9.26): state.guideOpen, derselbe Haken, der auch die
        Anleitung neben der Ansicht aufschlägt (Einstellungen →
        Darstellung). Zu sehen ist sie erst ab Schritt 2 — Schritt 1
        ist eine Dateiauswahl und braucht keine. Der Knopf
        „Anleitung" schlägt sie wie immer auf und zu; geschrieben
        wird dabei nichts. */
     guide:!(state&&state.guideOpen===false),mapName:'',
     /* Die Anleitung daneben hat ihre eigene Sprache und Breite
        (7.9.26, wie der Guide der Anwendung): gLang fängt bei der
        Sprache der Oberfläche an und wird im Kopf der Anleitung
        umgeschaltet; guideW ist die am Griff gezogene Breite in px,
        0 heißt „ein Drittel des Fensters" (c2GuideWidth). Beides
        lebt nur, solange das Fenster offen ist. */
     gLang:(state&&state.lang==='de')?'de':'en',guideW:0,
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
     getan — eine Datei gewählt, in einem Klick wieder hergestellt;
     Escape und das ✕ meinen da dasselbe. Ab dem zweiten Schritt
     hängt Arbeit im Fenster
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
  /* **Der erste Schritt wartet auf „Weiter"** (6.9.26; bis dahin
     ging er von selbst weiter, sobald die Art gewählt war — die
     gibt es nicht mehr, und wer eine Datei gewählt hat, soll ihren
     Namen und ihre Kennzahlen sehen, bevor es weitergeht). Der
     Klick sagt, was fehlt (c2WireNav) — oder dass zuerst der Kasten
     der gemerkten Struktur zu beantworten ist, wenn FINA die
     Datei-Art kennt; dessen beide Knöpfe gehen selbst weiter.
     **Schwarz, sobald es weitergehen kann** (5.9.26; vorher orange):
     der Weg nach vorn ist in jedem Schritt derselbe schwarze Knopf
     — „Weiter", „Spalten speichern und weiter", „Fertig". */
  /* „Weiter" ist immer schwarz (6.9.26 abends): er ist der eine
     Weg aus dem ersten Schritt; ohne Datei sagt er es selbst. */
  if(W.step===1)return b('to2',' primary',t('c2.next'));
  /* **Der Knopf nach vorn ist in Schritt 2 immer schwarz** (6.9.26;
     bis dahin erst, sobald Datum und Betrag verknüpft waren): er ist
     der eine Weg weiter, wie „Weiter" nach der automatischen
     Vorbereitung. Fehlt noch etwas, sagt es der Klick (c2Missing).
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
      +b('to3',' primary',same?t('c2.next'):t('c2.saveCols'),false,same?t('c2.nextTip'):t('c2.saveColsTip'));
  }
  /* Die gemerkte Zuordnung wohnt seit 5.9.26 **nicht mehr hier**,
     sondern in der Leiste zwischen den beiden Flächen, links vor
     dem Modus-Knopf (c2Step3) — und sie ordnet nichts mehr in
     einem Zug zu: ein Fenster zeigt vorher die Posten, die etwas
     bekämen, und man wählt (c2MapPick).
     **„Fertig" statt „Anwenden"** (5.9.26): aus Sicht des Nutzers
     ist der Import getan, sobald alles zugeordnet ist — der Knopf
     schließt ab und schreibt dabei ins Buch (c2Apply); die
     Sprechblase sagt beides. **Das Schließen ohne Zuordnung ist
     wieder das ✕ ganz rechts oben** (6.9.26; vom 5.9. bis dahin
     stand es als Knopf „Import zurücksetzen und schließen" ganz
     links) — an derselben Stelle wie in jedem Schritt, mit einer
     Sprechblase, die das Ausrufezeichen trägt (c2.xClose3). */
  return guide+b('to2','',t('c2.back'))
    +b('apply',' primary',t('c2.finish'),false,t('c2.closeWizTip'));
}
/* ── Die gemerkten Strukturen einer Datei-Art (6.9.26) ─────────
   Der Schlüssel in state.csvMaps ist der Fingerabdruck der
   Spaltenköpfe — und seit 6.9.26 kann eine Datei-Art **mehrere**
   Strukturen tragen: die erste unter dem Fingerabdruck selbst, jede
   weitere unter „fp#2", „fp#3" … (angelegt in c2AskMapName, wenn
   man die bestehende behalten und diese dazu merken will). Ältere
   Fassungen sehen nur die erste — und die liegt unter dem
   Schlüssel, den sie kennen. Schritt 1 zeigt alle und lässt wählen
   (W.mapKey); c2MapKey sagt, welche gerade gemeint ist. */
function c2MapsFor(fp){
  return Object.keys(state.csvMaps||{}).filter(k=>k===fp||k.indexOf(fp+'#')===0)
    .map(k=>[k,state.csvMaps[k]]).filter(x=>x[1]&&typeof x[1]==='object');
}
function c2MapKey(){
  if(!W||!W.csv)return '';
  const keys=c2MapsFor(W.csv.fp).map(x=>x[0]);
  if(W.mapKey&&keys.includes(W.mapKey))return W.mapKey;
  return keys[0]||'';
}
function c2NextMapKey(fp){
  let n=2;
  while(state.csvMaps[fp+'#'+n])n++;
  return fp+'#'+n;
}
/* **Wartet der Kasten der gemerkten CSV-Struktur noch auf eine
   Antwort?** FINA kennt die Datei-Art, und weder „Automatisch
   vorbereiten" (W.autoCols) noch „Von Grund auf neu anordnen"
   (W.ignoreMap) ist gedrückt. Solange das so ist, geht es aus
   Schritt 1 nicht weiter: die Entscheidung gehört dem Nutzer. */
function c2MapPending(){
  return !!(W.csv&&c2MapsFor(W.csv.fp).length)&&!W.ignoreMap&&!W.autoCols;
}
/* Dieselbe Frage wie c2Advance, nur ohne zu gehen: Datei da, und
   kein Kasten der gemerkten Struktur, der zuerst eine Antwort
   will. */
function c2Step1Ready(){
  return !!W.csv&&!c2MapPending();
}
/* **Stehen Spalten und Felder noch so da, wie FINA sie sich für
   diese Datei-Art gemerkt hat?** Daran hängt in Schritt 2, ob der
   Knopf „Weiter" heißt oder „Spalten speichern und weiter" (c2Nav):
   was schon gemerkt ist, muss nicht noch einmal gemerkt werden.
   Verglichen wird mit der Datei, nicht mit einem Merker — wer eine
   Spalte umstellt und wieder zurückstellt, ist wieder beim
   Gemerkten. Bei mehreren Strukturen zählt die gewählte (c2MapKey). */
function c2ColsSame(){
  const m=W.csv&&state.csvMaps[c2MapKey()];
  if(!m)return false;
  /* Verglichen werden allein die Felder (5.9.26). Eine gewählte
     Spalte ohne Feld zählt nicht — sie hält der Knopf ohnehin auf,
     bevor es nach Schritt 3 geht (c2LooseCols). */
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
/* Nach Schritt 2 — über „Weiter" oder über einen der beiden Knöpfe
   im Kasten der gemerkten Struktur. Nicht, solange FINA diese
   Datei-Art kennt und noch nicht gesagt ist, ob die gemerkte
   CSV-Struktur übernommen oder neu angeordnet wird (c2MapPending). */
function c2Advance(){
  if(!W.csv)return false;
  if(c2MapPending())return false;
  W.step=2;c2Render();
  return true;
}

/* ── Welche Zeilen der Datei stehen schon im Buch? ────────────
   (6.9.26 abends) Verglichen wird mit den Quellzeilen **aller**
   Posten (impRows): derselbe Tag, derselbe Betrag ohne Vorzeichen
   (das Vorzeichen hängt am Ziel, c2BookVal), dieselben Referenzen.
   Wer trifft, ist schon importiert — c2ApplyRules lässt die Zeile
   liegen, die Tabelle zeigt sie grau mit Kreuz, und der Schalter
   „Schon zugeordnete CSV-Zeilen zeigen/verbergen" nimmt sie aus dem
   Bild. Gerechnet wird beim Eintritt in Schritt 3 und vor jedem
   Zeichnen dort: „Importdaten löschen" ändert das Buch, während der
   Wizard offen steht. */
function c2ScanBook(){
  W.inBook=new Set();
  if(!W.csv||!W.meta.length)return;
  const keys=new Set();
  (state.fixed||[]).concat(state.balance?[state.balance]:[]).forEach(it=>{
    const rows=it.impRows||{};
    Object.keys(rows).forEach(mk=>(rows[mk]||[]).forEach(r=>{
      keys.add(String(r.d||'')+'|'+Math.round(Math.abs(+r.v||0)*100)+'|'+impRowText(r));
    }));
  });
  if(!keys.size)return;
  const two=n=>String(n).padStart(2,'0');
  W.csv.rows.forEach((row,i)=>{
    const me=W.meta[i]; if(!me||!me.d||isNaN(me.v))return;
    const d=me.d;
    const key=two(d.d)+'.'+two(d.m)+'.'+two(d.y%100)+'|'+Math.round(Math.abs(me.v)*100)+'|'+refsText(c2Refs(row));
    if(keys.has(key))W.inBook.add(i);
  });
}

function c2Render(swap){
  W.modal.querySelectorAll('.c2fpop').forEach(popOut);
  if(W.step===3&&W.csv)c2ScanBook();
  /* **Der Zielbereich springt beim Filtern nicht.** Gefiltert wird
     unten, gelesen oben — und wer eine Zeile im Blick hat, während
     er den Filter eingrenzt, verlöre sie bei jedem Zeichen. Beide
     Flächen behalten deshalb ihren Rollstand über den Neuaufbau
     hinweg; gemessen wird vorher, gesetzt danach. */
  const keep=[...W.box.querySelectorAll('.c2scroll')].map(el=>[el.scrollTop,el.scrollLeft]);
  /* Klappt gerade ein Ziel (W.foldAnim, gesetzt von den drei
     Klapp-Wegen in c2Wire), merkt sich foldSnap die Lage der Zeilen
     und foldPlay fährt sie nach dem Bauen an ihre neue Stelle. */
  const folds=W.foldAnim?foldSnap(W.box):null; W.foldAnim=false;
  const steps=[t('c2.steps1'),t('c2.steps2'),t('c2.steps3')];
  const head=`<div class="c2head"><h3>${t('c2.title')}</h3>
    <span class="c2steps">${steps.map((s,i)=>
      `<span class="c2stp${W.step===i+1?' on':(W.step>i+1?' ok':'')}">${i+1} ${esc(s)}</span>`).join('<i>›</i>')}</span>
    <span class="c2nav">${c2Nav()}</span>
    <button class="btn c2x" data-c2="close" title="${esc(t(W.step===3?'c2.xClose3':(W.step===2?'c2.xClose2':'c2.xClose')))}">✕</button></div>`;
  /* **Das ✕ steht in jedem Schritt ganz rechts oben** (6.9.26); nur
     seine Sprechblase wechselt: in Schritt 1 „Wizard schließen", in
     Schritt 2 „sofort schließen, keine Postenzuordnung", in Schritt
     3 „ohne Zuordnung (!) schließen" — dort hängt Arbeit im Fenster,
     und der Satz sagt, dass sie mitgeht. Geschlossen wird ohne
     Rückfrage (c2Close); ins Buch ist bis „Fertig" nichts
     geschrieben. */
  /* **Schritt 2 und 3 stehen in `.c2main`**, und daneben, wenn die
     Anleitung offen ist, ihr rechtes Viertel (`.c2gpanel`). Beide
     zusammen sind `.c2work`, die Fläche unter der Kopfzeile. Die
     Höhe verteilt sich darin wie zuvor im Fenster selbst; Schritt 1
     ist klein und braucht das nicht. */
  /* Ein Wechsel des Schritts (nicht ein bloßes Neuzeichnen) läuft
     in drei Zügen (boxSwap in js/ui.js): die Arbeitsfläche blendet
     aus, das Fenster nimmt seine neue Größe an — die Kopfzeile mit
     Titel und Schritten bleibt stehen —, die neue Arbeitsfläche
     blendet ein; bei gleicher Größe (2 → 3) nur aus und ein. Die
     Arbeitsfläche trägt dafür .swapfade. */
  const build=()=>{
    W.box.classList.toggle('c2big',W.step>1);
    if(W.step===1)W.box.innerHTML=head+`<div class="swapfade">${c2Step1()}</div>`;
    else W.box.innerHTML=head+`<div class="c2work swapfade"><div class="c2main">${W.step===2?c2Step2():c2Step3()}</div>${W.guide?c2GuidePanel():''}</div>`;
  };
  /* `swap` erzwingt den Dreischritt auch ohne Schrittwechsel — beim
     Wählen der Datei in Schritt 1 wächst das Fenster um den Kasten
     der gemerkten Struktur. */
  if(swap||(W.drawnStep&&W.drawnStep!==W.step)) boxSwap(W.box,build); else build();
  W.drawnStep=W.step;
  c2Wire();
  tabThroughFields(W.box);
  /* **Die Blockzeilen des Zielbereichs kleben unter dem Spaltenkopf**
     (6.9.26, css/components.css .c2ttab tr.ghead): wie hoch der Kopf
     ist, wird gemessen und als --c2headH an die Tabelle geschrieben
     — geraten wäre es beim ersten Umbau falsch (dieselbe Bauform
     wie --headH in sizeMatrix, js/app.js). */
  const tt=W.box.querySelector('.c2ttab');
  if(tt&&tt.tHead)tt.style.setProperty('--c2headH',tt.tHead.getBoundingClientRect().height+'px');
  /* Die Wizard-Knöpfe bleiben in der Tab-Reihenfolge: sie sind der
     Weg durch das Fenster, kein Beiwerk neben einem Feld — dieselbe
     Ausnahme, die eine Fußzeile (.row-end) ohnehin hat. */
  W.box.querySelectorAll('.c2nav .btn').forEach(b=>{b.tabIndex=0;});
  const now=[...W.box.querySelectorAll('.c2scroll')];
  if(now.length===keep.length)
    now.forEach((el,i)=>{el.scrollTop=keep[i][0];el.scrollLeft=keep[i][1];});
  if(folds) foldPlay(W.box,folds);
}

/* ── Schritt 1: die Datei ──────────────────────────────────────
   (umgebaut 6.9.26) **Nur noch die Datei.** Die Frage „Was steckt
   in der Datei?" mit den beiden Art-Knöpfen ist heraus:
   Importkriterien gelten für reguläre wie für flexible Posten
   gleich, und der dritte Schritt zeigt alle drei Bereiche wie die
   Jahresmatrix — was eine Zeile bekommt, entscheidet ihr Ziel.

   Unter dem Knopf steht die Datei mit ihren Kennzahlen (bis dahin
   daneben, in einer Zeile). Kennt FINA die Datei-Art, folgt der
   orange Kasten: der Satz, dass FINA sich erinnert; darunter die
   gemerkten Strukturen als Zeilen — Name, Tag des Merkens, Stift,
   ✕; bei mehreren ein Auswahlknopf davor (c2MapsFor, W.mapKey) —;
   dann der Hinweis, dass die automatische Vorbereitung nichts
   zuordnet, sondern nur den Handgriff Spalte→Feld erspart; und die
   beiden Wege. **Der Stift öffnet dasselbe Fenster wie in den
   Einstellungen** (openCsvStructure) — samt Namensfeld —, und was
   dort gespeichert wird, steht sofort im Buch; man muss den Wizard
   dafür nicht verlassen. **Das ✕ vergisst die Struktur** nach
   Rückfrage; war es die letzte, verschwindet der Kasten, und
   Schritt 1 sieht aus wie bei einer unbekannten Datei.

   Zwei Wege: **„Automatisch CSV-Datenstruktur vorbereiten"**
   (schwarz, der erste Griff) übernimmt Spalten und Felder aus der
   gewählten Struktur und zeigt sie in Schritt 2 — nicht gleich
   Schritt 3, man soll sehen, was übernommen wurde.
   **„CSV-Datenstruktur von Grund auf neu anordnen"** fängt in
   Schritt 2 leer an. */
function c2Step1(){
  const c=W.csv
    ?`<b>${esc(W.csv.name)}</b> · ${t('c2.meta',W.csv.rows.length,W.csv.header.length,
        esc(W.csv.enc),W.csv.sep==='\t'?t('c2.tab'):'„'+W.csv.sep+'“')}`
    :t('c2.noFile');
  const maps=(W.csv&&!W.ignoreMap)?c2MapsFor(W.csv.fp):[];
  const cur=c2MapKey();
  const rows=maps.map(([k,m])=>`<div class="c2kmrow${k===cur?' on':''}">
      ${maps.length>1?`<input type="radio" name="c2mk" data-c2mpk="${esc(k)}"${k===cur?' checked':''} title="${esc(t('c2.knownPick'))}">`:''}
      <b class="n">${esc(m.file||'—')}</b>
      <small>${esc(t('set.csvMapMeta',m.date||'—'))}</small>
      <button type="button" class="pencil" data-c2mped="${esc(k)}" title="${esc(t('set.csvMapEdit'))}">&#9998;</button>
      <button type="button" class="linkish" data-c2mpdel="${esc(k)}" title="${esc(t('set.csvMapDel'))}">&#10005;</button>
    </div>`).join('');
  const kmH=maps.length?`<div class="c2known">
      <p>${t('c2.known',esc(t('app.name')))}</p>
      <div class="c2kmlist">${rows}</div>
      <p>${t('c2.knownNote')}</p>
      <div class="c2row">
        <button class="btn primary" data-c2="applyMap">${t('c2.knownApply')}</button>
        <button class="btn" data-c2="ignoreMap">${t('c2.knownNew')}</button>
      </div></div>`:'';
  return `<p class="subline">${t('c2.sub')}</p>
    <div class="c2grp">
      <button class="btn" data-c2="pick">${t('c2.pick')}</button>
      <p class="c2meta c2filemeta">${c}</p>
      ${kmH}
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

/* ── Was in einer Spalte steht ───────────────────────────────
   `c2ColKind(i)` sieht sich die ersten 60 Zeilen an und sagt
   `'date'`, `'amount'` oder `null`. Gelesen wird mit **denselben**
   Funktionen, die auch importieren (c2Date, c2Amount): was hier
   als Datum erkannt wird, kann der Import auch lesen.

   **Eine Zahl ist noch kein Betrag.** Kontonummern, Belegnummern
   und Kennungen sind ebenfalls Ziffern; ein Geldbetrag hat fast
   immer Nachkommastellen, ein Vorzeichen oder ein Währungszeichen.
   Danach wird gefragt (`c2Money`) — es sei denn, die Überschrift
   sagt ohnehin „Betrag", dann genügt die blanke Zahl.

   Gezählt wird über die **gefüllten** Zellen: eine Spalte, die nur
   in jeder dritten Zeile etwas trägt, ist trotzdem eine
   Datumsspalte, wenn alles darin ein Datum ist. */
const C2_HDATE=/^(buchung(stag|sdatum)?|wertstellung|valuta(tag|datum)?|datum|date|booking ?date|value ?date|transaction ?date|zeitpunkt)$/i;
/* „Saldo" steht hier mit Absicht **nicht**: der laufende Kontostand
   ist Geld, aber nicht der Betrag der Buchung. Er wird trotzdem als
   Betragsspalte erkannt, wenn seine Werte danach aussehen — nur
   bevorzugt wird er nicht. */
const C2_HAMT=/betrag|wert|amount|summe|umsatz|soll|haben|value|debit|credit/i;
/* Sieht der Wert nach Geld aus — nicht bloß nach einer Zahl?
   (C2_CUR trägt /g und ist damit in `test` zustandsbehaftet;
   fürs Prüfen deshalb dieselbe Liste ohne Flag.) */
const C2_CUR1=new RegExp(C2_CUR.source,'i');
function c2Money(s){
  const x=String(s==null?'':s);
  if(isNaN(c2Amount(x)))return false;
  return /[.,]\d{1,2}\s*$/.test(x)||/[-+()−–]/.test(x)||C2_CUR1.test(x);
}
function c2ColKind(i){
  const H=String(W.csv.header[i]||'');
  const probe=W.csv.rows.slice(0,60);
  let n=0,dates=0,nums=0,money=0;
  probe.forEach(r=>{
    const c=r[i]==null?'':String(r[i]).trim();
    if(c==='')return;
    n++;
    if(c2Date(c)){dates++;return;}
    if(!isNaN(c2Amount(c))){nums++;if(c2Money(c))money++;}
  });
  if(C2_HDATE.test(H.trim()))return 'date';
  if(n&&dates>=n*0.7)return 'date';
  /* Mit passender Überschrift genügt die blanke Zahl, ohne sie
     müssen die Werte wie Geld aussehen. */
  if(n&&nums>=n*0.7&&(C2_HAMT.test(H)||money>=n*0.7))return 'amount';
  return null;
}

/* ── Jede gewählte Spalte bekommt ein Feld (Lex, 8.9.26) ─────
   Bis dahin bekam nur ein Feld, dessen **Überschrift** danach
   klang; alles andere blieb leer, und der Nutzer stellte es von
   Hand ein. Jetzt gilt: **wer eine Spalte wählt, bekommt ein
   Feld** — und zwar

     * das **Datumsfeld**, wenn in der Spalte Datumsangaben stehen
       (oder die Überschrift „Buchungstag", „Datum", „Date" … heißt),
     * das **Betragsfeld**, wenn dort Geldbeträge stehen,
     * sonst die **nächste freie Referenz**, in der Reihenfolge, in
       der gewählt wird: die erste Textspalte wird Referenz 1, die
       zweite Referenz 2.

   **Frei wird eine Referenz beim Abwählen** (der Klick-Handler in
   c2Wire setzt das Feld zurück): wer Referenz 1 abwählt und
   danach eine andere Spalte wählt, bekommt wieder Referenz 1 —
   die Nummern rutschen nach, statt Löcher zu lassen.

   Belegt heißt belegt: ein Feld wird nie überschrieben. Ist das
   Datumsfeld schon vergeben und man wählt eine zweite Datumsspalte
   (Buchung und Wertstellung stehen oft nebeneinander), bekommt sie
   eine Referenz. Sind alle sieben Felder vergeben, bleibt die
   Spalte ohne — sie lässt sich trotzdem wählen, und „Weiter" fragt
   dann, ob sie abgewählt werden soll (c2LooseCols). */
function c2GuessCol(i){
  const free=f=>W.f[f]<0||!W.cols.includes(W.f[f]);
  const kind=c2ColKind(i);
  if(kind==='date'&&free('date')){W.f.date=i;return;}
  if(kind==='amount'&&free('amount')){W.f.amount=i;return;}
  const f=C2_REFS.find(free);
  if(f)W.f[f]=i;
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
  const impAt=(e,m)=>e.raw?!!(e.raw.imp&&e.raw.imp[m-1]):false;
  const bookAt=(e,m)=>e.raw?(e.raw.amounts[m-1]||0):0;
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
  const doneAt=(e,m)=>e.raw?!!paidAt(e.raw,m):false;
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
      out.push({m:m,v:bookAt(e,m),rows:rows,once:e.raw?impOnceAt(e.raw,m):false});
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
    /* data-hk: der Klapp-Pfeil fährt erst heraus, wenn die Maus
       über der Zeile steht, und bleibt nach einem Neuzeichnen
       draußen (bindHoverStill in js/ui.js) — nur an Zeilen, die
       etwas zu klappen haben. */
    const hk=(B.by[e.tid]?B.by[e.tid].rows.length:0)+prevLines(e).length?` data-hk="c2:${esc(e.tid)}"`:'';
    /* data-fk: beim Auf- und Zuklappen fahren die Zeilen weich an
       ihre neue Stelle (foldSnap/foldPlay in js/ui.js, gerufen in
       c2Render, wenn W.foldAnim gesetzt ist). */
    return `<tr class="c2trow ${tint}${has&&!fresh?' old':''}${imped(e)?' imped':''}${fresh?' has':''}${isOpen?' open':''}${W.target===e.tid?' sel':''}" data-c2t="${esc(e.tid)}" data-fk="row:${esc(e.tid)}"${hk}>
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
    let sn=0;
    const line=(cls2,lead,inner,attr)=>`<tr class="c2src ${cls2}" data-fk="src:${esc(e.tid)}:${sn++}"${attr||''}><td class="mapc"></td><td class="foldc"></td>
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
        out+=`<tr class="c2src cur c2srcmore" data-fk="src:${esc(e.tid)}:more"><td class="mapc"></td><td class="foldc"></td><td class="tn"></td><td colspan="${SRCSPAN}">${t('c2.srcMore',b.rows.length-SRCCAP)}</td></tr>`;
    }
    return out;
  };
  /* Die Summen der Block- und Kategoriezeilen rechnen über
     dieselben Werte wie die Zeilen darunter (eff): sonst nennte die
     Überschrift eine andere Zahl als ihre Posten. */
  const gsum=list=>sumOf(list.map(eff));
  const grow=(cls2,label)=>`<tr class="${cls2}"><td class="mapc"></td><td class="foldc"></td><td class="tn">${label}</td>`;
  /* **Die Blockzeile klappt ihren Block** (6.9.26 spät, Lex): ein
     Klick auf die Zeile, wie in der Jahresmatrix — zugeklappt bleibt
     die Blockzeile mit ihren Summen, Kategorien und Ziele darunter
     werden gar nicht erst gebaut. Der Zustand lebt in W.blkFold
     (nur für diesen Lauf). Der Pfeil fährt beim Überfahren heraus
     (data-hk) wie an den Zielzeilen. */
  W.blkFold=W.blkFold||{};
  const bhead=(cls2,key,label)=>{
    const fold=!!W.blkFold[key];
    return `<tr class="${cls2}" data-c2blk="${key}" data-hk="c2blk:${key}" data-fk="bhead:${key}"><td class="mapc"></td><td class="foldc"><button class="c2fold${fold?'':' open'}" data-c2blk="${key}" aria-expanded="${!fold}"
      title="${esc(t(fold?'c2.blkShow':'c2.blkHide'))}">${C2_TRI}</button></td><td class="tn">${label}</td>`;
  };
  /* **Drei Blöcke wie in der Jahresmatrix** (6.9.26): Einnahmen,
     Flexible, Regelmäßige Kosten — jeder als eigener
     `<tbody>`, mit einer Leerzeile davor (10 px, wie zwischen den
     „Karten" der Matrix) und gerundeten Ecken (css/components.css,
     .c2blk). Die Blockzeile trägt die Blockstufe -3, die
     Kategoriezeile die Stufe -2 mit der 3-px-Kante, die Posten die
     Stufe -1 — dieselbe Leiter wie dort. Bis dahin stand hier je nach
     Art nur die eine Hälfte. */
  /* Ein flexibler Posten ist seit 6.9.26 abends ein Posten wie jeder
     andere (isFlex in js/calc.js) — dieselbe Zeile, dieselben Felder;
     nur der Block, in dem er steht, ist ein anderer. */
  const fresh=W.newT.map(x=>({tid:x.tid,name:x.name,group:x.group||(x.flex?NOCAT_FLEX:''),
      bank:x.bank||'',pay:x.pay||'',due:x.due||'',end:null,amounts:Z(),
      income:!!x.income,flex:!!x.flex,isNew:true}));
  const all=state.fixed.map(i=>({tid:'i:'+i.id,name:i.name,group:i.group,
    bank:i.bank,pay:i.pay,due:i.dueDay,end:i.end,amounts:i.amounts,raw:i,
    income:isIncome(i),flex:isFlex(i),isNew:false})).concat(fresh.filter(e=>e.group));
  const flexList=all.filter(e=>e.flex);
  const NCOL=15;
  const spacer=()=>`<tr class="spacer">${'<td></td>'.repeat(NCOL)}</tr>`;
  const parts=[];
  /* Alle drei Blöcke nach Kategorie (seit 6.9.26 auch der flexible,
     und die Kategoriezeile steht immer — auch „… ohne Kategorie"
     ist eine Auskunft), in der Reihenfolge der Einstellungen; eine
     Kategorie, die dort nicht mehr steht, kommt hinten nach. */
  const order=(bl)=>bl==='g-in'?incomeGroups():(bl==='g-flex'?flexGroups():costGroups());
  [[t('c2.blkIn'),'g-in','r-in',all.filter(e=>e.income)],
   [t('c2.blkFlex'),'g-flex','r-flex',flexList],
   [t('c2.blkOut'),'g-out','r-out',all.filter(e=>!e.income&&!e.flex)]]
  .forEach(bl=>{
    const list=bl[3];
    if(!list.length)return;
    let body=bhead('ghead '+bl[1],bl[1],esc(bl[0]))+numCells(gsum(list))+'</tr>';
    const cats=order(bl[1]).slice();
    list.forEach(e=>{if(!cats.includes(e.group))cats.push(e.group);});
    if(!W.blkFold[bl[1]]) cats.forEach(c=>{
      const sub=list.filter(e=>e.group===c);
      if(!sub.length)return;
      body+=grow('gcat '+bl[1],esc(keyLabel(c)))+numCells(gsum(sub))+'</tr>';
      sub.forEach(e=>{body+=trow(e,bl[2])+srcLines(e);});
    });
    parts.push(`<tbody class="c2blk" data-fk="blk:${bl[1]}">${spacer()}${body}</tbody>`);
  });
  const body=parts.length?parts.join('')
    :`<tbody><tr><td class="c2empty" colspan="${NCOL}">${t('c2.emptyT',t('c2.newAssign'))}</td></tr></tbody>`;
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
  /* Derselbe Handgriff als Wort (seit 6.9.26): ein Knopf am
     rechten Rand der Kopfzelle „Ziel", der erst herausfährt, wenn
     die Maus über der Kopfzeile steht (.c2foldall in
     css/components.css). Er heißt, was er tut: „Alle zuklappen",
     sobald ein Ziel offen steht, sonst „Alle aufklappen". Verdrahtet
     wie der Pfeil über data-c2foldall; data-hk an der Kopfzeile
     hält ihn nach dem Klick draußen (bindHoverStill). */
  function foldAllBtn(){
    if(!openable.length)return '';
    const any=openable.some(tid=>W.open[tid]);
    return `<button class="btn c2foldall" data-c2foldall="${any?'0':'1'}"
      title="${esc(t(any?'c2.foldAllHide':'c2.foldAllShow',openable.length))}">${t(any?'c2.foldAllBtnHide':'c2.foldAllBtnShow')}</button>`;
  }
  /* **Keine Gesamtspalte**: hier wird zugeordnet, nicht bilanziert —
     die Jahressumme steht in der Jahresmatrix. Die Spalte nahm nur
     die Breite weg, die die zugeordneten Zeilen brauchen. */
  return `<table class="c2ttab">
    <thead><tr${openable.length?' data-hk="c2:head"':''}><th class="mapc"></th><th class="foldc">${foldAllCell()}</th><th class="tn">${t('c2.tgt')}${foldAllBtn()}</th>
      ${MONTHS.map((m,i)=>`<th class="num${cm(i+1)}">${i+1===CUR?`<span class="c2now">${m}</span>`:m}</th>`).join('')}</tr></thead>
    ${body}</table>`;
}

/* Die Spalten in Schritt 3, in der Reihenfolge der Felder: Datum,
   Betrag, Referenz 1 bis 5 — **nur die verknüpften** (5.9.26). Eine
   gewählte Spalte ohne Feld kommt nicht mit; in Schritt 2 fragt
   der Knopf danach (c2LooseCols), c2GoStep3 wählt sie ab. */
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
  const avail=wrap.clientWidth-C2_PICKW;
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
  let ci=1;
  ord.forEach(i=>{if(cols[ci])cols[ci].style.width=w[i]+'px';ci++;});
  tb.style.width=(ord.reduce((a,i)=>a+w[i],0)+C2_PICKW)+'px';
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
    /* **Zugeordnet ist zugeordnet** (6.9.26 spät): eine Zeile, die
       schon im Buch steht, und eine, die dieser Lauf zugeordnet hat,
       bleiben beide in der Tabelle — grau, mit Kreuz — und gehen nur
       über den Schalter „… verbergen" hinaus. Bis dahin verschwand
       die frisch zugeordnete Zeile sofort, und man sah nicht, was
       man gerade getan hatte. Die Zeilen der Regel, die gerade
       bearbeitet wird, stehen immer da (gelb). */
    const editing=W.editRule!=null&&ri===W.editRule;
    if(!W.showOld&&!editing&&(ri>=0||W.inBook.has(i)))continue;
    if(!c2Match(W.csv.rows[i],terms))continue;
    out.push(i);
  }
  return out;
}
/* Markiert **und** sichtbar — das ist die Auswahl, mit der die
   einmalige Zuordnung arbeitet. Wer markiert und danach den Filter
   enger zieht, hat die verschwundenen Zeilen damit abgewählt. */
function c2Picked(){
  return c2Visible().filter(i=>W.pick[i]&&W.meta[i].in&&W.asg[i]<0&&!W.inBook.has(i));
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
    const editing=ri>=0&&W.editRule!=null&&ri===W.editRule;
    const cls=!W.meta[i].in?'off':(editing?'done':'');
    const tn=ri>=0?W.rules[ri].t.name:'';
    const tip=c=>ri>=0?esc(t('c2.rowTip',tn)+'\n'+row[c]):esc(row[c]);
    /* Im Markier-Modus steht vorn ein Kästchen — aber nur an
       Zeilen, die überhaupt zugeordnet werden können: eine schon
       zugeordnete oder eine außerhalb des Jahres wäre ein Angebot,
       das der Knopf danach nicht einlöst. */
    /* **Die Spalte „X" steht immer** (6.9.26 abends): schon
       importierte Zeilen (W.inBook) tragen darin ein graues Kreuz und
       stehen grau — sie lassen sich weder markieren noch über einen
       Filter zuordnen; im Markier-Modus trägt die Spalte an den
       übrigen Zeilen das Kästchen. **Dasselbe Bild trägt eine Zeile,
       die dieser Lauf zugeordnet hat** (6.9.26 spät, `asg`): grau
       mit Kreuz, die Sprechblase nennt das Ziel. Nur sie bleibt
       anklickbar — ein Klick öffnet ihre Regel (c2EditRule), eine
       Handauswahl sagt dort, dass sie über das ☰ am Ziel
       zurückgeht. Die Zeilen der Regel in Bearbeitung stehen gelb,
       ohne Kreuz. */
    const old=W.inBook.has(i);
    const asg=ri>=0&&!editing;
    const can=W.meta[i].in&&ri<0&&!old;
    const box=`<td class="c2pk">${old?`<span class="c2mpold" title="${esc(t('c2.inBookTip'))}">&#10005;</span>`
      :asg?`<span class="c2mpold" title="${esc(t('c2.asgTip',tn))}">&#10005;</span>`
      :(W.once&&can?`<input type="checkbox" data-c2pick="${i}"${W.pick[i]?' checked':''}>`:'')}</td>`;
    /* **Die letzte Zelle ist leer und hat kein Maß.** Die Tabelle
       ist so breit wie die Summe ihrer Spalten; ist das weniger
       als die Fläche, streckte `min-width:100%` sonst jede Spalte
       anteilig — und die Breiten aus Schritt 2 wären wieder dahin.
       Die Füllspalte nimmt den Rest und lässt die anderen in Ruhe. */
    out+=`<tr class="${cls}${old?' inbook':''}${asg?' inbook asg':''}${W.once&&W.pick[i]&&can?' picked':''}" data-c2i="${i}"${ri>=0?` data-c2ri="${ri}"`:''}>`+box+
      ord.map(c=>`<td data-c2f="${c2FieldOf(c)}" title="${tip(c)}">${esc(row[c])}</td>`).join('')+'<td class="c2fill"></td></tr>';
  }
  const span=W.cols.length+2;
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
  const terms=c2LiveTerms(),on=terms.length>0,edit=W.editRule!=null;
  /* Nur ein Spaltenfilter trägt eine Regel — der Schnellfilter
     allein nicht (siehe c2DoAssign); der Knopf bleibt dann grau und
     sagt in der Sprechblase, was fehlt. */
  const cols=terms.some(tm=>tm.f!=='q');
  /* **Der rote Punkt am ☰** (6.9.26): solange irgendein Filter etwas
     trägt — Spaltenfeld, angeheftete Zeile oder Schnellfilter —,
     sagt er, dass im Menü etwas wartet: „Filter zurücknehmen", dort
     dann in Rot (c2AssignMenu). */
  const dot=W.box.querySelector('#c2FDot');
  if(dot)dot.hidden=!on;
  const h=c2Hits();
  const n=h.free.length+(edit?h.own.length:0);
  const np=c2Picked().length;
  const canFlt=!W.once&&cols&&n>0&&!!W.target;
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
    :(!W.once&&on&&!cols?t('c2.tOnlyQ')
    :(!W.target&&cnt>0?t('c2.tNoTarget',t('c2.newAssign')):t('c2.mnNoSel')));
  /* **„Neu anlegen und zuordnen" ist nie gesperrt.** Ein neues
     Ziel lässt sich immer anlegen — was gerade markiert oder
     gefiltert ist, geht danach gleich an es; ist nichts gewählt,
     entsteht eben nur der Posten. Ein gesperrter Knopf stünde
     genau dann im Weg, wenn man mit dem neuen Ziel anfangen
     will. */
  /* In Klammern nur, was nach dem Anlegen auch zugeordnet würde —
     ein Schnellfilter allein zählt nicht. */
  const cntNew=W.once?np:(cols?n:0);
  bNew.textContent=t('c2.newAssign')+(cntNew>0?` (${cntNew})`:'');
  c2FitBar();
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
     'ref1'…'ref5' — genau das, was eine gemerkte Regel später sagt.
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
    title="${esc(t(allOn?'c2.pickNone':'c2.pickAll',vis.length))}"></th>`
    :`<th class="c2pk c2pkx" title="${esc(t('c2.inBookTip'))}">${t('c2.pkHead')}</th>`;
  const chipRow=W.chips.some(tm=>tm.f!=='q')
    ?`<tr class="c2chiprow"><th class="c2pk"></th>${ord.map(i=>{
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
  /* **Grau auch, wenn keine gemerkte Regel eine freie Zeile trifft**
     (6.9.26): das Fenster dahinter zeigt nur Posten mit Treffern
     (c2MapHits, c2MapPick) — träfe keine, ginge ein leeres Fenster
     auf; die Sprechblase sagt es stattdessen hier. */
  let auto='';
  if(W.mapRules&&W.mapRules.length){
    const hits=c2MapHits().filter(e=>e.hasNew).length;
    auto=hits
      ?`<button class="btn primary" data-c2="autoMap" data-c2fit="auto" title="${esc(t('c2.autoMapTip',W.mapRules.length))}">${t('c2.autoMap')}</button>`
      :`<button class="btn" data-c2="autoMap" data-c2fit="auto" disabled title="${esc(t('c2.mpGone'))}">${t('c2.autoMap')}</button>`;
  }else if(W.autoDone)
    auto=`<button class="btn" data-c2="autoMap" data-c2fit="auto" disabled title="${esc(t('c2.autoMapDone'))}">${t('c2.autoMap')}</button>`;
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
        <!-- Der rote Punkt (6.9.26): solange irgendein Filter etwas
             trägt, wartet im Menü „Filter zurücknehmen" — nachgeführt
             in c2RefreshBtns, dieselbe Sprache wie #dirtyDot am
             Hamburger der Kopfzeile. -->
        <button class="btn c2burger" id="c2Menu"
          title="${esc(t('c2.menuTip'))}" aria-label="${esc(t('c2.menuTip'))}">&#9776;<span class="dirtydot" id="c2FDot" hidden></span></button>
        <!-- **Der Modus-Knopf steht zwischen ☰ und „Zuordnen"**
             (5.9.26; vorher ganz rechts): er entscheidet, was der
             Knopf daneben tut — merken oder einmalig —, und gehört
             deshalb unmittelbar davor. Weiß in Ruhe, schwarz,
             solange der Modus läuft (.onceb in css/components.css). -->
        <button class="btn onceb" id="c2Once" data-c2="assignOnce" data-c2fit="once" aria-pressed="false"
          title="${esc(t('c2.assignOnceTip'))}">${t('c2.assignOnce')}</button>
        <button class="btn c2go" id="c2Do" data-c2="goAssign"></button>
        <button class="btn" id="c2New" data-c2="newTAssign"></button>
        <span class="c2spacer"></span>
        <!-- Schon zugeordnete Zeilen zeigen oder verbergen (6.9.26
             abends): **gedrückt (schwarz) sind sie ausgeblendet** —
             der Knopf heißt dann „… zeigen" —, weiß stehen sie in
             der Tabelle; gibt es keine, ist der Knopf grau. Gezählt
             wird beides: was schon im Buch steht und was dieser Lauf
             zugeordnet hat (6.9.26 spät). -->
        ${(()=>{const nAsg=W.asg.filter(v=>v>=0).length,nOld=W.inBook.size,nAll=nOld+nAsg;
          return `<button class="btn oldtog" id="c2Old" data-c2="toggleOld" data-c2fit="old" aria-pressed="${!W.showOld}"${nAll?'':' disabled'}
          title="${esc(nAll?t('c2.oldTip',nAll,nOld,nAsg):t('c2.noOld'))}">${t(W.showOld?'c2.hideOld':'c2.showOld')}</button>`;})()}
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
      <table class="c2tab c2csvtab" style="width:${ord.reduce((a,i)=>a+wOf(i),0)+C2_PICKW}px">
        <colgroup><col style="width:${C2_PICKW}px">${ord.map(i=>`<col style="width:${wOf(i)}px">`).join('')}<col></colgroup>
        <thead>
          <tr>${pickHead}${ord.map(colHead).join('')}<th class="c2fill"></th></tr>
          <tr class="c2fltrow"><th class="c2pk"></th>${ord.map(fltCell).join('')}<th class="c2fill"></th></tr>
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
  if(old)popOut(old);
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
    popOut(pop);
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
      /* **Der Schnellfilter allein trägt keine Regel** (6.9.26): er
         ist eine Sichthilfe über alle Felder und wird nie gemerkt
         (c2StoreRules lässt 'q' weg). Eine Zuordnung, die nur aus
         ihm bestand, kam ins Buch, ohne dass am Posten ein
         Kriterium stünde — im Fenster gab es dann nichts zu ändern,
         und beim nächsten Import fand sie nichts wieder. Wer ohne
         Spaltenfilter zuordnen will, markiert die Zeilen einmalig. */
      if(!terms.some(tm=>tm.f!=='q')){warn(t('c2.tOnlyQ'));return;}
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
      /* Kam die Regel über „Suchen nach gemerkten Kriterien" aus dem
         Angebot der gemerkten (W.mapRules), steht sie dort nicht
         noch einmal: sonst böte das Wahl-Fenster sie weiter an, und
         c2StoreRules sähe sie doppelt. */
      if(W.mapRules){
        const key=c2RuleKey(W.rules[ri]);
        W.mapRules=W.mapRules.filter(r=>c2RuleKey(r)!==key);
        if(!W.mapRules.length){W.mapRules=null;W.autoDone=true;}
      }
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
/* ── Die Zuordnungsleiste passt sich dem Fenster an (7.9.26) ──
   Ist die Leiste breiter als ihre Zeile, gab es bis dahin einen
   Rollbalken quer über den Knöpfen. Jetzt ziehen sich Knöpfe ins
   ☰-Menü zurück — gemessen, nicht geraten, wie fitHeaderBtns() in
   js/app.js: die natürlichen Breiten der Kinder (flex:0 0 auto,
   nowrap) gegen die Breite der Zeile. Zuerst geht „Automatisch
   zuordnen…", dann „Schon zugeordnete…", dann der Modus-Knopf;
   „Zuordnen und merken" (bzw. „Einmalig zuordnen") und „Neu
   anlegen und zuordnen" bleiben immer stehen (Lex). Was im Menü
   steckt, sagt W.inMenu; c2AssignMenu baut daraus Einträge, die den
   versteckten Knopf drücken — eine Verdrahtung, kein Zwilling.
   Gerufen nach jedem Neuzeichnen (c2RefreshBtns, dort ändern sich
   auch die Beschriftungen mit den Zählern), beim Ziehen der
   Anleitung (c2GuideWidth) und beim Fenster-Resize. */
const C2_FIT_ORDER=['auto','old','once'];
function c2FitBar(){
  const row=W&&W.box&&W.box.querySelector('.c2mid .c2row'); if(!row)return;
  const btn=k=>row.querySelector(`[data-c2fit="${k}"]`);
  C2_FIT_ORDER.forEach(k=>{const b=btn(k);if(b)b.hidden=false;});
  W.inMenu=[];
  const gap=parseFloat(getComputedStyle(row).columnGap)||10;
  const need=()=>{
    let w=0,n=0;
    for(const c of row.children){
      if(c.hidden||c.classList.contains('c2spacer'))continue;
      w+=c.getBoundingClientRect().width;n++;
    }
    return w+Math.max(0,n-1)*gap;
  };
  for(const k of C2_FIT_ORDER){
    if(need()<=row.clientWidth+0.5)break;
    const b=btn(k);if(!b)continue;
    b.hidden=true;W.inMenu.push(k);
  }
}

function c2AssignMenu(btn){
  const old=W.modal.querySelector('.c2fpop');
  const again=old&&old.dataset.tid==='assign';
  if(old)popOut(old);
  if(again)return;
  const item=(act,lab,tip,x)=>`<button data-do="${act}"${x||''} title="${esc(tip)}">${esc(lab)}</button>`;
  /* „Filter zurücknehmen" **in Rot, solange ein Filter etwas trägt**
     (6.9.26) — Spaltenfeld, angeheftete Zeile oder Schnellfilter:
     derselbe Hinweis wie der rote Punkt am ☰ (c2RefreshBtns). Ohne
     Filter ist der Eintrag grau: es gibt nichts zurückzunehmen. */
  const on=c2LiveTerms().length>0;
  const pop=document.createElement('div');
  pop.className='c2fpop c2amenu';pop.dataset.tid='assign';
  /* Die Knöpfe, die aus der Leiste hierher ausgewichen sind
     (c2FitBar): derselbe Text, derselbe Stand — gedrückt fett,
     gesperrt grau —, und der Klick drückt den versteckten Knopf. */
  const moved=(W.inMenu||[]).map(k=>{
    const b=W.box.querySelector(`[data-c2fit="${k}"]`); if(!b)return '';
    const pressed=b.getAttribute('aria-pressed')==='true';
    return item('fit-'+k,b.textContent.trim(),b.title||b.textContent.trim(),
      (b.disabled?' disabled':'')+(pressed?' class="on"':''));
  }).join('');
  pop.innerHTML=
    moved+(moved?'<div class="c2msep"></div>':'')+
    item('clearFlt',t('c2.clearFlt'),t('c2.clearFlt'),on?' class="hot"':' disabled')+
    item('crit',t('c2.mnCrit'),t('c2.mnCritTip'));
  W.modal.appendChild(pop);
  const r=btn.getBoundingClientRect(),w=pop.offsetWidth,hh=pop.offsetHeight;
  pop.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';
  pop.style.top=(r.bottom+3+hh>innerHeight?Math.max(8,r.top-3-hh):r.bottom+3)+'px';
  const close=()=>{
    popOut(pop);
    document.removeEventListener('click',away,true);
    document.removeEventListener('scroll',away,true);
  };
  const away=e2=>{if(!pop.contains(e2.target)&&!btn.contains(e2.target))close();};
  pop.querySelectorAll('button').forEach(b=>{
    b.onclick=e=>{
      e.stopPropagation();
      close();
      if(b.dataset.do.startsWith('fit-')){
        const hb=W.box.querySelector(`[data-c2fit="${b.dataset.do.slice(4)}"]`);
        if(hb)hb.click();
        return;
      }
      if(b.dataset.do==='clearFlt'){c2ClearFlt();return;}
      /* Die Kriterien stehen an den Posten (impRules) — alle, regulär
         wie flexibel: der nächste Import wendet sie von selbst an. */
      openImpRules('all');
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
   danach ist es ein Posten oder eine Kategorie mit diesem Namen.
   `flex` sagt, in welcher der beiden Listen gesucht wird. */
function c2BookByName(nm,flex){
  const qn=String(nm||'').trim().toLowerCase();
  const it=state.fixed.find(x=>x.name.trim().toLowerCase()===qn&&(flex?isFlex(x):!isFlex(x)));
  return it?{tid:'i:'+it.id,name:it.name,income:isIncome(it),flex:isFlex(it)}:null;
}

/* Die Regeln **aller** Posten und aller flexiblen Kategorien — seit
   6.9.26 beide zusammen, es gibt keine Art mehr, die eine Hälfte
   ausschlösse. */
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
  state.fixed.forEach(it=>add(it,{tid:'i:'+it.id,name:it.name,income:isIncome(it),flex:isFlex(it)}));
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
    const fresh={terms:terms,t:{tid:x.tid,name:x.name,income:!!x.income,flex:!!x.flex},fromMap:true,book:r};
    if(!have.has(c2RuleKey(fresh)))out.push(fresh);
  });
  return out;
}

/* ── Alles lösen, was in diesem Lauf auf ein Ziel zeigt ──────
   (6.9.26) Für „Zuordnung dieser Datei zurücksetzen" im Zeilenmenü
   und für „Alle Importdaten löschen" in den beiden Fenstern
   (js/dialogs/item.js, js/dialogs/kakeibo-betraege.js), wenn sie
   aus dem Wizard heraus offen sind: die Regeln und Handauswahlen,
   die auf das Ziel zeigen, fallen aus W.rules, ihre Zeilen sind
   wieder frei. Zurück kommt die Zahl der gelösten Zeilen; `dry`
   zählt nur — für die Rückfrage, bevor etwas geschieht. Außerhalb
   von Schritt 3 gibt es nichts zu lösen: 0. Die gemerkten
   Kriterien am Posten bleiben — sie sind keine Importdaten. */
function c2Unassign(tid,dry){
  if(!W||W.step!==3||!W.csv)return 0;
  const n=W.asg.filter(v=>v>=0&&W.rules[v]&&W.rules[v].t&&W.rules[v].t.tid===tid).length;
  if(dry)return n;
  const er=W.editRule!=null?W.rules[W.editRule]:null;
  W.rules=W.rules.filter(r=>!(r.t&&r.t.tid===tid));
  W.editRule=er&&W.rules.includes(er)?W.rules.indexOf(er):null;
  c2ApplyRules();
  return n;
}

function c2RowMenu(btn,tid){
  const old=W.modal.querySelector('.c2fpop');
  const again=old&&old.dataset.tid===tid;
  if(old)popOut(old);
  if(again)return;
  const x=c2Find(tid);
  const ri=W.rules.findIndex(r=>r.t.tid===tid);
  /* **„Suchen nach gemerkten Kriterien"** (6.9.26; vom 5.9. bis
     dahin „CSV-Daten nach gespeicherten Importkriterien zuordnen",
     rot und mit sofortiger Zuordnung): trägt dieser Posten gemerkte
     Kriterien, stellt der Eintrag sie **als Filter** ein — die
     Zeilen, die sie treffen, stehen dann unten, der Posten ist das
     Ziel, und „Zuordnen und merken" ist der nächste Klick. Dieselbe
     Bauform wie „Suchen nach Betrag": erst sehen, was die Kriterien
     treffen, dann zuordnen — bis dahin wurde ohne Blick auf die
     Zeilen zugeordnet, und in Rot las sich der Eintrag wie eine
     Warnung. Trägt der Posten mehrere Regeln, kommt die erste, die
     gerade freie Zeilen trifft; ist sie zugeordnet, bietet das Menü
     die nächste an (was schon in W.rules steht, kommt nicht noch
     einmal — c2MapRulesFor). Die Sprechblase nennt, wie viele
     Regeln es sind und wie viele freie Zeilen sie treffen. */
  const critRules=c2MapRulesFor(tid);
  const hitsOf=r=>W.csv.rows.filter((row,i)=>W.asg[i]<0&&W.meta[i].in&&c2Match(row,r.terms)).length;
  const critHits=critRules.length
    ?W.csv.rows.filter((row,i)=>W.asg[i]<0&&W.meta[i].in&&critRules.some(r=>c2Match(row,r.terms))).length:0;
  const impMonths=()=>{
    if(tid.indexOf('i:')===0){
      const it=findItem(tid.slice(2));
      return it&&it.imp?it.imp.map((v,i)=>v?i+1:0).filter(Boolean):[];
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
  const canOpen=tid.indexOf('i:')===0&&!!findItem(tid.slice(2));
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
    (critRules.length?`<button data-do="critq" title="${esc(critHits?t('c2.mnApplyCritTip',critRules.length,critHits):t('c2.mnApplyCritNone'))}">${esc(t('c2.mnCritQ'))}</button>`:'')+
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
    popOut(pop);
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
        }
        return;
      }
      if(what==='edit'){ c2EditRule(ri); return; }
      if(what==='critq'){
        if(!critRules.length)return;
        const r=critRules.find(rr=>hitsOf(rr)>0)||critRules[0];
        W.target=tid;W.editRule=null;
        /* Die Regel ist die ganze Suche: was vorher im Filter
           stand, gehörte einer anderen — Felder, Schnellfilter und
           Zeilen fangen leer an, die Bedingungen der Regel stehen
           als angeheftete Zeilen da, anpassbar wie jede. */
        W.flt={};W.fltOp={};W.q='';
        W.chips=r.terms.map(tm=>({f:tm.f,op:tm.op,val:tm.val}));
        c2Render();
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
        const n=c2Unassign(tid);
        c2Render();
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
  bindHoverStill(box);

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
          W.rules=[];W.newT=[];W.asg=[];W.flt={};W.fltOp={};W.chips=[];W.q='';W.skip={};
          W.colw={};W.target='';W.editRule=null;W.ignoreMap=false;W.autoCols=false;
          W.mapRules=null;W.autoDone=false;W.mapName='';W.mapKey='';
        }catch(e){W.csv=null;warn(t('c2.readFail',e.message));}
        /* **Kennt FINA die Datei-Art nicht, geht es gleich nach
           Schritt 2** (6.9.26): dort gibt es etwas zu tun, in
           Schritt 1 nicht mehr. Kennt FINA sie, hält Schritt 1 an —
           der Kasten der gemerkten Struktur will zuerst eine
           Antwort (c2MapPending, c2Advance). */
        if(!c2Advance())c2Render(true);
      };
      r.readAsArrayBuffer(f);
    };
    /* **„Automatisch CSV-Datenstruktur vorbereiten"** (5.9.26; bis
       dahin „Mit gemerkter Zuordnung weiter", und das sprang gleich
       in Schritt 3): die Feldverknüpfung kommt aus der gewählten
       Struktur (c2MapKey), und es geht nach **Schritt 2** — dort
       sieht man, was übernommen wurde, und kann es prüfen. Die
       gemerkten Kriterien der Posten kommen erst beim Weitergehen
       von dort (c2GoStep3): gelesen wird hier nur die Struktur,
       zugeordnet wird nichts — genau, was der Kasten verspricht. */
    on('applyMap',()=>{
      const key=c2MapKey(),m=state.csvMaps[key];
      if(!m)return;
      W.mapKey=key;W.mapName=m.file||'';
      W.f=Object.assign(c2BlankF(),m.f||{});
      C2_FIELDS.forEach(f=>{if(W.f[f]>=W.csv.header.length)W.f[f]=-1;});
      W.cols=c2Order();
      W.rules=[];W.newT=[];W.asg=[];W.target='';W.editRule=null;W.skip={};
      W.mapRules=null;W.autoDone=false;
      W.autoCols=true;W.ignoreMap=false;
      if(!c2Advance())c2Render();
    });
    /* **„CSV-Datenstruktur von Grund auf neu anordnen"**: Schritt 2
       fängt leer an. Auch wer vorher „Automatisch" gedrückt hatte
       und zurückkommt, fängt hier von vorn an — „von Grund auf"
       heißt genau das. */
    on('ignoreMap',()=>{
      W.ignoreMap=true;W.autoCols=false;W.mapRules=null;W.autoDone=false;W.mapKey='';
      W.cols=[];W.f=c2BlankF();
      W.rules=[];W.newT=[];W.asg=[];W.target='';W.editRule=null;W.skip={};
      if(!c2Advance())c2Render();
    });
    /* Die Zeilen der gemerkten Strukturen: Auswahlknopf (nur bei
       mehreren), Stift, ✕ — siehe c2Step1. */
    box.querySelectorAll('[data-c2mpk]').forEach(r=>{
      r.onchange=()=>{
        W.mapKey=r.dataset.c2mpk;
        box.querySelectorAll('.c2kmrow').forEach(x=>x.classList.toggle('on',x.contains(r)));
      };
    });
    box.querySelectorAll('[data-c2mped]').forEach(b=>{
      b.onclick=()=>{
        W.mapKey=b.dataset.c2mped;
        openCsvStructure(b.dataset.c2mped,()=>{if(W&&W.step===1&&W.modal.isConnected)c2Render();});
      };
    });
    box.querySelectorAll('[data-c2mpdel]').forEach(b=>{
      b.onclick=()=>{
        const k=b.dataset.c2mpdel,m=state.csvMaps[k]||{};
        if(!confirm(t('set.csvMapDelAsk',m.file||k)))return;
        delete state.csvMaps[k];
        if(W.mapKey===k)W.mapKey='';
        /* Was aus dieser Struktur übernommen war, gilt nicht mehr als
           übernommen: Schritt 2 fragt dann wieder nach einem Namen. */
        W.autoCols=false;
        save();c2Render();
        toast(t('c2.mapForgot',m.file||k));
      };
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
          W.mapName='';W.mapKey='';W.skip={};
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
    /* Zwei Wege zu demselben: der Pfeil links und der Knopf in der
       Kopfzelle „Ziel" — beide tragen data-c2foldall. */
    /* Blockzeile und ihr Pfeil: ein Klick klappt den Block — auf
       Knöpfen in der Zeile nicht, der Pfeil selbst ist einer und
       hat seinen eigenen Klick. */
    box.querySelectorAll('tr[data-c2blk]').forEach(tr=>{
      const key=tr.dataset.c2blk;
      const flip=e=>{ e.stopPropagation(); W.foldAnim=true; if(W.blkFold[key]) delete W.blkFold[key]; else W.blkFold[key]=1; c2Render(); };
      tr.onclick=e=>{ if(e.target.closest('button,a,input')) return; flip(e); };
      const b=tr.querySelector('button[data-c2blk]'); if(b) b.onclick=flip;
    });
    box.querySelectorAll('[data-c2foldall]').forEach(fa=>fa.onclick=e=>{
      e.stopPropagation(); W.foldAnim=true;
      if(fa.dataset.c2foldall==='1')
        box.querySelectorAll('[data-c2fold]').forEach(b=>{W.open[b.dataset.c2fold]=1;});
      else W.open={};
      c2Render();
    });
    box.querySelectorAll('[data-c2fold]').forEach(b=>{
      b.onclick=e=>{
        e.stopPropagation();
        const tid=b.dataset.c2fold; W.foldAnim=true;
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
        W.foldAnim=true;
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
      /* Schon im Buch: schreibgeschützt — ein Klick füllt keinen
         Filter (6.9.26 abends). */
      if(td.closest('tr.inbook'))return;
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
      /* FINA kennt die Datei-Art, und der Kasten unter der Datei
         wartet auf die Antwort — die Struktur automatisch
         vorbereiten oder von Grund auf neu anordnen. Ein „Weiter",
         das stillschweigend eins von beiden wählte, träfe eine
         Entscheidung, die dem Nutzer gehört. */
      if(c2MapPending()){warn(t('c2.nextKnown'));return;}
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
      /* **Gewählte Spalten ohne Feld halten auf** (6.9.26): bis
         dahin fielen sie auf dem Weg nach Schritt 3 still weg
         (c2GoStep3). Jetzt fragt ein Fenster, ob sie abgewählt
         werden sollen — Ja wählt sie ab und bleibt im Schritt,
         damit man das Ergebnis sieht und dann erst weitergeht;
         Abbrechen lässt alles stehen, und man räumt selbst auf. */
      const loose=W.cols.filter(i=>!c2Order().includes(i));
      if(loose.length){c2LooseCols(loose);return;}
      c2Meta();
      if(!W.meta.some(m=>m.in)){warn(t('c2.noYear',YEAR));return;}
      /* **Stehen die Spalten noch so da, wie sie gemerkt sind**
         (automatischer Weg, nichts umgestellt), geht es ohne Frage
         weiter: der Knopf heißt dann „Weiter" (c2Nav), und ein
         Namensfenster für etwas, das schon gemerkt ist, wäre eine
         Frage ohne Antwortbedarf. */
      if(W.autoCols&&c2ColsSame()){c2GoStep3();return;}
      /* Sonst erst der Name, dann der Schritt: Abbrechen im Fenster
         lässt alles stehen, Speichern legt die Spalten ab
         (c2SaveCols) und geht weiter. */
      c2AskMapName(c2GoStep3);
    });
  }
  if(W.step===3){
    on('to2',()=>{W.editRule=null;W.step=2;c2Render();});
    on('apply',c2Apply);
    on('toggleOld',()=>{W.showOld=!W.showOld;c2Render();});
  }
  if(W.step>1){
    on('guide',()=>{if(W.guide)c2GuideGhost();W.guide=!W.guide;W.guideAnim=W.guide;c2Render();});
    /* Der Kopf der Anleitung (c2GuidePanel): Sprache, eigener
       Reiter, Griff. Der neue Reiter wird im Klick geöffnet, sonst
       hielte der Browser ihn für ungefragt; hält er ihn trotzdem
       auf, bleibt die Anleitung stehen. */
    box.querySelectorAll('[data-c2="glang"]').forEach(b=>{b.onclick=()=>{W.gLang=b.dataset.l==='de'?'de':'en';c2Render();};});
    on('gfull',()=>{
      const html=c2GuideDoc();
      const w=window.open('','_blank');
      if(!w){warn(t('guide.fullBlocked'));return;}
      w.document.open();w.document.write(html);w.document.close();
      c2GuideGhost();W.guide=false;c2Render();
    });
    c2GuideHandle(box.querySelector('[data-c2="ghandle"]'));
  }
}

/* **Der eine Weg in den dritten Schritt** (5.9.26) — ob mit oder
   ohne Namensfrage, ob die Spalten aus dem Gemerkten kamen oder
   von Hand: Spaltenbreiten messen, die gemerkten Regeln der
   Datei-Art bereitlegen (als Angebot in der Leiste, nicht als
   Zuordnung — siehe c2LoadMapRules), zuordnen, was schon in W.rules
   steht, und zeichnen. Bis dahin standen diese vier Zeilen zweimal
   da, und der automatische Weg übersprang Schritt 2. */
function c2GoStep3(){
  /* **Nur verknüpfte Spalten kommen mit** (5.9.26): die Kriterien
     in Schritt 3 beziehen sich auf Felder, und eine Spalte ohne
     Feld hätte dort keinen Namen. Von Hand gewählte Spalten ohne
     Feld hält seit 6.9.26 schon der Knopf in Schritt 2 auf
     (c2LooseCols) — hier ist die Zeile nur noch das Netz für den
     automatischen Weg aus Schritt 1. */
  W.cols=c2Order();
  c2Meta();
  c2ScanBook();
  c2MeasureCols();
  c2LoadMapRules();
  c2ApplyRules();
  W.step=3;c2Render();
}

/* ── Automatisch zuordnen mit gemerkten Importkriterien — nach Wahl ──
   **Nichts wird von selbst zugeordnet** (5.9.26). Das Fenster zeigt,
   welche Posten aus den gemerkten Kriterien etwas bekämen —
   gegliedert wie der Zielbereich und wie die Jahresmatrix: Einnahmen,
   Flexible, Regelmäßige Kosten, in den Farben ihrer Geldart,
   die Posten je Kategorie —, jeder mit einem Kästchen, alle
   angekreuzt.

   **Unter jedem Posten stehen seine Zeilen** (6.9.26): eine kleine
   Tabelle mit den verknüpften FINA-Feldern (Datum, Betrag, die
   Referenzen), je Zeile ein Kästchen. Abwählen geht auf zwei Ebenen —
   der ganze Posten oder eine einzelne Zeile. Was einzeln abgewählt
   ist, merkt sich W.skip; c2ApplyRules übergeht diese Zeilen, sie
   bleiben frei. Das Kästchen des Postens folgt seinen Zeilen: keine
   gewählt heißt aus, ein Teil heißt „teilweise" (indeterminate).

   **Der Stift am Posten öffnet sein Fenster** — das gewohnte Posten-
   bzw. Kategorie-Fenster mit dem Block „Importkriterien"; mit
   offenem Wizard schreibt es in dessen Regeln (impCritCommitLive),
   und sobald es zugeht, rechnet dieses Fenster die Treffer neu und
   baut die Liste neu auf — die Änderung wirkt sofort, ohne dass man
   hier herausmuss. Abgewähltes bleibt dabei abgewählt (`off` hängt
   an Ziel und Zeilennummer, nicht an der Liste).

   „Anwenden" ordnet nur den angekreuzten zu; die übrigen Regeln
   bleiben in W.mapRules liegen — der Knopf bleibt für sie schwarz,
   und c2StoreRules() legt sie bei „Fertig" mit an den Posten ab,
   damit nichts verloren geht. „Abbrechen" tut nichts.

   Bis 30.8.26 lief die gemerkte Zuordnung ungefragt beim Weitergehen
   aus dem ersten Schritt, danach in einem Zug auf Knopfdruck; jetzt
   sieht man vorher, wen es trifft — bis auf die Zeile genau. */
/* Je Ziel die freien Zeilen, die seine gemerkten Regeln träfen — in
   der Reihenfolge der Regeln, die erste nimmt, wie beim Zuordnen
   selbst. **Nur Ziele mit Treffern** (6.9.26): ein Posten, dessen
   Kriterien in dieser Datei nichts finden, hat im Wahl-Fenster
   nichts zu suchen — bis dahin stand er mit „trifft keine Zeile" da,
   und bei zwanzig solchen Posten war das die ganze Liste. Gebraucht
   vom Wahl-Fenster (c2MapPick) und vom Knopf davor (c2Step3). */
/* ── Welche Zeilen schon im Buch stehen ───────────────────────
   (6.9.26) Für das Wahl-Fenster der gemerkten Kriterien: je Ziel
   die Zeilen der Datei, die ein früherer Import schon geschrieben
   hat. Erkannt werden sie an den **Quellzeilen** des Buches —
   it.impRows[m] beim regulären Posten, state.tx bei der flexiblen
   Kategorie —: derselbe Tag, derselbe Buchwert (c2BookVal), dieselben
   Referenzen. Ältere Importe haben keine Quellzeilen; dann zählt
   der Monat als Ganzes, wie beim Grau des Zielbereichs (changes in
   c2TopTable): abgehakt im Buch und dieselbe Summe wie die Zeilen
   hier — dann stehen sie alle schon drin.

   **Im Fenster stehen sie grau mit einem Kreuz** statt eines
   Kästchens: nichts zu entscheiden, sie lassen sich nicht noch
   einmal importieren. **Mitgehen müssen sie trotzdem** (apply in
   c2MapPick): „Anwenden" ersetzt einen Monat durch die Summe seiner
   zugeordneten Zeilen — blieben die alten draußen, verlöre ein
   Monat mit alten und neuen Zeilen seine alten. Für das Buch ist
   das Mitgehen folgenlos, der Wert bleibt derselbe; im Zielbereich
   stehen sie danach grau („ändert nichts"). */
function c2OldRows(tid,rows){
  const old=new Set();
  /* Zuerst das, was schon die Tabelle unten weiß (W.inBook,
     c2ScanBook): die Zeile steht als Quellzeile irgendwo im Buch. */
  rows.forEach(i=>{if(W.inBook&&W.inBook.has(i))old.add(i);});
  const it=tid.indexOf('i:')===0?findItem(tid.slice(2)):null;
  if(!it)return old;
  /* Ältere Importe ohne Quellzeilen: der Monat als Ganzes — abgehakt
     im Buch und dieselbe Summe wie die Zeilen hier. */
  const byM={};
  rows.forEach(i=>{const d=W.meta[i]&&W.meta[i].d;if(d)(byM[d.m]=byM[d.m]||[]).push(i);});
  Object.keys(byM).forEach(mk=>{
    const m=+mk,list=byM[mk];
    if(list.every(i=>old.has(i)))return;
    if(it.impRows&&it.impRows[m]&&it.impRows[m].length)return;
    if(!paidAt(it,m))return;
    const sum=list.reduce((s,i)=>s+c2BookVal(i,isIncome(it)),0);
    if(Math.round((sum-(it.amounts[m-1]||0))*100)===0)list.forEach(i=>old.add(i));
  });
  return old;
}

function c2MapHits(){
  const list=W.mapRules||[];
  const taken=W.asg.slice();
  const byT={},order=[];
  list.forEach((r,ri)=>{
    if(r.pick)return;
    const tid=r.t.tid;
    W.csv.rows.forEach((row,i)=>{
      if(taken[i]>=0||!W.meta[i].in)return;
      if(!c2Match(row,r.terms))return;
      taken[i]=1e6+ri;
      if(!byT[tid]){byT[tid]={t:r.t,rows:[],hasNew:false};order.push(tid);}
      byT[tid].rows.push(i);
      /* Schon im Buch stehende Zeilen (c2ScanBook) zählen als
         Treffer — das Wahl-Fenster zeigt sie grau neben den neuen —,
         aber nur eine **neue** Zeile macht den Posten zu einem, der
         etwas zu entscheiden hat (hasNew: der Knopf in der Leiste,
         die Liste im Fenster). */
      if(!W.inBook.has(i))byT[tid].hasNew=true;
    });
  });
  return order.map(tid=>byT[tid]);
}
function c2MapPick(){
  if(!(W.mapRules||[]).length)return;
  const ord=c2Order();
  const m=document.createElement('div');
  m.className='modal';
  document.body.appendChild(m);
  /* Abgewählt: Zeilen als „ziel|zeile", Posten ohne Zeilen als Ziel. */
  const off=new Set(),entOff=new Set();
  let ents=[];
  /* Nur Ziele mit Treffern (c2MapHits). Neu gerechnet nach jedem
     Fenster, das Kriterien ändert. */
  /* **Nur Posten mit wenigstens einer neuen Zeile** (6.9.26 abends):
     ein Posten, dessen Treffer alle schon im Buch stehen, hat hier
     nichts zu entscheiden und steht nicht in der Liste. Bei einem
     gemischten Posten stehen die alten Zeilen grau mit Kreuz neben
     den neuen. */
  const compute=()=>{
    ents=c2MapHits();
    ents.forEach(e=>{e.old=c2OldRows(e.t.tid,e.rows);});
    ents=ents.filter(e=>e.rows.some(i=>!e.old.has(i)));
  };
  /* Kategorie eines Ziels: aus dem Buch, bei einem noch nicht
     angelegten aus W.newT. */
  const groupOf=tid=>{
    if(tid.indexOf('i:')===0){const it=findItem(tid.slice(2));return it?it.group:'';}
    const nt=W.newT.find(x=>x.tid===tid);
    return nt&&nt.group?nt.group:'';
  };
  /* Neu ist, was nicht schon im Buch steht (e.old, c2OldRows);
     nur darüber wird entschieden. Ein Posten, dessen Zeilen alle
     schon drin sind, hat nichts zu wählen — sein Kästchen ist
     gesperrt, er steht grau. */
  const newRows=e=>e.rows.filter(i=>!e.old.has(i));
  const onRows=e=>newRows(e).filter(i=>!off.has(e.t.tid+'|'+i));
  const entChecked=e=>e.rows.length?(newRows(e).length>0&&onRows(e).length>0):!entOff.has(e.t.tid);
  const idOf=tid=>'c2mp_'+tid.replace(/[^a-z0-9]/gi,'_');
  const entHtml=e=>{
    const tid=e.t.tid,checked=entChecked(e);
    const canEdit=tid.indexOf('n:')!==0;
    const nn=newRows(e).length,no=e.old.size,stale=e.rows.length>0&&nn===0;
    const cnt=nn?(no?t('c2.mpNew',nn)+' · '+t('c2.mpOld',no):t('c2.mpRows',nn))
      :(no?t('c2.mpOld',no):t('c2.mpNone'));
    const tab=e.rows.length?`<table class="c2mptab"><thead><tr><th class="ck"></th>${ord.map(ci=>{
        const f=c2FieldOf(ci);
        return `<th class="${f==='amount'?'amt':(f==='date'?'dt':'')}">${esc(c2FieldLabel(f))}</th>`;}).join('')}</tr></thead>
      <tbody>${e.rows.map(i=>{
        const row=W.csv.rows[i],k=tid+'|'+i,isOld=e.old.has(i),on=!isOld&&!off.has(k);
        return `<tr class="${isOld?'old':(on?'':'off')}"><td class="ck">${isOld
          ?`<span class="c2mpold" title="${esc(t('c2.mpOldTip'))}">&#10005;</span>`
          :`<input type="checkbox" data-c2mpr="${esc(k)}"${on?' checked':''}>`}</td>${ord.map(ci=>{
          const v=row[ci]==null?'':row[ci],f=c2FieldOf(ci);
          return `<td class="${f==='amount'?'amt '+cls(W.meta[i].v):(f==='date'?'dt':'')}" title="${esc(v)}">${esc(v)}</td>`;}).join('')}</tr>`;}).join('')}</tbody></table>`:'';
    return `<div class="c2mpent${checked?'':' off'}${stale?' stale':''}" data-c2mpe="${esc(tid)}">
      <div class="c2mprow"><input type="checkbox" id="${idOf(tid)}" data-c2mp="${esc(tid)}"${checked?' checked':''}${stale?' disabled':''}>
        ${canEdit?`<button type="button" class="pencil" data-c2mped="${esc(tid)}" title="${esc(t('c2.mpEditTip'))}">&#9998;</button>`:'<span class="pencil ph"></span>'}
        <label for="${idOf(tid)}" class="n">${esc(e.t.name)}${tid.indexOf('n:')===0?`<i class="c2newtag">${t('c2.newTag')}</i>`:''}</label>
        <span class="c${(nn||!e.rows.length)?'':' none'}">${cnt}</span></div>
      ${tab}</div>`;
  };
  const draw=()=>{
    const was=m.querySelector('.dbody'),st=was?was.scrollTop:0;
    let body='';
    /* Alle drei Blöcke nach Kategorie (seit 6.9.26 auch der
       flexible), wie Zielbereich und Jahresmatrix. */
    [[t('c2.blkIn'),'g-in',ents.filter(e=>!e.t.flex&&e.t.income)],
     [t('c2.blkFlex'),'g-flex',ents.filter(e=>e.t.flex)],
     [t('c2.blkOut'),'g-out',ents.filter(e=>!e.t.flex&&!e.t.income)]].forEach(bl=>{
      if(!bl[2].length)return;
      body+=`<div class="c2mpgrp ${bl[1]}"><p class="c2mph">${esc(bl[0])}</p>`;
      const cats=[];
      bl[2].forEach(e=>{const g=groupOf(e.t.tid);if(!cats.includes(g))cats.push(g);});
      cats.forEach(g=>{
        const sub=bl[2].filter(e=>groupOf(e.t.tid)===g);
        body+=`<p class="c2mpcat">${esc(g?keyLabel(g):'—')}</p>`;
        body+=sub.map(entHtml).join('');
      });
      body+='</div>';
    });
    if(!body)body=`<p class="note">${esc(t('c2.mpGone'))}</p>`;
    m.innerHTML=`<div class="box split c2mpbox">
      <h3>${t('c2.mpTitle')}</h3>
      <ul class="c2mphow">
        <li>${t('c2.mpHow1')}</li>
        <li>${t('c2.mpHow2')}</li>
        <li>${t('c2.mpHowOld')}</li>
        <li>${t('c2.mpHow3',t('c2.apply'))}</li>
        <li>${t('c2.mpHow4',t('g.cancel'))}</li>
      </ul>
      <div class="dbody c2mplist">${body}</div>
      <div class="row-end c2mpend">
        <button class="btn small" id="c2mpAll">${t('c2.selAll')}</button>
        <button class="btn small" id="c2mpNone">${t('c2.selNone')}</button>
        <span class="c2spacer"></span>
        <button class="btn" id="c2mpCancel">${t('g.cancel')}</button>
        <button class="btn primary" id="c2mpOk"${ents.length?'':' disabled'}>${t('c2.apply')}</button></div></div>`;
    wire();
    tabThroughFields(m);
    const now=m.querySelector('.dbody');
    if(now)now.scrollTop=st;
  };
  /* Das Kästchen des Postens nach seinen Zeilen richten — und die
     Zeilen nach dem Kästchen; neu gezeichnet wird dabei nichts, die
     Liste kann lang sein. */
  const syncEnt=tid=>{
    const e=ents.find(x=>x.t.tid===tid);
    const root=m.querySelector(`[data-c2mpe="${CSS.escape(tid)}"]`);
    if(!e||!root)return;
    const cb=root.querySelector('[data-c2mp]');
    const on=onRows(e).length,nn=newRows(e).length;
    cb.checked=entChecked(e);
    cb.indeterminate=nn>0&&on>0&&on<nn;
    root.classList.toggle('off',!cb.checked);
    root.querySelectorAll('[data-c2mpr]').forEach(r=>{
      r.checked=!off.has(r.dataset.c2mpr);
      r.closest('tr').classList.toggle('off',!r.checked);
    });
  };
  const close=()=>m.remove();
  /* Der Stift: das Fenster des Postens über diesem — und sobald es
     zugeht, Treffer und Liste neu (siehe oben). Der Zielbereich des
     Wizards dahinter zeichnet sich mit, denn c2ApplyRules hat
     inzwischen anders zugeordnet. */
  const openDetail=tid=>{
    const before=new Set(document.querySelectorAll('.modal'));
    if(tid.indexOf('i:')===0){const it=findItem(tid.slice(2));if(it)editItem(it);}
    const fresh=[...document.querySelectorAll('.modal')].find(x=>!before.has(x));
    if(!fresh)return;
    const obs=new MutationObserver(()=>{
      if(fresh.isConnected)return;
      obs.disconnect();
      if(!m.isConnected)return;
      compute();draw();
      if(W&&W.modal&&W.modal.isConnected)c2Render();
    });
    obs.observe(document.body,{childList:true});
  };
  const apply=()=>{
    const list=W.mapRules||[];
    const chosen=new Set();
    ents.forEach(e=>{
      const tid=e.t.tid,on=entChecked(e);
      /* Schon im Buch stehende Zeilen gehen immer mit (siehe
         c2OldRows) — auch bei einem abgewählten Posten: dann nur
         sie, und der Monat bleibt, wie er ist. Abgewählte neue
         Zeilen bleiben frei (W.skip). */
      if(!on&&!e.old.size)return;
      chosen.add(tid);
      newRows(e).forEach(i=>{if(!on||off.has(tid+'|'+i))W.skip[tid+'|'+i]=1;});
    });
    close();
    if(!chosen.size)return;
    const from=W.rules.length;
    W.rules=W.rules.concat(list.filter(r=>chosen.has(r.t.tid)));
    W.mapRules=list.filter(r=>!chosen.has(r.t.tid));
    if(!W.mapRules.length){W.mapRules=null;W.autoDone=true;}
    c2ApplyRules();c2Render();
    const nc=c2NewCount(from);
    c2AutoDone(nc.targets,nc.rows,t('c2.kTitle'));
  };
  const wire=()=>{
    m.querySelectorAll('[data-c2mp]').forEach(cb=>{cb.onchange=()=>{
      const tid=cb.dataset.c2mp,e=ents.find(x=>x.t.tid===tid);
      if(!e)return;
      if(cb.checked){entOff.delete(tid);newRows(e).forEach(i=>off.delete(tid+'|'+i));}
      else{entOff.add(tid);newRows(e).forEach(i=>off.add(tid+'|'+i));}
      syncEnt(tid);
    };});
    m.querySelectorAll('[data-c2mpr]').forEach(cb=>{cb.onchange=()=>{
      const k=cb.dataset.c2mpr,tid=k.slice(0,k.lastIndexOf('|'));
      if(cb.checked)off.delete(k); else off.add(k);
      syncEnt(tid);
    };});
    m.querySelectorAll('[data-c2mped]').forEach(b=>{b.onclick=e=>{
      e.preventDefault();e.stopPropagation();openDetail(b.dataset.c2mped);
    };});
    m.querySelector('#c2mpAll').onclick=()=>{off.clear();entOff.clear();draw();};
    m.querySelector('#c2mpNone').onclick=()=>{
      ents.forEach(e=>{entOff.add(e.t.tid);e.rows.forEach(i=>off.add(e.t.tid+'|'+i));});
      draw();
    };
    m.querySelector('#c2mpCancel').onclick=close;
    m.querySelector('#c2mpOk').onclick=apply;
  };
  m._close=close;          /* auch für Escape (js/ui.js) */
  compute();draw();
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

/* ── Gewählte Spalten ohne Feld (6.9.26) ───────────────────────
   Das Gegenstück zu c2Missing: dort fehlt ein Feld, hier ist eine
   Spalte zu viel. Bis 6.9.26 fiel sie auf dem Weg nach Schritt 3
   still weg — man hatte sie orange gewählt und fand sie in der
   Dateitabelle nicht wieder, ohne zu erfahren, warum.

   Das Fenster nennt die Spalten beim Namen und bietet an, sie
   abzuwählen. **Abwählen bleibt im Schritt**: man soll sehen, was
   übrig ist, und dann erst über denselben Knopf weitergehen — ein
   Fenster, das abwählt und zugleich den Schritt wechselt, nähme
   die Prüfung vorweg, wegen der es aufging. **Abbrechen lässt alles
   stehen**: wer die Spalte doch braucht, gibt ihr ein Feld; wer
   eine andere weglassen will, wählt selbst. Die Felder bleiben
   beim Abwählen unberührt — die Spalten hatten ja keins. */
function c2LooseCols(loose){
  const hd=W.csv.header||[];
  const name=i=>hd[i]!=null&&hd[i]!==''?hd[i]:t('c2.colN',i+1);
  const m=document.createElement('div');
  m.className='modal';
  m.innerHTML=`<div class="box narrow">
    <h3>${t('c2.looseTitle')}</h3>
    <p class="subline">${t('c2.looseSub')}</p>
    <ul class="c2misslist">${loose.map(i=>`<li><b>${esc(name(i))}</b></li>`).join('')}</ul>
    <div class="row-end"><button class="btn" id="c2LooseCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="c2LooseOk">${t('c2.looseBtn')}</button></div></div>`;
  document.body.appendChild(m);
  tabThroughFields(m);
  const close=()=>m.remove();
  m._close=close;
  m.querySelector('#c2LooseCancel').onclick=close;
  m.querySelector('#c2LooseOk').onclick=()=>{
    close();
    W.cols=W.cols.filter(i=>!loose.includes(i));
    c2Render();
    toast(t('c2.looseDone',loose.length));
  };
  m.querySelector('#c2LooseOk').focus();
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
/* **Eine zweite Struktur für dieselbe Datei-Art** (6.9.26): kennt
   FINA die Datei-Art schon, steht unter dem Namen ein Haken „die
   bisherige behalten und diese dazu merken". Ohne ihn ersetzt
   Speichern die gewählte Struktur (c2MapKey); mit ihm kommt die
   neue unter den nächsten freien Schlüssel (c2NextMapKey), und
   Schritt 1 bietet beim nächsten Mal beide zur Wahl. */
function c2AskMapName(done){
  const fp=W.csv.fp,curKey=c2MapKey(),ex=curKey?state.csvMaps[curKey]:null;
  const m=document.createElement('div');
  m.className='modal';
  m.innerHTML=`<div class="box narrow c2new">
    <h3>${t('c2.mapNameTitle')}</h3>
    <p class="subline">${t('c2.mapNameSub')}</p>
    <div class="dgrp"><div class="field"><label for="c2mName">${t('set.csvMapName')}</label>
      <input type="text" id="c2mName" value="${esc(W.mapName||(ex&&ex.file)||W.csv.name)}"></div>
      ${ex?`<label class="c2mkeep"><input type="checkbox" id="c2mKeep"><span>${t('c2.mapNameKeep',esc(ex.file||'—'))}</span></label>`:''}</div>
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
    const keep=!!(ex&&m.querySelector('#c2mKeep').checked);
    const key=keep?c2NextMapKey(fp):(curKey||fp);
    const q=name.toLowerCase();
    const clash=Object.keys(state.csvMaps||{}).find(k=>k!==key&&String((state.csvMaps[k]||{}).file||'').trim().toLowerCase()===q);
    if(clash){warn(t('c2.mapNameTaken',name));nm.focus();nm.select();return;}
    c2SaveCols(name,key);
    close();
    toast(t('c2.mapSaved',name));
    done();
  };
  m.querySelector('#c2mCancel').onclick=close;
  m.querySelector('#c2mOk').onclick=ok;
  nm.onkeydown=e=>{if(e.key==='Enter')ok();};
}
/* Spalten und Felder unter dem Namen ablegen — der Eintrag wird
   ganz ersetzt; Regeln stehen nicht darin, sie wohnen an den Posten
   (c2StoreRules). Das Datum ist das des Merkens. */
function c2SaveCols(name,key){
  const d=new Date();
  key=key||c2MapKey()||W.csv.fp;
  W.mapName=name;W.mapKey=key;
  /* **Nur die Struktur** (5.9.26): Name, Feldverknüpfung, die
     Spaltenköpfe (für die Anzeige in den Einstellungen). Keine Art
     mehr (6.9.26, Struktur v260906) und keine Regeln — die wohnen
     an den Posten (c2StoreRules). */
  state.csvMaps[key]={
    date:d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear(),
    file:name,f:Object.assign({},W.f),header:W.csv.header.slice()};
  save();
}

/* ══ Eine gemerkte CSV-Struktur ändern (5.9.26 spät) ═══════════
   Hinter dem Stift in den Einstellungen (Import → Gemerkte
   CSV-Strukturen) **und seit 6.9.26 hinter dem Stift im ersten
   Schritt des Imports** — dasselbe Fenster an beiden Stellen. Oben
   der Name (seit 6.9.26 hier änderbar, nicht nur in den
   Einstellungen), darunter links die FINA-Felder — Datum, Betrag,
   Referenz 1 bis 5 —, rechts je ein Auswahlmenü mit den Spalten der
   Datei (aus `header`, sonst „Spalte n"). Es ist dasselbe, was
   Schritt 2 des Imports festlegt, nur ohne die Datei — deshalb
   dieselben Regeln: ein Feld wohnt in einer Spalte (wer eine belegte
   Spalte wählt, nimmt sie dem anderen Feld), ohne Datum und Betrag
   wird nicht gespeichert, und ein Name, den eine andere Struktur
   schon trägt, auch nicht. Gearbeitet wird auf einer Kopie, ins
   Buch kommt erst „Speichern" (dirty; die Datei bekommt es mit
   „Daten speichern"); `header` und der Schlüssel bleiben, wie sie
   sind — sie sind die Datei-Art selbst. `done` ist der Rückweg
   (reopen der Einstellungen, c2Render im Wizard), damit die Zeile
   dort den neuen Namen zeigt. Eine Art gibt es seit 6.9.26 nicht
   mehr; ein altes `kind` fällt beim Speichern weg.

   **Drei Blöcke und ein roter Knopf** (6.9.26 spät): der Name
   allein, dann Datum und Betrag — die beiden Pflichtfelder —, dann
   die fünf Referenzen; so sieht man, was fehlen darf und was nicht.
   Unten links in der Fußzeile, bündig mit den Blöcken, steht „Diese
   Struktur aus FINA löschen" in Rot wie die Löschknöpfe der
   Importdaten (.delbtn); Abbrechen und Speichern bleiben rechts — der ✕ an der Zeile in den Einstellungen ist damit
   weg, die Zeile selbst ist der Weg hierher. Gelöscht wird nach
   Rückfrage, sofort im Buch (dirty), und `done` räumt die Zeile
   weg; im Wizard verliert eine gelöschte Struktur zugleich ihre
   Wahl (W.mapKey) und das, was aus ihr übernommen war. */
function openCsvStructure(key,done){
  const m=state.csvMaps[key];
  if(!m){ if(done)done(); return; }
  const hd=m.header||[];
  const f=Object.assign(c2BlankF(),m.f||{});
  let name=m.file||'';
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
  const sel=k=>`<label for="cs_${k}">${esc(c2FieldLabel(k))}</label>
        <select id="cs_${k}" data-csf="${k}">${opts(k)}</select>`;
  const draw=()=>{
    box.innerHTML=`<div class="box narrow csbox">
      <h3>${esc(t('cs.title'))}</h3>
      <p class="subline">${esc(t('set.csvMapMeta',m.date||'—'))}</p>
      <div class="dgrp csgrid">
        <label for="csName">${esc(t('set.csvMapName'))}</label>
        <input type="text" id="csName" value="${esc(name)}">
      </div>
      <div class="dgrp csgrid">${['date','amount'].map(sel).join('')}</div>
      <div class="dgrp csgrid">${C2_REFS.map(sel).join('')}</div>
      <p class="errline" id="csErr" hidden></p>
      <div class="row-end"><button class="btn delbtn" id="csDel">${esc(t('cs.del'))}</button>
        <button class="btn" id="csCancel">${esc(t('g.cancel'))}</button>
        <button class="btn primary" id="csSave">${esc(t('g.save'))}</button></div></div>`;
    box.querySelector('#csDel').onclick=()=>{
      const nm=m.file||key;
      if(!confirm(t('set.csvMapDelAsk',nm)))return;
      delete state.csvMaps[key];
      if(typeof W!=='undefined'&&W&&W.mapKey===key){W.mapKey='';W.autoCols=false;}
      save();
      close();
      toast(t('c2.mapForgot',nm));
    };
    box.querySelector('#csName').oninput=e=>{ name=e.target.value; };
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
      const err=box.querySelector('#csErr');
      const nm=String(name||'').trim();
      const fail=msg=>{ err.textContent=msg; err.hidden=false; };
      if(!nm){ fail(t('c2.mapNameEmpty')); box.querySelector('#csName').focus(); return; }
      const q=nm.toLowerCase();
      const clash=Object.keys(state.csvMaps||{}).find(k=>k!==key&&String((state.csvMaps[k]||{}).file||'').trim().toLowerCase()===q);
      if(clash){ fail(t('c2.mapNameTaken',nm)); box.querySelector('#csName').focus(); return; }
      if(f.date<0||f.amount<0){ fail(t('cs.need')); return; }
      m.f=Object.assign({},f);
      m.file=nm;
      delete m.kind;
      save();
      close();
      toast(t('cs.saved'));
    };
    box.querySelector('#csName').onkeydown=e=>{ if(e.key==='Enter')box.querySelector('#csSave').click(); };
    tabThroughFields(box);
  };
  box._close=close;          /* auch für Escape (js/ui.js) */
  draw();
}

/* Die Anleitung neben dem Schritt (C2_GUIDE oben). Sie trägt
   `.guide`, damit Absätze und Überschriften aussehen wie im Guide
   der Anwendung — und seit dem 7.9.26 auch dessen Kopf: die
   Sprachwahl EN · DE (nur für die Anleitung, die Oberfläche bleibt,
   wie sie ist), der Pfeil in einen eigenen Reiter des Browsers und
   das ✕. Links der Griff, mit dem sich die Breite ziehen lässt
   (c2GuideHandle); mindestens ein Drittel des Fensters. Der Kopf
   steht fest, nur der Rumpf (.c2gbody) rollt. */
function c2GuidePanel(){
  const g=C2_GUIDE[W.step];
  if(!g)return '';
  const lang=W.gLang==='de'?'de':'en';
  const langs=LANGS.map(([k])=>`<button class="glang" data-c2="glang" data-l="${k}"
      aria-pressed="${k===lang}">${k.toUpperCase()}</button>`).join('');
  /* Ohne gezogene Breite genau ein Drittel des Fensters — als Maß
     in px, denn ein Prozentwert bezöge sich auf die Fläche im
     Fenster, und die ist um das Polster schmaler. */
  const w=` style="flex-basis:${W.guideW||Math.round(window.innerWidth/3)}px"`;
  /* Herein fährt sie nur, wenn sie gerade geöffnet wurde (W.guideAnim,
     gesetzt am Knopf) — nicht bei jedem Neuzeichnen des Schritts. */
  const anim=W.guideAnim?' slidein':''; W.guideAnim=false;
  return `<aside class="c2gpanel guide${anim}"${w}>
    <div class="ghandle" data-c2="ghandle" role="separator" aria-orientation="vertical" tabindex="0"
      title="${esc(t('app.guideDrag'))}" aria-label="${esc(t('app.guideDrag'))}"></div>
    <div class="c2ghead"><b>${esc(t('app.guide'))}</b>
      <span class="gact">
        <span class="glangs" role="group" aria-label="${esc(t('guide.lang'))}"
          data-tip="${esc(t('guide.lang'))}">${langs}</span>
        <button class="btn small gfull" data-c2="gfull" aria-label="${esc(t('guide.full'))}"
          data-tip="${esc(t('guide.fullTip'))}">${EXPAND_SVG}</button>
        <button class="btn c2gx" data-c2="guide" title="${esc(t('c2.guideOff'))}">✕</button>
      </span></div>
    <div class="c2gbody">${g[lang]}</div></aside>`;
}

/* Die Anleitung geht zu: c2Render() baut das Fenster neu, und das
   Feld ist dann schon weg. Ein Geist an seiner Stelle fährt nach
   rechts hinaus (fina-impout) — in einem Rahmen mit overflow:hidden,
   damit er an der Kante des Fensters verschwindet statt darüber
   hinaus. Dieselbe Regel wie überall (CLAUDE.md „Bewegung"). */
function c2GuideGhost(){
  const p=W&&W.box&&W.box.querySelector('.c2gpanel'); if(!p)return;
  const r=p.getBoundingClientRect();
  const wrap=document.createElement('div'); wrap.className='c2gghostwrap';
  wrap.style.cssText=`top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px`;
  const g=ghostOf(p,'c2gpanel guide c2gghost');
  g.style.cssText='position:absolute;inset:0;margin:0';
  wrap.appendChild(g);
  document.body.appendChild(wrap);
  const done=()=>wrap.remove();
  g.addEventListener('animationend',done); setTimeout(done,700);
}
/* Die Breite der Anleitung: mindestens ein Drittel des Fensters
   (Lex, 7.9.26), höchstens zwei Drittel des Wizard-Fensters — der
   Schritt daneben soll bedienbar bleiben. Gesetzt wird am Element,
   nicht per Neuaufbau: beim Ziehen kämen sonst dreißig Neuaufbauten
   je Sekunde. */
function c2GuideWidth(w){
  const panel=W&&W.box&&W.box.querySelector('.c2gpanel'); if(!panel)return;
  const min=Math.round(window.innerWidth/3);
  const max=Math.max(min,Math.round(W.box.clientWidth*0.66));
  W.guideW=Math.min(Math.max(Math.round(w),min),max);
  panel.style.flexBasis=W.guideW+'px';
  c2FitBar();
}
/* Der Griff: ziehen mit der Maus, Pfeiltasten in Schritten —
   dieselbe Mechanik wie bindGuideHandle in js/dialogs/guide.js.
   Gemessen wird von der rechten Kante der Anleitung aus. */
function c2GuideHandle(h){
  if(!h)return;
  const panel=h.parentElement;
  const move=e=>c2GuideWidth(panel.getBoundingClientRect().right-e.clientX);
  const up=()=>{
    document.body.classList.remove('gresize');
    removeEventListener('pointermove',move);removeEventListener('pointerup',up);
  };
  h.addEventListener('pointerdown',e=>{
    e.preventDefault();
    document.body.classList.add('gresize');
    addEventListener('pointermove',move);addEventListener('pointerup',up);
  });
  h.addEventListener('keydown',e=>{
    const step=e.shiftKey?80:24,cur=panel.getBoundingClientRect().width;
    if(e.key==='ArrowLeft'){c2GuideWidth(cur+step);e.preventDefault();}
    else if(e.key==='ArrowRight'){c2GuideWidth(cur-step);e.preventDefault();}
  });
}
/* Wird das Fenster kleiner oder größer, gilt das Drittel neu. */
addEventListener('resize',()=>{
  if(!W||!W.modal||!W.modal.isConnected)return;
  if(W.guide&&W.guideW)c2GuideWidth(W.guideW);
  c2FitBar();
});

/* Die Anleitung des Wizards über die ganze Seite — derselbe Weg
   wie guideDoc() in js/dialogs/guide.js: eine vollständige Seite in
   einen neuen Reiter, mit <base> auf die Anwendung, damit die
   Stylesheets gefunden werden; beide Schritte hintereinander, oben
   die klebende Zeile mit den Sprungmarken, kein Skript. Gebaut in
   der Sprache der Anleitung (W.gLang) — t() liest state.lang,
   deshalb steht die für die Dauer des Aufbaus darauf. */
function c2GuideDoc(){
  const was=state.lang; state.lang=W.gLang;
  try{
    const title=`FINA Book — ${t('app.guide')} — ${t('c2.title')}`;
    const steps=[[2,'c2.steps2'],[3,'c2.steps3']];
    const nav=steps.map(([n,k])=>`<a href="#g-${n}">${n} ${esc(t(k))}</a>`).join('');
    const parts=steps.map(([n,k])=>
      `<section id="g-${n}"><h2>${t('c2.title')} — ${n} ${esc(t(k))}</h2>${C2_GUIDE[n][W.gLang]}</section>`).join('');
    return `<!DOCTYPE html>
<html lang="${W.gLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${esc(location.href)}">
<title>${esc(title)}</title>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
<link rel="icon" href="icon.png" sizes="any">
</head>
<body id="g-top">
<main class="guide gpage">
  <h1>${esc(title)}</h1>
  <nav class="gnav">${nav}</nav>
  ${parts}
</main>
<a class="gtop" href="#g-top" aria-label="${esc(t('guide.top'))}" title="${esc(t('guide.top'))}">&#8593;</a>
</body>
</html>`;
  }finally{state.lang=was;}
}

/* ── Neues Ziel — das gewöhnliche Eintragsfenster: EINE
   Kategorienliste, die Kategorie entscheidet die Geldart. ── */
/* `done` läuft, nachdem das Ziel angelegt und gewählt ist — der
   Weg „Neu anlegen und zuordnen": erst der Posten, dann geht das,
   was gerade markiert oder gefiltert ist, an ihn. Ohne `done` ist
   es das gewohnte „+ Neu…". */
/* **Ein Fenster für beide Arten** (6.9.26; bis dahin c2NewFlex für
   die flexible Kategorie): in der Kategorienliste steht als dritte
   Gruppe „Flexible" mit dem einen Eintrag „neue flexible
   Kategorie" (C2_NEWFLEX). Wer ihn wählt, legt eine Kategorie an —
   Bank, Zahlungsart und Fälligkeit sind dann gesperrt, eine
   Kategorie hat sie nicht. Der Wert ist ein Tabulator plus Wort:
   in einem Kategorienamen kommt kein Tabulator vor. */
const C2_NEWFLEX='\tflex';
function c2NewTarget(done){
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
  /* Die flexiblen Kategorien stehen als eigene Gruppe in derselben
     Liste (seit 6.9.26; vorher ein einzelner Eintrag „Neue flexible
     Kategorie"): ihr Wert trägt den Vermerk C2_NEWFLEX vorn, damit
     ein Name, der zufällig auch eine reguläre Kategorie ist, nicht
     die Geldart wechselt. In der Reihenfolge der Bereiche. */
  const optF=list=>list.map(g=>`<option value="${esc(C2_NEWFLEX+':'+g)}">${esc(keyLabel(g))}</option>`).join('');
  const groupSel=()=>{
    const inc=incomeGroups(),out=(state.groups||[]),fl=flexGroups();
    return `<option value="">${t('item.blockPick')}</option>
      ${inc.length?`<optgroup label="${t('c2.blkIn')}">${opt(inc)}</optgroup>`:''}
      ${fl.length?`<optgroup label="${t('c2.blkFlex')}">${optF(fl)}</optgroup>`:''}
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
    <h3>${t('c2.newT')}</h3>
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
  /* Ein flexibler Posten hat seit 6.9.26 abends dieselben Felder wie
     jeder andere — Bank, Zahlungsart und Fälligkeit bleiben offen. */
  const gSel=m.querySelector('#c2nGroup');
  const syncFlex=()=>{};
  gSel.onchange=syncFlex;

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
    syncFlex();
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
    if(group.indexOf(C2_NEWFLEX)===0){
      const fg=group.slice(C2_NEWFLEX.length+1);
      W.newT.push({tid:'n:'+name,name:name,income:false,flex:true,group:flexGroups().includes(fg)?fg:NOCAT_FLEX,
        bank:m.querySelector('#c2nBank').value,pay:m.querySelector('#c2nPay').value,
        due:m.querySelector('#c2nDue').value||''});
    }else
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
    const doneAt=m=>raw?!!paidAt(raw,m):false;
    const bookAt=m=>raw?(raw.amounts[m-1]||0):0;
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
  /* **Ein Weg für alle Ziele** (6.9.26 abends): ein flexibler Posten
     ist ein Posten — Betrag, Pfeil und Quellzeilen je Monat, wie bei
     Einnahmen und Kosten. Was ihn unterscheidet, steht daneben: die
     Quelle des Monats (flexSource, das Etikett am Kartenkopf), und
     der Reiter „Import Details" liest die Quellzeilen der flexiblen
     Posten (flexTx in js/calc.js).

     **Ergänzen statt ersetzen**, wo der Monat schon Quellzeilen hat:
     schon importierte Zeilen werden nie wieder zugeordnet (W.inBook,
     c2ScanBook), hier kommen also nur neue an — sie treten zu den
     alten, der Betrag wächst um sie. Ohne Quellzeilen (ältere
     Importe, von Hand eingetragene Werte) ersetzt der Import den
     Monat, wie bisher. */
  let nItems=0,nMonths=0,nFlexRows=0;
  const flexMonths=new Set();
  const hadTx=flexTx().length>0;
  B.order.forEach(tid=>{
    const b=B.by[tid];
    let it=null;
    if(tid.indexOf('i:')===0){
      const id=tid.slice(2);
      it=state.fixed.find(x=>String(x.id)===id)||state.fixed.find(x=>x.name===b.t.name);
    }else{
      /* Sicherheitsgurt gegen Zwillinge: heißt ein „neues" Ziel wie
         ein vorhandener Posten, ist es dieser Posten. */
      it=state.fixed.find(x=>x.name===b.t.name);
    }
    if(!it){
      const nt=W.newT.find(x=>x.tid===tid)||b.t;
      it=normalize({id:uid(),name:b.t.name,group:nt.group||(nt.flex?NOCAT_FLEX:''),amounts:Array(12).fill(0)});
      it.bank=nt.bank||'';it.pay=nt.pay||'';it.dueDay=nt.due||'';
      state.fixed.push(it);
    }
    nItems++;
    for(let m=1;m<=12;m++){
      if(!b.cnt[m])continue;
      const rows=b.rows.filter(i=>W.meta[i].d.m===m).map(i=>{
        const row=W.csv.rows[i],d=W.meta[i].d;
        return {d:String(d.d).padStart(2,'0')+'.'+String(d.m).padStart(2,'0')+'.'+String(d.y%100).padStart(2,'0'),
          v:c2BookVal(i,b.t.income),r:c2Refs(row)};
      });
      /* **1 gemerkt, 2 einmalig** (siehe impOnceAt in js/calc.js):
         einmalig ist der Monat, sobald **eine** seiner Zeilen aus
         einer nicht gemerkten Regel kam. */
      const once=b.rows.some(i=>W.meta[i].d.m===m&&(W.rules[W.asg[i]]||{}).once);
      const had=(it.imp&&it.imp[m-1]&&it.impRows&&it.impRows[m]&&it.impRows[m].length)?it.impRows[m]:null;
      it.impRows=it.impRows||{};
      if(had){
        it.amounts[m-1]=Math.round(((it.amounts[m-1]||0)+b.months[m])*100)/100;
        it.impRows[m]=had.concat(rows);
        it.imp[m-1]=(once||it.imp[m-1]===2)?2:1;
      }else{
        it.amounts[m-1]=b.months[m];
        it.impRows[m]=rows;
        it.imp[m-1]=once?2:1;
      }
      it.paid[m-1]=true;
      nMonths++;
      if(isFlex(it)){flexMonths.add(m);nFlexRows+=rows.length;}
    }
  });
  flexMonths.forEach(m=>{state.flexSource[m]=W.csv.name;});
  if(flexMonths.size){
    state.lastImport=new Date().toLocaleString('de-DE');
  }
  const msg=[t('c2.doneReg',nItems,nMonths)];
  if(nFlexRows) msg.push(t('c2.doneFlex',nFlexRows,flexMonths.size));
  c2StoreRules();
  save();c2Close();render();
  toast(msg.join(' '));
}

/* ── Die Kriterien am Posten ablegen ──────────────────────────
   (5.9.26; bis dahin c2Remember, das die Regeln je Datei-Art in
   state.csvMaps schrieb.) Jeder Posten und jede flexible Kategorie
   bekommt als Importkriterien genau die Regeln, die im Wizard auf
   ihn zeigen — aus W.rules (angewendet) und W.mapRules (gemerkt,
   aber in diesem Lauf nicht angewendet: sie sollen nicht verloren
   gehen, nur weil man sie diesmal nicht gebraucht hat). Ein Posten,
   auf den keine mehr zeigt, verliert seine: wer eine Zuordnung im
   Wizard zurücksetzt, meint das so. Seit 6.9.26 stehen beide Arten
   im Wizard, also werden auch beide geschrieben.

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
  const seen=new Set();
  W.rules.concat(W.mapRules||[]).forEach(r=>{
    if(!r||r.once||r.pick||!r.t||!r.t.tid)return;
    const terms=c2CleanTerms((r.terms||[]).filter(tm=>tm.f!=='q'));
    if(!terms.length)return;
    /* Dieselbe Regel nur einmal je Ziel — sie kann zweimal hier
       ankommen: aus dem Angebot der gemerkten (W.mapRules) und,
       über „Suchen nach gemerkten Kriterien" und „Zuordnen und
       merken", noch einmal aus W.rules. */
    const key=c2RuleKey({t:r.t,terms:terms});
    if(seen.has(key))return;
    seen.add(key);
    (by[r.t.tid]=by[r.t.tid]||[]).push({terms:terms});
  });
  Object.keys(by).forEach(tid=>{
    if(tid.indexOf('n:')!==0)return;
    const nm=tid.slice(2),flex=c2IsFlex(tid);
    let x=c2BookByName(nm,flex);
    if(!x){
      const nt=W.newT.find(y=>y.tid===tid);
      if(nt&&(nt.group||nt.flex)){
        const it=normalize({id:uid(),name:nm,group:nt.group||NOCAT_FLEX,amounts:Array(12).fill(0)});
        it.bank=nt.bank||'';it.pay=nt.pay||'';it.dueDay=nt.due||'';
        state.fixed.push(it);
      }
      x=c2BookByName(nm,flex);
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
  state.fixed.forEach(it=>put(it,'i:'+it.id));
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
     Flexible —, damit man einen Posten dort findet, wo man
     ihn im Import sieht. Die Regel-Blöcke bleiben eine flache Liste
     (`groups`, daran hängen die Kennungen gi.ri.ti); die Gliederung
     ist nur Überschrift. Die Bedingungen nennen FINA-Felder, nie
     Spalten — sie gelten für jede Datei-Art. */
  const all=kind==='all';
  const rulesOf=e=>(e.impRules||[]).map(r=>({terms:c2CleanTerms(r&&r.terms)})).filter(r=>r.terms.length);
  const mk=hosts=>hosts.map(h=>({name:h.name,e:h.e,cat:h.cat||'',rules:rulesOf(h.e)})).filter(g=>g.rules.length);
  const regs=(all||kind==='reg')?(state.fixed||[]).filter(it=>!isFlex(it)).map(it=>({name:it.name,e:it,income:isIncome(it),cat:it.group||''})):[];
  const flex=(all||kind==='flex')?flexItems().map(it=>({name:it.name,e:it,cat:it.group||''})):[];
  /* Reihenfolge wie Jahresmatrix und Wahl-Fenster (6.9.26):
     Einnahmen · Flexible · Regelmäßige Kosten. */
  const sections=[
    {cls:'g-in',label:t('c2.blkIn'),groups:mk(regs.filter(h=>h.income))},
    {cls:'g-flex',label:t('c2.blkFlex'),groups:mk(flex)},
    {cls:'g-out',label:t('c2.blkOut'),groups:mk(regs.filter(h=>!h.income))}].filter(s=>s.groups.length);
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
    /* **Dasselbe Bild wie das Wahl-Fenster der gemerkten Kriterien**
       (6.9.26, c2MapPick): je Geldart ein Block in seiner Farbe
       (.c2mpgrp), darin die Kategorien als Zwischenzeilen (.c2mpcat),
       je Posten eine Zeile mit Name und Zahl seiner Regeln
       (.c2mprow) — und darunter, wo dort die Zeilen der Datei
       stehen, je Regel ein weißer Kasten mit ihren Bedingungen,
       „+ Bedingung" links und „Diese Regel löschen" rechts. Bis
       dahin: ein schmales Fenster, je Regel ein Block mit dem Posten
       als Überschrift darin. Block- und Kategoriezeile kleben beim
       Rollen (css/components.css). */
    const rule=(gi,r,ri)=>`<div class="cmerule">
      ${r.terms.map((tm,ti)=>termRow(gi,ri,ti,tm)).join('')}
      <div class="icbar"><button type="button" class="btn small" data-cmadd="${gi}.${ri}">${esc(t('cme.addTerm'))}</button>
        <button type="button" class="btn small icdel" data-cmrule="${gi}.${ri}">${esc(t('cme.delRule'))}</button></div>
    </div>`;
    const ent=(g,gi)=>`<div class="c2mpent cmeent">
      <div class="c2mprow"><span class="n">${esc(g.name)}</span><span class="c">${esc(t('cme.rules',g.rules.length))}</span></div>
      ${g.rules.map((r,ri)=>rule(gi,r,ri)).join('')}</div>`;
    sections.forEach(s=>{
      const live=s.groups.filter(g=>g.rules.length);
      if(!live.length)return;
      body+=`<div class="c2mpgrp ${s.cls}"><p class="c2mph">${esc(s.label)}</p>`;
      /* Je Kategorie eine Zwischenzeile — nur, wo es mehr als eine
         gibt oder sie einen Namen hat, wie im Wahl-Fenster. */
      const cats=[];
      live.forEach(g=>{if(!cats.includes(g.cat))cats.push(g.cat);});
      cats.forEach(c=>{
        if(cats.length>1||c)body+=`<p class="c2mpcat">${esc(c?keyLabel(c):'—')}</p>`;
        live.filter(g=>g.cat===c).forEach(g=>{body+=ent(g,groups.indexOf(g));});
      });
      body+='</div>';
    });
    if(!body)body=`<p class="note">${esc(t('cme.gone'))}</p>`;
    box.innerHTML=`<div class="box split cmebox">
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
      if(W&&W.step===3&&W.modal&&W.modal.isConnected){c2LoadMapRules();c2ApplyRules();c2Render();}
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
   v260905); ein anderes Ziel gibt es hier nicht zu wählen.

   Dieselben Grenzen wie dort: eine Bedingung bleibt stehen (eine
   Regel ohne träfe jede Zeile), und ein leerer Wert hält das
   Speichern auf (impCritCheck). Neue Regeln entstehen hier nicht —
   dafür braucht es die Zeilen einer Datei, also den Wizard. */
/* **Steht der Wizard im dritten Schritt, gilt sein Stand** für
   jeden Posten und jede flexible Kategorie. Aus dem Wizard heraus
   öffnet „Posten öffnen"
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
