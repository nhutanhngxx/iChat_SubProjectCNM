const mongoose = require("mongoose");

const userDetailSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dob: { type: Date, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar_path: { type: String, default: "" },
    cover_path: { type: String, default: "" },
    status: { type: String, enum: ["Online", "Offline"], default: "Offline" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: "UserInfo",
    autoCreate: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Thêm một virtual field để định dạng lại `dob` theo miền của Việt Nam
userDetailSchema.virtual("dobFormatted").get(function () {
  if (!this.dob) return "";
  const date = new Date(this.dob);
  return new Date(
    date.getTime() + date.getTimezoneOffset() * 60000
  ).toLocaleDateString("vi-VN");
});

const User = mongoose.model("UserInfo", userDetailSchema);
module.exports = User;
