import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { SignIn } from "./Pages/SignIn";
import { Summarize } from "./Pages/Summary";
import { Flashcard } from "./Pages/Flashcard";
import { Quiz } from "./Pages/Quiz";
import { QuizAnalysis } from "./Pages/Analysis"; 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={<SignIn />} />

        {/* Separate pages for each action */}
        <Route path="/summarize/:uploadId" element={<Summarize />} />
        <Route path="/flashcard/:uploadId" element={<Flashcard />} />
        <Route path="/quiz/:uploadId" element={<Quiz />} />
        <Route path="/quiz-analysis/:uploadId" element={<QuizAnalysis />} /> 
      </Routes>
    </Router>
  );
};

export default App;

