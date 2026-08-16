/* ══════════════════════════════════════════════════════════════
   FINA — die Webdateien in die App kopieren

   Baut desktop/app/ neu aus den Dateien daneben und hält die
   Versionsnummer in package.json mit js/config.js gleich. Läuft
   vor jedem Start und vor jedem Paket (siehe "scripts").

   **Warum eine Kopie und kein Verweis nach oben.** electron-builder
   könnte über `files: [{from:'..'}]` aus dem Elternordner packen,
   das ist aber der wackligste Teil seiner Konfiguration. Zehn
   Zeilen Node sind durchschaubar, laufen auf Mac und Windows
   gleich und lassen sich anschauen, wenn etwas fehlt.

   **app/ steht nicht im Repository** (.gitignore): es ist eine
   Kopie von Dateien, die daneben schon liegen.
   ══════════════════════════════════════════════════════════════ */
import {cpSync, rmSync, readFileSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src  = join(here, '..');
const dst  = join(here, 'app');

/* Was die App braucht — und nur das.

   `css/` bringt seit August 2026 die Schriften mit (css/fonts/):
   ohne sie sähe die App ohne Internet anders aus, als sie soll.
   Das ist der eigentliche Grund, warum sie überhaupt beiliegen.

   `doc/img` gehört dazu, weil die Anleitung ihre Bilder von dort
   lädt (gshot() in js/dialogs/guide.js). Alles Übrige aus doc/
   nicht — GUIDE-TODO.md und make-shots.py sind Arbeitsdateien.

   `LICENSE` liegt bei, weil eine ausgelieferte Anwendung sagen
   muss, unter welchen Bedingungen sie benutzt werden darf. */
const NIMM = ['css', 'js', 'icon.png', 'LICENSE', join('doc', 'img')];

rmSync(dst, {recursive: true, force: true});
for (const p of NIMM) cpSync(join(src, p), join(dst, p), {recursive: true});
/* Die Anwendung heißt im Stamm Webclient.html — index.html ist
   dort die Startseite (Verkauf, Downloads). Die App lädt weiter
   app/index.html (main.js), deshalb wird beim Kopieren umbenannt:
   so bleibt main.js unberührt, und in die App gelangt nie die
   Verkaufsseite. */
cpSync(join(src, 'Webclient.html'), join(dst, 'index.html'));

/* ── Das Symbol, eine Datei ──────────────────────────────────
   `icon.png` im Stamm ist beides: das Zeichen der Webseite und
   die Vorlage, aus der electron-builder .icns und .ico macht.
   Gesucht wird es dort, wo `buildResources` hinzeigt — also legen
   wir es vor jedem Bau dorthin, statt eine zweite Kopie im
   Repository zu führen, die still auseinanderliefe. Gezeichnet
   wird es aus build/icon.html (siehe dort). */
cpSync(join(src, 'icon.png'), join(here, 'build', 'icon.png'));

/* ── Eine Zahl, eine Stelle ──────────────────────────────────
   js/config.js ist die Wahrheit; package.json wird nachgezogen.
   Umgekehrt ginge auch — nur wüsste die Anwendung dann nicht,
   welche Fassung sie ist, und genau das braucht die
   Update-Hinweisleiste.

   **Dreiteilig, Jahr.Monat.Tag.** Eine vierte Stelle (`26.8.13.1`)
   ist kein gültiges semver; electron-builder weist sie zurück.
   Deshalb wird hier nicht nur gelesen, sondern auch geprüft. */
const conf = readFileSync(join(src, 'js', 'config.js'), 'utf8');
const v = conf.match(/const\s+VERSION\s*=\s*'([\d.]+)'/)?.[1];
if (!v) {
  console.error('FEHLER: VERSION nicht in js/config.js gefunden');
  process.exit(1);
}
if (!/^\d+\.\d+\.\d+$/.test(v)) {
  console.error(`FEHLER: VERSION '${v}' hat nicht die Form Jahr.Monat.Tag —`);
  console.error('        electron-builder braucht drei Stellen (siehe js/config.js).');
  process.exit(1);
}

const pkgPfad = join(here, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPfad, 'utf8'));
if (pkg.version !== v) {
  pkg.version = v;
  writeFileSync(pkgPfad, JSON.stringify(pkg, null, 2) + '\n');
  console.log('package.json auf', v, 'gesetzt');
}
console.log(`app/ neu gebaut (${v}):`, NIMM.join(', '));
