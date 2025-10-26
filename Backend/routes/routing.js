import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Login, refreshTokenController, RegisterSignup, Summarize,Flashcard, Quiz,evaluateQuiz } from "../controller/userlogic.js";
import { verifyToken } from "../middleware/verifytoken.js"
import dotenv from "dotenv";
import textract from "textract";
import {  User } from "../Schema/Userschema.js";

dotenv.config();

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/register", RegisterSignup);
router.post("/login", Login);
router.post("/refresh", refreshTokenController);
 router.post("/summary",verifyToken,Summarize)
 router.post("/flashcard",verifyToken,Flashcard );
 router.post("/quiz",verifyToken,Quiz)
 router.post("/evaluate",verifyToken,evaluateQuiz)


 router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const userId = req.user.id; 
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "uploads" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

 
    const text = await new Promise((resolve, reject) => {
      textract.fromBufferWithMime(req.file.mimetype, req.file.buffer, (err, text) => {
        if (err) return reject(err);
        resolve(text);
      });
    });


    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newUpload = {
      content: text,
      createdAt: new Date(),
    };

    user.uploaded.push(newUpload);
    await user.save();

    res.status(200).json({
      message: "File uploaded and text extracted successfully",
      fileUrl: result.secure_url,
      extractedText: text,
      uploadId: user.uploaded[user.uploaded.length - 1]._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
