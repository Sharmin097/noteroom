import { gql } from "@apollo/client";

const getRequests = gql`
	query GetRequests {
		requests {
			recID
			senderDisplayName
			createdAt
			message
		}
	}
`;

export { getRequests };
