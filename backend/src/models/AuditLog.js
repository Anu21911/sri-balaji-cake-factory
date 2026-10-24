const { createModel } = require('./modelAdapter');

const auditLogSchemaDef = {
  action: { type: String, required: true },
  entityType: { type: String, required: true }, // 'order', 'product', 'custom_cake', 'owner', 'settings'
  entityId: { type: String, required: true },
  performedBy: {
    role: { type: String, required: true },
    id: { type: String },
    name: { type: String }
  },
  details: { type: Object, default: {} },
  ipAddress: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
};

const AuditLog = createModel('AuditLog', auditLogSchemaDef, 'auditLogs');

module.exports = AuditLog;
