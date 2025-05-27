import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../services/user.service";
import logger from "../logger";
import sanitizeHtml from 'sanitize-html';
import { addRootDeck, addSubDeck, getRootDeck } from "../services/decks.service";
import { DecksType } from "../schemas/decks.model";

const router = Router();

export default function decksApiRouter(io: Server) {
    router.post("/create", async (req, res: any) => {
        try {
            const studentID = req.session["stdid"];
            if (!studentID) return

            const { type, root_deck_id } = req.query;

            if (!type || ![DecksType.ROOT, DecksType.SUB].includes(type as DecksType)) {
                logger.warn(`Invalid deck type: ${type}`);
                return res.json({ ok: false, message: "Invalid deck type. Must be 'root' or 'sub'" });
            }

            const title = sanitizeHtml(req.body.title || "").trim();
            if (!title || title.length < 3 || title.length > 100) {
                logger.warn(`Invalid title length: ${title?.length}`);
                return res.json({ ok: false, message: "Title must be between 3 and 100 characters" });
            }

            const ownerDocID = await Convert.getDocumentID_studentid(studentID);
            if (!ownerDocID) {
                logger.error(`Failed to get owner document for studentID=${studentID}`);
                return res.json({ ok: false, message: "Internal server error" });
            }

            if (type === DecksType.ROOT as string) {
                const response = await addRootDeck({
                    title: title,
                    depth: 0,
                    ownerDocID: ownerDocID
                });
                if (response.ok) {
                    logger.info(`Created root deck: ${title} by studentID=${studentID}`);
                    return res.json({ ok: true, message: "Root deck created" });
                }

                logger.info(`Root deck creation failure by studentID=${studentID}`);
                return res.json({ ok: false, message: "Couldn't create a deck" });
            }

            else if (type === DecksType.SUB as string) {
                if (!root_deck_id || typeof root_deck_id !== 'string') {
                    logger.warn(`Missing or invalid root_deck_id`);
                    return res.json({ ok: false, message: "Root deck ID is required for subdecks" });
                }

                const rootDeck = await getRootDeck(root_deck_id, ownerDocID);
                if (!rootDeck.ok) {
                    logger.warn(`Unauthorized subdeck creation attempt - root_deck_id=${root_deck_id}, studentID=${studentID}`);
                    return res.json({ ok: false, message: "Invalid root deck or unauthorized" });
                }

                const response = await addSubDeck({
                    title,
                    depth: 1,
                    ownerDocID,
                    parentDeckID: root_deck_id
                });

                if (response.ok) {
                    logger.info(`Created subdeck: ${title} by studentID=${studentID} in rootdeck=${root_deck_id}`);
                    return res.json({ ok: true, message: "Subdeck created" });
                }

                logger.info(`Subdeck creation failure: ${title} by studentID=${studentID} in root deck=${root_deck_id}`);
                return res.json({ ok: false, message: "Couldn't create subdeck" });
            }
            else {
                return res.json({ ok: false, message: "Invalid deck type" });
            }
        } catch (error) {
            logger.error(`Error creating deck: ${error}`);
            return res.json({ ok: false, message: "Failed to create deck" });
        }
    });

    return router;
}
