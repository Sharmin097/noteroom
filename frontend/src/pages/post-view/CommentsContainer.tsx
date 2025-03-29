import { createContext, useContext, useEffect, useRef, useState } from "react"
import JoinConversation from "./JoinCoversation"
import { PostContext } from "./PostView"
import TextEditor from "../../partials/PopupTextEditor"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { Link } from "react-router-dom"
import { useAppData } from "../../context/AppDataContext"
import Toki from "../../assets/toki_nocomments.png"

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL

function Comment({ feedbackData, children }: any) {
    const { controller: [openReplyEditor, upvoteComment] } = useContext(CommentsControllerContext)
    const [isUpVoted, setIsUpVoted] = useState<boolean>(feedbackData?.isUpVoted)
    const [upvoteCount, setUpvoteCount] = useState<number>(feedbackData?.upvoteCount)

    return (
        <div className='main-cmnt-container'>
            <div className="main__author-threadline-wrapper">
                <img
                    src={"https://avatar.iran.liara.run/public/8"}
                    alt="User Avatar"
                    className="main__cmnt-author-img cmnt-author-img"
                />
                <div className="thread-line"></div>
            </div>
            <div className="main__cmnts-replies-wrapper">
                <div className="main__body cmnt-body-3rows">
                    <div className="main__reply-info reply-info">
                        <Link to={`/user/${feedbackData?.commenterDocID.username}`}>
                            <span className="main__author-name">{feedbackData?.commenterDocID.displayname}</span>
                        </Link>
                        <span className="reply-date">{feedbackData?.createdAt}</span>
                    </div>
                    <div className="main__reply-msg reply-msg" dangerouslySetInnerHTML={{ __html: feedbackData?.feedbackContents }}></div>
                    <div className="main__engagement-opts engagement-opts">
                        <div className="like-wrapper" onClick={() => upvoteComment({
                            upvoteCount: [upvoteComment, setUpvoteCount],
                            isUpVoted: [isUpVoted, setIsUpVoted],
                            feedbackID: feedbackData?._id
                        })}>
                            <svg className="like-icon" width="20" height="22" viewBox="0 0 115 117" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {
                                    isUpVoted ? 
                                        <path className='like-icon-fill' d='M28.4938 47.5373C28.4938 47.5373 28.4863 108.91 28.493 110.455C28.4996 112 84.4861 110.998 88.993 110.998C93.5 110.998 108.994 88.5431 109.494 70.581C109.994 52.6188 107.998 49.9985 107.498 49.9985L66 49.9982C78.4744 33.916 62.958 -7.56607 57.9956 8.99958C53.0332 25.5652 49.9956 32.4996 49.9956 32.4996L28.4938 47.5373Z' fill='black'/>
                                        :
                                        <path d="M107.498 49.9985C107.998 49.9985 109.994 52.6188 109.494 70.581C108.994 88.5431 93.5 110.998 88.993 110.998C84.4861 110.998 28.4996 112 28.493 110.455C28.4863 108.91 28.4938 47.5373 28.4938 47.5373L49.9956 32.4996C49.9956 32.4996 53.0332 25.5652 57.9956 8.99958C62.958 -7.56607 78.4744 33.916 66 49.9982M107.498 49.9985C106.998 49.9985 66 49.9982 66 49.9982M107.498 49.9985L66 49.9982" stroke="#606770" strokeWidth="10" strokeLinecap="round" />
                                }

                            </svg>
                            <span className="like-count">{upvoteCount}</span>
                        </div>
                        <svg
                            className="reply-icon thread-opener"
                            onClick={() => openReplyEditor(
                                (new DOMParser()).parseFromString(feedbackData?.feedbackContents, "text/html").querySelector("body")?.textContent,
                                feedbackData?._id,
                                feedbackData?.commenterDocID.username,
                                feedbackData?.commenterDocID.displayname
                            )}
                            width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" strokeWidth="1.14582" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className="thread-section" id={"thread-" + feedbackData?._id}>
                    {children}
                </div>
            </div>
        </div>
    )
}


function Reply({ replyData, parentFeedbackDocID }: { replyData: any, parentFeedbackDocID: any }) {
    const { controller: [openReplyEditor] } = useContext(CommentsControllerContext)

    return (
        <div className='thread-msg'>
            <img
                src={"https://avatar.iran.liara.run/public/90"}
                alt="User Avatar"
                className="cmnt-author-img thread-avatar"
            />
            <div className="cmnt-body-3rows">
                <div className="reply-info">
                    <Link to={`/user/${replyData?.commenterDocID.username}`}>
                        <span className="main__author-name" >{replyData?.commenterDocID.displayname}</span>
                    </Link>
                    <span className="reply-date">{replyData?.createdAt}</span>
                </div>
                <div className="reply-msg" dangerouslySetInnerHTML={{ __html: replyData.feedbackContents }}></div>
                <div className="main__engagement-opts engagement-opts">
                    <svg className="reply-icon thread-opener" onClick={() => openReplyEditor(
                        (new DOMParser()).parseFromString(replyData?.feedbackContents, "text/html").querySelector("body")?.textContent,
                        parentFeedbackDocID,
                        replyData?.commenterDocID.username,
                        replyData?.commenterDocID.displayname
                    )} width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" strokeWidth="1.14582" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    )
}


function CommentSection({ comments: [comments, setComments] }: any) {

    return (
        <>
            {
                comments?.length > 0 ?
                    <div className="cmnts-list">
                        {
                            comments?.map((commentData: any) => {
                                return (
                                    <Comment feedbackData={commentData[0]} key={commentData[0]._id} >
                                        {commentData[1] && commentData[1].length > 0 ? commentData[1].map((replyData: any) => {
                                            return <Reply replyData={replyData} key={replyData._id} parentFeedbackDocID={commentData[0]._id}></Reply>
                                        }) : ''}
                                    </Comment>
                                )
                            })
                        }
                    </div>
                    : <div className="no-comments">
                        <img src={Toki} style={{width: "100px", marginLeft: "40%"}} />
                        <p style={{fontSize: "20px"}}>No comments yet. Be the first one!</p>
                    </div>
                    
            }
        </>
    )
}


export const CommentsControllerContext = createContext<any>(null)
export default function CommentsContainer() {
    const [comments, setComments] = useState<any[]>([])
    const [showEditor, setShowEditor] = useState<boolean>(false)
    const [replyToText, setReplyToText] = useState<string>("")
    const [openedThreadID, setOpenedThreadID] = useState<string>("")
    const [replyData, setReplyData] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [loadingComments, setLoadingComments] = useState<boolean>(true)
    const { userProfile: [, , currentUsername] } = useAppData()

    const { noteData } = useContext(PostContext)
    const postID = noteData?.noteData.noteID
    const replyToUsernameRef = useRef<string>("")
    const replyToDisplaynameRef = useRef<string>("")

    async function sendReply() {
        try {
            if (replyData.trim().length === 0) return

            setLoading(true)
            const replyFormData = new FormData()
            replyFormData.append("replyContent", replyData)
            replyFormData.append("replyToUsername", replyToUsernameRef.current)

            const response = await fetch(`${API_SERVER_URL}/api/posts/${postID}/feedbacks/${openedThreadID}/replies`, {
                method: "post",
                body: replyFormData,
                credentials: "include"
            })
            if (response.ok) {
                const jsonData = await response.json()
                if (jsonData.ok) {
                    const reply = jsonData.reply
                    const fetchedReply = {
                        _id: reply._id,
                        feedbackContents: reply.feedbackContents,
                        commenterDocID: {
                            profile_pic: reply.commenterDocID.profile_pic,
                            displayname: reply.commenterDocID.displayname,
                            username: reply.commenterDocID.username
                        },
                        parentFeedbackDocID: reply.parentFeedbackDocID._id,
                        createdAt: reply.createdAt
                    }
                    setComments((commentData: any[]) => {
                        return commentData.map(comment => {
                            if (comment[0]._id === openedThreadID) {
                                return [comment[0], [...comment[1], ...[fetchedReply]]]
                            }
                            return comment
                        })
                    })

                    setShowEditor(false)
                    setReplyData("")
                    setOpenedThreadID("")
                    setReplyToText("")
                } else {
                    fireToast("Something went wrong! Couldn't reply")
                }
                setLoading(false)
            } else {
                fireToast("Something went wrong! Couldn't reply")
            }
            setLoading(false)
        } catch (error) {
            fireToast("Something went wrong! Couldn't reply")
        } finally {
            setLoading(false)
        }
    }

    async function upvoteComment({ upvoteCount: [upvoteCount, setUpvoteCount], isUpVoted: [isUpVoted, setIsUpVoted], feedbackID }: any) {
        try {
            setUpvoteCount((prev: number) => prev + (isUpVoted ? -1 : +1))
            setIsUpVoted((prev: boolean) => !prev)

            const response = await fetch(`${API_SERVER_URL}/api/posts/${postID}/feedbacks/${feedbackID}/vote?type=${isUpVoted ? 'downvote' : 'upvote'}`, {
                method: "post",
                credentials: "include"
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    function openReplyEditor(replyToText: string, openedThreadID: string, replyToUsername: string, replyToDisplayname: string) {
        setShowEditor(prev => !prev)
        setOpenedThreadID(openedThreadID)
        setReplyToText(replyToText.length > 100 ? replyToText.slice(0, 100) + "..." : replyToText)
        replyToUsernameRef.current = replyToUsername
        replyToDisplaynameRef.current = replyToDisplayname
    }


    function fireToast(title: string) {
        return withReactContent(Swal).fire({
            toast: true,
            position: "bottom-right",
            title: title,
            showConfirmButton: true,
            timer: 3000,
            timerProgressBar: true
        })
    }


    useEffect(() => {
        async function getComments() {
            try {
                setLoadingComments(true)
                setComments([])
                const response = await fetch(`${API_SERVER_URL}/api/posts/${postID}/comments`, { credentials: 'include' })
                const data = await response.json()
                if (data && data.ok) {
                    setComments(prev => [...prev, ...data.comments])
                }
                setLoadingComments(false)
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingComments(false)
            }
        }
        getComments()
    }, [postID])


    return (
        <div className="comment-section">
            {loadingComments ? <div className="search-loading-indicator" style={{margin: "20px 50%"}}></div> : <CommentsControllerContext.Provider value={{ controller: [openReplyEditor, upvoteComment], postID: postID }}>
                <JoinConversation fireToast={fireToast} loading={[loading, setLoading]} comments={[comments, setComments]}></JoinConversation>
                <CommentSection comments={[comments, setComments]}></CommentSection>

                <TextEditor 
                    showState={[showEditor, setShowEditor]} 
                    text={[replyData, setReplyData]} 
                    loading={[loading, setLoading]} 
                    title={"Give a reply"}
                    action={sendReply} 
                    subTitle={replyToText}
                    buttonText={"Reply"}
                    inputPlaceHolder={replyToUsernameRef.current === currentUsername ? `Extend your opinion!` : `Reply to ${replyToDisplaynameRef.current}'s opinion`}
                />
            </CommentsControllerContext.Provider>}
        </div>
    )
}