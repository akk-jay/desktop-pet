// 将 ES 模块项目打包成单文件 HTML，支持双击直接运行
import { readFileSync, writeFileSync } from 'fs';

const files = [
  'src/constants.js',
  'src/sprites.js',
  'src/pet.js',
  'src/renderer.js',
  'src/physics.js',
  'src/state.js',
  'src/input.js',
  'src/main.js',
];

const css = readFileSync('styles/main.css', 'utf-8');

let js = '';
for (const file of files) {
  let content = readFileSync(file, 'utf-8');

  // 去掉多行 import 语句（包括跨行的）
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/g, '');
  // 去掉单行 import 语句
  content = content.replace(/import\s+\w+\s+from\s*['"][^'"]+['"]\s*;?/g, '');
  // 去掉 import '...' 或 import "..." 形式的副作用导入
  content = content.replace(/import\s+['"][^'"]+['"]\s*;?/g, '');

  // 去掉 export { ... } 语句
  content = content.replace(/export\s*\{[^}]*\}\s*;?/g, '');
  // 去掉 export default
  content = content.replace(/export\s+default\s+/g, '');
  // 去掉 export（保留后面的 class/const/function）
  content = content.replace(/\bexport\s+(?=class\b|const\b|function\b|let\b|var\b)/g, '');

  js += content + '\n';
}

// 验证语法
try {
  new Function('"use strict";\n' + js);
  console.log('JS syntax: OK');
} catch (e) {
  console.log('JS syntax ERROR:', e.message);
  // 写入临时文件用 node --check 定位
  writeFileSync('_debug.js', '"use strict";\n' + js);
  const { execSync } = require('child_process');
  try {
    execSync('node --check _debug.js', { shell: true, stdio: 'pipe' });
  } catch (e2) {
    console.log(e2.stderr ? e2.stderr.toString().trim() : e2.message);
  }
  process.exit(1);
}

const finalCss = css.replace('background: #87CEEB;', 'background: transparent;');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>桌面宠物</title>
<style>${finalCss}</style>
</head>
<body>
<canvas id="pet-canvas"></canvas>
<script>
"use strict";
${js}
<\/script>
</body>
</html>`;

writeFileSync('桌面宠物.html', html, 'utf-8');
console.log('Done! Created 桌面宠物.html');
console.log('File size:', (Buffer.byteLength(html) / 1024).toFixed(1), 'KB');
