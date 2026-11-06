import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import * as otpService from "../../services/otpService.js";
import { signUserToken } from "../../utils/token.js";

export const requestCode = asyncHandler(async (req, res) => {
  const { identifier } = req.body;
  const result = await otpService.request({ identifier });
  ok(res, result);
});

export const verifyCode = asyncHandler(async (req, res) => {
  const { identifier, code } = req.body;
  const { identifier: id, channel } = await otpService.verify({ identifier, code });
  const token = signUserToken(id);
  ok(res, { token, identifier: id, channel });
});