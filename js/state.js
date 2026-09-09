/* ══════════════════════════════════════════════════════════════
   FINA — Datenmodell
   Aufbau des Zustands und Reparatur älterer Dateien beim Laden.
   Die Anwendung startet leer: sämtliche Inhalte — Banken,
   Zahlungsarten, Kategorien, Posten — stehen in der JSON-Datei.
   ══════════════════════════════════════════════════════════════ */

/* state  — die geladene Datei, im Speicher
   ui     — was gerade angezeigt wird; wird nicht mitgespeichert */
let state=null;
/* q ist das Suchfeld der Monatsansicht, qFocus merkt, dass der
   Fokus nach dem Neuzeichnen wieder dorthin gehört (siehe wire()
   in js/app.js). */
/* ana ist die Auswertung über der Monatsansicht: sie steht
   eingeklappt und bleibt offen, bis man sie wieder zuklappt. Das
   ist Anzeige, keine Einstellung — anders als die zugeklappten
   Bereiche (state.folded) gehört es nicht in die Datei.

   welcome ist die Begrüßungsseite: sie steht am Anfang und wieder
   nach dem Trennen der Datei (js/views/willkommen.js). */
/* mFilters ist das Filtermenü der mobilen Monatsansicht (der
   Knopf vor dem Suchfeld): offen oder zu — Anzeige wie ana, nicht
   in der Datei. Auf dem Schreibtisch wird es nie gelesen. */
let ui={month:CUR,view:'jahr',filter:'alle',dueFilter:'alle',secFilter:'alle',
  q:'',qFocus:false,ana:false,mFilters:false,welcome:true,hideSettled:false,hideDone:false,
  /* **Ein Buch ist gerade aufgegangen** (8.9.26): 1 heißt „von
     rechts hereinfliegen" (Datei geladen, leer angefangen), -1 „von
     links" (Datei getrennt, die Begrüßung kommt zurück). Gesetzt
     wird der Merker in js/storage.js, verbraucht einmal in render()
     — er entscheidet über die Fahrt der Ansicht und darüber, ob die
     Anleitung sich dazustellt. */
  enter:0};

/* ── Worauf sich das Suchfeld bezieht ─────────────────────────
   Der Nutzer stellt im Fenster hinter dem Hamburger-Knopf ein,
   welche Teile einer Zeile der Suchbegriff überhaupt durchsucht
   (js/dialogs/filter-fields.js). Die Wahl steht in der Datei —
   sie ist eine Einstellung, kein Anzeigezustand, und soll beim
   nächsten Öffnen wieder gelten.

   Vorgabe ist alles: eine frische Datei sucht überall. Mindestens
   ein Feld bleibt immer gewählt; ohne eines fände der Suchbegriff
   nie etwas, und niemand käme darauf, woran es liegt. Durchgesetzt
   wird das im Fenster (das Speichern weist die leere Wahl zurück)
   und hier beim Laden. */
const QFIELDS=['name','note','amount','total','meta'];
const allQFields=()=>{const o={};QFIELDS.forEach(k=>o[k]=true);return o;};

/* ── Auch in den ausgeblendeten Positionen suchen ─────────────
   Ein Haken im selben Fenster, aber eine andere Frage: die fünf
   Kästchen sagen, **worin** gesucht wird, dieser sagt, **wo**.

   Steht er, überstimmt ein Suchbegriff die übrigen Filter — den
   Zahlungsstand, die Fälligkeit, „Erledigte Posten ausblenden" — und
   findet auch, was der Monat gar nicht führt: eine Position ohne
   Betrag in diesem Monat. Wer etwas sucht, das er nicht sieht, hat
   sonst keinen Weg dorthin.

   Ohne Suchbegriff ändert der Haken nichts: er ist kein Schalter
   für „alles zeigen", sondern gehört der Suche. Vorgabe ist aus —
   was die Filter ausblenden, soll ausgeblendet bleiben, solange
   man nicht danach sucht. */
const qAll=()=>!!(state&&state.qHidden);

/* ── Zugehörige Links ─────────────────────────────────────────
   Eine Position und eine Flexible-Payments-Kategorie tragen eine
   **Liste** von Links: Vertrag, Rechnung, Kundenkonto, was auch
   immer dazugehört. Jeder Eintrag ist `{name,url}` — **beides ist
   nötig**, editLink() in js/ui.js legt ohne Namen nichts an. Ältere
   Dateien können trotzdem namenlose Links mitbringen; für die fällt
   linkLabel() in js/ui.js auf die Adresse zurück.

   **Höchstens zehn.** Nicht aus technischer Not, sondern weil eine
   Position mit zwanzig Links keine Position mehr ist, sondern ein
   Ordner — und weil das Auswahlfenster am Kettensymbol ohne Rollen
   auskommen soll.

   Ältere Dateien haben statt der Liste ein einzelnes Feld `url`.
   Das wandert hier als erster Eintrag hinein und wird gelöscht:
   ein Wert an zwei Stellen läuft früher oder später auseinander. */
const MAX_LINKS=10;
/* Ohne Schema hält der Browser eine Adresse für einen Pfad:
   „example.com/vertrag" landete auf der eigenen Seite statt im
   Netz. Beim Eintippen ergänzt das Webseitenänderungsfenster es
   (js/ui.js) — hier wird nachgeholt, was in älteren Dateien steht:
   das alte Feld `url` durfte ohne Schema gespeichert werden, weil
   der Knopf daneben es erst beim Öffnen ergänzte. */
const linkUrl=u=>/^[a-z][a-z0-9+.-]*:/i.test(u)?u:'https://'+u;
function normLinks(o){
  let l=Array.isArray(o.links)?o.links:[];
  if(!l.length&&typeof o.url==='string'&&o.url.trim()) l=[{name:'',url:o.url.trim()}];
  delete o.url;
  o.links=l.filter(x=>x&&typeof x.url==='string'&&x.url.trim())
    .map(x=>({name:String(x.name||'').trim(),url:linkUrl(x.url.trim())}))
    .slice(0,MAX_LINKS);
  return o;
}

/* Ergänzt fehlende Felder einer Position auf zwölf Monate. */
function normalize(it){
  it.note=it.note||'';                  /* Notiz zur ganzen Position */
  it.notes=it.notes||Array(12).fill(''); /* Notiz je Monat */
  it.paid=it.paid||Array(12).fill(false);
  if(Array.isArray(it.unclear)){ it.estimated=it.unclear.some(Boolean); delete it.unclear; }
  it.estimated=!!it.estimated;
  /* Welche Monate aus einem CSV-Import stammen: erledigt wie ein
     Haken, aber blau gezeigt (js/dialogs/csv2-wizard.js). */
  it.imp=Array.isArray(it.imp)?it.imp:Array(12).fill(false);
  while(it.notes.length<12) it.notes.push('');
  while(it.paid.length<12) it.paid.push(false);
  while(it.imp.length<12) it.imp.push(false);
  it.bank=it.bank||''; it.pay=it.pay||''; it.dueDay=it.dueDay||''; normLinks(it);
  if(it.end===undefined) it.end=null;
  return it;
}

/* ── Saldokorrektur ───────────────────────────────────────────
   Eine einzige, feste Position über den Einnahmen: hier trägt der
   Nutzer von Hand nach, was über die Monate an Ungenauigkeit
   aufgelaufen ist. Sie wird wie ein regelmäßiger Posten gepflegt
   (dasselbe Fenster, dieselben zwölf Monate), steht aber
   absichtlich NICHT in state.fixed — dort geriete sie in jede
   Summe, jeden Filter und jede Kategorie der regelmäßigen Kosten.
   Löschen lässt sie sich nicht; ohne Beträge ist sie einfach
   leer. */
const BALANCE_ID='balance-correction';
function blankBalance(){
  return normalize({id:BALANCE_ID,name:'Balance Correction',group:'',
    amounts:Array(12).fill(0),estimated:false});
}

/* ── Der Anfangsbestand ───────────────────────────────────────
   Was auf dem Konto lag, **bevor** der Januar anfing. Die Datei
   kennt nur zwölf Monate; ohne diese Zahl fingen alle laufenden
   Stände bei null an und bedeuteten „was dieses Jahr
   zusammengekommen ist", nicht „was auf dem Konto liegt".

   Es ist eine einzelne Zahl, kein Posten: sie steht in keiner
   Kategorie, wird nicht abgehakt und gehört keinem Monat. Deshalb
   die Hauptseite der Einstellungen, neben dem Abrechnungsjahr —
   und deshalb `state.opening` und nicht `state.fixed`.

   Gelesen wird sie über `opening()`, nie direkt: eine ältere Datei
   hat das Feld nicht, und eine Null ist dann die richtige Antwort.
   Negativ darf sie sein — ein Konto im Minus ist ein Anfang wie
   jeder andere. */
const opening=()=>{
  const v=state&&state.opening;
  return (typeof v==='number'&&isFinite(v))?v:0;
};

/* ── Zugeklappte Bereiche ─────────────────────────────────────
   Dieselben drei Geldarten in beiden Ansichten: 'in' Einnahmen,
   'flex' Flexible Payments, 'out' regelmäßige Kosten. Zugeklappt
   bleibt von einer Karte nur ihre oberste Zeile stehen, in der
   Jahresmatrix nur die Blockzeile mit ihren Summen.

   **Zwei Schalter, nicht einer.** state.folded gilt der
   Monatsansicht, state.foldedYear der Jahresmatrix: es sind zwei
   verschiedene Listen im selben Buch, und wer den Monat aufräumt,
   will nicht die halbe Matrix verlieren — und umgekehrt. Beide
   stehen in der Datei, denn beide sind eine Einstellung. */
const FOLD_KEYS=['in','flex','out'];
/* Vorgabe: alles offen. Wer eine Datei zum ersten Mal öffnet, soll
   sehen, was darin steht — zuklappen kann er selbst, und dann steht
   es in der Datei. */
const blankFolded=()=>({in:false,flex:false,out:false});
const isFolded=k=>!!(state&&state.folded&&state.folded[k]);
const isFoldedYear=k=>!!(state&&state.foldedYear&&state.foldedYear[k]);

/* ── Ein neues Buch weiß nichts ───────────────────────────────
   „Neu anfangen" heißt leer: **keine** Kategorien — weder für
   Einnahmen noch für Kosten noch für die Flexible Payments —,
   keine Banken, keine Zahlungsarten. Der Nutzer richtet sich
   selbst ein, und die Begrüßungsseite verspricht genau das
   (`wel.newSub`: „Jahr, Kategorien und Posten anlegen").

   Früher zog ein neues Buch die vier Listen aus dem vorigen mit
   und bekam dazu die Einnahme-Kategorie 'EINNAHMEN' geschenkt.
   Beides waren Angaben, die niemand gemacht hat: die Ordnung eines
   fremden Jahres in einem Buch, das gerade erst anfängt — und eine
   Kategorie, die man erst suchen und löschen muss, um die eigene
   anzulegen.

   Was bleibt, ist keine Angabe über Geld: Sprache, Abrechnungsjahr
   und die Wahl, worin das Suchfeld sucht. Das sind Einstellungen
   der Anwendung, keine Inhalte des Buches. */
function emptyState(){
  const o={},src={};
  for(let m=1;m<=12;m++){o[m]={};src[m]=null;}
  /* Ein frisch angefangenes Buch ist immer im aktuellen Format —
     es gibt keine ältere Datei, über die zu berichten wäre. Das
     steht hier und nicht bei den Aufrufern: „neu anfangen" und
     „Datei schließen" gehen beide durch diese Funktion. */
  fileVersion=null;
  return {
    year:(state&&state.year)||new Date().getFullYear(),
    lang:(state&&state.lang)||'en',
    /* Der Kontostand vor dem Januar. Er gehört zum Buch, nicht zum
       Nutzer: ein neues Buch fängt bei null an, auch wenn das alte
       eine Zahl trug. */
    opening:0,
    banks:[], pays:[],
    /* Jede Liste fängt mit ihrem festen „ohne Kategorie" an
       (NOCAT_* in js/i18n.js): ein neues Buch kann damit sofort
       Posten anlegen, auch ohne eine einzige eigene Kategorie. */
    groups:[NOCAT_OUT], incomeGroups:[NOCAT_IN], flexGroups:[NOCAT_FLEX],
    fixed:[], balance:blankBalance(),
    /* flexSource: je Monat die Datei, aus der die flexiblen Posten
       kamen (das Etikett am Kartenkopf). kak, kakCats, plan,
       flexActual und tx gibt es seit 6.9.26 abends nicht mehr —
       flexible Posten stehen in `fixed` (siehe migrateKak). */
    flexSource:src, labWidth:250, monWidth:100, topMin:50, lastImport:null,
    /* „Abgeschlossene Monate ausblenden" — hier steht seit 30.8.26
       nur noch die **Vorgabe fürs Öffnen**, gepflegt in den
       Einstellungen unter „Darstellung" (#sHideDone). Gelesen wird
       sie einmal in afterLoad() nach ui.hideDone; danach entscheidet
       der Knopf in der Jahresleiste, und der gilt nur für diese
       Sitzung.

       Vorher schrieb der Knopf unmittelbar hierher. Das war ein
       Sonderfall: sein Nachbar „Erledigte Posten ausblenden" gehört
       längst der Sitzung, und zwei Knöpfe nebeneinander, von denen
       einer die Datei ändert und der andere nicht, sind nicht zu
       erraten. Jetzt tun beide dasselbe — und wer den Anfangszustand
       festlegen will, tut es dort, wo die Angaben der Datei
       beisammenstehen. Vorgabe: alle zwölf Monate. */
    hideDoneMonths:false,
    /* Zugeklappte Bereiche, je Geldart einer — einmal für die
       Monatsansicht, einmal für die Jahresmatrix. Auch das ist eine
       Einstellung und keine Anzeige: sie gilt für alle zwölf Monate
       und soll beim nächsten Öffnen wieder gelten. Vorgabe ist
       alles offen. */
    folded:blankFolded(), foldedYear:blankFolded(),
    /* Ob die Auswertung der Monatsansicht aufgeklappt beginnt. Auch
       das ist keine Angabe über Geld, sondern eine Gewohnheit beim
       Lesen — sie überlebt das Trennen der Datei wie die Wahl des
       Suchfelds. Gelesen wird sie einmal beim Öffnen (afterLoad);
       danach entscheidet der Klick auf die Leiste, und der gilt nur
       für diese Sitzung. */
    anaOpen:!!(state&&state.anaOpen),
    /* Ob die Anleitung sich dazustellt, sobald das Buch aufgeht —
       und ob der CSV-Import seine mitbringt. **Ein frisch
       angefangenes Buch bekommt immer ja** (Lex, 9.9.26), auch wenn
       im vorigen der Haken weg war: die Anleitung führt durch das
       Anlegen, und genau davor steht, wer neu anfängt. Bis dahin
       erbte das leere Buch die Gewohnheit des alten — wer eine
       Datei mit weggenommenem Haken schloss und „Neu anfangen"
       drückte, bekam keine Anleitung und fand keinen Grund dafür;
       erst ein Neuladen der Seite half. Wer sie nicht mehr braucht,
       nimmt den Haken in den Einstellungen unter „Darstellung"
       wieder weg — das gilt dann für dieses Buch. */
    guideOpen:true,
    /* Worin das Suchfeld sucht, ist keine Angabe über Geld, sondern
       eine Gewohnheit beim Lesen — sie überlebt das Trennen der
       Datei, anders als die vier Listen. */
    filterFields:(state&&state.filterFields)?state.filterFields:allQFields(),
    qHidden:!!(state&&state.qHidden),
    /* Ob die Mac- und die Windows-App beim Start nach einer neueren
       Fassung fragen dürfen (checkUpdate in js/app.js). Im Browser
       bedeutungslos — dort ist die Seite immer die neueste. Wie die
       Wahl des Suchfelds ist das eine Gewohnheit und keine Angabe
       über Geld: sie überlebt das Trennen der Datei. */
    updateCheck:(state&&state.updateCheck===false)?false:true,
    /* ── Umfrage (Pilot) ──────────────────────────────────────
       `surveys` sammelt je Anfrage drei Angaben und sonst nichts:
       die Kennung der Umfrage als Schlüssel, `status` (0 kennt sie
       und wartet, 1 erledigt), den Tag, an dem FINA sie zum ersten
       Mal gesehen hat, und den Tag der Antwort. **Die Antworten
       selbst stehen nicht darin** — die liegen beim Absender, ohne
       Kennung des Nutzers. Geschrieben wird der Vermerk erst, wenn
       der Server bestätigt hat (js/dialogs/umfrage.js). */
    surveys:{},
    /* Gemerkte CSV-Zuordnungen (generischer Import, siehe migrate). */
    csvMaps:{}
  };
}

/* Neue Kakeibo-Kategorie: Planwerte, Haken, Notizen, Korrekturen
   und zugehörige Links — dieselbe Ausstattung wie ein regelmäßiger
   Posten, nur ohne Bank, Zahlungsart und Fälligkeit. */
/* ── „ohne Kategorie" in jeder Liste, und jeder Posten in einer ──
   (6.9.26) Aufgerufen von migrate() und von applySheet() (js/sheet.js):
   die drei Kategorielisten tragen ihren festen Schlüssel (NOCAT_* in
   js/i18n.js) genau einmal — fehlt er, kommt er nach oben —, und
   flexGroups gibt es überhaupt. Ein Posten, dessen Kategorie in
   keiner Liste steht, wäre unsichtbar; er zieht deshalb in „ohne
   Kategorie" seines Bereichs. Beim regulären Posten ist der Bereich
   ohne Liste nicht zu erkennen — dann Regulär; nur der alte feste
   Name 'EINNAHMEN' bleibt eine Einnahme. Ein flexibler Posten ohne
   `group` (Dateien von vor dieser Fassung) steht in „Flexibel ohne
   Kategorie". */
function ensureNoCat(s){
  if(!Array.isArray(s.flexGroups)) s.flexGroups=[];
  [['incomeGroups',NOCAT_IN],['flexGroups',NOCAT_FLEX],['groups',NOCAT_OUT]].forEach(([k,key])=>{
    if(!Array.isArray(s[k])) s[k]=[];
    s[k]=s[k].filter((g,i,a)=>g!==key||a.indexOf(g)===i);
    if(!s[k].includes(key)) s[k].unshift(key);
  });
  (s.fixed||[]).forEach(it=>{
    if(s.groups.includes(it.group)||s.incomeGroups.includes(it.group)||s.flexGroups.includes(it.group)) return;
    it.group=it.group==='EINNAHMEN'?NOCAT_IN:NOCAT_OUT;
  });
}

/* ── Die flexiblen Kategorien werden Posten (6.9.26 abends) ────────
   Bis dahin hatten die flexiblen Kosten ein eigenes Modell: je
   Kategorie `kak[name]` mit plan[12], paid[12], override[12], die
   importierten Ist-Werte in `flexActual[m][name]`, die Buchungen in
   `tx[]`. Seitdem ist ein flexibler Posten ein Posten wie jeder
   andere in `fixed[]`, erkennbar an seiner Kategorie aus
   `flexGroups` (isFlex in js/calc.js) — gleiche Felder, gleiches
   Fenster, gleiche Wege.

   Aus dem alten Modell wird je Monat:
     • importiert (Quelle des Monats gesetzt, kein `null` in
       flexActual): Betrag = Korrektur (override), sonst der
       Ist-Wert; abgehakt; imp = 1 (2, wenn alle Buchungen des
       Monats einmalig waren); die Buchungen als Quellzeilen
       (impRows[m]: Tag, Betrag, Referenzen — ältere ohne
       Referenzen als Text `x`).
     • sonst: Betrag = Planwert, Haken wie gesetzt.
   Name, Notizen, Links, „geschätzt" und die Importkriterien
   ziehen mit. Danach fallen `kak`, `kakCats`, `plan`, `flexActual`
   und `tx` aus der Datei — FINA hat sie selbst angelegt, und
   stateJson() schriebe sie sonst bei jedem Speichern wieder hinaus
   (dieselbe Behandlung wie `hideSettled`). `flexSource` bleibt: es
   ist das Etikett am Kartenkopf und die Antwort auf „kam dieser
   Monat aus einer Datei". */
function migrateKak(s){
  const cats=Array.isArray(s.kakCats)?s.kakCats:Object.keys(s.kak||{});
  const two=n=>String(n).padStart(2,'0');
  const y=s.year||new Date().getFullYear();
  cats.forEach(k=>{
    const e=s.kak&&s.kak[k]; if(!e) return;
    const grp=(e.group&&Array.isArray(s.flexGroups)&&s.flexGroups.includes(e.group))?e.group:NOCAT_FLEX;
    const it=normalize({id:uid(),name:String(k),group:grp,amounts:Array(12).fill(0),
      estimated:!!e.estimated,note:e.note||'',notes:(e.notes||[]).slice(),links:(e.links||[]).slice()});
    if(Array.isArray(e.impRules)&&e.impRules.length) it.impRules=e.impRules;
    for(let m=1;m<=12;m++){
      const fa=s.flexActual&&s.flexActual[m];
      const imp=!!(s.flexSource&&s.flexSource[m])&&!(fa&&fa[k]===null);
      if(imp){
        const ov=e.override&&e.override[m-1];
        it.amounts[m-1]=ov!=null?ov:((fa&&fa[k])||0);
        it.paid[m-1]=true;
        const rows=(s.tx||[]).filter(x=>x.m===m&&(x.main||'(ohne Hauptkategorie)')===k);
        it.imp[m-1]=(rows.length&&rows.every(x=>x.once))?2:1;
        if(rows.length){
          it.impRows=it.impRows||{};
          it.impRows[m]=rows.map(x=>{
            const r={d:x.d?two(x.d)+'.'+two(m)+'.'+two((x.y||y)%100):'',v:+x.v||0};
            if(x.r) r.r=x.r; else { const tx=[x.cat||'',x.note||''].filter(Boolean).join(' · '); if(tx) r.x=tx; }
            return r;
          });
        }
      }else{
        it.amounts[m-1]=(e.plan&&e.plan[m-1])||0;
        it.paid[m-1]=!!(e.paid&&e.paid[m-1]);
      }
    }
    s.fixed.push(it);
  });
  delete s.kak; delete s.kakCats; delete s.plan; delete s.flexActual; delete s.tx;
}

/* Einmal beim Öffnen einer Datei: was die Ansicht daraus macht.
   (Die Vorgaben der Ansicht „Import Details" — Unterkategorien,
   Zeitraum, Auswahl rechts — sind mit ihr am 7.9.26 gegangen.) */
function afterLoad(){
  /* Womit man begrüßt wird. Mit Datei fängt man im laufenden
     Monat an — das ist die Ansicht, in der gearbeitet wird:
     abhaken, nachtragen, nachsehen, was noch offen ist. Ohne
     Datei wäre dort nur ein leerer Monat zu sehen; dann steht
     das Jahr vorn, denn dort legt man an.

     `fileName` gehört js/storage.js und wird gesetzt, bevor
     afterLoad() läuft — beim Trennen ebenso, dort auf ''.
     Der Monat kommt aus CUR: in einer Datei aus einem anderen
     Jahr ist das der Januar. */
  ui.view=fileName?'monat':'jahr';
  ui.month=CUR;
  /* Eine frisch geöffnete Datei wird nicht gefiltert: der
     Suchbegriff der letzten stünde sonst noch im Feld und
     versteckte die halbe Datei. Dasselbe gilt „Erledigte Posten
     ausblenden": der Knopf gehört seit 22.8.26 der Sitzung, und
     eine neue Datei fängt mit allen Zeilen an. */
  ui.q=''; ui.qFocus=false; ui.hideSettled=false;
  /* „Abgeschlossene Monate ausblenden": die Datei sagt nur, womit
     die Jahresansicht **aufgeht** (state.hideDoneMonths, gepflegt
     in den Einstellungen unter „Darstellung"). Danach entscheidet
     der Knopf in der Jahresleiste, und zwar nur für diese Sitzung —
     geschrieben wird dabei nichts. */
  ui.hideDone=!!(state&&state.hideDoneMonths);
  /* Womit die Auswertung der Monatsansicht aufgeht, sagt die Datei:
     state.anaOpen, gepflegt in den Einstellungen unter
     „Darstellung". Von Haus aus ist sie zu — sie klebt beim Scrollen
     unter der Kopfzeile und nähme sonst dauerhaft Platz weg, den die
     Liste darunter besser gebraucht.

     **Danach entscheidet der Klick auf die Leiste**, und zwar nur
     für diese Sitzung: geschrieben wird dabei nichts, beim nächsten
     Öffnen gilt wieder die Einstellung. Deshalb steht das hier und
     nicht in der View.

     Das Filtermenü der mobilen Monatsansicht fängt immer zu an. */
  ui.ana=!!(state&&state.anaOpen);
  ui.mFilters=false;
}

/* ── In welcher Fassung die geladene Datei geschrieben wurde ──
   `stateJson()` legt beim Speichern `state.v` in die Datei (siehe
   js/storage.js). Beim Laden merkt sich `migrate()` den
   vorgefundenen Wert hier — **nicht im Zustand**: er beschreibt,
   was auf der Platte lag, und dürfte niemals mitgespeichert
   werden.

   Wozu: `migrate()` flickt eine ältere Datei still zurecht, und
   das Ergebnis geht beim nächsten Speichern hinaus. Wer eine alte
   Datei öffnet, soll das erfahren — sonst wundert er sich, warum
   die Anwendung mit dieser Datei anders aussieht als mit einer
   frischen (die zugeklappten Bereiche etwa gibt es erst, seit
   `state.folded` in der Datei steht).

   `null` heißt „kein geladenes Buch": ein neues Buch (emptyState)
   ist immer aktuell, und es gibt nichts zu melden. */
let fileVersion=null;
/* Dreiteilig, `Jahr.Monat.Tag` — ältere Dateien tragen eine vierte
   Stelle (26.8.13.1), ganz alte gar keine. Verglichen wird Stelle
   für Stelle als Zahl; was fehlt, zählt als 0. */
const verParts=v=>String(v||'').split('.').map(n=>parseInt(n,10)||0);
function verOlder(a,b){
  const A=verParts(a), B=verParts(b);
  for(let i=0;i<Math.max(A.length,B.length);i++){
    const x=A[i]||0, y=B[i]||0;
    if(x!==y) return x<y;
  }
  return false;
}
/* Wahr, solange die geladene Datei älter ist als diese Fassung.
   Eine **neuere** Datei meldet nichts: Web und Apps laufen
   auseinander (siehe „Die drei Fassungen" in CLAUDE.md), und wer
   in der älteren App speichert, verliert dank migrate() nichts. */
function fileOutdated(){
  return fileVersion!==null && (fileVersion===''||verOlder(fileVersion,VERSION));
}

/* Bringt eine geladene Datei auf den aktuellen Aufbau. */
function migrate(s){
  /* Was in der Datei stand, bevor hier geflickt wird (siehe oben).
     Ein leerer Text heißt „ohne Versionsangabe" — auch das ist
     eine ältere Fassung, nur eine ohne Vermerk. */
  fileVersion=(typeof s.v==='string'&&s.v)?s.v:'';
  /* Einstellungen: fehlen sie, gilt das Jahr der Datei und
     Englisch — so verhalten sich ältere Dateien wie ein
     frischer Start. */
  if(!s.year) s.year=new Date().getFullYear();
  if(s.lang!=='de'&&s.lang!=='en') s.lang='en';
  /* Dateien von vor dem Anfangsbestand fangen bei null an — genau
     so, wie sie es bisher getan haben. */
  if(typeof s.opening!=='number'||!isFinite(s.opening)) s.opening=0;
  /* Dateien von vor den Apps kennen den Schalter nicht. Die Frage
     nach einer neueren Fassung ist die einzige Netzverbindung, die
     FINA aufbaut — sie steht deshalb offen in den Einstellungen und
     ist von Haus aus an. */
  if(typeof s.updateCheck!=='boolean') s.updateCheck=true;
  if(!s.banks) s.banks=[];
  if(!s.pays) s.pays=[];
  if(!s.groups) s.groups=[];
  /* Ältere Dateien kennen die Liste nicht: sie haben nur den einen
     festen Einnahmenblock, und ihre Einnahmen zeigen mit
     it.group='EINNAHMEN' schon darauf. Sie bekommen ihn deshalb als
     erste Kategorie — für sie ändert sich nichts.

     **Eine leere Liste bleibt leer.** Sie ist keine fehlende
     Angabe, sondern eine gemachte: ein Buch, das noch keine
     Einnahme-Kategorie hat, weil es gerade erst angefangen wurde
     (siehe emptyState). Eine untergeschobene Kategorie stünde nach
     dem ersten Speichern wieder da, obwohl der Nutzer sie nie
     angelegt hat. Fehlen kann dabei nichts: ein Posten, der auf
     eine Einnahme-Kategorie zeigt, hält sie am Leben — das
     Einstellungsfenster gibt die letzte in Gebrauch nicht her. */
  if(!Array.isArray(s.incomeGroups)) s.incomeGroups=['EINNAHMEN'];
  if(!s.fixed) s.fixed=[];
  if(!s.flexActual) s.flexActual={};
  if(!s.flexSource) s.flexSource={};
  for(let m=1;m<=12;m++){
    if(!s.flexActual[m]) s.flexActual[m]={};
    if(s.flexSource[m]===undefined) s.flexSource[m]=null;
  }
  s.fixed.forEach(it=>{
    /* frühere Feldnamen: status[] / booked[] statt paid[] */
    if(it.status&&!it.paid){
      it.paid=it.status.map(v=>v==='booked');
      if(it.estimated===undefined) it.estimated=it.status.some(v=>v==='unclear');
    }
    if(it.booked&&!it.paid) it.paid=it.booked.slice();
    delete it.status; delete it.booked;
    normalize(it);
  });
  /* Dateien von vor der Saldokorrektur bekommen eine leere Zeile.
     Die Kennung ist fest — daran erkennen Fenster und Ansichten
     die Position wieder. */
  s.balance=s.balance?normalize(s.balance):blankBalance();
  if(!Array.isArray(s.balance.amounts)) s.balance.amounts=Array(12).fill(0);
  while(s.balance.amounts.length<12) s.balance.amounts.push(0);
  s.balance.id=BALANCE_ID;
  if(!s.balance.name) s.balance.name='Balance Correction';
  s.balance.group='';
  /* Sie wird nicht abgehakt und ist nie „geschätzt": ihr Betrag
     IST die Korrektur, die der Nutzer von Hand einträgt. Ältere
     Dateien tragen dort noch Haken — die haben keine Bedeutung
     mehr und werden beim Laden zurückgesetzt. */
  s.balance.paid=Array(12).fill(false);
  s.balance.estimated=false;
  if(!s.plan) s.plan={};
  /* Ohne Liste zählen die Einträge von `kak` — und ganz ohne `kak`
     die Schlüssel des uralten `plan` (je Kategorie ein Betrag): eine
     Datei aus dieser Zeit hat sonst keine Stelle, an der ihre
     flexiblen Posten stünden (6.9.26). */
  if(!s.kakCats||!s.kakCats.length) s.kakCats=s.kak?Object.keys(s.kak):Object.keys(s.plan||{});
  if(!s.kak) s.kak={};
  s.kakCats.forEach(k=>{
    const e=s.kak[k]||(s.kak[k]={});
    if(!Array.isArray(e.plan)) e.plan=Array(12).fill(s.plan[k]||0);
    while(e.plan.length<12) e.plan.push(0);
    if(!Array.isArray(e.paid)) e.paid=Array(12).fill(false);
    if(!Array.isArray(e.notes)) e.notes=Array(12).fill('');
    if(typeof e.note!=='string') e.note='';
    if(!Array.isArray(e.override)) e.override=Array(12).fill(null);
    while(e.override.length<12) e.override.push(null);
    if(e.estimated===undefined) e.estimated=true;
    normLinks(e);
  });
  /* Die flexiblen Kategorien werden Posten (6.9.26 abends, siehe
     migrateKak oben) — vorher die festen „ohne Kategorie"-Einträge,
     damit die Kategorie eines flexiblen Postens gültig ist. */
  if(!s.tx) s.tx=[];
  ensureNoCat(s);
  migrateKak(s);
  ensureNoCat(s);
  if(!s.labWidth) s.labWidth=250;
  if(!s.monWidth) s.monWidth=100;
  if(typeof s.topMin!=='number'||!(s.topMin>=0)) s.topMin=50;
  /* Ältere Dateien kennen die Angabe nicht — dann gilt die Vorgabe:
     die Jahresansicht geht mit allen zwölf Monaten auf. Der alte
     Wert bleibt gültig: er hieß bis 30.8.26 „gerade ausgeblendet"
     und heißt jetzt „geht ausgeblendet auf" — für den Nutzer
     dasselbe Bild beim nächsten Öffnen. */
  s.hideDoneMonths=!!s.hideDoneMonths;
  /* „Erledigte Posten ausblenden" stand bis 22.8.26 ebenfalls in der
     Datei. Es gehört nicht dorthin: der Knopf versteckt Zeilen, und
     eine geöffnete Datei soll nichts verstecken, ohne dass jemand in
     dieser Sitzung darum gebeten hat. Der alte Wert wird deshalb
     **gelöscht** und nicht bloß übergangen — stateJson() schriebe ihn
     sonst bei jedem Speichern wieder hinaus, und er stünde für immer
     in der Datei des Nutzers. Das ist keine Positivliste (siehe
     „Die drei Fassungen" in CLAUDE.md): entfernt wird genau dieses
     eine Feld, das FINA selbst einmal angelegt hat. */
  delete s.hideSettled;
  /* Ältere Dateien kennen den Schalter für die Auswertung nicht —
     dann fängt sie zugeklappt an, genau wie bisher. */
  s.anaOpen=!!s.anaOpen;
  /* Die Anleitung stellt sich dazu, solange niemand widersprochen
     hat: eine Datei ohne die Angabe bekommt deshalb `true` und
     nicht `false` — sie ist die Vorgabe und nicht das Erbe einer
     alten Fassung. */
  s.guideOpen=s.guideOpen!==false;
  /* Die zugeklappten Bereiche. Ältere Dateien kennen nur den einen
     Schalter der Flexible Payments (flexCollapsed) — er wandert in
     das neue Feld, die beiden anderen Karten fangen offen an. Die
     Jahresmatrix hat ihre eigene Liste; wo sie fehlt, fängt sie
     offen an, und nicht etwa mit dem, was im Monat zugeklappt ist. */
  const fold=(s.folded&&typeof s.folded==='object')?s.folded:{};
  if(s.folded===undefined&&s.flexCollapsed!==undefined) fold.flex=!!s.flexCollapsed;
  const foldY=(s.foldedYear&&typeof s.foldedYear==='object')?s.foldedYear:{};
  const def=blankFolded();
  s.folded={}; s.foldedYear={};
  FOLD_KEYS.forEach(k=>{
    s.folded[k]=fold[k]===undefined?def[k]:!!fold[k];
    s.foldedYear[k]=foldY[k]===undefined?def[k]:!!foldY[k];
  });
  delete s.flexCollapsed;
  /* Worin das Suchfeld sucht. Ältere Dateien kennen die Wahl
     nicht — dann gilt alles. Ein unbekannter Schlüssel gilt
     ebenfalls als gewählt, und eine Datei, in der (von Hand)
     nichts mehr gewählt wäre, bekommt alles zurück: ein
     Suchbegriff, der nirgends sucht, sieht aus wie ein Fehler. */
  /* Ältere Dateien suchen nicht in den ausgeblendeten Positionen —
     genau so, wie sie es bisher getan haben. */
  s.qHidden=!!s.qHidden;
  if(!s.filterFields||typeof s.filterFields!=='object') s.filterFields=allQFields();
  else{
    const o={};
    QFIELDS.forEach(k=>o[k]=s.filterFields[k]!==false);
    s.filterFields=QFIELDS.some(k=>o[k])?o:allQFields();
  }
  /* ── Umfrage (Pilot) ────────────────────────────────────────
     Ältere Dateien kennen die Liste nicht — dann steht noch keine
     Umfrage darin, und das ist die richtige Antwort. */
  if(!s.surveys||typeof s.surveys!=='object') s.surveys={};
  /* Die gemerkten CSV-Zuordnungen des generischen Imports, je
     Datei-Art eine (Schlüssel: Fingerabdruck der Spaltenköpfe). */
  if(!s.csvMaps||typeof s.csvMaps!=='object') s.csvMaps={};
  /* **Die sechs Importfelder und die Kriterien am Posten** (Struktur
     v260905, Schritte 2 und 3 des 5.9.26). Eine gemerkte CSV-Struktur
     trägt in `f` nur noch Datum, Betrag und Referenz 1 bis 5 —
     nichts sonst. Zwei ältere Formen werden beim Lesen übersetzt:

     1. **Felder:** statt der Referenzen `main` (Hauptkategorie),
        `cat` (Unterkategorie) und `desc` (Beschreibung). Sie werden
        in dieser Rangfolge zu Referenz 1, 2, 3 — was fehlt, rückt
        auf, sodass eine Datei mit nur einer Beschreibung diese als
        Referenz 1 bekommt.
     2. **Regeln je Datei-Art** (`rules[]`, Bedingungen mit
        Spaltennummer `ci`) wandern **an den Posten** (`impRules`,
        Bedingungen mit Feld `f`): die Spalte wird über die
        Feldverknüpfung zum Feld; eine Spalte ohne Feld bekommt die
        nächste freie Referenz, damit die Bedingung nicht verloren
        geht — erst wenn keine mehr frei ist, fällt sie weg. Ein Ziel,
        das die Regeln als „n:Name" kennen (beim Merken erst
        angelegt), wird über den Namen gefunden oder aus `newT`
        angelegt. Danach sind `cols`, `rules` und `newT` aus der
        Struktur heraus. **Und seit 6.9.26 auch `kind`** (Struktur
        v260906, Schritt 1): eine Art der Datei gibt es nicht mehr —
        Importkriterien gelten für reguläre wie für flexible Posten
        gleich, der Import zeigt alle Ziele zusammen. Das Feld wird
        beim Lesen gelöscht, sonst schriebe stateJson() es bei jedem
        Speichern wieder hinaus (dieselbe Behandlung wie
        `hideSettled` und `created`). Der Schlüssel bleibt der
        Fingerabdruck; eine zweite Struktur derselben Datei-Art liegt
        unter „fp#2", „fp#3" … (c2MapsFor in js/dialogs/csv2-wizard.js). */
  Object.keys(s.csvMaps).forEach(fp=>{
    const m=s.csvMaps[fp];
    if(!m||typeof m!=='object')return;
    const n=v=>(v==null||isNaN(+v))?-1:+v;
    const f=Object.assign({},m.f||{});
    if(!('ref1' in f)&&!('ref2' in f)&&!('ref3' in f)&&!('ref4' in f)&&!('ref5' in f)){
      const refs=[f.main,f.cat,f.desc].map(n).filter(v=>v>=0);
      f.ref1=refs[0]==null?-1:refs[0];f.ref2=refs[1]==null?-1:refs[1];f.ref3=refs[2]==null?-1:refs[2];
    }
    /* Referenz 5 seit 6.9.26 spät — eine ältere Struktur kennt sie
       nicht und bekommt -1 (Struktur v260906). */
    const nf={date:n(f.date),amount:n(f.amount),ref1:n(f.ref1),ref2:n(f.ref2),ref3:n(f.ref3),ref4:n(f.ref4),ref5:n(f.ref5)};
    if(Array.isArray(m.rules)&&m.rules.length){
      const fieldOf={};
      Object.keys(nf).forEach(k=>{if(nf[k]>=0&&fieldOf[nf[k]]==null)fieldOf[nf[k]]=k;});
      const free=()=>['ref1','ref2','ref3','ref4','ref5'].find(k=>nf[k]<0);
      const oldFlt=flt=>{
        const ts=[];
        Object.keys(flt||{}).forEach(k=>{
          const v=String(flt[k]).trim();
          if(!v)return;
          if(v[0]==='=')ts.push({ci:+k,op:'is',val:v.slice(1).trim()});
          else ts.push({ci:+k,op:'has',val:v});
        });
        return ts.filter(x=>x.val!=='');
      };
      /* Flexible Posten stehen seit 6.9.26 abends in s.fixed (migrateKak
         ist hier schon gelaufen); ein `k:`-Ziel aus einer alten
         Struktur wird also über den Namen wiedergefunden. */
      const isFlexG=x=>Array.isArray(s.flexGroups)&&s.flexGroups.includes(x.group);
      const byName=(nm,flex)=>{
        const q=String(nm||'').trim().toLowerCase();
        return s.fixed.find(x=>String(x.name||'').trim().toLowerCase()===q&&(flex?isFlexG(x):!isFlexG(x)))
          ||s.fixed.find(x=>String(x.name||'').trim().toLowerCase()===q)||null;
      };
      m.rules.forEach(r=>{
        if(!r||!r.t||!r.t.tid)return;
        const terms=[];
        (r.terms?r.terms:oldFlt(r.flt)).forEach(tm=>{
          if(!tm)return;
          const val=String(tm.val==null?'':tm.val).trim();
          if(!val)return;
          if(tm.f){terms.push({f:String(tm.f),op:tm.op||'has',val:val});return;}
          const ci=n(tm.ci);
          if(ci<0)return;
          let k=fieldOf[ci];
          if(!k){k=free();if(!k)return;nf[k]=ci;fieldOf[ci]=k;}
          terms.push({f:k,op:tm.op||'has',val:val});
        });
        if(!terms.length)return;
        const tid=String(r.t.tid);
        let host=null;
        if(tid.indexOf('i:')===0)host=s.fixed.find(x=>String(x.id)===tid.slice(2))||byName(r.t.name,false);
        else if(tid.indexOf('k:')===0)host=byName(tid.slice(2),true);
        else if(tid.indexOf('n:')===0){
          const nm=tid.slice(2),flex=m.kind==='flex';
          host=byName(nm,flex);
          if(!host){
            const nt=(m.newT||[]).find(y=>y&&y.tid===tid);
            /* Ohne Kategorie in `newT` steht der neue reguläre Posten
               in „Regulär ohne Kategorie" (6.9.26; bis dahin fiel er
               samt Kriterium weg, weil es die Kategorie nicht gab).
               Eine unbekannte Kategorie fängt ensureNoCat unten. */
            host=normalize({id:uid(),name:nm,group:flex?NOCAT_FLEX:((nt&&nt.group)||NOCAT_OUT),amounts:Array(12).fill(0)});
            host.bank=(nt&&nt.bank)||'';host.pay=(nt&&nt.pay)||'';host.dueDay=(nt&&nt.due)||'';
            s.fixed.push(host);
          }
        }
        if(!host)return;
        (host.impRules=host.impRules||[]).push({terms:terms});
      });
    }
    m.f=nf;
    delete m.kind;
    delete m.cols;delete m.rules;delete m.newT;
  });
  /* Noch einmal, weil die alten Regeln eben Posten angelegt haben
     können — mit einer Kategorie, die es in keiner Liste gibt. */
  ensureNoCat(s);
  /* `created` gab es einen Tag lang: der Tag, an dem ein Buch
     angefangen wurde, gedacht als Frist für neue Nutzer. Die Frist
     hängt jetzt am ersten **Speichern** und braucht kein Datum
     mehr (srvSaved() in js/dialogs/umfrage.js). Ein Feld, das
     niemand liest, bleibt nicht in der Datei des Nutzers stehen —
     sonst schriebe `stateJson()` es bei jedem Speichern wieder
     hinaus. */
  delete s.created;
  /* ── Der Kehrbesen der Namenstafel (8.9.26) ──────────────────
     `impNames` hält die eigenen Namen der Referenzfelder, unter
     denen Quellzeilen einmal hereinkamen (refLabel in js/calc.js).
     Zeigt keine Zeile mehr auf einen Satz — der Import wurde
     gelöscht, der Posten oder der Monat —, fällt er hier heraus:
     eine Stelle, an der ohnehin still geflickt wird, statt vier
     Stellen, an die man beim Löschen denken müsste. Ist die Tafel
     leer, verschwindet sie ganz; eine Datei ohne jede Umbenennung
     trägt das Feld also gar nicht erst. */
  if(s.impNames&&typeof s.impNames==='object'){
    const used=new Set();
    (s.fixed||[]).concat(s.balance?[s.balance]:[]).forEach(it=>{
      const rows=(it&&it.impRows)||{};
      Object.keys(rows).forEach(mk=>(rows[mk]||[]).forEach(r=>{
        if(r&&r.n!=null&&r.n!=='')used.add(String(r.n));
      }));
    });
    Object.keys(s.impNames).forEach(k=>{ if(!used.has(String(k)))delete s.impNames[k]; });
    if(!Object.keys(s.impNames).length)delete s.impNames;
  }
  return s;
}
