import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import authRoutes from "./routes/AuthRoutes.js";
import messageRoutes from "./routes/MessageRoutes.js";
import userRoutes from "./routes/UserRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
let io;

try {
   io = new Server(server, {
    cors: {
      // origin: process.env.CLIENT_ORIGIN,
      origins: [process.env.CLIENT_ORIGIN, "http://localhost:3000"],
    },
  });


  io.engine.on("connection_error", (err) => {
    console.log(err.req); // the request object
    console.log(err.code); // the error code, for example 1
    console.log(err.message); // the error message, for example "Session ID unknown"
    console.log(err.context); // some additional error context
  });

  global.onlineUsers = new Map();
  global.availableUsers=new Set();

  io.on("connection", (socket) => {
    global.chatSocket = socket;

    socket.on("disconnect", () => {
      // console.log("disconnected user action fired", socket.id);
      socket.emit("signout", {
        id: socket.id,
      });
    });

    socket.on("add-user", (userId) => {
      // console.log("add user action fired", userId)
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("online-users", {
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    });

    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("rcv-msg", {
          from: data.from,
          message: data.message,
        });
      }
    });

    socket.on("signout", (data) => {
      onlineUsers.delete(data.id);
      // console.log("user signout: ", data.id);
      socket.broadcast.emit("online-users", {
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    });

    socket.on("usr-available",(data)=>{
      availableUsers.add(data.id);
      
      console.log("available usr: ",data.id);
      socket.broadcast.emit("user-status",{
        userStatus: [...availableUsers]
      });
    })

    socket.on("usr-unavailable",(data)=>{
      availableUsers.delete(data.id);
      console.log("unavailable usr: ",data.id);
      socket.broadcast.emit("user-status",{
        userStatus: [...availableUsers]
      });
    })
  });
} catch (error) {
  console.log("Faced error with socket: ", error);
}

export {io}