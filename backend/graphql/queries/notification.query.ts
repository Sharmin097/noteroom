import { gql } from "@apollo/client";

const getNotifications = gql`
  query GetNotifications {
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
      additional
    }
  }
`;

export { getNotifications };
