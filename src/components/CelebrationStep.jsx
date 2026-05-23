import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Copy, RefreshCcw, Check, Plus } from "lucide-react";
import { useState } from "react";

export default function CelebrationStep({ dateInfo, onReset }) {
  const [copied, setCopied] = useState(false);
  
  const myEmail = "aldrichhcirdla27@gmail.com"; 

  // PINAG-ISANG LINK: Google Calendar Invite na magse-send din ng Email Notification
  const generateUnifiedLink = () => {
    const start = `${dateInfo.date.replace(/-/g, '')}T${dateInfo.time.replace(/:/g, '')}00`;
    const endHour = parseInt(dateInfo.time.split(':')[0]) + 1;
    const end = `${dateInfo.date.replace(/-/g, '')}T${endHour.toString().padStart(2, '0')}${dateInfo.time.split(':')[1]}00`;
    
    const title = "Our Special Date! ❤️";
    const details = `Can't wait for our date, hehez!\n\n📅 Date: ${dateInfo.date}\n⏰ Time: ${dateInfo.time}\n📍 Place: ${dateInfo.place}\n\nThis invitation was automatically sent to your email. See you! 🥰`;
    
    // Gagamitin natin ang 'add' parameter para i-force si Google na magpadala ng email invite sa inyong dalawa
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(dateInfo.place)}&dates=${start}/${end}&add=${encodeURIComponent(myEmail)}`;
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
        
        <div className="space-y-3 text-left mb-6">
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700"><Calendar size={18} className="text-pink-500" /> {dateInfo.date}</div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700"><Clock size={18} className="text-blue-500" /> {dateInfo.time}</div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700"><MapPin size={18} className="text-purple-500" /> {dateInfo.place}</div>
        </div>

        {/* Isang solid at pinag-isang Action Button */}
        <div className="space-y-3 mb-4">
          <a 
            href={generateUnifiedLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-all text-sm shadow-lg shadow-pink-500/20"
          >
            <Plus size={18} /> Accept & Save Date via Google
          </a>
        </div>

        {/* Utility Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm ${copied ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied Details" : "Copy Details"}
          </button>
          
          <button 
            onClick={onReset}
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all text-sm"
          >
            <RefreshCcw size={16} /> Restart
          </button>
        </div>
      </motion.div>
    </div>
  );
}