import { useState } from "react";
import FlowerBouquet from "./components/FlowerBouquet";
import LandingStep from "./components/LandingStep";
import QuizStep from "./components/QuizStep";
import ProposalStep from "./components/ProposalStep";
import DateStep from "./components/DateStep";
import LoveLetterStep from "./components/LoveLetterStep";
import CelebrationStep from "./components/CelebrationStep";
import FloatingHearts from "./components/FloatingHearts";

export default function App() {
  const [step, setStep] = useState(0); 
  const [dateInfo, setDateInfo] = useState({ date: "", time: "", place: "" });

  return (
    <main className="relative min-h-dvh w-full bg-slate-950 text-slate-100 overflow-hidden">
      <FloatingHearts />
      
      <div className="relative z-10">
        {step === 0 && <FlowerBouquet onComplete={() => setStep(1)} />}
        {step === 1 && <LandingStep onNext={() => setStep(2)} />}
        {step === 2 && <QuizStep onNext={() => setStep(3)} />}
        {step === 3 && <ProposalStep onNext={() => setStep(4)} />}
        
        {step === 4 && (
          <DateStep 
            onConfirm={(info) => { 
              setDateInfo(info); 
              setStep(5); // Punta sa Love Letter
            }} 
          />
        )}

        {step === 5 && (
          <LoveLetterStep onNext={() => setStep(6)} /> // Punta sa Celebration
        )}

        {step === 6 && (
          <CelebrationStep 
            dateInfo={dateInfo} 
            onReset={() => {
              setStep(0); 
              setDateInfo({ date: "", time: "", place: "" }); 
            }} 
          />
        )}
      </div>
    </main>
  );
}