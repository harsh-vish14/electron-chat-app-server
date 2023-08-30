const { z } = require("zod");

exports.makeGroupSchema = z.object({
  title: z.string({ message: "Please Provide group Title" }),
});
