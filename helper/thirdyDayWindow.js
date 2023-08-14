exports.thirtyDaysWindow = (iat, exp) => {
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const thirtyDaysInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds

  if (
    iat + thirtyDaysInSeconds >= currentTime &&
    exp - thirtyDaysInSeconds <= currentTime
  ) {
    return true;
  } else {
    return false;
  }
};
