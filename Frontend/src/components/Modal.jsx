import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, FileUp } from "lucide-react";
import { api } from "../context/auth";

export const SuccessModal = ({ isOpen, title, message, onClose }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [uploadId, setUploadId] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handleActionSelect = (action) => setSelectedAction(action);

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return alert("Upload a file first!");
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await api.post("/upload", formData, {
        withCredentials: true,
      });

      setUploadId(res.data.uploadId);
      alert("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert(`Upload error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit selected action
  const handleSubmit = async () => {
    if (!uploadId) return alert("Upload file first!");
    if (!selectedAction) return alert("Select an action!");
    try {
      setLoading(true);
      const body = { uploadId };
      const urlMap = {
        summarize: "/summary",
        flashcard: "/flashcard",
        quiz: "/quiz",
      };

      const pageMap = {
        summarize: "/summarize",
        flashcard: "/flashcard",
        quiz: "/quiz",
      };

      const res = await api.post(urlMap[selectedAction], body, {
        withCredentials: true,
      });

      // Navigate to the correct page with data
      navigate(`${pageMap[selectedAction]}/${uploadId}`, { state: { data: res.data } });

      // Reset modal
      setSelectedFile(null);
      setSelectedAction("");
      setUploadId(null);
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>

            {/* File Upload */}
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              <button
                onClick={handleFileClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600"
              >
                <FileUp className="w-5 h-5" />
                {selectedFile ? selectedFile.name : "Upload File"}
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="mt-2 w-full py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {["summarize", "flashcard"].map((action) => (
                <motion.button
                  key={action}
                  onClick={() => handleActionSelect(action)}
                  whileTap={{ scale: 0.95 }}
                  disabled={!uploadId}
                  className={`py-2 rounded-xl text-white font-medium transition-all ${
                    selectedAction === action
                      ? "bg-green-700 ring-4 ring-green-300"
                      : action === "summarize"
                      ? "bg-purple-500 hover:bg-purple-600"
                      : "bg-teal-500 hover:bg-teal-600"
                  } ${!uploadId ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* Quiz Button */}
            <div className="mb-4 w-2/3 mx-auto">
              <motion.button
                onClick={() => handleActionSelect("quiz")}
                whileTap={{ scale: 0.95 }}
                disabled={!uploadId}
                className={`w-full py-2 rounded-xl text-white font-medium transition-all ${
                  selectedAction === "quiz"
                    ? "bg-green-700 ring-4 ring-green-300"
                    : "bg-pink-500 hover:bg-pink-600"
                } ${!uploadId ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Quiz
              </motion.button>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSubmit}
              disabled={loading || !uploadId || !selectedAction}
              className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-colors ${
                loading || !uploadId || !selectedAction
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Processing..." : "Submit"}
            </motion.button>

            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
