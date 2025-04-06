const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");

router.post("/register", AuthController.register);
router.post("/check-existed-phone", AuthController.checkExistedPhone);

module.exports = router;
