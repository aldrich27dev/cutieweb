import { useState, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MusicPlayer({ url }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio(url));

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error("Playback error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={togglePlay}
      className={`fixed bottom-6 right-6 z-[100] p-4 rounded-full border shadow-2xl backdrop-blur-xl transition-all ${
        isPlaying 
          ? "bg-pink-500/20 border-pink-500/50 text-pink-400" 
          : "bg-slate-900/80 border-white/10 text-slate-400 hover:text-white"
      }`}
    >
      {isPlaying ? <Pause size={20} /> : <Volume2 size={20} />}
    </motion.button>
  );
}