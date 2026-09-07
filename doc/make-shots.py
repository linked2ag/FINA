#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FINA — Bildschirmfotos für die README und die Anleitung.

Die Bilder in doc/img/ zeigen die laufende Anwendung, nicht eine Zeichnung
davon — sie veralten also, sobald sich die Oberfläche ändert. Damit das kein
Handbetrieb wird, baut dieses Skript aus fina-online.html eine Wegwerfseite, lädt
eine Beispieldatei hinein und fotografiert einzelne Teile mit Chrome ohne
Fenster.

    python3 doc/make-shots.py            # alle Bilder
    python3 doc/make-shots.py set-lists  # nur diese

Die Beispieldatei (fina-demo-en.json) enthält erfundene Zahlen und keine
persönlichen Daten; im Code der Anwendung stehen ohnehin keine. Die Wegwerfseite wird am Ende gelöscht.
"""

import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, 'doc', 'img')
PAGE = os.path.join(ROOT, '_shot.html')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
# Welche Beispieldatei fotografiert wird, lässt sich überschreiben:
#     FINA_DEMO=/pfad/zur/datei.json python3 doc/make-shots.py
DEMO = os.environ.get('FINA_DEMO') or os.path.expanduser(
    '~/Library/CloudStorage/GoogleDrive-lex2keeper@gmail.com/My Drive/'
    '# MDA/Finanzen/FINA Tabellen/fina-demo-en.json')

# Die Wegwerfseite: dieselben Skripte wie fina-online.html, dazu ein Aufsatz, der
# die Beispieldatei einsetzt und die Ansicht so herrichtet, wie es der
# Abzug braucht. Alles über die Adresszeile steuerbar (?v=…&only=…).
HARNESS = r"""<script>
const DEMO=__DEMO__;
const CSV_TEXT=__CSV__;
state=migrate(DEMO); fileName='fina-demo-en.json'; dirty=false; afterLoad();
/* Die Begrüßungsseite steht vor allem anderen — für die Abzüge
   ist die Datei aber schon geladen. Nur wer sie selbst
   fotografieren will, schaltet sie mit wel=1 wieder ein. */
ui.welcome=false;
const p=new URLSearchParams(location.search);
if(p.get('wel')) ui.welcome=true;
if(p.get('lang')) state.lang=p.get('lang');
ui.view=p.get('v')||'jahr';
if(p.get('m')) ui.month=+p.get('m');
if(p.get('scope')) ui.scope=p.get('scope');
/* `all=1` heißt: nichts ausgeblendet. Die Beispieldatei kann die
   abgerechneten Monate versteckt haben — auf einem Abzug, der
   zwölf Monate nebeneinander zeigen soll, wäre das der falsche
   Zustand. (Bis 23.8.26 stand hier `ui.showAll`, das es nicht
   mehr gibt.) */
if(p.get('all')){ state.hideDoneMonths=false; ui.hideDone=false; ui.hideSettled=false; }
/* Die Auswertung der Monatsansicht steht eingeklappt — für den
   Abzug des Zeitstrahls wird sie aufgeklappt. Ebenso lässt sich
   je Bereich sagen, ob er zugeklappt ist (fold=in,out). */
if(p.get('ana')) ui.ana=true;
if(p.get('fold')!==null&&state.folded){
  const want=(p.get('fold')||'').split(',').filter(Boolean);
  FOLD_KEYS.forEach(k=>state.folded[k]=want.includes(k));
}
render();
if(p.get('guide')){ openGuide(); if(p.get('tab')) guideTo(p.get('tab')); }
if(p.get('dlg')==='settings'){ openSettings();
  const b=document.querySelector('[data-sect="'+(p.get('pane')||'general')+'"]'); if(b) b.click(); }
if(p.get('dlg')==='item')    editItem(findItem(p.get('id')));
if(p.get('dlg')==='newitem') editItem(null,p.get('group')||'1');
/* Ein Posten nach seinem Namen: die flexiblen Posten entstehen erst
   in migrateKak() und haben in der Datei noch keine Kennung. */
if(p.get('dlg')==='item'&&p.get('name')){
  const it=state.fixed.find(i=>i.name===p.get('name')); if(it) editItem(it);
}
/* Das Suchfeld gefüllt — die Filterzeile leuchtet, die Karten zeigen
   nur die Treffer. */
if(p.get('q')){ ui.q=p.get('q'); render(); }
/* Das ☰-Menü offen, so wie es nach dem Klick steht. Die Animation
   wird abgeschnitten, sonst stünde es im Abzug auf seinem ersten
   Bild. */
if(p.get('menu')){
  const tools=document.getElementById('hdrTools');
  tools.classList.add('open'); tools.style.animation='none';
  document.getElementById('btnMenu').setAttribute('aria-expanded','true');
}
/* Der CSV-Import in Schritt 3, mit einer Beispieldatei aus den Zahlen
   der Beispieldatei (CSV_TEXT, gebaut vom Skript): Datum, Betrag und
   vier Referenzen sind verknüpft, ein Ziel ist gewählt, ein Kriterium
   angeheftet, und die Anleitung steht daneben (guide2=1). */
if(p.get('csv')){
  openCsvWizard();
  W.csv=c2Parse(new TextEncoder().encode(CSV_TEXT).buffer,'bank-export.csv');
  W.f={date:0,amount:1,ref1:2,ref2:3,ref3:4,ref4:5,ref5:-1};
  W.cols=[0,1,2,3,4,5];
  c2GoStep3();
  const tgt=state.fixed.find(i=>i.name===(p.get('target')||'Groceries'));
  if(tgt) W.target=tgt.id;
  if(p.get('chip')) W.chips.push({f:'ref1',op:'has',val:p.get('chip')});
  W.guide=!!p.get('guide2');
  /* step2=1: zurück in Schritt 2, so wie „‹ Zurück" es tut. */
  if(p.get('step2')){ W.editRule=null; W.step=2; }
  c2Render();
  document.querySelectorAll('.modal .box').forEach(b=>{ b.style.animation='none'; });
}
/* Ein Fenster ohne die abgedunkelte Seite dahinter. */
const md=document.querySelector('.modal');
if(md){
  const wrap=document.querySelector('.wrap'); if(wrap) wrap.style.display='none';
  md.style.cssText='position:static;background:none;padding:18px;display:block';
  const bx=md.querySelector('.box');
  if(!bx.classList.contains('c2big')){ bx.style.maxHeight='none'; bx.style.overflow='visible'; }
}
/* Nur ein Ausschnitt: alles andere kommt weg. */
let frame=null;
const only=p.get('only');
if(only){
  const el=document.querySelector(only);
  if(el){
    frame=document.createElement('div');
    frame.style.padding='18px';
    /* Das Symbol der Notizlampe muss bleiben — sonst zeigen die
       Zeilen im Ausschnitt eine leere Stelle statt der Lampe. */
    const sym=document.querySelector('svg[aria-hidden="true"]');
    document.body.innerHTML='';
    if(sym) document.body.appendChild(sym);
    document.body.appendChild(frame); frame.appendChild(el);
    el.style.margin='0';
    /* Im Abzug klebt nichts: die klebenden Teile (Kartenkopf,
       Filterzeile) tragen ein top-Maß, das zur ganzen Seite passt
       und im Ausschnitt mitten in die Liste rutschen würde.
       **relative, nicht static**: die Farbe des Kartenkopfes liegt
       seit dem Mac-Redesign auf einer absolut gesetzten
       ::before-Schicht. Auf `static` verliert die ihren Bezug und
       färbt die ganze Seite in der Farbe des letzten Blocks. Das
       Alle vier Maße müssen dabei weg: relativ gesetzt verschöbe
       `top` die Leiste um genau dieses Maß nach unten, quer über
       die erste Karte — und `left` schöbe die klebenden Spalten
       (END in der Prognose, die Bezeichnung in der Jahresmatrix)
       um ihre Klebestelle nach rechts. */
    const unstick=x=>{ x.style.position='relative';
      x.style.top=x.style.left=x.style.right=x.style.bottom='auto'; };
    if(getComputedStyle(el).position==='sticky') unstick(el);
    el.querySelectorAll('*').forEach(x=>{
      if(getComputedStyle(x).position==='sticky') unstick(x);
    });
    /* Jahresmatrix und Monatsliste rollen seit 23.8.26 in einer
       eigenen Fläche mit gerechneter Höhe. Im Ausschnitt gibt es
       kein Fenster, an dem sich das messen ließe — die Fläche gibt
       ihre Höhe deshalb frei, und der Abzug ist so hoch wie sein
       Inhalt. */
    frame.querySelectorAll('#monthScroll,.yearscroll').forEach(x=>{
      x.style.height='auto'; x.style.maxHeight='none'; x.style.overflow='visible';
    });
  }
}
/* Die Höhe des Abzugs ist die Höhe dessen, was zu sehen sein soll —
   nicht die der Seite: die trägt Polster und Statuszeile mit sich. */
const h=frame?frame.offsetHeight:(md?md.offsetHeight:document.documentElement.scrollHeight);
document.body.setAttribute('data-h',Math.ceil(h));
</script>"""

# name → (Adresse, Breite[, Höhe]). Ohne Höhe wird sie gemessen; mit Höhe
# ist der Abzug ein Ausschnitt der Seite — für Bilder, die sonst zu lang
# würden, ohne mehr zu zeigen.
SHOTS = [
    # ── die vier Ansichten, für die README ────────────────────────
    ('year',        'v=jahr&all=1',                       2480, 1290),
    ('month',       'v=monat&m=8&fold=',                  1500, 1500),
    # Der schmale Monat für die Guide-Seite: nur der Inhalt (#view,
    # als %23 — ein rohes „#" wäre die Sprungmarke), schmal
    # fotografiert, damit die Karten kompakt stehen statt in die
    # Breite zu laufen. Die Auswertung ist AUFGEKLAPPT (ana=1): die
    # Guide-Seite zeigt Zahlenzeile und Zeitstrahl in diesem einen
    # Bild und braucht kein zweites daneben.
    ('month-slim',  'v=monat&m=8&ana=1&fold=&only=%23view', 880),
    ('flexible',    'v=kakeibo&scope=jahr',               1500, 1180),
    # Nur der Inhalt (#view, als %23 — ein rohes „#" wäre die
    # Sprungmarke): auf der Guide-Seite steckt das Bild in einem
    # nachgebauten App-Fenster (.shotwin), und die echte Kopfzeile
    # darin stünde als zweite darunter.
    ('forecast',    'v=prognose&only=%23view',            1900),
    ('guide',       'v=monat&m=8&guide=1',                1700, 1250),
    # ── Ausschnitte, für die Anleitung im Seitenbereich ───────────
    # Die Zeichenerklärung (.legendbar) stand bis 23.8.26 unter der
    # Monatsansicht; sie ist weg, ihr Abzug wäre leer.
    ('ui-header',   'v=monat&m=8&only=header',            1200),
    # Die Monatsansicht von oben: Reiter, Filterzeile, Monatsleiste,
    # Auswertung und die ersten Karten — der Monatsrhythmus.
    ('month-page',  'v=monat&m=8&fold=',                  1200, 760),
    # Ein greifender Filter: die Zeile leuchtet, die Karten zeigen nur
    # die Treffer, „(n ausgeblendet)" steht an den Köpfen.
    ('ui-filter',   'v=monat&m=8&q=insurance&fold=&only=%23view', 1200, 520),
    # Der CSV-Import in Schritt 3 mit der Anleitung daneben.
    ('csv-step3',   'v=jahr&csv=1&chip=Groceries&guide2=1', 1500, 1000),
    ('ui-kpi',      'v=monat&m=8&only=.stickybar',        1200),
    # Die Auswertung, aufgeklappt: Zahlenzeile, Zeitstrahl, Filter.
    ('welcome',     'wel=1&only=.welcome',                1200),
    ('ui-analytics','v=monat&m=8&ana=1&only=.stickybar',  1400),
    ('ui-waterfall','v=monat&m=8&ana=1&only=.tline',      1400),
    ('set-general', 'dlg=settings&pane=general',          1100),
    ('set-lists',   'dlg=settings&pane=banks',            1100),
    ('set-groups',  'dlg=settings&pane=groups',           1100),
    ('item-dialog', 'dlg=item&id=__ELECTRICITY__',        1100),
    ('item-months', 'dlg=item&id=__ELECTRICITY__&only=.mgrid', 1100),
    ('item-quick',  'dlg=item&id=__ELECTRICITY__&only=.quick',  1100),
    # Ein flexibler Posten — seit 6.9.26 dasselbe Fenster wie jeder
    # andere; gefunden über seinen Namen (siehe HARNESS).
    ('item-flex',   'dlg=item&name=Groceries',                1100),
    ('month-in',    'v=monat&m=8&fold=&only=.card.sec-in',      1200),
    ('month-flex',  'v=monat&m=8&fold=&only=.card.sec-flex',    1200),
    ('month-out',   'v=monat&m=8&fold=&only=.card.sec-out',     1200, 920),
    ('month-bal',   'v=monat&m=8&only=.card.sec-bal',     1200),
    # Kein „#" in der Adresse — das wäre die Sprungmarke, nicht der Wert.
    ('year-left',   'v=jahr&all=1&only=.yearscroll',       980, 1150),
]


def file_url(path):
    return 'file://' + re.sub(r'[ #@]', lambda m: '%%%02X' % ord(m.group()), path)


def chrome(url, size, shot=None):
    cmd = [CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
           '--force-device-scale-factor=1', '--window-size=%d,%d' % size,
           '--virtual-time-budget=3000']
    cmd += ['--screenshot=' + shot] if shot else ['--dump-dom']
    out = subprocess.run(cmd + [url], capture_output=True, text=True).stdout
    return out


def demo_csv(demo):
    """Eine Beispiel-CSV für den Abzug des Imports, aus den Zahlen der
    Beispieldatei: die Buchungen des letzten importierten Monats (sie
    stehen schon im Buch und tragen im Wizard das Kreuz) und dazu ein
    erfundener Folgemonat — dieselben Zeilen, einen Monat weiter, die
    Beträge leicht verschoben — samt den regulären Posten dieses Monats."""
    tx = demo.get('tx') or []
    last = max((x['m'] for x in tx), default=0)
    nxt = last + 1
    rows = []
    def add(y, m, d, v, cat, sub, acc, note):
        rows.append('%02d.%02d.%d;%s;%s;%s;%s;%s' % (
            d, m, y, ('%.2f' % v).replace('.', ','), cat, sub, acc, note))
    for x in tx:
        if x['m'] == last:
            add(x['y'], x['m'], x['d'], x['v'], x['main'], x['cat'], x['acc'], x['note'])
    for i, x in enumerate(t for t in tx if t['m'] == last):
        add(x['y'], nxt, min(x['d'], 28), round(x['v'] * (1 + ((i % 7) - 3) / 40.0), 2),
            x['main'], x['cat'], x['acc'], x['note'])
    banks = {b['code']: b['label'] for b in demo.get('banks', [])}
    for it in demo.get('fixed', []):
        v = (it.get('amounts') or [0] * 12)[nxt - 1] if nxt <= 12 else 0
        if not v:
            continue
        d = int(it.get('dueDay') or 1)
        add(demo.get('year', 2026), nxt, d, v, it.get('group', ''), it['name'],
            banks.get(it.get('bank'), ''), '%s %02d/%d' % (it['name'], nxt, demo.get('year', 2026)))
    rows.sort(key=lambda r: (r[6:10], r[3:5], r[0:2]))
    return 'Date;Amount;Category;Subcategory;Account;Note\n' + '\n'.join(rows) + '\n'


def build_page():
    demo = json.load(open(DEMO, encoding='utf-8'))
    src = open(os.path.join(ROOT, 'fina-online.html'), encoding='utf-8').read()
    body = HARNESS.replace('__DEMO__', json.dumps(demo, ensure_ascii=False))
    body = body.replace('__CSV__', json.dumps(demo_csv(demo), ensure_ascii=False))
    open(PAGE, 'w', encoding='utf-8').write(src.replace('</body>', body + '\n</body>'))
    return demo


def main():
    want = set(sys.argv[1:])
    demo = build_page()
    os.makedirs(OUT, exist_ok=True)
    # Die Kennung eines Postens steht in der Datei, nicht im Code.
    ids = {it['name']: it['id'] for it in demo['fixed']}
    base = file_url(PAGE)
    try:
        for shot_def in SHOTS:
            name, query, width = shot_def[0], shot_def[1], shot_def[2]
            fixed = shot_def[3] if len(shot_def) > 3 else None
            if want and name not in want:
                continue
            q = query.replace('__ELECTRICITY__', ids.get('Electricity', ''))
            url = '%s?%s' % (base, q)
            if fixed:
                height = fixed
            else:
                dom = chrome(url, (width, 900))
                m = re.search(r'data-h="(\d+)"', dom)
                height = min(int(m.group(1)) if m else 900, 4000)
            chrome(url, (width, height), os.path.join(OUT, name + '.png'))
            print('%-14s %d×%d' % (name, width, height))
    finally:
        os.remove(PAGE)


if __name__ == '__main__':
    main()
