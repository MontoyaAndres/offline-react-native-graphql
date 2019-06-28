import React from "react";
import { AsyncStorage } from "react-native";
import { HttpLink } from "apollo-link-http";
import { RetryLink } from "apollo-link-retry";
import { concat } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { persistCache } from "apollo-cache-persist";

import Main from "./Main";

export default function App() {
  const httpLink = new HttpLink({
    uri: "https://graphql-expo.herokuapp.com/v1/graphql"
  });

  const retryLink = new RetryLink({ attempts: { max: Infinity } });

  const link = concat(retryLink, httpLink);

  const cache = new InMemoryCache();

  persistCache({ cache, storage: AsyncStorage });

  const client = new ApolloClient({ link, cache });

  return (
    <ApolloProvider client={client}>
      <Main />
    </ApolloProvider>
  );
}
