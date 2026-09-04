import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seed-database";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
