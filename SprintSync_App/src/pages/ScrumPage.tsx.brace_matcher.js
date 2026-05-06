import fs from 'fs';

const content = fs.readFileSync('c:/Users/snakhate/Music/SprintSync_App/SprintSync_App/src/pages/ScrumPage.tsx', 'utf8');
const lines = content.split('\n');

let level = 0;
let componentStartLine = 346;
let matchingBraceLine = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '{') {
            level++;
        }
        if (char === '}') {
            level--;
            if (i + 1 >= componentStartLine && level === 0) {
                matchingBraceLine = i + 1;
                console.log(`MATCHING BRACE for line ${componentStartLine} found at line ${matchingBraceLine}`);
                console.log(`Line ${matchingBraceLine}: ${line}`);
                break;
            }
        }
    }
    if (matchingBraceLine !== -1) break;
}
if (matchingBraceLine === -1) console.log("No matching brace found!");
