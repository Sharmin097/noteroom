import { UserProfileType } from "./user.types"

export interface UserProfilePost {
    postID: string,
    title: string,
    content: {
        resources: string[]
    }
}

export interface PostType {
    postID: string,
    title: string,
    description: string | null
    createdAt: string,
    isPostOwner: string,

    content: {
        resources: string[],
        totalContentCount: number
    },
    owner: {
        profile_pic: string,
        displayname: string,
        username: string,
    },
    interactionData: {
        feedbackCount: number,
        upvoteCount: number,
        isSaved: boolean,
        isUpvoted: boolean
    }
}

export interface CommentType {
    _id: string,
    feedbackContents: string,
    commenter: UserProfileType,
    replyCount: number,
    upvoteCount: number
    createdAt: string,
    isUpVoted: boolean,
    replies: [ReplyType]
}

export interface ReplyType {
    _id: string,
    replier: UserProfileType,
    feedbackContents: string,
    createdAt: string,
    parentFeedbackDocID: string
}