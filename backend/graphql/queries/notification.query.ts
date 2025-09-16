import { gql } from "@apollo/client";

const getNotificationsUsingStudentID = gql`
	query GetNotificationsUsingStudentID {
		notifications {
			notiID
			content
			redirectTo
			isRead
			createdAt
			isInteraction
			notiType
			fromUser {
				profile_pic
				displayname
				username
			}
		}
	}
`;

export { getNotificationsUsingStudentID };
