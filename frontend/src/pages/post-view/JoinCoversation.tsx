import { useState } from "react"
import { useParams } from "react-router-dom"
import TextEditor from "../../partials/PopupTextEditor"
import "../../public/css/quick-post.css"
import { useMutation } from "@apollo/client"
import { postCommentOnPost } from "../../../../backend/graphql/queries/posts.query"

export default function JoinConversation({ fireToast, loading: [loading, setLoading], comments: [comments, setComments] }: any) {
	const [commentData, setCommentData] = useState<string>("")
	const [showEditor, setShowEditor] = useState<boolean>(false)
	const { postID } = useParams()

	const [postComment] = useMutation(postCommentOnPost, {
		onCompleted: (data) => {
			try {
				if (data && data.postComment) {
					const { postComment: commentData } = data
					setComments(prev => [...[commentData], ...prev])
					setShowEditor(false)
					setCommentData("")
				}
			} catch (error) {
				fireToast("Something went wrong! Couldn't reply")
			}
		},
		onError: (error) => {
			fireToast("Something went wrong! Couldn't reply")
		}
	})
	async function sendComment() {
		if (commentData.trim().length === 0) return

		try {
			setLoading(true)
			await postComment({ variables: { postID: postID, feedbackContent: commentData } })
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
