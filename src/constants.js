// Physics
export const GRAVITY = 500;              // px/s² — 重力加速度
export const GROUND_FRICTION = 0.8;      // 落地后水平速度的保留比例

// Walk
export const WALK_SPEED = 60;            // px/s — 走路速度
export const WALK_CHANGE_INTERVAL = 3000; // ms — 多久随机换一次方向

// Animation timing
export const FRAME_DURATION = 200;       // ms — 动画每帧持续多久
export const BLINK_INTERVAL_MIN = 2000;  // ms — 眨眼最短间隔
export const BLINK_INTERVAL_MAX = 6000;  // ms — 眨眼最长间隔
export const BLINK_DURATION = 200;       // ms — 眨眼闭眼持续多久

// Emotion
export const CLICK_ANGER_THRESHOLD = 5;  // 连续点击多少次触发生气
export const CLICK_ANGER_WINDOW = 3000;  // ms — 多快点击算"连续"
export const BORED_TIMEOUT = 30000;      // ms — 多久不互动算无聊
export const ANGER_COOLDOWN = 20000;     // ms — 生气多久后冷静
export const HAPPY_COOLDOWN = 10000;     // ms — 开心多久后恢复

// Pet size
export const PET_PIXEL_SIZE = 16;        // 像素精灵的原始分辨率
export const PET_SCALE = 4;              // 放大倍数
export const PET_SIZE = PET_PIXEL_SIZE * PET_SCALE; // 实际渲染大小 = 64px

// Idle
export const IDLE_FLOAT_AMPLITUDE = 3;   // px — 待机时上下浮动的幅度
export const IDLE_FLOAT_PERIOD = 2000;   // ms — 浮动一个完整周期的时间
