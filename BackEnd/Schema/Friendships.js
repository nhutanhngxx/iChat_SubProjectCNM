const mongoose= require('mongoose');
const friendshipSchema = new mongoose.Schema({
    user_id_1: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    user_id_2: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    status: { type: String, enum: ["pending", "accepted", "blocked"], default: "pending" },
    requested_at: { type: Date, default: Date.now }
  }, {
    collection: 'Friendships',
    autoCreate: true
  });
  const Friendships = mongoose.model('Friendships', friendshipSchema);
  module.exports = Friendships;
  