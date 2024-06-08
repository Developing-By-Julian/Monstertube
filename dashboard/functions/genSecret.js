const speakeasy = require("speakeasy");

function generate_secret_key() {
  // Generate a secret key
  const secretKey = speakeasy.generateSecret({ length: 20 });

  return secretKey;
}

module.exports = generate_secret_key;