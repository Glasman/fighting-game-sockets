const canvas = document.querySelector("canvas");

//function that you use to get access to the canvas tags 2D drawing functions
//c just stands for context
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

//canvas context is what's used to draw shapes on the screen, and once we have the canvas context we can start using the canvas api
c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.8;

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

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./img/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 60,
      y: 50,
    },
    width: 200,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  color: "blue",
  imageSrc: "./img/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167,
  },
  sprites: {
    idle: {
      imageSrc: "./img/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 170,
    height: 50,
  },
});

// with the aid of this we can be pressing the d key and making the sprite move right,
//then press the a key while still holding the d key to make the sprite move to the left
const keys = {
  a: {
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
};

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


//arbitrary naming convention, can be named whatever we want
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

  // //player movement
  // if (keys.a.pressed && player.lastKey === "a") {
  //   player.velocity.x = -5;
  //   player.switchSprite('run')
  // } else if (keys.d.pressed && player.lastKey === "d") {
  //   player.velocity.x = 5;
  //   player.image = player.sprites.run.image;
  //   player.switchSprite('run')
  // } else {
  //   player.switchSprite('idle')

  // }

  // //jumping
  // if (player.velocity.y < 0) {
  //   player.switchSprite('jump')
  // } else if (player.velocity.y > 0) {
  //   player.switchSprite('fall')

  // }

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
