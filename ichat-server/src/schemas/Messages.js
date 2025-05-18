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
    card_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessageCard",
      default: null,
    },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "notify"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["sent", "received", "viewed"],
      default: "sent",
    },
    read_by: {
      type: [mongoose.Schema.Types.ObjectId], // array of UserInfo ids
      ref: "UserInfo",
      default: [],
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
    isdelete: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "UserInfo",
      default: [],
    },
    is_group_images: { type: Boolean, default: false },
    group_id: { type: String },
  },
  {
    collection: "Message",
    autoCreate: true,
  }
);
const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
