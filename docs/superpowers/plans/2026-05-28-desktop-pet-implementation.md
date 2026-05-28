# Desktop Pet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pixel-art creature that lives in a browser window — walks, blinks, reacts to clicks, falls with gravity when dragged, and changes mood based on interaction.

**Architecture:** Vite dev server serves static HTML/JS/CSS. A single `<canvas>` element fills the browser window. A `requestAnimationFrame` game loop drives update-then-render each frame. Seven small JS modules (pet entity, renderer, physics, state machine, input, constants, main loop) each own one responsibility and communicate through the pet object.

**Tech Stack:** Vite 5 (dev server + build), vanilla JavaScript (ES Modules), Canvas 2D API

---

## File Map

| File | Create/Modify | Responsibility |
|------|---------------|----------------|
| `package.json` | Create | Project identity, scripts, single dependency (Vite) |
| `vite.config.js` | Create | Dev server behavior |
| `index.html` | Create | Single `<canvas>` element, loads CSS and JS |
| `styles/main.css` | Create | Fullscreen transparent canvas |
| `src/constants.js` | Create | All tunable numbers in one place |
| `src/pet.js` | Create | Pet data object — position, velocity, mood, animation state |
| `src/sprites.js` | Create | Pixel art data — 2D arrays for every animation frame |
| `src/renderer.js` | Create | Reads sprite data + pet state → draws pixels on Canvas |
| `src/physics.js` | Create | Gravity + ground collision + wall bounce |
| `src/input.js` | Create | Mouse event listeners → modifies pet state |
| `src/state.js` | Create | Emotion transition rules → sets pet.mood |
| `src/main.js` | Create | Orchestrator — wires everything into the game loop |

---

### Task 0: Scaffold the Vite project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `styles/main.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "desktop-pet",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
```

**Why `"type": "module"`?** 告诉 Node.js 我们使用 `import/export` 语法而不是老式的 `require()`。这是现代 JS 的标准写法。

**Why Vite 只有一个依赖？** Vite 本身内置了所有需要的功能（开发服务器、热更新、打包），不需要像老工具那样装一堆插件。

- [ ] **Step 2: Install dependencies**

Run: `npm install` (在项目根目录 `C:\Users\29542\Desktop\桌宠`)

Expected: 下载 Vite 到 `node_modules/`，生成 `package-lock.json`

- [ ] **Step 3: Create vite.config.js**

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true
  }
});
```

**Why `open: true`?** 运行 `npm run dev` 时自动打开浏览器，少一步手动操作。

- [ ] **Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>桌面宠物</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <canvas id="pet-canvas"></canvas>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**关键点：**
- `<canvas id="pet-canvas">` — 宠物的整个"世界"就是这一张画布
- `<script type="module">` — `type="module"` 让我们能在 JS 里用 `import` 语法
- `href="/styles/main.css"` — 开头的 `/` 表示"从项目根目录开始找"，不是相对路径

- [ ] **Step 5: Create styles/main.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #87CEEB;
}

#pet-canvas {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

**Why `background: #87CEEB`（天蓝色）?** 开发阶段设一个背景色，方便看到 Canvas 的范围。后续 Phase 2 做桌面悬浮时会改成透明。

**Why `overflow: hidden`?** 防止页面出现滚动条——宠物世界不需要滚动。

**Why `position: fixed`?** 让 Canvas 始终铺满整个窗口，即使窗口大小改变也不会有白边。

- [ ] **Step 6: Verify scaffold works**

Create a temporary `src/main.js`:
```javascript
console.log('Hello, desktop pet!');
```

Run: `npm run dev`

Expected: 浏览器自动打开，页面显示天蓝色背景，控制台输出 "Hello, desktop pet!"

- [ ] **Step 7: Commit**

```bash
git init
git add package.json package-lock.json vite.config.js index.html styles/main.css src/main.js
git commit -m "chore: scaffold Vite project with vanilla JS"
```

---

### Task 1: Constants and empty pet module

**Files:**
- Create: `src/constants.js`
- Create: `src/pet.js`

- [ ] **Step 1: Create src/constants.js**

```javascript
// Physics
export const GRAVITY = 500;              // px/s² — 重力加速度
export const GROUND_FRICTION = 0.8;      // 落地后水平速度的保留比例

// Walk
export const WALK_SPEED = 60;            // px/s — 走路速度
export const WALK_CHANGE_INTERVAL = 3000; // ms — 多久随机换一次方向

// Animation timing
export const FRAME_DURATION = 200;       // ms — 动画每帧持续多久
export const BLINK_INTERVAL_MIN = 2000;  // ms — 眨眼最短间隔
export const BLINK_INTERVAL_MAX = 6000;  // ms — 眨眼最长间隔
export const BLINK_DURATION = 200;       // ms — 眨眼闭眼持续多久

// Emotion
export const CLICK_ANGER_THRESHOLD = 5;  // 连续点击多少次触发生气
export const CLICK_ANGER_WINDOW = 3000;  // ms — 多快点击算"连续"
export const BORED_TIMEOUT = 30000;      // ms — 多久不互动算无聊
export const ANGER_COOLDOWN = 20000;     // ms — 生气多久后冷静
export const HAPPY_COOLDOWN = 10000;     // ms — 开心多久后恢复

// Pet size
export const PET_PIXEL_SIZE = 16;        // 像素精灵的原始分辨率
export const PET_SCALE = 4;              // 放大倍数
export const PET_SIZE = PET_PIXEL_SIZE * PET_SCALE; // 实际渲染大小 = 64px

// Idle
export const IDLE_FLOAT_AMPLITUDE = 3;   // px — 待机时上下浮动的幅度
export const IDLE_FLOAT_PERIOD = 2000;   // ms — 浮动一个完整周期的时间
```

**Why constants file?** 把可调参数集中在一起有三大好处：
1. **调手感快** — 觉得重力太强？改一个数字，刷新立刻生效
2. **避免魔法数字** — 代码里写 `500` 没人知道是什么，写 `GRAVITY` 一看就懂
3. **防止不一致** — 两个地方用了同一个值？各自写容易改漏，一个源就不会

- [ ] **Step 2: Create src/pet.js**

```javascript
import {
  WALK_SPEED,
  WALK_CHANGE_INTERVAL,
  BLINK_INTERVAL_MIN,
  BLINK_INTERVAL_MAX,
  BLINK_DURATION,
  PET_SIZE,
} from './constants.js';

export class Pet {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2 - PET_SIZE / 2;
    this.y = canvasHeight - PET_SIZE;
    this.vx = 0;
    this.vy = 0;

    // Animation
    this.animation = 'idle';       // 'idle' | 'walk' | 'blink' | 'happy' | 'angry' | 'bored'
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.facingRight = true;

    // Walk AI
    this.walkDirection = 0;        // -1 left, 0 still, 1 right
    this.walkTimer = 0;

    // Blink
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.nextBlinkTime = BLINK_INTERVAL_MIN
      + Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);

    // Mood
    this.mood = 'idle';            // 'idle' | 'happy' | 'angry' | 'bored'
    this.moodTimer = 0;
    this.clickTimes = [];          // 记录最近的点击时间戳
    this.lastInteractionTime = Date.now();

    // Drag state
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
  }
}
```

**Why a class?** `Pet` 把宠物的所有"属性"（位置、速度、情绪、动画状态）打包在一起。整个程序就这一个 Pet 实例，所有模块都读它、改它。这比散落一堆全局变量要清晰得多。

**Why `canvasWidth`/`canvasHeight` 作为构造参数？** Pet 不需要知道 Canvas 是什么，它只需要知道自己世界的边界。这样以后换渲染方式，Pet 类本身不用动。

- [ ] **Step 3: Commit**

```bash
git add src/constants.js src/pet.js
git commit -m "feat: add constants and Pet entity class"
```

---

### Task 2: Pixel sprite data

**Files:**
- Create: `src/sprites.js`

- [ ] **Step 1: Create src/sprites.js**

这里定义所有动画帧的像素数据。我们用数字表示颜色：`0` = 透明，`1` = 身体主色，`2` = 身体暗色（阴影/轮廓感），`3` = 眼睛，`4` = 嘴巴/强调色。

```javascript
// 一个圆滚滚的史莱姆小怪物

const IDLE_0 = [
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,3,3,2,2,3,3,2,2,2,1,0],
  [0,1,2,2,2,3,3,2,2,3,3,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,4,4,4,4,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
];

// 待机浮动帧2（稍微压扁）
const IDLE_1 = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,2,2,1,1,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,3,3,2,2,3,3,2,2,2,1,0],
  [0,1,2,2,2,3,3,2,2,3,3,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,4,4,4,4,4,4,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// 眨眼帧（眼睛闭上）
const BLINK_FRAME = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,2,2,1,1,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,4,4,4,4,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// 开心（眼睛变成 ^^）
const HAPPY_FRAME = [
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,3,2,2,2,2,2,2,3,2,2,1,0],
  [0,1,2,2,2,3,2,2,2,2,3,2,2,2,1,0],
  [0,1,2,2,2,2,3,3,3,3,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,4,4,4,4,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
];

// 生气（眼睛变成 ><，嘴巴锯齿）
const ANGRY_FRAME = [
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,3,2,3,2,2,3,2,3,2,2,1,0],
  [0,1,2,2,2,3,2,2,2,2,3,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,4,2,4,2,4,2,4,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
];

// 无聊（眼睛半睁，嘴巴大张打哈欠）
const BORED_FRAME = [
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
  [0,1,2,2,2,1,1,2,2,1,1,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,4,4,4,4,2,2,2,2,1,0],
  [0,1,2,2,2,2,4,4,4,4,2,2,2,2,1,0],
  [0,1,2,2,2,2,4,4,4,4,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
];

// 走路帧（左右脚交替，用身体不对称来体现）
const WALK_0 = IDLE_0; // 站立 = 走路起点

const WALK_1 = [ // 左脚迈出（身体右倾）
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,3,3,2,2,3,3,2,2,2,1,0],
  [0,1,2,2,2,3,3,2,2,3,3,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,4,4,4,4,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0],
];

const WALK_2 = IDLE_0; // 回到站立

const WALK_3 = [ // 右脚迈出（身体左倾）
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,3,3,2,2,3,3,2,2,2,1,0],
  [0,1,2,2,2,3,3,2,2,3,3,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,1,2,2,2,2,4,4,4,4,2,2,2,2,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
];

// 颜色映射表
export const COLORS = {
  1: '#8B5CF6',  // 身体主色（紫色）
  2: '#7C3AED',  // 身体暗色（深紫，做体积感）
  3: '#FFFFFF',  // 眼睛白色
  4: '#FDE047',  // 嘴巴/强调色（黄色）
};

// 所有精灵帧的集合
export const SPRITES = {
  idle: [IDLE_0, IDLE_1],
  blink: [BLINK_FRAME],       // 只有闭眼帧，睁眼用 idle[0]
  happy: [HAPPY_FRAME],
  angry: [ANGRY_FRAME],
  bored: [BORED_FRAME],
  walk: [WALK_0, WALK_1, WALK_2, WALK_3],
};
```

**Why 像素数据用纯数组而不是图片文件？** 三个原因：
1. **零依赖** — 不需要任何美术工具，不需要加载外部文件
2. **改角色立刻生效** — 想换个颜色？改 `COLORS` 对象就行
3. **好理解** — 一个二维数组就是一张图，没有任何黑盒

**关于颜色：** 紫色 (`#8B5CF6`) 做主色是因为中性又有辨识度，不像粉色太"可爱"也不像绿色太"史莱姆"。后续你想换颜色，改一个字符串就好。

- [ ] **Step 2: Commit**

```bash
git add src/sprites.js
git commit -m "feat: add pixel sprite data for all animation frames"
```

---

### Task 3: Renderer — draw the pet on Canvas

**Files:**
- Create: `src/renderer.js`
- Modify: `src/main.js` (replace temporary content)

- [ ] **Step 1: Create src/renderer.js**

```javascript
import { PET_PIXEL_SIZE, PET_SCALE, PET_SIZE } from './constants.js';
import { SPRITES, COLORS } from './sprites.js';

/**
 * 把一帧像素数据画到 Canvas 上
 *
 * @param {CanvasRenderingContext2D} ctx — Canvas 的绘制上下文
 * @param {import('./pet.js').Pet} pet — 宠物实例
 */
export function render(ctx, pet, canvasWidth, canvasHeight) {
  // 1. 清空整张画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 2. 根据宠物的动画状态和帧序号，拿到当前要画的像素数据
  const frames = SPRITES[pet.animation] || SPRITES.idle;
  const frameData = frames[pet.frameIndex % frames.length];

  // 3. 每个像素是一个 PET_SCALE × PET_SCALE 的方块
  const pixelSize = PET_SCALE;

  // 4. 遍历 16×16 的像素数组，逐个画方块
  for (let row = 0; row < PET_PIXEL_SIZE; row++) {
    for (let col = 0; col < PET_PIXEL_SIZE; col++) {
      const colorIndex = frameData[row][col];
      if (colorIndex === 0) continue; // 透明，跳过

      const color = COLORS[colorIndex];
      if (!color) continue;

      ctx.fillStyle = color;

      // 如果宠物朝左，水平翻转（从右边开始画）
      const drawCol = pet.facingRight ? col : (PET_PIXEL_SIZE - 1 - col);

      ctx.fillRect(
        pet.x + drawCol * pixelSize,
        pet.y + row * pixelSize,
        pixelSize,
        pixelSize
      );
    }
  }
}
```

**How this works step by step:**
1. `ctx.clearRect(0, 0, w, h)` — 把上一帧的画面擦干净，相当于翻到新的一页
2. 从 `SPRITES` 字典里按 `pet.animation` 找出当前动画的帧数组，再用 `pet.frameIndex` 选具体哪一帧
3. 遍历 16×16 的二维数组，`colorIndex === 0` 的格子跳过（透明），其余按 `COLORS` 映射表上色
4. `pet.facingRight` 为 `false` 时水平翻转列号，宠物就"转身"了

**Why `pixelSize = PET_SCALE`？** 原始像素 16×16 太小了，直接画只有 16px 宽。乘以 4 后变成 64×64px，在屏幕上看着大小正好。

- [ ] **Step 2: Replace src/main.js with the initial game loop**

```javascript
import { Pet } from './pet.js';
import { render } from './renderer.js';

// 获取 Canvas 和绘制上下文
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

// 让 Canvas 填满窗口
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 创建宠物实例
const pet = new Pet(canvas.width, canvas.height);

// 游戏主循环
let lastTime = 0;

function gameLoop(timestamp) {
  // delta time（秒）— 距上一帧过了多久
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  // 更新 → 渲染
  render(ctx, pet, canvas.width, canvas.height);

  requestAnimationFrame(gameLoop);
}

// 启动循环
requestAnimationFrame(gameLoop);
```

**关键概念解释：**

`requestAnimationFrame(gameLoop)` — 浏览器在下次屏幕刷新前调用 `gameLoop`。屏幕通常是 60Hz，也就是每秒调用约 60 次。浏览器自动处理节流（切到后台标签页会暂停），不需要我们手动控制。

`dt`（delta time）— 两帧之间的时间差，单位是秒。用 `dt` 计算所有运动和计时，而不是"每帧移动 2 像素"，因为：
- 60fps 的电脑：每帧 2px，1 秒走 120px
- 30fps 的电脑：每帧 2px，1 秒走 60px ← 慢电脑宠物也慢，不对！
- 用 `dt` 后：`速度 × dt`，不管帧率多少，1 秒都走一样远

`Math.min(..., 0.1)` — 防止切回标签页时 `dt` 过大（比如切出去 30 秒回来 dt=30），宠物会瞬移。限制到 0.1 秒 = 最多丢 9 帧的画面，不会瞬移。

- [ ] **Step 3: Run dev server and verify**

Run: `npm run dev`

Expected: 浏览器打开，看到一只紫色史莱姆小怪物站在屏幕底部中央，静止不动。

- [ ] **Step 4: Commit**

```bash
git add src/renderer.js src/main.js
git commit -m "feat: add Canvas renderer and game loop with static pet"
```

---

### Task 4: Idle animation — float and blink

**Files:**
- Modify: `src/main.js`
- Modify: `src/pet.js`

- [ ] **Step 1: Add idle animation update logic to pet.js**

在 `src/pet.js` 的 `Pet` 类中添加方法：

在构造函数末尾添加：
```javascript
    // Idle float
    this.floatOffset = 0;
```

在类中添加方法（放在构造函数之后）：
```javascript
  /**
   * 更新动画状态和帧
   * @param {number} dt — delta time in seconds
   */
  updateAnimation(dt) {
    // 待机浮动：用 sin 波做上下浮动
    if (this.animation === 'idle') {
      this.floatOffset = Math.sin(Date.now() / (IDLE_FLOAT_PERIOD / (Math.PI * 2)))
        * IDLE_FLOAT_AMPLITUDE;
    } else {
      this.floatOffset = 0;
    }

    // 眨眼计时器
    if (this.isBlinking) {
      this.blinkTimer -= dt * 1000;
      if (this.blinkTimer <= 0) {
        this.isBlinking = false;
        this.animation = 'idle';
      }
    } else {
      this.blinkTimer -= dt * 1000;
      if (this.blinkTimer <= 0) {
        this.isBlinking = true;
        this.animation = 'blink';
        this.blinkTimer = BLINK_DURATION;
      }
    }

    // 帧切换
    this.frameTimer += dt * 1000;
    const duration = FRAME_DURATION;
    if (this.frameTimer >= duration) {
      this.frameTimer -= duration;
      this.frameIndex++;
    }
  }
```

Also add the import for the blink constants at the top of pet.js (they should already be imported from constants.js). Check that `BLINK_DURATION` is in the import list.

- [ ] **Step 2: Update main.js to call updateAnimation**

在 `src/main.js` 的 `gameLoop` 函数中的 `render(...)` 调用之前添加：

```javascript
  pet.updateAnimation(dt);
```

Also add the floatOffset to the rendering. Modify the `render` call to account for float:

Actually, the float offset needs to be applied to pet.y before rendering. Let's handle this in renderer.js instead. Modify `src/renderer.js` to apply floatOffset:

In `render()` function, change the y coordinate calculation:
```javascript
      ctx.fillRect(
        pet.x + drawCol * pixelSize,
        pet.y + row * pixelSize + (pet.floatOffset || 0),
        pixelSize,
        pixelSize
      );
```

- [ ] **Step 3: Also update blink timer initialization in pet.js**

In the Pet constructor, the `nextBlinkTime` is already set. But the `blinkTimer` needs to use it:

Change in constructor:
```javascript
    this.blinkTimer = BLINK_INTERVAL_MIN
      + Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);
```

And remove the separate `nextBlinkTime` field (not needed). The `blinkTimer` counts down and resets.

- [ ] **Step 4: Verify**

Run: `npm run dev`

Expected: 宠物在屏幕底部微微上下浮动，每 2-6 秒眨一次眼。

- [ ] **Step 5: Commit**

```bash
git add src/pet.js src/main.js src/renderer.js
git commit -m "feat: add idle float and blink animation"
```

---

### Task 5: Walk cycle

**Files:**
- Modify: `src/pet.js`
- Modify: `src/main.js`

- [ ] **Step 1: Add walk AI to pet.js**

In Pet class, add method:

```javascript
  /**
   * 走路 AI：随机改变方向和状态
   * @param {number} dt — delta time in seconds
   * @param {number} canvasWidth — world width
   */
  updateWalk(dt, canvasWidth) {
    // 只在待机或已在走路时处理走路逻辑
    if (this.mood !== 'idle' || this.isDragging) {
      if (this.animation === 'walk') {
        this.animation = 'idle';
      }
      return;
    }

    this.walkTimer -= dt * 1000;

    if (this.walkTimer <= 0) {
      // 随机决定：停下来还是继续走
      const r = Math.random();
      if (r < 0.4) {
        // 40% 概率停下来
        this.walkDirection = 0;
        this.animation = 'idle';
        this.vx = 0;
      } else if (r < 0.7) {
        // 30% 概率向左走
        this.walkDirection = -1;
        this.facingRight = false;
        this.animation = 'walk';
        this.vx = -WALK_SPEED;
      } else {
        // 30% 概率向右走
        this.walkDirection = 1;
        this.facingRight = true;
        this.animation = 'walk';
        this.vx = WALK_SPEED;
      }
      // 随机间隔后再换方向
      this.walkTimer = 1000 + Math.random() * 3000;
    }

    // 边界检测：走到屏幕边缘就回头
    if (this.x <= 0) {
      this.walkDirection = 1;
      this.facingRight = true;
      this.vx = WALK_SPEED;
      this.walkTimer = 1000 + Math.random() * 2000;
    } else if (this.x + PET_SIZE >= canvasWidth) {
      this.walkDirection = -1;
      this.facingRight = false;
      this.vx = -WALK_SPEED;
      this.walkTimer = 1000 + Math.random() * 2000;
    }
  }
```

- [ ] **Step 2: Update main.js to call updateWalk**

In `gameLoop`, add after `pet.updateAnimation(dt)`:

```javascript
  pet.updateWalk(dt, canvas.width);
```

And update pet position based on velocity:
```javascript
  pet.x += pet.vx * dt;
  pet.y += pet.vy * dt;
```

- [ ] **Step 3: Verify**

Run: `npm run dev`

Expected: 宠物随机在屏幕底部左右走动，走到边缘会回头，有时停下来发呆。

- [ ] **Step 4: Commit**

```bash
git add src/pet.js src/main.js
git commit -m "feat: add walk cycle with random direction AI"
```

---

### Task 6: Physics — gravity and ground collision

**Files:**
- Create: `src/physics.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create src/physics.js**

```javascript
import { GRAVITY, GROUND_FRICTION, PET_SIZE } from './constants.js';

/**
 * 应用重力和地面碰撞
 *
 * @param {import('./pet.js').Pet} pet
 * @param {number} dt — delta time in seconds
 * @param {number} canvasHeight — world height
 */
export function applyGravity(pet, dt, canvasHeight) {
  // 拖拽时不应用重力
  if (pet.isDragging) return;

  const groundY = canvasHeight - PET_SIZE;

  // 重力加速
  pet.vy += GRAVITY * dt;

  // 位置更新
  pet.y += pet.vy * dt;

  // 地面碰撞检测
  if (pet.y >= groundY) {
    pet.y = groundY;
    pet.vy = 0;
  }
}
```

**Why gravity works this way:**

每一帧：速度 = 速度 + 重力 × 时间差。位置 = 位置 + 速度 × 时间差。

现实物理学中，重力加速度是 9.8m/s²，意思是"每秒速度增加 9.8m/s"。我们的 `GRAVITY = 500` 意味着"每秒速度增加 500px/s"——这比现实快得多，因为屏幕像素很小，需要更大的数值才有"掉落"的感觉。

`pet.y >= groundY` 检测是否撞到地面。`groundY = canvasHeight - PET_SIZE`，因为宠物的 y 坐标是它**顶部**的位置，宠物底部碰到屏幕底才算落地。

- [ ] **Step 2: Update main.js to use physics**

Replace the manual position update lines with:

```javascript
import { applyGravity } from './physics.js';

// In gameLoop, replace pet.x += pet.vx * dt; pet.y += pet.vy * dt; with:
  pet.x += pet.vx * dt;
  applyGravity(pet, dt, canvas.height);
```

- [ ] **Step 3: Verify**

Run: `npm run dev`

Expected: 宠物正常在底部走动。目前还没有拖拽，所以看不到掉落效果——但重力已经在后台运行了，宠物始终被"压"在地面上。

- [ ] **Step 4: Commit**

```bash
git add src/physics.js src/main.js
git commit -m "feat: add gravity and ground collision physics"
```

---

### Task 7: Mouse input — click and drag

**Files:**
- Create: `src/input.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create src/input.js**

```javascript
import { PET_SIZE } from './constants.js';

/**
 * 判断一个点是否在宠物身上
 */
function isInsidePet(px, py, pet) {
  return (
    px >= pet.x &&
    px <= pet.x + PET_SIZE &&
    py >= pet.y &&
    py <= pet.y + PET_SIZE
  );
}

/**
 * 给 Canvas 绑定鼠标事件
 *
 * @param {HTMLCanvasElement} canvas
 * @param {import('./pet.js').Pet} pet
 */
export function setupInput(canvas, pet) {
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isInsidePet(mx, my, pet)) {
      pet.isDragging = true;
      pet.dragOffsetX = mx - pet.x;
      pet.dragOffsetY = my - pet.y;
      pet.vy = 0;

      // 记录点击时间用于情绪判断
      pet.clickTimes.push(Date.now());
      // 只保留最近 3 秒内的点击记录
      const cutoff = Date.now() - 3000;
      pet.clickTimes = pet.clickTimes.filter(t => t > cutoff);

      pet.lastInteractionTime = Date.now();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!pet.isDragging) return;

    const rect = canvas.getBoundingClientRect();
    pet.x = e.clientX - rect.left - pet.dragOffsetX;
    pet.y = e.clientY - rect.top - pet.dragOffsetY;
  });

  window.addEventListener('mouseup', () => {
    pet.isDragging = false;
  });
}
```

**Why `window.addEventListener` for mousemove/mouseup 而不是 canvas？**

拖拽时鼠标可能移出 Canvas 范围（特别是快速拖拽时）。如果事件绑在 Canvas 上，鼠标一出去就收不到事件了。绑在 `window` 上能保证拖拽到屏幕任何角落都能跟踪。

**Why `getBoundingClientRect()`？**

Canvas 内部坐标和屏幕坐标是两套坐标系。`getBoundingClientRect()` 返回 Canvas 在屏幕上的位置，用鼠标的屏幕坐标减去这个位置，就得到了鼠标在 Canvas 内的坐标。

- [ ] **Step 2: Update main.js to import and call setupInput**

Add import:
```javascript
import { setupInput } from './input.js';
```

Add after pet creation:
```javascript
setupInput(canvas, pet);
```

- [ ] **Step 3: Verify drag and drop**

Run: `npm run dev`

Expected:
- 点击宠物 → 宠物被"抓起"
- 拖动到屏幕任意位置 → 宠物跟随鼠标
- 松开鼠标 → 宠物受重力影响掉回屏幕底部
- 连续点击多次 → 稍后会在情绪系统中触发"生气"

- [ ] **Step 4: Commit**

```bash
git add src/input.js src/main.js
git commit -m "feat: add mouse click and drag input handling"
```

---

### Task 8: Emotion state machine

**Files:**
- Create: `src/state.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create src/state.js**

```javascript
import {
  CLICK_ANGER_THRESHOLD,
  CLICK_ANGER_WINDOW,
  BORED_TIMEOUT,
  ANGER_COOLDOWN,
  HAPPY_COOLDOWN,
} from './constants.js';

/**
 * 每个游戏帧调用，更新宠物的情绪状态
 *
 * @param {import('./pet.js').Pet} pet
 * @param {number} dt — delta time in seconds
 */
export function updateMood(pet, dt) {
  const now = Date.now();

  // 清理过期的点击记录
  pet.clickTimes = pet.clickTimes.filter(t => now - t < CLICK_ANGER_WINDOW);

  // 规则1：连续快速点击过多 → 生气
  if (pet.clickTimes.length >= CLICK_ANGER_THRESHOLD && pet.mood !== 'angry') {
    pet.mood = 'angry';
    pet.moodTimer = ANGER_COOLDOWN;
    pet.animation = 'angry';
    pet.frameIndex = 0;
    return;
  }

  // 规则2：生气冷却时间到 → 恢复待机
  if (pet.mood === 'angry') {
    pet.moodTimer -= dt * 1000;
    if (pet.moodTimer <= 0) {
      pet.mood = 'idle';
      pet.moodTimer = 0;
      pet.animation = 'idle';
      pet.clickTimes = [];
    }
    return;
  }

  // 规则3：刚被点击 → 开心
  if (pet.clickTimes.length > 0 && pet.mood !== 'happy' && pet.mood !== 'angry') {
    const lastClick = pet.clickTimes[pet.clickTimes.length - 1];
    if (now - lastClick < 500) {
      pet.mood = 'happy';
      pet.moodTimer = HAPPY_COOLDOWN;
      pet.animation = 'happy';
      pet.frameIndex = 0;
      return;
    }
  }

  // 规则4：开心冷却时间到 → 恢复待机
  if (pet.mood === 'happy') {
    pet.moodTimer -= dt * 1000;
    if (pet.moodTimer <= 0) {
      pet.mood = 'idle';
      pet.moodTimer = 0;
      pet.animation = 'idle';
    }
    return;
  }

  // 规则5：长时间没互动 → 无聊
  if (now - pet.lastInteractionTime > BORED_TIMEOUT && pet.mood !== 'bored') {
    pet.mood = 'bored';
    pet.animation = 'bored';
    pet.frameIndex = 0;
    return;
  }

  // 规则6：无聊状态下被互动 → 恢复待机
  if (pet.mood === 'bored' && pet.lastInteractionTime > now - 1000) {
    pet.mood = 'idle';
    pet.animation = 'idle';
  }
}
```

**Why 如此排序规则？**

优先级很重要。比如宠物正在生气，同时又没有人理它——它应该是继续生气还是变无聊？我们的逻辑是：生气优先（规则2 return 了，不会走到规则5）。只有当生气冷却结束后，才检查是否无聊。

这就是状态机的核心思想：**同一时刻只有一个状态，切换有明确的优先级和条件。**

- [ ] **Step 2: Update main.js to use state machine**

Add import:
```javascript
import { updateMood } from './state.js';
```

In gameLoop, add before `pet.updateAnimation(dt)`:
```javascript
  updateMood(pet, dt);
```

- [ ] **Step 3: Verify all emotions**

Run: `npm run dev`

Expected:
- **待机** — 宠物浮动 + 眨眼（默认状态）
- **开心** — 点击一次宠物，眼睛变成 `^^`（持续 10 秒后恢复）
- **生气** — 快速点击 5 次以上，眼睛变成 `><`，嘴巴变锯齿（持续 20 秒后恢复）
- **无聊** — 等待 30 秒不碰宠物，眼睛半闭，嘴巴张大

- [ ] **Step 4: Commit**

```bash
git add src/state.js src/main.js
git commit -m "feat: add emotion state machine with 4 moods"
```

---

### Task 9: Polish — tune constants and fix edge cases

**Files:**
- Modify: `src/constants.js`
- Modify: `src/pet.js`

- [ ] **Step 1: Fix jump-on-click and improve drag feel**

Add jump velocity when clicked (in `src/input.js`, in the mousedown handler, add after `pet.lastInteractionTime = Date.now()`):

```javascript
      // 点击时给一个向上的初速度（跳跃效果）
      if (!pet.isDragging) {
        // 会在下一帧被 applyGravity 接管
      }
```

Actually, let's add the jump in a cleaner way. In the mousedown handler in `input.js`, add:

```javascript
      pet.vy = -200; // 向上弹跳
```

This gives a small bounce when clicked (before dragging starts).

- [ ] **Step 2: Fix walk-animation conflict with emotions**

In `pet.js` `updateWalk`, the check `if (this.mood !== 'idle')` prevents walking during emotions. But we also need to ensure that when mood returns to 'idle', walking can resume. Add in the `updateMood` function in `state.js`, when resetting to idle:

```javascript
    pet.walkTimer = 0; // 立刻触发走路决策
```

Add this line in the three places where mood resets to 'idle' in `state.js`.

- [ ] **Step 3: Play test and tune constants**

Run: `npm run dev` and test:

1. Does gravity feel right? Adjust `GRAVITY` up/down
2. Does walk speed feel natural? Adjust `WALK_SPEED`
3. Is 5 clicks too many/too few for anger? Adjust `CLICK_ANGER_THRESHOLD`
4. Is 30 seconds too long/short for boredom? Adjust `BORED_TIMEOUT`

Tune these values based on feel.

- [ ] **Step 4: Final commit**

```bash
git add src/constants.js src/pet.js src/input.js src/state.js
git commit -m "polish: tune physics, add click bounce, fix emotion transitions"
```

---

## Verification Checklist

After all tasks are complete, verify:

- [ ] `npm run dev` starts without errors
- [ ] Pet visible at bottom of screen — purple slime creature, ~64px
- [ ] Pet floats gently up and down when idle
- [ ] Pet blinks every 2-6 seconds
- [ ] Pet walks left and right randomly, turns at screen edges
- [ ] Click pet → happy face (^^ eyes) for 10 seconds
- [ ] Click pet rapidly 5+ times → angry face (>< eyes, jagged mouth) for 20 seconds
- [ ] Leave pet alone for 30 seconds → bored face (half-closed eyes, open mouth)
- [ ] Click pet while dragging → pet follows mouse
- [ ] Release pet in mid-air → falls to bottom with accelerating gravity
- [ ] Interacting with pet in any mood resets the bored timer
