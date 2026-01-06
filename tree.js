const fs = require('fs');
const path = require('path');

function generateTree(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  const tree = [];
  
  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const stats = fs.statSync(filePath);
    const isDirectory = stats.isDirectory();
    
    // Пропускаем node_modules и другие ненужные папки
    if (file === 'node_modules' || file === '.git' || file === 'build' || file === 'dist') {
      return;
    }
    
    const connector = isLast ? '└── ' : '├── ';
    tree.push(`${prefix}${connector}${file}`);
    
    if (isDirectory) {
      const extension = prefix + (isLast ? '    ' : '│   ');
      tree.push(...generateTree(filePath, extension));
    }
  });
  
  return tree;
}

console.log('.');
const tree = generateTree('.');
console.log(tree.join('\n'));