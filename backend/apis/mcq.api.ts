import { Router } from "express";
import { Server } from "socket.io";
import rateLimit from 'express-rate-limit';
import logger from "../logger";

const router = Router()


export default function mcqApiRouter(io: Server) {
    router.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5, 
        message: "Too many requests from a student, please try again later.",
    }));

    router.post("/vote", async (req, res: any) => {
        try {
            const studentID = req.session?.["stdid"]
            if (!studentID) return 

            const { questionID, optionID } = req.body;
            logger.info(`(/vote): MCQ response attempt for studentID=${studentID || '--studentID--'}, questionID=${questionID || '--questionID--'}, optionID=${optionID || '--optionID--'}`);
    
            // Basic validation inside the route
            if (!questionID || typeof questionID !== "string") {
                logger.error(`(/vote): Invalid or missing questionID. studentID=${studentID || '--studentID--'}, optionID=${optionID || '--optionID--'}`);
                return res.json({ ok: false, message: "questionID is required and must be a string." });
            }
    
            if (!optionID || typeof optionID !== "string") {
                logger.error(`(/vote): Invalid or missing optionID. studentID=${studentID}, questionID=${questionID}`);
                return res.json({ ok: false, message: "optionID is required and must be a string." });
            }
    
            const [selectedOption, optionQuestionID] = optionID.split(":");
    
            if (!selectedOption || !optionQuestionID) {
                logger.error(`(/vote): optionID format mismatch. studentID=${studentID}, optionID=${optionID}`);
                return res.json({
                    ok: false,
                    message: "optionID must be in format '<option>:<questionID>'",
                });
            }
    
            if (!/^[A-D]$/.test(selectedOption)) {
                logger.error(`(/vote): Invalid option character '${selectedOption}'. studentID=${studentID}, questionID=${questionID}`);
                return res.json({
                    ok: false,
                    message: "Option must be between A to D.",
                });
            }
    
            if (optionQuestionID !== questionID) {
                logger.error(`(/vote): optionID questionID part does not match. studentID=${studentID}, optionID=${optionID}, questionID=${questionID}`);
                return res.json({
                    ok: false,
                    message: "optionID questionID part does not match the provided questionID.",
                });
            }
    
            // Replace this with our actual vote-checking model logic
            const existingVote = { selectedOption: "A" };
            if (existingVote) {
                if (existingVote.selectedOption === selectedOption) {
                    //TODO: unvote the option logic (@rafi)
                    logger.info(`(/vote): Unvoting same option. studentID=${studentID}, questionID=${questionID}, option=${selectedOption}`);
                    return res.json({
                        ok: true,
                        message: "You already voted the selected option.",
                    });
                } else {
                    //TODO: change the vote option logic (@rafi)
                    logger.info(`(/vote): Changed vote. studentID=${studentID}, questionID=${questionID}, from=${existingVote.selectedOption} to=${selectedOption}`);
                    return res.json({
                        ok: true,
                        message: `You have changed your vote to option ${selectedOption}.`,
                    });
                }
            } else {
                //TODO: create a new vote document (@rafi)
                logger.info(`(/vote): New vote. studentID=${studentID}, questionID=${questionID}, option=${selectedOption}`);
                return res.json({
                    ok: true,
                    message: `You have voted for option ${selectedOption}.`,
                });
            }
        } catch (err) {
            logger.error(`(/vote): MCQ vote processing failed for studentID=${req.body?.studentID|| '--studentID--'}, questionID=${req.body?.questionID || '--questionID--'}, optionID=${req.body?.optionID || '--optionID--'}: ${err}`);
            return res.json({
                ok: false,
                message: "MCQ vote processing failed",
            });
        }
    });    

    return router
}
