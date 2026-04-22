const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");


dotenv.config({ path: "./.env" });

const seedAdmin = async () => {
  try {

    const baseUri = process.env.MONGODB_URL || "mongodb://localhost:27017";
    const dbName = process.env.MONGODB_DB || "APiSecurity";
    const connStr = baseUri.endsWith("/") ? `${baseUri}${dbName}` : `${baseUri}/${dbName}`;

    await mongoose.connect(connStr);
    console.log("Connected to MongoDB for seeding...");


    const adminData = {
      name: "Super Admin",
      email: "admin@gmail.com",
      password: "TopicAI@2026",
      role: "admin",
      isEmailVerified: true
    };


    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("Admin user already exists. Updating password and role...");
      existingAdmin.password = adminData.password;
      existingAdmin.role = "admin";
      existingAdmin.isEmailVerified = true;
      await existingAdmin.save();
      console.log("Admin updated successfully.");
    } else {
      await User.create(adminData);
      console.log("Admin user created successfully.");
    }

    console.log("Seeding complete. Exiting...");
    process.exit();
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();
