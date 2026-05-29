import {
  WALK_SPEED,
  BLINK_INTERVAL_MIN,
  BLINK_INTERVAL_MAX,
  BLINK_DURATION,
  PET_SIZE,
  IDLE_FLOAT_PERIOD,
  IDLE_FLOAT_AMPLITUDE,
  FRAME_DURATION,
  MAX_ENERGY,
  ENERGY_DRAIN_RATE,
  ENERGY_RECOVER_RATE,
  ENERGY_LOW_THRESHOLD,
} from './constants.js';

export class Pet {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2 - PET_SIZE / 2;
    this.y = canvasHeight - PET_SIZE;
    this.vx = 0;
    this.vy = 0;

    // Animation
    this.animation = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.facingRight = true;

    // Walk AI
    this.walkDirection = 0;
    this.walkTimer = 0;

    // Blink
    this.blinkTimer = BLINK_INTERVAL_MIN
      + Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN);
    this.isBlinking = false;

    // Mood: 'idle' | 'happy' | 'angry' | 'resting' | 'still'
    this.mood = 'idle';
    this.moodTimer = 0;
    this.clickTimes = [];
    this.lastInteractionTime = Date.now();

    // Drag state
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    // Idle float
    this.floatOffset = 0;

    // Energy system
    this.energy = MAX_ENERGY;
    this.restSide = 0; // 0=左墙, 1=右墙
  }

  /**
   * 更新动画状态和帧
   */
  updateAnimation(dt) {
    if (this.animation === 'idle') {
      this.floatOffset = Math.sin(Date.now() / (IDLE_FLOAT_PERIOD / (Math.PI * 2)))
        * IDLE_FLOAT_AMPLITUDE;
    } else {
      this.floatOffset = 0;
    }

    // 抽烟计时器
    if (this._smokeTimer > 0) {
      this._smokeTimer -= dt * 1000;
      if (this._smokeTimer <= 0) {
        this._smokeTimer = 0;
        if (this.animation === 'smoke') {
          this.animation = 'idle';
          this.frameIndex = 0;
        }
      }
    }

    // 抽烟和休息/纯苹果时跳过眨眼
    if (this.animation === 'smoke' || this.mood === 'resting' || this.mood === 'still') {
      return;
    }

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

    this.frameTimer += dt * 1000;
    if (this.frameTimer >= FRAME_DURATION) {
      this.frameTimer -= FRAME_DURATION;
      this.frameIndex++;
    }
  }

  /**
   * 走路 AI：随机改变方向和状态
   */
  updateWalk(dt, canvasWidth) {
    // 非待机/拖拽/抽烟时不走路
    if (this.mood !== 'idle' || this.isDragging || this._smokeTimer > 0) {
      if (this.animation === 'walk') {
        this.animation = 'idle';
        this.vx = 0;
      }
      return;
    }

    this.walkTimer -= dt * 1000;

    if (this.walkTimer <= 0) {
      const r = Math.random();
      if (r < 0.3) {
        // 30% 停下来
        this.walkDirection = 0;
        this.animation = 'idle';
        this.vx = 0;
      } else if (r < 0.65) {
        // 35% 向左走
        this.walkDirection = -1;
        this.facingRight = false;
        this.animation = 'walk';
        this.vx = -WALK_SPEED;
      } else {
        // 35% 向右走
        this.walkDirection = 1;
        this.facingRight = true;
        this.animation = 'walk';
        this.vx = WALK_SPEED;
      }
      this.walkTimer = 1500 + Math.random() * 3500;
    }

    // 边界反弹
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

  /**
   * 体力系统：走路耗体力
   */
  updateEnergy(dt) {
    if (this.mood === 'resting') {
      // 休息恢复
      this.energy += ENERGY_RECOVER_RATE * dt;
      if (this.energy >= MAX_ENERGY) {
        this.energy = MAX_ENERGY;
      }
      return;
    }

    if (this.animation === 'walk' && !this.isDragging) {
      this.energy -= ENERGY_DRAIN_RATE * dt;
      if (this.energy < 0) {
        this.energy = 0;
      }
    } else if (this.animation !== 'walk') {
      // 不动时缓慢恢复
      this.energy += ENERGY_RECOVER_RATE * 0.3 * dt;
      if (this.energy > MAX_ENERGY) {
        this.energy = MAX_ENERGY;
      }
    }
  }

  /**
   * 跑去最近的墙边休息
   */
  moveToNearestWall(canvasWidth) {
    const distToLeft = this.x;
    const distToRight = canvasWidth - PET_SIZE - this.x;

    if (distToLeft < distToRight) {
      // 去左墙
      this.facingRight = false;
      this.walkDirection = -1;
      this.restSide = 0;
    } else {
      // 去右墙
      this.facingRight = true;
      this.walkDirection = 1;
      this.restSide = 1;
    }
  }
}
