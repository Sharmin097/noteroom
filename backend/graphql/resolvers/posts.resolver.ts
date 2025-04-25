import Posts, { PostType } from "../../schemas/notes.model"

const PostsResolvers = {
    Post: {
        async content(parent, args: { startIndex: number, count: number | null}) {
            try {
                const postID = parent.postID
                const content = (await Posts.findOne({ postID: postID, postType: PostType.CONTENT }, { content: 1 }))?.["content"]
                if(content && content.length !== 0) {
                    let sliced: string[]
                    if (!args.startIndex && !args.count) {
                        sliced = content
                    } else if (!args.count) {
                        sliced = content.slice(args.startIndex)
                    } else {
                        sliced = content.slice(args.startIndex, args.count)
                    }

                    return { 
                        resources: sliced, 
                        returnedContentCount: sliced.length, 
                        totalContentCount: content.length 
                    }
                } else {
                    return []
                }
            } catch (error) {
                return []
            }
        }
    }
}

export default PostsResolvers