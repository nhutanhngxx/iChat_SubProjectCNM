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
    allow_change_name: { type: Boolean, default: true },
    allow_change_avatar: { type: Boolean, default: true },
    require_approval: { type: Boolean, default: false }, // Yêu cầu thêm thành viên mới phải được duyệt bởi nhóm trưởng (admin)
    created_at: { type: Date, default: Date.now },
  },
  {
    collection: "GroupChat",
    autoCreate: true,
  }
);
const GroupChats = mongoose.model("GroupChat", groupChatSchema);
module.exports = GroupChats;
