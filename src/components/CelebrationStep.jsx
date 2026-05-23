import { useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  RefreshCcw,
  Send,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const RECIPIENT_EMAIL = import.meta.env.VITE_RECIPIENT_EMAIL || "aldrichhcirdla27@gmail.com";

function pad(value) {
  return String(value).padStart(2, "0");
}

function buildCalendarLink(dateInfo) {
  if (!dateInfo.date || !dateInfo.time) return "#";

  const [year, month, day] = dateInfo.date.split("-");
  const [hours, minutes] = dateInfo.time.split(":");
  const start = `${year}${month}${day}T${hours}${minutes}00`;
  const endHour = pad(Number(hours) + 2);
  const end = `${year}${month}${day}T${endHour}${minutes}00`;

  const title = "Our special date";
  const details = [
    `Date: ${dateInfo.date}`,
    `Time: ${dateInfo.time}`,
    `Place: ${dateInfo.place}`,
    "",
    "See you soon.",
  ].join("\n");

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(dateInfo.place)}&dates=${start}/${end}`;
}

export default function CelebrationStep({ dateInfo, onReset, onFinalize }) {
  const [copied, setCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState("sending");
  const hasSent = useRef(false);

  const calendarLink = useMemo(() => buildCalendarLink(dateInfo), [dateInfo]);

  useEffect(() => {
    if (hasSent.current) return;
    hasSent.current = true;

    const sendEmail = async () => {
      try {
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          {
            my_email: RECIPIENT_EMAIL,
            date: dateInfo.date,
            time: dateInfo.time,
            place: dateInfo.place,
            message: "The date is confirmed. See you soon.",
          },
          PUBLIC_KEY,
        );

        setEmailStatus("sent");
      } catch (error) {
        console.error("EmailJS Error:", error);
        setEmailStatus("error");
      } finally {
        await onFinalize?.();
      }
    };

    sendEmail();
  }, [dateInfo, onFinalize]);

  const handleCopy = async () => {
    const text = `Date: ${dateInfo.date}\nTime: ${dateInfo.time}\nPlace: ${dateInfo.place}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-6 text-center">
      <Confetti recycle={false} numberOfPieces={260} />

      <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_100px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <div className="mb-4 flex justify-center text-xs font-semibold">
          {emailStatus === "sending" && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-amber-100">
              <Send size={12} className="animate-pulse" />
              Sending confirmation...
            </span>
          )}
          {emailStatus === "sent" && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-emerald-100">
              <CheckCircle2 size={12} />
              Confirmation sent.
            </span>
          )}
          {emailStatus === "error" && (
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-rose-100">
              <AlertCircle size={12} />
              Email fallback active.
            </span>
          )}
        </div>

        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-500/10">
            <Sparkles className="text-pink-300" size={34} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Your date is locked in.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            The details were prepared for email, calendar, and the shared memory flow.
          </p>
        </div>

        <div className="mb-6 space-y-3 text-left">
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3">
            <Calendar size={18} className="shrink-0 text-pink-300" />
            <span className="text-sm text-white">{dateInfo.date || "No date saved"}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3">
            <Clock size={18} className="shrink-0 text-sky-300" />
            <span className="text-sm text-white">{dateInfo.time || "No time saved"}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3">
            <MapPin size={18} className="shrink-0 text-purple-300" />
            <span className="truncate text-sm text-white">{dateInfo.place || "No place saved"}</span>
          </div>
        </div>

        <div className="mb-4">
          <a
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            <Sparkles size={16} />
            Open Google Calendar
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              copied ? "bg-emerald-500/20 text-emerald-100" : "bg-white/8 text-slate-200 hover:bg-white/12"
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy details"}
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/12"
          >
            <RefreshCcw size={16} />
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
