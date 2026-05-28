import {
  WALK_SPEED,
  WALK_CHANGE_INTERVAL,
  BLINK_INTERVAL_MIN,
  BLINK_INTERVAL_MAX,
  BLINK_DURATION,
  PET_SIZE,
  IDLE_FLOAT_PERIOD,
  IDLE_FLOAT_AMPLITUDE,
  FRAME_DURATION,
} from './constants.js';

export class Pet {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2 - PET_SIZE / 2;
    this.y = canvasHeight - PET_SIZE;
    this.vx = 0;
    this.vy = 0;

    // Animation
    this.animation = 'idle';       // 'idle' | 'walk' | 'blink' | 'happy' | 'angry' | 'bored'
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.facingRight = true;

    // Walk AI
    this.walkDirection = 0;        // -1 left, 0 still, 1 right
    this.walkTimer = 0;

    // Blink
    this.blinkTimer = BLINK_INTERVAL_MIN
      + Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);
    this.isBlinking = false;

    // Mood
    this.mood = 'idle';            // 'idle' | 'happy' | 'angry' | 'bored'
    this.moodTimer = 0;
    this.clickTimes = [];          // 记录最近的点击时间戳
    this.lastInteractionTime = Date.now();

    // Drag state
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    // Idle float
    this.floatOffset = 0;
  }

  /**
   * 更新动画状态和帧
   * @param {number} dt — delta time in seconds
   */
  updateAnimation(dt) {
    // 待机浮动：用 sin 波做上下浮动
    if (this.animation === 'idle') {
      this.floatOffset = Math.sin(Date.now() / (IDLE_FLOAT_PERIOD / (Math.PI * 2)))
        * IDLE_FLOAT_AMPLITUDE;
    } else {
      this.floatOffset = 0;
    }

    // 眨眼计时器
    if (this.isBlinking) {
      this.blinkTimer -= dt * 1000;
      if (this.blinkTimer <= 0) {
        this.isBlinking = false;
        this.animation = 'idle';
        this.blinkTimer = BLINK_INTERVAL_MIN
          + Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);
      }
    } else {
      this.blinkTimer -= dt * 1000;
      if (this.blinkTimer <= 0) {
        this.isBlinking = true;
        this.animation = 'blink';
        this.blinkTimer = BLINK_DURATION;
      }
    }

    // 帧切换
    this.frameTimer += dt * 1000;
    const duration = FRAME_DURATION;
    if (this.frameTimer >= duration) {
      this.frameTimer -= duration;
      this.frameIndex++;
    }
  }

  /**
   * 走路 AI：随机改变方向和状态
   * @param {number} dt — delta time in seconds
   * @param {number} canvasWidth — world width
   */
  updateWalk(dt, canvasWidth) {
    // 非待机状态或正在拖拽时，不走路
    if (this.mood !== 'idle' || this.isDragging) {
      if (this.animation === 'walk') {
        this.animation = 'idle';
        this.vx = 0;
      }
      return;
    }

    this.walkTimer -= dt * 1000;

    if (this.walkTimer <= 0) {
      const r = Math.random();
      if (r < 0.4) {
        // 40% 概率停下来
        this.walkDirection = 0;
        this.animation = 'idle';
        this.vx = 0;
      } else if (r < 0.7) {
        // 30% 概率向左走
        this.walkDirection = -1;
        this.facingRight = false;
        this.animation = 'walk';
        this.vx = -WALK_SPEED;
      } else {
        // 30% 概率向右走
        this.walkDirection = 1;
        this.facingRight = true;
        this.animation = 'walk';
        this.vx = WALK_SPEED;
      }
      this.walkTimer = 1000 + Math.random() * 3000;
    }

    // 边界检测：走到屏幕边缘就回头
    if (this.x <= 0) {
      this.walkDirection = 1;
      this.facingRight = true;
      this.vx = WALK_SPEED;
      this.walkTimer = 1000 + Math.random() * 2000;
    } else if (this.x + PET_SIZE >= canvasWidth) {
      this.walkDirection = -1;
      this.facingRight = false;
      this.vx = -WALK_SPEED;
      this.walkTimer = 1000 + Math.random() * 2000;
    }
  }
}
