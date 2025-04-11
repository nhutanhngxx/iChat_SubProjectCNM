const express = require("express");
const router = express.Router();

require("dotenv").config();
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const UserController = require("../controllers/userController");

// Cập nhật thông tin User
router.put("/update/:id", UserController.updateInfoUser);

// Lấy thông tin User từ Bearer Token
router.post("/userdata", UserController.getUserFromToken);

// Lấy thông tin User từ ID
router.get("/:id", UserController.getUserById);

// Lấy tất cả user từ database (Tìm kiếm nếu tìm thấy)
router.get("", UserController.getAllUsers);

module.exports = router;
