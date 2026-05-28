import { Pet } from './pet.js';
import { render } from './renderer.js';
import { applyGravity, clampToScreen } from './physics.js';
import { setupInput } from './input.js';
import { updateMood } from './state.js';
import { IDLE_FLOAT_AMPLITUDE } from './constants.js';

const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_W = 70;
const CANVAS_H = 70;
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

  pet.x += pet.vx * dt;
  applyGravity(pet, dt, screenH);
  clampToScreen(pet, screenW);

  if (window.petAPI) {
    window.petAPI.updatePosition(pet.x, pet.y - IDLE_FLOAT_AMPLITUDE);
  }

  render(ctx, pet, CANVAS_W, CANVAS_H);

  requestAnimationFrame(gameLoop);
}

initScreenBounds().then(() => {
  requestAnimationFrame(gameLoop);
});
