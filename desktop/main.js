/* ══════════════════════════════════════════════════════════════
   FINA — der Rahmen um die Webdateien

   Die Anwendung selbst liegt unverändert in app/ (Kopie der
   Dateien daneben, gebaut von sync.mjs). Diese Datei gibt ihr ein
   Fenster, ein Menü und die drei Dinge, die eine Seite im Browser
   vom Browser bekommt und in einer App von niemandem: wohin
   fremde Links gehen, was beim Schließen passiert und dass es
   genau ein Fenster gibt.

   **Hier steht kein Verhalten der Anwendung.** Wer etwas an FINA
   ändert, ändert es in js/ und css/ — was hier steht, gilt nur
   dafür, dass FINA außerhalb eines Browsers läuft.
   ══════════════════════════════════════════════════════════════ */
const {app, BrowserWindow, Menu, shell, dialog} = require('electron');
const path = require('node:path');

let win = null, darfSchliessen = false;

/* Die Sprache der Oberfläche steht in der Datei des Nutzers
   (state.lang) — die kennt der Hauptprozess nicht, und beim Bauen
   des Menüs ist noch gar keine geladen. Für die zwei Stellen, an
   denen hier Text steht, genügt die Sprache des Systems. */
const de = () => app.getLocale().startsWith('de');
const T = {
  hilfe:   () => de() ? 'Hilfe' : 'Help',
  imWeb:   () => de() ? 'FINA Book im Web' : 'FINA Book on the web',
  frage:   () => de() ? 'Es gibt ungespeicherte Änderungen.'
                      : 'There are unsaved changes.',
  detail:  () => de() ? 'Wenn du jetzt schließt, gehen sie verloren.'
                      : 'If you close now, they are lost.',
  abbruch: () => de() ? 'Abbrechen' : 'Cancel',
  trotzdem:() => de() ? 'Trotzdem schließen' : 'Close anyway'
};

const WEB = 'https://linked2ag.github.io/FINA/';

function fenster() {
  win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 900, minHeight: 600,
    title: 'FINA Book',
    /* Der Papiergrund der Anwendung (--paper in css/tokens.css).
       Ohne ihn blitzt das Fenster beim Öffnen weiß auf. */
    backgroundColor: '#E9EAE3',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  /* ── Fenster, die die Seite selbst öffnet ──────────────────────
     about:blank  — die Anleitung über die ganze Seite. Sie öffnet
                    window.open('','_blank') und schreibt mit
                    document.write hinein (js/dialogs/guide.js).
                    Das bleibt in der App: es ist FINAs eigener
                    Inhalt, nur größer.
     http(s)      — die zugehörigen Links einer Position und der
                    Weg zur Downloadseite. Die gehören in den
                    Browser des Nutzers und nicht in ein Fenster
                    ohne Adresszeile: dort sähe man nicht, wo man
                    gelandet ist. */
  win.webContents.setWindowOpenHandler(({url}) => {
    if (url === 'about:blank') return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 1100, height: 940, autoHideMenuBar: true,
        backgroundColor: '#E9EAE3',
        webPreferences: {contextIsolation: true, nodeIntegration: false}
      }
    };
    if (/^https?:/.test(url)) shell.openExternal(url);
    return {action: 'deny'};
  });

  /* Auch ein Link ohne target="_blank" darf das App-Fenster nicht
     wegnavigieren — danach stünde FINA nicht mehr darin, und
     zurück käme man nur über einen Neustart. */
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) { e.preventDefault(); shell.openExternal(url); }
  });

  /* ── Ungespeicherte Änderungen ─────────────────────────────────
     Gefragt wird hier und nicht in der Seite: in Electron greift
     `beforeunload` unzuverlässig, und ein gesetztes `returnValue`
     kann das Fenster **stumm** am Schließen hindern — die App
     ließe sich dann nicht mehr beenden. js/storage.js hält sich
     deshalb zurück, sobald window.FINA_NATIVE gesetzt ist.

     `dirty` ist eine Variable auf oberster Ebene in js/storage.js
     und damit im Hauptkontext der Seite lesbar. Ist sie aus
     irgendeinem Grund nicht da, wird nicht gefragt: eine App, die
     sich nicht schließen lässt, ist schlimmer als eine, die einmal
     nicht nachfragt. */
  win.on('close', async e => {
    if (darfSchliessen) return;
    e.preventDefault();
    const offen = await win.webContents
      .executeJavaScript('typeof dirty !== "undefined" && dirty')
      .catch(() => false);
    if (offen) {
      const {response} = await dialog.showMessageBox(win, {
        type: 'warning', defaultId: 0, cancelId: 0,
        buttons: [T.abbruch(), T.trotzdem()],
        message: T.frage(), detail: T.detail()
      });
      if (response === 0) return;
    }
    darfSchliessen = true;
    win.close();
  });
}

/* ── Menü ──────────────────────────────────────────────────────
   Die Rollen müssen drin bleiben: ohne `editMenu` funktionieren
   Cmd+C und Cmd+V auf dem Mac nicht mehr — die Zwischenablage
   hängt dort am Menü, nicht am Fenster. Die Tastengriffe der
   Anwendung (Strg/Cmd+Umschalt+M/Y/F/D, VIEW_KEYS in js/app.js)
   kollidieren mit keinem Standardgriff. */
function menue() {
  const mac = process.platform === 'darwin';
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(mac ? [{role: 'appMenu'}] : []),
    {role: 'fileMenu'}, {role: 'editMenu'},
    {role: 'viewMenu'}, {role: 'windowMenu'},
    {role: 'help', submenu: [
      {label: T.imWeb(), click: () => shell.openExternal(WEB)}
    ]}
  ]));
}

/* Zwei Fenster auf dieselbe Datei wären zwei Stände desselben
   Buches — und das zweite überschriebe beim Speichern, was das
   erste gerade eingetragen hat. */
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => {
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});

app.whenReady().then(() => {
  menue(); fenster();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) fenster(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
