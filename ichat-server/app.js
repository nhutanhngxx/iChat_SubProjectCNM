const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./src/config/db");
require("dotenv").config(); // Đọc biến môi trường
const { Server } = require("socket.io");

const routes = require("./src/routes/index"); // import routes từ index.js

const socketHandler = require("./src/sockets/socketHandler");
const initSocketMessage = require("./src/sockets/socketMessage");
const socketFriend = require("./src/sockets/socketFriend");
const socketGroup = require("./src/sockets/socketGroup");

// Khởi tạo Express app và HTTP server
const app = express();
const server = http.createServer(app);

// Tạo socket server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8000"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Gắn io vào app để sử dụng trong controller
app.set("io", io);

// Kết nối MongoDB
connectDB();

// Middleware
app.use(express.json());

// Cấu hình CORS
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:8000"],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware xử lý CORS cho tất cả request
app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:3000", "http://localhost:8000"];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Inject io vào req để sử dụng trong controller
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Kết nối MongoDB
connectDB();

app.use("/api", routes); // prefix cho các routes

// Gọi socket handler để xử lý real-time
socketHandler(io);
initSocketMessage(io);
socketFriend(io);
socketGroup(io);
// Khởi chạy server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
