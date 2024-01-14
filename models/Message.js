const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession" },
  text: {
    type: string,
    required: [true, "Message can not empty string"],
  },
});

module.exports = mongoose.model("Message", messageSchema);
  