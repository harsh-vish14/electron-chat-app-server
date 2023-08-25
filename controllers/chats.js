const { formatDateTime } = require("../helper/dateFormate");
const chats = require("../models/chats");

exports.chatsForGroup = async (groupId, jointedAt, showOldChats = false) => {
  try {
    if (showOldChats) {
      const chatsList = await chats.aggregate([
        {
          $match: { gid: mongoose.Types.ObjectId(groupId) },
        },
        {
          $addFields: {
            message: {
              $cond: [
                { $eq: ["$deleted", true] },
                "this is deleted",
                "$message",
              ],
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
      return { chats: chatsList, success: true };
    }
    const chatsList = await chats.aggregate([
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
      {
        $lookup: {
          from: "users",
          localField: "user._id",
          foreignField: "_id",
          as: "joinedUser",
        },
      },
      {
        $unwind: "$joinedUser",
      },
      {
        $project: {
          _id: 1,
          message: 1,
          user: { name: 1, avatar: 1 },
          createdAt: 1,
          joinedAt: "$joinedUser.joinedAt", // Get the joinedAt value from the joinedUser
        },
      },
      {
        $match: { joinedAt: { $gte: jointedAt } }, // Filter messages after joinedAt
      },
    ]);

    return { chats: chatsList, success: true };
  } catch (error) {
    return { chats: [], success: false };
  }
};
