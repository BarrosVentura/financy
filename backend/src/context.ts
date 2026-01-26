import { PrismaClient } from '@prisma/client';
// import { AuthenticationError } from 'apollo-server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  userId: string | null;
}

export const context = async ({ req }: { req: any }): Promise<Context> => {
  const token = req.headers.authorization || '';
  let userId: string | null = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'supersecretkey');
      userId = decoded.userId;
    } catch (e) {
      // Token invalid or expired
    }
  }

  return {
    prisma,
    userId,
  };
};

export const prismaClient = prisma;
