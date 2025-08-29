import express from "express";
import http from "http";
import cors from "cors";
import {
  Server
} from "socket.io";
import {
  socketHandlers
} from "./socket/socketHandlers.js";
import userRoutes from "./route/userRoutes.js";
import {
  errorHandler
} from "./middleware/errorHandler.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  },
});
socketHandlers(io)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.use("", userRoutes);

app.use(errorHandler);

export {
  server,
  io
};