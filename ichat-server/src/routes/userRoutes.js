const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { uploadFile } = require("../services/upload-file");

require("dotenv").config();
const cookieParser = require("cookie-parser");
router.use(cookieParser());

const UserController = require("../controllers/userController");

// Cập nhật thông tin User - thêm middleware xử lý upload
router.put(
  "/update/:id",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  UserController.updateInfoUser
);

// Lấy thông tin User từ Bearer Token
router.post("/userdata", UserController.getUserFromToken);

// Lấy thông tin User từ ID
router.get("/:id", UserController.getUserById);

// Lấy tất cả user từ database (Tìm kiếm nếu tìm thấy)
router.get("", UserController.getAllUsers);

module.exports = router;
