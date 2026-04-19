import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export default function LoveHero() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex h-dvh items-center justify-center p-4">
      <motion.div
        onClick={() => setClicked(!clicked)}
        className="cursor-pointer max-w-sm w-full bg-slate-900/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-[0_0_50px_-12px_rgba(236,72,153,0.3)]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ scale: clicked ? [1, 1.5, 1] : 1 }}
            transition={{ duration: 0.4 }}
          >
            <Heart size={64} className="text-pink-500" fill={clicked ? "currentColor" : "none"} />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={clicked ? "message2" : "message1"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2">
              {clicked ? "You're my everything! ✨" : "Hello, My Love"}
            </h1>
            <p className="text-slate-400">
              {clicked ? "Click again to reset" : "Tap the heart for a surprise..."}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}