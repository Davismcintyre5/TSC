import cors from "cors";
import env from "../../config/env.js";

const corsMiddleware = cors({
  origin: [env.APP_ORIGIN, env.ADMIN_ORIGIN],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

export default corsMiddleware;