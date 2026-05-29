import { Pet } from './pet.js';
import { render } from './renderer.js';
import { applyGravity, clampToScreen } from './physics.js';
import { setupInput } from './input.js';
import { updateMood } from './state.js';
import {
  ejectCigarette,
  updateCigarettes,
  updateSmokeEmitter,
  updateSmoke,
  renderSmoke,
} from './cigarettes.js';
import { IDLE_FLOAT_AMPLITUDE, CANVAS_W, CANVAS_H, PET_BOX_TOP } from './constants.js';

const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

let screenW = 1920;
let screenH = 1080;

async function initScreenBounds() {
  if (window.petAPI) {
    const bounds = await window.petAPI.getScreenBounds();
    screenW = bounds.width;
    screenH = bounds.height;

    window.petAPI.onScreenBoundsChanged((newBounds) => {
      screenW = newBounds.width;
      screenH = newBounds.height;
    });
  }
}

const pet = new Pet(screenW, screenH);
const cigarettes = [];
const smokeParticles = [];
setupInput(canvas, pet);

let lastTime = 0;

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  pet._canvasWidth = screenW;

  updateMood(pet, dt);
  pet.updateAnimation(dt);
  pet.updateWalk(dt, screenW);
  pet.updateEnergy(dt);

  // 点击弹烟
  if (pet._ejectRequest) {
    pet._ejectRequest = false;
    ejectCigarette(cigarettes, pet);
  }

  // 抽烟时持续喷烟雾
  if (pet._smokeTimer > 0) {
    updateSmokeEmitter(smokeParticles, pet, dt);
  }

  // 更新粒子
  updateCigarettes(cigarettes, dt, CANVAS_W, CANVAS_H);
  updateSmoke(smokeParticles, dt);

  pet.x += pet.vx * dt;
  applyGravity(pet, dt, screenH);
  clampToScreen(pet, screenW);

  if (window.petAPI) {
    window.petAPI.updatePosition(pet.x, pet.y - PET_BOX_TOP - IDLE_FLOAT_AMPLITUDE);
  }

  // 渲染：先烟和烟雾，再烟盒本体
  render(ctx, pet, cigarettes, CANVAS_W, CANVAS_H);
  renderSmoke(ctx, smokeParticles);

  requestAnimationFrame(gameLoop);
}

initScreenBounds().then(() => {
  requestAnimationFrame(gameLoop);
});
