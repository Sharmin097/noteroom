import { UserProfilePost } from "./post.types"
export interface UserProfileType {
    profile_pic?: string,
    displayname?: string,
    rollnumber?: string,
    collegeyear?: string,
    bio?: string,
    favouritesubject?: string,
    notfavsubject?: string,
    group?: string
    username: string,
    collegeID: string | number,
    featuredNoteCount: number,
    owner: boolean,
    owned_posts: UserProfilePost[],
    saved_posts: UserProfilePost[],
    badges: Badge[]
}

interface Badge {
    badgeID: number,
    badgeLogo: string,
    badgeText: string
}
