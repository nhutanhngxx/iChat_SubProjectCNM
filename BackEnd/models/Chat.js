const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
  },
  {
    collection: "Chat",
    autoCreate: true,
  }
);
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
