const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config({ path: "./.env" });

const email = process.argv[2];

if (!email) {
  console.error("Usage: node src/scripts/promoteAdmin.js <email>");
  process.exit(1);
}

(async () => {
  try {
    const baseUri = process.env.MONGODB_URL || "mongodb://localhost:27017";
    const dbName = process.env.MONGODB_DB || "APiSecurity";
    const connStr = baseUri.endsWith("/") ? `${baseUri}${dbName}` : `${baseUri}/${dbName}`;

    await mongoose.connect(connStr);
    console.log(`Connected to ${dbName}`);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`No user found with email ${email}. Sign in via Ory at least once so the account is created, then re-run this script.`);
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`User ${email} is already an admin. Nothing to do.`);
    } else {
      user.role = "admin";
      await user.save();
      console.log(`Promoted ${email} to admin.`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error promoting admin:", err);
    process.exit(1);
  }
})();
