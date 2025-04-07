const express = require("express");
const router = express.Router();

require("dotenv").config();
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const UserController = require("../controllers/userController");

router.put("/update/:id", UserController.updateInfoUser);

// Đăng nhập
router.post("/login", UserController.login);

// Đăng xuất
router.post("/logout", UserController.logout);

// Làm mới accessToken
router.post("/refresh-token", UserController.refreshToken);

// Lấy thông tin User từ Bearer Token
router.post("/userdata", UserController.getUserFromToken);

// Lấy thông tin User từ ID
router.get("/users/:id", UserController.getUserById);

// Lấy tất cả user từ database (Tìm kiếm nếu tìm thấy)
router.get("/users", UserController.getAllUsers);

module.exports = router;
