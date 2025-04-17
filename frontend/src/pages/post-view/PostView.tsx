import { createContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImageContainer } from "./ImageContainer";
import { NoteEngagement } from "./NoteEngagements";
import PostHeader from "./PostHeader";
import { FeedNoteObject } from "../../types/types";
import { useFeed } from "../../context/FeedNoteContext";
import CommentsContainer from "./CommentsContainer";
import "../../public/css/note-view.css"
import "../../public/css/loaders.css"
import "../../public/css/nav-section.css"
import "../../public/css/main-pages.css"
import "../../public/css/share-note.css"


let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
export const PostContext = createContext<any>(null)

export default function PostView() {
    const { feedNotes, controller: [upvoteNote, saveNote, download] } = useFeed()
    const navigate = useNavigate()

    const [noteImages, setNoteImages] = useState<string[]>([])
    const [offset, setOffset] = useState<number>(0)
    const { postID } = useParams()

    const [noteData, setNoteData] = useState<any>(null)

    const nextImage = () => setOffset(currentIndex => (currentIndex + 1) % noteImages.length)
    const prevImage = () => setOffset(currentIndex => (currentIndex - 1 + noteImages.length) % noteImages.length)

    useEffect(() => {
        async function getNoteData() {
            try {
                const noteData = feedNotes.find((note: any) => note.noteData.noteID === postID)
                if (noteData) {
                    setNoteData(noteData)
                } else {
                    let response = await fetch(`${API_SERVER_URL}/api/posts/${postID}/metadata`, { credentials: 'include' })
                    let data = await response.json()
                    if (data.ok) {
                        let note = new FeedNoteObject(data.noteData)
                        setNoteData(note)
                    } else {
						navigate("/not-found", { replace: true, state: { type: "post", postID: postID } })
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }
        getNoteData()
    }, [feedNotes, postID])

    useEffect(() => {
        async function getNoteImages() {
            try {
                let response = await fetch(`${API_SERVER_URL}/api/posts/${postID}/images`, { credentials: 'include' })
                let data = await response.json()
                if (data.ok && data.images?.length !== 0) {
                    setNoteImages(data.images)
                } else {
                    setNoteImages([])
                }
            } catch (error) {
                console.error(error)
            }
        }
        getNoteImages()
    }, [postID])

    return (
        <PostContext.Provider value={{ noteData, controller: [upvoteNote, saveNote, download] }}>
            <div className="middle-section">
                <div className="post-container">
                    <PostHeader></PostHeader>

                    <div className="post-content">
                        <h1 className="post-title">{noteData?.noteData.noteTitle}</h1>
                        <div className="post-description" dangerouslySetInnerHTML={{ __html: noteData?.noteData.description }}></div>
                        {noteData?.contentData.contentCount > 0 && <ImageContainer noteImages={noteImages} controller={[prevImage, nextImage, offset]} />}
                    </div>

                    <NoteEngagement postImages={noteImages} ></NoteEngagement>
                    <CommentsContainer></CommentsContainer>
                </div>
            </div>
        </PostContext.Provider>
    )
}