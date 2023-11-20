const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        photo: {
            type: String,
            default: "default.jpg"
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
    }
)
UserSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
UserSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
