/* ══════════════════════════════════════════════════════════════
   FINA — Formatierung
   Zahlen, Text und Beschriftungen. Reine Funktionen ohne Zugriff
   auf den Zustand.
   ══════════════════════════════════════════════════════════════ */

const nf=new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});

/* Nullbeträge erscheinen als Gedankenstrich, nicht als 0,00. */
const eur=n=>(n===0||n==null?'—':nf.format(n));

/* Vorzeichenklasse für die Einfärbung. */
const cls=n=>n<0?'neg':(n>0?'pos':'');

const uid=()=>'i'+Math.random().toString(36).slice(2,9);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* „1.234,56" und „-1.234,56 €" werden zu Zahlen. */
function parseGermanNumber(s){
  if(s==null) return 0;
  s=String(s).trim().replace(/\s/g,'').replace(/€/g,'');
  if(!s) return 0;
  s=s.replace(/\./g,'').replace(',','.');
  const v=parseFloat(s); return isNaN(v)?0:v;
}

/* Vergleichsform für das Suchfeld: Kleinschreibung, und Punkt wie
   Komma. Der Betrag steht als „1.234,56" auf dem Schirm und als
   „1234.56" in der Datei — beide Schreibweisen sollen dasselbe
   finden. */
const norm=s=>String(s).toLowerCase().replace(/\./g,',');

/* ── Fälligkeit ───────────────────────────────────────────────
   Gespeichert wird entweder A/M/E oder ein Tag als Zahl. */
const DUE_LABEL=v=>({A:t('due.A'),M:t('due.M'),E:t('due.E')}[v]||(v?t('due.day',v):''));
const DUE_SHORT=v=>({A:'A',M:'M',E:'E'}[v]||(v?`${v}.`:''));

/* Ordnet auch einen Zahltag einem der drei Abschnitte zu:
   1.–10. Monatsanfang · 11.–20. Monatsmitte · ab 21. Monatsende.

   Ohne Zahltag steht ein Posten nicht im Monat, sondern am Ende:
   'Z' ist der Monatsabschluss (siehe monthFlow() in js/calc.js).
   Für die drei Filterknöpfe ändert das nichts — 'Z' ist so wenig
   'A' wie der leere Wert vorher. */
function dueGroup(v){
  if(v==='A'||v==='M'||v==='E') return v;
  const day=parseInt(v,10);
  if(!isNaN(day)){ if(day<=10) return 'A'; if(day<=20) return 'M'; return 'E'; }
  return 'Z';
}

/* Wie viele Tage hat dieser Monat im Jahr der Datei? Der Zeitstrahl
   der Monatsansicht teilt sich danach auf. */
const daysInMonth=m=>new Date(YEAR,m,0).getDate();

/* ── Laufzeitende einer Position ──────────────────────────── */
const endShort=it=>it&&it.end?`${String(it.end.m).padStart(2,'0')}.${String(it.end.y).slice(2)}`:'';
const endLabel=it=>it.end?`${MONTHS[it.end.m-1]} ${it.end.y}`:'';
const isLastRate=(it,m)=>it.end&&it.end.y===YEAR&&it.end.m===m;

/* Wie viele Monate stehen noch an, den laufenden mitgezählt?
   Fällt die letzte Rate in den laufenden Monat, ergibt das 1;
   zwei Monate später 3. Gerechnet wird immer gegen CUR, nie
   gegen einen festen Monat.
   0 oder weniger heißt „schon gelaufen", null „kein Ende". */
function endIn(it){
  if(!it||!it.end) return null;
  return (it.end.y-YEAR)*12+(it.end.m-CUR)+1;
}

/* Ampel für die Spalte LP der Jahresansicht: je näher die letzte
   Rate, desto ruhiger die Farbe. Vier Stufen, den laufenden Monat
   jeweils mitgezählt — grün nur noch dieser, blau 2 bis 3, gelb
   4 bis 6, rot 7 und mehr. Nur die Zelle wird eingefärbt, die
   Farben stehen in css/tokens.css.

   Wer die Grenzen verschiebt, verschiebt sie auch in den
   Beschriftungen der Legende (year.key2, year.key36, year.endTip
   in js/i18n.js) und in der Anleitung. */
function endClass(it){
  const n=endIn(it);
  if(n==null||n<1) return '';
  if(n===1) return 'e-now';
  if(n<=3) return 'e-soon';
  if(n<=6) return 'e-mid';
  return 'e-far';
}

/* Beschriftung dazu — steht als Tooltip an derselben Zelle. */
function endHint(it){
  const n=endIn(it);
  if(n==null) return '';
  if(n<1) return t('end.past',endLabel(it));
  if(n===1) return t('end.now',endLabel(it));
  return t('end.in',endLabel(it),n);
}

/* ── Der Name einer Webseite aus ihrer Adresse ────────────────
   Beim Eintragen eines Links soll nicht die nackte Adresse
   dastehen, sondern ein Name, den man wiedererkennt. Den *Titel*
   der Seite könnte nur der Server holen — FINA hat keinen, und
   `fetch` scheidet unter file:// ohnehin aus (Regel 4). Also wird
   er aus der Adresse abgeleitet, und das reicht: wer „Telekom"
   liest, weiß, worum es geht.

   Genommen wird der Name der Domäne ohne Länderkürzel und ohne
   `www.`: aus `https://www.telekom.de/kundencenter` wird
   „Telekom". Bei zusammengesetzten Endungen (`bbc.co.uk`) eine
   Ebene weiter, sonst hieße die Seite „Co".

   Zwei kleine Höflichkeiten: bis zu drei Buchstaben werden groß
   geschrieben — „ing" ist ING und nicht Ing —, und Bindestriche
   trennen Wörter, die einzeln groß anfangen. */
function siteName(u){
  if(!u) return '';
  let host='';
  try{ host=new URL(/^[a-z][a-z0-9+.-]*:/i.test(u)?u:'https://'+u).hostname; }
  catch(e){ return ''; }
  /* Was keine Adresse ist, bekommt auch keinen Namen. `new URL`
     nimmt fast alles an und kodiert den Rest — aus „irgendein Text"
     würde sonst „Irgendein%20Text". Lieber nichts vorschlagen als
     Unsinn. */
  if(!/^[a-z0-9.-]+$/i.test(host)) return '';
  /* Eine IP-Adresse hat keinen Namen, den man kürzen könnte: die
     zweitletzte Zahl wäre „0" und sagte gar nichts. */
  if(/^[\d.]+$/.test(host)) return host;
  const p=host.replace(/^www\./i,'').split('.').filter(Boolean);
  if(!p.length) return '';
  /* Endungen, die nie der Name sind: davor steht er. */
  const filler=/^(co|com|net|org|gov|edu|ac)$/i;
  let n=p.length>2&&filler.test(p[p.length-2])?p[p.length-3]
       :(p.length>1?p[p.length-2]:p[0]);
  if(!n) return '';
  return n.split('-').filter(Boolean)
    .map(w=>w.length<=3?w.toUpperCase():w.charAt(0).toUpperCase()+w.slice(1))
    .join('-');
}
