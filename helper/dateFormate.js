exports.formatDateTime = (dateTimeString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  const dateObj = new Date(dateTimeString);

  const formattedDate = dateObj.toLocaleDateString("en-US", options);

  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const formattedTime = `${hours % 12 || 12}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;

  return { date: formattedDate, time: formattedTime };
};
