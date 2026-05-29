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

// Energy
export const MAX_ENERGY = 100;           // 最大体力值
export const ENERGY_DRAIN_RATE = 8;      // 每秒走路消耗的体力
export const ENERGY_RECOVER_RATE = 15;   // 每秒休息恢复的体力
export const ENERGY_LOW_THRESHOLD = 0;   // 体力低于此值进入休息

// Canvas / Window (Electron)
export const CANVAS_W = 70;              // 窗口宽度
export const CANVAS_H = 250;             // 窗口高度（烟盒在底部，上面是烟的飞行空间）
export const PET_BOX_TOP = CANVAS_H - PET_SIZE; // 烟盒在 canvas 中的 Y 起点 = 186

// Cigarette particle system
export const CIGARETTE_GRAVITY = 280;    // px/s² — 烟的下落加速度
export const CIGARETTE_LIFESPAN = 4000;  // ms — 烟落地后多久消失
export const CIGARETTE_MAX = 12;         // 最多同时存在的烟
export const CIGARETTE_PX_W = 4;         // 烟的像素宽度
export const CIGARETTE_PX_H = 12;        // 烟的像素高度
export const CIGARETTE_SCALE = 2;        // 烟的渲染放大倍数
export const CIGARETTE_EXIT_X = 34;      // 烟弹出点 X（canvas 本地）
export const CIGARETTE_EXIT_Y = 182;     // 烟弹出点 Y（canvas 本地，盒盖处）
export const CIGARETTE_SPEED_X_MIN = -60;  // 水平弹射速度范围
export const CIGARETTE_SPEED_X_MAX = 60;
export const CIGARETTE_SPEED_Y_MIN = -320; // 垂直弹射速度范围（向上）
export const CIGARETTE_SPEED_Y_MAX = -200;
export const CIGARETTE_SPIN_MIN = -8;    // 旋转速度范围（弧度/s）
export const CIGARETTE_SPIN_MAX = 8;
