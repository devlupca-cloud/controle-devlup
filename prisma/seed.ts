import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL },
  },
});

async function main() {
  // Create users (partners)
  const password1 = await hash("devlup2026", 10);
  const password2 = await hash("devlup2026", 10);

  await prisma.user.upsert({
    where: { email: "samantha@devlup.ca" },
    update: { email: "samantha@devlup.ca" },
    create: {
      name: "Samantha",
      email: "samantha@devlup.ca",
      password: password1,
    },
  });

  await prisma.user.upsert({
    where: { email: "renan@devlup.ca" },
    update: { email: "renan@devlup.ca" },
    create: {
      name: "Renan",
      email: "renan@devlup.ca",
      password: password2,
    },
  });

  // Create default expense categories
  const categories = [
    "Hospedagem/Servidor",
    "Domínio",
    "Software/Licenças",
    "Marketing",
    "Impostos",
    "Contabilidade",
    "Equipamentos",
    "Internet/Telefone",
    "Outros",
  ];

  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
