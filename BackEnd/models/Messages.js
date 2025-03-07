const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "image", "video", "file"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["sent", "received", "Viewed"],
      default: "sent",
    },
    chat_type: { type: String, enum: ["private", "group"], required: true },
    // Mảng chứa các reaction, cho phép null hoặc rỗng
    reactions: {
      type: [
        {
          user_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserInfo" },
          reaction_type: {
            type: String,
            enum: ["like", "love", "haha", "wow", "sad", "angry"],
            required: true,
          },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [], // Mặc định là mảng rỗng, không bắt buộc phải có dữ liệu
    },
    // Trạng thái ghim tin nhắn
    is_pinned: { type: Boolean, default: false },
    reply_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      default: null,
    },
  },
  {
    collection: "Message",
    autoCreate: true,
  }
);
const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
