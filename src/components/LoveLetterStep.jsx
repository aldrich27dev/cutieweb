import { motion } from "framer-motion";
import { Mail, Heart } from "lucide-react";

export default function LoveLetterStep({ onNext }) {
  return (
    <div className="flex h-dvh items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-slate-900/80 p-8 rounded-3xl border border-pink-500/30 w-full max-w-sm shadow-2xl backdrop-blur-sm"
      >
        <Mail className="mx-auto text-pink-500 mb-6" size={48} />
        <h2 className="text-2xl font-bold text-white mb-4">A letter for you... 💌</h2>
        <div className="text-slate-300 mb-8 space-y-4 text-sm leading-relaxed">
          <p>Hiiii</p>
          <p>Gusto ko lang sabihin na sobrang saya ko na makilala ka. Bawat araw, mas lalo kitang na-a-appreciate.</p>
          <p>Sana magustuhan mo 'tong simpleng date na binuo ko. Excited na ako to spend more time with you! ✨</p>
          <p>- Aldrich</p>
        </div>
        <button 
          onClick={onNext}
          className="w-full bg-pink-500 hover:bg-pink-600 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
        >
          <Heart size={18} /> Continue to Celebration!
        </button>
      </motion.div>
    </div>
  );
}