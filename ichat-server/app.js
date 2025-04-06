const express = require("express");
const connectDB = require("./src/config/db");
require("dotenv").config(); // Đọc biến môi trường

const routes = require("./src/routes/index"); // import routes từ index.js

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

app.use("/api/v1", routes); // prefix cho các routes

// Chạy server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  // đổi về app.listen nếu muốn chạy server trước đó
  console.log(`Server is running on port ${PORT}`);
});
