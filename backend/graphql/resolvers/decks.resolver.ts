import { DecksType } from "../../schemas/decks.model"
import { getSinglePost } from "../../services/post.service"
import { getDecks } from "../../services/decks.service"
import { Convert } from "../../services/user.service"

const DecksResolver = {
    Deck: {
        async subDecks(parent: { deckID: string, type: DecksType, subDecks: any[] }, _, context) {
            try {
                if (!parent.subDecks) {
                    const { req, res } = context
                    const ownerDocID = (await Convert.getDocumentID_studentid(req.session["mstdid"] || req.session["stdid"]))?.toString()
                    if (parent.type === DecksType.ROOT) {
                        const response = await getDecks(ownerDocID, null, { parentDeckID: parent.deckID })
                        if (response.ok) {
                            return response.decks
                        }
                        return null
                    }
                    return null
                }

                return parent.subDecks
            } catch (error) {
                return null
            }
        },
        async savedPosts(parent: { savedPostDocIDs: string[], savedPosts: any[] }, _, context) {
            try {
                if (!parent.savedPosts) {
                    const { req, res } = context
                    const ownerDocID = (await Convert.getDocumentID_studentid(req.session["mstdid"] || req.session["stdid"]))?.toString()
                    const response = await getSinglePost(parent.savedPostDocIDs, ownerDocID)
                    if (response.ok) {
                        return response.post
                    }
                    return null
                }

                return parent.savedPosts
            } catch (error) {
                return null
            }
        }
    }
}

export default DecksResolver
