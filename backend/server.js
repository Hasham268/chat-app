const express = require("express");
const { chats } = require("./data/data");
const dotenv = require("dotenv");
const connectToDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const stripeRoute = require("./routes/stripe");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const path = require("path");

const buildpath = path.join(__dirname, "../frontend/build");
console.log(buildpath)
const app = express();
app.use(express.json());
app.use(express.static(buildpath));

dotenv.config();
connectToDB();

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/uploads/images", express.static("uploads/images/"));

app.use("/api/stripe", stripeRoute);
app.use("/api/user", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);

    socket.emit("connected");
    onlineUsers.set(userData._id, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("join chat", (room, userId) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("logout", (id) => {
    onlineUsers.delete(id);
    console.log(id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("outgoing-voice-call", (data) => {
    socket.in(data.to).emit("incoming-voice-call", {
      from: data.from,
      roomId: data.roomId,
      callType: data.callType,
    });
  });

  socket.on("outgoing-video-call", (data) => {
    socket.in(data.to).emit("incoming-video-call", {
      from: data.from,
      roomId: data.roomId,
      callType: data.callType,
    });
  });

  socket.on("reject-voice-call", (data) => {
    socket.to(data.from).emit("voice-call-rejected");
  });

  socket.on("reject-video-call", (data) => {
    socket.to(data.from).emit("video-call-rejected");
  });

  socket.on("accept-incoming-call", ({ id }) => {
    socket.to(id).emit("accept-call");
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
