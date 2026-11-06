import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const signUserToken = (identifier) =>
  jwt.sign({ sub: identifier, scope: "user" }, env.JWT_SECRET, {
    expiresIn: env.JWT_USER_TTL,
  });

export const signAdminToken = (adminId) =>
  jwt.sign({ sub: String(adminId), scope: "admin" }, env.JWT_SECRET, {
    expiresIn: env.JWT_ADMIN_TTL,
  });

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

export const decodeToken = (token) => jwt.decode(token);