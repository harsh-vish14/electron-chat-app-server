const crypto = require("crypto");

exports.encryptWithPublicKey = (publicKey, plainData) => {
  const encryptedData = crypto.publicEncrypt(
    publicKey,
    Buffer.from(JSON.stringify(plainData), "utf-8")
  );
  return encryptedData.toString("base64");
};

exports.decryptWithPrivateKey = (privateKey, encryptedData) => {
  try {
    console.log("Passphrase:", process.env.SECRET_KEY); // Debugging line
    const decryptedData = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase: process.env.SECRET_KEY,
      },
      Buffer.from(encryptedData, "base64")
    );

    return JSON.parse(decryptedData.toString("utf-8"));
  } catch (error) {
    console.log(error);
    throw new Error("Decryption failed"); // Rethrow a custom error message for better handling
  }
};
