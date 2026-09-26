const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Company = require('../models/Company');
const Candidate = require('../models/Candidates');
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

async function runRestore() {
  console.log('====================================================');
  console.log('  MNC Executive Portal - Database Restore Utility');
  console.log('====================================================\n');

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Error: MONGO_URI is not configured.');
    process.exit(1);
  }

  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    console.error('No backup directory found at:', backupDir);
    process.exit(1);
  }

  // Find most recent backup or use file passed in argv
  let targetFile = process.argv[2];
  if (!targetFile) {
    const files = fs.readdirSync(backupDir).filter((f) => f.endsWith('.json')).sort().reverse();
    if (files.length === 0) {
      console.error('No .json backup files found in', backupDir);
      process.exit(1);
    }
    targetFile = path.join(backupDir, files[0]);
  } else {
    targetFile = path.resolve(targetFile);
  }

  console.log(`[1/3] Reading backup file: ${targetFile}`);
  const raw = fs.readFileSync(targetFile, 'utf-8');
  const backup = JSON.parse(raw);

  try {
    console.log('[2/3] Connecting to MongoDB via resilient connection pool...');
    await connectDB();

    console.log('[3/3] Restoring collections safely...');
    if (backup.collections?.companies?.length) {
      await withRetry(async () => {
        for (const comp of backup.collections.companies) {
          await Company.updateOne({ name: comp.name }, { $set: comp }, { upsert: true });
        }
      }, 'Companies Restore');
      console.log(`   ✓ Restored ${backup.collections.companies.length} companies`);
    }

    if (backup.collections?.candidates?.length) {
      await withRetry(async () => {
        for (const cand of backup.collections.candidates) {
          await Candidate.updateOne({ name: cand.name, role: cand.role }, { $set: cand }, { upsert: true });
        }
      }, 'Candidates Restore');
      console.log(`   ✓ Restored ${backup.collections.candidates.length} candidates`);
    }

    console.log('\n✅ RESTORE COMPLETED SUCCESSFULLY\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Restore failed:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runRestore();
