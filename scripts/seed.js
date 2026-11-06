import "./dnsSet.js";
import "dotenv/config";
import readline from "readline";

import { connectDB, disconnectDB } from "../config/db.js";
import Match from "../models/Match.js";
import PriceCategory from "../models/PriceCategory.js";
import FAQ from "../models/FAQ.js";
import Setting from "../models/Setting.js";

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

const seedMatch = async () => {
  const doc = {
    singleton: "main",
    slug: "bayern-munich-vs-ajax",
    homeTeam: "Bayern Munich",
    awayTeam: "Ajax",
    kickoff: new Date("2027-01-05T20:15:00+03:00"),
    gatesOpen: new Date("2027-01-05T11:00:00+03:00"),
    saleOpensAt: new Date("2026-11-05T18:00:00+03:00"),
    venue: {
      name: "Raila Odinga International Stadium",
      address: "Jamhuri Grounds, Ngong Rd, Nairobi",
      lat: -1.3553,
      lng: 36.7114,
    },
    seatType: "Numbered",
    deliveryChannels: ["SMS", "email"],
    included: [
      "Your own numbered seat for the match",
      "A QR ticket for the turnstile, by SMS and e-mail",
      "Your gate printed on the ticket",
      "Your tickets under My tickets, any time",
    ],
    rules: [
      { title: "No re-entry", body: "Once you leave the stadium, your ticket can't be used again." },
      { title: "One QR, one entry", body: "Each ticket opens the turnstile once. Turn your screen brightness up." },
    ],
    status: "scheduled",
    published: true,
  };

  await Match.updateOne({ singleton: "main" }, { $set: doc }, { upsert: true });
  ok("Match upserted");
};

const seedCategories = async () => {
  const rows = [
    { level: "L1", phase: 1, name: "Phase 1 - 2,500", section: "Level 1", price: 2500, tier: "regular", order: 1, capacity: 0, isActive: false },
    { level: "L1", phase: 1, name: "Phase 1 - 3,500", section: "Level 1", price: 3500, tier: "regular", order: 2, capacity: 0, isActive: false },
    { level: "L1", phase: 1, name: "Phase 1 - 5,000", section: "Level 1", price: 5000, tier: "mid", order: 3, capacity: 0, isActive: false },
    { level: "L1", phase: 1, name: "Phase 1 - 15,000", section: "Level 1", price: 15000, tier: "mid", order: 4, capacity: 500, isActive: true },

    { level: "L2", phase: 1, name: "Phase 1 - 5,000", section: "Level 2", price: 5000, tier: "regular", order: 1, capacity: 0, isActive: false },
    { level: "L2", phase: 1, name: "Phase 1 - 20,000", section: "Level 2", price: 20000, tier: "mid", order: 2, capacity: 1692, isActive: true },

    { level: "L3", phase: 1, name: "Phase 1 - 3,500", section: "Level 3", price: 3500, tier: "regular", order: 1, capacity: 0, isActive: false },

    { level: "gold", phase: 1, name: "Gold", section: "Gold", price: 12000, tier: "premium", order: 1, capacity: 0, isActive: false },

    { level: "platinum", phase: 1, name: "Phase 1 - Platinum", section: "Platinum", price: 20000, tier: "premium", order: 1, capacity: 89, isActive: true },

    { level: "skybox", phase: 1, name: "Skybox", section: "Skyboxes", price: 0, tier: "premium", order: 1, capacity: 0, isActive: false },

    { level: "accessible", phase: 1, name: "Accessible", section: "Accessible", price: 2500, tier: "regular", order: 1, capacity: 0, isActive: false },
  ];

  for (const row of rows) {
    await PriceCategory.updateOne(
      { level: row.level, phase: row.phase, name: row.name },
      {
        $set: {
          section: row.section,
          price: row.price,
          tier: row.tier,
          order: row.order,
          capacity: row.capacity,
          isActive: row.isActive,
          currency: "KES",
        },
      },
      { upsert: true }
    );
  }
  ok(`Price categories: ${rows.length} upserted`);
};

const seedFaqs = async () => {
  const rows = [
    { category: "About the Stadium", order: 1,
      question: "Where is the Raila Odinga International Stadium located?",
      answer: "The Raila Odinga International Stadium is located at the Jamhuri Grounds along Ngong Road in Nairobi, Kenya, about 10 kilometres west of the city's Central Business District." },
    { category: "About the Stadium", order: 2,
      question: "What is the stadium's seating capacity?",
      answer: "The stadium has a seating capacity of 60,000 spectators, making it one of Kenya's largest sporting venues. Seating configurations and available capacity may vary depending on the event." },
    { category: "About the Stadium", order: 3,
      question: "When is the stadium's official inauguration?",
      answer: "The stadium's official inauguration is scheduled for Tuesday, 5th January 2027, featuring an international friendly between FC Bayern Munich and AFC Ajax Amsterdam. Kick-off is scheduled for 8:15 p.m. East African Time (EAT)." },
    { category: "About the Stadium", order: 4,
      question: "Why is the stadium named after Raila Odinga?",
      answer: "The stadium is named in honour of the late former Prime Minister, Rt. Hon. Raila Amolo Odinga, in recognition of his contribution to Kenya's democratic transformation and national development. It is intended to serve as a lasting national landmark and a home for future generations of athletes and supporters." },
    { category: "About the Stadium", order: 5,
      question: "Will the stadium host AFCON 2027 matches?",
      answer: "The Raila Odinga International Stadium forms part of Kenya's preparations to co-host the 2027 Africa Cup of Nations alongside Uganda and Tanzania under the PAMOJA partnership." },
    { category: "About the Stadium", order: 6,
      question: "Will stadium tours be available?",
      answer: "Information on guided stadium tours and visitor experiences will be announced once the relevant arrangements have been confirmed. Please check the website for future updates." },

    { category: "Events and Tickets", order: 1,
      question: "Where can I purchase tickets?",
      answer: "Official tickets for the Bayern Munich versus Ajax Amsterdam match will be available exclusively through the official Talanta Sports City website at www.TalantaSportsCity.com. We strongly encourage fans to purchase tickets only through authorised channels to avoid fraud and invalid tickets." },
    { category: "Events and Tickets", order: 2,
      question: "How much do tickets cost?",
      answer: "Tickets for the inaugural Bayern Munich versus Ajax Amsterdam match start at KES 2,500. Additional seating categories and prices will also be displayed on the official ticketing platform on www.TalantaSportsCity.com." },
    { category: "Events and Tickets", order: 3,
      question: "When do tickets go on sale?",
      answer: "Ticket sales for the inaugural match open on Thursday, 5th November 2026, at 6:00 pm EAT, through www.TalantaSportsCity.com." },
    { category: "Events and Tickets", order: 4,
      question: "Can I choose my seat when purchasing a ticket?",
      answer: "Yes. Available seating categories and seat-selection options for the inaugural match will be displayed during the ticket-purchasing process. Please review your selected ticket details before completing payment." },
    { category: "Events and Tickets", order: 5,
      question: "Can I purchase tickets at the stadium?",
      answer: "No. Fans can only purchase tickets for the inaugural match online through www.TalantaSportsCity.com. There will be no physical ticket sales anywhere for the inaugural match." },
    { category: "Events and Tickets", order: 6,
      question: "Can I transfer my ticket to someone else?",
      answer: "Yes. You can send a ticket to a guest from My tickets. Transfers are governed by the terms and conditions displayed during purchase. Open My tickets, choose the ticket, tap \"Send to a guest\", enter your guest's full name and mobile number, then tap \"Send ticket\". Your guest gets an SMS with a link to their ticket and opens it with a code we text to that phone. Your copy of that seat stops working as soon as it is sent, and your guest's ticket has a new entry code. Personal passes and invitations can't be sent, and a guest can't pass a ticket on again." },
    { category: "Events and Tickets", order: 7,
      question: "Can I get a refund if I am unable to attend?",
      answer: "No. There will be no refunds or cancellations for the inaugural match as per the ticketing terms and conditions applicable, except if the match is cancelled: a cancelled match is refunded in accordance with the terms and conditions." },
    { category: "Events and Tickets", order: 8,
      question: "What does 'No Re-entry' mean?",
      answer: "The No Re-entry policy for the inaugural match means that once you enter the stadium and your ticket is scanned, you will not be allowed to leave and return using the same ticket. Please ensure you have everything you need before entering the stadium." },
    { category: "Events and Tickets", order: 9,
      question: "Can I attend the match with my children?",
      answer: "Yes. Families and children are welcome at the stadium. Every attendee, including children, must have a valid paid ticket and an allocated seat. Children should be accompanied and supervised by a responsible adult throughout their visit." },
    { category: "Events and Tickets", order: 10,
      question: "Will Bayern Munich and Ajax Amsterdam bring their first-team players?",
      answer: "The scheduled fixture for the inaugural match is between FC Bayern Munich and AFC Ajax Amsterdam. Squad selection and individual player participation are determined by the respective clubs. Confirmed squad information will be shared through official channels when available. The appearance of any specific player is not guaranteed." },
    { category: "Events and Tickets", order: 11,
      question: "What happens if the inaugural match is postponed or cancelled?",
      answer: "If the match is postponed or cancelled, official announcements will be made through the Talanta Sports City website and verified communication channels. Ticket holders will receive information on revised match arrangements and any applicable refund or ticket-validity procedures in accordance with the terms and conditions." },

    { category: "Plan Your Visit", order: 1,
      question: "What time will the stadium gates open?",
      answer: "Gate-opening time for the inaugural Bayern Munich versus Ajax Amsterdam match is at 11:00am EAT. The kick-off time for the match will be 8:15pm EAT on 5th January 2027. We recommend arriving early to allow sufficient time for security checks, ticket validation and locating your seat." },
    { category: "Plan Your Visit", order: 2,
      question: "What should I bring to the stadium?",
      answer: "Please bring your valid event ticket and any identification required under the inaugural match entry conditions." },
    { category: "Plan Your Visit", order: 3,
      question: "Can I bring food and drinks into the stadium?",
      answer: "No. For the inaugural match, food and beverages from outside are not permitted." },
    { category: "Plan Your Visit", order: 4,
      question: "Are bags allowed inside the stadium?",
      answer: "Visitors are encouraged to bring only essential personal belongings to help ensure a smooth entry process." },
    { category: "Plan Your Visit", order: 5,
      question: "Is parking available at the stadium?",
      answer: "No." },
    { category: "Plan Your Visit", order: 6,
      question: "Is public transport available to the stadium?",
      answer: "Public transport and other travel options serving the stadium will be included in the event-specific visitor information. Supporters and ticket holders should check official announcements for recommended routes." },
    { category: "Plan Your Visit", order: 7,
      question: "What security measures will be in place?",
      answer: "The safety and wellbeing of spectators, participants and staff are a priority. Visitors should expect appropriate security screening, ticket checks and crowd-management procedures. A detailed guide is contained in the terms and conditions. All visitors are required to follow instructions from authorised stadium personnel." },

    { category: "Accessibility & Hospitality", order: 1,
      question: "Is the stadium accessible to persons with disabilities?",
      answer: "The Raila Odinga International Stadium has been designed with accessibility in mind, including facilities and provisions intended to support persons with disabilities. Information on accessible seating, designated entrances, mobility assistance, accessible washrooms and other available services will be provided. Visitors requiring assistance are encouraged to contact the stadium's customer support team." },
    { category: "Accessibility & Hospitality", order: 2,
      question: "How can I purchase accessible seating?",
      answer: "Information on accessible seating categories and booking arrangements is available through the official ticketing platform. Fans should review the accessibility information while purchasing tickets." },
    { category: "Accessibility & Hospitality", order: 3,
      question: "Can I bring a wheelchair or mobility aid?",
      answer: "Yes. Visitors who use wheelchairs or other mobility aids are welcome. Please check the terms and conditions for information on designated seating, entrances and assistance arrangements." },
    { category: "Accessibility & Hospitality", order: 4,
      question: "Can I book a skybox or premium hospitality package?",
      answer: "Yes. Skyboxes and premium hospitality experiences are available. Skyboxes are booked by email: email hospitality@talantasportscity.com for package options, availability, inclusions, pricing and booking procedures. Platinum and Gold hospitality are bought on this website." },
    { category: "Accessibility & Hospitality", order: 5,
      question: "Can I book hospitality for a group or corporate event?",
      answer: "Group and corporate hospitality opportunities are available for the inaugural match subject to availability. Please check the Hospitality section of the website for confirmed packages and booking contacts." },

    { category: "Broadcast & Updates", order: 1,
      question: "Will the match be televised or livestreamed?",
      answer: "Broadcast and streaming arrangements will be announced once confirmed. Fans are encouraged to follow official Talanta Sports City channels for information on authorised broadcasters and streaming platforms." },
    { category: "Broadcast & Updates", order: 2,
      question: "How can journalists apply for accreditation?",
      answer: "Journalists, photographers, videographers and accredited media organisations wishing to cover events at the Raila Odinga International Stadium will be required to apply for media accreditation. For accreditation enquiries, contact the Talanta Sports City Press Office at press@talantasportscity.com. Media accreditation is subject to approval, and submitting an application does not guarantee access to the event." },
    { category: "Broadcast & Updates", order: 3,
      question: "Where can I find official event updates?",
      answer: "For the latest information on events, tickets, travel arrangements, stadium entry and matchday announcements, visit www.TalantaSportsCity.com and follow the verified Talanta Sports City accounts on Facebook, Instagram, TikTok and X. Please rely on official channels for confirmed information and avoid purchasing tickets or making payments through unauthorised accounts." },
    { category: "Broadcast & Updates", order: 4,
      question: "Who can I contact if I need assistance?",
      answer: "For ticketing enquiries, accessibility support or general event information, please use the official contact details provided on the Talanta Sports City website." },
  ];

  for (const row of rows) {
    await FAQ.updateOne(
      { category: row.category, question: row.question },
      { $setOnInsert: { ...row, isPublic: true } },
      { upsert: true }
    );
  }
  ok(`FAQs: ${rows.length} upserted`);
};

const seedSettings = async () => {
  const rows = [
    { key: "brand.name", value: "Talanta Sports City", group: "brand" },
    { key: "brand.logoUrl", value: null, group: "brand" },
    { key: "brand.faviconUrl", value: "/favicon.ico", group: "brand" },
    { key: "contact.supportPhone", value: "+254 700 000 000", group: "contact" },
    { key: "contact.email", value: "info@talantasportscity.com", group: "contact" },
    { key: "contact.hospitalityEmail", value: "hospitality@talantasportscity.com", group: "contact" },
    { key: "contact.pressEmail", value: "press@talantasportscity.com", group: "contact" },
    { key: "contact.address", value: "Jamhuri Grounds, Ngong Rd, Nairobi", group: "contact" },
    { key: "social.twitter", value: "https://x.com/talantacity", group: "social" },
    { key: "social.instagram", value: "https://www.instagram.com/talantasportscity/", group: "social" },
    { key: "social.facebook", value: "https://www.facebook.com/TalantaSportsCity", group: "social" },
    { key: "social.tiktok", value: "https://www.tiktok.com/@talantasportscity", group: "social" },
    { key: "social.youtube", value: "https://www.youtube.com/@TalantaSportsCity", group: "social" },
  ];

  for (const row of rows) {
    const upsert =
      row.group === "social" ? { $set: row } : { $setOnInsert: row };
    await Setting.updateOne({ key: row.key }, upsert, { upsert: true });
  }
  ok(`Settings: ${rows.length} upserted`);
};

const menu = async () => {
  clear();
  line();
  line(`${C.bold}${C.cyan}╭───────────────────────────────────────╮${C.reset}`);
  line(`${C.bold}${C.cyan}│   Talanta Sports City — Seed CLI      │${C.reset}`);
  line(`${C.bold}${C.cyan}╰───────────────────────────────────────╯${C.reset}`);
  line();
  line(`  ${C.bold}1${C.reset}.  Seed all`);
  line(`  ${C.bold}2${C.reset}.  Seed match`);
  line(`  ${C.bold}3${C.reset}.  Seed price categories`);
  line(`  ${C.bold}4${C.reset}.  Seed FAQs`);
  line(`  ${C.bold}5${C.reset}.  Seed settings`);
  line();
  line(`  ${C.dim}0.  Exit${C.reset}`);
  line();

  return await ask(`${C.cyan}›${C.reset} Select option: `);
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
      heading("Seeding");

      if (choice === "1") {
        await seedMatch();
        await seedCategories();
        await seedFaqs();
        await seedSettings();
        line();
        ok("All seeds complete");
      } else if (choice === "2") {
        await seedMatch();
      } else if (choice === "3") {
        await seedCategories();
      } else if (choice === "4") {
        await seedFaqs();
      } else if (choice === "5") {
        await seedSettings();
      } else if (choice === "0") {
        break;
      } else {
        continue;
      }
    } catch (e) {
      err(e.message);
    }

    await ask(`${C.dim}Press Enter to continue...${C.reset}`);
  }

  rl.close();
  await disconnectDB();
  line();
  ok("Bye");
  process.exit(0);
};

main();