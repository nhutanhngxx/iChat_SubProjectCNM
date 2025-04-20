const mongoose = require("mongoose");
const groupChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    avatar: { type: String, default: "" },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    created_at: { type: Date, default: Date.now },
  },
  {
    collection: "GroupChat",
    autoCreate: true,
  }
);
const GroupChats = mongoose.model("GroupChat", groupChatSchema);
module.exports = GroupChats;
