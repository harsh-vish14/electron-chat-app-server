const { formatDateTime } = require("../helper/dateFormate");

exports.chatsForGroup = async (groupId) => {
  try {
    const chats = await Chat.aggregate([
      {
        $match: { gid: mongoose.Types.ObjectId(groupId) },
      },
      {
        $addFields: {
          message: {
            $cond: [{ $eq: ["$deleted", true] }, "this is deleted", "$message"],
          },
        },
      },
      {
        $lookup: {
          from: "users", // Assuming your user collection is named 'users'
          localField: "uid",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1, // Include the _id field
          message: 1,
          user: { name: 1, avatar: 1 },
          createdAt: {
            $let: {
              vars: {
                formattedDate: {
                  $dateToString: {
                    format: "%Y-%m-%dT%H:%M:%S.%LZ",
                    date: "$createdAt",
                  },
                },
              },
              in: {
                $function: {
                  body: formatDateTime.toString(),
                  args: ["$formattedDate"],
                  lang: "js",
                },
              },
            },
          },
        },
      },
    ]);

    return { chats, success: true };
  } catch (error) {
    return { chats: [], success: false };
  }
};
