import { User } from "../Schema/Userschema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
import { generateAI } from "./Aicontrollers.js";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: "1hr" });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};


export const RegisterSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existEmail = await User.findOne({ email });
    if (existEmail)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

   
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email,accessToken },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);


    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: pwd, ...userData } = user._doc;

    return res.status(200).json({
      message: "Login successful",
      user: userData,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

   
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired refresh token" });
      }

      
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ error: "User not found" });

     
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, 
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

      return res.status(200).json({
        message: "Access token refreshed successfully",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};



export const Summarize = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken middleware
    const { uploadId } = req.body; // frontend should send uploadId

    if (!uploadId) {
      return res.status(400).json({ error: "uploadId is required" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

  
    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    
    const summary = await generateAI(upload.content, "summary");

    
    upload.summary = summary;
    await user.save();

    res.status(200).json({
      message: "Summary generated successfully",
      summary,
      uploadId: upload._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



export const Flashcard = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { uploadId } = req.body; 

    if (!uploadId) {
      return res.status(400).json({ error: "uploadId is required" });
    }

   
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

  
    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    
    const flashcard = await generateAI(upload.content, "flashcard");

    
    upload.flashcards= flashcard;
    await user.save();

    res.status(200).json({
      message: "Flascard  generated successfully",
      flashcard,
      uploadId: upload._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



export const Quiz = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { uploadId } = req.body; 

    if (!uploadId) {
      return res.status(400).json({ error: "uploadId is required" });
    }

   
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

  
    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    
    const quizes = await generateAI(upload.content, "quiz");

    
    upload.quizzes= quizes;
    await user.save();

    res.status(200).json({
      message: "quiz  generated successfully",
      quizes,
      uploadId: upload._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



export const evaluateQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uploadId, answers } = req.body;

    if (!uploadId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "uploadId and answers are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    if (!upload.quizzes || upload.quizzes.length === 0) {
      return res.status(400).json({ error: "No quizzes found for this upload" });
    }

    

    // Evaluate answers
    const results = upload.quizzes.map(quiz => {
      const userAnswerObj = answers.find(a => a.question === quiz.question);
      const userAnswer = userAnswerObj ? userAnswerObj.answer : null;
      const isCorrect = userAnswer === quiz.correctAnswer;

      if (isCorrect) totalScore += quiz.score;

      return {
        question: quiz.question,
        selectedAnswer: userAnswer,
        correctAnswer: quiz.correctAnswer,
        isCorrect,
        scoreAwarded: isCorrect ? quiz.score : 0,
        explanation: quiz.explanation || "No explanation provided"
      };
    });

    res.status(200).json({
      message: "Quiz evaluated successfully",
      totalScore,
      totalPossibleScore: upload.quizzes.reduce((acc, q) => acc + q.score, 0),
      results
    });

  } catch (error) {
    console.error("Quiz evaluation error:", error.stack);
    res.status(500).json({ error: error.message });
  }
};
