// TYPE: Planning Wizard Form Input Component
// FILE PATH: src/components/DateStep.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Heart, Loader2 } from "lucide-react";
import { supabaseClient } from "../supabaseClient";

export default function DateStep({ onConfirm }) {
  const [data, setData] = useState({ date: "", time: "", place: "" });
  const [showKilig, setShowKilig] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const handleSubmit = async () => {
    if (!data.date || !data.time || !data.place) {
      alert("Fill mo muna lahat, love! 🥺");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Awtomatikong sine-save ang bagong draft sa dates table bilang 'pending'
      await supabaseClient.insertDate({
        date: data.date,
        time: data.time,
        place: data.place,
        status: "pending",
        caption: "A planned surprise waiting to happen! ✨"
      });

      // 2. Ipapasa ang payload pabalik sa parent state manager (App.jsx) para sa EmailJS/Calendar screen step transition
      if (onConfirm) {
        onConfirm(data);
      }
    } catch (err) {
      console.error("Supabase insert error inside wizard flow:", err);
      alert(err instanceof Error ? err.message : "Failed to save your date draft to the pipeline.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh w-full items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {showKilig ? (
          // --- KILIG MODAL ---
          <motion.div
            key="kilig"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900/90 p-8 rounded-3xl border border-pink-500/30 shadow-[0_24px_90px_rgba(15,23,42,0.45)] text-center max-w-sm w-full backdrop-blur-xl"
          >
            <div className="mx-auto w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6">
              <Heart className="text-pink-500 animate-pulse" size={40} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Yay! Thank you! 🥰</h2>
            <p className="text-slate-400 mb-6">You just made me the happiest! Let's plan our date so it's perfect. ✨</p>
            <button 
              onClick={() => setShowKilig(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-110 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-pink-500/20"
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
            className="bg-slate-900/80 p-8 rounded-3xl w-full max-w-sm border border-white/10 shadow-[0_24px_90px_rgba(15,23,42,0.45)] backdrop-blur-xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Date Details 💌</h2>
            
            <div className="space-y-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                  type="date" 
                  min={todayValue}
                  className="w-full bg-slate-950 p-3 pl-10 rounded-xl [color-scheme:dark] text-white border border-white/10 focus:border-pink-500 outline-none transition-colors text-sm" 
                  onChange={(e) => setData({ ...data, date: e.target.value })} 
                  disabled={submitting}
                />
              </div>
              
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                  type="time" 
                  className="w-full bg-slate-950 p-3 pl-10 rounded-xl [color-scheme:dark] text-white border border-white/10 focus:border-pink-500 outline-none transition-colors text-sm" 
                  onChange={(e) => setData({ ...data, time: e.target.value })} 
                  disabled={submitting}
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Where? 📍" 
                  className="w-full bg-slate-950 p-3 pl-10 rounded-xl text-white border border-white/10 focus:border-pink-500 outline-none transition-colors text-sm placeholder:text-slate-500" 
                  onChange={(e) => setData({ ...data, place: e.target.value })} 
                  disabled={submitting}
                />
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Locking in draft...
                </>
              ) : (
                "Confirm! 🥂"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}