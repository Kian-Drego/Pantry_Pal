const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  points: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  profilePic: { type: String, default: "default-avatar.png" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);