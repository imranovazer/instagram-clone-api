const mongoose = require("mongoose");

const ChatSessionSchema = new mongoose.Schema({
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  
});

module.exports = mongoose.model("ChatSession", ChatSessionSchema);
