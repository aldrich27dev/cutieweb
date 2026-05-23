import { useEffect, useState, useRef } from "react";
import { CheckCircle2, RefreshCcw, XCircle, CalendarX, X, Trash2 } from "lucide-react";
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeCancelItem, setActiveCancelItem] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeDeleteItem, setActiveDeleteItem] = useState(null);
  const isFetching = useRef(false);

  const loadPendingDates = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const rows = await supabaseClient.listDates({
        status: "pending",
        order: "date.asc,time.asc",
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
    const previousDates = [...dates];

    setDates((prev) => prev.filter((item) => item.id !== id));

    try {
      await supabaseClient.updateStatus(id, status);
      if (onStatusChange) onStatusChange();
      await loadPendingDates();
    } catch (err) {
      console.error(`Error updating status to ${status}:`, err);
      setDates(previousDates);
    }
  };

  const handleDelete = (id) => {
    const target = dates.find((item) => item.id === id);
    if (!target) return;

    setActiveDeleteItem(target);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeDeleteItem) return;

    const previousDates = [...dates];
    setDates((prev) => prev.filter((item) => item.id !== activeDeleteItem.id));

    try {
      await supabaseClient.deleteDate(activeDeleteItem.id);
      if (onStatusChange) onStatusChange();
      await loadPendingDates();
      setShowDeleteModal(false);
      setActiveDeleteItem(null);
    } catch (err) {
      console.error("Delete operation failed:", err);
      alert("Failed to delete. Please try again.");
      setDates(previousDates);
    }
  };

  const handleCancelClick = (item) => {
    setActiveCancelItem(item);
    setCancellationReason(item.cancellation_reason || "");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();

    if (!activeCancelItem) return;

    const reason = cancellationReason.trim();
    if (!reason) return;

    const previousDates = [...dates];
    setDates((prev) => prev.filter((item) => item.id !== activeCancelItem.id));

    try {
      await supabaseClient.cancelDate(activeCancelItem.id, reason);
      if (onStatusChange) onStatusChange();
      await loadPendingDates();
      setShowCancelModal(false);
      setActiveCancelItem(null);
      setCancellationReason("");
    } catch (err) {
      console.error("Error cancelling date:", err);
      setDates(previousDates);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPendingDates();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Pending Dates</h2>
        <button onClick={loadPendingDates} className="p-2 text-white/50 transition-colors hover:text-white">
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {dates.length > 0 ? (
        <div className="space-y-4">
          {dates.map((item) => (
            <article key={item.id} className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 text-rose-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                aria-label="Delete date"
              >
                <Trash2 size={14} />
              </button>

              <div className="mb-4 grid gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-16 font-bold text-pink-300">Date:</span>
                  <span className="text-white">{formatColoredDate(item.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 font-bold text-pink-300">Time:</span>
                  <span className="text-white">{format12HourTime(item.time)}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-16 font-bold text-pink-300">Place:</span>
                  <span className="leading-tight text-white">{item.place}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(item.id, "completed")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-500/10 py-2 text-xs font-bold text-green-400 transition-colors hover:bg-green-500/20"
                >
                  <CheckCircle2 size={14} /> Done
                </button>
                <button
                  onClick={() => handleCancelClick(item)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <XCircle size={14} /> Cancel
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-10 text-center">
          <CalendarX size={40} className="mx-auto mb-3 text-white/20" />
          <p className="text-sm font-medium text-white/50">No pending dates</p>
          <p className="mt-1 text-xs text-white/30">Check back later or plan a new one!</p>
        </div>
      )}

      {showCancelModal && activeCancelItem && (
        <div className="fixed inset-0 z-[205] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-pink-300/70">Cancel Date</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Cancellation Reason</h3>
              </div>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setActiveCancelItem(null);
                  setCancellationReason("");
                }}
                className="rounded-full bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close cancel modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">{activeCancelItem.date}</p>
              <p className="mt-1">{activeCancelItem.place || "No place added"}</p>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Cancellation Reason
                </label>
                <input
                  type="text"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Why was this date cancelled?"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none transition focus:border-pink-500"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setActiveCancelItem(null);
                    setCancellationReason("");
                  }}
                  className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                >
                  Keep it pending
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-500/90 py-3 text-sm font-bold text-white transition hover:bg-red-500"
                >
                  Save Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && activeDeleteItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-rose-300/70">Delete Date</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Permanently remove this entry?</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setActiveDeleteItem(null);
                }}
                className="rounded-full bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close delete modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">{activeDeleteItem.date}</p>
              <p className="mt-1">{activeDeleteItem.place || "No place added"}</p>
            </div>

            <p className="text-sm leading-6 text-slate-300">
              This will permanently delete the entry from Supabase. This cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setActiveDeleteItem(null);
                }}
                className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-xl bg-rose-500/90 py-3 text-sm font-bold text-white transition hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
