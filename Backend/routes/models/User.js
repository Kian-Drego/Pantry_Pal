const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3 }, // Based on validation in create profile.html
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 }, // Based on validation in create profile.html
  bio: { type: String, default: "" },
  profilePicture: { type: String, default: "" }
});
module.exports = mongoose.model('User', UserSchema);