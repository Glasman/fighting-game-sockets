const express = require("express");
const app = express();
const { createServer } = require("node:http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = process.env.PORT || 3000;
const path = require("path");

const players = {};

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

server.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

io.on("connection", (socket) => {
  console.log("a user has connected", socket.id);

  let role = "observer";
  //removes all observers, returns just p1 and p2
  const currentPlayers = Object.values(players).filter(
    (p) => p.role !== "observer"
  );

  if (!currentPlayers.find((p) => p.role === "player1")) {
    role = "player1";
  } else if (!currentPlayers.find((p) => p.role === "player2")) {
    role = "player2";
  }

  if (role === "player1") {
    players[socket.id] = {
      role,
      data: {
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
      },
    };
    //   } else if (Object.keys(player2).length === 0) {
  } else if (role === "player2") {
    players[socket.id] = {
      role,
      data: {
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
      },
    };
  } else {
    players[socket.id] = { role: "observer", data: { username: socket.id } };
  }

//   const myRole = players[socket.id]?.role;
//   const myData = players[socket.id]?.data;

//   console.log(`Assigned ${socket.id} as ${myRole}`);
//   console.log("Player data:", myData);

  socket.on("disconnect", (reason) => {
    delete players[socket.id];
    console.log("Player has disconnected due to:", reason);
  });

//   console.log("players", players);
});

console.log("server loaded");
