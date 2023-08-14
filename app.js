const dotenv = require("dotenv");
dotenv.config({ path: "config/config.env" });
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/index");
const routes = require("./routers");
const chalk = require("chalk");
const errorHandler = require("./helper/errorHandler");
const { removeEmptyValues } = require("./middleware/removeNullValues");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors());

app.use(express.json());
app.use(removeEmptyValues);
app.use(errorHandler);
app.use(cookieParser());
app.use("/api/v1", routes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(
    chalk.yellowBright.bold(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  );
});

// Handle unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.log(chalk.bold.redBright(`Error: ${err.message}`));

  console.log(err);

  server.close(() => {
    console.log(
      chalk.bold.redBright("Server closed due to unhandled promise rejection")
    );
    process.exit(1);
  });
});
