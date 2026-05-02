import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  "Продукты питания",
  "Интернет и телефоны",
  "Страховки",
  "Подписки",
  "Компенсируемые командировки",
  "Развлечения",
  "Здоровье и красота",
  "Техника",
  "Одежда и аксессуары",
  "Авто: топливо и содержание",
  "Другое",
];

const DEFAULT_SOURCES = [
  "Банковские карты",
  "Наличные",
  "Swile",
  "Бонусы и кэшбек",
];

async function main() {
  const email = "aquamariss@gmail.com";
  const passwordHash = await bcrypt.hash("TmpPassword123", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  console.log(`User: ${user.email} (${user.id})`);

  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: {},
      create: { name, userId: user.id },
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories`);

  for (const name of DEFAULT_SOURCES) {
    await prisma.fundingSource.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: {},
      create: { name, userId: user.id },
    });
  }
  console.log(`Seeded ${DEFAULT_SOURCES.length} funding sources`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
