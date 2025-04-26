import { createContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImageContainer } from "./ImageContainer";
import { NoteEngagement } from "./NoteEngagements";
import PostHeader from "./PostHeader";
import { useFeed } from "../../context/FeedNoteContext";
import CommentsContainer from "./CommentsContainer";
import { PostType, UserProfilePost } from "../../../../types/post.types";
import { useQuery } from "@apollo/client";
import { getPostByPostID, getPostContentsByPostID } from "../../../../backend/graphql/queries/posts.query";
import "../../public/css/note-view.css"
import "../../public/css/loaders.css"
import "../../public/css/nav-section.css"
import "../../public/css/main-pages.css"
import "../../public/css/share-note.css"


type PostContext = {
    noteData: PostType | null,
    controller: [ //FIXME: this is same as feednotecontext.controller, so make a common post-controller or actions
        (noteID: string, upvoteState: boolean) => Promise<{ ok: boolean, error?: any }>,
        ({ postID, title, content }: UserProfilePost, savedState: boolean) => Promise<{ ok: boolean }>,
        (folderName: string, postID: string, links?: string[]) => Promise<void>
    ]
}
export const PostContext = createContext<PostContext | null>(null)

export default function PostView() {
    const { feedNotes, controller: [upvoteNote, saveNote, download] } = useFeed()!
    const navigate = useNavigate()

    const [noteImages, setNoteImages] = useState<string[]>([])
    const [noteImageLoading, setNoteImageLoading] = useState<boolean>(true)
    const [offset, setOffset] = useState<number>(0)
    const { postID } = useParams()

    const [noteData, setNoteData] = useState<PostType | null>(null)

    const nextImage = () => setOffset(currentIndex => (currentIndex + 1) % noteImages.length)
    const prevImage = () => setOffset(currentIndex => (currentIndex - 1 + noteImages.length) % noteImages.length)

    const { refetch: refetchPost } = useQuery(getPostByPostID, {
        variables: { postID: postID },
        skip: true,
        onCompleted(data) {
            if (data && data.post) {
                const { post } = data
                if (post) setNoteData(post)
            } else {
                navigate('/not-found', { replace: true, state: { type: "post", postID: postID } })
            }
        },
        onError(error) {
            setNoteData(null)
        }
    })

    const { refetch: refetchImages } = useQuery(getPostContentsByPostID, {
        variables: { postID: postID },
        skip: true,
        onCompleted(data) {
            if (data && data.post && data.post.content) {
                const { content } = data.post
                if (content.resources) {
                    setNoteImageLoading(false)
                    setNoteImages(content.resources)
                }
            }
        }
    })

    useEffect(() => {
        async function getNoteData() {
            try {
                const noteData = feedNotes.find(note => note.postID === postID) 
                if (noteData) {
                    setNoteData(noteData)
                } else {
                    refetchPost({ postID: postID })
                }
                refetchImages({ postID: postID })
            } catch (error) {
                console.error(error)
            }
        }
        getNoteData()
    }, [feedNotes, postID])

    return (
        <PostContext.Provider value={{ noteData, controller: [upvoteNote, saveNote, download] }}>
            <div className="middle-section">
                <div className="post-container">
                    <PostHeader></PostHeader>

                    <div className="post-content">
                        <h1 className="post-title">{noteData?.title}</h1>
                        <div className="post-description" dangerouslySetInnerHTML={{ __html: noteData?.description || "" }}></div>
                        {(noteData?.content?.totalContentCount! > 0 && !noteImageLoading) ? <ImageContainer noteImages={noteImages} controller={[prevImage, nextImage, offset]} /> : null}
                    </div>

                    <NoteEngagement postImages={noteImages} ></NoteEngagement>
                    <CommentsContainer></CommentsContainer>
                </div>
            </div>
        </PostContext.Provider>
    )
}