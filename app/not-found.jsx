"use client"; // ← add this

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative mb-10"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 blur-2xl opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl font-extrabold bg-gradient-to-r from-white to-pink-300 bg-clip-text text-transparent">
            404
          </span>
        </div>
      </motion.div>

      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-semibold mb-2"
      >
        Lost in space?
      </motion.h2>

      <motion.p
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-gray-300 mb-8 text-center max-w-md"
      >
        The page you’re looking for doesn’t exist. Let’s get you back on track.
      </motion.p>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex gap-4"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition"
        >
          <Home className="w-4 h-4" />
          Go Back
        </Link>
      </motion.div>
    </div>
  );
}