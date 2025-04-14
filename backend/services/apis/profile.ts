import { Router } from "express";
import { Server } from "socket.io";
import { Convert, getMutualCollegeStudents, getProfile } from "../services/userService";
import studentsSchema from "../../schemas/students" 
import sanitizeHtml from 'sanitize-html';

const router = Router()

export default function profileApiRouter(io: Server) {
    router.get("/mutual-college", async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let countDoc = req.query.countdoc ? true : false

            let batch = Number(req.query.batch || "1")
            let count = 15
            let skip = (batch - 1) * count

            let profiles = await getMutualCollegeStudents(studentDocID, { count: count, skip: skip, countDoc })
            res.json(profiles)
        } catch (error) {
            res.json([])
        }
    })

    router.get("/:username", async (req, res) => {
        try {
            if(req.params.username) {
                let username = req.params.username

                let visiterStudentID = req.session["stdid"]
                let profileStudentID = await Convert.getStudentID_username(username)

                let profile = await getProfile(username)
                if (profile.ok) {
                    res.json({ ok: true, profile: {...profile.student, owner: visiterStudentID === profileStudentID } })
                } else {
                    //TODO: handle invalid profile url
                    res.json({ ok: false, message: "Sorry, nobody on NoteRoom goes by that name." })
                }
            } else {
                //TODO: handle 404, generally
                res.json({ ok: false, message: "Page not found!" })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    });
   
     //change profile details
       
const ALLOWED_CHANGEABLE_FIELDS = [
    "displayname",
    "bio",
    "rollnumber",
    "favouritesubject",
    "notfavsubject",
    "group",
    "collegeyear"
  ];
  
 
  router.post("/change", async (req, res:any) => {
    try {
      //Step 1: Get the current user's student ID from the session
       const studentID = req.session["stdid"];
       // hardcoded studentID to check api
      //const studentID ="1"
      if (!studentID) {
        return res.status(401).json({ ok: false, message: "Unauthorized" });
      }
  
      // Step 2: Prepare an object to hold valid updates
      const updates: Record<string, string> = {};
  
      // Step 3: Loop through each key in req.body
      for (const key in req.body) {
        const rawValue = req.body[key];
        const value = sanitizeHtml(rawValue || "").trim(); // Sanitize input

        // Reject if the field is not in allowed list
        if (!ALLOWED_CHANGEABLE_FIELDS.includes(key)) {
          return res.status(400).json({ ok: false, message: `Field "${key}" is not allowed to be changed.` });
        }
  
        //  Reject empty values (like empty strings)
        if (!value) {
          return res.status(400).json({ ok: false, message: `Value for "${key}" cannot be empty.` });
        }
  
        // Add valid and sanitized field to update object
        updates[key] = value;
      }
  
      //If no valid fields were provided
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ ok: false, message: "No valid changes provided." });
      }
  
      // Step 4: Get MongoDB document ID for this student
      const studentDocID = await Convert.getDocumentID_studentid(studentID);
  
      // Step 5: Update the student document in MongoDB
      const result = await studentsSchema.updateOne(
        { _id: studentDocID },
        { $set: updates }
      );
  
      //  Step 6: Respond based on update result
      if (result.modifiedCount > 0) {
        res.json({ ok: true, message: "Profile updated successfully." });
      } else {
        res.status(200).json({ ok: true, message: "No changes were applied." });
      }
  
    } catch (error) {
      // Catch and handle any unexpected server errors
      console.error("Error in /api/users/change:", error);
      res.status(500).json({ ok: false, message: "An error occurred while updating profile." });
    }
  });  

 
    
    return router
}
