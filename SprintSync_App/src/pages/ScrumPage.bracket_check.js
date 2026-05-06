import fs from 'fs';

const content = fs.readFileSync('c:/Users/snakhate/Music/SprintSync_App/SprintSync_App/src/pages/ScrumPage.tsx', 'utf8');

let braceLevel = 0;
let parenLevel = 0;
let bracketLevel = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') braceLevel++;
    if (char === '}') braceLevel--;
    if (char === '(') parenLevel++;
    if (char === ')') parenLevel--;
    if (char === '[') bracketLevel++;
    if (char === ']') bracketLevel--;
    
    if (braceLevel < 0 || parenLevel < 0 || bracketLevel < 0) {
        console.log(`NEGATIVE LEVEL at index ${i}: Brace ${braceLevel}, Paren ${parenLevel}, Bracket ${bracketLevel}`);
        break;
    }
}

console.log(`FINAL LEVELS: Brace ${braceLevel}, Paren ${parenLevel}, Bracket ${bracketLevel}`);
