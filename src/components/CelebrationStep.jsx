import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Copy, RefreshCcw, Check, Sparkles, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

export default function CelebrationStep({ dateInfo, onReset }) {
  const [copied, setCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState("sending"); // "sending", "sent", "error"
  const hasSent = useRef(false);

  const myEmail = "aldrichhcirdla27@gmail.com"; 

  // 1. AUTOMATIC BACKGROUND EMAIL (EmailJS) - Pagkabukas pa lang ng screen, send agad sa'yo!
  useEffect(() => {
    if (hasSent.current) return;
    hasSent.current = true;

    // TODO: Siguraduhing tama ang IDs mo rito mula sa EmailJS dashboard
   const SERVICE_ID = "service_pkg397f";
    const TEMPLATE_ID = "template_idjc3wh";
     const PUBLIC_KEY = "qOeLZ1xczgS3nqbBw";

    const templateParams = {
      my_email: myEmail,
      date: dateInfo.date,
      time: dateInfo.time,
      place: dateInfo.place,
      message: "Yown! Confirmed na 'yung date nating dalawa! See you! 🥰"
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => {
        setEmailStatus("sent");
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        setEmailStatus("error");
      });
  }, [dateInfo]);

  // 2. GOOGLE CALENDAR LINK LINK GENERATOR (Para pumasok sa Phone Widget niya)
  const generateGoogleCalendarLink = () => {
    const formattedDate = dateInfo.date.replace(/-/g, '');
    const formattedTime = dateInfo.time.replace(/:/g, '');
    const start = `${formattedDate}T${formattedTime}00`;
    
    // Default duration: 2 hours
    const endHour = parseInt(dateInfo.time.split(':')[0]) + 2;
    const end = `${formattedDate}T${endHour.toString().padStart(2, '0')}${dateInfo.time.split(':')[1]}00`;
    
    const title = "Our Special Date! ❤️";
    const details = `📅 Date: ${dateInfo.date}\n⏰ Time: ${dateInfo.time}\n📍 Place: ${dateInfo.place}\n\nSee you, baby! 🥰`;
    
    // Ininject na natin ang reminders para mag-alarm sa phone widget niya, at tinanggal ang auto-GMeet
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(dateInfo.place)}&dates=${start}/${end}&add=${encodeURIComponent(myEmail)}&sf=true&opp=false&reminders=1m-email,1m-popup&no_gmeet=true`;
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
      
      <motion.div 
        initial={{ y: 20 }} 
        animate={{ y: 0 }} 
        className="bg-slate-900/80 p-8 rounded-3xl border border-pink-500/30 w-full max-w-sm shadow-2xl backdrop-blur-sm"
      >
        {/* Silent Status Toast Indicator */}
        <div className="mb-4 text-xs font-semibold w-full flex justify-center">
          {emailStatus === "sending" && (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
              <Send size={12} className="animate-spin" /> Logged details locally...
            </span>
          )}
          {emailStatus === "sent" && (
            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={12} /> Date details sent to Aldrich! 🚀
            </span>
          )}
          {emailStatus === "error" && (
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertCircle size={12} /> Status saved. Use button below.
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Yay! See you! ❤️</h1>
        
        <div className="space-y-3 text-left mb-6">
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
            <Calendar size={18} className="text-pink-500 shrink-0" /> 
            <span className="text-sm text-white">{dateInfo.date}</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
            <Clock size={18} className="text-blue-500 shrink-0" /> 
            <span className="text-sm text-white">{dateInfo.time}</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700 max-w-full overflow-hidden">
            <MapPin size={18} className="text-purple-500 shrink-0" /> 
            <span className="text-sm text-white truncate">{dateInfo.place}</span>
          </div>
        </div>

        {/* ETO ANG PINAKAMAHALAGANG BUTTON PARA SA PHONE WIDGET NIYA */}
        <div className="space-y-3 mb-4">
          <a 
            href={generateGoogleCalendarLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-95 transition-all text-sm shadow-lg shadow-pink-500/20"
          >
            <Sparkles size={18} className="animate-bounce" /> Sync to Phone Widget & Calendar
          </a>
        </div>

        {/* Utility Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm ${copied ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy Details"}
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