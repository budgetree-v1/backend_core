const fs = require("fs");
const crypto = require("crypto");

function generateSignature(clientId, publicKeyPath) {
  const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
  const data = `${clientId}.${timestamp}`;

  // Read the public key
  const publicKey = fs.readFileSync(publicKeyPath, "utf8");

  // Encrypt the data using the public key
  const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(data));

  // Return the base64 encoded encrypted string
  return encrypted.toString("base64");
}

module.exports = generateSignature;
