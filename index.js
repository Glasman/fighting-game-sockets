const canvas = document.querySelector("canvas");

//function that you use to get access to the canvas tags 2D drawing functions
//c just stands for context
const c = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;

const gravity = 0.8;

const socket = io();

const frontendPlayers = {};
const frontendObservers = {};
let player;
let enemy;

//canvas context is what's used to draw shapes on the screen, and once we have the canvas context we can start using the canvas api
c.fillRect(0, 0, canvas.width, canvas.height);

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 128,
  },
  imageSrc: "./img/shop.png",
  scale: 2.75,
  framesMax: 6,
});

socket.on("updatePlayers", (backendPlayers, backendObservers) => {
  for (const id in backendPlayers) {
    const backendPlayer = backendPlayers[id];

    if (!frontendPlayers[id]) {
      const { role, data } = backendPlayer;
      const newFighter = new Fighter({
        ...data,
      });

      if (role === "player1") {
        player = newFighter;
      } else if (role === "player2") {
        enemy = newFighter;
      }

      frontendPlayers[id] = backendPlayer;
    }
  }
  for (const id in backendObservers) {
    const backendObserver = backendObservers[id];
    if (!frontendObservers[id]) {
      frontendObservers[id] = backendObserver;
    }
  }

  for (const id in frontendPlayers) {
    if (!backendPlayers[id]) {
      delete frontendPlayers[id];
    }
  }
  console.log(frontendPlayers);
  console.log("frontend observers", frontendObservers)
});

decreaseTimer();

// Show instructions modal
document.getElementById("show-instructions").onclick = function () {
  document.getElementById("instructions-modal").style.display = "flex";
};

// Close instructions modal
document.getElementById("close-instructions").onclick = function () {
  document.getElementById("instructions-modal").style.display = "none";
};

// Optional: Close instructions when clicking outside the modal content
window.onclick = function (event) {
  if (event.target == document.getElementById("instructions-modal")) {
    document.getElementById("instructions-modal").style.display = "none";
  }
};

function animate() {
  //The window.requestAnimationFrame() method tells the browser you wish to perform an animation.
  //It requests the browser to call a user-supplied callback function before the next repaint.
  //in this instance animate() calls requestAnimationFrame which calls animate(), looping it as long as we need
  window.requestAnimationFrame(animate);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // Player movement
  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    if (!player.isAttacking) player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    if (!player.isAttacking) player.switchSprite("run");
  } else {
    if (!player.isAttacking) player.switchSprite("idle");
  }

  // Attack logic
  if (player.isAttacking) {
    if (player.image !== player.sprites.attack1.image) {
      player.switchSprite("attack1");
    }
  }

  // Jumping and falling states
  if (player.velocity.y < 0) {
    if (!player.isAttacking) player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    if (!player.isAttacking) player.switchSprite("fall");
  }

  //enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  if (enemy.isAttacking) {
    if (enemy.image !== enemy.sprites.attack1.image) {
      enemy.switchSprite("attack1");
    }
  }

  // Jumping and falling states
  if (enemy.velocity.y < 0) {
    if (!enemy.isAttacking) enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    if (!enemy.isAttacking) enemy.switchSprite("fall");
  }

  //detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
  }

  //if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  //this is where player 1 gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    document.querySelector("#playerHealth").style.width = player.health + "%";
  }

  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

const keys = {
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
  ArrowDown: {
    pressed: false,
  },
};

window.addEventListener("keydown", (event) => {
  if (!player.dead) {
    switch (event.key) {
      //player movement
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case "w":
        player.velocity.y = -20;
        break;
      case "s":
        // player.attack();
        if (!player.isAttacking) {
          player.attack(); // Attack logic
        }
        break;
      case " ":
        // player.attack();
        if (!player.isAttacking) {
          player.attack(); // Attack logic
        }
        break;
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      //enemy movement
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "ArrowUp":
        enemy.velocity.y = -20;
        break;
      case "ArrowDown":
        enemy.attack();
        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }

  //enemy keys
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
