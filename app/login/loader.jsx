"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        {/* animated logo + text container */}
        <motion.div
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative"
        >
          <Image
            src="/MeghX.png"
            alt="MeghX"
            width={500}
            height={500}
            className="rounded-full"
          />
          {/* glow pulse */}
          <motion.div
            className="absolute -inset-3 rounded-full bg-indigo-400/20 blur-md"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>

        {/* brand name */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
          style={{ fontFamily: "Kalam, cursive" }}
        >
          MeghX
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-sm text-muted-foreground"
        >
          Loading…
        </motion.p>
      </motion.div>
    </div>
  );
}