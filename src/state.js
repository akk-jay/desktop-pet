import {
  CLICK_ANGER_THRESHOLD,
  CLICK_ANGER_WINDOW,
  BORED_TIMEOUT,
  ANGER_COOLDOWN,
  HAPPY_COOLDOWN,
} from './constants.js';

/**
 * 每帧调用，根据互动历史更新宠物的情绪状态
 *
 * 优先级规则（按顺序检查）：
 *   1. 连续快速点击过多 → 生气（最高优先）
 *   2. 生气冷却时间到 → 恢复待机
 *   3. 刚被点击 → 开心
 *   4. 开心冷却时间到 → 恢复待机
 *   5. 长时间没互动 → 无聊
 *   6. 无聊状态下被互动 → 恢复待机
 *
 * @param {import('./pet.js').Pet} pet
 * @param {number} dt — delta time in seconds
 */
export function updateMood(pet, dt) {
  const now = Date.now();

  // 清理 3 秒前的点击记录
  pet.clickTimes = pet.clickTimes.filter(t => now - t < CLICK_ANGER_WINDOW);

  // 规则1：连续快速点击过多 → 生气
  if (pet.clickTimes.length >= CLICK_ANGER_THRESHOLD && pet.mood !== 'angry') {
    pet.mood = 'angry';
    pet.moodTimer = ANGER_COOLDOWN;
    pet.animation = 'angry';
    pet.frameIndex = 0;
    pet.walkTimer = 0;
    return;
  }

  // 规则2：生气冷却结束 → 待机
  if (pet.mood === 'angry') {
    pet.moodTimer -= dt * 1000;
    if (pet.moodTimer <= 0) {
      pet.mood = 'idle';
      pet.moodTimer = 0;
      pet.animation = 'idle';
      pet.clickTimes = [];
      pet.walkTimer = 0;
    }
    return;
  }

  // 规则3：刚被点击 → 开心
  if (pet.clickTimes.length > 0 && pet.mood !== 'happy') {
    const lastClick = pet.clickTimes[pet.clickTimes.length - 1];
    if (now - lastClick < 500) {
      pet.mood = 'happy';
      pet.moodTimer = HAPPY_COOLDOWN;
      pet.animation = 'happy';
      pet.frameIndex = 0;
      pet.walkTimer = 0;
      return;
    }
  }

  // 规则4：开心冷却结束 → 待机
  if (pet.mood === 'happy') {
    pet.moodTimer -= dt * 1000;
    if (pet.moodTimer <= 0) {
      pet.mood = 'idle';
      pet.moodTimer = 0;
      pet.animation = 'idle';
      pet.walkTimer = 0;
    }
    return;
  }

  // 规则5：太久没互动 → 无聊
  if (now - pet.lastInteractionTime > BORED_TIMEOUT && pet.mood !== 'bored') {
    pet.mood = 'bored';
    pet.animation = 'bored';
    pet.frameIndex = 0;
    return;
  }

  // 规则6：无聊状态下被互动 → 立刻恢复
  if (pet.mood === 'bored' && now - pet.lastInteractionTime < 1000) {
    pet.mood = 'idle';
    pet.animation = 'idle';
  }
}
