const PostTypeDefs = `#graphql
    type Content {
        resources: [String]
        returnedContentCount: Int
        totalContentCount: Int
    }

    type InteractionData {
        feedbackCount: Int
        upvoteCount: Int
        isSaved: Boolean
        isUpvoted: Boolean
    }

    type Post {
        postID: String!
        title: String!
        description: String
        createdAt: String
        isPostOwner: Boolean!
        content(startIndex: Int, count: Int): Content
        owner: User
        interactionData: InteractionData
        ownerUserName: String!
    }

    type Comment {
        _id: String!
        feedbackContents: String!
        commenter: User!
        replyCount: Int!
        upvoteCount: Int!
        createdAt: String!
        replies: [Reply]
    }

    type Reply {
        _id: String
        replier: User
        feedbackContents: String
        createdAt: String
        parentFeedbackDocID: String
    }
`

export default PostTypeDefs


/* 
[
    [ { comment1 }, { reply1, reply2 } ],
    [ { comment2 }, { reply1, reply2 } ],
]
[
    [
        {
            "_id": "6814e3e7f565a420d226d8b3",
            "noteDocID": "6712fdf9eed60225d6aff2f8",
            "feedbackContents": "haha, this is also a test if you don know!",
            "docType": "feedbacks",
            "commenterDocID": {
                "_id": "670955a378c4ceb3504985b7",
                "profile_pic": "https://storage.googleapis.com/noteroom-fb1a7.appspot.com/670955a378c4ceb3504985b7/3d-rendering-kid-playing-digital-game.jpg",
                "displayname": "Rafi Rahman",
                "studentID": "9181e241-575c-4ef3-9d3c-2150eac4566d",
                "username": "rafi-rahman-9181e241"
            },
            "replyCount": 1,
            "upvoteCount": 0,
            "createdAt": "2025-05-02T15:25:27.548Z",
            "__v": 0,
            "isUpVoted": false
        },
        [
            {
                "_id": "6814e3f1f565a420d226d8bd",
                "noteDocID": "6712fdf9eed60225d6aff2f8",
                "feedbackContents": "why there are so many tests!",
                "docType": "replies",
                "commenterDocID": {
                    "_id": "670955a378c4ceb3504985b7",
                    "profile_pic": "https://storage.googleapis.com/noteroom-fb1a7.appspot.com/670955a378c4ceb3504985b7/3d-rendering-kid-playing-digital-game.jpg",
                    "displayname": "Rafi Rahman",
                    "studentID": "9181e241-575c-4ef3-9d3c-2150eac4566d",
                    "username": "rafi-rahman-9181e241"
                },
                "parentFeedbackDocID": "6814e3e7f565a420d226d8b3",
                "createdAt": "2025-05-02T15:25:37.287Z",
                "__v": 0
            }
        ]
    ],
    [
        {
            "_id": "6814e3cff565a420d226d89e",
            "noteDocID": "6712fdf9eed60225d6aff2f8",
            "feedbackContents": "This is absolute test!",
            "docType": "feedbacks",
            "commenterDocID": {
                "_id": "670955a378c4ceb3504985b7",
                "profile_pic": "https://storage.googleapis.com/noteroom-fb1a7.appspot.com/670955a378c4ceb3504985b7/3d-rendering-kid-playing-digital-game.jpg",
                "displayname": "Rafi Rahman",
                "studentID": "9181e241-575c-4ef3-9d3c-2150eac4566d",
                "username": "rafi-rahman-9181e241"
            },
            "replyCount": 1,
            "upvoteCount": 0,
            "createdAt": "2025-05-02T15:25:03.270Z",
            "__v": 0,
            "isUpVoted": false
        },
        [
            {
                "_id": "6814e3d8f565a420d226d8a8",
                "noteDocID": "6712fdf9eed60225d6aff2f8",
                "feedbackContents": "I know, this has to be a test!",
                "docType": "replies",
                "commenterDocID": {
                    "_id": "670955a378c4ceb3504985b7",
                    "profile_pic": "https://storage.googleapis.com/noteroom-fb1a7.appspot.com/670955a378c4ceb3504985b7/3d-rendering-kid-playing-digital-game.jpg",
                    "displayname": "Rafi Rahman",
                    "studentID": "9181e241-575c-4ef3-9d3c-2150eac4566d",
                    "username": "rafi-rahman-9181e241"
                },
                "parentFeedbackDocID": "6814e3cff565a420d226d89e",
                "createdAt": "2025-05-02T15:25:12.857Z",
                "__v": 0
            }
        ]
    ]
]
 */