import { prisma } from "./prisma";
import { seedDatabase } from "./seed-database";

let seeding: Promise<void> | null = null;

export async function ensureSeeded() {
  const count = await prisma.plant.count();
  if (count > 0) return;
  if (!seeding) {
    seeding = seedDatabase(prisma).finally(() => {
      seeding = null;
    });
  }
  await seeding;
}
