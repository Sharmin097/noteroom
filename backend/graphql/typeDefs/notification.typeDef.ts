
const NotificationTypeDefs = `#graphql


type FromUser {
  profile_pic: String!
  displayname: String
  username: String
}

type Notification {
  notiID: String!
  content: String!
  redirectTo: String
  isRead: Boolean!
  createdAt: String!
  isInteraction: Boolean!
  notiType: String! # or enum if you have defined NotificationEvent as enum
  fromUser: FromUser!
  additional: String
}


type Query {
  notifications: [Notification!]!
}
`
export default NotificationTypeDefs