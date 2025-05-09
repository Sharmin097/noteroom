
const NotificationTypeDefs = `#graphql
	type Notification {
		notiID: String!
		content: String!
		redirectTo: String
		isRead: Boolean!
		createdAt: String!
		isInteraction: Boolean!
		notiType: String! 
		fromUser: User
	}
`

export default NotificationTypeDefs;