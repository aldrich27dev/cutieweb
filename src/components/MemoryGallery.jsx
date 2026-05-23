// TYPE: Media Asset Cloud Inventory Viewer with Target Date Selection
// FILE PATH: src/components/MemoryGallery.jsx

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ImagePlus, RefreshCcw, Sparkles, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../supabaseClient";

function fallBackCaption(item) {
  return item.caption || item.place || "A saved memory";
}

function parseSafeDate(dateString) {
  if (!dateString) return null;
  const parsed = new Date(`${dateString}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMonthLabel(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getWeekStart(date) {
  const normalized = new Date(date);
  const day = normalized.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + diff);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function getWeekEnd(date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

function formatWeekLabel(date) {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  const monthName = start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const range = sameMonth
    ? `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`
    : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return `${monthName}, Week ${getWeekNumber(date)} (${range})`;
}

function getWeekNumber(date) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstMondayOffset = startOfMonth.getDay() === 0 ? 1 : (8 - startOfMonth.getDay()) % 7;
  const firstMonday = new Date(startOfMonth);
  firstMonday.setDate(startOfMonth.getDate() + firstMondayOffset);
  const targetWeekStart = getWeekStart(date);
  const diffMs = targetWeekStart - getWeekStart(firstMonday);
  const diffWeeks = Math.max(0, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)));
  return diffWeeks + 1;
}

function buildDateBuckets(dates) {
  const monthMap = new Map();
  const weekMap = new Map();

  dates.forEach((item) => {
    const parsed = parseSafeDate(item.date);
    if (!parsed) return;

    const monthKey = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        value: monthKey,
        label: formatMonthLabel(parsed),
      });
    }

    const weekStart = getWeekStart(parsed);
    const weekEnd = getWeekEnd(parsed);
    const weekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        value: weekKey,
        label: formatWeekLabel(parsed),
        monthKey,
        weekStart,
        weekEnd,
      });
    }
  });

  return {
    months: Array.from(monthMap.values()),
    weeks: Array.from(weekMap.values()),
  };
}

function filterDatesByBucket(dates, filterMode, filterValue) {
  if (!filterMode || !filterValue) return dates;

  return dates.filter((item) => {
    const parsed = parseSafeDate(item.date);
    if (!parsed) return false;

    if (filterMode === "month") {
      return `${parsed.getFullYear()}-${parsed.getMonth()}` === filterValue;
    }

    if (filterMode === "week") {
      const weekStart = getWeekStart(parsed);
      return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}` === filterValue;
    }

    return true;
  });
}

function countImagesForDateId(memories, dateId) {
  return memories.reduce((total, memory) => {
    const linkedDateId = memory.date_id ?? memory.id;
    if (String(linkedDateId) !== String(dateId)) return total;

    return total + parseImages(memory.image_url).length;
  }, 0);
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}`;
}

function getCurrentWeekKey() {
  const now = getWeekStart(new Date());
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

// Helper para ligtas na ma-parse ang single string o JSON string array ng images
function parseImages(imageUrlString) {
  if (!imageUrlString) return [];
  if (imageUrlString.startsWith("[") && imageUrlString.endsWith("]")) {
    try {
      return JSON.parse(imageUrlString);
    } catch (e) {
      return [imageUrlString];
    }
  }
  return [imageUrlString];
}

function compressImage(file, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Failed to load image for compression."));
      image.onload = () => {
        const maxWidth = 1200;
        const scale = Math.min(1, maxWidth / image.width);
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas context unavailable."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Unable to compress image."));
              return;
            }

            const safeName = file.name.replace(/\.[^.]+$/, "") || "image";
            const compressedFile = new File([blob], `${safeName}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          quality,
        );
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

export default function MemoryGallery() {
  const [memories, setMemories] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Upload configuration states
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [selectedDateId, setSelectedDateId] = useState("");
  const [customCaption, setCustomCaption] = useState("");
  const [isCustomRow, setIsCustomRow] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [manualPlace, setManualPlace] = useState("");
  const [dateFilterMode, setDateFilterMode] = useState("month");
  const [dateFilterValue, setDateFilterValue] = useState("");

  // Lightbox Modal para sa pagpapakita ng carousel ng larawan kapag klinik
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const { months, weeks } = useMemo(() => buildDateBuckets(availableDates), [availableDates]);

  const loadMemories = async () => {
    setLoading(true);
    setError("");
    try {
      if (!supabaseClient.isConfigured) {
        setMemories([]);
        return;
      }
      const rows = await supabaseClient.listDates({
        status: "completed",
        order: "date.desc,time.desc",
      });
      setMemories(rows ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load memories.");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDates = async () => {
    try {
      const allRows = await supabaseClient.listDates({ order: "date.desc" });
      setAvailableDates(allRows ?? []);
    } catch (e) {
      console.error("Failed to pre-fetch dates taxonomy configuration mapping", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMemories();
      void loadAvailableDates();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dateFilterMode === "month" && !dateFilterValue && months.length > 0) {
        const currentMonth = getCurrentMonthKey();
        const preferredMonth = months.find((item) => item.value === currentMonth)?.value || months[0].value;
        setDateFilterValue(preferredMonth);
      }

      if (dateFilterMode === "week" && !dateFilterValue && weeks.length > 0) {
        const currentWeek = getCurrentWeekKey();
        const preferredWeek = weeks.find((item) => item.value === currentWeek)?.value || weeks[0].value;
        setDateFilterValue(preferredWeek);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [dateFilterMode, dateFilterValue, months, weeks]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    
    setSelectedFiles(files.slice(0, 3));
    setShowModal(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setShowModal(false);
    setError("");
    
    try {
      const compressedFiles = [];

      for (const file of selectedFiles) {
        const compressedFile = await compressImage(file, 0.7);
        compressedFiles.push(compressedFile);
      }

      if (isCustomRow || selectedDateId === "new_standalone") {
        const uploadedUrls = [];

        for (const file of compressedFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          const uploadResult = await supabaseClient.uploadMemoryFile("memories", filePath, file);
          if (uploadResult?.publicUrl) {
            uploadedUrls.push(uploadResult.publicUrl);
          }
        }

        await supabaseClient.insertDate({
          date: manualDate || new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
          place: manualPlace || "Captured Moment 📍",
          status: "completed",
          image_url: JSON.stringify(uploadedUrls),
          caption: customCaption || "Isang masayang alaala! ❤️"
        });
      } else {
        const targetEvent = availableDates.find(d => String(d.id) === String(selectedDateId));
        if (!targetEvent) throw new Error("Selected target timeline point target missing allocation metadata.");

        const existingImages = parseImages(targetEvent.image_url);
        const totalAfterUpload = existingImages.length + compressedFiles.length;

        if (totalAfterUpload > 3) {
          alert("This date already has the maximum of 3 images.");
          return;
        }

        const uploadedUrls = [];

        for (const file of compressedFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          const uploadResult = await supabaseClient.uploadMemoryFile("memories", filePath, file);
          if (uploadResult?.publicUrl) {
            uploadedUrls.push(uploadResult.publicUrl);
          }
        }

        const mergedImages = [...existingImages, ...uploadedUrls].slice(0, 3);

        await supabaseClient.updateDate(selectedDateId, {
          status: "completed",
          image_url: JSON.stringify(mergedImages),
          caption: customCaption || targetEvent.place || "Date night successfully logged! 💕"
        });
      }

      setSelectedFiles([]);
      setSelectedDateId("");
      setCustomCaption("");
      setIsCustomRow(false);
      setManualDate("");
      setManualPlace("");

      await loadMemories();
      await loadAvailableDates();
    } catch (err) {
      console.error("Upload handler operation crash:", err);
      setError(err instanceof Error ? err.message : "Failed to record memory image transaction reference.");
    } finally {
      setUploading(false);
    }
  };

  const nextImage = (e, imgsCount) => {
    e.stopPropagation();
    setLightboxImageIndex((prev) => (prev + 1) % imgsCount);
  };

  const prevImage = (e, imgsCount) => {
    e.stopPropagation();
    setLightboxImageIndex((prev) => (prev - 1 + imgsCount) % imgsCount);
  };

  const filteredAvailableDates = filterDatesByBucket(availableDates, dateFilterMode, dateFilterValue);
  const todayString = new Date().toISOString().slice(0, 10);
  return (
    <section className="relative z-20 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_90px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-purple-200/70">Memory Gallery</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Completed dates and captured moments</h2>
        </div>
        <button
          onClick={loadMemories}
          disabled={loading || uploading}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCcw size={14} className={loading && !uploading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100 animate-in fade-in duration-200">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {supabaseClient.isConfigured && (
          <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-white/10 bg-slate-950/20 rounded-3xl aspect-[4/3] p-4 cursor-pointer hover:border-pink-500/30 hover:bg-white/5 transition-all group overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleFileChange} 
              disabled={uploading} 
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="text-pink-400 animate-spin" />
                <span className="text-center text-[11px] text-slate-400 font-medium">Syncing image payload files...</span>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400 group-hover:bg-pink-500/10 group-hover:text-pink-400 transition-colors">
                  <ImagePlus size={22} className="group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-sm font-semibold text-white mt-3 text-center">Add memories</span>
                <span className="text-[10px] text-slate-400 mt-1">Select up to 3 photos</span>
              </>
            )}
          </label>
        )}

        {memories.filter(m => m.image_url).length === 0 && !uploading && !loading && (
          <div className="col-span-2 rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-sm text-slate-300 flex flex-col justify-center min-h-[150px]">
            <div className="mb-2 flex items-center gap-2 text-purple-200">
              <Sparkles size={16} />
              No memories uploaded yet. Plan a date or add a custom spot!
            </div>
          </div>
        )}

        {memories.filter(m => m.image_url).map((item) => {
          const images = parseImages(item.image_url);
          const hasMultiple = images.length > 1;

          return (
            <motion.article 
              key={item.id} 
              whileHover={{ y: -4 }}
              onClick={() => {
                setActiveLightbox(item);
                setLightboxImageIndex(0);
              }}
              className="overflow-hidden rounded-3xl border border-white/8 bg-slate-950/40 cursor-pointer group shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-500/20 via-fuchsia-500/10 to-violet-500/20">
                <img 
                  src={images[0]} 
                  alt={fallBackCaption(item)} 
                  className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy" 
                />

                {hasMultiple && (
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-pink-300 border border-white/10 backdrop-blur-sm shadow-md flex items-center gap-1">
                    +{images.length - 1} photos
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3.5">
                  <p className="text-sm font-medium text-white truncate">{fallBackCaption(item)}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{item.date} · {item.place || "Event Location"}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* DYNAMIC SELECTION OVERLAY CONTROL FOR CONFIRMING ACTIONS */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ImagePlus size={20} className="text-pink-400" />
                Configure Memory ({selectedFiles.length} Selected)
              </h3>
              <button 
                onClick={() => { setShowModal(false); setSelectedFiles([]); }}
                className="text-slate-400 hover:text-white rounded-full p-1 bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2 py-1 overflow-x-auto mb-3">
              {selectedFiles.map((f, idx) => (
                <div key={idx} className="h-14 w-18 shrink-0 rounded-xl bg-slate-950 border border-white/10 overflow-hidden relative">
                  <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="preview" />
                </div>
              ))}
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-300">
                  Assign to which planned date target?
                </label>

                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                    onClick={() => {
                      setDateFilterMode("month");
                        setDateFilterValue(months.find((item) => item.value === getCurrentMonthKey())?.value || months[0]?.value || "");
                        setSelectedDateId("");
                      }}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        dateFilterMode === "month"
                          ? "border-pink-500/40 bg-pink-500/10 text-pink-200"
                          : "border-white/10 bg-slate-950 text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                    onClick={() => {
                      setDateFilterMode("week");
                        setDateFilterValue(weeks.find((item) => item.value === getCurrentWeekKey())?.value || weeks[0]?.value || "");
                        setSelectedDateId("");
                      }}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        dateFilterMode === "week"
                          ? "border-pink-500/40 bg-pink-500/10 text-pink-200"
                          : "border-white/10 bg-slate-950 text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      Weekly
                    </button>
                  </div>

                  <select
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none transition-colors focus:border-pink-500 [color-scheme:dark]"
                    value={dateFilterValue}
                    onChange={(e) => {
                      setDateFilterValue(e.target.value);
                      setSelectedDateId("");
                    }}
                  >
                    <option value="">
                      {dateFilterMode === "week" ? "All weeks" : "All months"}
                    </option>
                    {(dateFilterMode === "week" ? weeks : months).map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>

                  <select
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none transition-colors focus:border-pink-500 [color-scheme:dark]"
                    value={selectedDateId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedDateId(val);
                      setIsCustomRow(val === "new_standalone");
                    }}
                  >
                    <option value="" disabled>
                      -- Choose a designated date match --
                    </option>
                    {filteredAvailableDates
                      .filter((d) => d.status !== "cancelled" && countImagesForDateId(memories, d.id) < 3)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.date} · {d.place || "Unnamed Location"} ({d.status})
                        </option>
                      ))}
                    <option value="new_standalone">+ Create brand new manual gallery spot</option>
                  </select>
                </div>
              </div>

              {isCustomRow && (
                <div className="p-3.5 rounded-2xl border border-white/5 bg-white/2 space-y-3 animate-in slide-in-from-top-2 duration-150">
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">Occurred Date</label>
                    <input 
                      type="date"
                      required={isCustomRow}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 text-sm text-white [color-scheme:dark]"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">Location / Place</label>
                    <input 
                      type="text"
                      required={isCustomRow}
                      placeholder="e.g., Peoples Park"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 text-sm text-white"
                      value={manualPlace}
                      onChange={(e) => setManualPlace(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                  Sweet Caption / Message
                </label>
                <textarea
                  placeholder="Tell something lovely about this moment... 🥰"
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSelectedFiles([]); }}
                  className="flex-1 rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all"
                >
                  Upload & Sync Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMMERSIVE LIGHTBOX (FIXED: ZERO FLATTENING ASPECT RESOLUTION) */}
      <AnimatePresence>
        {activeLightbox && (() => {
          const lightboxImages = parseImages(activeLightbox.image_url);
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLightbox(null)}
              className="fixed inset-0 z-[210] flex flex-col justify-between bg-slate-950/98 backdrop-blur-3xl p-4 md:p-6"
            >
              {/* TOP HEADER CONTROLS */}
              <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 z-20 pt-2">
                <div className="text-left" onClick={(e) => e.stopPropagation()}>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-pink-400 font-bold">{activeLightbox.date}</p>
                  <h4 className="text-base md:text-lg font-bold text-white mt-0.5 truncate max-w-[250px] sm:max-w-md md:max-w-2xl">
                    {fallBackCaption(activeLightbox)}
                  </h4>
                </div>
                
                <div className="flex items-center gap-3">
                  {lightboxImages.length > 1 && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-pink-300 backdrop-blur-sm">
                      {lightboxImageIndex + 1} / {lightboxImages.length}
                    </span>
                  )}
                  <button 
                    onClick={() => setActiveLightbox(null)}
                    className="text-white/80 hover:text-white p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all active:scale-95"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* CORE VIEWPORT CANVAS AREA */}
              <div className="relative flex-1 w-full max-w-7xl mx-auto flex items-center justify-center min-h-0 my-auto">
                
                {/* Left Navigation Hotspot Trigger Arrow */}
                {lightboxImages.length > 1 && (
                  <button
                    onClick={(e) => prevImage(e, lightboxImages.length)}
                    className="absolute left-2 md:left-4 z-30 p-3 rounded-full bg-slate-900/80 text-white/90 hover:bg-slate-950 border border-white/10 backdrop-blur-md transition shadow-2xl active:scale-90"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}

                {/* Primary Pure Aspect Ratio Viewport Frame */}
                <div className="w-full h-full flex items-center justify-center p-1 md:p-4">
                  <img 
                    src={lightboxImages[lightboxImageIndex]} 
                    alt="Memory viewport item asset"
                    className="max-w-full max-h-[70vh] w-auto h-auto object-contain select-none rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.95)] border border-white/5 animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()} 
                  />
                </div>

                {/* Right Navigation Hotspot Trigger Arrow */}
                {lightboxImages.length > 1 && (
                  <button
                    onClick={(e) => nextImage(e, lightboxImages.length)}
                    className="absolute right-2 md:right-4 z-30 p-3 rounded-full bg-slate-900/80 text-white/90 hover:bg-slate-950 border border-white/10 backdrop-blur-md transition shadow-2xl active:scale-90"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}
              </div>

              {/* BOTTOM METADATA AND SWEET CAPTION BAR */}
              <div 
                className="w-full max-w-2xl mx-auto text-center z-20 pb-4 pt-2"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1 bg-slate-900/40 border border-white/5 py-1 px-3 rounded-full w-fit mx-auto shadow-md">
                  📍 {activeLightbox.place || "Captured Moment"}
                </p>
                
                {activeLightbox.caption && activeLightbox.caption !== activeLightbox.place && (
                  <p className="mt-3 text-sm sm:text-base text-slate-100 font-medium max-w-full inline-block px-5 py-2.5 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/5 backdrop-blur-xl shadow-xl italic">
                    "{activeLightbox.caption}"
                  </p>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
