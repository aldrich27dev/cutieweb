import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import { Calendar, Clock, MapPin, Heart } from "lucide-react";

export default function DateStep({ onConfirm }) {
  const [data, setData] = useState({ date: "", time: "", place: "" });
  const [showKilig, setShowKilig] = useState(true); // Control for the modal
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex h-dvh items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {showKilig ? (
          // --- KILIG MODAL ---
          <motion.div
            key="kilig"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900/90 p-8 rounded-3xl border border-pink-500/30 shadow-2xl text-center max-w-sm w-full"
          >
            <div className="mx-auto w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6">
              <Heart className="text-pink-500 animate-pulse" size={40} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Yay! Thank you! 🥰</h2>
            <p className="text-slate-400 mb-6">You just made me the happiest! Let's plan our date so it's perfect. ✨</p>
            <button 
              onClick={() => setShowKilig(false)}
              className="w-full bg-pink-500 hover:bg-pink-600 py-3 rounded-xl font-bold text-white transition-all"
            >
              Let's plan! 📅
            </button>
          </motion.div>
        ) : (
          // --- INPUT FORM ---
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-slate-900/80 p-8 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Date Details 💌</h2>
            
            <div className="space-y-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-slate-500" size={18} />
                <input 
                  type="date" 
                  min={today}
                  className="w-full bg-slate-950 p-3 pl-10 rounded-xl [color-scheme:dark] text-white border border-slate-700 focus:border-pink-500 outline-none" 
                  onChange={(e) => setData({...data, date: e.target.value})} 
                />
              </div>
              
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-slate-500" size={18} />
                <input 
                  type="time" 
                  className="w-full bg-slate-950 p-3 pl-10 rounded-xl [color-scheme:dark] text-white border border-slate-700 focus:border-pink-500 outline-none" 
                  onChange={(e) => setData({...data, time: e.target.value})} 
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Where? 📍" 
                  className="w-full bg-slate-950 p-3 pl-10 rounded-xl text-white border border-slate-700 focus:border-pink-500 outline-none" 
                  onChange={(e) => setData({...data, place: e.target.value})} 
                />
              </div>
            </div>
            
            <button 
              onClick={() => {
                if(data.date && data.time && data.place) onConfirm(data);
                else alert("Fill mo muna lahat, lods! 🥺");
              }} 
              className="w-full mt-6 bg-purple-500 hover:bg-purple-600 py-3 rounded-xl font-bold text-white transition-all"
            >
              Confirm! 🥂
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}