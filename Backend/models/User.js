const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  bio: { 
    type: String, 
    default: "" 
  },
  points: { 
    type: Number, 
    default: 0 
  },
  /**
   * FOLLOW SYSTEM
   * Using an array of ObjectIds allows us to use .length for counts
   * and .includes() or $addToSet for relationship logic.
   */
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: [] 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: [] 
  }],
  profilePic: { 
    type: String, 
    default: "https://via.placeholder.com/150?text=Chef" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create an index to make looking up followers/following faster as your user base grows
UserSchema.index({ followers: 1 });
UserSchema.index({ following: 1 });

module.exports = mongoose.model('User', UserSchema);