export interface UserProfilePost {
    postID: string,
    title: string,
    content: {
        resources: string[]
    }
}