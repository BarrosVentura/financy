import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    icon: String
    color: String
    transactions: [Transaction!]
  }

  type Transaction {
    id: ID!
    description: String!
    amount: Float!
    type: String!
    date: String!
    category: Category
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    categories: [Category!]!
    transactions: [Transaction!]!
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    createCategory(name: String!, description: String, icon: String, color: String): Category!
    deleteCategory(id: ID!): Category!
    
    createTransaction(description: String!, amount: Float!, type: String!, date: String!, categoryId: String): Transaction!
    updateTransaction(id: ID!, description: String, amount: Float, type: String, date: String, categoryId: String): Transaction!
    deleteTransaction(id: ID!): Transaction!
  }
`;
