const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('import React, {') || content.includes('import React from') || content.includes('import React {') || content.includes('import React,')) {
      content = content.replace(/import React, {/g, 'import {');
      content = content.replace(/import React from ['"]react['"];?\r?\n/g, '');
      content = content.replace(/import React, /g, 'import ');
      changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
  }
});

let viteConfig = fs.readFileSync('vite.config.js', 'utf8');
if (!viteConfig.includes('/* global process */')) {
  viteConfig = '/* global process */\n' + viteConfig;
  fs.writeFileSync('vite.config.js', viteConfig);
}

console.log('Done fixing unused React imports and vite.config.js');
