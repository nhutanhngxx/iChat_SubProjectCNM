const mongoose = require("mongoose");

const messageCardSchema = new mongoose.Schema(
  {
    own_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    card_color: { type: String, default: "#FFFFFF" },
    title: { type: String, required: true },
  },
  {
    collection: "MessageCard",
    timestamps: true,
    autoCreate: true,
  }
);

const MessageCard = mongoose.model("MessageCard", messageCardSchema);
module.exports = MessageCard;
