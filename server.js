import { config } from "dotenv";
config();
import AdminJSExpress from "@adminjs/express";
import express from "express";
import path from "path";
import { admin } from "./admin/index.js";
import { connectDB } from "./db/db.js";
import { authProvider } from "./admin/index.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import {
  BlockRoutes,
  ChatRoutes,
  MessageRoutes,
  PictureRoutes,
  ReportRoutes,
  UserRoutes,
} from "./routes/index.js";
import jwt from "jsonwebtoken";
import { User } from "./models/profile/UserModel.js";

// Create Express app
const app = express();
const __dirname = path.resolve();
// Define port
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
app.use("/assets", express.static(__dirname + "/public"));

const connection = connectDB();

// Build AdminJS router
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    // "authenticate" was here
    cookiePassword: "test",
    provider: authProvider,
  },
  null,
  {
    secret: "test",
    resave: false,
    saveUninitialized: true,
  }
);

// Mount AdminJS router
app.use(admin.options.rootPath, adminRouter);

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use("/user", UserRoutes);
app.use("/chat", ChatRoutes);
app.use("/message", MessageRoutes);
app.use("/block", BlockRoutes);
app.use("/report", ReportRoutes);
app.use("/image", PictureRoutes);

// Define a basic route
app.get("/", (req, res) => {
  res.send("Hello World");
});

export let onlineUsers = [];

const addOnlineUser = async (token, socketId) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById({ _id: decoded._id });
    onlineUsers.push({
      socketId: socketId,
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
  }
};

const removeOnlineUser = (socketId) => {
  try {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  } catch (error) {
    console.log(error);
  }
};

export const getOnlineUserById = (userId) => {
  try {
    const user = onlineUsers.filter((user) => user.userId === userId);
    return user;
  } catch (error) {
    console.log(error);
  }
};

// Socket io
io.on("connection", (socket) => {
  console.log(`${socket.id} has connected to the server.`);
  socket.on("disconnect", () => {
    removeOnlineUser(socket.id);
    console.log("user disconnected");
  });

  socket.on("join", (roomName) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room ${roomName}`);
  });

  socket.on("addNewUser", (token) => {
    addOnlineUser(token, socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
