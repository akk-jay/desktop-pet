# Desktop Pet Design Spec

## Overview

A pixel-art creature desktop pet that lives in a browser window. It walks along the bottom of the screen, reacts to clicks, can be dragged (falls back via gravity), and has an emotion state machine driven by user interaction.

**Tech stack:** Vite + vanilla JavaScript + Canvas API  
**Target:** Chrome/Edge browser, runs from local dev server  
**Scope:** Phase 1 — web preview only (no OS-level desktop integration)

---

## Feature List

### Phase 1 (this spec)

| Feature | Description |
|---------|-------------|
| Pixel pet rendering | 16×16 or 32×32 pixel grid, rendered programmatically on Canvas (no image assets) |
| Idle animation | Subtle body float + occasional blink |
| Walk animation | 4-frame walk cycle with horizontal movement along screen bottom |
| Click reaction | Pet jumps when clicked, mood changes to "happy" |
| Drag with gravity | Pet follows mouse while dragging; on release, falls to screen bottom with acceleration |
| Emotion state machine | 4 states: idle, happy, angry, bored — with transition rules and distinct visual expressions |
| Game loop | `requestAnimationFrame` loop with delta-time based update/render cycle |

### Out of scope (future phases)

- OS-level overlay (always-on-top, transparent background over desktop)
- Multiple pets
- Pet customization/skins
- Sound effects
- Utility features (reminders, pomodoro, etc.)

---

## Architecture

### File Structure

```
desktop-pet/
├── index.html              # Single <canvas> element + mounts main.js
├── package.json            # Project metadata, scripts, dependencies
├── vite.config.js          # Vite dev server config
├── src/
│   ├── main.js             # Game loop (update + render every frame)
│   ├── pet.js              # Pet entity: position, velocity, mood, current animation
│   ├── renderer.js         # Draws pixel sprite data onto Canvas
│   ├── physics.js          # Gravity acceleration + ground collision
│   ├── state.js            # Emotion state machine transition rules
│   ├── input.js            # Mouse click/drag event handlers
│   └── constants.js        # Tunable parameters (gravity, speed, animation timing)
└── styles/
    └── main.css            # Fullscreen Canvas, transparent background
```

### Module Responsibilities

**main.js** — Orchestrator. Runs the `requestAnimationFrame` loop. Each frame: calculates delta time → calls `pet.update(dt)` → calls `renderer.draw(pet)`.

**pet.js** — The pet entity. Holds all runtime state: x, y, velocityX, velocityY, current mood, current animation frame. Its `update(dt)` method delegates to physics and state modules, then advances animation.

**renderer.js** — Pure function: given pet state and a Canvas context, draws the correct pixel art at the correct position. Contains the pixel data arrays for each animation frame.

**physics.js** — Two functions: `applyGravity(pet, dt)` (adds acceleration to velocity, velocity to position, clamps to ground) and `checkGroundCollision(pet, canvasHeight)` (stops at bottom boundary).

**state.js** — `updateMood(pet, dt, events)` — evaluates transition rules (click count, idle time, anger cooldown) and sets `pet.mood`. Pure logic, no rendering.

**input.js** — Attaches `mousedown`/`mousemove`/`mouseup` listeners to Canvas. Converts raw DOM events into structured event objects consumed by pet.js and state.js.

**constants.js** — Single source of truth for all tunable numbers:
```javascript
export const GRAVITY = 500;        // px/s²
export const WALK_SPEED = 60;      // px/s
export const FRAME_DURATION = 200; // ms per animation frame
export const CLICK_ANGER_COUNT = 5;
export const BORED_TIMEOUT = 30000; // ms
export const ANGER_COOLDOWN = 20000;
export const PET_SIZE = 64;        // rendered size in px (4× scale of 16×16)
```

### Data Flow

```
Mouse Event → input.js → pet.js + state.js → pet state updated
                                                    ↓
Game Loop tick → pet.update(dt) → physics + state + animation
                                                    ↓
                 renderer.draw(pet, ctx) → Canvas pixels
```

State flows one direction: input → logic → render. Render never writes back to state.

---

## Emotion State Machine

### States

```
  ┌──────────┐
  │  BORED   │ ← 30s without any interaction
  │ (yawn)   │
  └─────┬────┘
        │ clicked
        ↓
  ┌──────────┐  clicked   ┌──────────┐
  │  HAPPY   │ ←──────── │   IDLE   │
  │ (bounce) │           │ (float,  │
  └───┬──────┘           │  blink)  │
      │ 10s later        └───┬──────┘
      ↓                      │ 5 rapid clicks
  ┌──────────┐          ┌──────────┐
  │   IDLE   │          │  ANGRY   │
  └──────────┘          │ (shake,  │
                        │  "#")    │
                        └───┬──────┘
                            │ 20s cooldown
                            ↓
                       ┌──────────┐
                       │   IDLE   │
                       └──────────┘
```

### Transition Rules (priority order)

1. **Any interaction → reset bored timer**
2. **5+ clicks within 3 seconds → ANGRY**
3. **Angry for 20s → IDLE** (cooldown resets click counter)
4. **Clicked while not angry → HAPPY**
5. **Happy for 10s → IDLE**
6. **No interaction for 30s → BORED**

---

## Visual Design

### Pixel Art Approach

- Base resolution: 16×16 pixels, scaled 4× to 64×64px on screen
- Colors: 4-color palette (body, outline, eye, accent)
- All sprites defined as 2D arrays of color indices in `renderer.js`

### Animation Frames

| Animation | Frame Count | Duration |
|-----------|-------------|----------|
| Idle float | 2 (up, down) | 2000ms cycle |
| Blink | 2 (open, closed) | 200ms, random interval |
| Walk | 4 frames | 200ms each |
| Happy bounce | 4 frames | 150ms each |
| Angry shake | 2 frames (left, right) | 100ms each |
| Bored yawn | 3 frames | 500ms each |

### Emotion Visual Differences

| Mood | Eyes | Mouth | Extras |
|------|------|-------|--------|
| Idle | `··` dots | small line | none |
| Happy | `^^` arcs | small smile | slight body stretch |
| Angry | `><` angled | jagged line | "#" mark above head, body shake |
| Bored | `--` flat | wide oval (yawn) | "…" bubble occasionally |

---

## Development Approach

### Step 1: Scaffold project
- `npm create vite@latest` with vanilla JS template
- Verify dev server runs and shows blank page

### Step 2: Static pet on Canvas
- Hardcode a pixel sprite array
- Draw it at a fixed position
- **Verifies:** Canvas setup, renderer basics work

### Step 3: Game loop + idle animation
- Add `requestAnimationFrame` loop
- Float animation (sin wave on Y position)
- Blink at random intervals
- **Verifies:** Game loop timing, animation frame switching

### Step 4: Walk cycle
- Random walk direction and duration
- 4-frame walk sprite switching
- Horizontal movement with boundary detection
- **Verifies:** Multi-frame animation, movement logic

### Step 5: Physics + drag
- Gravity simulation
- Mouse drag (mousedown/move/up)
- Fall-to-ground on release
- **Verifies:** Physics model, input handling, collision

### Step 6: Emotion state machine
- Implement 4-state machine with transitions
- Wire each state to different animations
- **Verifies:** State logic, animation-state coupling

### Step 7: Polish & tune
- Adjust all constants for good feel
- Test edge cases (drag off screen, rapid clicks, etc.)

---

## Constraints

- **No external image files** — all visuals are code-generated pixel arrays
- **No frameworks** — vanilla JS only (Vite is just the build tool)
- **Single Canvas element** — one drawing surface, no DOM elements for the pet
- **No backend** — static HTML/JS/CSS, served by Vite dev server

## Success Criteria

1. Open `localhost:5173` in browser → see a pixel creature
2. Creature walks along bottom, occasionally blinking
3. Click it → jumps, shows happy expression
4. Drag it up and release → falls back to bottom with gravity
5. Click rapidly 5+ times → angry expression + shake
6. Wait 30 seconds without interaction → bored expression
