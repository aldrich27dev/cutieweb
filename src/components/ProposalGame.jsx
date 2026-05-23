// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Heart, Sparkles, Frown, ThumbsUp } from "lucide-react";
// import Confetti from "react-confetti";

// // Lightweight helper hook to handle window sizing
// function useWindowSize() {
//   const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
//   useEffect(() => {
//     const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);
//   return size;
// }

// const messages = [
//   "Will you be my Valentine?",
//   "Are you sure?",
//   "Really sure?",
//   "Don't do this to me!",
//   "I'll be very sad...",
//   "Think again!",
//   "Please...?",
//   "My heart is breaking!",
//   "Are you kidding me?",
//   "Final decision?"
// ];

// export default function ProposalGame() {
//   const { width, height } = useWindowSize();
//   const [noCount, setNoCount] = useState(0);
//   const [yesPressed, setYesPressed] = useState(false);
//   const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

//   const handleNoInteraction = () => {
//     setNoCount(noCount + 1);
    
//     // Constrain random position to stay within a 300x300px area around center
//     const randomX = (Math.random() - 0.5) * 300;
//     const randomY = (Math.random() - 0.5) * 300;

//     setNoPosition({ x: randomX, y: randomY });
//   };

//   const yesButtonScale = 1 + noCount * 0.2;
//   const noButtonScale = Math.max(0.3, 1 - noCount * 0.15); // Minimum size 0.3 so it's always visible

//   return (
//     <div className="flex h-dvh items-center justify-center p-4">
//       {yesPressed && (
//         <Confetti 
//           width={width} 
//           height={height} 
//           recycle={false} 
//           numberOfPieces={500}
//           colors={['#ec4899', '#d946ef', '#f472b6']} 
//         />
//       )}

//       <div className="text-center w-full max-w-md">
//         {yesPressed ? (
//           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl md:text-6xl font-bold text-pink-500">
//             🎉 Yay! See you then! ❤️
//           </motion.div>
//         ) : (
//           <div className="flex flex-col items-center">
//             <Heart size={64} className="text-pink-500 mb-8 animate-bounce" fill="currentColor" />
            
//             <h1 className="text-3xl font-bold mb-8 text-white min-h-[4rem]">
//               {messages[Math.min(noCount, messages.length - 1)]}
//             </h1>

//             {/* Added h-80 to ensure the absolute positioned buttons have a safe playground */}
//             <div className="relative flex flex-col items-center justify-center w-full h-80">
              
//               <motion.button
//                 onClick={() => setYesPressed(true)}
//                 animate={{ scale: yesButtonScale }}
//                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg z-20"
//               >
//                 Yes
//               </motion.button>

//               <motion.button
//                 onMouseEnter={handleNoInteraction}
//                 onTouchStart={handleNoInteraction}
//                 onClick={handleNoInteraction}
//                 animate={{ 
//                   x: noPosition.x, 
//                   y: noPosition.y, 
//                   scale: noButtonScale 
//                 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 className="bg-red-500 text-white font-bold py-3 px-8 rounded-full absolute z-10"
//               >
//                 No
//               </motion.button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }