const { z } = require("zod");

exports.userSignInSchema = z.object({
  name: z.string({ message: "Please provide name" }),
  email: z
    .string({ message: "Please provide email" })
    .email({ message: "Invalid email address" }),
  password: z
    .string({ message: "Please provide password" })
    .min(8, "password should be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password is weak"
    ),
  avatar: z
    .string()
    .default(
      "https://t4.ftcdn.net/jpg/04/10/43/77/360_F_410437733_hdq4Q3QOH9uwh0mcqAhRFzOKfrCR24Ta.jpg"
    ),
});
