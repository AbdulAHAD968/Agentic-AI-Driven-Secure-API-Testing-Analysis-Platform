const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ALGORITHM = "aes-256-cbc";
const KEY = crypto.scryptSync(process.env.VAULT_SECRET || "dev-secret-key", "salt", 32);
const IV = Buffer.alloc(16, 0); 


exports.encrypt = (buffer) => {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return encrypted;
};


exports.decrypt = (encryptedBuffer) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  return decrypted;
};


exports.secureDelete = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};
