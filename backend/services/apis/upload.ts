import { Router } from "express";
import { Server } from "socket.io";
import rateLimit from 'express-rate-limit';
import {uploadContentHandler, uploadMCQHandler,uploadFileHandler, uploadLinkHandler } from "../../controllers/uploadController";
const router = Router()


export default function uploadApiRouter(io: Server) {
    router.use(rateLimit({
        windowMs: 60 * 1000, 
        max: 5,
        message: "Too many requests, please try again later."
    }))    

    router.post("/content", uploadContentHandler);
    router.post("/mcq", uploadMCQHandler);
    router.post("/file", uploadFileHandler);
    router.post("/link", uploadLinkHandler);

    return router
}
