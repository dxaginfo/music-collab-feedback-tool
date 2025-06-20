const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  role: {
    type: String,
    enum: ['artist', 'producer', 'engineer', 'manager', 'listener'],
    default: 'artist'
  },
  settings: {
    notificationPreferences: {
      email: {
        comments: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        newVersions: { type: Boolean, default: true },
        projectInvites: { type: Boolean, default: true }
      },
      inApp: {
        comments: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        newVersions: { type: Boolean, default: true },
        projectInvites: { type: Boolean, default: true }
      }
    },
    displayPreferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      audioQuality: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      waveformType: { type: String, enum: ['standard', 'bars', 'line'], default: 'standard' }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update timestamps
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'supersecretdevkey',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);