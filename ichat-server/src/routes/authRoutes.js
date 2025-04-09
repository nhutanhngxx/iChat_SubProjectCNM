const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");

router.post("/register", AuthController.register); // Đăng ký người dùng mới
router.post("/check-existed-phone", AuthController.checkExistedPhone); // Kiểm tra số điện thoại đã tồn tại hay chưa
router.post("/login", AuthController.login); // Đăng nhập
router.post("/logout", AuthController.logout); // Đăng xuất

module.exports = router;
