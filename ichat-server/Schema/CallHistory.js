const mongoose= require('mongoose');
const callHistorySchema = new mongoose.Schema({
    caller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    type: { type: String, enum: ["voice", "video"], required: true },
    start_time: { type: Date, default: Date.now },
    duration: { type: Number, required: true }, // Thời gian cuộc gọi tính bằng giây
    end_time: { type: Date, required: true },
    status: { type: String, enum: ["missed", "answered", "declined"], required: true }
  }, {
    collection: 'CallHistory',
    autoCreate: true
  });
 const CallHistory = mongoose.model('CallHistory', callHistorySchema);
 module.exports = CallHistory;
  