import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { BookOpen, Zap, Star } from "lucide-react";
import "./blobAnimation.css";

export const Home = () => {
  // Generate random floating stars/bubbles
  const stars = [...Array(20)].map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: 5 + Math.random() * 15,
    delay: Math.random() * 5,
    opacity: 0.1 + Math.random() * 0.3,
  }));

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 overflow-hidden
      border-8 border-transparent p-2 bg-clip-padding animate-gradient-border font-sans">

      {/* ================= BACKGROUND LOTTIE ================= */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none">
        <DotLottieReact
          src="https://lottie.host/82cecabb-12b9-4c46-bc2d-454af49eb415/FnwrNLJoes.lottie"
          loop
          autoplay
        />
      </div>

      {/* ================= FLOATING BLOBS ================= */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob float-animation"></div>
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 float-animation"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 float-animation"></div>

      {/* ================= FLOATING STARS / BUBBLES ================= */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full animate-float pointer-events-none"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}


      <div className="absolute top-10 left-10 w-60 h-60 opacity-30 float-animation">
        <DotLottieReact
          src="https://lottie.host/59876f40-b481-4f1a-b07d-c87a6ecaae9a/L6INjERbiK.lottie"
          loop
          autoplay
        />
      </div>
      <div className="absolute bottom-80 right-10 w-80 h-80 md:h-[400px] md:w-[300px] md:opacity-60 opacity-10 float-animation">
        <DotLottieReact
          src="https://lottie.host/5335aa6a-8bd0-4148-a3eb-da8bec567e46/OrpmbDQFMW.lottie"
          loop
          autoplay
        />
      </div>

     
      <div className=" hidden md:block absolute top-1/4 left-20 bg-indigo-100 px-5 py-2 rounded-2xl shadow-lg animate-float-slow text-indigo-700 font-medium text-lg">
        “Summarize your knowledge in a single click!”
      </div>
      <div className="absolute md:top-[80px] md:right-16 top-[20px] right-[10px] bg-pink-100 px-5 py-2 rounded-2xl shadow-lg animate-float-slow animation-delay-1000 text-pink-700 font-medium text-lg">
        “Flashcards instantly generated for your study flow!”
      </div>
      <div className="absolute md:bottom-[20px] md:left-[10px] bottom-[40px] left-[4px] bg-yellow-100 px-5 py-2 rounded-2xl shadow-lg animate-float-slow animation-delay-2000 text-yellow-800 font-medium text-lg">
        “Challenge yourself with dynamic quizzes!”
      </div>

    
      <div className="relative z-10 text-center max-w-4xl space-y-6">
        <h1 className="text-6xl md:text-7xl font-extrabold text-indigo-600 tracking-tight drop-shadow-lg hover:scale-105 transition-transform duration-500">
          StudySprint <Star className="inline text-yellow-400 animate-bounce" />
        </h1>

        <p className="text-gray-600 text-xl md:text-2xl italic animate-float-slow">
          "Learn smarter, not harder." <Zap className="inline text-indigo-500" />
        </p>

        <p className="text-gray-500 text-lg md:text-xl flex flex-col md:flex-row items-center justify-center space-x-2 space-y-1 md:space-y-0">
          <BookOpen className="text-indigo-600" /> Upload files, get summaries, generate flashcards, 
          <span className="font-semibold text-indigo-700">and test your knowledge — all seamlessly!</span>
        </p>

        <p className="text-gray-500 md:text-lg text-center mt-2">
          “Turn any document into a powerful study companion. AI-powered insights at your fingertips.” 
        </p>

        <button className="mt-6 cursor-pointer px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105 flex items-center space-x-2">
          <span className="cursor-pointer">Get Started</span>
          <Zap className="w-5 h-5" />
        </button>
      </div>

      
      <div className="absolute bottom-0 w-full  right-[-100px] flex justify-center z-0">
        <div className="w-80 md:w-96 h-80 md:h-96 opacity-70">
          <DotLottieReact
            src="https://lottie.host/59876f40-b481-4f1a-b07d-c87a6ecaae9a/L6INjERbiK.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    </div>
  );
};
