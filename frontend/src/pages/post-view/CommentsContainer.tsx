import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react"
import JoinConversation from "./JoinCoversation"
import { PostContext } from "./PostView"
import TextEditor from "../../partials/PopupTextEditor"
import { Link } from "react-router-dom"
import { useAppData } from "../../context/appdata.context"
import Toki from "../../assets/toki_nocomments.png"
import { useGlobalComponentController } from "../../context/globaldata.context"
import { CommentType, ReplyType } from "../../../../types/post.types"
import { useMutation, useQuery } from "@apollo/client"
import { getCommentsByPostID, postReplyOnComment } from "../../../../backend/graphql/queries/posts.query"

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL

function Comment({ feedbackData, children }: { feedbackData: CommentType, children: ReactNode }) {
    const { controller: [openReplyEditor, upvoteComment] } = useContext(CommentsControllerContext)
    const [isUpVoted, setIsUpVoted] = useState<boolean>(feedbackData?.isUpVoted || false) // FIXME: remove default value 
    const [upvoteCount, setUpvoteCount] = useState<number>(feedbackData?.upvoteCount || 0)

    return (
        <div className='main-cmnt-container'>
            <div className="main__author-threadline-wrapper">
                <img
                    src={feedbackData?.commenter?.profile_pic || "https://avatar.iran.liara.run/public/8"}
                    alt="User Avatar"
                    className="main__cmnt-author-img cmnt-author-img"
                />
                <div className="thread-line"></div>
            </div>
            <div className="main__cmnts-replies-wrapper">
                <div className="main__body cmnt-body-3rows">
                    <div className="main__reply-info reply-info">
                        <Link to={`/user/${feedbackData?.commenter?.username}`} style={{ textDecoration: "none", color: "black" }}>
                            <span className="main__author-name">{feedbackData?.commenter?.displayname || "[deleted]"}</span>
                        </Link>
                        <span className="reply-date">{(new Date(parseInt(feedbackData?.createdAt))).toDateString()}</span>
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
                                        <path className='like-icon-fill' d='M28.4938 47.5373C28.4938 47.5373 28.4863 108.91 28.493 110.455C28.4996 112 84.4861 110.998 88.993 110.998C93.5 110.998 108.994 88.5431 109.494 70.581C109.994 52.6188 107.998 49.9985 107.498 49.9985L66 49.9982C78.4744 33.916 62.958 -7.56607 57.9956 8.99958C53.0332 25.5652 49.9956 32.4996 49.9956 32.4996L28.4938 47.5373Z' fill='black' />
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
                                feedbackData?.commenter?.username,
                                feedbackData?.commenter?.displayname
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


function Reply({ replyData, parentFeedbackDocID }: { replyData: ReplyType, parentFeedbackDocID: string }) {
    const { controller: [openReplyEditor] } = useContext(CommentsControllerContext)

    return (
        <div className='thread-msg'>
            <img
                src={replyData?.replier?.profile_pic || "https://avatar.iran.liara.run/public/90"}
                alt="User Avatar"
                className="cmnt-author-img thread-avatar"
            />
            <div className="cmnt-body-3rows">
                <div className="reply-info">
                    <Link to={`/user/${replyData?.replier?.username}`} style={{ textDecoration: "none", color: "black" }}>
                        <span className="main__author-name">{replyData?.replier?.displayname || "[deleted]"}</span>
                    </Link>
                    <span className="reply-date">{(new Date(parseInt(replyData?.createdAt))).toDateString()}</span>
                </div>
                <div className="reply-msg" dangerouslySetInnerHTML={{ __html: replyData?.feedbackContents }}></div>
                <div className="main__engagement-opts engagement-opts">
                    <svg className="reply-icon thread-opener" onClick={() => openReplyEditor(
                        (new DOMParser()).parseFromString(replyData?.feedbackContents, "text/html").querySelector("body")?.textContent,
                        parentFeedbackDocID,
                        replyData?.replier?.username,
                        replyData?.replier?.displayname
                    )} width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" strokeWidth="1.14582" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    )
}


function CommentSection({ comments: [comments, setComments] }: { comments: [CommentType[], React.Dispatch<React.SetStateAction<CommentType[]>>] }) {

    return (
        <>
            {
                comments?.length > 0 ?
                    <div className="cmnts-list">
                        {
                            comments?.map((commentData: CommentType) => {
                                return (
                                    <Comment feedbackData={commentData} key={commentData?._id || Math.random().toString()} >
                                        {commentData?.replies && commentData?.replies?.length > 0 ? commentData?.replies?.map((replyData: ReplyType) => {
                                            return <Reply replyData={replyData} key={replyData?._id || Math.random().toString()} parentFeedbackDocID={commentData?._id}></Reply>
                                        }) : ''}
                                    </Comment>
                                )
                            })
                        }
                    </div>
                    : <div className="no-comments">
                        <img src={Toki} style={{ width: "100px", marginLeft: "40%" }} />
                        <p style={{ fontSize: "20px" }}>No comments yet. Be the first one!</p>
                    </div>

            }
        </>
    )
}


export const CommentsControllerContext = createContext<any>(null)
export default function CommentsContainer() {
    const [comments, setComments] = useState<CommentType[]>([])
    const [showEditor, setShowEditor] = useState<boolean>(false)
    const [replyToText, setReplyToText] = useState<string>("")
    const [openedThreadID, setOpenedThreadID] = useState<string>("")
    const [replyData, setReplyData] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [loadingComments, setLoadingComments] = useState<boolean>(true)
    const { userProfile: [, , currentUsername] } = useAppData()!
    const { toast: [toast, setToast] } = useGlobalComponentController()!

    const { noteData } = useContext(PostContext)!
    const postID = noteData?.postID!
    const replyToUsernameRef = useRef<string>("")
    const replyToDisplaynameRef = useRef<string>("")

    const [postReply] = useMutation(postReplyOnComment, {
        onCompleted: (data) => {
            try {
                if (data && data.postReply) {
                    const { postReply: reply }: { postReply: ReplyType } = data
                    setComments(prev => {
                        return prev.map(comment => {
                            if (comment._id === openedThreadID) {
                                return { ...comment, replies: [...comment.replies || [], reply] }
                            }
                            return comment
                        })                    
                    })
                    setShowEditor(false)
                    setReplyData("")
                    setOpenedThreadID("")
                    setReplyToText("")
                    setLoading(false)
                }
            } catch (error) {
                fireToast("Something went wrong! Couldn't reply")
            }
        },
        onError: (error) => {
            fireToast("Something went wrong! Couldn't reply")
        }
    })

    async function sendReply() {
        try {
            if (replyData.trim().length === 0) return

            setLoading(true)
            await postReply({ variables: { postID, feedbackContent: replyData, parentFeedbackDocID: openedThreadID } })
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

            await fetch(`${API_SERVER_URL}/api/posts/${postID}/feedbacks/${feedbackID}/vote?type=${isUpVoted ? 'downvote' : 'upvote'}`, {
                method: "post",
                credentials: "include"
            })
        } catch (error) {
            console.error(error)
        }
    }

    function openReplyEditor(replyToText: string, openedThreadID: string, replyToUsername: string, replyToDisplayname: string) {
        setShowEditor(prev => !prev)
        setOpenedThreadID(openedThreadID)
        setReplyToText(`<b>${replyToDisplayname}</b> - ${(replyToText.length > 100 ? replyToText.slice(0, 100) + "..." : replyToText)}`)
        replyToUsernameRef.current = replyToUsername
        replyToDisplaynameRef.current = replyToDisplayname
    }


    function fireToast(title: string) {
        setToast({ show: true, data: { message: title } })
    }

    const { refetch: refetchComments } = useQuery(getCommentsByPostID, {
        variables: { postID: postID },
        skip: true,
        onCompleted: (data) => {
            if (data && data.comments) {
                setComments(prev => [...prev, ...data.comments])
            }
        }
    })


    useEffect(() => {
        async function getComments() {
            try {
                setLoadingComments(true)
                setComments([])
                await refetchComments({ postID: postID })
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
            {loadingComments ? <div className="search-loading-indicator" style={{ margin: "20px 50%" }}></div> : <CommentsControllerContext.Provider value={{ controller: [openReplyEditor, upvoteComment], postID: postID }}>
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