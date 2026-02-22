import { readFileSync, writeFileSync } from 'fs';
const p = 'd:/phado/next-app/src/data/family_data.json';
const raw = readFileSync(p, 'utf8');
const nfc = raw.normalize('NFC');
writeFileSync(p, nfc, 'utf8');
console.log('NFC normalization done.');
console.log('Before bytes:', Buffer.byteLength(raw));
console.log('After bytes:', Buffer.byteLength(nfc));
console.log('Changed:', raw !== nfc);
