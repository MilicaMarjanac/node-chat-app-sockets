import express from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import mongoose from "../database.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../public");

app.use(express.static(publicDir));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

//API Routes
import usersApiRoute from "./routes/api/users.js";
app.use("/api/users", usersApiRoute);
import roomsApiRoute from "./routes/api/rooms.js";
app.use("/api/rooms", roomsApiRoute);
import messagesApiRoute from "./routes/api/messages.js";
app.use("/api/messages", messagesApiRoute);

let allUsersSockets = [];

io.on("connection", (socket) => {
  socket.on("join", (user) => {
    socket.to(user.room).emit("roomAdded", user);
    socket.emit("roomAdded", user);
    socket.join(user.room);

    let onlineUsers = getOnlineUsersOfARoom(user, socket);

    socket.to(user.room).emit("onlineUsers", onlineUsers);
    socket.emit("onlineUsers", onlineUsers);
  });

  function getOnlineUsersOfARoom(user, socket) {
    let socketsList = [];
    user.socketID = socket.id;
    allUsersSockets.push(user);
    const clients = io.sockets.adapter.rooms.get(user.room);
    for (const clientId of clients) {
      const clientSocket = io.sockets.sockets.get(clientId);
      socketsList.push(clientSocket.id);
    }
    let onlineUsersOfARoom = allUsersSockets.filter((user) => {
      if (socketsList.includes(user.socketID)) {
        if (user) {
          return user;
        }
      }
    });
    return onlineUsersOfARoom;
  }

  socket.on("currentRoomData", (currentRoomData) => {
    socket.to(currentRoomData.name).emit("updateRoomData", currentRoomData);
    socket.emit("updateRoomData", currentRoomData);
  });

  socket.on("sendMessage", (message, callback) => {
    socket.to(message.room.name).emit("message", message);
    socket.emit("message", message);
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("userLeft", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
