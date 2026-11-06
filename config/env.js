import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const bool = z
  .string()
  .transform((v) => v === "true" || v === "1")
  .pipe(z.boolean());

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),

  MONGODB_URI: z.string().min(1),

  JWT_SECRET: z.string().min(16),
  JWT_USER_TTL: z.string().default("7d"),
  JWT_ADMIN_TTL: z.string().default("12h"),

  OTP_LENGTH: z.coerce.number().default(6),
  OTP_TTL_MINUTES: z.coerce.number().default(10),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),

  APP_ORIGIN: z.string().url().default("http://localhost:3000"),
  ADMIN_ORIGIN: z.string().url().default("http://localhost:3001"),

  HDM_API_KEY: z.string().min(1),
  HDM_API_URL: z.string().url(),
  HDM_FROM_EMAIL: z.string().email(),
  HDM_FROM_NAME: z.string().min(1),
  HDM_SMS_SENDER: z.string().max(11).default("Talanta"),
  SMS_ENABLED: bool.default("false"),

  MPESA_BASE_URL: z.string().url(),
  MPESA_CONSUMER_KEY: z.string().default(""),
  MPESA_CONSUMER_SECRET: z.string().default(""),
  MPESA_SHORTCODE: z.string().default(""),
  MPESA_PASSKEY: z.string().default(""),
  MPESA_CALLBACK_URL: z.string().url(),
  MPESA_TRANSACTION_TYPE: z
    .enum(["CustomerPayBillOnline", "CustomerBuyGoodsOnline"])
    .default("CustomerPayBillOnline"),
  MPESA_TILL_NUMBER: z.string().default(""),

  PAYSTACK_SECRET_KEY: z.string().min(1),
  PAYSTACK_PUBLIC_KEY: z.string().default(""),
  PAYSTACK_CALLBACK_URL: z.string().url(),
  PAYSTACK_WEBHOOK_URL: z.string().url().optional(),

  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  STRIPE_PUBLISHABLE_KEY: z.string().default(""),

  BANK_NAME: z.string().default(""),
  BANK_ACCOUNT_NAME: z.string().default(""),
  BANK_ACCOUNT_NUMBER: z.string().default(""),
  BANK_BRANCH: z.string().default(""),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_FOLDER: z.string().default("talanta"),
  CLOUDINARY_UPLOAD_PRESET: z.string().default(""),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  BOT_PROTECTION_ENABLED: bool.default("true"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;
export default env;