// 将 ES 模块项目打包成单文件 HTML，支持双击直接运行
import { readFileSync, writeFileSync } from 'fs';

// 依赖顺序：被依赖的文件必须先加载
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

// 拼接所有 JS，去掉 import/export
let js = '';
for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  // 去掉 import 语句
  content = content.replace(/^import\s+.*$/gm, '');
  // 去掉 export 关键字（保留后面的内容）
  content = content.replace(/^export\s+/gm, '');
  js += content + '\n';
}

// CSS 中把背景色改透明（适合桌宠覆盖在桌面上）
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
${js}
<\/script>
</body>
</html>`;

writeFileSync('桌面宠物.html', html, 'utf-8');
console.log('Done! Created 桌面宠物.html');
console.log('File size:', (Buffer.byteLength(html) / 1024).toFixed(1), 'KB');
