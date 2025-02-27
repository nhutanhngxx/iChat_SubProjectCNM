const chatSchema = new mongoose.Schema({
    type: { type: String, enum: ["private", "group"], required: true }
  }, {
    collection: 'Chats'
  });
  mongoose.model('Chats', chatSchema);
  