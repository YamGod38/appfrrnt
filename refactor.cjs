const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
let changed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:5000')) {
        // Replace string literals
        content = content.replace(/'http:\/\/localhost:5000/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000') + '");
        // Replace template literals
        content = content.replace(/`http:\/\/localhost:5000/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}` + `");
        
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
        changed++;
    }
});

console.log('Total files updated: ' + changed);
