const mongoose = require("mongoose");
const attachmentSchema = new mongoose.Schema(
  {
    message_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      required: true,
    },
    file_url: { type: String, required: true },
    file_type: {
      type: String,
      enum: ["image", "video", "document", "audio"],
      required: true,
    },
    file_size: { type: Number, required: true },
    uploaded_at: { type: Date, default: Date.now },
  },
  {
    collection: "Attachment",
    autoCreate: true,
  }
);
const Attachments = mongoose.model("Attachment", attachmentSchema);
module.exports = Attachments;
