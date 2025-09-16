import { Router } from "express";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import logger from "../logger";
import { sendFriendRequest, getFriendRequestByRequestID, acceptRequest, unfollowRequest } from "../services/friends.service";
import { Convert } from "../services/user.service";
import { v4 as uuidv4 } from "uuid";
import { joinLogContexts } from "../services/utils";

const router = Router();

export default function friendsApiRouter(io: Server, context: { rootContext: string }) {
    router.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many friend request actions. Please try again later.",
    }));

    const getUserIDs = async (studentID: string, username: string) => {
        const sender = await Convert.getDocumentID_studentid(studentID);
        const receiver = await Convert.getDocumentID_username(username);
        return { sender, receiver };
    };

    router.get("/send/:username", async (req, res) => {
        const senderID = req.session?.["mstdid"] || req.session?.["stdid"];
        const receiverUsername = req.params.username;

        if (!senderID) return

        try {
            const senderUsername = await Convert.getUserName_studentid(senderID);
            if (!senderUsername) {
                return res.json({ ok: false, message: "Invalid sender username" })
            }

            if (senderUsername === receiverUsername) {
                return res.json({ ok: false, message: "Cannot send request to yourself" })
            }

            const { sender, receiver } = await getUserIDs(senderID, receiverUsername);
            if (!sender || !receiver) {
                return res.json({ ok: false, message: "Invalid sender or receiver" })
            }

            const requestID = uuidv4();
            const result = await sendFriendRequest({
                senderDocID: sender,
                receiverDocID: receiver,
                connectedUserDocIDs: [sender, receiver],
                requestID,
            });

            if (!result.ok) {
                logger.error(`Failed to send connection request`, { entity: 'api', root: joinLogContexts(context.rootContext, ['send', result.context]), action: 'connection-send-failure' }, { response: 'failed', error: result.error.message, code: result.code, sender, receiver })
                return res.json({ ok: false, message: `Failed to send friend request` })
            }

            logger.info(`Connection request sent`, { entity: 'api', root: joinLogContexts(context.rootContext, ['send', result.context]), action: 'connection-send-success' }, { response: 'success', sender, receiver })
            return res.json({ ok: true, requestID });
        } catch (error) {
            logger.error(`Failed to send connection request`, { entity: 'api', root: joinLogContexts(context.rootContext, ['send']), action: 'connection-send-api-failure' }, { error: error.message })
            res.json({ ok: false, message: "Internal error sending friend request" })
        }
    });
    
    router.get("/requests/:requestID", async (req, res) => {
        try {
            const studentID = req.session?.["mstdid"] || req.session?.["stdid"];
            const { requestID } = req.params;
            const action = req.query.action as string
    
            if (!studentID) return;

            const currentUser = await Convert.getDocumentID_studentid(studentID);
            
            const result = await getFriendRequestByRequestID(requestID);
            if (!result.ok || !result.request) {
                logger.error("Connection request not found", { entity: 'api', root: joinLogContexts(context.rootContext, ['requests', action, result.context]), action: 'connection-not-found' }, { response: "failed", error: result.error.message, studentID, requestID, action })
                res.json({ ok: false, message: "Connection not found" })
            }

            const isParticipant = result.request.senderDocID._id.toString() === currentUser.toString() || result.request.receiverDocID._id.toString() === currentUser.toString();

            if (["accept", "unfollow"].includes(action)) {
                if (!isParticipant) {
                    logger.error("Unauthorized to respond to request", { entity: 'api', root: joinLogContexts(context.rootContext, ['requests', action, result.context]), action: 'connection-unauthorized' }, { studentID, requestID, action })
                }
                
                if (action === "accept") {
                    if (result.receiverInfo !== studentID) {
                        res.json({ ok: false, message: "Unauthorized to respond to request" })
                    }
                    
                    const response = await acceptRequest(requestID)
                    if (!response.ok) {
                        logger.error("Connection request acceptence failure", { entity: 'api', root: joinLogContexts(context.rootContext, ['requests', action, response.context]), action: 'connection-accept-failure' }, { response: "failed", error: response.error.message, studentID, requestID, action })
                        return res.json({ ok: false, message: "Connection request acceptence failure" });
                    }
                    
                    logger.info("Connection request accepted", { entity: 'api', root: joinLogContexts(context.rootContext, ['requests', action, response.context]), action: 'connection-accept-success' }, { response: "success", studentID, requestID, action })
                    return res.json({ ok: true, message: `Request accepted` });
                }
                
                if (action === "unfollow") {
                    const response = await unfollowRequest(requestID, currentUser)
                    if (!response.ok) {
                        logger.error("Connection request unfollow failure", { entity: 'api', root: joinLogContexts(context.rootContext, ['requests', action, response.context]), action: 'connection-unfollow-failure' }, { response: "failed", error: response.error.message, studentID, requestID, action })
                        return res.json({ ok: false, message: "Connection request decline failure" });
                    }
                    
                    logger.info("Connection request unfollowed", { entity: 'api', root: joinLogContexts(context.rootContext, ['requests', action, response.context]), action: 'connection-unfollow-success' }, { response: "success", studentID, requestID, action })
                    return res.json({ ok: true, message: `Connection unfollowed` });
                }
            }

            return res.json({ ok: false, message: "Invalid action parameter"})
        } catch (error) {
            logger.error("Failed to manage connection request", { entity: 'api', root: joinLogContexts(context.rootContext, ['requests']), action: 'connection-requests-api-failure' }, { error: error.message })
            res.json({ ok: false, message: "Failed to manage connection request" })
        }
    });

    return router;
}
