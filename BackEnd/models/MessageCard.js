const mongoose = require("mongoose");

const messageCardSchema = new mongoose.Schema(
  {
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    }, // Người nhận
    message_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      required: true,
    }, // Tin nhắn liên quan
    status: {
      type: String,
      enum: ["unread", "read"],
      required: true,
      default: "unread",
    }, // Trạng thái tin nhắn
    card_color: { type: String, default: "#FFFFFF" }, // Màu sắc của card (VD: đỏ, xanh)
    title: { type: String, required: true }, // Tiêu đề của card
  },
  {
    collection: "MessageCard",
    timestamps: true,
    autoCreate: true,
  }
);

const MessageCard = mongoose.model("MessageCard", messageCardSchema);
module.exports = MessageCard;
