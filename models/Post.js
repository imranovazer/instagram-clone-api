const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        name: {
            required: [true, "Privide the name of post"],
            type: String
        },
        description: {
            required: [true, "Privide the name of post"],
            type: String
        },
        photo: {
            type: String
        }
        ,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
        ,
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }]

    }
)

module.exports = mongoose.model("Post", PostSchema); 