import { useEffect, useRef, useState } from "react";
import { AlertCircle, CalendarX2, RefreshCcw } from "lucide-react";
import { supabaseClient } from "../supabaseClient";

export default function CancelledDates() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [selectedCancelledDate, setSelectedCancelledDate] = useState(null);
  const isFetching = useRef(false);

  const loadCancelledDates = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError("");

    try {
      const rows = await supabaseClient.listDates({
        status: "cancelled",
        order: "date.desc,time.desc",
      });
      setDates(rows ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load cancelled dates.");
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCancelledDates();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-rose-200/70">Cancelled Dates</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Cancelled plans and reasons</h2>
        </div>
        <button
          onClick={loadCancelledDates}
          className="text-white/50 hover:text-white transition-colors p-2"
          disabled={loading}
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {!supabaseClient.isConfigured && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>
            Supabase env vars are missing. Add <code>VITE_SUPABASE_PROJECT_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> to load cancelled entries.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {dates.length > 0 ? (
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {dates.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <div className="flex items-start gap-3">
                <CalendarX2 size={18} className="mt-0.5 shrink-0 text-rose-300" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{item.date || "No date"}</p>
                  <p className="mt-1 text-sm text-slate-300">{item.place || "No place provided"}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-rose-300/70">Cancellation Reason</p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">
                    {item.cancellation_reason || "No reason provided"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCancelledDate(item);
                    setIsReasonModalOpen(true);
                  }}
                  className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200"
                >
                  View Reason
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <CalendarX2 size={40} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/50 text-sm font-medium">No cancelled dates</p>
          <p className="text-white/30 text-xs mt-1">Cancelled entries will appear here.</p>
        </div>
      )}

      {isReasonModalOpen && selectedCancelledDate && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => {
            setIsReasonModalOpen(false);
            setSelectedCancelledDate(null);
          }}
        >
          <div
            className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-rose-200/70">View Reason</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Cancelled Appointment</h3>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Date / Time</p>
                <p className="mt-1 text-sm text-white">
                  {selectedCancelledDate.date || "No date"} {selectedCancelledDate.time ? `· ${selectedCancelledDate.time}` : ""}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cancellation Reason</p>
                <p className="mt-1 text-sm leading-6 text-slate-200">
                  {selectedCancelledDate.cancellation_reason || "No reason provided"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsReasonModalOpen(false);
                setSelectedCancelledDate(null);
              }}
              className="mt-6 w-full rounded-xl bg-white/5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
