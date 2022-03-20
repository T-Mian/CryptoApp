const { ApolloServer } = require("apollo-server")
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway")
require('dotenv').config()

const astraToken = process.env['REACT_APP_ASTRA_TOKEN']

class StarGateGraphQLDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    request.http.headers.set('x-cassandra-token', astraToken)
  }
}

const gateway = new ApolloGateway({
  serviceList: [
    {
      name: 'coins',
      url: 'https://727c3c12-86d3-428e-b7f6-857c048b7fc8-europe-west1.apps.astra.datastax.com/api/graphql/coins'
    },
    {
      name: 'deals',
      url: 'http://localhost:4001/graphql'
    }],
  introspectionHeaders: {
    'x-cassandra-token': astraToken
  },
  buildService({ name, url }) {
    if (name == "coins") {
      return new StarGateGraphQLDataSource({ url })
    } else {
      return new RemoteGraphQLDataSource
    }
  },
  __exposeQueryPlanExperimental: true
})
  ; (async () => {
    const server = new ApolloServer({
      gateway,
      engine: false,
      subscriptions: false
    })
  })
server.listen().then(({ url }) => {
  console.log(`Gateway redy ad ${url}`)
})
