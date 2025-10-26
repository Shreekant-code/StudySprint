import { useLocation, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export const QuizAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-600 text-lg mb-4">No analysis data found. Go back to quiz.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
        >
          Back
        </button>
      </div>
    );
  }

  const { totalScore, results } = data;
  const totalQuestions = results.length;
  const correctCount = results.filter(r => r.isCorrect).length;
  const wrongCount = totalQuestions - correctCount;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  const pieData = [
    { name: "Correct", value: correctCount },
    { name: "Wrong", value: wrongCount }
  ];
  const COLORS = ["#22c55e", "#ef4444"]; // green, red

  const wrongTopics = results
    .filter(r => !r.isCorrect)
    .map(r => r.question);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-indigo-600">
          Quiz Analysis
        </h1>

       
        <div className="flex flex-col md:flex-row items-center justify-around gap-10 mb-12">
          {/* Pie Chart */}
          <div className="w-full md:w-1/2 h-72 md:h-96 bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Answer Distribution</h2>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, "Questions"]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Score Progress */}
          <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Score Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden mb-4">
              <div
                className="bg-indigo-600 h-8 flex items-center justify-center text-white font-bold transition-all"
                style={{ width: `${scorePercentage}%` }}
              >
                {scorePercentage}%
              </div>
            </div>
            <p className="text-gray-600 text-center">You answered {correctCount} out of {totalQuestions} correctly.</p>
          </div>
        </div>

        {/* Suggested Topics to Improve */}
        {wrongTopics.length > 0 && (
          <motion.div
            className="mb-12 p-6 bg-yellow-50 rounded-2xl shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-yellow-800 mb-4">Topics to Improve</h2>
            <ul className="list-disc list-inside text-yellow-900 space-y-1">
              {wrongTopics.map((topic, idx) => (
                <li key={idx}>{topic}</li>
              ))}
            </ul>
          </motion.div>
        )}

      
        <div className="flex flex-col gap-6">
          {results.map((r, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between transition-all
                ${r.isCorrect ? "bg-green-50" : "bg-red-50"}
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {index + 1}. {r.question}
                </h3>
                <p>
                  <strong>Your Answer:</strong>{" "}
                  <span className={r.isCorrect ? "text-green-700" : "text-red-700"}>
                    {r.selectedAnswer || "Not answered"}
                  </span>
                </p>
                {!r.isCorrect && (
                  <p>
                    <strong>Correct Answer:</strong>{" "}
                    <span className="text-green-700">{r.correctAnswer}</span>
                  </p>
                )}
                <p className="mt-2 text-gray-600"><strong>Explanation:</strong> {r.explanation}</p>
              </div>
              <div className="flex-shrink-0">
                {r.isCorrect ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
