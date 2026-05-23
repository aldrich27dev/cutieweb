import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function MusicPlayer({ url }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const audioRef = useRef(null);
  const promptTimerRef = useRef(null);
  const nowPlayingTimerRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(url);

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    promptTimerRef.current = setTimeout(() => {
      setShowPrompt(false);
    }, 5000);

    return () => {
      clearTimeout(promptTimerRef.current);
      clearTimeout(nowPlayingTimerRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      clearTimeout(nowPlayingTimerRef.current);
    } else {
      audioRef.current.play().catch((e) => console.error("Playback error:", e));
      setShowPrompt(false);
      clearTimeout(nowPlayingTimerRef.current);
      nowPlayingTimerRef.current = setTimeout(() => {
        setShowNowPlaying(true);
        clearTimeout(nowPlayingTimerRef.current);
        nowPlayingTimerRef.current = setTimeout(() => {
          setShowNowPlaying(false);
        }, 5000);
      }, 350);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="max-w-[240px] rounded-2xl border border-sky-300/20 bg-slate-950/95 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.55)] backdrop-blur-xl"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_0_6px_rgba(56,189,248,0.12)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Music</p>
            </div>
            <p className="text-sm leading-5 text-slate-200">
              Press the button to play music.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNowPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="max-w-[240px] rounded-2xl border border-fuchsia-300/20 bg-slate-950/95 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.55)] backdrop-blur-xl"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_0_6px_rgba(232,121,249,0.12)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
                Now Playing
              </p>
            </div>
            <p className="text-sm leading-5 text-slate-200">NP: Araw-araw - Ben&Ben</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-full flex-col items-end gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className={`p-4 rounded-full border shadow-2xl backdrop-blur-xl transition-all ${
            isPlaying
              ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
              : "bg-slate-900/80 border-white/10 text-slate-400 hover:text-white"
          }`}
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? <Pause size={20} /> : <Volume2 size={20} />}
        </motion.button>
      </div>
    </div>
  );
}
