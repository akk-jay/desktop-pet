import { PET_PIXEL_SIZE, PET_SCALE, IDLE_FLOAT_AMPLITUDE, PET_BOX_TOP } from './constants.js';
import { SPRITES, COLORS } from './sprites.js';
import { renderCigarettes } from './cigarettes.js';

export function render(ctx, pet, cigarettes, canvasWidth, canvasHeight) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. 画烟（先画，在烟盒后面/上方）
  renderCigarettes(ctx, cigarettes);

  // 2. 画烟盒
  const frames = SPRITES[pet.animation] || SPRITES.idle;
  const frameData = frames[pet.frameIndex % frames.length];

  const pixelSize = PET_SCALE;
  const baseY = PET_BOX_TOP + IDLE_FLOAT_AMPLITUDE;

  for (let row = 0; row < PET_PIXEL_SIZE; row++) {
    for (let col = 0; col < PET_PIXEL_SIZE; col++) {
      const colorIndex = frameData[row][col];
      if (colorIndex === 0) continue;

      const color = COLORS[colorIndex];
      if (!color) continue;

      ctx.fillStyle = color;

      const drawCol = pet.facingRight ? col : (PET_PIXEL_SIZE - 1 - col);

      ctx.fillRect(
        drawCol * pixelSize,
        baseY + row * pixelSize + (pet.floatOffset || 0),
        pixelSize,
        pixelSize
      );
    }
  }
}
