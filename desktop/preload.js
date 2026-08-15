/* ══════════════════════════════════════════════════════════════
   FINA — die eine Brücke zur Seite

   Mehr geht hier nicht durch: die Anwendung ist reines Web und
   braucht keinen Zugriff auf Node. Was die Seite wissen muss, ist
   ein einziges Ja — dass sie in der App läuft und nicht im
   Browser. Daran hängen zwei Dinge:

     js/storage.js   `beforeunload` fragt dann **nicht** selbst; in
                     Electron greift es unzuverlässig und kann das
                     Fenster stumm am Schließen hindern. Gefragt
                     wird im Hauptprozess (main.js).
     js/app.js       nur die App fragt nach einer neueren Fassung.
                     Die Seite im Browser ist immer die neueste.

   `contextIsolation` bleibt an, `nodeIntegration` aus, `sandbox`
   an — bei einem Kassenbuch ist das keine Frage der Bequemlichkeit.
   ══════════════════════════════════════════════════════════════ */
const {contextBridge} = require('electron');

contextBridge.exposeInMainWorld('FINA_NATIVE', true);
