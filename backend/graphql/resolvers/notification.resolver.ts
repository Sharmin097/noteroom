

const resolvers = {
    Query: {
      notifications: () => {
        // for now return test data like:
        return [
          {
            notiID: "1",
            content: "New comment on your post",
            redirectTo: "/post/abc123",
            isRead: false,
            createdAt: new Date().toISOString(),
            isInteraction: true,
            notiType: "COMMENT", // match NotificationEvent enum
            fromUser: {
              profile_pic: "/img/user1.jpg",
              displayname: "Alice",
              username: "alice123",
            },
            additional: null,
          },
        ];
      },
    },
  };
  