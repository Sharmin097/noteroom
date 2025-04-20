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
//follow a user

// Simulate in-memory/mock data

let testUserDatabase = {
  receiver: {
    username: "john_doe",
    followers: ["u001", "u002"], // userIds following john_doe
  },
  sender: {
    userId: "u003",
    followings: [], // whom u003 is following
  },
};

// Follow API (GET method)
router.get("/follow/:username", (req, res:any) => {
  const receiverUsername = req.params.username;
  const senderId = typeof req.query.senderId === "string" ? req.query.senderId : "u003"; // fallback default

  // Fetch test objects (simulated data)
  const receiver = testUserDatabase.receiver;
  const sender = testUserDatabase.sender;

  // Check if receiver exists
  if (receiver.username !== receiverUsername) {
    return res.status(404).json({ message: "Receiver not found." });
  }

  // Check if already followed (mock logic)
  const alreadyFollowing = receiver.followers.includes(senderId);

  if (alreadyFollowing) {
    return res.status(200).json({ message: "Already following", followState: "following" });
  }

  // Simulate follow logic by updating mock objects
  receiver.followers.push(senderId);
  sender.followings.push(receiver.username);

  return res.status(200).json({
    message: `Follow request sent to ${receiver.username}`,
    followState: "following",
    testReceiverObject: receiver,
    testSenderObject: sender,
  });
});
    
    return router
}