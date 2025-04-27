import { ApolloClient, InMemoryCache } from "@apollo/client";
let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL

const client = new ApolloClient({
    uri: `${API_SERVER_URL}/api/graphql`,
    cache: new InMemoryCache(),
    credentials: "include"
})

export default client