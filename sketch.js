// ============================================================
// Week 5 Example 1 — Sprite Sheet Animation (Reorganized Grid)
// ============================================================

// ------------------------------------------------------------
// SPRITE CONFIGURATION
// Since our setup function will dynamically rebuild the layout
// into a clean 4-row, 2-column sheet, we can use simple row indices!
// ------------------------------------------------------------
const SPRITE = {
  frameWidth:  100, // Width of one Ness frame
  frameHeight: 130, // Height of one Ness frame
  numFrames:   2,   // 2 alternating frames per row loop
  animSpeed:   10,  // Dropped to 15 for snappier 2-frame steps
  scale:       0.5,   // Set to 1 for full size (can adjust to scale up/down)

  // Clean uniform rows mapping after our setup translation
  rows: {
    down:  0,
    up:    1,
    right: 2,
    left:  3,
  },

  // No offsets needed because this rip aligns beautifully
  offsets: {
    down:  { x: -7, y: 0 },
    up:    { x: -3, y: 0 },
    right: { x: -4, y: 0 },
    left:  { x: -3, y: 0 },
  },
};

// ------------------------------------------------------------
// PLAYER
// ------------------------------------------------------------
let player = {
  x: 400, 
  y: 225, 
  speed: 3, 

  // Animation state
  currentFrame: 0,      
  frameTimer:   0,      
  direction:    "down", 
  isMoving:     false,  
};

let originalSheet;  // Stores the raw asset unedited
let characterSheet; // The newly constructed 4x2 offscreen graphics canvas

// ============================================================
// preload()
// ============================================================
function preload() {
  originalSheet = loadImage("assets/images/nesswalking.png");
}

// ============================================================
// setup()
// Creates the canvas and maps the custom left-half pieces 
// into a standard stacked row architecture.
// ============================================================
function setup() {
  createCanvas(800, 450);
  imageMode(CENTER);

  // Calculate true frame size dynamically based on the file dimensions
  let w = originalSheet.width / 8;
  let h = originalSheet.height / 2;

  SPRITE.frameWidth = w;
  SPRITE.frameHeight = h;

  // Create the offscreen graphics canvas buffer
  characterSheet = createGraphics(w * 2, h * 4);

  // FINE-TUNING ALIGNMENT:
  // We shift the destination Y (dy) down by 6 pixels for Rows 0 and 2 
  // to match the lower resting position of Rows 1 and 3.
  let shiftY = 12; 

  // Row 0: Down (Shifted down by shiftY)
  characterSheet.copy(originalSheet, 0 * w, 0 * h, w * 2, h, 0 * w, (0 * h) + shiftY, w * 2, h);
  
  // Row 1: Up (Kept at its original natural lower height)
  characterSheet.copy(originalSheet, 0 * w, 1 * h, w * 2, h, 0 * w, 1 * h, w * 2, h);
  
  // Row 2: Right (Shifted down by shiftY)
  characterSheet.copy(originalSheet, 2 * w, 0 * h, w * 2, h, 0 * w, (2 * h) + shiftY, w * 2, h);
  
  // Row 3: Left (Kept at its original natural lower height)
  characterSheet.copy(originalSheet, 2 * w, 1 * h, w * 2, h, 0 * w, 3 * h, w * 2, h);
}

// ============================================================
// draw()
// ============================================================
function draw() {
  background(30);

  handleInput();
  animateSprite();
  drawCharacter();
  drawHUD();
}

// ------------------------------------------------------------
// handleInput()
// ------------------------------------------------------------
function handleInput() {
  player.isMoving = false;

  if (keyIsDown(87)) { // W — up
    player.y -= player.speed;
    player.direction = "up";
    player.isMoving = true;
  }
  if (keyIsDown(83)) { // S — down
    player.y += player.speed;
    player.direction = "down";
    player.isMoving = true;
  }
  if (keyIsDown(65)) { // A — left
    player.x -= player.speed;
    player.direction = "left";
    player.isMoving = true;
  }
  if (keyIsDown(68)) { // D — right
    player.x += player.speed;
    player.direction = "right";
    player.isMoving = true;
  }

  // Keep player inside canvas boundary constraints
  let hw = (SPRITE.frameWidth  * SPRITE.scale) / 2;
  let hh = (SPRITE.frameHeight * SPRITE.scale) / 2;
  player.x = constrain(player.x, hw, width  - hw);
  player.y = constrain(player.y, hh, height - hh);
}

// ------------------------------------------------------------
// animateSprite()
// ------------------------------------------------------------
function animateSprite() {
  if (player.isMoving) {
    player.frameTimer++;

    if (player.frameTimer >= SPRITE.animSpeed) {
      player.frameTimer = 0;
      player.currentFrame = (player.currentFrame + 1) % SPRITE.numFrames;
    }
  } else {
    player.currentFrame = 0;
    player.frameTimer   = 0;
  }
}

// ------------------------------------------------------------
// drawCharacter()
// Uses standard grid sampling because our sheet was flattened to 4x2
// ------------------------------------------------------------
function drawCharacter() {
  let row    = SPRITE.rows[player.direction];
  let offset = SPRITE.offsets[player.direction];

  // Map perfectly over the generated clean 4x2 coordinate tracking system
  let sx = player.currentFrame * SPRITE.frameWidth  + offset.x;
  let sy = row                 * SPRITE.frameHeight + offset.y;

  let dw = SPRITE.frameWidth  * SPRITE.scale;
  let dh = SPRITE.frameHeight * SPRITE.scale;

  image(
    characterSheet, // Reads directly from the constructed canvas graphics buffer
    player.x, player.y, 
    dw, dh,             
    sx, sy,             
    SPRITE.frameWidth,  
    SPRITE.frameHeight  
  );
}

// ------------------------------------------------------------
// drawHUD()
// ------------------------------------------------------------
function drawHUD() {
  noStroke();
  fill(160);
  textSize(13);
  textAlign(LEFT);
  textFont("monospace");
  text("Move: WASD", 16, 24);

  fill(100);
  textSize(11);
  text("Direction: " + player.direction, 16, 44);
  text("Frame: " + player.currentFrame + " / " + (SPRITE.numFrames - 1), 16, 58);
  text("Row: " + SPRITE.rows[player.direction], 16, 72);
}