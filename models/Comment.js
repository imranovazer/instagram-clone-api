const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "The text of comment is required "],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
});
CommentSchema.pre("find", function (next) {
  this.populate("user");
  next();
});

module.exports = mongoose.model("Comment", CommentSchema);
