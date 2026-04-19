import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function QuizStep({ onNext }) {
  const [answers, setAnswers] = useState({ bday: "", color: "", music: "" });
  const [error, setError] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const correctAnswers = { bday: "05-27", color: "black", music: "bruno mars" };
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = () => {
    if (answers.bday.endsWith(correctAnswers.bday) && answers.color.toLowerCase() === correctAnswers.color && answers.music.toLowerCase() === correctAnswers.music) {
      setShowCongrats(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="flex h-dvh items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700 w-full max-w-sm text-center">
        <Sparkles className="mx-auto text-yellow-400 mb-4" size={32} />
        <h2 className="text-2xl font-bold mb-6 text-white">Prove you're HER! ✨</h2>
        
        <div className="space-y-4 text-left">
          {/* Birthday */}
          <div>
            <label className="text-sm text-slate-400 block mb-1">When is my incoming birthday? 🎂</label>
            <input type="date" min={today} className="w-full bg-slate-950 p-3 rounded-xl [color-scheme:dark] border border-slate-700 outline-none focus:border-pink-500" onChange={(e) => setAnswers({...answers, bday: e.target.value})} />
          </div>
          
          {/* Color */}
          <div>
            <label className="text-sm text-slate-400 block mb-1">Whats my fav colour? 🎨</label>
            <input className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 outline-none focus:border-pink-500" placeholder="kahit isa lang" onChange={(e) => setAnswers({...answers, color: e.target.value})} />
          </div>
          
          {/* Music */}
          <div>
            <label className="text-sm text-slate-400 block mb-1">Whos my fav music artist? 🎧</label>
            <input className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 outline-none focus:border-pink-500" placeholder="kahit isa lang din" onChange={(e) => setAnswers({...answers, music: e.target.value})} />
          </div>
        </div>

        {error && <p className="text-red-400 mt-4 flex items-center justify-center gap-2"><AlertCircle size={16}/> Oops! Mali yata... ❌</p>}

        <button onClick={handleSubmit} className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold">Check Answers ✅</button>
      </motion.div>

      <AnimatePresence>
  {showCongrats && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-slate-900/90 p-8 rounded-3xl text-center border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] w-full max-w-xs"
      >
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-green-400" size={40} />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Tama ka! ✨</h2>
        <p className="text-slate-400 mb-6">You know me so well! 🥰</p>
        
        <button 
          onClick={onNext} 
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95"
        >
          Continue! 🚀
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}