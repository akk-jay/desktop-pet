import {
  CIGARETTE_GRAVITY,
  CIGARETTE_LIFESPAN,
  CIGARETTE_MAX,
  CIGARETTE_PX_W,
  CIGARETTE_PX_H,
  CIGARETTE_SCALE,
  CIGARETTE_EXIT_X,
  CIGARETTE_EXIT_Y,
  CIGARETTE_SPEED_X_MIN,
  CIGARETTE_SPEED_X_MAX,
  CIGARETTE_SPEED_Y_MIN,
  CIGARETTE_SPEED_Y_MAX,
  CIGARETTE_SPIN_MIN,
  CIGARETTE_SPIN_MAX,
  CANVAS_H,
  PET_SIZE,
  IDLE_FLOAT_AMPLITUDE,
} from './constants.js';
import { CIGARETTE_SPRITE, COLORS } from './sprites.js';

/**
 * 从烟盒上方弹出一根烟
 */
export function ejectCigarette(cigarettes, pet) {
  if (cigarettes.length >= CIGARETTE_MAX) return;

  const vx = CIGARETTE_SPEED_X_MIN + Math.random() * (CIGARETTE_SPEED_X_MAX - CIGARETTE_SPEED_X_MIN);
  const vy = CIGARETTE_SPEED_Y_MIN + Math.random() * (CIGARETTE_SPEED_Y_MAX - CIGARETTE_SPEED_Y_MIN);
  const spin = CIGARETTE_SPIN_MIN + Math.random() * (CIGARETTE_SPIN_MAX - CIGARETTE_SPIN_MIN);

  // 烟的初始角度：指向速度方向
  const initialAngle = Math.atan2(vy, vx) + Math.PI / 2;

  cigarettes.push({
    x: CIGARETTE_EXIT_X,
    y: CIGARETTE_EXIT_Y + (pet.floatOffset || 0),
    vx,
    vy,
    angle: initialAngle,
    spin,
    life: CIGARETTE_LIFESPAN,
    maxLife: CIGARETTE_LIFESPAN,
    landed: false,
  });
}

/**
 * 更新所有香烟粒子
 */
export function updateCigarettes(cigarettes, dt, canvasW, canvasH) {
  for (let i = cigarettes.length - 1; i >= 0; i--) {
    const c = cigarettes[i];

    if (c.landed) {
      // 落地后只是倒计时
      c.life -= dt * 1000;
      if (c.life <= 0) {
        cigarettes.splice(i, 1);
      }
      continue;
    }

    // 重力
    c.vy += CIGARETTE_GRAVITY * dt;
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.angle += c.spin * dt;

    // 落地检测（烟盒底部 = CANVAS_H，烟盒顶 = CANVAS_H - PET_SIZE）
    const groundY = canvasH - 4; // 留 4px 余量给烟的厚度
    if (c.y >= groundY) {
      c.y = groundY;
      c.vx = 0;
      c.vy = 0;
      c.spin = 0;
      c.landed = true;
    }

    // 出屏幕左右消失
    if (c.x < -20 || c.x > canvasW + 20) {
      cigarettes.splice(i, 1);
    }
  }
}

/**
 * 渲染单根烟
 */
export function renderCigarette(ctx, c) {
  // 落地后透明度渐隐
  let alpha = 1;
  if (c.landed) {
    alpha = Math.max(0, c.life / c.maxLife);
  }

  const pxW = CIGARETTE_PX_W;
  const pxH = CIGARETTE_PX_H;
  const scale = CIGARETTE_SCALE;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(c.x, c.y);
  ctx.rotate(c.angle);

  for (let row = 0; row < pxH; row++) {
    for (let col = 0; col < pxW; col++) {
      const colorIndex = CIGARETTE_SPRITE[row][col];
      if (colorIndex === 0) continue;
      const color = COLORS[colorIndex];
      if (!color) continue;

      ctx.fillStyle = color;
      ctx.fillRect(
        (col - pxW / 2) * scale,
        (row - pxH / 2) * scale,
        scale,
        scale
      );
    }
  }

  ctx.restore();
}

/**
 * 渲染所有烟
 */
export function renderCigarettes(ctx, cigarettes) {
  for (const c of cigarettes) {
    renderCigarette(ctx, c);
  }
}
