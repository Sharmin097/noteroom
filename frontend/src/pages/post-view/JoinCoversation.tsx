import { useState } from "react"
import { useParams } from "react-router-dom"
import TextEditor from "../../partials/PopupTextEditor"
import "../../public/css/quick-post.css"

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL

export default function JoinConversation({ fireToast, loading: [loading, setLoading], comments: [comments, setComments] }: any) {
	const [commentData, setCommentData] = useState<string>("")
	const [showEditor, setShowEditor] = useState<boolean>(false)
	const { postID } = useParams()
	async function sendComment() {
		if (commentData.trim().length === 0) return

		try {
			setLoading(true)
			const feedbackFormData = new FormData()
			feedbackFormData.append("feedbackContent", commentData)
			
			const response = await fetch(`${API_SERVER_URL}/api/posts/${postID}/feedbacks`, {
				method: "post",
				body: feedbackFormData,
				credentials: "include"
			})
			if (response.ok) {
				const jsonData = await response.json()
				if (jsonData.ok) {
					const comment = jsonData.feedback
					let fetchedComment = [
						{
							_id: comment._id,
							feedbackContents: comment.feedbackContents,
							commenterDocID: {
								profile_pic: comment.commenterDocID.profile_pic,
								displayname: comment.commenterDocID.displayname,
								username: comment.commenterDocID.username
							},
							replyCount: 0,
							upvoteCount: 0,
							createdAt: comment.createdAt,
							isUpVoted: false
						},
						[]
					]
					setComments((comments: any) => [...[fetchedComment], ...comments])
					setCommentData("")
					setShowEditor(false)
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


	return (
		<>
			<div className="quick-post-container" onClick={() => setShowEditor(prev => !prev)}>
				<div className="quick-post__first-row">
					<div className="quick-post__fr--msg-btn">Join the conversation</div>
				</div>
			</div>
			<TextEditor 
				showState={[showEditor, setShowEditor]} 
				text={[commentData, setCommentData]} 
				loading={[loading, setLoading]} 
				action={sendComment} 
				title={"Give a comment"}
				buttonText={"Comment"}
				inputPlaceHolder={"Join the conversation"}
			/> 
		</>
	)
}
