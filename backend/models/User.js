const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);