const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");

router.post("/register", AuthController.register); // Đăng ký người dùng mới
router.post("/check-existed-phone", AuthController.checkExistedPhone); // Kiểm tra số điện thoại đã tồn tại hay chưa
router.post("/login", AuthController.login); // Đăng nhập
router.post("/logout", AuthController.logout); // Đăng xuất
router.get("/qr-session", AuthController.getQRSession); // Lấy sessionId cho QR login
router.post("/qr-login", AuthController.qrLogin); // Đăng nhập bằng QR code
router.post("/confirm-login", AuthController.confirmLogin); // Xác nhận đăng nhập bằng QR code
router.get("/me", AuthController.getMe); // Lấy thông tin người dùng hiện tại
router.put("/change-password", AuthController.changePassword); // Đổi mật khẩu
router.post("/reset-password", AuthController.resetPassword); // Đặt lại mật khẩu
router.put("/update-phone", AuthController.updatePhone);
router.delete("/delete-account", AuthController.deleteAccount);
router.post("/confirm-phone", AuthController.confirmPhone);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/verify-password", AuthController.verifyPassword);
module.exports = router;
