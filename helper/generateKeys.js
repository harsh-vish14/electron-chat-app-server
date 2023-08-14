const crypto = require("crypto");

exports.generateKeyPair = () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096, // Key length in bits
    publicKeyEncoding: {
      type: "pkcs1", // Format of the public key
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1", // Format of the private key
      format: "pem",
      cipher: "aes-256-cbc", // Optional: Encrypt the private key
      passphrase: process.env.SECRET_KEY, // Passphrase for encrypting the private key
    },
  });

  return {
    private: privateKey.toString(),
    public: publicKey.toString(),
  };
};
