import fs from 'fs';

const content = fs.readFileSync('c:/Users/snakhate/Music/SprintSync_App/SprintSync_App/src/pages/ScrumPage.tsx', 'utf8');
const index = 22277;

let line = 1;
let col = 1;
for (let i = 0; i < index; i++) {
    if (content[i] === '\n') {
        line++;
        col = 1;
    } else {
        col++;
    }
}

console.log(`Index ${index} is at Line ${line}, Col ${col}`);
console.log(`Surrounding text: ${content.substring(index - 20, index + 20)}`);
