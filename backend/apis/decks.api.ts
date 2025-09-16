import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../services/user.service";
import logger from "../logger";
import sanitizeHtml from 'sanitize-html';
import { addRootDeck, addSubDeck, getRootDeck } from "../services/decks.service";
import { DecksType } from "../schemas/decks.model";
import { joinLogContexts } from "../services/utils";

const router = Router();

export default function decksApiRouter(io: Server, context: { rootContext: string }) {
    router.post("/create", async (req, res: any) => {
        try {
            const studentID = req.session["stdid"];
            if (!studentID) return

            const { type, root_deck_id } = req.query;

            if (!type || ![DecksType.ROOT, DecksType.SUB].includes(type as DecksType)) {
                return res.json({ ok: false, message: "Invalid deck type. Must be 'root' or 'sub'" });
            }
            
            const title = sanitizeHtml(req.body.title || "").trim();
            if (!title || title.length < 3 || title.length > 100) {
                return res.json({ ok: false, message: "Title must be between 3 and 100 characters" });
            }

            const ownerDocID = await Convert.getDocumentID_studentid(studentID);
            if (!ownerDocID) {
                logger.error(`Failed to get owner document`, { entity: 'api', root: joinLogContexts(context.rootContext, ['create']), action: 'ownerDocID-not-found' }, { studentID })
                return res.json({ ok: false, message: "Internal server error" });
            }

            if (type === DecksType.ROOT as string) {
                const response = await addRootDeck({
                    title: title,
                    depth: 0,
                    ownerDocID: ownerDocID
                });
                if (response.ok) {
                    logger.info(`Created root deck`, { entity: 'api', root: joinLogContexts(context.rootContext, ['create', 'rootdeck', response.context]), action: 'rootdeck-creation-success' }, { response: 'success', deckID: response.deck?._id?.toString(), studentID })
                    return res.json({ ok: true, message: "Root deck created" });
                }
                
                logger.error(`Root deck creation failure`, { entity: 'api', root: joinLogContexts(context.rootContext, ['create', 'rootdeck', response.context]), action: 'rootdeck-creation-failure' }, { response: 'failed', error: response.error.message, studentID })
                return res.json({ ok: false, message: "Couldn't create a deck" });
            }

            else if (type === DecksType.SUB as string) {
                if (!root_deck_id || typeof root_deck_id !== 'string') {
                    return res.json({ ok: false, message: "Root deck ID is required for subdecks" });
                }

                const rootDeck = await getRootDeck(root_deck_id, ownerDocID);
                if (!rootDeck.ok) {
                    logger.error(`Unauthorized subdeck creation attempt, ownerDocID doesn't own this deck`, { entity: 'api', root: joinLogContexts(context.rootContext, ['create', 'subdeck', rootDeck.context]), action: 'subdeck-unauthorized' }, { response: 'failed', rootDeckID: root_deck_id, error: rootDeck.error.message, studentID, ownerDocID })
                    return res.json({ ok: false, message: "Invalid root deck or unauthorized" });
                }

                const response = await addSubDeck({
                    title,
                    depth: 1,
                    ownerDocID,
                    parentDeckID: root_deck_id
                });

                if (response.ok) {
                    logger.info(`Created subdeck`, { entity: 'api', root: joinLogContexts(context.rootContext, ['create', 'subdeck', response.context]), action: 'subdeck-creation-success' }, { response: 'success', deckID: response.deck?._id?.toString(), rootDeckID: root_deck_id, studentID })
                    return res.json({ ok: true, message: "Subdeck created" });
                }
                
                logger.error(`Subdeck creation failure`, { entity: 'api', root: joinLogContexts(context.rootContext, ['create', 'subdeck', response.context]), action: 'subdeck-creation-failure' }, { response: 'failed', rootDeckID: root_deck_id, error: response.error.message, studentID })
                return res.json({ ok: false, message: "Couldn't create subdeck" });
            }
            else {
                return res.json({ ok: false, message: "Invalid deck type" });
            }
        } catch (error) {
            logger.error(`Decks creation failure`, { entity: 'api', root: joinLogContexts(context.rootContext, ['create']), action: 'deck-cretion-api-failure' }, { error: error.message })
            return res.json({ ok: false, message: "Failed to create deck" });
        }
    });

    return router;
}
