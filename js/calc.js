/* ══════════════════════════════════════════════════════════════
   FINA — Berechnungen
   Alle abgeleiteten Zahlen. Lesen den Zustand, ändern ihn nie.
   ══════════════════════════════════════════════════════════════ */

/* ── Listen aus dem Zustand ───────────────────────────────── */
const costGroups=()=>(state&&state.groups?state.groups:[]);
/* Einnahmen haben eigene Kategorien, genau wie die Kosten — sie
   werden im Einstellungsfenster gepflegt. Früher gab es dafür den
   einen festen Block 'EINNAHMEN'; er ist heute nur noch der Name,
   unter dem migrate() eine **alte** Datei weiterführt. Der Name
   bleibt dabei roher Schlüssel und wird nicht übersetzt (Regel 3):
   angezeigt wird er über keyLabel() als INCOME.

   **Die Liste darf leer sein** — sie ist es in einem frisch
   angefangenen Buch, und dann gibt es eben noch keine Einnahmen.
   Eine untergeschobene Kategorie stünde in der Monatsansicht, in
   der Jahresmatrix und in jeder Auswahlliste, ohne dass der Nutzer
   sie angelegt hätte; wer sie loswerden wollte, müsste sie erst
   suchen. Leer ist eine Antwort, keine Lücke — dieselbe Regel wie
   bei costGroups() und kakCats() darüber. */
const incomeGroups=()=>(state&&Array.isArray(state.incomeGroups)?state.incomeGroups:[]);
const allGroups=()=>incomeGroups().concat(flexGroups(),costGroups());
/* Die Kategorien der flexiblen Posten (seit 6.9.26) — und die
   Kategorie eines einzelnen: ohne Angabe „Flexibel ohne Kategorie"
   (NOCAT_FLEX in js/i18n.js). */
const flexGroups=()=>(state&&Array.isArray(state.flexGroups)?state.flexGroups:[]);
/* Ein flexibler Posten ist ein Posten wie jeder andere (seit 6.9.26
   abends): er steht in state.fixed, und seine Kategorie steht in
   flexGroups — so wie eine Einnahme an incomeGroups erkannt wird.
   Alles Übrige ist eine regelmäßige Ausgabe (isCost). */
const isFlex=it=>!!it&&flexGroups().includes(it.group);
const isCost=it=>!!it&&!isIncome(it)&&!isFlex(it);
const flexItems=()=>((state&&state.fixed)||[]).filter(isFlex);
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
/* Der getippte Suchbegriff, vergleichsfertig. Leer heißt: alles
   passt. */
const queryQ=()=>norm((ui.q||'').trim());

/* ── Regelmäßige Posten ───────────────────────────────────── */
/* Eine Einnahme ist, was in einer der Einnahme-Kategorien steht.
   Der Vergleich mit einem festen Namen ginge nicht mehr: es gibt
   beliebig viele davon. */
const isIncome=it=>incomeGroups().includes(it.group);
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
const fixedCost=m=>sumF(m,isCost);
const openCost=m=>sumF(m,it=>isCost(it)&&!paidAt(it,m));
/* `unclearCount(m)` stand hier und zählte die geschätzten offenen
   Posten eines Monats. Die eine Stelle, die das brauchte — die
   Sprechblase an „noch offen" —, zählt seit dem Filtern über die
   gezeigten Zeilen (anaBar in js/views/monat.js) und kann die Zahl
   nicht mehr aus dem Zustand holen. */

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

/* ── Flexible Posten ──────────────────────────────────────────
   Seit 6.9.26 abends gewöhnliche Posten. Was hier bis dahin stand —
   plan, override, flexActual, tx und die Rangfolge kakVal() —, ist
   in den Posten aufgegangen: ein importierter Monat trägt seinen
   Betrag in amounts, den Pfeil in imp und seine Quellzeilen in
   impRows, wie bei jedem Posten. Eine Korrektur ist das Aufmachen
   des Monats (der Pfeil fällt dann, wie überall).

   hasActual(m): der Monat kam aus einer Datei — ein flexibler Posten
   trägt dort den Pfeil, oder die Quelle des Monats steht noch
   (flexSource, seit je das Etikett am Kartenkopf). */
const hasActual=m=>flexItems().some(it=>it.imp&&it.imp[m-1])
  ||!!(state&&state.flexSource&&state.flexSource[m]);

/* Gibt es überhaupt importierte Buchungen der flexiblen Posten?
   Daran hängt der Reiter „Import Details": er wertet genau sie aus,
   ohne Import stünde dort eine leere Gliederung. */
const hasImport=()=>!!state&&(flexTx().length>0
  ||Object.keys(state.flexSource||{}).some(m=>state.flexSource[m]));

/* ── Die Buchungen der flexiblen Posten, als Liste ─────────────
   Der Reiter „Import Details" liest sie, wie er früher `tx[]` las:
   je Buchung Jahr, Monat, Tag, `main` (der Name des Postens),
   Betrag, die Referenzen und ob die Zuordnung einmalig war. Gebaut
   werden sie aus den Quellzeilen (impRows) der flexiblen Posten —
   eine zweite Ablage gibt es nicht mehr. Ältere Quellzeilen ohne
   Referenzen tragen ihren Text in `x`; der steht dann als
   Unterkategorie (txSub liest `cat`). */
function flexTx(){
  const out=[];
  flexItems().forEach(it=>{
    const rows=it.impRows||{};
    Object.keys(rows).forEach(mk=>{
      const m=+mk; if(!(m>=1&&m<=12)) return;
      (rows[mk]||[]).forEach(r=>{
        const p=String(r.d||'').split('.');
        const x={y:p[2]?2000+(+p[2]):YEAR,m:m,d:+p[0]||0,main:it.name,v:+r.v||0};
        if(r.r) x.r=r.r; else if(r.x) x.cat=r.x;
        if(it.imp&&it.imp[m-1]===2) x.once=1;
        out.push(x);
      });
    });
  });
  return out;
}

/* ── Woher der Wert eines Monats stammt ───────────────────────
   Als Wort, damit die Ansicht „Import Details" zeigen kann, worauf
   sie sich stützt:
     imp   aus einem Import (der Pfeil)
     done  kein Import, aber abgehakt
     fix   fester eingetippter Betrag, gilt damit als erfasst
     est   geschätzt und noch offen
     none  gar kein Betrag */
function flexKind(it,m){
  if(!it) return 'none';
  if(it.imp&&it.imp[m-1]) return 'imp';
  if(it.paid[m-1]) return 'done';
  if((it.amounts[m-1]||0)===0) return 'none';
  return it.estimated?'est':'fix';
}
const FLEX_KIND_LABEL={imp:'kak.kImp',done:'kak.kDone',fix:'kak.kFix',est:'kak.kEst'};

/* ── Kam der Import aus einer einmaligen Zuordnung? ───────────
   Der Statuskreis eines importierten Monats ist cyan, wenn die
   Zuordnung gemerkt wurde, und **rot**, wenn nicht: beim nächsten
   Import derselben Datei-Art käme dieser Wert nicht von selbst
   wieder. Am Posten steht es an der Zahl selbst (`it.imp[m-1]`: 1
   gemerkt, 2 einmalig — ältere Dateien haben dort `true`, und das
   heißt wie 1). */
function impOnceAt(it,m){return !!(it&&it.imp&&it.imp[m-1]===2);}

/* ── Die drei Referenzen einer importierten Zeile (5.9.26) ─────
   Der CSV-Import kennt fünf Felder: Datum, Betrag und Referenz
   1 · 2 · 3 (C2_REFS in js/dialogs/csv2-wizard.js). Die Referenzen
   stehen als Liste `r` an einer Buchung der flexiblen Kosten
   (tx[]) und an einer Quellzeile eines Posten (impRows[m][]) — in
   ihrer Rangfolge, wie Überschrift 1 · 2 · 3.

   **Ältere Dateien tragen stattdessen** an der Buchung `cat`
   (Unterkategorie) und `note` (Beschreibung), an der Quellzeile
   einen zusammengesetzten Text `x`. Gelesen wird beides, und zwar
   nur hier: wer eine Buchung beschriftet, fragt diese vier
   Funktionen und nicht die Felder — sonst läsen zwei Ansichten
   dieselbe Buchung verschieden.

   * txSub(x)  — die Ebene unter der Kategorie im Reiter „Import
     Details": Referenz 1, bei alten Buchungen die Unterkategorie.
   * txNote(x) — was darunter als Notiz steht: Referenz 2 und 3,
     bei alten Buchungen die Beschreibung.
   * txText(x) — alles in einer Zeile (Zielbereich des Imports).
   * impRowText(r) — dasselbe für eine Quellzeile eines Posten.
   refsText(list) fügt eine Referenzliste mit „ · " zusammen. */
function refsText(r){return (r||[]).filter(Boolean).join(' · ');}
function txSub(x){return x&&x.r?(x.r[0]||''):((x&&x.cat)||'');}
function txNote(x){return x&&x.r?refsText(x.r.slice(1)):((x&&x.note)||'');}
function txText(x){
  if(x&&x.r)return refsText(x.r);
  const c=(x&&x.cat)||'',n=(x&&x.note)||'';
  return c+(c&&n?' · ':'')+n;
}
function impRowText(r){return r&&r.r?refsText(r.r):((r&&r.x)||'');}

/* ── Wie eine Referenz heißt ──────────────────────────────────
   (8.9.26) Referenz 1 bis 5 sind fünf freie Felder, und wer sie
   füllt, darf sie benennen — „Empfänger" statt „Referenz 2".
   Benannt wird an der **Importzuordnung** (csvMaps[…].rn, siehe
   js/dialogs/csv2-wizard.js); von dort wandert der Name **beim
   Import** ins Buch und bleibt dort stehen:

   * `state.impNames` ist die Namenstafel des Buches — je Satz
     einmal `{f:Name der Zuordnung, d:Tag, r:{ref1:…}}`,
   * `impRows[m][i].n` sagt, welcher Satz für diese Quellzeile gilt.

   **Eine Zeile behält damit den Namen, unter dem sie hereinkam**
   (Lex, 8.9.26: „Man hat diese Namen gewählt und wird wissen, was
   damit gemeint war"). Wer später umbenennt, ändert, was der
   nächste Import mitbringt — nicht, was schon im Buch steht. Zwei
   Importe mit verschiedenen Namen stehen deshalb an demselben
   Posten nebeneinander, jeder mit seiner Beschriftung.

   Ohne Umbenennung gibt es weder Tafel noch Stempel, und alles
   heißt wie zuvor „Ref 1" … „Ref 5". `inline` ist der Weg für die
   Zeilen, die der offene Import erst noch bringt (c2PendingRows):
   sie tragen ihre Namen direkt bei sich, im Buch steht ja noch
   nichts. */
function refNames(n,inline){
  if(inline)return inline;
  const s=(state.impNames||{})[n];
  return (s&&s.r)||null;
}
function refLabel(i,n,inline){
  const r=refNames(n,inline),v=r&&r['ref'+(i+1)];
  return v?String(v):t('impv.ref',i+1);
}
/* Woher der Name kommt — für die Sprechblase an der Beschriftung.
   Leer, wo nichts benannt wurde: dann gibt es nichts zu erklären. */
function refSource(n,inline){
  if(inline)return '';
  const s=(state.impNames||{})[n];
  return s&&s.f?t('impv.refFrom',s.f,s.d||'—'):'';
}

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

/* Grundlage der Prognose-Annahme: **alle** bisherigen Monate, in
   denen ein flexibler Posten feststeht — abgehakt oder importiert.
   Ein Monat, in dem nur die geschätzte Annahme steht, zählt nicht
   mit; sonst rechnete die Annahme ihren eigenen Durchschnitt aus. */
function avgMonths(){
  const ms=[], last=elapsedMonths();
  for(let m=1;m<=last;m++) if(flexItems().some(it=>paidAt(it,m))) ms.push(m);
  return ms;
}

/* Der Durchschnitt eines flexiblen Postens über diese Monate —
   gezählt werden nur die, in denen er selbst feststeht. */
function avgActual(it,ms){
  const use=(ms||avgMonths()).filter(m=>paidAt(it,m));
  if(!use.length) return null;
  return Math.round(use.reduce((s,m)=>s+(it.amounts[m-1]||0),0)/use.length*100)/100;
}
const kakeiboFor=m=>sumF(m,isFlex);

/* ── Monatssaldo ──────────────────────────────────────────────
   Kosten sind negativ gespeichert, deshalb wird addiert. Die
   Saldokorrektur kommt als vierter Summand dazu. */
const saldo=m=>income(m)+fixedCost(m)+kakeiboFor(m)+balanceFix(m);

/* ── Der Monat als Zeitstrahl ─────────────────────────────────
   Vier Abschnitte in der Reihenfolge, in der das Geld den Monat
   durchläuft: Monatsanfang (Zahltag 1.–10. oder A), Monatsmitte
   (11.–20. oder M), Monatsende (ab dem 21. oder E) und der
   Monatsabschluss.

   Der Abschluss ist der Sammelplatz für alles ohne Fälligkeit: die
   Flexible Payments (sie kennen keinen Zahltag), die Saldokorrektur
   und jeden Posten, bei dem kein Zahltag steht. Er steht am Ende,
   weil erst dort feststeht, was der Monat gekostet hat — sein
   laufender Wert ist deshalb genau saldo(m).

   Davor steht ein fünfter Abschnitt, in den nichts fällig wird:
   'P' — was der Monat vorfindet. Sein Wert ist der Anfangsbestand
   des Buches plus die Summe der Monate davor (carryIn). Im Januar
   steht dort also genau der Anfangsbestand; ohne einen bleibt es
   bei der Null, mit der FINA vorher immer angefangen hat.

   Je Abschnitt kommt zurück: die Veränderung (sum), der Kontostand
   danach (run), die Zahl der Posten dahinter (n) und die
   Aufteilung nach Geldart — up für die Zufuhr, down für den Abzug,
   beide als Beträge ohne Vorzeichen. Ein Posten zählt dorthin, wo
   sein Vorzeichen hinweist: eine Rückzahlung bei den regelmäßigen
   Kosten steht in der Zufuhr, und die Farbe der Art sagt trotzdem,
   woher sie kommt.

   **`sel` ist die Auswahl, über die gerechnet wird** — die Zeilen,
   die die Monatsansicht nach dem Filtern übrig lässt
   (`{items, kaks, bal}`, siehe „Was ein Filter mit den Summen
   macht" in CLAUDE.md). Ohne `sel` ist es der ganze Monat, und
   dann ist der letzte laufende Wert wieder genau `saldo(m)`.

   **`carryIn(m)` bleibt davon unberührt.** Es ist der Stand, den
   der Monat vorfindet — das Ergebnis der Monate davor, und die
   filtert niemand. Gefiltert steht in der ersten Zeile also der
   echte Anfang, und was darunter kommt, ist das, was die gezeigten
   Zeilen daraus machen. */
const carryIn=m=>{ let s=opening(); for(let i=1;i<m;i++) s+=saldo(i); return s; };
const FLOW_KINDS=['in','flex','out','bal'];
const FLOW_PARTS=['A','M','E','Z'];
const MONTH_PARTS=['P'].concat(FLOW_PARTS);
function monthFlow(m,sel){
  const items=sel?sel.items:dueIn(m);
  const bal=sel?!!sel.bal:true;
  const part={};
  FLOW_PARTS.forEach(k=>part[k]={sum:0,n:0,up:{},down:{}});
  const add=(p,kind,v)=>{
    if(!v) return;
    const b=part[p]; b.sum+=v; b.n++;
    const side=v>0?b.up:b.down;
    side[kind]=(side[kind]||0)+Math.abs(v);
  };
  /* Flexible Posten sind seit 6.9.26 abends gewöhnliche Posten mit
     Fälligkeit — sie stehen dort, wo ihr Zahltag sie hinsetzt, und
     nicht mehr pauschal im Monatsabschluss. */
  items.forEach(it=>add(dueGroup(it.dueDay),isIncome(it)?'in':(isFlex(it)?'flex':'out'),it.amounts[m-1]));
  if(bal) add('Z','bal',balanceFix(m));

  let run=carryIn(m);
  const out=[{key:'P',sum:run,n:Math.max(0,m-1),up:{},down:{},prev:0,run}];
  FLOW_PARTS.forEach(k=>{
    const prev=run; run+=part[k].sum;
    out.push(Object.assign({key:k,prev,run},part[k]));
  });
  return out;
}

const sumOf=o=>Object.values(o).reduce((a,b)=>a+b,0);

/* ── Der Maßstab des Zeitstrahls ──────────────────────────────
   Die Achse ist der Kontostand selbst, nicht die Veränderung: nur
   so steht jede Zeile dort, wo die Bilanz gerade ist, und man
   sieht auf einen Blick, ob sie im Plus oder im Minus liegt.

   Sie reicht von der Null — oder vom tiefsten Stand, wenn er
   darunter liegt — bis zum höchsten Punkt, den der Monat berührt.
   Berührt heißt wörtlich: kommt in einem Abschnitt erst eine
   Einnahme und gehen danach Kosten ab, steigt der Stand kurz über
   sein Ergebnis hinaus (prev + alle Zuflüsse). Genau dieser
   Ausschlag ist im Balken zu sehen, also muss er auch auf die
   Achse passen.

   **Gespannt wird sie über die Bewegungen des Monats, immer.** Die
   vier Abschnitte sind, was der Monat tut; die Fläche gehört ihnen.
   Die Null kommt nur ins Bild, wenn der Monat sie berührt — sonst
   liegt sie außerhalb, und das ist keine Auskunft, die fehlt: dass
   das Konto nicht bei null steht, sagt der Kontostand in derselben
   Zeile.

   **Die Monatseröffnung ist dabei ein Hinweis und kein Maß.** Ihr
   Balken reicht von der Null bis zum Stand, den der Monat
   vorfindet, und der ist meist ein Vielfaches dessen, was der Monat
   bewegt: wer 110.000 auf dem Konto hat und 9.000 bewegt, sähe von
   den Bewegungen nichts mehr — sie schrumpften auf ein Zwanzigstel
   der Breite. Deshalb zählt diese Zeile für die Achse **nicht** mit
   (siehe flowScale); ihr Balken wird in die gezoomte Fläche
   hineingezeichnet, franst am Rand aus und sagt damit „geht
   weiter". Der Maßstab steht dann in der Farberklärung dabei.

   Vorher entschied das eine Grenze — bekamen die Bewegungen nicht
   wenigstens die halbe Breite, wurde beschnitten. Damit sprang der
   Maßstab: derselbe Monat las sich vor und nach einer Buchung nach
   zwei verschiedenen Achsen, je nachdem, auf welcher Seite der
   Hälfte er gerade lag.

   Die Regel selbst steht in spanScale() und gilt für **beide**
   Grafiken: den Zeitstrahl eines Monats und den Verlauf über das
   Jahr in der Prognose. Getrennte Fassungen liefen mit der Zeit
   auseinander, und dann hieße derselbe Balken in zwei Ansichten
   zweierlei. */
/* `force` schneidet immer, ohne zu fragen: die Achse läuft dann
   über die Werte selbst und nimmt die Null nur mit, wenn sie
   zwischen ihnen liegt. Der Zeitstrahl der Monatsansicht tut das
   ausnahmslos (siehe flowScale), der Verlauf über das Jahr, sobald
   ein Anfangsbestand gesetzt ist: die Null ist dann keine Aussage
   mehr über das Jahr, sondern nur noch der Abstand zu einem Konto,
   das nie leer war — sie schöbe alle zwölf Monate in die rechte
   Hälfte.

   **Ohne `force` bleibt die alte Regel** für den Verlauf ohne
   Anfangsbestand: die Null gehört dazu, solange die Bewegungen
   wenigstens die halbe Breite bekommen. */
function spanScale(lo,hi,force){
  if(!isFinite(lo)){ lo=0; hi=0; }
  const move=hi-lo, full=Math.max(0,hi)-Math.min(0,lo);
  const cut=force||(full>0&&move/full<0.5);
  if(!cut){ lo=Math.min(0,lo); hi=Math.max(0,hi); }
  /* `rawLo`/`rawHi` sind die Grenzen **ohne** die Luft: genau der
     Bereich, in dem etwas gezeichnet wird. Der Zeitstrahl der
     Monatsansicht braucht die Luft (er hat kein Raster, an dem sich
     ein Balken festhält); die Prognose zieht ihre Achse stattdessen
     aufs Raster und kommt ohne aus — sonst entstünde vorn ein
     leeres Feld (siehe viewPrognose). */
  const rawLo=lo, rawHi=hi;
  if(cut){ const pad=move*0.08||1; lo-=pad; hi+=pad; }
  return {lo,hi,span:(hi-lo)||1,cut,rawLo,rawHi};
}
function flowScale(flow){
  let lo=Infinity,hi=-Infinity;
  flow.forEach(f=>{
    /* Die Monatseröffnung ist kein Abschnitt des Monats, sondern
       der Stand, den er vorfindet — für die Achse zählt sie gar
       nicht. Ihr Wert steht trotzdem darin: er ist der Anfang des
       ersten Abschnitts (dessen prev), und der zählt mit. Was
       darüber hinausgeht — die Strecke von der Null bis dorthin —
       ist ihr Balken, und der ist ein Hinweis (siehe oben). */
    if(f.key==='P') return;
    const top=f.prev+sumOf(f.up);
    lo=Math.min(lo,f.prev,top,f.run); hi=Math.max(hi,f.prev,top,f.run);
  });
  /* Immer über die Werte selbst: die Bewegungen bekommen die
     Fläche, die Null nur einen Platz darin, wenn der Monat sie
     berührt. */
  return spanScale(lo,hi,true);
}

/* ── Der Verlauf über das Jahr ────────────────────────────────
   Dasselbe wie monthFlow(), eine Ebene höher: je Monat, was er
   vorfindet (prev), was er daraus macht (run = die kumulierte
   Summe) und woraus seine Veränderung besteht. Damit zeichnet die
   Prognose denselben Wasserfall wie die Monatsansicht — dieselben
   vier Geldarten, dieselbe Achse, dieselbe Treppe.

   Angefangen wird beim Anfangsbestand (opening() in js/state.js) —
   dem Kontostand vor dem Januar. Die letzte Zeile ist damit der
   Stand zum Jahresende, dieselbe Zahl, die die Spalte „Kumuliert"
   in ihrer letzten Zeile zeigt; ohne Anfangsbestand ist es die
   Null wie bisher. */
function yearFlow(){
  const out=[]; let run=opening();
  for(let m=1;m<=12;m++){
    const up={},down={};
    const add=(kind,v)=>{ if(!v) return; const s=v>0?up:down; s[kind]=(s[kind]||0)+Math.abs(v); };
    /* Ein Betrag zählt dorthin, wo sein Vorzeichen hinweist — eine
       Rückzahlung bei den regelmäßigen Kosten steht also in der
       Zufuhr, und ihre Farbe sagt trotzdem, woher sie kommt.
       Kosten sind negativ gespeichert (siehe saldo()), sie kommen
       also unverändert herein und nicht umgedreht. */
    add('in',income(m));
    add('out',fixedCost(m));
    add('flex',kakeiboFor(m));
    add('bal',balanceFix(m));
    const prev=run; run+=saldo(m);
    out.push({m,prev,run,sum:saldo(m),up,down});
  }
  return out;
}
function yearScale(flow){
  const op=opening();
  let lo=Infinity,hi=-Infinity;
  flow.forEach(f=>{
    const top=f.prev+sumOf(f.up);
    /* Ohne Anfangsbestand ist der Stand vor dem Januar die Null, an
       der sein Balken anfängt, und kein Wert des Jahres — genau wie
       im Zeitstrahl der Stand vor dem Monat. Zählte sie mit,
       spannte die Achse immer von der Null aus und schnitte nie:
       ein Januar mit 120.000 drückte die elf Monate danach zu
       Strichen zusammen. **Mit** Anfangsbestand ist derselbe Wert
       ein echter Kontostand und zählt mit — sonst liefe der
       Januarbalken aus der Fläche heraus. */
    if(f.m!==1||op) { lo=Math.min(lo,f.prev); hi=Math.max(hi,f.prev); }
    lo=Math.min(lo,f.run,top); hi=Math.max(hi,f.run,top);
  });
  return spanScale(lo,hi,!!op);
}

/* ── Fortschritt eines Monats ─────────────────────────────── */
function monthParts(m){
  const items=dueIn(m);
  const total=items.length;
  const done=items.filter(it=>paidAt(it,m)).length;
  return {total,done};
}
function monthDone(m){const p=monthParts(m);return p.total>0&&p.done===p.total;}
