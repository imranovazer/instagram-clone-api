const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const socketio = require("socket.io");
const AuthRouter = require("./routes/AuthRouter");
const UserRouter = require("./routes/UserRoutes");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const PostsRouter = require("./routes/PostsRouter");

const mongoose = require("mongoose");
dotenv.config();
const app = express();

const server = http.createServer(app);

const io = socketio(server);

app.use(
  cors({
    origin: ["http://localhost:5173", "https://tour-front-chi.vercel.app"],

    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use(cookieParser());

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("<h1>Hello from instagram server<h1>");
});

app.use("/api/auth", AuthRouter);

app.use("/api/user", UserRouter);

app.use("/api/post", PostsRouter);

mongoose.connect(process.env.MONGO_DB).then(() => {
  console.log("Connected to Database");
});

io.on("connection", (socket) => {
  console.log("CONNECTED USER DATA", socket.id);

  socket.on("sendMessage", (message) => {
    // console.log(message);
    io.emit("messageResponse", message);
  });
});

server.listen(process.env.PORT, () => {
  console.log("Server started on port ", PORT);
});
