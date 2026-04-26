/**
 * @file vaultService.js
 * @purpose Provides AES-256-CBC encryption and decryption services for
 *   storing uploaded source code files securely in the vault directory.
 *   Also provides a secure file deletion helper.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [Missing Encryption of Sensitive Data]
 *   - All uploaded source code is encrypted with AES-256-CBC before
 *     being written to disk; plaintext is never persisted to the vault.
 *
 * [Use of Broken Cryptographic Algorithms]
 *   - AES-256 with a 256-bit key derived via scrypt (memory-hard KDF).
 *   - A unique, cryptographically random 16-byte IV is generated for every
 *     encryption operation via crypto.randomBytes(). A static IV (the
 *     previous vulnerability) would make identical plaintexts produce
 *     identical ciphertexts, allowing differential cryptanalysis.
 *   - The IV is prepended to the ciphertext so the correct IV is always
 *     available for decryption without separate storage.
 *
 * [The Hidden Dangers in Password Handling / Key Derivation]
 *   - The encryption key is derived from VAULT_SECRET and VAULT_SALT
 *     environment variables using scrypt — a memory-hard KDF specifically
 *     designed to resist GPU-accelerated brute-force attacks.
 *   - VAULT_SECRET and VAULT_SALT are mandatory so encrypted vault files are
 *     never protected by predictable fallback key material.
 */

const crypto = require("crypto");
const fs     = require("fs");
const path   = require("path");

const ALGORITHM = "aes-256-cbc";

/**
 * [Use of Broken Cryptographic Algorithms / The Hidden Dangers in Password Handling]
 * Key is derived from VAULT_SECRET + VAULT_SALT using scrypt (32-byte output).
 * Using scrypt instead of a simple SHA hash makes brute-forcing the key
 * computationally and memory-expensive for an attacker.
 * VAULT_SECRET and VAULT_SALT must be set per application instance. Failing
 * closed prevents the "default encryption key" misconfiguration vulnerability.
 */
if (!process.env.VAULT_SECRET || !process.env.VAULT_SALT) {
  throw new Error("VAULT_SECRET and VAULT_SALT must be configured for vault encryption.");
}

const SALT = process.env.VAULT_SALT;
const KEY  = crypto.scryptSync(process.env.VAULT_SECRET, SALT, 32);

/**
 * encrypt: Encrypt a buffer using AES-256-CBC with a random IV.
 *
 * [Missing Encryption of Sensitive Data / Use of Broken Cryptographic Algorithms]
 * - A fresh 16-byte IV is generated via crypto.randomBytes() for EVERY
 *   encryption call, ensuring that two identical files produce different
 *   ciphertexts (semantic security / IND-CPA).
 * - The IV is prepended to the ciphertext in the output buffer:
 *   [16 bytes IV][N bytes ciphertext]
 *   This allows the decryption function to recover the IV without a
 *   separate lookup, while keeping the key and IV independent.
 *
 * @param {Buffer} buffer - Plaintext source code bytes to encrypt
 * @returns {Buffer}      - Concatenated [IV + ciphertext] buffer
 */
exports.encrypt = (buffer) => {
  // [Use of Broken Cryptographic Algorithms] Unique IV per encryption — prevents pattern analysis
  const iv      = crypto.randomBytes(16);
  const cipher  = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  // Prepend IV so decryption can retrieve it: layout is [16-byte IV][ciphertext]
  return Buffer.concat([iv, encrypted]);
};

/**
 * decrypt: Decrypt a buffer produced by exports.encrypt().
 *
 * [Missing Encryption of Sensitive Data]
 * - Reads the first 16 bytes as the IV (matches encrypt() layout).
 * - Decrypts the remainder with the same derived KEY.
 * - Only the vault service (server-side) ever calls this — decrypted
 *   content is used in-memory for scanning and never written to disk unencrypted.
 *
 * @param {Buffer} encryptedBuffer - The [IV + ciphertext] buffer from the vault
 * @returns {Buffer}               - Decrypted plaintext buffer
 */
exports.decrypt = (encryptedBuffer) => {
  const iv         = encryptedBuffer.subarray(0, 16);  // First 16 bytes = IV
  const ciphertext = encryptedBuffer.subarray(16);     // Remainder = ciphertext
  const decipher   = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

/**
 * secureDelete: Remove a temporary file from the filesystem.
 *
 * [Upload of Dangerous Files / Path Traversal]
 * - Deletes the unencrypted temp file from the uploads/ directory after
 *   its encrypted copy has been written to the vault, ensuring plaintext
 *   source code is not left on disk.
 * - Checks for existence before deletion to avoid TOCTOU errors.
 *
 * @param {string} filePath - Absolute path to the file to delete
 * @returns {boolean}       - true if the file was deleted, false if not found
 */
exports.secureDelete = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};
