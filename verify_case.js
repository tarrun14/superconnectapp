const fs = require('fs');
const path = require('path');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for(const file of files) {
    const fullPath = path.join(dir, file);
    if(fs.statSync(fullPath).isDirectory()) {
      checkDir(fullPath);
    } else if(fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const imports = content.match(/import.*?from\s+['"](.*?)['"]/g);
      if(imports) {
        for(const imp of imports) {
          const match = imp.match(/from\s+['"](.*?)['"]/);
          if(match && match[1].startsWith('.')) {
            const dirName = path.dirname(fullPath);
            const targetPath = path.resolve(dirName, match[1]);
            let found = false;
            for (const ext of ['', '.js', '.jsx', '/index.js', '/index.jsx', '.css', '.svg']) {
              if(fs.existsSync(targetPath + ext)) {
                const basename = path.basename(targetPath + ext);
                const realdirPath = path.dirname(targetPath + ext);
                try {
                  const realdir = fs.readdirSync(realdirPath);
                  if(!realdir.includes(basename)) {
                    console.log('CASE MISMATCH:', fullPath, '->', targetPath + ext);
                  }
                } catch(e) {}
                found = true;
                break;
              }
            }
            if(!found) {
                console.log('FILE NOT FOUND:', fullPath, '->', match[1]);
            }
          }
        }
      }
    }
  }
}
checkDir('./src');
console.log('Done.');
