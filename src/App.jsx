// App.jsx
import { useState } from "react";
import QuizStep from "./components/QuizStep"; // Siguraduhin ang tamang path
import Dashboard from "./components/Dashboard";
import DateStep from "./components/DateStep";
import CelebrationStep from "./components/CelebrationStep";
import FloatingHearts from "./components/FloatingHearts";
import { supabaseClient } from "./supabaseClient";

const initialDateInfo = { date: "", time: "", place: "" };

export default function App() {
  // Magsisimula tayo sa 'quiz' screen
  const [screen, setScreen] = useState("quiz");
  const [dateInfo, setDateInfo] = useState(initialDateInfo);
  const [dateRecordId, setDateRecordId] = useState(null);

  const goDashboard = () => {
    setScreen("dashboard");
    setDateInfo(initialDateInfo);
    setDateRecordId(null);
  };

  const handleConfirmDate = async (info) => {
    setDateInfo(info);
    setScreen("celebrate");

    if (!supabaseClient.isConfigured) {
      setDateRecordId(null);
      return;
    }

    try {
      const rows = await supabaseClient.insertDate({
        ...info,
        status: "pending",
      });

      const createdRow = Array.isArray(rows) ? rows[0] : rows;
      setDateRecordId(createdRow?.id ?? null);
    } catch (error) {
      console.error("Failed to save date draft:", error);
      setDateRecordId(null);
    }
  };

  const handleCelebrateComplete = async () => {
    if (!dateRecordId || !supabaseClient.isConfigured) return;

    try {
      await supabaseClient.updateDate(dateRecordId, {
        ...dateInfo,
        status: "completed",
        caption: dateInfo.place || "Confirmed date",
      });
    } catch (error) {
      console.error("Failed to finalize date:", error);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.16),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-100">
      <FloatingHearts />

      <div className="relative z-10">
        {/* Dito papasok ang Quiz Step */}
        {screen === "quiz" && (
          <QuizStep onNext={() => setScreen("dashboard")} />
        )}

        {screen === "dashboard" && (
          <Dashboard 
            onPlanDate={() => setScreen("plan-date")} 
            onCelebrate={() => setScreen("celebrate")} 
          />
        )}

        {screen === "plan-date" && <DateStep onConfirm={handleConfirmDate} />}

        {screen === "celebrate" && (
          <CelebrationStep
            dateInfo={dateInfo}
            onReset={goDashboard}
            onFinalize={handleCelebrateComplete}
          />
        )}
      </div>
    </main>
  );
}