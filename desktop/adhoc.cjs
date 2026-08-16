/* ══════════════════════════════════════════════════════════════
   macOS: Ad-hoc-Signatur nach dem Packen (afterPack).

   Ohne Entwicklerzertifikat ließ `identity: null` die App früher
   GANZ unsigniert — und eine unsignierte App startet auf Apple
   Silicon überhaupt nicht: macOS meldet „beschädigt und sollte in
   den Papierkorb gelegt werden", was wie ein kaputter Download
   aussieht, aber Gatekeeper ist.

   Die Ad-hoc-Signatur (`codesign -s -`) beglaubigt nichts — sie
   macht die App nur startbar. Beim ersten Öffnen fragt macOS dann
   wie erwartet nach („unbekannter Entwickler" → „Trotzdem
   öffnen"), genau wie es die Downloadhilfe auf der Startseite
   beschreibt. Der echte Ausweg bleibt die Signatur samt
   Notarisierung über das Apple Developer Program (siehe Plan).

   Für eine BEREITS geladene, unsignierte Fassung hilft dem Nutzer
   nur:  xattr -cr "/Applications/FINA Book.app"
   ══════════════════════════════════════════════════════════════ */
'use strict';
const {execSync} = require('child_process');
const path = require('path');

module.exports = async function afterPack(context){
  if(context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`);
  execSync(`codesign --force --deep --sign - "${app}"`, {stdio: 'inherit'});
  execSync(`codesign --verify --deep "${app}"`, {stdio: 'inherit'});
};
