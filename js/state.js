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
let ui={month:CUR,view:'jahr',filter:'alle',dueFilter:'alle',secFilter:'alle',scope:'monat',kakPick:null,
  q:'',qFocus:false,ana:false,mFilters:false,welcome:true,hideSettled:false};

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
  while(it.notes.length<12) it.notes.push('');
  while(it.paid.length<12) it.paid.push(false);
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
    groups:[], incomeGroups:[],
    fixed:[], balance:blankBalance(),
    flexActual:o, flexSource:src, tx:[], plan:{},
    kakCats:[], kak:{}, labWidth:250, monWidth:100, topMin:50, lastImport:null,
    /* „Abgeschlossene Monate ausblenden". Der Knopf nimmt **Spalten**
       weg und keine Zeile — er versteckt nichts, was noch aussteht,
       sondern räumt ab, was abgerechnet ist. Das ist eine Gewohnheit
       beim Lesen und gehört deshalb in die Datei: einmal eingestellt,
       beim nächsten Öffnen wieder da. Vorgabe: alle zwölf Monate.

       Sein Nachbar „Erledigte Posten ausblenden" steht ausdrücklich
       **nicht** hier: der nimmt Zeilen weg (siehe ui.hideSettled
       oben). Was Zeilen versteckt, soll eine geöffnete Datei nicht
       stillschweigend mitbringen. */
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
       `created` ist der Tag, an dem dieses Buch angefangen wurde
       (2026-08-23). Daran hängt die Frist: gefragt wird erst zwei
       Wochen später, wer FINA gerade erst geöffnet hat, hat noch
       nichts zu sagen. Ein **neues** Buch weiß den Tag; eine
       Datei, die es schon gibt, bekommt ihn beim ersten Öffnen
       (migrate) — die Frist läuft ab dann und nicht rückwirkend.

       `surveys` sammelt je Anfrage drei Angaben und sonst nichts:
       die Nummer als Schlüssel (`260823`, zugleich der Name der
       Umfrage-Datei), `status` 0/1 und den Tag der Antwort. **Die
       Antworten selbst stehen nicht darin** — die liegen bei
       Formbricks, ohne Kennung des Nutzers. Geschrieben wird der
       Eintrag erst, wenn der Server bestätigt hat. */
    created:isoToday(),
    surveys:{}
  };
}

/* Neue Kakeibo-Kategorie: Planwerte, Haken, Notizen, Korrekturen
   und zugehörige Links — dieselbe Ausstattung wie ein regelmäßiger
   Posten, nur ohne Bank, Zahlungsart und Fälligkeit. */
function blankKak(v){
  return {plan:Array(12).fill(v||0),paid:Array(12).fill(false),estimated:true,
    note:'',notes:Array(12).fill(''),override:Array(12).fill(null),links:[]};
}

/* Einmal beim Öffnen einer Datei: was die Ansicht daraus macht.
   Ohne importierte Buchungen gibt es keine Unterkategorien — dann
   startet die Flexible-Payments-Ansicht bei den Hauptkategorien,
   sonst stünde man vor einer Gliederung, die es nicht gibt.
   Danach entscheidet der Nutzer; deshalb steht das hier und nicht
   in der View, die bei jedem Zeichnen läuft. */
function afterLoad(){
  ui.kakDetail=!!(state&&state.tx&&state.tx.length);
  /* Der Reiter „Fast Budget Details" fängt beim **ganzen Jahr** an
     und rechts bei den **größten Einzelposten** — das ist die
     Bedeutung von `ui.kakPick=null` (siehe js/views/kakeibo.js).

     Eine vorgewählte Kategorie wäre in beiden Fassungen die falsche
     Antwort: die erste der Liste steht dort, weil sie zuerst
     angelegt wurde, und die teuerste sagt nur, was die linke Spalte
     ohnehin schon zeigt. Wer den Reiter öffnet, will die einzelnen
     Buchungen sehen, die am meisten ausmachen; welche Kategorie das
     ist, liest er daran ab. Ein Klick auf einen Pfeil links
     wechselt in die Kategorie.

     Ein einzelner Monat wäre die engere Sicht — hier wird
     verglichen, und verglichen wird über das Jahr. */
  ui.scope='jahr';
  ui.kakPick=null;

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
  if(!s.kakCats||!s.kakCats.length) s.kakCats=s.kak?Object.keys(s.kak):[];
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
  if(!s.labWidth) s.labWidth=250;
  if(!s.monWidth) s.monWidth=100;
  if(typeof s.topMin!=='number'||!(s.topMin>=0)) s.topMin=50;
  if(!s.tx) s.tx=[];
  /* Ältere Dateien kennen den Knopf nicht — dann gilt die Vorgabe:
     alle zwölf Monate sind zu sehen. */
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
     In einer Datei, die es schon gibt, steht kein Anlegedatum:
     Sie bekommt hier das heutige gestempelt — die Zwei-Wochen-Frist
     läuft **ab dem ersten Öffnen** und nicht rückwirkend. Sonst
     stünde jemand, der FINA seit Monaten benutzt, beim nächsten
     Start sofort vor der Frage.

     Der Stempel macht die Datei nicht schmutzig; er wandert beim
     nächsten Speichern von selbst hinein (siehe „Nach jeder
     Änderung neu zeichnen"). Bis dahin gilt eben wieder heute —
     das verschiebt die Frist nach hinten und fragt niemanden zu
     früh. */
  if(typeof s.created!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s.created)) s.created=isoToday();
  if(!s.surveys||typeof s.surveys!=='object') s.surveys={};
  return s;
}
