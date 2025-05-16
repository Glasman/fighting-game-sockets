const express = require("express");
const app = express();
const { createServer } = require("node:http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = process.env.PORT || 3000;
const path = require("path");

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

console.log("server loaded");
