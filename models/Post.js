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
        }],
        createdAt: {
            type: Date,
            default: Date.now()
        },
        

    }
)

PostSchema.pre('find', function (next) {
    this.populate('likes comments author')
    next();
})

module.exports = mongoose.model("Post", PostSchema); 