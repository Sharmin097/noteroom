import { v4 as uuid } from "uuid";

// Dummy in-memory data
const dummyRequests = [
	{
		recID: uuid(),
		senderDisplayName: "Sharmin Aktar",
		message: "Can you send me the notes please?",
		createdAt: new Date().toISOString(),
	}
];

const RequestResolvers = {
	Query: {
		requests: () => dummyRequests
	},

	Mutation: {
		createRequest: (_, { senderDisplayName, message }) => {
			const newRequest = {
				recID: uuid(),
				senderDisplayName,
				message,
				createdAt: new Date().toISOString()
			};
			dummyRequests.push(newRequest);
			return newRequest;
		},

		acceptRequest: (_, { recID, postID }) => {
			const index = dummyRequests.findIndex(req => req.recID === recID);
			if (index !== -1) {
				dummyRequests.splice(index, 1); // remove accepted request
				// Notification logic with dummy stub could go here
				return true;
			}
			return false;
		},

		declineRequest: (_, { recID, message }) => {
			const index = dummyRequests.findIndex(req => req.recID === recID);
			if (index !== -1) {
				dummyRequests.splice(index, 1); // remove declined request
				// Notification logic with message stub could go here
				return true;
			}
			return false;
		}
	}
};

export default RequestResolvers;
