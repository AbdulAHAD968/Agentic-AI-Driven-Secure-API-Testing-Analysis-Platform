const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    scanSettings: {
      sastEnabled: { type: Boolean, default: true },
      dastEnabled: { type: Boolean, default: true },
      scanFrequency: { type: String, enum: ["manual", "daily", "weekly"], default: "manual" },
    },
    lastScan: {
      type: Date,
    },
    scanStatus: {
      type: String,
      enum: ["idle", "scanning", "completed", "failed"],
      default: "idle",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
