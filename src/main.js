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
  // delta time（秒）— 距上一帧过了多久，上限 0.1 防止切标签页后瞬移
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  // 更新动画
  pet.updateAnimation(dt);

  // 走路 AI
  pet.updateWalk(dt, canvas.width);

  // 更新位置
  pet.x += pet.vx * dt;
  pet.y += pet.vy * dt;

  // 渲染
  render(ctx, pet, canvas.width, canvas.height);

  requestAnimationFrame(gameLoop);
}

// 启动循环
requestAnimationFrame(gameLoop);
