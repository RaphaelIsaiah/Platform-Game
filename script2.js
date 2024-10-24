// DOM ELEMENT SELECTION
const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");

// Canvas setup
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Gravity and collision
const gravity = 0.5;
let isCheckpointCollisionDetectionActive = true;

// Utility function for proportional resizing
const proportionalSize = (size) =>
  innerHeight < 500 ? Math.ceil((size / 500) * innerHeight) : size;

// Responsive touch controls for mobile
const controlsHTML = `
  <div class="controls">
    <button id="left-btn">Left</button>
    <button id="jump-btn">Jump</button>
    <button id="right-btn">Right</button>
  </div>`;
document.body.insertAdjacentHTML("beforeend", controlsHTML);

document
  .getElementById("left-btn")
  .addEventListener("touchstart", () => movePlayer("ArrowLeft", true));
document
  .getElementById("right-btn")
  .addEventListener("touchstart", () => movePlayer("ArrowRight", true));
document
  .getElementById("jump-btn")
  .addEventListener("touchstart", () => movePlayer("ArrowUp", true));

document
  .getElementById("left-btn")
  .addEventListener("touchend", () => movePlayer("ArrowLeft", false));
document
  .getElementById("right-btn")
  .addEventListener("touchend", () => movePlayer("ArrowRight", false));

// Keyboard controls for desktop
window.addEventListener("keydown", (event) => movePlayer(event.key, true));
window.addEventListener("keyup", (event) => movePlayer(event.key, false));

class Player {
  constructor() {
    this.position = { x: proportionalSize(10), y: proportionalSize(400) };
    this.velocity = { x: 0, y: 0 };
    this.width = proportionalSize(40);
    this.height = proportionalSize(40);
  }

  draw() {
    ctx.fillStyle = "#99c9ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y = gravity;
      }
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0;
    }

    if (this.position.x < this.width) this.position.x = this.width;
    if (this.position.x >= canvas.width - this.width * 2)
      this.position.x = canvas.width - this.width * 2;
  }
}

class Platform {
  constructor(x, y) {
    this.position = { x, y };
    this.width = proportionalSize(200);
    this.height = proportionalSize(40);
  }
  draw() {
    ctx.fillStyle = "#acd157";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class CheckPoint {
  constructor(x, y, z) {
    this.position = { x, y };
    this.width = proportionalSize(40);
    this.height = proportionalSize(70);
    this.claimed = false;
    this.level = z;
  }
  draw() {
    ctx.fillStyle = "#f1be32";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  claim() {
    this.width = 0;
    this.height = 0;
    this.position.y = Infinity;
    this.claimed = true;
  }
}

// Instances
const player = new Player();
const platforms = [
  new Platform(proportionalSize(500), proportionalSize(450)),
  new Platform(proportionalSize(700), proportionalSize(400)),
  // ... other platforms
];
const checkpoints = [
  new CheckPoint(proportionalSize(1170), proportionalSize(80), 1),
  new CheckPoint(proportionalSize(2900), proportionalSize(330), 2),
  new CheckPoint(proportionalSize(4800), proportionalSize(80), 3),
];

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  platforms.forEach((platform) => platform.draw());
  checkpoints.forEach((checkpoint) => checkpoint.draw());

  player.update();

  // Movement logic for keys and platforms
  if (keys.rightKey.pressed && player.position.x < proportionalSize(400)) {
    player.velocity.x = 3;
  } else if (
    keys.leftKey.pressed &&
    player.position.x > proportionalSize(100)
  ) {
    player.velocity.x = -3;
  } else {
    player.velocity.x = 0;

    if (keys.rightKey.pressed) {
      platforms.forEach((platform) => (platform.position.x -= 5));
      checkpoints.forEach((checkpoint) => (checkpoint.position.x -= 5));
    } else if (keys.leftKey.pressed) {
      platforms.forEach((platform) => (platform.position.x += 5));
      checkpoints.forEach((checkpoint) => (checkpoint.position.x += 5));
    }
  }

  // Collision detection with platforms and checkpoints
  platforms.forEach((platform) => {
    const onTopOfPlatform =
      player.position.y + player.height <= platform.position.y &&
      player.position.y + player.height + player.velocity.y >=
        platform.position.y;
    const withinPlatformBounds =
      player.position.x >= platform.position.x - player.width / 2 &&
      player.position.x <=
        platform.position.x + platform.width - player.width / 3;
    if (onTopOfPlatform && withinPlatformBounds) {
      player.velocity.y = 0;
    }
  });

  checkpoints.forEach((checkpoint) => {
    const reachedCheckpoint =
      player.position.x >= checkpoint.position.x &&
      player.position.x <= checkpoint.position.x + checkpoint.width;
    if (reachedCheckpoint && !checkpoint.claimed) {
      checkpoint.claim();
    }
  });
}

const keys = { rightKey: { pressed: false }, leftKey: { pressed: false } };

function movePlayer(key, isPressed) {
  switch (key) {
    case "ArrowLeft":
      keys.leftKey.pressed = isPressed;
      break;
    case "ArrowRight":
      keys.rightKey.pressed = isPressed;
      break;
    case "ArrowUp":
    case " ":
    case "Spacebar":
      player.velocity.y = -10;
      break;
  }
}

// Start animation
animate();
const startGame = () => {
  canvas.style.display = "block";
  startScreen.style.display = "none";
  // Display the controls for mobile
  const controls = document.querySelector(".controls");
  if (window.innerWidth <= 768) {
    controls.style.display = "flex";
  }
  animate();
};

startBtn.addEventListener("click", startGame);
