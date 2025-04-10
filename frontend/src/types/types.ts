export interface SavedNoteObject {
    noteID: string,
    noteTitle: string,
	noteThumbnail: string
}

export interface RequestObject {
	recID: string,
	senderDisplayName: string,
	createdAt: string,
	message: string
}

export interface IONotification {
    notiID: string,
    content: string,
    redirectTo: string | null,
    isRead: false,
    createdAt: string,
    isInteraction: boolean,
	notiType: string,
    fromUser: {
        profile_pic: string,
        displayname: any,
        username: any
    },
	additional?: any
}
export class FeedNoteObject {
	noteData: any;
	contentData: any;
	ownerData: any;
	interactionData: any;
	extras: any;

	constructor(note: any) {
		this.noteData = {
			noteID: note.postID,
			noteTitle: note.title,
			description: note.description,
			createdAt: note.createdAt,
		};
		this.contentData = {
			content1: note.content.length >= 1 ? note.content[0] : null,
			content2: note.content.length > 1 ? note.content[1] : null,
			contentCount: note.content.length,
		};
		this.ownerData = {
			ownerID: note.ownerDocID.studentID,
			profile_pic: note.ownerDocID.profile_pic,
			ownerDisplayName: note.ownerDocID.displayname,
			ownerUserName: note.ownerDocID.username,
			isOwner: note.isOwner,
		};
		this.interactionData = {
			feedbackCount: note.feedbackCount,
			upvoteCount: note.upvoteCount,
			isSaved: note.isSaved,
			isUpvoted: note.isUpvoted,
		};
		this.extras = {
			pinned: note.pinned,
		};
	}
}