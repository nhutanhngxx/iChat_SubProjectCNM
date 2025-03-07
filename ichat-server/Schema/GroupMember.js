const mongoose= require('mongoose');
const groupMemberSchema = new mongoose.Schema({
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupChats', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    joined_at: { type: Date, default: Date.now }
  }, {
    collection: 'GroupMembers',
    autoCreate: true
  });
 const GroupMembers = mongoose.model('GroupMembers', groupMemberSchema);
  module.exports = GroupMembers;