import bcrypt from "bcryptjs";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import Admin from "../../models/Admin.js";
import { signAdminToken } from "../../utils/token.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest("Email and password required");

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin || !admin.isActive) throw ApiError.unauthorized("Invalid credentials");

  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) throw ApiError.unauthorized("Invalid credentials");

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = signAdminToken(admin._id);
  ok(res, {
    token,
    admin: {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  ok(res, req.admin);
});