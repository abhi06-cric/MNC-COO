const mongoose = require('mongoose');

const adminOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    otp: {
      type: String,
      required: true
    },
    tempPasswordHash: {
      type: String
    },
    tempSalt: {
      type: String
    },
    attempts: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index: auto-deletes when expiresAt timestamp arrives
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AdminOtp', adminOtpSchema);
