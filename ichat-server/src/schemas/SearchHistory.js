const mongoose = require("mongoose");
const searchHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    query: { type: String, required: true },
    selected_contact_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
    },
    timestamp: { type: Date, default: Date.now },
    search_type: {
      type: String,
      enum: ["user", "group", "message"],
      required: true,
    },
  },
  {
    collection: "SearchHistory",
    autoCreate: true,
  }
);
const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);
module.exports = SearchHistory;
