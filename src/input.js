import { PET_SIZE, IDLE_FLOAT_AMPLITUDE } from './constants.js';
import { SPRITES } from './sprites.js';

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
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isInsidePet(mx, my, pet)) {
      pet.isDragging = true;
      pet.dragOffsetX = e.screenX - pet.x;
      pet.dragOffsetY = e.screenY - pet.y;
      pet.vy = -150;

      pet.clickTimes.push(Date.now());
      const cutoff = Date.now() - 3000;
      pet.clickTimes = pet.clickTimes.filter(t => t > cutoff);

      pet.lastInteractionTime = Date.now();

      if (window.petAPI) window.petAPI.interactionStart();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!pet.isDragging) return;

    pet.x = e.screenX - pet.dragOffsetX;
    pet.y = e.screenY - pet.dragOffsetY;

    if (window.petAPI) {
      window.petAPI.updatePosition(pet.x, pet.y - IDLE_FLOAT_AMPLITUDE);
    }
  });

  window.addEventListener('mouseup', () => {
    if (pet.isDragging) {
      pet.isDragging = false;
      if (window.petAPI) window.petAPI.interactionEnd();
    }
  });
}
