import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prerenderStatic from "vite-plugin-prerender-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EVENT_SLUG = "bayern-munich-vs-ajax";

const staticRoutes = [
  {
    path: "/",
    tags: {
      title: "Bayern Munich vs Ajax — 5 January 2027 | Talanta Sports City",
      description:
        "Buy tickets for Bayern Munich vs Ajax at Talanta Sports City on 5 January 2027. Secure your seat for this international friendly in Nairobi.",
    },
  },
  {
    path: "/about",
    tags: {
      title: "About Talanta Sports City",
      description:
        "Learn about Talanta Sports City — Kenya's premier sports venue hosting international football fixtures.",
    },
  },
  {
    path: "/faq",
    tags: {
      title: "Ticketing FAQ — Talanta Sports City",
      description:
        "Frequently asked questions about ticketing, seating, payments, and entry for events at Talanta Sports City.",
    },
  },
  {
    path: "/ticketing-terms",
    tags: {
      title: "Ticketing Terms — Talanta Sports City",
      description:
        "Terms and conditions for purchasing tickets to events at Talanta Sports City.",
    },
  },
  {
    path: "/login",
    tags: {
      title: "Login — Talanta Sports Tickets",
      description: "Sign in to your Talanta Sports Tickets account to access your tickets.",
    },
  },
  {
    path: `/events/${EVENT_SLUG}/seats`,
    tags: {
      title: "Select Your Seat — Bayern Munich vs Ajax | Talanta Sports City",
      description:
        "Choose your seat for Bayern Munich vs Ajax at Talanta Sports City on 5 January 2027.",
    },
  },
];

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    prerenderStatic({
      routes: staticRoutes,
      render: () => '<div id="root"></div>',
    }),
  ],
  build: {
    outDir: path.join(__dirname, "dist"),
    emptyOutDir: true,
  },
});