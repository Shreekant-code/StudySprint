import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../context/auth";
import { HelpCircle, CheckCircle2 } from "lucide-react";

export const Flashcard = () => {
  const { uploadId } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const res = await api.get(`/flashcard/${uploadId}`, { withCredentials: true });
        setFlashcards(res.data);
      } catch (err) {
        console.error(err);
        alert(`Error fetching flashcards: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [uploadId]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600 text-lg font-medium">Loading flashcards...</p>;
  if (!flashcards.length)
    return <p className="text-center mt-10 text-gray-600 text-lg font-medium">No flashcards found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 text-center">
          Flashcards
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((card, index) => (
            <motion.div
              key={card._id || index}
              className="relative w-full h-56 cursor-pointer perspective"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flip-card w-full h-full">
                <div className="flip-card-inner">
            
                  <div className="flip-card-front bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl p-6 flex flex-col justify-center items-center shadow-lg">
                    <HelpCircle className="w-8 h-8 mb-3 text-indigo-700" />
                    <p className="text-center font-semibold text-gray-800">{card.question}</p>
                  </div>

                
                  <div className="flip-card-back bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 flex flex-col justify-center items-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8 mb-3 text-green-700" />
                    <p className="text-center font-semibold text-gray-800">{card.answer}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-gray-500 text-sm text-center">
          <strong>Total Flashcards:</strong> {flashcards.length}
        </p>
      </div>

      {/* CSS for flip card */}
      <style>
        {`
          .perspective {
            perspective: 1000px;
          }
          .flip-card {
            width: 100%;
            height: 100%;
          }
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.6s;
            transform-style: preserve-3d;
          }
          .flip-card:hover .flip-card-inner {
            transform: rotateY(180deg);
          }
          .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
          }
          .flip-card-back {
            transform: rotateY(180deg);
          }
        `}
      </style>
    </div>
  );
};
