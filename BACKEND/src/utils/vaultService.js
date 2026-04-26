const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ALGORITHM = "aes-256-cbc";
// Use env var for salt; fallback only for dev. In production VAULT_SALT must be set.
const SALT = process.env.VAULT_SALT || "topicai-dev-salt-change-in-prod";
const KEY = crypto.scryptSync(process.env.VAULT_SECRET || "dev-secret-key", SALT, 32);

/**
 * Encrypt a buffer using AES-256-CBC with a unique random IV per operation.
 * The IV (16 bytes) is prepended to the ciphertext so it can be retrieved on decryption.
 */
exports.encrypt = (buffer) => {
  const iv = crypto.randomBytes(16); // unique IV every time
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  // Prepend IV so decrypt can retrieve it: [16 bytes IV][ciphertext]
  return Buffer.concat([iv, encrypted]);
};

/**
 * Decrypt a buffer that was encrypted by exports.encrypt().
 * Reads the first 16 bytes as the IV, then decrypts the remainder.
 */
exports.decrypt = (encryptedBuffer) => {
  const iv = encryptedBuffer.subarray(0, 16);
  const ciphertext = encryptedBuffer.subarray(16);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

/**
 * Securely deletes a file from the filesystem.
 */
exports.secureDelete = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};
