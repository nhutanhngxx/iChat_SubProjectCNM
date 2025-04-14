const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, expires: 300, default: Date.now },
    expiresAt: { type: Date, require: true },
  },
  {
    collection: "OTP",
    autoCreate: true,
  }
);

module.exports = mongoose.model("OTP", OTPSchema);
