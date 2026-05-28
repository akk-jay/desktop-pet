import { PET_PIXEL_SIZE, PET_SCALE } from './constants.js';
import { SPRITES, COLORS } from './sprites.js';

/**
 * 把一帧像素数据画到 Canvas 上
 *
 * @param {CanvasRenderingContext2D} ctx — Canvas 的绘制上下文
 * @param {import('./pet.js').Pet} pet — 宠物实例
 * @param {number} canvasWidth — 画布宽度
 * @param {number} canvasHeight — 画布高度
 */
export function render(ctx, pet, canvasWidth, canvasHeight) {
  // 1. 清空整张画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 2. 根据宠物的动画状态和帧序号，拿到当前要画的像素数据
  const frames = SPRITES[pet.animation] || SPRITES.idle;
  const frameData = frames[pet.frameIndex % frames.length];

  // 3. 每个像素是一个 PET_SCALE × PET_SCALE 的方块
  const pixelSize = PET_SCALE;

  // 4. 遍历 16×16 的像素数组，逐个画方块
  for (let row = 0; row < PET_PIXEL_SIZE; row++) {
    for (let col = 0; col < PET_PIXEL_SIZE; col++) {
      const colorIndex = frameData[row][col];
      if (colorIndex === 0) continue; // 透明，跳过

      const color = COLORS[colorIndex];
      if (!color) continue;

      ctx.fillStyle = color;

      // 如果宠物朝左，水平翻转列号
      const drawCol = pet.facingRight ? col : (PET_PIXEL_SIZE - 1 - col);

      ctx.fillRect(
        pet.x + drawCol * pixelSize,
        pet.y + row * pixelSize + (pet.floatOffset || 0),
        pixelSize,
        pixelSize
      );
    }
  }
}
