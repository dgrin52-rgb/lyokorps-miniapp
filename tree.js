const fs = require('fs');
const path = require('path');

const IGNORE = new Set([
  'node_modules',
  '.git',
  'build',
  'dist',
  '.next',
  '.cache',
]);

function generateTree(dir, prefix = '') {
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return [`${prefix}└── [no access]`];
  }

  // сортируем: папки → файлы
  entries = entries
    .filter(entry => !IGNORE.has(entry.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  const tree = [];

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const entryPath = path.join(dir, entry.name);

    tree.push(`${prefix}${connector}${entry.name}`);

    if (entry.isDirectory()) {
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      tree.push(...generateTree(entryPath, nextPrefix));
    }
  });

  return tree;
}
