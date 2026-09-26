const mongoose = require('mongoose');
const crypto = require('crypto');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    salt: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'System Administrator',
      trim: true
    },
    role: {
      type: String,
      default: 'superadmin'
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Helper to hash password
adminSchema.statics.hashPassword = function (password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
};

// Helper to verify password
adminSchema.methods.verifyPassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex');
  return this.passwordHash === hash;
};

module.exports = mongoose.model('Admin', adminSchema);
