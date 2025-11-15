import app from "./src/app.js";

import connectDb from "./src/config/connectDb.js";
import logger from "./src/config/logger.js";

import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = () => {
  connectDb();

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};
startServer();
