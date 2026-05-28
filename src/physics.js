import { GRAVITY, PET_SIZE } from './constants.js';

/**
 * 应用重力和地面碰撞
 *
 * @param {import('./pet.js').Pet} pet
 * @param {number} dt — delta time in seconds
 * @param {number} canvasHeight — world height
 */
export function applyGravity(pet, dt, canvasHeight) {
  // 拖拽时不应用重力（由 input.js 控制位置）
  if (pet.isDragging) return;

  const groundY = canvasHeight - PET_SIZE;

  // 重力加速：每秒速度增加 GRAVITY px/s
  pet.vy += GRAVITY * dt;

  // 用速度更新位置
  pet.y += pet.vy * dt;

  // 地面碰撞：穿透了就拉回来
  if (pet.y >= groundY) {
    pet.y = groundY;
    pet.vy = 0;
  }
}
