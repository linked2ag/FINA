#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FINA — Bildschirmfotos für die README und die Anleitung.

Die Bilder in doc/img/ zeigen die laufende Anwendung, nicht eine Zeichnung
davon — sie veralten also, sobald sich die Oberfläche ändert. Damit das kein
Handbetrieb wird, baut dieses Skript aus index.html eine Wegwerfseite, lädt
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

# Die Wegwerfseite: dieselben Skripte wie index.html, dazu ein Aufsatz, der
# die Beispieldatei einsetzt und die Ansicht so herrichtet, wie es der
# Abzug braucht. Alles über die Adresszeile steuerbar (?v=…&only=…).
HARNESS = r"""<script>
const DEMO=__DEMO__;
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
if(p.get('all')) ui.showAll=true;
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
if(p.get('dlg')==='kak')     editKak(p.get('k'));
/* Ein Fenster ohne die abgedunkelte Seite dahinter. */
const md=document.querySelector('.modal');
if(md){
  const wrap=document.querySelector('.wrap'); if(wrap) wrap.style.display='none';
  md.style.cssText='position:static;background:none;padding:18px;display:block';
  const bx=md.querySelector('.box'); bx.style.maxHeight='none'; bx.style.overflow='visible';
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
       und im Ausschnitt mitten in die Liste rutschen würde. */
    if(getComputedStyle(el).position==='sticky') el.style.position='static';
    el.querySelectorAll('*').forEach(x=>{
      if(getComputedStyle(x).position==='sticky') x.style.position='static';
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
    ('year',        'v=jahr&all=1',                       2480, 1560),
    ('month',       'v=monat&m=8&fold=',                  1500, 1500),
    # Der schmale Monat für die Guide-Seite: nur der Inhalt (#view,
    # als %23 — ein rohes „#" wäre die Sprungmarke), schmal
    # fotografiert, damit die Karten kompakt stehen statt in die
    # Breite zu laufen.
    ('month-slim',  'v=monat&m=8&fold=&only=%23view',      880, 1180),
    ('flexible',    'v=kakeibo&scope=jahr',               1500, 1180),
    ('forecast',    'v=prognose',                         1500),
    ('guide',       'v=monat&m=8&guide=1',                1700, 1250),
    # ── Ausschnitte, für die Anleitung im Seitenbereich ───────────
    ('ui-header',   'v=monat&m=8&only=header',            1200),
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
    ('flex-dialog', 'dlg=kak&k=Groceries',                   1100),
    ('month-in',    'v=monat&m=8&fold=&only=.card.sec-in',      1200),
    ('month-flex',  'v=monat&m=8&fold=&only=.card.sec-flex',    1200),
    ('month-out',   'v=monat&m=8&fold=&only=.card.sec-out',     1200, 920),
    ('month-bal',   'v=monat&m=8&only=.card.sec-bal',     1200),
    ('legend',      'v=monat&m=8&only=.legendbar',        1200),
    # Kein „#" in der Adresse — das wäre die Sprungmarke, nicht der Wert.
    ('year-left',   'v=jahr&only=.yearscroll',             980, 1150),
    ('flex-view',   'v=kakeibo&scope=jahr&only=.card.sec-flex', 1200, 900),
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


def build_page():
    demo = json.load(open(DEMO, encoding='utf-8'))
    src = open(os.path.join(ROOT, 'Webclient.html'), encoding='utf-8').read()
    body = HARNESS.replace('__DEMO__', json.dumps(demo, ensure_ascii=False))
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
