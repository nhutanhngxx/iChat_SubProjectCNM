const mongoose= require('mongoose');
const chatSchema = new mongoose.Schema({
    type: { type: String, enum: ["private", "group"], required: true }
  }, {
    collection: 'Chats',
    autoCreate: true
  });
 const Chat = mongoose.model('Chats', chatSchema);
  module.exports = Chat;