const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // googleId: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
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

const User = mongoose.model('User', userSchema);
module.exports = User;
