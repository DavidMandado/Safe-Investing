import { PrismaClient } from '@prisma/client';

// To prevent creating multiple instances of PrismaClient in development we attach it to the global
// scope. See: https://www.prisma.io/docs/guides/nextjs/prisma-client-nextjs#solution

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;