import { User } from "../Schema/Userschema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateAI } from "./Aicontrollers.js";
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// JWT generators
const generateAccessToken = (user) => jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
const generateRefreshToken = (user) => jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

// Cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
});

// ---------------- AUTH ----------------
export const RegisterSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });
    if (await User.findOne({ email })) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, accessToken },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Incorrect password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

    const { password: pwd, ...userData } = user._doc;
    return res.status(200).json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid or expired refresh token" });

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.cookie("accessToken", newAccessToken, { ...getCookieOptions(), maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", newRefreshToken, { ...getCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

      return res.status(200).json({ message: "Access token refreshed successfully" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// ---------------- AI ACTIONS ----------------
export const Summarize = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uploadId } = req.body;
    if (!uploadId) return res.status(400).json({ error: "uploadId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    const summary = await generateAI(upload.content, "summary");
    upload.summary = summary;
    await user.save();

    res.status(200).json({ message: "Summary generated successfully", summary, uploadId: upload._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const Flashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uploadId } = req.body;
    if (!uploadId) return res.status(400).json({ error: "uploadId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    const flashcards = await generateAI(upload.content, "flashcard");
    upload.flashcards = flashcards;
    await user.save();

    res.status(200).json({ message: "Flashcards generated successfully", flashcards, uploadId: upload._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const Quiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uploadId } = req.body;
    if (!uploadId) return res.status(400).json({ error: "uploadId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    const quizzes = await generateAI(upload.content, "quiz");
    upload.quizzes = quizzes;
    await user.save();

    res.status(200).json({ message: "Quizzes generated successfully", quizzes, uploadId: upload._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ---------------- GET BY ID ----------------
export const getSummaryById = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    res.status(200).json({ summary: upload.summary, uploadId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getFlashcardById = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    const flashcards = upload.flashcards || [];
    res.status(200).json(flashcards); // return directly as array
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const upload = user.uploaded.id(uploadId);
    if (!upload) return res.status(404).json({ error: "Upload not found" });

    const quizzes = upload.quizzes || [];
    res.status(200).json({ quizzes, uploadId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- EVALUATE QUIZ ----------------
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

    let totalScore = 0;

    const results = upload.quizzes.map((quiz) => {
      const userAnswerObj = answers.find((a) => a.question === quiz.question);
      const userAnswer = userAnswerObj ? userAnswerObj.answer : null;
      const isCorrect = userAnswer === quiz.correctAnswer;

      if (isCorrect) totalScore += quiz.score || 1;

      return {
        question: quiz.question,
        selectedAnswer: userAnswer,
        correctAnswer: quiz.correctAnswer,
        isCorrect,
        scoreAwarded: isCorrect ? quiz.score || 1 : 0,
        explanation: quiz.explanation || "No explanation provided",
      };
    });

    const totalPossibleScore = upload.quizzes.reduce((acc, q) => acc + (q.score || 1), 0);

    res.status(200).json({ uploadId, totalScore, totalPossibleScore, results });
  } catch (error) {
    console.error("Quiz evaluation error:", error.stack);
    res.status(500).json({ error: error.message });
  }
};
