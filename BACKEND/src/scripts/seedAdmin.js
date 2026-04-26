/**
 * @file seedAdmin.js
 * @purpose One-time script to create the initial admin user in MongoDB.
 *   Run manually with: node src/scripts/seedAdmin.js
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [Authentication Bypass / The Hidden Dangers in Password Handling]
 *   - Admin password is read exclusively from the ADMIN_PASS environment
 *     variable — NEVER hardcoded in source code.
 *   - The script exits with code 1 if ADMIN_PASS is not set, preventing
 *     any fallback to a weak default password in production environments.
 *   - The password is hashed by the User model's bcrypt pre-save hook
 *     before being written to the database.
 *
 * [Missing or Incorrect Authorization]
 *   - The seeded user is created with role: "admin" — this role assignment
 *     happens server-side within a controlled script, not through an API
 *     that could be abused.
 *
 * [Error Handling]
 *   - If the admin already exists, the script skips creation gracefully
 *     rather than throwing a duplicate key error.
 */

const mongoose = require("mongoose");
const dotenv   = require("dotenv");

dotenv.config({ path: "./.env" });

const seedAdmin = async () => {
  try {
    /**
     * [Authentication Bypass / The Hidden Dangers in Password Handling]
     * Refuse to run without an explicit ADMIN_PASS environment variable.
     * This prevents weak/default passwords from being seeded in production
     * if the developer forgets to set the env var.
     */
    if (!process.env.ADMIN_PASS) {
      console.error("ERROR: ADMIN_PASS is not set in your .env file. Refusing to seed with a default password.");
      process.exit(1);
    }

    const baseUri = process.env.MONGODB_URL || "mongodb://localhost:27017";
    const dbName  = process.env.MONGODB_DB  || "APiSecurity";
    const uri     = `${baseUri}/${dbName}`;

    await mongoose.connect(uri);
    console.log("MongoDB connected for seeding.");

    // Lazy-load the User model AFTER mongoose is connected
    const User = require("../models/User");

    // Check if an admin already exists to avoid duplicate seeding
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    /**
     * [The Hidden Dangers in Password Handling]
     * Password comes from ADMIN_PASS env var.
     * The User model's pre-save hook will bcrypt-hash it before persistence.
     * The schema validator enforces strong password policy (uppercase, lowercase,
     * digit, special character, minimum 8 chars) before hashing runs.
     */
    await User.create({
      name:            "Platform Admin",
      email:           process.env.ADMIN_EMAIL || "admin@topicai.com",
      password:        process.env.ADMIN_PASS,
      role:            "admin",
      isEmailVerified: true,
    });

    console.log("Admin user seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
