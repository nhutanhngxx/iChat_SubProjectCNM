const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const socketHandler = require("./sockets/socketHandler");

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

// Import routes
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");
const authRoutes = require("./routes/authRoutes");

// Routes
app.use("", userRoutes);
app.use("", messageRoutes);
app.use("", groupRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send({ status: "Server started" });
});

// Gọi socket handler để xử lý real-time
socketHandler(io);

// Khởi chạy server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
