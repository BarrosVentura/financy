import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { context } from './context';
import dotenv from 'dotenv';
dotenv.config();

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    context: context,
    listen: { port: parseInt(process.env.PORT || '4000') },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

startServer().catch(err => {
  console.error(err);
});
