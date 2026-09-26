const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING', 'BLOCKED'],
      default: 'SUCCESS',
      index: true
    },
    actor: {
      email: { type: String, default: 'anonymous' },
      id: { type: String, default: null },
      role: { type: String, default: 'guest' }
    },
    ip: {
      type: String,
      default: 'unknown'
    },
    userAgent: {
      type: String,
      default: 'unknown'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Helper static method for streamlined logging
auditLogSchema.statics.record = async function ({
  action,
  status = 'SUCCESS',
  actor = {},
  ip = 'unknown',
  userAgent = 'unknown',
  details = {}
}) {
  try {
    const entry = new this({
      action,
      status,
      actor: {
        email: actor.email || 'anonymous',
        id: actor.id || actor._id || null,
        role: actor.role || 'guest'
      },
      ip,
      userAgent,
      details,
      timestamp: new Date()
    });
    await entry.save();
    return entry;
  } catch (err) {
    console.error('[AUDIT LOG ERROR] Failed to record audit log:', err.message);
    return null;
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
