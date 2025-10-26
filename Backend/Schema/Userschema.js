import mongoose from "mongoose";
const { Schema, model } = mongoose;


const flashcardSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const quizSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  score: { type: Number, default: 1 },  
  explanation: { type: String }          
});


const extractedSchema = new Schema({
  content: { type: String, required: true },
  summary: { type: String },
  flashcards: [flashcardSchema],
  quizzes: [quizSchema],
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  uploaded: [extractedSchema],
  flashcards: [flashcardSchema], 
  quizzes: [quizSchema], 
});

export const User = model("User", userSchema);
export const Flashcard = model("Flashcard", flashcardSchema);
export const Quiz = model("Quiz", quizSchema);
export const Extracted = model("Extracted", extractedSchema);
