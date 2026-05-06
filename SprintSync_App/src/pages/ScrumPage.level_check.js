import fs from 'fs';

const content = fs.readFileSync('c:/Users/snakhate/Music/SprintSync_App/SprintSync_App/src/pages/ScrumPage.tsx', 'utf8');
const lines = content.split('\n');

let level = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '{') level++;
        if (char === '}') level--;
    }
    if (i + 1 === 5000) {
        console.log(`Line 5000: Level ${level}`);
    }
    if (i + 1 === 10000) {
        console.log(`Line 10000: Level ${level}`);
    }
}
