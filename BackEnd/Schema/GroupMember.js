const groupMemberSchema = new mongoose.Schema({
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupChats', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    joined_at: { type: Date, default: Date.now }
  }, {
    collection: 'GroupMembers'
  });
  mongoose.model('GroupMembers', groupMemberSchema);
  