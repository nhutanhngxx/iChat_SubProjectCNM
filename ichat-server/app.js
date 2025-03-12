const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config(); // Đọc biến môi trường

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

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
  console.log(`Server is running on port ${PORT}`);
});
