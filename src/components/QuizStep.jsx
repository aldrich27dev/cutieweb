import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, AlertCircle, CheckCircle2, ShieldAlert, Info } from "lucide-react";

export default function QuizStep({ onNext }) {
  const CORRECT_PIN = "111826"; 
  const MAX_ATTEMPTS = 6;
  const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showWarning, setShowWarning] = useState(false); // Default to false
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Check if user already saw the warning
    const hasSeenWarning = localStorage.getItem("pin_warning_seen");
    if (!hasSeenWarning) {
      setShowWarning(true);
    }

    const savedAttempts = parseInt(localStorage.getItem("pin_attempts") || "0");
    const lockTime = localStorage.getItem("lock_time");

    if (lockTime) {
      const timeElapsed = Date.now() - parseInt(lockTime);
      if (timeElapsed < LOCKOUT_TIME) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          localStorage.removeItem("lock_time");
          localStorage.removeItem("pin_attempts");
          setAttempts(0);
        }, LOCKOUT_TIME - timeElapsed);
      } else {
        localStorage.removeItem("lock_time");
        localStorage.removeItem("pin_attempts");
      }
    }
    setAttempts(savedAttempts);
  }, []);

  const handleUnderstood = () => {
    localStorage.setItem("pin_warning_seen", "true");
    setShowWarning(false);
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    if (isLocked) return;

    const fullPin = pin.join("");
    if (fullPin === CORRECT_PIN) {
      localStorage.removeItem("pin_attempts");
      localStorage.removeItem("lock_time");
      setShowCongrats(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("pin_attempts", newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        localStorage.setItem("lock_time", Date.now().toString());
        setTimeout(() => {
          setIsLocked(false);
          localStorage.removeItem("lock_time");
          localStorage.removeItem("pin_attempts");
          setAttempts(0);
        }, LOCKOUT_TIME);
      }
      
      setError(true);
      setPin(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="flex h-dvh items-center justify-center p-6 bg-slate-950">
      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="bg-slate-900/50 p-8 rounded-[32px] border border-white/10 w-full max-w-sm text-center backdrop-blur-xl shadow-2xl"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10 text-pink-400 mb-6">
          <Lock size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">
          {isLocked ? "Access Denied" : "Enter Access PIN"}
        </h2>

        {isLocked ? (
          <div className="text-red-400 p-4 border border-red-900/50 rounded-2xl bg-red-950/20 flex flex-col items-center">
            <ShieldAlert size={40} className="mb-2" />
            <p className="text-sm font-medium">Too many attempts. Wait 30 minutes.</p>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-8">Attempt {attempts}/{MAX_ATTEMPTS}</p>
            <div className="flex justify-center gap-2 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric" 
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-14 bg-slate-950 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:border-pink-500 outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-400 text-xs flex items-center justify-center gap-2 mb-4">
                <AlertCircle size={14}/> Invalid Code!
              </p>
            )}

            <button 
              onClick={handleSubmit} 
              className="w-full bg-white text-slate-950 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Unlock Space
            </button>
          </>
        )}
      </motion.div>

      {/* WARNING MODAL */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-slate-900 p-8 rounded-3xl text-center border border-white/10 w-full max-w-xs"
            >
              <Info className="text-amber-400 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-bold text-white mb-2">Important Notice</h2>
              <p className="text-slate-400 text-sm mb-6">
                Please enter the correct PIN. If you exceed the maximum attempts, you will be locked out for <span className="text-white font-bold">30 minutes</span>.
              </p>
              <button onClick={handleUnderstood} className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold">Understood</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCongrats && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-slate-900 p-8 rounded-3xl text-center border border-white/10 w-full max-w-xs"
            >
              <CheckCircle2 className="text-green-400 mx-auto mb-4" size={48} />
              <h2 className="text-2xl font-bold text-white mb-2">Access Granted</h2>
              <button onClick={onNext} className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold">Continue</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}