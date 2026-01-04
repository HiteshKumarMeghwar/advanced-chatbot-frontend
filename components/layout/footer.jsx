"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  return (
    <footer className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        
        <motion.p 
        className="text-sm text-muted-foreground"
        whileHover={{ scale: 1.25 }}
        transition={{
          scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
          rotate: { duration: 0.2 },                             // plus→X speed
        }}
        >
          © 2026 <span className="font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
            style={{ fontFamily: "Kalam, cursive" }}>MeghX.</span> All rights reserved.
        </motion.p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <motion.div
            whileHover={{ scale: 1.25 }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
              rotate: { duration: 0.2 },                             // plus→X speed
            }}
          >  
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.25 }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
              rotate: { duration: 0.2 },                             // plus→X speed
            }}
          >
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.25 }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
              rotate: { duration: 0.2 },                             // plus→X speed
            }}
          >
          <Link href="/support" className="hover:underline">
            Support
          </Link>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}