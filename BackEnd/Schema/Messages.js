const mongoose= require('mongoose');
const messageSchema = new mongoose.Schema({
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "video", "file"], required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["sent", "received", "Viewed"], default: "sent" },
    chat_type: { type: String, enum: ["private", "group"], required: true }
  }, {
    collection: 'Messages',
    autoCreate: true
  });
 const Message = mongoose.model('Messages', messageSchema);
  module.exports = Message;