import { PET_SIZE } from './constants.js';

/**
 * 判断一个坐标点是否在宠物身上
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
 * 给 Canvas 绑定鼠标事件：点击反应 + 拖拽
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
      pet.vy = -150; // 点击时向上弹跳一下

      // 记录点击时间戳用于情绪判断
      pet.clickTimes.push(Date.now());
      const cutoff = Date.now() - 3000;
      pet.clickTimes = pet.clickTimes.filter(t => t > cutoff);

      pet.lastInteractionTime = Date.now();
    }
  });

  // 拖拽移动 — 绑定在 window 上，防止鼠标移出 Canvas 范围丢事件
  window.addEventListener('mousemove', (e) => {
    if (!pet.isDragging) return;

    const rect = canvas.getBoundingClientRect();
    pet.x = e.clientX - rect.left - pet.dragOffsetX;
    pet.y = e.clientY - rect.top - pet.dragOffsetY;
  });

  // 松开放下宠物，重力接管
  window.addEventListener('mouseup', () => {
    pet.isDragging = false;
  });
}
