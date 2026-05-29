import { PET_SIZE, IDLE_FLOAT_AMPLITUDE } from './constants.js';

const DRAG_THRESHOLD = 5; // 鼠标移动超过 5px 才进入拖拽

function isInsidePet(px, py, pet) {
  const spriteX = 0;
  const spriteY = IDLE_FLOAT_AMPLITUDE + (pet.floatOffset || 0);
  const spriteW = PET_SIZE;
  const spriteH = PET_SIZE;

  return (
    px >= spriteX &&
    px <= spriteX + spriteW &&
    py >= spriteY &&
    py <= spriteY + spriteH
  );
}

export function setupInput(canvas, pet) {
  pet._mouseDown = false;
  pet._dragStarted = false;

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isInsidePet(mx, my, pet)) {
      pet._mouseDown = true;
      pet._dragStarted = false;
      pet._dragStartSX = e.screenX;
      pet._dragStartSY = e.screenY;
      pet.dragOffsetX = e.screenX - pet.x;
      pet.dragOffsetY = e.screenY - pet.y;
      pet.vy = -150;

      pet.clickTimes.push(Date.now());
      const cutoff = Date.now() - 3000;
      pet.clickTimes = pet.clickTimes.filter(t => t > cutoff);

      pet.lastInteractionTime = Date.now();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!pet._mouseDown) return;

    if (!pet._dragStarted) {
      const dx = e.screenX - pet._dragStartSX;
      const dy = e.screenY - pet._dragStartSY;
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      pet._dragStarted = true;
      pet.isDragging = true;
      if (window.petAPI) window.petAPI.interactionStart();
    }

    pet.x = e.screenX - pet.dragOffsetX;
    pet.y = e.screenY - pet.dragOffsetY;

    if (window.petAPI) {
      window.petAPI.updatePosition(pet.x, pet.y - IDLE_FLOAT_AMPLITUDE);
    }
  });

  window.addEventListener('mouseup', () => {
    if (pet._mouseDown && pet._dragStarted) {
      pet.isDragging = false;
      if (window.petAPI) window.petAPI.interactionEnd();
    }
    pet._mouseDown = false;
    pet._dragStarted = false;
  });
}
