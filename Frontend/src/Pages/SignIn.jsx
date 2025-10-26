import { useState } from "react";
import { useSnackbar } from "notistack";
import { Sparkles, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { SuccessModal } from "../components/Modal";
import { api } from "../context/auth"; // Axios instance with interceptors

export const SignIn = () => {
  const [isRegister, setRegister] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isModalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isRegister ? "/register" : "/login";
      const body = isRegister
        ? formData
        : { email: formData.email, password: formData.password };

      const response = await api.post(url, body); // Axios sends cookies automatically
      const data = response.data;

      const msg = data.message || (isRegister ? "Registration successful!" : "Login successful!");
      enqueueSnackbar(msg, { variant: "success" });

      setSuccessMessage(msg);
      setModalOpen(true);
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
      enqueueSnackbar(
        err.response?.data?.error || err.message || "Network error",
        { variant: "error" }
      );
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative bg-white shadow-2xl rounded-3xl p-9 w-full max-w-sm z-10"
      >
        <div className="flex flex-col items-center mb-7">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-indigo-600 w-7 h-7 animate-bounce" />
            <h1 className="text-3xl font-extrabold text-gray-800">StudySprint</h1>
          </div>
          <p className="text-gray-500">
            {isRegister
              ? "Create a new account to get started."
              : "Welcome back! Sign in to continue."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full" autoComplete="off">
          {isRegister && (
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-700 focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-700 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-700 focus:ring-2 focus:ring-purple-400 outline-none"
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition"
          >
            {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-7">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <span
            onClick={() => setRegister(!isRegister)}
            className="text-indigo-600 font-semibold cursor-pointer ml-2 hover:underline"
          >
            {isRegister ? "Sign In" : "Register"}
          </span>
        </p>
      </motion.div>

      <SuccessModal
        isOpen={isModalOpen}
        title={isRegister ? "Account Created!" : "Welcome Back!"}
        message={successMessage}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
};
