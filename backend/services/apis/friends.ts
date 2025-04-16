import { Router } from "express";
import { Server } from "socket.io";
import express from "express";
const router = Router()

export default function friendsApiRouter(io: Server) {
   

  const users = {
    alice: { studentID: "stu001" },
    bob: { studentID: "stu002" },
    charlie: { studentID: "stu003" },
    dave: { studentID: "stu004" }
  };
  
  // Simulated in-memory friendRequests (to mimic your future DB structure)
  const friendRequests = {};
  Object.keys(users).forEach((username) => {
    friendRequests[username] = [];
  });
  
  // Simulated logged-in user (for now; replace later with real auth)
  const loggedInUsername = "alice";
  
  /**
   * @route GET /api/friends/send/:username
   * @desc Send a friend request from the logged-in user to :username
   */
  router.get("/send/:username", (req, res:any) => {
    const sender = loggedInUsername;
    const receiver = req.params.username;
  
    // Get the sender's studentID
    const senderStudentID = users[sender]?.studentID;
  
    // Validate sender and receiver
    if (!users[receiver]) {
      return res.status(404).json({ ok: false, message: "Receiver not found" });
    }
  
    if (!senderStudentID) {
      return res.status(404).json({ ok: false, message: "Sender studentID not found" });
    }
  
    if (sender === receiver) {
      return res.status(400).json({ ok: false, message: "Cannot send request to yourself" });
    }
  
    // Initialize sender's request list if it doesn't exist
    if (!friendRequests[sender]) {
      friendRequests[sender] = [];
    }
  
    // Check if request already sent
    const alreadySent = friendRequests[sender].some(
      (req) => req["friend-username"] === receiver
    );
  
    if (alreadySent) {
      return res.json({ ok: false, status: "already friends or pending" });
    }
  
    // Add the request
    friendRequests[sender].push({
      "friend-username": receiver,
      "status": "pending",
      "studentID": senderStudentID
    });
  
    return res.json({
      ok: true,
      status: "pending",
      sender,
      senderStudentID,
      receiver,
      data: friendRequests
    });
  });

    
    return router
}