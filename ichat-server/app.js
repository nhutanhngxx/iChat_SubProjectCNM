// const express = require("express");
// const connectDB = require("./config/db");
// require("dotenv").config(); // Đọc biến môi trường

// const app = express();
// app.use(express.json());
// const cors = require("cors");
// // app.use(cors());
// const corsOptions = {
//   origin: "http://localhost:3000", // Chỉ cho phép frontend của bạn
//   credentials: true, // Cho phép gửi cookie, token
// };

// app.use(cors(corsOptions));
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:8000");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   next();
// });



// // Kết nối MongoDB
// connectDB();

// // Import routes
// const userRoutes = require("./routes/userRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const groupRoutes = require("./routes/groupRoutes");

// // Sử dụng routes
// app.use("", userRoutes);
// app.use("", messageRoutes);
// app.use("", groupRoutes);

// app.get("/", (req, res) => {
//   res.send({ status: "Server started" });
// });

// // Chạy server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();

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
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Kết nối MongoDB
connectDB();

// Import routes
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");

app.use("", userRoutes);
app.use("", messageRoutes);
app.use("", groupRoutes);

app.get("/", (req, res) => {
  res.send({ status: "Server started" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
