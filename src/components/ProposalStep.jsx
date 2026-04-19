import { useState } from "react";
import { motion } from "framer-motion";
import { Frown, Heart } from "lucide-react";

const messages = [
  "Can we go on a date? 🥺",
  "Are you sure?",
  "Really sure?",
  "Think again!",
  "My heart is breaking! 💔",
  "You're breaking my heart!",
  "Please...?",
  "Hala?",
  "Final decision?"
];

export default function ProposalStep({ onNext }) {
  const [noCount, setNoCount] = useState(0);
  // NEW: Initial position x: 100 makes it start on the right side of Yes
  const [noPos, setNoPos] = useState({ x: 100, y: 0 });

  const handleNoInteraction = () => {
    setNoCount((prev) => prev + 1);
    
    // Contrain random movement within +/- 150px around the starting point
    // This keeps it moving mischievousely but stays relatively close to Yes
    setNoPos({ 
      x: (Math.random() - 0.5) * 300, 
      y: (Math.random() - 0.5) * 300 
    });
  };

  const yesButtonScale = 1 + noCount * 0.2;
  const noButtonScale = Math.max(0.3, 1 - noCount * 0.1); // Min size 0.3 ensures it's always tappable/visible

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-6 text-center">
      <Heart className="text-pink-500 mb-6" size={64} fill="currentColor" />
      
      <h1 className="text-3xl font-bold mb-12 text-white min-h-[4rem]">
        {messages[Math.min(noCount, messages.length - 1)]}
      </h1>

      {/* FIXED CONTAINER:
          By centering this container with w-0 h-0 and absolute positioning, 
          0,0 becomes the exact center of the screen, which makes the 
          positioning logic much cleaner. */}
      <div className="relative w-0 h-0 flex items-center justify-center mt-32">
        
        {/* THE YES BUTTON */}
        <motion.button
          onClick={onNext}
          animate={{ scale: yesButtonScale }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          // absolute and centered in the 0x0 container
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-green-500/20 absolute left-[-50px] top-[-25px] w-[100px] h-[50px] z-20"
        >
          Yes!
        </motion.button>

        {/* THE RUNAWAY NO BUTTON */}
        <motion.button
          onMouseEnter={handleNoInteraction}
          onTouchStart={handleNoInteraction} 
          onClick={handleNoInteraction} // Fallback
          animate={{ 
            x: noPos.x, 
            y: noPos.y, 
            scale: noButtonScale 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          // Starts next to Yes because of noPos: {x: 100, y: 0}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold absolute z-10 flex items-center gap-2 border border-red-700"
        >
          <Frown size={20} />
          No
        </motion.button>
      </div>
    </div>
  );
}