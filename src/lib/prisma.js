import { PrismaClient } from '@prisma/client';

let prisma;

const createPrismaClient = () => {
  return new PrismaClient();
};

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.prisma) global.prisma = createPrismaClient();
  prisma = global.prisma;
}

// Ensure the Prisma Client is shut down when the Node process ends
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
