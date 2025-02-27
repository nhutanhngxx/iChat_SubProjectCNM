const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongoUrl =
  "mongodb+srv://nguyenchung:admin@cluster0.8z0ko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
require("./Schema/UserDetails");
const User = mongoose.model("UserInfo");

app.get("/", (req, res) => {
  res.send({ status: "Started server" });
});
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// Đăng ký tài khoản
app.post("/register", async (req, res) => {
  const { full_name, gender, dob, phone, password, avatar, status } = req.body;

  const oldUser = await User.findOne({ phone: phone });
  if (oldUser) {
    return res.send({ status: "error", data: "User already exists" });
  }

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await User.create({
      full_name,
      gender,
      dob,
      phone,
      password: encryptedPassword,
      avatar: avatar || "",
      status: status || "Active", // Online | Offline
    });
    res.send({ status: "ok", data: "User created", user: newUser });
  } catch (error) {
    res.send({ status: "error", data: error.message });
  }
});

// Đăng nhập
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (!user) {
    return res
      .status(400)
      .json({ status: "error", message: "User does not exist" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ phone: user.phone, id: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.send({
      status: "ok",
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        phone: user.phone,
        avatar_path: user.avatar_path,
      },
    });
  } else {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid password" });
  }
});

app.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ phone: decoded.phone });

    if (!user) {
      return res.send({ status: "error", data: "User not found" });
    }

    res.send({ status: "ok", data: user });
  } catch (error) {
    res.send({ status: "error", data: "Invalid token" });
  }
});

app.listen(5001, () => {
  console.log("Server is running on port 5001");
});

// Messages
require("./Schema/Messages");
const Message = mongoose.model("Messages");

// API gửi tin nhắn
app.post("/send-message", async (req, res) => {
  try {
    const { sender_id, receiver_id, content, type, chat_type } = req.body;
    // Kiểm tra đầu vào
    if (!sender_id || !receiver_id || !content || !type || !chat_type) {
      return res.send({ status: "error", data: "Missing required fields" });
    }
    // Tạo tin nhắn mới
    const newMessage = await Message.create({
      sender_id,
      receiver_id,
      content,
      type,
      chat_type,
      status: "sent",
    });

    res.send({
      status: "ok",
      data: "Message sent successfully",
      message: newMessage,
    });
  } catch (error) {
    res.send({ status: "error", data: error.message });
  }
});

// Tìm tất cả tin nhắn mà user này là sender hoặc receiver
app.get("/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    }).sort({ timestamp: 1 }); // Sắp xếp theo thời gian tăng dần

    res.send({ status: "ok", data: messages });
  } catch (error) {
    res.send({ status: "error", data: error.message });
  }
});
