import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Context } from './context';
import { AuthenticationError } from './errors';

const getAppSecret = () => {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET não está definido nas variáveis de ambiente. Usando padrão inseguro.');
  }
  return process.env.JWT_SECRET || 'supersecretkey';
};

export const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      try {
        if (!context.userId) return null;
        return await context.prisma.user.findUnique({ where: { id: context.userId } });
      } catch (error: any) {
        console.error('Erro na query me:', error);
        throw new Error(error.message || 'Falha ao buscar usuário');
      }
    },
    categories: async (_parent: any, _args: any, context: Context) => {
      try {
        if (!context.userId) throw new AuthenticationError();
        return await context.prisma.category.findMany({ where: { userId: context.userId } });
      } catch (error: any) {
        console.error('Erro na query categories:', error);
        throw new Error(error.message || 'Falha ao buscar categorias');
      }
    },
    transactions: async (_parent: any, _args: any, context: Context) => {
      try {
        if (!context.userId) throw new AuthenticationError();
        return await context.prisma.transaction.findMany({
          where: { userId: context.userId },
          include: { category: true },
          orderBy: { date: 'desc' },
        });
      } catch (error: any) {
        console.error('Erro na query transactions:', error);
        throw new Error(error.message || 'Falha ao buscar transações');
      }
    },
  },
  Mutation: {
    signup: async (_parent: any, args: any, context: Context) => {
      try {
        if(!args.email || !args.password || !args.name) throw new Error('Campos obrigatórios faltando');
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) throw new Error('Formato de e-mail inválido');

        const password = await bcrypt.hash(args.password, 10);
        const user = await context.prisma.user.create({
          data: { ...args, password },
        });

        const token = jwt.sign({ userId: user.id }, getAppSecret());
        return { token, user };
      } catch (error: any) {
        if (
          error.code === 'P2002' || 
          error.message?.includes('Unique constraint failed')
        ) {
           throw new Error('Este e-mail já está em uso.');
        }
        console.error('Erro na mutation signup:', error);
        throw new Error(error.message || 'Falha ao criar conta.');
      }
    },
    login: async (_parent: any, args: any, context: Context) => {
      try {
        const user = await context.prisma.user.findUnique({ where: { email: args.email } });
        if (!user) throw new AuthenticationError('Credenciais inválidas');

        const valid = await bcrypt.compare(args.password, user.password);
        if (!valid) throw new AuthenticationError('Credenciais inválidas');

        const token = jwt.sign({ userId: user.id }, getAppSecret());
        return { token, user };
      } catch (error: any) {
        console.error('Erro na mutation login:', error);
        throw new Error(error.message || 'Falha no login. Verifique suas credenciais.');
      }
    },
    createCategory: async (_parent: any, args: any, context: Context) => {
      try {
        if (!context.userId) throw new AuthenticationError();
        if (!args.name) throw new Error('Nome da categoria é obrigatório');
        
        return await context.prisma.category.create({
          data: {
            name: args.name,
            description: args.description,
            icon: args.icon,
            color: args.color,
            userId: context.userId,
          },
        });
      } catch (error: any) {
        console.error('Erro na mutation createCategory:', error);
        throw new Error(error.message || 'Falha ao criar categoria');
      }
    },
    updateCategory: async (_parent: any, args: any, context: Context) => {
      try {
        if (!context.userId) throw new AuthenticationError();
        
        const category = await context.prisma.category.findFirst({
           where: { id: args.id, userId: context.userId }
        });
        if (!category) throw new Error('Categoria não encontrada ou acesso negado');

        return await context.prisma.category.update({
          where: { id: args.id },
          data: {
            name: args.name,
            description: args.description,
            icon: args.icon,
            color: args.color,
          },
        });
      } catch (error: any) {
        console.error('Erro na mutation updateCategory:', error);
        throw new Error(error.message || 'Falha ao atualizar categoria');
      }
    },
    deleteCategory: async (_parent: any, args: any, context: Context) => {
      try {
         if (!context.userId) throw new AuthenticationError();
         const category = await context.prisma.category.findFirst({
            where: { id: args.id, userId: context.userId }
         });
         if (!category) throw new Error('Categoria não encontrada ou acesso negado');
         
         return await context.prisma.category.delete({
           where: { id: args.id },
         });
      } catch (error: any) {
        // Handle foreign key constraint violations nicely
        if (error.code === 'P2003') {
           throw new Error('Não é possível excluir esta categoria pois existem transações associadas a ela.');
        }
        console.error('Erro na mutation deleteCategory:', error);
        throw new Error(error.message || 'Falha ao excluir categoria');
      }
    },
    createTransaction: async (_parent: any, args: any, context: Context) => {
      try {
         if (!context.userId) throw new AuthenticationError();
         if (args.amount < 0) throw new Error('O valor não pode ser negativo');
         if (!args.categoryId) throw new Error('Categoria é obrigatória');
         
         return await context.prisma.transaction.create({
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
      } catch (error: any) {
         console.error('Erro na mutation createTransaction:', error);
         throw new Error(error.message || 'Falha ao criar transação');
      }
    },
    updateTransaction: async (_parent: any, args: any, context: Context) => {
      try {
         if (!context.userId) throw new AuthenticationError();
         if (args.amount !== undefined && args.amount < 0) throw new Error('O valor não pode ser negativo');
         
         const transaction = await context.prisma.transaction.findFirst({
           where: { id: args.id, userId: context.userId }
         });
         if (!transaction) throw new Error('Transação não encontrada ou acesso negado');

         return await context.prisma.transaction.update({
           where: { id: args.id },
           data: {
             description: args.description,
             amount: args.amount,
             type: args.type,
             date: args.date ? new Date(args.date) : undefined,
             categoryId: args.categoryId,
           },
           include: { category: true },
         });
      } catch (error: any) {
        console.error('Erro na mutation updateTransaction:', error);
        throw new Error(error.message || 'Falha ao atualizar transação');
      }
    },
    deleteTransaction: async (_parent: any, args: any, context: Context) => {
      try {
         if (!context.userId) throw new AuthenticationError();
         const transaction = await context.prisma.transaction.findFirst({
           where: { id: args.id, userId: context.userId }
         });
         if (!transaction) throw new Error('Transação não encontrada ou acesso negado');

         return await context.prisma.transaction.delete({
           where: { id: args.id },
         });
      } catch (error: any) {
        console.error('Erro na mutation deleteTransaction:', error);
        throw new Error(error.message || 'Falha ao excluir transação');
      }
    }
  },
  Transaction: {
    category: (parent: any, args: any, context: Context) => {
        if (!parent.categoryId) return null;
        return context.prisma.category.findUnique({ where: { id: parent.categoryId } });
    }
  }
};
