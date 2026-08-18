/* ══════════════════════════════════════════════════════════════
   FINA — das Skript der vier Verkaufsseiten
   index.html · features.html · compare.html · guide.html

   EINE Datei für alle vier. Bis August 2026 stand jeder Block
   inline in jeder Seite; bei zwei Seiten ging das noch, bei vier
   liefen die Kopien auseinander.

   Geladen wird sie ganz unten im <body> und OHNE defer: die
   Startlagen der Bewegung hängen an html.js, und die soll stehen,
   bevor gezeichnet wird.

   Jeder Block steigt von selbst aus, wenn es sein Element auf der
   Seite nicht gibt — deshalb braucht keine Seite eine eigene
   Fassung.

   ── Die fünf Blöcke ──────────────────────────────────────────
   1. SPRACHE   — jeder Text steht zweimal im HTML (data-l="de" /
                  data-l="en"), Englisch ist der Grundzustand. Die
                  Wahl merkt sich localStorage("finaLang") und gilt
                  auf jeder Seite; der Web-Client nimmt sie als
                  Vorgabe für ein leeres Buch.
   2. SPRUNGMENÜ— der Knopf unten links. Das Menü selbst steht als
                  <nav class="jumpmenu"> im HTML jeder Seite: dort
                  stehen die Überschriften in beiden Sprachen, und
                  nur die Seite weiß, welche sie hat.
   3. AUSSCHNITT— eine Tabelle oder ein Bild, das breiter ist als
                  sein Rahmen, bekommt eine Übersichtskarte mit
                  Rahmen: ziehen verschiebt den Ausschnitt.
   4. DOWNLOADS — die Plattformkarten der Startseite klappen ihre
                  Kachelgruppe auf und wieder zu.
   5. BEWEGUNG  — Eintreten beim Scrollen, Leseweg oben. Steigt bei
                  prefers-reduced-motion aus; alles andere läuft
                  weiter, denn Sprache und Sprungmenü sind keine
                  Verzierung.
   ══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

function each(sel,fn,root){
  var l=(root||document).querySelectorAll(sel);
  for(var i=0;i<l.length;i++) fn(l[i],i);
}

/* ── 1. Die Sprache ──────────────────────────────────────────
   Ohne JavaScript bleibt Englisch stehen — deshalb trägt im HTML
   die deutsche Fassung das `hidden`, nicht die englische. */
function setLang(l){
  document.documentElement.lang=l;
  each('[data-l]',function(e){e.hidden=e.getAttribute('data-l')!==l;});
  each('.langsw button',function(b){
    b.setAttribute('aria-pressed',String(b.getAttribute('data-lang')===l));});
  var t=document.querySelector('title');
  if(t&&t.getAttribute('data-'+l)) document.title=t.getAttribute('data-'+l);
  try{localStorage.setItem('finaLang',l);}catch(e){}
}
each('.langsw button',function(b){
  b.addEventListener('click',function(){setLang(b.getAttribute('data-lang'));});});
var saved=null; try{saved=localStorage.getItem('finaLang');}catch(e){}
if(saved==='de') setLang('de');

/* ── 2. Das Sprungmenü ───────────────────────────────────────
   Unten links, auf jeder Breite. Die Kopfzeile trägt vier Links
   für die ganze Seite; hier stehen die Abschnitte DIESER Seite —
   auf dem Telefon, wo die Kopfzeilen-Navigation ganz entfällt,
   ist es überhaupt der einzige Weg dorthin.

   Welcher Abschnitt gerade oben steht, hebt das Menü hervor
   (.here). Gemessen wird mit dem IntersectionObserver und nicht
   in einem scroll-Handler: der lief dem Scrollen immer hinterher. */
var jump=document.querySelector('[data-jump]');
if(jump){
  var jbtn=jump.querySelector('.jumpbtn');
  var shut=function(){
    jump.classList.remove('open');
    if(jbtn) jbtn.setAttribute('aria-expanded','false');
  };
  if(jbtn) jbtn.addEventListener('click',function(e){
    e.stopPropagation();
    var on=!jump.classList.contains('open');
    jump.classList.toggle('open',on);
    jbtn.setAttribute('aria-expanded',String(on));
  });
  each('a',function(a){a.addEventListener('click',shut);},jump);
  document.addEventListener('click',function(e){
    if(!jump.contains(e.target)) shut();});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') shut();});

  /* ── Wo man gerade liest ─────────────────────────────────────
     Im Menü ist immer genau EIN Abschnitt markiert (.here): der
     letzte, dessen Anfang über der Leselinie liegt (30 % der
     Fensterhöhe). „Anfang" zeigt auf <body> und zählt als 0 — am
     Seitenanfang ist also er der Treffer, nicht nichts. Und wer
     ganz unten steht, liest den letzten Abschnitt, auch wenn der
     zu kurz ist, um die Leselinie je zu erreichen.

     Gerechnet wird bei jedem Scrollen neu, samt der Lagen der
     Abschnitte selbst: die verschieben sich noch, wenn Bilder
     laden oder die Sprache wechselt. Zehn Rechtecke je Ereignis —
     das ist keine Messung, der man hinterherlaufen könnte. */
  var marks=[];
  each('a[href^="#"]',function(a){
    var el=document.getElementById(a.getAttribute('href').slice(1));
    if(el) marks.push({a:a,el:el});
  },jump);
  if(marks.length){
    var spy=function(){
      var line=scrollY+innerHeight*.3, hit=marks[0];
      marks.forEach(function(m){
        var top=m.el===document.body?0:m.el.getBoundingClientRect().top+scrollY;
        if(top<=line) hit=m;
      });
      if(scrollY+innerHeight>=document.documentElement.scrollHeight-2)
        hit=marks[marks.length-1];
      marks.forEach(function(m){m.a.classList.toggle('here',m===hit);});
    };
    addEventListener('scroll',spy,{passive:true});
    addEventListener('resize',spy);
    if(jbtn) jbtn.addEventListener('click',spy);
    spy();
  }
}

/* ── 3. Den Ausschnitt schieben ──────────────────────────────
   Eine Tabelle (Startseite) oder ein Bildschirmfoto (Guide) ist
   breiter als der Rahmen, in dem sie steht. Statt sie zu
   verkleinern, bis niemand mehr die Zahlen liest, zeigt der Rahmen
   einen Ausschnitt in Lesegröße — und rechts unten liegt die
   ganze Fläche als Karte, mit einem Rahmen um das, was man gerade
   sieht. Ziehen verschiebt: auf der Karte wie auf dem Ausschnitt
   selbst.

   DIE KARTE IST EINE KOPIE, kein zweites Bild und keine zweite
   Tabelle: sie entsteht hier aus dem, was im Rahmen steht
   (cloneNode), und wird auf die Breite der Karte geschrumpft. Ein
   von Hand gepflegtes Übersichtsbild liefe früher oder später
   neben dem her, was es zeigen soll.

   Der Rahmen selbst rollt (scrollLeft/scrollTop) — auch senkrecht,
   obwohl overflow-y:hidden steht: verborgen heißt nicht
   unbeweglich, und ein senkrecht rollbarer Kasten finge sonst das
   Mausrad ab, das der Seite gehört. */
each('[data-pan]',function(box){
  var view=box.querySelector('.panview');
  var map=box.querySelector('.panmap');
  if(!view||!map||!view.children.length) return;

  var mview=document.createElement('div');
  mview.className='mapview';
  var inner=document.createElement('div');
  inner.className='mapinner';
  for(var i=0;i<view.children.length;i++)
    inner.appendChild(view.children[i].cloneNode(true));
  var rect=document.createElement('i');
  mview.appendChild(inner); mview.appendChild(rect);
  map.appendChild(mview);
  map.setAttribute('aria-hidden','true');

  var startY=parseFloat(box.getAttribute('data-pan-y')||'0')/100;
  var placed=false;

  function measure(){
    var w=view.scrollWidth,h=view.scrollHeight,mw=mview.clientWidth;
    if(!w||!h||!mw) return;
    var k=mw/w;
    inner.style.width=w+'px';
    inner.style.height=h+'px';
    inner.style.transform='scale('+k+')';
    mview.style.height=Math.round(h*k)+'px';
    /* Passt alles in den Rahmen, gibt es nichts zu schieben — dann
       verschwindet die Karte, wie die Rollleiste der Anwendung. */
    box.classList.toggle('nopan',
      w<=view.clientWidth+2&&h<=view.clientHeight+2);
    /* Der Startversatz gilt erst, wenn es etwas zu verschieben
       gibt: vor dem Laden des Bildes ist scrollHeight gleich der
       Rahmenhöhe, scrollTop würde auf 0 geklemmt — und `placed`
       stünde trotzdem, sodass die Nachmessung bei img.load den
       Versatz überspränge. */
    if(!placed&&startY&&h>view.clientHeight+2){view.scrollTop=h*startY;placed=true;}
    update();
  }
  function update(){
    var w=view.scrollWidth,h=view.scrollHeight;
    if(!w||!h) return;
    rect.style.left=(view.scrollLeft/w*100)+'%';
    rect.style.top=(view.scrollTop/h*100)+'%';
    rect.style.width=Math.min(100,view.clientWidth/w*100)+'%';
    rect.style.height=Math.min(100,view.clientHeight/h*100)+'%';
  }

  /* Auf der Karte: der Punkt, den man greift, wird zur Mitte des
     Ausschnitts. Ein Klick reicht also auch. */
  function toPoint(e){
    var r=mview.getBoundingClientRect();
    if(!r.width||!r.height) return;
    view.scrollLeft=(e.clientX-r.left)/r.width*view.scrollWidth-view.clientWidth/2;
    view.scrollTop=(e.clientY-r.top)/r.height*view.scrollHeight-view.clientHeight/2;
    update();
  }
  map.addEventListener('pointerdown',function(e){
    if(e.button) return;
    e.preventDefault();
    box.classList.add('panned');
    /* Der Zeigerfang ist eine Bequemlichkeit — er hält das Ziehen
       fest, wenn die Maus die Karte verlässt. Scheitert er, wird
       trotzdem verschoben. */
    try{map.setPointerCapture(e.pointerId);}catch(err){}
    toPoint(e);
  });
  map.addEventListener('pointermove',function(e){
    if(map.hasPointerCapture&&map.hasPointerCapture(e.pointerId)) toPoint(e);
  });

  /* Im Ausschnitt selbst: nur mit der Maus. Auf dem Telefon rollt
     der Rahmen von sich aus waagerecht, und ein eigener Griff
     nähme der Seite das senkrechte Wischen. */
  var grab=null;
  view.addEventListener('pointerdown',function(e){
    if(e.pointerType!=='mouse'||e.button) return;
    grab={x:e.clientX,y:e.clientY,l:view.scrollLeft,t:view.scrollTop};
    try{view.setPointerCapture(e.pointerId);}catch(err){}
    box.classList.add('panned','grabbing');
    e.preventDefault();
  });
  view.addEventListener('pointermove',function(e){
    if(!grab) return;
    view.scrollLeft=grab.l-(e.clientX-grab.x);
    view.scrollTop=grab.t-(e.clientY-grab.y);
    update();
  });
  function drop(){grab=null;box.classList.remove('grabbing');}
  view.addEventListener('pointerup',drop);
  view.addEventListener('pointercancel',drop);

  view.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',measure);
  measure();
  /* Die Breite der Tabelle hängt an der Schrift; solange Zilla und
     Plex noch nicht da sind, misst man das falsche Maß. */
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(measure);
  each('img',function(im){
    if(!im.complete) im.addEventListener('load',measure);
  },view);
});

/* ── 4. Die Downloads ────────────────────────────────────────
   Die Plattformkarte öffnet ihre Kachelgruppe, ein zweiter Klick
   schließt sie wieder; die beiden Fakten erscheinen mit. Ohne
   JavaScript greift :target (siehe css/landing.css). */
(function(){
  var cards=[];
  each('[data-dl]',function(c){cards.push(c);});
  if(!cards.length) return;
  var extra=document.querySelector('.dlextra');
  function set(id){
    cards.forEach(function(c){
      var on=!!id&&c.getAttribute('data-dl')===id;
      c.setAttribute('aria-expanded',String(on));
      var p=document.getElementById(c.getAttribute('data-dl'));
      if(p) p.classList.toggle('open',on);
    });
    if(extra) extra.classList.toggle('open',!!id);
  }
  cards.forEach(function(c){
    c.addEventListener('click',function(e){
      e.preventDefault();
      var open=c.getAttribute('aria-expanded')==='true';
      set(open?null:c.getAttribute('data-dl'));
      if(!open){
        var p=document.getElementById(c.getAttribute('data-dl'));
        if(p) p.scrollIntoView({behavior:'smooth',block:'nearest'});
      }
    });
  });
})();

/* ── 5. Die Bewegung ─────────────────────────────────────────
   Eintreten beim Scrollen, Haken der Matrix, Leseweg oben. Ohne
   JavaScript und bei prefers-reduced-motion ist alles einfach
   sichtbar — die Startlagen gelten nur unter html.js. */
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.documentElement.classList.add('js');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}
    });
  },{threshold:.15,rootMargin:'0px 0px -40px 0px'});
  each('.reveal',function(el){io.observe(el);});
  var prog=document.getElementById('prog');
  if(prog) addEventListener('scroll',function(){
    var h=document.documentElement,max=h.scrollHeight-innerHeight;
    prog.style.width=(max>0?(h.scrollTop/max)*100:0)+'%';
  },{passive:true});
}
})();
