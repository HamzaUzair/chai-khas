import { execSync } from "node:child_process";

// Provide a placeholder DATABASE_URL for prisma generate if not set.
// prisma generate only needs the schema to build TypeScript types —
// it does NOT connect to the database. The real DATABASE_URL is only
// needed at runtime (API routes).
const env = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://placeholder:placeholder@localhost:5432/placeholder",
};

execSync("npx prisma generate", { stdio: "inherit", env });
