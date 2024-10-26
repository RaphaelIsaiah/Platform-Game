// DOM ELEMENT SELECTION
const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");

// Canvas setup
const ctx = canvas.getContext("2d");
const scaleFactor = window.innerWidth / 1170; // Adjusted based the initial design width
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
  </div>
`;

document.body.insertAdjacentHTML("beforeend", controlsHTML);

document
  .getElementById("right-btn")
  .addEventListener("touchstart", () => movePlayer("ArrowRight", 5, true));
document
  .getElementById("left-btn")
  .addEventListener("touchstart", () => movePlayer("ArrowLeft", 5, true));
document
  .getElementById("jump-btn")
  .addEventListener("touchstart", () => movePlayer("ArrowUp", 0, true));
document
  .getElementById("right-btn")
  .addEventListener("touchend", () => movePlayer("ArrowRight", 0, false));
document
  .getElementById("left-btn")
  .addEventListener("touchend", () => movePlayer("ArrowLeft", 0, false));

class Player {
  constructor() {
    this.position = {
      x: 10 * scaleFactor,
      y: 400 * scaleFactor,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = 40 * scaleFactor;
    this.height = 40 * scaleFactor;
  }

  draw() {
    ctx.fillStyle = "#99c9ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Boundary Checks for the canvas
    // Ensures the player stays within the boundaries of the canvas screen
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y = gravity;
      }
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0;
    }

    // Takes care of the left edge
    if (this.position.x < this.width) {
      this.position.x = this.width;
    }

    // Takes care of the right edge
    if (this.position.x >= canvas.width - this.width * 2) {
      this.position.x = canvas.width - this.width * 2;
    }
  }
}

class Platform {
  constructor(x, y) {
    this.position = { x: x * scaleFactor, y: y * scaleFactor };
    this.width = 200 * scaleFactor;
    this.height = 40 * scaleFactor;
  }
  draw() {
    ctx.fillStyle = "#acd157";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class CheckPoint {
  constructor(x, y, z) {
    this.position = { x: x * scaleFactor, y: y * scaleFactor };
    this.width = 40 * scaleFactor;
    this.height = 70 * scaleFactor;
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

const platformPositions = [
  { x: proportionalSize(500), y: proportionalSize(450) },
  { x: proportionalSize(700), y: proportionalSize(400) },
  { x: proportionalSize(850), y: proportionalSize(350) },
  { x: proportionalSize(900), y: proportionalSize(350) },
  { x: proportionalSize(1050), y: proportionalSize(150) },
  { x: proportionalSize(2500), y: proportionalSize(450) },
  { x: proportionalSize(2900), y: proportionalSize(400) },
  { x: proportionalSize(3150), y: proportionalSize(350) },
  { x: proportionalSize(3900), y: proportionalSize(450) },
  { x: proportionalSize(4200), y: proportionalSize(400) },
  { x: proportionalSize(4400), y: proportionalSize(200) },
  { x: proportionalSize(4700), y: proportionalSize(150) },
];

const platforms = platformPositions.map(
  (platform) => new Platform(platform.x, platform.y)
);

const checkpointPositions = [
  { x: proportionalSize(1170), y: proportionalSize(80), z: 1 },
  { x: proportionalSize(2900), y: proportionalSize(330), z: 2 },
  { x: proportionalSize(4800), y: proportionalSize(80), z: 3 },
];

const checkpoints = checkpointPositions.map(
  (checkpoint) => new CheckPoint(checkpoint.x, checkpoint.y, checkpoint.z)
);

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  platforms.forEach((platform) => {
    platform.draw();
  });

  checkpoints.forEach((checkpoint) => {
    checkpoint.draw();
  });

  player.update();

  // Player movement logic
  if (keys.rightKey.pressed && player.position.x < proportionalSize(400)) {
    player.velocity.x = 5;
  } else if (
    keys.leftKey.pressed &&
    player.position.x > proportionalSize(100)
  ) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;

    if (keys.rightKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x -= 5;
      });
      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x -= 5;
      });
    } else if (keys.leftKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x += 5;
      });
      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x += 5;
      });
    }
  }

  // Collision detection with platforms and checkpoints
  platforms.forEach((platform) => {
    const collisionDetectionRules = [
      player.position.y + player.height <= platform.position.y,
      player.position.y + player.height + player.velocity.y >=
        platform.position.y,
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
    ];

    if (collisionDetectionRules.every((rule) => rule)) {
      player.velocity.y = 0;
      return;
    }

    const platformDetectionRules = [
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
      player.position.y + player.height >= platform.position.y,
      player.position.y <= platform.position.y + platform.height,
    ];

    if (platformDetectionRules.every((rule) => rule)) {
      player.position.y = platform.position.y + player.height;
      player.velocity.y = gravity;
    }
  });

  checkpoints.forEach((checkpoint, index, checkpoints) => {
    const checkpointDetectionRules = [
      player.position.x >= checkpoint.position.x,
      player.position.y >= checkpoint.position.y,
      player.position.y + player.height <=
        checkpoint.position.y + checkpoint.height,
      isCheckpointCollisionDetectionActive,
      player.position.x - player.width <=
        checkpoint.position.x - checkpoint.width + player.width * 0.9,
      index === 0 || checkpoints[index - 1].claimed === true,
    ];

    if (checkpointDetectionRules.every((rule) => rule)) {
      checkpoint.claim();

      if (index === checkpoints.length - 1) {
        isCheckpointCollisionDetectionActive = false;
        showCheckpointScreen(
          "You reached the final checkpoint!",
          checkpoint.level
        );
        movePlayer("ArrowRight", 0, false);
      } else if (
        player.position.x >= checkpoint.position.x &&
        player.position.x <= checkpoint.position.x + 40
      ) {
        showCheckpointScreen("You reached a checkpoint!", checkpoint.level);
      }
    }
  });
};

const keys = {
  rightKey: {
    pressed: false,
  },
  leftKey: {
    pressed: false,
  },
};

const movePlayer = (key, xVelocity, isPressed) => {
  if (!isCheckpointCollisionDetectionActive) {
    player.velocity.x = 0;
    player.velocity.y = 0;
    return;
  }
  switch (key) {
    case "ArrowLeft":
      keys.leftKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x -= xVelocity;

      break;

    case "ArrowUp":
    case " ":
    case "Spacebar":
      player.velocity.y -= 8 * scaleFactor;
      break;

    case "ArrowRight":
      keys.rightKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x += xVelocity;

    default:
      break;
  }
};

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

const showCheckpointScreen = (msg, level) => {
  checkpointScreen.style.display = "block";
  checkpointMessage.textContent = `${msg} Level: ${level}`;

  if (isCheckpointCollisionDetectionActive) {
    setTimeout(() => {
      checkpointScreen.style.display = "none";
    }, 2000);
  }
};

startBtn.addEventListener("click", startGame);

// Keyboard controls for desktop
window.addEventListener("keydown", ({ key }) => {
  movePlayer(key, 8, true);
});

window.addEventListener("keyup", ({ key }) => {
  movePlayer(key, 0, false);
});
