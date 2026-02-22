import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walkDir(dir, ext) {
    let results = [];
    for (const f of readdirSync(dir)) {
        const full = join(dir, f);
        if (f === 'node_modules' || f === '.next' || f === '.git') continue;
        const stat = statSync(full);
        if (stat.isDirectory()) {
            results = results.concat(walkDir(full, ext));
        } else if (ext.some(e => full.endsWith(e))) {
            results.push(full);
        }
    }
    return results;
}

const files = walkDir('d:/phado/next-app/src', ['.tsx', '.ts', '.css', '.json']);
let totalChanged = 0;

for (const file of files) {
    const raw = readFileSync(file, 'utf8');
    const nfc = raw.normalize('NFC');
    if (raw !== nfc) {
        writeFileSync(file, nfc, 'utf8');
        totalChanged++;
        console.log(`FIXED: ${file}`);
        console.log(`  Before: ${Buffer.byteLength(raw)} bytes → After: ${Buffer.byteLength(nfc)} bytes`);
    }
}

console.log(`\nDone. ${totalChanged} files normalized to NFC out of ${files.length} total.`);
