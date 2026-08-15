# desktop/ — FINA Book für Mac und Windows

Hier steht der **Rahmen**, nicht die Anwendung. FINA selbst liegt eine Ebene höher in
`index.html`, `css/` und `js/`; dieser Ordner packt genau diese Dateien in ein Fenster,
das ohne Browser auskommt.

Wer an FINA etwas ändert, ändert es oben. Wer etwas daran ändert, **dass** FINA außerhalb
eines Browsers läuft, ändert es hier.

```
desktop/
├── package.json   Abhängigkeiten und Bauanleitung (electron-builder)
├── main.js        Fenster, Menü, Rückfrage beim Schließen, fremde Links
├── preload.js     die eine Brücke zur Seite: window.FINA_NATIVE
├── sync.mjs       kopiert die Webdateien nach app/ und zieht die Version nach
├── build/
│   ├── icon.html  die Quelle des Symbols (Farben und Schrift aus css/tokens.css)
│   └── icon.png   legt sync.mjs hierher   nicht im Repository
├── app/           Kopie der Webdateien          nicht im Repository
├── node_modules/                                nicht im Repository
└── dist/          die fertigen DMG/EXE          nicht im Repository
```

## Bauen

```sh
cd desktop
npm install          # einmalig
npm start            # zum Ansehen — baut app/ neu und startet Electron
npm run pack         # nur entpackt, am schnellsten
npm run dist:mac     # die beiden DMG-Dateien
npm run dist:win     # die portable EXE und den Installer
```

Jeder dieser Befehle ruft zuerst `sync.mjs` auf: `app/` entsteht frisch aus den Dateien
daneben, und `package.json` bekommt die Versionsnummer aus `js/config.js`. **Eine Zahl,
eine Stelle** — `VERSION` dort ist die Wahrheit, alles andere leitet sich ab.

**Ein Bild, eine Stelle.** Dasselbe gilt für das Symbol: gezeichnet wird `icon.png` im
Projektstamm — die Webseite trägt es im Reiter, `sync.mjs` legt es vor jedem Bau nach
`build/`, wo electron-builder es sucht und .icns und .ico daraus macht. Neu gezeichnet
wird es aus `build/icon.html`; der Befehl dafür steht oben in dieser Datei.

Ein Windows-Rechner wird nicht gebraucht: `.github/workflows/desktop.yml` baut beides auf
GitHub Actions.

> **In VS Code läuft `npm start` nicht.** Das Terminal der Erweiterung erbt
> `ELECTRON_RUN_AS_NODE=1`; damit verhält sich jede Electron-Binary wie reines Node, und
> `require('electron')` gibt einen Pfad statt der API zurück. Der Fehler lautet dann
> `Cannot read properties of undefined (reading 'requestSingleInstanceLock')`. Abhilfe:
> `env -u ELECTRON_RUN_AS_NODE npm start` — oder ein Terminal außerhalb von VS Code.

## Die drei Fassungen und ihre zwei Kanäle

**Die Webseite bekommt jede Version. Die Apps bekommen die, die man ihnen ausdrücklich
gibt.**

```
git push                              →  Pages-Workflow    →  Webseite ist aktuell
git tag v26.8.15 && git push --tags   →  Desktop-Workflow  →  DMG + EXE
```

Web und Apps laufen dabei auseinander — Webseite auf 26.9.7, Apps auf 26.8.15. Das ist
kein Fehler, sondern ein Kanal. Drei Dinge hängen daran:

**`version.json` beschreibt den App-Kanal, nicht die Webseite.** Stünde dort die
Webversion, meldete jeder Push allen installierten Apps ein Update, das es als Download
gar nicht gibt.

**Der Guide friert von selbst richtig ein.** Die App trägt die Kopie der Webdateien vom Tag
ihres Baus; ihr Reiter „Was ist neu" endet also bei ihrer eigenen Fassung. Dafür ist nichts
zu tun.

**`migrate()` darf niemals zu einer Positivliste werden.** `migrate(s)` in `js/state.js`
flickt das übergebene Objekt an Ort und Stelle und baut es **nicht** aus bekannten Feldern
neu auf. Unbekannte Felder überleben deshalb, und `JSON.stringify(state)` schreibt sie
wieder hinaus — **dadurch kann eine Datei zwischen den Kanälen wandern**: wer in der
neueren Webfassung arbeitet und dieselbe Datei später in der älteren App öffnet und
speichert, verliert nichts. Wer `migrate()` als „neues Objekt aus den bekannten Feldern"
umschreibt — was sauberer aussieht —, zerstört das lautlos, und der Datenverlust fällt erst
Wochen später auf.

## Der Ablauf einer Veröffentlichung

1. `VERSION` in `js/config.js` hochsetzen (Jahr.Monat.Tag, drei Stellen)
2. commit + push → **Webseite ist aktuell**
3. `git tag v26.8.15 && git push --tags` → GitHub baut DMG und EXE
4. Die Artefakte herunterladen und als **Release-Assets** anhängen, samt
   `SHA256SUMS.txt`
5. `download/index.html` nachziehen: Version, Größe, Datum
6. **Erst jetzt** `version.json` hochsetzen und pushen → die Apps melden das Update

Schritt 6 kommt bewusst zuletzt. Zwischen Marke und fertigem Paket liegen Minuten Bauzeit —
meldet man das Update vorher, schickt man Leute auf eine Seite, auf der noch nichts liegt.

## Unsigniert — und was das kostet

`"identity": null` und `"hardenedRuntime": false` in `package.json` sind die **unsignierte**
Einstellung. Sie kostet 0 € und den Nutzer ein paar Klicks beim ersten Start; die
Downloadseite erklärt sie Schritt für Schritt.

**Windows** ist harmlos: „Der Computer wurde durch Windows geschützt" → „Weitere
Informationen" → „Trotzdem ausführen".

**macOS ist die eigentliche Hürde.** Seit macOS 15 gibt es den alten Weg (Rechtsklick →
„Öffnen") nicht mehr. Der Nutzer bekommt beim Doppelklick nur „In den Papierkorb legen"
angeboten und muss danach in die Systemeinstellungen. Sechs Schritte, und der zweite sagt
wörtlich, das Programm könnte Schadsoftware sein — bei einem Kassenbuch besonders bitter.

Sobald das Apple-Zertifikat da ist (99 €/Jahr, auch für die Verbreitung über die eigene
Seite nötig), ändern sich drei Dinge:

```json
"mac": {
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.plist",
  "notarize": true
}
```

`identity` fällt weg, und `build/entitlements.mac.plist` kommt dazu — **ohne diese Datei
startet die signierte App unter der Hardened Runtime nicht**, weil Chromium JIT braucht:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key><true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
  <key>com.apple.security.cs.disable-library-validation</key><true/>
</dict>
</plist>
```

Dazu fünf Secrets im Workflow: `APPLE_CERT_P12_BASE64`, `APPLE_CERT_PASSWORD`, `APPLE_ID`,
`APPLE_APP_PASSWORD` (ein app-spezifisches Kennwort, nicht das echte) und `APPLE_TEAM_ID`.

**Warum `portable` *und* `nsis` unter Windows:** die portable EXE ist das Gewünschte — eine
Datei, kein Installieren, läuft vom USB-Stick. Sie kann aber **nie** automatisch
aktualisieren. Der NSIS-Installer kostet zwei Zeilen und hält den Weg dorthin offen.

## Prüfliste vor einem Paket

Die „Prüfen"-Liste aus `CLAUDE.md`, ergänzt um das, was nur in Electron schiefgehen kann:

1. Start ohne Datei — Begrüßungsseite, nichts stürzt ab
2. „Daten laden" öffnet den Dateidialog und liest eine echte JSON-Datei
3. **„Daten speichern" schreibt in dieselbe Datei zurück** — danach im Finder ansehen: hat
   sie Inhalt?
4. „Sicherung speichern" — wo landet die Datei ohne Download-Ordner?
5. Alle Ansichten, beide Sprachen
6. Anleitung aufklappen, **Bilder werden angezeigt** (`doc/img/` ist mitgekommen)
7. **Anleitung über die ganze Seite** (`#gFull`) — öffnet sie sich?
8. Ein zugehöriger Link — öffnet er im **Browser**, nicht in der App?
9. **Cmd+C / Cmd+V** in einem Eingabefeld
10. Strg/Cmd+Umschalt+M/Y/F/D springen in die Ansichten
11. **Fenster schließen bei ungespeicherten Änderungen** — kommt die Rückfrage, und lässt
    sich beides, abbrechen *und* schließen?
12. **Netzwerk abschalten und neu starten** — sehen die Schriften richtig aus?
13. CSV-Import und FINA-Tabellen-Import
14. Speichern, schließen, wieder öffnen — steht alles noch da?

**Punkt 3 ist der kritische.** Electron unterstützt die File System Access API, aber es gab
dazu wiederholt Meldungen über leere Dateien und Rechte-Ausnahmen. Läuft es nicht, ist der
Ausweg klar und sogar der schönere: `dialog.showSaveDialog` plus `fs.writeFile` im
Hauptprozess, über `preload.js` angeboten, und in `js/storage.js` ein dritter Zweig neben
`canFS` und Download. Aufwand etwa ein halber Tag — und „zuletzt geöffnet" bekäme man
gleich mit dazu.

Punkt 11 und 12 sind die anderen beiden, an denen es hängen wird.
