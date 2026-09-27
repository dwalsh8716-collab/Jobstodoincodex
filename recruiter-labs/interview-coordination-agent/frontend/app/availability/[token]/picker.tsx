"use client";

import { CalendarCheck, Check, Plus, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8005";

type AvailabilityInfo = {
  participant_name: string;
  participant_type: string;
  candidate_name: string;
  client_name: string;
  company_name: string;
  job_title: string;
  stage: string;
  duration_minutes: number;
  timezone: string;
  expires_at: string;
  submitted_at: string | null;
};

type Slot = {
  date: string;
  start: string;
  end: string;
  label: string;
};

const BLOCKS = [
  { start: "09:00", end: "12:00", label: "Morning" },
  { start: "12:00", end: "15:00", label: "Early afternoon" },
  { start: "15:00", end: "18:00", label: "Late afternoon" },
];

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function nextBusinessDays(count: number) {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (days.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      days.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default function AvailabilityPicker({ token }: { token: string }) {
  const [info, setInfo] = useState<AvailabilityInfo | null>(null);
  const [selected, setSelected] = useState<Slot[]>([]);
  const [notes, setNotes] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customStart, setCustomStart] = useState("10:00");
  const [customEnd, setCustomEnd] = useState("11:00");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const days = useMemo(() => nextBusinessDays(5), []);
  const minDate = days[0] ? isoDate(days[0]) : "";

  useEffect(() => {
    async function load() {
      setError("");
      try {
        const response = await fetch(`${API_BASE}/api/public/availability/${token}`);
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { detail?: string } | null;
          throw new Error(body?.detail || "This availability link is not available.");
        }
        setInfo((await response.json()) as AvailabilityInfo);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "This availability link is not available.");
      }
    }
    void load();
  }, [token]);

  function toggle(slot: Slot) {
    setSelected((current) => {
      const exists = current.some((item) => item.date === slot.date && item.start === slot.start && item.end === slot.end);
      if (exists) {
        return current.filter((item) => !(item.date === slot.date && item.start === slot.start && item.end === slot.end));
      }
      return [...current, slot];
    });
  }

  function addCustomSlot() {
    if (!customDate || !customStart || !customEnd || customEnd <= customStart) {
      setError("Choose a custom date with an end time after the start time.");
      return;
    }
    setError("");
    toggle({
      date: customDate,
      start: customStart,
      end: customEnd,
      label: "Custom",
    });
  }

  async function submit() {
    if (!info || !selected.length) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE}/api/public/availability/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          windows: selected.map((slot) => ({
            date: slot.date,
            start: slot.start,
            end: slot.end,
            timezone: info.timezone,
          })),
          notes,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(body?.detail || "Could not send availability.");
      }
      const body = (await response.json()) as { message: string };
      setSuccess(body.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send availability.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !info) {
    return (
      <main className="availabilityShell">
        <section className="availabilityCard">
          <p className="status danger">Availability link</p>
          <h1>That link is not available.</h1>
          <p className="muted">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="availabilityShell">
      <section className="availabilityCard">
        <p className="status">
          <CalendarCheck size={14} /> Interview availability
        </p>
        <h1>{info ? `Hi ${info.participant_name.split(" ")[0]}` : "Loading availability"}</h1>
        {info ? (
          <>
            <p className="lede">
              {info.company_name} would like to arrange {info.stage.toLowerCase()} for the {info.job_title} role. Pick a few
              windows that work and David will get it coordinated.
            </p>
            <p className="muted">Times shown in {info.timezone}.</p>
          </>
        ) : (
          <p className="lede">Checking the link.</p>
        )}

        {info?.submitted_at && !success ? (
          <div className="notice">You have already sent availability for this interview. You can update it below if needed.</div>
        ) : null}
        {error ? <div className="error">{error}</div> : null}
        {success ? (
          <div className="successBox">
            <h2>All sorted.</h2>
            <p>{success}</p>
          </div>
        ) : null}

        {info && !success ? (
          <>
            <div className="weekGrid" aria-label="Choose availability windows">
              {days.map((day) => (
                <div className="dayColumn" key={isoDate(day)}>
                  <strong>{dayLabel(day)}</strong>
                  {BLOCKS.map((block) => {
                    const slot = {
                      date: isoDate(day),
                      start: block.start,
                      end: block.end,
                      label: block.label,
                    };
                    const active = selected.some(
                      (item) => item.date === slot.date && item.start === slot.start && item.end === slot.end,
                    );
                    return (
                      <button
                        className={active ? "slotChoice selected" : "slotChoice"}
                        key={`${slot.date}-${slot.start}`}
                        type="button"
                        onClick={() => toggle(slot)}
                      >
                        {active ? <Check size={14} /> : null} {block.label}
                        <br />
                        <span>
                          {block.start}-{block.end}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="customSlot">
              <h3>Add an exact time</h3>
              <div className="formSection">
                <div className="field">
                  <label htmlFor="custom-date">Date</label>
                  <input id="custom-date" min={minDate} type="date" value={customDate} onChange={(event) => setCustomDate(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="custom-start">Start</label>
                  <input id="custom-start" type="time" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="custom-end">End</label>
                  <input id="custom-end" type="time" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
                </div>
                <div className="field customSlotAction">
                  <span aria-hidden="true">&nbsp;</span>
                  <button className="btn secondary" type="button" onClick={addCustomSlot}>
                    <Plus size={18} /> Add Time
                  </button>
                </div>
              </div>
            </div>
            {selected.length ? (
              <div className="selectedSlots">
                {selected
                  .slice()
                  .sort((left, right) => `${left.date}${left.start}`.localeCompare(`${right.date}${right.start}`))
                  .map((slot) => (
                    <button className="selectedSlot" key={`${slot.date}-${slot.start}-${slot.end}`} type="button" onClick={() => toggle(slot)}>
                      <Check size={14} />
                      {slot.date} {slot.start}-{slot.end}
                    </button>
                  ))}
              </div>
            ) : null}
            <div className="field">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Anything useful David should know"
              />
            </div>
            <div className="actions" style={{ marginTop: 14 }}>
              <button className="btn" type="button" onClick={() => void submit()} disabled={busy || !selected.length}>
                <Send size={18} /> {busy ? "Sending" : "Send Availability"}
              </button>
              <span className="muted">{selected.length} windows selected · {info.timezone}</span>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
