// const express = require('express');
// const app = express();
// const mongoose = require('mongoose');
// app.use(express.json());
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const mongoUrl = "mongodb+srv://nguyenchung:admin@cluster0.8z0ko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// const JWT_SECRET="hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";
// mongoose
//     .connect(mongoUrl)
//     .then(()=>{
//     console.log("Connected to database");
//     }).catch((err)=>{
//         console.log("Error: ",err);
//     })
//     require("./Schema/UserDetails");
// const User = mongoose.model("UserInfo");

// app.get("/",(req,res)=>
// {
//     res.send({status:"Started server"});
// })
// app.get('/users', async (req, res) => {
//     const users = await User.find();
//     res.send(users);
// });

// // Đăng ký tài khoản
// app.post("/register",async(req,res)=>
// {

//     const { full_name, gender, dob, phone, password, avatar, status } = req.body;

//     const oldUser = await User.findOne({ phone: phone });
//     if (oldUser) {
//       return res.send({ status: "error", data: "User already exists" });
//     }

//     const encryptedPassword = await bcrypt.hash(password, 10);
//     try {
//       const newUser = await User.create({
//         full_name,
//         gender,
//         dob,
//         phone,
//         password: encryptedPassword,
//         avatar: avatar || "",
//         status: status || "Active", // Online | Offline
//       });

//       res.send({ status: "ok", data: "User created", user: newUser });
//     } catch (error) {
//       res.send({ status: "error", data: error.message });
//     }
// })

// // Đăng nhập
// app.post("/login",async(req,res)=>
// {
//     const { phone, password } = req.body;
//     const user = await User.findOne({ phone });

//     if (!user) {
//       return res.send({ status: "error", data: "User does not exist" });
//     }

//     if (await bcrypt.compare(password, user.password)) {
//       const token = jwt.sign({ phone: user.phone }, JWT_SECRET, { expiresIn: "1h" });
//       return res.send({ status: "ok", "token": token });
//     } else {
//       return res.send({ status: "error", data: "Invalid password" });
//     }
// })
// app.post("/userdata", async (req, res) => {
//     const { token } = req.body;
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findOne({ phone: decoded.phone });

//     if (!user) {
//       return res.send({ status: "error", data: "User not found" });
//     }

//     res.send({ status: "ok", data: user });
//   } catch (error) {
//     res.send({ status: "error", data: "Invalid token" });
//   }
//   });

// app.listen(5001,()=>
// {
//     console.log("Server is running on port 5001");

// })
const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config(); // Đọc biến môi trường

const app = express();
app.use(express.json());

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
