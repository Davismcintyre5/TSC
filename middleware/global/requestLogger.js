import morgan from "morgan";
import env from "../../config/env.js";
import { logger } from "../../utils/logger.js";

const stream = {
  write: (message) => logger.info(message.trim()),
};

const requestLogger =
  env.NODE_ENV === "production"
    ? morgan("combined", { stream })
    : morgan("dev");

export default requestLogger;