import "./dnsSet.js";
import "dotenv/config";
import readline from "readline";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB, disconnectDB } from "../config/db.js";
import env from "../config/env.js";
import Admin from "../models/Admin.js";

const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (question) =>
  new Promise((resolve) => rl.question(question, (a) => resolve(a.trim())));

const askHidden = (question) =>
  new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    stdout.write(question);

    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let input = "";
    const onData = (char) => {
      char = char.toString();
      if (char === "\n" || char === "\r" || char === "\u0004") {
        if (stdin.isTTY) stdin.setRawMode(wasRaw);
        stdin.removeListener("data", onData);
        stdin.pause();
        stdout.write("\n");
        resolve(input.trim());
      } else if (char === "\u0003") {
        stdout.write("\n");
        process.exit(0);
      } else if (char === "\u007F" || char === "\b") {
        input = input.slice(0, -1);
      } else {
        input += char;
      }
    };
    stdin.on("data", onData);
  });

const clear = () => process.stdout.write("\x1b[2J\x1b[0f");
const line = (str = "") => console.log(str);

const heading = (title) => {
  line();
  line(`${C.bold}${C.cyan}${title}${C.reset}`);
  line(`${C.dim}${"─".repeat(title.length)}${C.reset}`);
  line();
};

const ok = (msg) => line(`${C.green}✔${C.reset} ${msg}`);
const warn = (msg) => line(`${C.yellow}⚠${C.reset} ${msg}`);
const err = (msg) => line(`${C.red}✖${C.reset} ${msg}`);

const randomPassword = (len = 14) =>
  crypto.randomBytes(len).toString("base64url").slice(0, len);

const maskEmail = (email) => {
  const [user, domain] = String(email).split("@");
  if (!domain) return "[redacted]";
  return `${user.slice(0, 1)}***@${domain}`;
};

const isProduction = () => env.NODE_ENV === "production";

const menu = async () => {
  clear();
  line();
  line(`${C.bold}${C.cyan}╭─────────────────────────────────────╮${C.reset}`);
  line(`${C.bold}${C.cyan}│   Talanta Sports City — Admin CLI   │${C.reset}`);
  line(`${C.bold}${C.cyan}╰─────────────────────────────────────╯${C.reset}`);
  line();
  line(`  ${C.bold}1${C.reset}.  List admins`);
  line(`  ${C.bold}2${C.reset}.  Create admin`);
  line(`  ${C.bold}3${C.reset}.  Manage admin`);
  line(`  ${C.bold}4${C.reset}.  List collections`);
  if (!isProduction()) {
    line(`  ${C.bold}5${C.reset}.  Drop a collection`);
    line(`  ${C.bold}6${C.reset}.  Drop entire database`);
  }
  line();
  line(`  ${C.dim}0.  Exit${C.reset}`);
  line();

  return await ask(`${C.cyan}›${C.reset} Select option: `);
};

const listAdmins = async () => {
  heading("Admins");
  const admins = await Admin.find().sort({ createdAt: 1 }).lean();

  if (!admins.length) warn("No admins found");
  else {
    admins.forEach((a, i) => {
      line(`  ${C.bold}${i + 1}.${C.reset} ${a.name} ${C.dim}<${maskEmail(a.email)}>${C.reset}`);
      line(`     ${C.dim}id:${C.reset}     ${a._id}`);
      line(`     ${C.dim}role:${C.reset}   ${a.role}`);
      line(`     ${C.dim}active:${C.reset} ${a.isActive ? "yes" : "no"}`);
      line(`     ${C.dim}last:${C.reset}   ${a.lastLoginAt ? new Date(a.lastLoginAt).toISOString() : "never"}`);
      line();
    });
  }
  await ask(`${C.dim}Press Enter to continue...${C.reset}`);
};

const createAdmin = async () => {
  heading("Create admin");

  const name = await ask("Name: ");
  const email = (await ask("Email: ")).toLowerCase();
  const roleInput = (await ask("Role [admin/superadmin] (admin): ")) || "admin";
  const passwordInput = await askHidden("Password (leave blank to generate): ");

  if (!name || !email) {
    err("Name and email are required");
    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    return;
  }

  if (!["admin", "superadmin"].includes(roleInput)) {
    err("Role must be 'admin' or 'superadmin'");
    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    return;
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    err(`Email ${email} already exists`);
    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    return;
  }

  const password = passwordInput || randomPassword(14);
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    name,
    email,
    passwordHash,
    role: roleInput,
    isActive: true,
  });

  ok(`Created admin ${admin.name} <${admin.email}>`);

  if (!passwordInput) {
    line();
    line(`  ${C.bold}Temporary password:${C.reset} ${C.yellow}${password}${C.reset}`);
    line(`  ${C.dim}Store this securely — it will not be shown again.${C.reset}`);
    line();
  }

  await ask(`${C.dim}Press Enter to continue...${C.reset}`);
};

const manageAdmin = async () => {
  heading("Manage admins");
  const admins = await Admin.find().sort({ createdAt: 1 }).lean();

  if (!admins.length) {
    warn("No admins found");
    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    return;
  }

  admins.forEach((a, i) => {
    line(`  ${C.bold}${i + 1}.${C.reset} ${a.name} ${C.dim}<${maskEmail(a.email)}>${C.reset} — ${a.isActive ? "active" : "inactive"}`);
  });
  line();
  line(`  ${C.dim}0.  Back${C.reset}`);
  line();

  const choice = await ask(`${C.cyan}›${C.reset} Select admin: `);
  const index = parseInt(choice, 10) - 1;

  if (isNaN(index) || index < 0 || index >= admins.length) return;

  const admin = admins[index];
  clear();
  heading(`Manage: ${admin.name}`);

  line(`  ${C.bold}1${C.reset}.  Reset password`);
  line(`  ${C.bold}2${C.reset}.  Change role`);
  line(`  ${C.bold}3${C.reset}.  Activate`);
  line(`  ${C.bold}4${C.reset}.  Deactivate`);
  line(`  ${C.bold}5${C.reset}.  Delete`);
  line();
  line(`  ${C.dim}0.  Back${C.reset}`);
  line();

  const action = await ask(`${C.cyan}›${C.reset} Action: `);

  if (action === "1") {
    const newPassword = await askHidden("New password (leave blank to generate): ");
    const password = newPassword || randomPassword(14);
    const passwordHash = await bcrypt.hash(password, 10);

    await Admin.updateOne({ _id: admin._id }, { $set: { passwordHash } });

    ok(`Password reset for ${admin.email}`);
    if (!newPassword) {
      line();
      line(`  ${C.bold}New password:${C.reset} ${C.yellow}${password}${C.reset}`);
      line();
    }
  } else if (action === "2") {
    const newRole = await ask("New role [admin/superadmin]: ");
    if (!["admin", "superadmin"].includes(newRole)) {
      err("Invalid role");
    } else {
      await Admin.updateOne({ _id: admin._id }, { $set: { role: newRole } });
      ok(`${admin.email} role changed to ${newRole}`);
    }
  } else if (action === "3") {
    await Admin.updateOne({ _id: admin._id }, { $set: { isActive: true } });
    ok(`${admin.email} activated`);
  } else if (action === "4") {
    await Admin.updateOne({ _id: admin._id }, { $set: { isActive: false } });
    ok(`${admin.email} deactivated`);
  } else if (action === "5") {
    const confirm = await ask(`${C.red}Type DELETE to confirm:${C.reset} `);
    if (confirm === "DELETE") {
      const count = await Admin.countDocuments({ isActive: true });
      if (admin.isActive && count <= 1) {
        err("Cannot delete the last active admin");
      } else {
        await Admin.deleteOne({ _id: admin._id });
        ok(`${admin.email} deleted`);
      }
    } else {
      warn("Cancelled");
    }
  }

  await ask(`${C.dim}Press Enter to continue...${C.reset}`);
};

const listCollections = async () => {
  heading("Database collections");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  if (!collections.length) warn("No collections found");
  else {
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      line(`  ${C.bold}${c.name.padEnd(32)}${C.reset} ${C.dim}${String(count).padStart(8)}${C.reset} docs`);
    }
  }

  await ask(`${C.dim}Press Enter to continue...${C.reset}`);
};

const dropCollection = async () => {
  if (isProduction()) {
    err("Disabled in production");
    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    return;
  }

  heading("Drop a collection");
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  if (!collections.length) {
    warn("No collections found");
    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    return;
  }

  collections.forEach((c, i) => line(`  ${C.bold}${i + 1}.${C.reset} ${c.name}`));
  line();
  line(`  ${C.dim}0.  Back${C.reset}`);
  line();

  const choice = await ask(`${C.cyan}›${C.reset} Select collection: `);
  const index = parseInt(choice, 10) - 1;

  if (isNaN(index) || index < 0 || index >= collections.length) return;

  const name = collections[index].name;
  const confirm = await ask(`${C.red}Type ${name} to confirm drop:${C.reset} `);

  if (confirm === name) {
    await db.collection(name).drop().catch(() => {});
    ok(`Collection "${name}" dropped`);
  } else {
    warn("Cancelled");
  }

  await ask(`${C.dim}Press Enter to continue...${C.reset}`);
};

const dropDatabase = async () => {
  if (isProduction()) {
    err("Disabled in production");
    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    return;
  }

  heading("Drop entire database");

  const db = mongoose.connection.db;
  const dbName = db.databaseName;

  warn(`This will permanently delete ALL data in "${dbName}".`);
  line();

  const confirm = await ask(`${C.red}Type ${dbName} to confirm:${C.reset} `);

  if (confirm !== dbName) {
    warn("Cancelled");
    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    return;
  }

  const second = await ask(`${C.red}Type DROP DATABASE to confirm again:${C.reset} `);
  if (second !== "DROP DATABASE") {
    warn("Cancelled");
    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    return;
  }

  await db.dropDatabase();
  ok(`Database "${dbName}" dropped`);

  await ask(`${C.dim}Press Enter to continue...${C.reset}`);
};

const main = async () => {
  clear();
  line(`${C.dim}Connecting to MongoDB...${C.reset}`);

  try {
    await connectDB();
    ok("Connected");
  } catch (e) {
    err(`Connection failed: ${e.message}`);
    process.exit(1);
  }

  while (true) {
    const choice = await menu();

    try {
      if (choice === "1") await listAdmins();
      else if (choice === "2") await createAdmin();
      else if (choice === "3") await manageAdmin();
      else if (choice === "4") await listCollections();
      else if (choice === "5" && !isProduction()) await dropCollection();
      else if (choice === "6" && !isProduction()) await dropDatabase();
      else if (choice === "0") break;
    } catch (e) {
      err(e.message);
      await ask(`${C.dim}Press Enter to continue...${C.reset}`);
    }
  }

  rl.close();
  await disconnectDB();
  line();
  ok("Bye");
  process.exit(0);
};

main();