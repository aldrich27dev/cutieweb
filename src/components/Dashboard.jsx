// TYPE: Main User Space Dashboard with Celebration Gatekeeper
// FILE PATH: src/components/Dashboard.jsx

import { useState } from "react";
import { Heart, Info, X, CalendarDays, PartyPopper, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PendingDates from "./PendingDates";
import MemoryGallery from "./MemoryGallery";

export default function Dashboard({ onPlanDate, onCelebrate }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [celebrationType, setCelebrationType] = useState("Date Night Success");

  const triggerDataSync = () => setRefreshKey((prev) => prev + 1);

  const handleCelebrateSubmit = () => {
    onCelebrate(celebrationType); // Ipapasa natin ang napiling type
    setShowConfirm(false);
  };

  return (
    <div className="min-h-dvh px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Control Room</h1>
          <p className="text-slate-400 text-sm mt-1">Our shared space for memories and plans.</p>
        </div>
        <button 
          onClick={() => setShowAbout(true)}
          className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition"
        >
          <Info size={20} />
        </button>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button onClick={onPlanDate} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/40 transition">
          <CalendarDays className="text-pink-400 mb-2" size={24} />
          <span className="text-xs font-semibold text-white">Plan Date</span>
        </button>
        <button 
          onClick={() => setShowConfirm(true)} 
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/20 hover:border-purple-500/40 transition"
        >
          <PartyPopper className="text-purple-400 mb-2" size={24} />
          <span className="text-xs font-semibold text-white">Celebrate</span>
        </button>
      </div>

      {/* MAIN DATA MODULES */}
      <div className="space-y-6">
        <PendingDates onStatusChange={triggerDataSync} key={`pending-${refreshKey}`} />
        <MemoryGallery key={`gallery-${refreshKey}`} onUploadSuccess={triggerDataSync} />
      </div>

      {/* ABOUT MODAL */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full relative shadow-2xl"
            >
              <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X size={20} />
              </button>
              <Heart className="text-pink-500 mb-4" size={32} fill="currentColor" />
              <h2 className="text-2xl font-bold text-white mb-3">Our Little Safe Space</h2>
              <p className="text-slate-400 text-sm leading-6">
                Ginawa ko ang app na 'to para sa ating dalawa. Dito nakatago lahat ng mga natapos nating dates, 
                mga paboritong litrato, at mga susunod nating adventures na magkasama gamit ang real-time data sync.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CELEBRATION CONFIRMATION MODAL */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Anong ise-celebrate natin?</h3>
              
              <select 
                className="w-full bg-slate-950 text-white p-3 rounded-xl border border-white/10 mb-6 focus:border-purple-500 outline-none"
                value={celebrationType}
                onChange={(e) => setCelebrationType(e.target.value)}
              >
                <option>Date Night Success</option>
                <option>Monthsary Celebration</option>
                <option>Special Achievement</option>
                <option>Just Because! 💖</option>
              </select>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCelebrateSubmit}
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-500 transition"
                >
                  <CheckCircle2 size={16} />
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}