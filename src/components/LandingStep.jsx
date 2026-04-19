import { motion } from "framer-motion";
import { Mail, MailOpen } from "lucide-react";
import { useState } from "react";

export default function LandingStep({ onNext }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(onNext, 1000); 
  };

  return (
    <div className="flex h-dvh flex-col items-center justify-center p-6 text-center">
      <motion.div animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? -20 : 0 }} className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Hey you... ✨</h1>
        <p className="text-slate-400">May surprise ako para sa'yo! 💌</p>
      </motion.div>

      <motion.div animate={isOpen ? { scale: 1.5, opacity: 0 } : { scale: 1 }}>
        <motion.button 
          onClick={handleOpen}
          animate={{ y: [0, -15, 0] }}
          transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-2xl group transition-all hover:border-pink-500"
        >
          {isOpen ? (
            <MailOpen size={64} className="text-pink-500" />
          ) : (
            <Mail size={64} className="text-white group-hover:text-pink-500 transition-colors" />
          )}
          <p className="mt-4 font-bold text-slate-300">
            {isOpen ? "Opening... 🔓" : "Open me! 👋"}
          </p>
        </motion.button>
      </motion.div>
    </div>
  );
}