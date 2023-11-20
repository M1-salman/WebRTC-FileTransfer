const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const cors = require("cors");

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","http://localhost:4173"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("room:join", (data) => {
    console.log(data, socket.id);
    const { name, room } = data;
    io.to(room).emit("user:joined", { name, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", room);
  });

  socket.on("user:request", ({ to, offer }) => {
    io.to(to).emit("incoming:request", { from: socket.id, offer });
  });

  socket.on("request:accepted", ({ to, answer }) => {
    io.to(to).emit("request:accepted", { from: socket.id, answer });
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
