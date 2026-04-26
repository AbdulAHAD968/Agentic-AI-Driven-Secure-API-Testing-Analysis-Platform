/**
 * @file User.js
 * @purpose Mongoose schema and model for the User entity.
 *   Defines all user fields, enforces strong password policy,
 *   handles bcrypt hashing, and provides token generation methods.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [The Hidden Dangers in Password Handling / Authentication Bypass]
 *   - Passwords are hashed with bcrypt at cost factor 12 (memory-hard,
 *     slow hash). Raw plaintext is NEVER persisted to the database.
 *   - The password field has select: false so it is never returned
 *     in queries unless explicitly requested.
 *
 * [Use of Broken Cryptographic Algorithms]
 *   - Verification and reset tokens are generated with
 *     crypto.randomBytes(32) (cryptographically secure PRNG) and stored
 *     only as SHA-256 digests — the raw token is never persisted,
 *     preventing database-dump token harvesting.
 *
 * [Reliance on Untrusted Inputs / Input Validation]
 *   - Email field enforces a regex format validator at the schema level.
 *   - Password field enforces a policy validator: ≥8 chars, uppercase,
 *     lowercase, digit, and special character — all server-side.
 *
 * [Authentication Bypass]
 *   - Account lockout fields (loginAttempts, lockUntil) are defined here
 *     and enforced in authController.login.
 *
 * [Missing or Incorrect Authorization]
 *   - The role field is constrained to an enum ["user", "admin"] so
 *     no arbitrary privilege strings can be injected.
 *
 * [Missing Encryption of Sensitive Data]
 *   - twoFactorSecret and twoFactorAuthTempSecret are both flagged
 *     select: false so they are excluded from normal query results.
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");

const userSchema = new mongoose.Schema(
  {
    /**
     * oryId links this record to an Ory Network identity when the user
     * authenticates via the Ory frontend SDK.
     * sparse: true allows multiple null values (non-Ory users).
     */
    oryId: {
      type: String,
      unique: true,
      sparse: true,
    },

    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },

    /**
     * [Input Validation]
     * Email is forced to lowercase and validated against an RFC-ish regex
     * at the schema level — server-side, not client-side.
     */
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },

    /**
     * [The Hidden Dangers in Password Handling]
     * - select: false ensures the password hash is never returned in API responses.
     * - The validator enforces a strong policy (mixed case, digit, special char)
     *   BEFORE the pre-save bcrypt hook runs, preventing weak password storage.
     * - Ory-managed users (no local password) pass validation with an empty/null value.
     */
    password: {
      type: String,
      select: false,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty for Ory-federated users
          if (!this.isModified("password")) return true;
          // Policy: ≥8 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
        },
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      },
    },

    /**
     * [Missing or Incorrect Authorization / API5:2023 - Broken Function Level Authorization]
     * Role is restricted to a strict enum. Only the authMiddleware (server-side)
     * can elevate a user to admin via the ADMIN_EMAILS env list.
     */
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isEmailVerified: { type: Boolean, default: false },

    /**
     * [Use of Broken Cryptographic Algorithms]
     * Verification tokens are stored as SHA-256 digests, not raw values.
     * Tokens expire after 24 hours.
     */
    verificationToken:       String,
    verificationTokenExpire: Date,

    /**
     * [Use of Broken Cryptographic Algorithms]
     * Password reset tokens are stored as SHA-256 digests and expire in 10 minutes.
     */
    resetPasswordToken:  String,
    resetPasswordExpire: Date,

    /**
     * [Authentication Bypass - MFA]
     * TOTP secret is select: false so it is excluded from all normal queries.
     * twoFactorAuthTempSecret holds the secret only during setup flow and is
     * cleared once the user confirms their first TOTP code.
     */
    twoFactorSecret: {
      type: String,
      select: false,
    },
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorAuthTempSecret: {
      type: String,
      select: false,
    },

    avatar:    { type: String, default: "" },
    lastLogin: Date,
    active:    { type: Boolean, default: true },

    /**
     * [Authentication Bypass - Account Lockout]
     * loginAttempts counts consecutive failed login attempts.
     * lockUntil is a Unix timestamp; if in the future, the account is locked.
     * Enforced in authController.login.
     */
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil:     { type: Number },
  },
  { timestamps: true }
);

/**
 * Pre-save hook: bcrypt password hashing.
 *
 * [The Hidden Dangers in Password Handling]
 * - Only runs when the password field has been modified (avoids re-hashing).
 * - Cost factor 12 makes bcrypt deliberately slow against brute-force attacks.
 * - Plaintext is replaced by the hash BEFORE writing to MongoDB.
 *
 * Input:  this (User document being saved)
 * Output: this.password replaced with bcrypt hash
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  // bcrypt with cost factor 12: memory-hard, slow — appropriate for passwords
  this.password = await bcrypt.hash(this.password, 12);
});

/**
 * comparePassword: Constant-time bcrypt comparison.
 *
 * [Authentication Bypass / The Hidden Dangers in Password Handling]
 * bcrypt.compare performs a timing-safe comparison, preventing timing
 * side-channel attacks that could reveal partial password matches.
 *
 * @param {string} candidatePassword - Plaintext password from login request
 * @param {string} userPassword      - Stored bcrypt hash from database
 * @returns {Promise<boolean>}       - true if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * createVerificationToken: Generate a cryptographically secure email verification token.
 *
 * [Use of Broken Cryptographic Algorithms / Downloading Code Without Integrity Checks]
 * - Uses crypto.randomBytes(32) — a CSPRNG, not Math.random().
 * - Stores only the SHA-256 digest in the database; raw token is sent to user
 *   via email only. Even if the database is compromised, the raw token cannot
 *   be derived from the stored hash.
 * - Token expires in 24 hours.
 *
 * @returns {string} The raw (unhashed) 32-byte hex token to include in email URL
 */
userSchema.methods.createVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  // Store only the hash — raw token travels via email link only
  this.verificationToken       = crypto.createHash("sha256").update(token).digest("hex");
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

/**
 * createPasswordResetToken: Generate a short-lived password reset token.
 *
 * [Use of Broken Cryptographic Algorithms]
 * - Same CSPRNG + SHA-256 digest pattern as createVerificationToken.
 * - Short 10-minute expiry limits the attack window for stolen reset links.
 *
 * @returns {string} The raw (unhashed) reset token to embed in the reset URL
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken   = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire  = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
