exports.isUserInList = (userIdToCheck, userList) => {
  return userList.some((userId) => userId.equals(userIdToCheck));
};
