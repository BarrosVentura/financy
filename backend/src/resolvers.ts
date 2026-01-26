import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Context } from './context';

const APP_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) return null;
      return context.prisma.user.findUnique({ where: { id: context.userId } });
    },
    categories: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return context.prisma.category.findMany({ where: { userId: context.userId } });
    },
    transactions: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return context.prisma.transaction.findMany({
        where: { userId: context.userId },
        include: { category: true },
        orderBy: { date: 'desc' },
      });
    },
  },
  Mutation: {
    signup: async (_parent: any, args: any, context: Context) => {
      const password = await bcrypt.hash(args.password, 10);
      const user = await context.prisma.user.create({
        data: { ...args, password },
      });

      const token = jwt.sign({ userId: user.id }, APP_SECRET);
      return { token, user };
    },
    login: async (_parent: any, args: any, context: Context) => {
      const user = await context.prisma.user.findUnique({ where: { email: args.email } });
      if (!user) throw new Error('No such user found');

      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) throw new Error('Invalid password');

      const token = jwt.sign({ userId: user.id }, APP_SECRET);
      return { token, user };
    },
    createCategory: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      return context.prisma.category.create({
        data: {
          name: args.name,
          description: args.description,
          icon: args.icon,
          color: args.color,
          userId: context.userId,
        },
      });
    },
    deleteCategory: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) throw new Error('Not authenticated');
      // Verify ownership logic implied by simple architecture (or strict check)
      const category = await context.prisma.category.findFirst({
         where: { id: args.id, userId: context.userId }
      });
      if (!category) throw new Error('Category not found or access denied');
      
      return context.prisma.category.delete({
        where: { id: args.id },
      });
    },
    createTransaction: async (_parent: any, args: any, context: Context) => {
       if (!context.userId) throw new Error('Not authenticated');
       return context.prisma.transaction.create({
         data: {
           description: args.description,
           amount: args.amount,
           type: args.type,
           date: new Date(args.date),
           userId: context.userId,
           categoryId: args.categoryId,
         },
         include: { category: true },
       });
    },
    deleteTransaction: async (_parent: any, args: any, context: Context) => {
       if (!context.userId) throw new Error('Not authenticated');
       const transaction = await context.prisma.transaction.findFirst({
         where: { id: args.id, userId: context.userId }
       });
       if (!transaction) throw new Error('Transaction not found or access denied');

       return context.prisma.transaction.delete({
         where: { id: args.id },
       });
    }
  },
  Transaction: {
    // Resolver for nested category if needed, but 'include' in main query handles it often.
    // Explicit resolver:
    category: (parent: any, args: any, context: Context) => {
        if (!parent.categoryId) return null;
        return context.prisma.category.findUnique({ where: { id: parent.categoryId } });
    }
  }
};
