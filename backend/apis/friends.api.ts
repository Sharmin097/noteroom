import { Router } from "express";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import logger from "../logger";
import { sendFriendRequest, getFriendRequestById, acceptRequest, unfollowRequest } from "../services/friends.service";
import { Convert } from "../services/user.service";
import { v4 as uuidv4 } from "uuid";

const router = Router();

export default function friendsApiRouter(io: Server) {
    router.use(
        rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 10,
            message: "Too many friend request actions. Please try again later.",
        })
    );

    const getUserIDs = async (studentID: string, username: string) => {
        const sender = await Convert.getDocumentID_studentid(studentID);
        const receiver = await Convert.getDocumentID_username(username);
        return { sender, receiver };
    };

    const logAndRespond = (res, level, message, meta = {}) => {
        logger[level](message, meta);
        return res.json({ ok: false, message });
    };

    router.get("/send/:username", async (req, res) => {
        const senderID = req.session?.["stdid"];
        const receiverUsername = req.params.username;

        if (!senderID) return

        try {
            const senderUsername = await Convert.getUserName_studentid(senderID);
            if (!senderUsername) {
                return logAndRespond(res, "error", "Invalid sender username", { senderID });
            }

            if (senderUsername === receiverUsername) {
                return logAndRespond(res, "warn", "Cannot send request to yourself");
            }

            const { sender, receiver } = await getUserIDs(senderID, receiverUsername);

            if (!sender || !receiver) {
                return logAndRespond(res, "error", "Invalid sender or receiver", {
                    senderID,
                    receiverUsername,
                });
            }

            const requestID = uuidv4();
            const result = await sendFriendRequest({
                senderDocID: sender,
                receiverDocID: receiver,
                requestID,
            });

            if (!result.ok) {
                return logAndRespond(res, "error", `Failed to send friend request: ${result.code || "SERVER"}`, result);
            }

            logger.info("Friend request sent", { from: sender, to: receiverUsername });
            return res.status(200).json({ ok: true, requestID });
        } catch (err) {
            console.error(err)
            return logAndRespond(res, "error", "Internal error sending friend request", { err });
        }
    });

    router.get("/requests/:requestID", async (req, res) => {
        const studentID = req.session?.["stdid"];
        const { requestID } = req.params;
        const action = req.query.action as string

        if (!studentID) return;

        try {
            const currentUser = await Convert.getDocumentID_studentid(studentID);
            if (!currentUser) return logAndRespond(res, "warn", "Student not found", { studentID });

            const { ok, request, receiverInfo } = await getFriendRequestById(requestID);
            if (!ok || !request) return logAndRespond(res, "warn", "Request not found", { requestID });

            const isParticipant =
                request.senderDocID._id.toString() === currentUser.toString() ||
                request.receiverDocID._id.toString() === currentUser.toString();

            if (["accept", "unfollow"].includes(action)) {
                if (!isParticipant) {
                    return logAndRespond(res, "warn", "Unauthorized to respond to request", { studentID });
                }
                
                if (action === "accept") {
                    if (receiverInfo !== studentID) {
                        return logAndRespond(res, "warn", "Unauthorized to respond to request", { studentID });
                    }

                    const response = await acceptRequest(requestID)

                    if (!response.ok) {
                        logger.error(`Friend request acceptence failure`, { requestID, studentID });
                        return res.status(200).json({ ok: false, message: "Friend request acceptence failure" });
                    }

                    logger.info(`Friend request accepted`, { requestID, studentID });
                    return res.status(200).json({ ok: true, message: `Request ${action}d` });
                } 

                if (action === "unfollow") {
                    const response = await unfollowRequest(requestID, currentUser)

                    if (!response.ok) {
                        logger.error(`Friend request decline failure`, { requestID, studentID });
                        return res.status(200).json({ ok: false, message: "Friend request decline failure" });
                    }

                    logger.info(`Friend request declined`, { requestID, studentID });
                    return res.status(200).json({ ok: true, message: `Request ${action}d` });
                }
            }

            return logAndRespond(res, "warn", "Invalid action parameter", { action });
        } catch (err) {
            return logAndRespond(res, "error", "Unexpected error", { requestID, err });
        }
    });

    return router;
}
