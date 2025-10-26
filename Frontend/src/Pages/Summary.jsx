import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Layers, Cpu, Server, AlertCircle, Repeat, ArrowUpDown } from "lucide-react";
import { api } from "../context/auth";

export const Summarize = () => {
  const { uploadId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get(`/summary/${uploadId}`, { withCredentials: true });
        setSummary(res.data);
      } catch (err) {
        console.error(err);
        alert(`Error fetching summary: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [uploadId]);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 text-lg font-medium">Loading summary...</p>
    );
  if (!summary)
    return (
      <p className="text-center mt-10 text-gray-600 text-lg font-medium">No summary found.</p>
    );

  // Extract key points from numbered list
  const keyPoints = summary.summary
    .split(/\n\d+\.\s+/)
    .slice(1)
    .map((point) => point.trim());

  // Choose icons for first 6 key points (you can customize)
  const icons = [Layers, CheckCircle2, ArrowUpDown, AlertCircle, Repeat, Cpu];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-6">
      <motion.div
        className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 text-center">
          Summary
        </h1>

        {/* Intro Text */}
        <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line text-justify">
          {summary.summary.split(/\n\d+\.\s+/)[0]} {/* Intro text before key points */}
        </p>

        {/* Key Points with icons */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Key Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keyPoints.map((point, index) => {
            const IconComponent = icons[index % icons.length]; // rotate icons if more points
            return (
              <motion.div
                key={index}
                className="flex items-start gap-4 bg-indigo-50 hover:bg-indigo-100 p-5 rounded-xl shadow hover:shadow-lg transition-all cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="text-indigo-600 mt-1">
                  <IconComponent className="w-6 h-6" />
                </div>
                <p className="text-gray-800">{point}</p>
              </motion.div>
            );
          })}
        </div>

        
      </motion.div>
    </div>
  );
};
