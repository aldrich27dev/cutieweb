import { useEffect, useState, useRef } from "react";
import { CheckCircle2, RefreshCcw, XCircle, CalendarX } from "lucide-react";
import { supabaseClient } from "../supabaseClient";

function format12HourTime(timeString) {
  if (!timeString || timeString === "--:--") return "--:--";
  const [hours, minutes] = timeString.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${minutes} ${ampm}`;
}

function formatColoredDate(dateString) {
  if (!dateString) return "MM/DD/YYYY";
  const [yyyy, mm, dd] = dateString.split("-");
  return (
    <>
      <span className="text-pink-400">{mm}</span>/<span className="text-pink-400">{dd}</span>/
      <span className="text-slate-500">{yyyy}</span>
    </>
  );
}

export default function PendingDates({ onStatusChange }) {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFetching = useRef(false);

  const loadPendingDates = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const rows = await supabaseClient.listDates({ 
        status: "pending",
        order: "date.asc,time.asc" 
      });
      setDates(rows ?? []);
    } catch (err) {
      console.error("Error loading dates:", err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const updateStatus = async (id, status) => {
    // Optimistic Update: I-save ang current state kung sakaling mag-error
    const previousDates = [...dates];
    
    // Alisin agad sa UI
    setDates(prev => prev.filter(item => item.id !== id));

    try {
      await supabaseClient.updateStatus(id, status);
      if (onStatusChange) onStatusChange();
      // Re-fetch para siguradong sync ang database state
      await loadPendingDates();
    } catch (err) {
      console.error(`Error updating status to ${status}:`, err);
      // Ibalik ang listahan kung nag-fail ang request
      setDates(previousDates);
    }
  };

  useEffect(() => { 
    let isMounted = true;
    if (isMounted) {
      loadPendingDates();
    }
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Pending Dates</h2>
        <button onClick={loadPendingDates} className="text-white/50 hover:text-white transition-colors p-2">
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      
      {dates.length > 0 ? (
        <div className="space-y-4">
          {dates.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <div className="grid gap-1 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-pink-300 w-16">Date:</span>
                  <span className="text-white">{formatColoredDate(item.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-pink-300 w-16">Time:</span>
                  <span className="text-white">{format12HourTime(item.time)}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-pink-300 w-16">Place:</span>
                  <span className="text-white leading-tight">{item.place}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => updateStatus(item.id, "completed")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-500/10 py-2 text-xs font-bold text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <CheckCircle2 size={14} /> Done
                </button>
                <button 
                  onClick={() => updateStatus(item.id, "cancelled")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <XCircle size={14} /> Cancel
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <CalendarX size={40} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/50 text-sm font-medium">No pending dates</p>
          <p className="text-white/30 text-xs mt-1">Check back later or plan a new one!</p>
        </div>
      )}
    </section>
  );
}