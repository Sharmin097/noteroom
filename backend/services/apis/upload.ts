import { Router } from "express";
import { Server } from "socket.io";

const router = Router() 

export default function uploadApiRouter(io: Server) {
    return router
}
