const mongoose = require("mongoose");

const GroupInvitationSchema = new mongoose.Schema(
  {
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupChat",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    max_uses: {
      type: Number,
      default: null, // null means unlimited
    },
    use_count: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GroupInvitation", GroupInvitationSchema);
