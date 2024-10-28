const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    // Add other fields as necessary
});

const UserInfo = mongoose.model('UserInfo', userSchema);
module.exports = UserInfo;

