import { gql } from "apollo-server-express";

const RequestTypeDefs = gql`
	type Request {
		recID: ID!
		senderDisplayName: String!
		message: String!
		createdAt: String!
	}

	type Query {
		requests: [Request]
	}

	type Mutation {
		createRequest(senderDisplayName: String!, message: String!): Request
		acceptRequest(recID: ID!, postID: String!): Boolean
		declineRequest(recID: ID!, message: String!): Boolean
	}
`;

export default RequestTypeDefs;
