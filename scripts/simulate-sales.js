import "./dnsSet.js";
import "dotenv/config";
import readline from "readline";

import { connectDB, disconnectDB } from "../config/db.js";
import PriceCategory from "../models/PriceCategory.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, (a) => r(a.trim())));

const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const ok = (msg) => console.log(`${C.green}✔${C.reset} ${msg}`);
const warn = (msg) => console.log(`${C.yellow}⚠${C.reset} ${msg}`);
const err = (msg) => console.log(`${C.red}✖${C.reset} ${msg}`);

const main = async () => {
  await connectDB();

  const cats = await PriceCategory.find({ isActive: true }).sort({ level: 1, order: 1 }).lean();
  if (!cats.length) {
    warn("No active categories found.");
    await disconnectDB();
    process.exit(0);
  }

  console.log(`\n${C.bold}Simulating sales${C.reset}\n`);

  let totalDropped = 0;

  for (const c of cats) {
    const drop = Math.floor(Math.random() * 20) + 1; // 1..20
    const current = c.capacity || 0;
    const next = Math.max(0, current - drop);
    const actualDrop = current - next;

    await PriceCategory.updateOne({ _id: c._id }, { $set: { capacity: next } });

    totalDropped += actualDrop;

    const dropLabel = actualDrop === drop
      ? `${C.yellow}-${drop}${C.reset}`
      : `${C.yellow}-${actualDrop}${C.reset} ${C.dim}(capped)${C.reset}`;

    console.log(
      `${C.cyan}${c.level}${C.reset} · ${c.name.padEnd(22)} ` +
      `${String(current).padStart(5)} → ${String(next).padStart(5)}  ${dropLabel}`
    );
  }

  console.log(`\n${C.bold}Total seats dropped:${C.reset} ${totalDropped}`);
  ok(`Updated ${cats.length} categories`);

  const answer = await ask(`\n${C.dim}Run again? (y/N):${C.reset} `);
  rl.close();
  await disconnectDB();

  if (answer.toLowerCase() === "y") {
    return main();
  }

  process.exit(0);
};

main().catch((e) => {
  err(e.message);
  process.exit(1);
});