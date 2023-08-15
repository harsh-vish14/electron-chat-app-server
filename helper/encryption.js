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

exports.groupKeysEncryption = (
  group_chat_private_key,
  group_chat_public_key,
  client_public_key
) => {
  // Simulated private and public keys
  const groupChatPrivate = group_chat_private_key; // Replace with actual private key
  const groupChatPublic = group_chat_public_key; // Replace with actual public key

  // Simulated client's public RSA key (recipient's public key)
  const clientPublicKey = client_public_key; // Replace with actual client's public key

  // Generate a random AES key
  function generateRandomAESKey() {
    return crypto.randomBytes(32); // 256 bits (32 bytes) AES key
  }

  // Encrypt data with AES using a given key
  function encryptWithAES(data, aesKey) {
    const iv = crypto.randomBytes(16); // Generate a random IV
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
  }

  // Encrypt data with RSA using a given public key
  function encryptWithRSA(data, publicKey) {
    return crypto
      .publicEncrypt(publicKey, Buffer.from(data, "utf-8"))
      .toString("base64");
  }

  // Server-side process to send encrypted keys to client
  function sendEncryptedKeysToClient() {
    // Generate AES key
    const aesKey = generateRandomAESKey();

    // Encrypt private and public keys with AES
    const encryptedPrivate = encryptWithAES(groupChatPrivate, aesKey);
    const encryptedPublic = encryptWithAES(groupChatPublic, aesKey);

    // Encrypt AES key with client's public RSA key
    const encryptedAESKey = encryptWithRSA(aesKey, clientPublicKey);

    return {
      encryptedPrivate,
      encryptedPublic,
      encryptedAESKey,
    };
  }

  // Simulate server-side process and send encrypted keys to client
  // const encryptedKeys = sendEncryptedKeysToClient();
  // console.log("Encrypted Private Key:", encryptedKeys.encryptedPrivate);
  // console.log("Encrypted Public Key:", encryptedKeys.encryptedPublic);
  // console.log("Encrypted AES Key:", encryptedKeys.encryptedAESKey);
  return {
    ...sendEncryptedKeysToClient(),
  };
};
