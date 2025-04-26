import FeedNote from "./FeedNoteCard";
import { useFeed } from "../../context/feed.context";
export default function FeedSection() {
	const { feedNotes, loading, lastNoteRef } = useFeed()!

	return (
		<>
			<div className="feed-container">
				{feedNotes?.map((note, index) => {
					return <FeedNote note={note} key={note.postID} ref={feedNotes.length === index + 1 ? lastNoteRef : null}></FeedNote>
				})}

				{loading && <p>Loading...</p>}
			</div>
		</>
	)
}

