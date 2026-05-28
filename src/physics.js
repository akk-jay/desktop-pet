import { GRAVITY, PET_SIZE } from './constants.js';

/**
 * 应用重力和地面碰撞
 */
export function applyGravity(pet, dt, canvasHeight) {
  if (pet.isDragging) return;

  const groundY = canvasHeight - PET_SIZE;

  pet.vy += GRAVITY * dt;
  pet.y += pet.vy * dt;

  if (pet.y >= groundY) {
    pet.y = groundY;
    pet.vy = 0;
  }
}

/**
 * 限制宠物不能走出屏幕左右边界
 */
export function clampToScreen(pet, canvasWidth) {
  if (pet.x < 0) {
    pet.x = 0;
  }
  if (pet.x + PET_SIZE > canvasWidth) {
    pet.x = canvasWidth - PET_SIZE;
  }
}
