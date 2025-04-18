const mongoose = require("mongoose");
const friendShipSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    blocked_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: function () {
        return this.status === "blocked";
      },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
    blocked_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: function () {
        return this.status === "blocked";
      },
    },
    requested_at: { type: Date, default: Date.now },
  },
  {
    collection: "Friendship",
    autoCreate: true,
  }
);
const friendShip = mongoose.model("Friendship", friendShipSchema);
module.exports = friendShip;
