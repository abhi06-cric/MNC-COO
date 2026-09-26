const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Company = require('../models/Company');
const Candidate = require('../models/Candidates');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');

const connectDB = require('../config/db');

async function withRetry(fn, label, retries = 4, delay = 1000) {
  for (let i = 1; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      console.log(`   (Retrying ${label} in ${delay / 1000}s due to Atlas network fluctuation...)`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function runBackup() {
  console.log('====================================================');
  console.log('  MNC Executive Portal - Database Backup Utility');
  console.log('====================================================\n');

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Error: MONGO_URI is not set in environment.');
    process.exit(1);
  }

  const backupDir = process.env.BACKUP_DIR
    ? path.resolve(__dirname, '..', process.env.BACKUP_DIR)
    : path.resolve(__dirname, '../backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  try {
    console.log('[1/4] Connecting to MongoDB via resilient connection pool...');
    await connectDB();

    console.log('[2/4] Exporting collections with automated retry resilience...');
    const companies = await withRetry(() => Company.find({}).lean(), 'Companies');
    console.log(`   ✓ Exported ${companies.length} companies`);

    const candidates = await withRetry(() => Candidate.find({}).lean(), 'Candidates');
    console.log(`   ✓ Exported ${candidates.length} candidates`);

    const admins = await withRetry(() => Admin.find({}).select('-passwordHash -salt').lean(), 'Admins');
    console.log(`   ✓ Exported ${admins.length} admins`);

    const auditLogs = await withRetry(() => AuditLog.find({}).sort({ createdAt: -1 }).limit(1000).lean(), 'AuditLogs');
    console.log(`   ✓ Exported ${auditLogs.length} audit logs`);

    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        exportedBy: 'MNC Backup Daemon',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        counts: {
          companies: companies.length,
          candidates: candidates.length,
          admins: admins.length,
          auditLogs: auditLogs.length
        }
      },
      collections: {
        companies,
        candidates,
        admins,
        auditLogs
      }
    };

    console.log('[3/4] Writing snapshot to disk...');
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `mnc_backup_${dateStr}.json`;
    const filePath = path.join(backupDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');

    console.log('\n====================================================');
    console.log('✅ BACKUP COMPLETED SUCCESSFULLY');
    console.log(`📁 File: ${filePath}`);
    console.log(`📊 Statistics:`);
    console.log(`   • Companies:   ${companies.length} records`);
    console.log(`   • Candidates:  ${candidates.length} records`);
    console.log(`   • Admins:      ${admins.length} records`);
    console.log(`   • Audit Logs:  ${auditLogs.length} records`);
    console.log('====================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Backup failed with error:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runBackup();
