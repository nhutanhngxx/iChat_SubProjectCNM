const mongoose = require("mongoose");
const groupMemberSchema = new mongoose.Schema(
  {
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupChats",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    joined_at: { type: Date, default: Date.now },
  },
  {
    collection: "GroupMember",
    autoCreate: true,
  }
);
const GroupMembers = mongoose.model("GroupMember", groupMemberSchema);
module.exports = GroupMembers;
