import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@autocare.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Usuário admin já existe, pulando seed.");
    return;
  }

  await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      password: await bcrypt.hash("admin123", 10),
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log("Usuário admin criado: admin@autocare.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
