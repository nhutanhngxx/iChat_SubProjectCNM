const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config(); // Đọc biến môi trường

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

// Socket.io => Real-time
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Kết nối MongoDB
connectDB();

// Import routes
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");

// Sử dụng routes
app.use("", userRoutes);
app.use("", messageRoutes);
app.use("", groupRoutes);

app.get("/", (req, res) => {
  res.send({ status: "Server started" });
});

// Chạy server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  // đổi về app.listen nếu muốn chạy server trước đó
  console.log(`Server is running on port ${PORT}`);
});
