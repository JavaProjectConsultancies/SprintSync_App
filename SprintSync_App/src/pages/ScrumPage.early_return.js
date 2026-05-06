import fs from 'fs';

const content = fs.readFileSync('c:/Users/snakhate/Music/SprintSync_App/SprintSync_App/src/pages/ScrumPage.tsx', 'utf8');
const lines = content.split('\n');

let level = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let prevLevel = level;
    for (let char of line) {
        if (char === '{') level++;
        if (char === '}') level--;
    }
    if (prevLevel === 1 && line.trim().startsWith('return;') && i + 1 > 346 && i + 1 < 8869) {
        console.log(`EARLY RETURN found at line ${i + 1}: ${line.trim()}`);
    }
}
