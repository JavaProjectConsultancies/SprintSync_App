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
    if (level === 0 && i > 346) {
        console.log(`SCOPE BREAK at line ${i + 1}: ${line.trim()}`);
        // Log a few lines before and after
        for (let j = Math.max(0, i - 10); j <= Math.min(lines.length - 1, i + 10); j++) {
            console.log(`${j + 1}: ${lines[j]}`);
        }
        process.exit(0);
    }
}
console.log("No scope break found.");
