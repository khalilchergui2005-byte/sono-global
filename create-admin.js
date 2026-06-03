const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL    = "admin@sono-global.com";
const ADMIN_PASSWORD = "Admin@2025!";
const ADMIN_NAME     = "Admin";

async function main() {
  const existing = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });

  if (existing) {
    console.log("Admin already exists:", existing.email);
    console.log("Aborting — only one admin allowed per instance.");
    process.exit(0);
  }

  const emailTaken = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true },
  });

  if (emailTaken) {
    console.error("Error: Email already in use by a non-admin user.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.create({
    data: {
      email:    ADMIN_EMAIL,
      password: hashed,
      name:     ADMIN_NAME,
      role:     "ADMIN",
    },
    select: {
      id:        true,
      email:     true,
      name:      true,
      role:      true,
      createdAt: true,
    },
  });

  console.log("Admin created successfully:");
  console.log("  Email:", admin.email);
  console.log("  Name: ", admin.name);
  console.log("  Role: ", admin.role);
  console.log("  ID:   ", admin.id);
}

main()
  .catch(e => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
