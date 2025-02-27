const groupChatSchema = new mongoose.Schema({
    chat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chats', required: true },
    name: { type: String, required: true },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    avatar: { type: String, default: "" },
    created_at: { type: Date, default: Date.now }
  }, {
    collection: 'GroupChats'
  });
  mongoose.model('GroupChats', groupChatSchema);
  