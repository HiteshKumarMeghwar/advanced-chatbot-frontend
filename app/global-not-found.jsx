"use client";
import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { motion } from 'framer-motion'

const inter = Inter({ subsets: ['latin'] })

export default function GlobalNotFound() {
  return (
    <div
      className={`
        flex items-center justify-center min-h-screen
        bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900
        text-white ${inter.className}
      `}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center px-6"
      >
        <motion.h1
          className="text-8xl md:text-9xl font-extrabold tracking-tighter"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          404
        </motion.h1>

        <motion.h2
          className="mt-4 text-2xl md:text-3xl font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Oops! Page not found
        </motion.h2>

        <motion.p
          className="mt-2 text-sm md:text-base text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          The page you are looking for does not exist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center
                       px-6 py-3 rounded-xl bg-white/10 backdrop-blur
                       border border-white/20 hover:bg-white/20
                       transition-all duration-300"
          >
            Go Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}