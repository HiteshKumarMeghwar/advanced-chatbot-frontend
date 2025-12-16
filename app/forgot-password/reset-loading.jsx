import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function ResetLoading() {
    return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        {/* animated envelope */}
        <motion.div
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative"
        >
          <Mail className="h-12 w-12 text-indigo-500" />
          {/* glow pulse */}
          <motion.div
            className="absolute -inset-2 rounded-full bg-indigo-400/20 blur-md"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-sm text-muted-foreground"
        >
          Sending password reset link…
        </motion.p>
      </motion.div>
    </div>
  )
}