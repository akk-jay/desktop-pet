import { Pet } from './pet.js';
import { render } from './renderer.js';
import { applyGravity, clampToScreen } from './physics.js';
import { setupInput } from './input.js';
import { updateMood } from './state.js';

const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const pet = new Pet(canvas.width, canvas.height);
setupInput(canvas, pet);

let lastTime = 0;

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  // 让状态机能感知屏幕宽度（用于判断是否靠墙）
  pet._canvasWidth = canvas.width;

  // 情绪 + 体力状态机
  updateMood(pet, dt);

  // 更新动画
  pet.updateAnimation(dt);

  // 走路 AI（idle 状态）
  pet.updateWalk(dt, canvas.width);

  // 体力消耗/恢复
  pet.updateEnergy(dt);

  // 位置更新
  pet.x += pet.vx * dt;
  applyGravity(pet, dt, canvas.height);
  clampToScreen(pet, canvas.width);

  // 渲染
  render(ctx, pet, canvas.width, canvas.height);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
