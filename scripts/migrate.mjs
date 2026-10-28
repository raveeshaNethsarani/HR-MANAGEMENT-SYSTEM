#!/usr/bin/env node
/**
 * scripts/migrate.mjs
 * Run once: node scripts/migrate.mjs
 *
 * Drops the old global unique index on LeaveType.leave_type_id
 * and ensures the new per-organization compound index exists.
 */
import mongoose from "mongoose";
import { config } from "dotenv";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

await mongoose.connect(uri);
const col = mongoose.connection.collection("leavetypes");

const indexes = await col.indexes();
const old = indexes.find((i) => i.key?.leave_type_id === 1 && !i.key?.organization);
if (old) {
  await col.dropIndex(old.name);
  console.log("Dropped old global unique index on leave_type_id");
} else {
  console.log("Old index not found – skipping drop");
}

await col.createIndex({ organization: 1, leave_type_id: 1 }, { unique: true });
console.log("Ensured compound index { organization, leave_type_id }");

await mongoose.disconnect();
console.log("Migration complete.");
