import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Copy, RefreshCcw, Check, Plus } from "lucide-react";
import { useState } from "react";

export default function CelebrationStep({ dateInfo, onReset }) {
  const [copied, setCopied] = useState(false);

  // Helper para sa Google Calendar Link
  const generateCalendarLink = () => {
    const start = `${dateInfo.date.replace(/-/g, '')}T${dateInfo.time.replace(/:/g, '')}00`;
    // Set default end time to 1 hour after start
    const endHour = parseInt(dateInfo.time.split(':')[0]) + 1;
    const end = `${dateInfo.date.replace(/-/g, '')}T${endHour.toString().padStart(2, '0')}${dateInfo.time.split(':')[1]}00`;
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=Our+Date!+❤️&details=Can't+wait+to+see+you!&location=${encodeURIComponent(dateInfo.place)}&dates=${start}/${end}`;
  };

  const handleCopy = () => {
    const text = `Date: ${dateInfo.date}\nTime: ${dateInfo.time}\nPlace: ${dateInfo.place}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-dvh items-center justify-center p-6 text-center">
      <Confetti recycle={false} numberOfPieces={500} />
      
      <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-slate-900/80 p-8 rounded-3xl border border-pink-500/30 w-full max-w-sm shadow-2xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Yay! See you! ❤️</h1>
        
        <div className="space-y-3 text-left mb-8">
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700"><Calendar size={18} className="text-pink-500" /> {dateInfo.date}</div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700"><Clock size={18} className="text-blue-500" /> {dateInfo.time}</div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700"><MapPin size={18} className="text-purple-500" /> {dateInfo.place}</div>
        </div>

        {/* Calendar Link Button */}
        <a 
          href={generateCalendarLink()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-xl font-bold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
        >
          <Plus size={18} /> Add to Calendar
        </a>

        {/* Copy and Restart Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${copied ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          
          <button 
            onClick={onReset}
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
          >
            <RefreshCcw size={18} /> Restart
          </button>
        </div>
      </motion.div>
    </div>
  );
}