import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { AppDataSource } from "./data-source";
import { RegisterResolver } from "./modules/user/Register";
import { redis } from "./redis";
import { LoginResolver } from "./modules/user/Login";
import { MeResolver } from "./modules/user/Me";

declare module "express-session" {
  interface SessionData {
    userId: any;
  }
}
const main = async () => {
  await AppDataSource.initialize();

  const schema = await buildSchema({
    resolvers: [RegisterResolver, LoginResolver, MeResolver],
    emitSchemaFile: true,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }: any) => ({ req }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
  });

  await apolloServer.start();

  const app = express();

  const RedisStore = connectRedis(session);

  app.use(
    cors({
      credentials: true,
      origin: "https://studio.apollographql.com",
    })
  );

  // const corsOptions = {
  //   origin: "https://studio.apollographql.com",
  //   credentials: true,
  // };

  app.use(
    session({
      store: new RedisStore({
        client: redis,
      }),
      name: "qid",
      secret: "aslkdfjoiq12312",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
      },
    })
  );

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

main();
