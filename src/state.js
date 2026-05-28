import {
  CLICK_ANGER_THRESHOLD,
  CLICK_ANGER_WINDOW,
  BORED_TIMEOUT,
  ANGER_COOLDOWN,
  HAPPY_COOLDOWN,
  MAX_ENERGY,
  WALK_SPEED,
  PET_SIZE,
} from './constants.js';

/**
 * 情绪状态机
 *
 * 状态流转：
 *   idle → (体力耗尽) → resting(靠墙休息) → (体力回满) → idle
 *   idle → (30s不理) → still(纯苹果不动)
 *   idle → (点击) → happy → idle
 *   idle → (连点5次) → angry → idle
 *   still/resting → (点击) → happy → idle
 */
export function updateMood(pet, dt) {
  const now = Date.now();

  pet.clickTimes = pet.clickTimes.filter(t => now - t < CLICK_ANGER_WINDOW);

  // ── 生气优先 ──
  if (pet.clickTimes.length >= CLICK_ANGER_THRESHOLD && pet.mood !== 'angry') {
    pet.mood = 'angry';
    pet.moodTimer = ANGER_COOLDOWN;
    pet.animation = 'angry';
    pet.frameIndex = 0;
    pet.vx = 0;
    return;
  }

  if (pet.mood === 'angry') {
    pet.moodTimer -= dt * 1000;
    if (pet.moodTimer <= 0) {
      pet.mood = 'idle';
      pet.moodTimer = 0;
      pet.animation = 'idle';
      pet.clickTimes = [];
    }
    return;
  }

  // ── 休息状态：走向墙 → 靠墙 → 回体力 → 复活 ──
  if (pet.mood === 'resting') {
    const cw = pet._canvasWidth || window.innerWidth;
    const atLeftWall = pet.x <= 0;
    const atRightWall = pet.x + PET_SIZE >= cw;

    if (atLeftWall || atRightWall) {
      // 靠墙休息
      pet.vx = 0;
      pet.animation = 'rest';
      pet.frameIndex = pet.restSide;
    } else {
      // 还没到墙，继续走（处理被拖走后重新找墙）
      pet.restSide = pet.x < cw / 2 ? 0 : 1;
      pet.facingRight = (pet.restSide === 1);
      pet.animation = 'walk';
      pet.vx = (pet.restSide === 0 ? -1 : 1) * WALK_SPEED;
    }

    // 体力回满就起来
    if (pet.energy >= MAX_ENERGY) {
      pet.mood = 'idle';
      pet.animation = 'idle';
      pet.frameIndex = 0;
      pet.walkTimer = 0;
    }
    return;
  }

  // ── 纯苹果状态：完全不动，点一下才醒 ──
  if (pet.mood === 'still') {
    // 被点击就醒
    if (pet.clickTimes.length > 0) {
      pet.mood = 'happy';
      pet.moodTimer = HAPPY_COOLDOWN;
      pet.animation = 'happy';
      pet.frameIndex = 0;
    }
    return;
  }

  // ── 体力耗尽 → 去休息 ──
  if (pet.energy <= 0 && pet.mood === 'idle') {
    pet.mood = 'resting';
    pet.moveToNearestWall(pet._canvasWidth || window.innerWidth);
    pet.animation = 'walk';
    pet.vx = (pet.restSide === 0 ? -1 : 1) * WALK_SPEED;
    pet.facingRight = (pet.restSide === 1);
    return;
  }

  // ── 开心 ──
  if (pet.clickTimes.length > 0 && pet.mood !== 'happy') {
    const lastClick = pet.clickTimes[pet.clickTimes.length - 1];
    if (now - lastClick < 500) {
      pet.mood = 'happy';
      pet.moodTimer = HAPPY_COOLDOWN;
      pet.animation = 'happy';
      pet.frameIndex = 0;
      pet.vx = 0;
      return;
    }
  }

  if (pet.mood === 'happy') {
    pet.moodTimer -= dt * 1000;
    if (pet.moodTimer <= 0) {
      pet.mood = 'idle';
      pet.moodTimer = 0;
      pet.animation = 'idle';
    }
    return;
  }

  // ── 太久没人理 → 变回纯苹果 ──
  if (now - pet.lastInteractionTime > BORED_TIMEOUT && pet.mood === 'idle') {
    pet.mood = 'still';
    pet.animation = 'still';
    pet.frameIndex = 0;
    pet.vx = 0;
    return;
  }
}
