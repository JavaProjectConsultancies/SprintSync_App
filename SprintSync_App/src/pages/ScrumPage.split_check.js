import fs from 'fs';

const content = fs.readFileSync('c:/Users/snakhate/Music/SprintSync_App/SprintSync_App/src/pages/ScrumPage.tsx', 'utf8');
const lines = content.split('\n');

let level = 0;
let splitPoint = -1;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '{') level++;
        if (char === '}') level--;
    }
    if (i + 1 > 346 && i + 1 < 18600) {
        if (level === 0) {
            console.log(`SPLIT at line ${i + 1}: ${line.trim()}`);
            splitPoint = i + 1;
        }
    }
}

if (splitPoint === -1) {
    console.log("No split found between 346 and 18600");
}
