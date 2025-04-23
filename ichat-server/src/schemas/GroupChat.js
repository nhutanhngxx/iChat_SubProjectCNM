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
    allow_add_members: { type: Boolean, default: true },
    allow_change_name: { type: Boolean, default: true },
    allow_change_avatar: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
  },
  {
    collection: "GroupChat",
    autoCreate: true,
  }
);
const GroupChats = mongoose.model("GroupChat", groupChatSchema);
module.exports = GroupChats;
