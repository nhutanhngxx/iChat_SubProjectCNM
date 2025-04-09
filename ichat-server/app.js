const express = require("express");
const connectDB = require("./src/config/db");
require("dotenv").config(); // Đọc biến môi trường

const routes = require("./src/routes/index"); // import routes từ index.js

const app = express();
app.use(express.json());

const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:8000"],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware xử lý CORS
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

app.use("/api", routes); // prefix cho các routes

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  // đổi về app.listen nếu muốn chạy server trước đó
  console.log(`Server is running on port ${PORT}`);
});
