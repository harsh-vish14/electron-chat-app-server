const bcrypt = require("bcrypt");

exports.hashPassword = async (plainPassword) => {
  const saltRounds = 10; // Number of bcrypt rounds
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plainPassword, salt);
    return hash;
  } catch (error) {
    throw error;
  }
};

exports.comparePasswords = async (userEnteredPassword, savedHashedPassword) => {
  try {
    const result = await bcrypt.compare(
      userEnteredPassword,
      savedHashedPassword
    );
    return result;
  } catch (error) {
    throw error;
  }
};
