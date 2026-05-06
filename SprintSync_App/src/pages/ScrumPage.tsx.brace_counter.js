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
    if (i + 1 >= 346 && i + 1 <= 5000) {
        if (level === 0 || level === 1) {
            console.log(`Line ${i + 1}: Level ${level} - ${line.trim()}`);
        }
    }
}
