import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../context/auth";
import { Check, X, HelpCircle } from "lucide-react";

export const Quiz = () => {
  const { uploadId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quiz/${uploadId}`, { withCredentials: true });
        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error(err);
        alert(`Error fetching quiz: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [uploadId]);

  const handleAnswerSelect = (question, option) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.question !== question);
      return [...filtered, { question, answer: option }];
    });
  };

  const handleSubmit = async () => {
    if (answers.length !== quizzes.length) return alert("Please answer all questions!");

    try {
      const res = await api.post("/quiz/evaluate", { uploadId, answers }, { withCredentials: true });
      navigate(`/quiz-analysis/${uploadId}`, { state: res.data });
    } catch (err) {
      console.error(err);
      alert(`Error submitting quiz: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600 font-medium">Loading quiz...</p>;
  if (!quizzes.length) return <p className="text-center mt-10 text-gray-600 font-medium">No quiz found.</p>;

  const progress = Math.round((answers.length / quizzes.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-indigo-600">Interactive Quiz</h1>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
          <div className="bg-indigo-500 h-4 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-8">
          {quizzes.map((q, idx) => {
            const selectedAnswer = answers.find(a => a.question === q.question)?.answer;
            return (
              <motion.div
                key={q._id || idx}
                className="relative bg-white p-6 rounded-2xl shadow-xl border border-gray-200"
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <p className="text-lg font-semibold mb-4">
                  {idx + 1}. {q.question}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    return (
                      <motion.button
                        key={i}
                        onClick={() => handleAnswerSelect(q.question, opt)}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 justify-center py-3 px-4 rounded-xl font-medium border transition-all text-center
                          ${isSelected ? "bg-indigo-500 text-white border-indigo-500" : "bg-gray-100 border-gray-300 hover:bg-gray-200"}
                        `}
                      >
                        <HelpCircle className={`${isSelected ? "text-white" : "text-indigo-500"} w-5 h-5`} />
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-10 w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all text-xl"
        >
          Submit Quiz
        </motion.button>
      </div>
    </div>
  );
};
