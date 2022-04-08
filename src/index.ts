import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";

import { AppDataSource } from "./data-source";
import { RegisterResolver } from "./modules/user/Register";

const main = async () => {
  await AppDataSource.initialize();

  const schema = await buildSchema({
    resolvers: [RegisterResolver],
    emitSchemaFile: true,
  });

  const apolloServer = new ApolloServer({ schema });

  await apolloServer.start();

  const app = express();

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

main();
