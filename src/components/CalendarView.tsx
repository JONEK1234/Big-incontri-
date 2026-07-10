import React, { useState } from "react";
import { SpecialDate, Encounter } from "../types";
import { getAnniversaryStatus } from "../utils/anniversaryHelper";
import { Calendar as CalendarIcon, Star, Gift, Heart, CalendarDays, Plus, Trash2, ArrowRight, Sparkles } from "lucide-react";

interface CalendarViewProps {
  specialDates: SpecialDate[];
  encounters: Encounter[];
  onAddSpecialDate: (date: { date: string; title: string; description: string; type: "anniversary" | "special_date" | "milestone" }) => Promise<void>;
  onDeleteSpecialDate: (id: string) => Promise<void>;
}

export default function CalendarView({ specialDates, encounters, onAddSpecialDate, onDeleteSpecialDate }: CalendarViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"anniversary" | "special_date" | "milestone">("anniversary");
  const [isSaving, setIsSaving] = useState(false);

  // Calendar rendering state
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar days for viewMonth and viewYear
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  // Adjust so Monday is first day of the week (standard in Italy)
  const adjustedStartDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const daysArray = [];
  // Empty slots for preceding days
  for (let i = 0; i < adjustedStartDay; i++) {
    daysArray.push(null);
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // Find occurrences (encounters and special dates) on a specific calendar day
  const getDayEvents = (dayNum: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    const checkDateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;

    // Match encounter
    const matchesEncounter = encounters.filter(e => e.date === checkDateStr);
    
    // Match special dates (anniversaries match by month and day, or specific year)
    const matchesSpecial = specialDates.filter(s => {
      if (s.type === "anniversary") {
        // Anniversaries repeat every year, compare month and day
        const sParts = s.date.split("-");
        return parseInt(sParts[1]) === (viewMonth + 1) && parseInt(sParts[2]) === dayNum;
      } else {
        // Exact match
        return s.date === checkDateStr;
      }
    });

    return { matchesEncounter, matchesSpecial };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    setIsSaving(true);
    try {
      await onAddSpecialDate({
        title: newTitle.trim(),
        date: newDate,
        description: newDesc.trim(),
        type: newType,
      });
      setNewTitle("");
      setNewDate("");
      setNewDesc("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error saving special date:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "anniversary":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "milestone":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default:
        return "bg-brand-100 text-brand-700 border-brand-200";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "anniversary":
        return <Star className="w-4 h-4 text-amber-500 fill-amber-300" />;
      case "milestone":
        return <Gift className="w-4 h-4 text-indigo-500 fill-indigo-200" />;
      default:
        return <Heart className="w-4 h-4 text-red-500 fill-red-200" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Alerts */}
      <div className="bg-white rounded-3xl border border-brand-100 p-5 shadow-sm">
        <h3 className="font-bold text-brand-950 text-lg font-display flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-brand-500" />
          I Nostri Anniversari
        </h3>

        {/* List of active alerts and countdowns */}
        <div className="space-y-3">
          {specialDates.length === 0 ? (
            <p className="text-sm text-brand-500 italic">Nessun anniversario inserito. Aggiungine uno per vedere il conto alla rovescia!</p>
          ) : (
            specialDates.map((special) => {
              const status = getAnniversaryStatus(special.date);
              
              return (
                <div
                  id={`special-card-${special.id}`}
                  key={special.id}
                  className={`p-4 rounded-2xl border transition duration-200 ${
                    status.isToday
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-300 shadow-sm animate-pulse"
                      : "bg-brand-50/30 border-brand-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{getIcon(special.type)}</div>
                      <div>
                        <h4 className="font-bold text-brand-950 text-sm">{special.title}</h4>
                        {special.description && (
                          <p className="text-xs text-brand-600 mt-0.5">{special.description}</p>
                        )}
                        <p className="text-[10px] text-brand-400 mt-1">
                          Data originale: {new Date(special.date).toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <button
                      id={`delete-special-${special.id}`}
                      onClick={() => {
                        if (window.confirm("Vuoi rimuovere questo anniversario?")) {
                          onDeleteSpecialDate(special.id);
                        }
                      }}
                      className="text-brand-300 hover:text-red-500 p-1 rounded-full transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Anniversary calculation badge */}
                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-brand-100 pt-2.5">
                    {status.isToday ? (
                      <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        OGGI: 🎉 Festeggiamo {status.yearsElapsed} ann{status.yearsElapsed === 1 ? "o" : "i"} di questo evento!
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-brand-600 flex items-center gap-1">
                        Prossimo traguardo: <strong className="text-brand-800 font-bold">{status.yearsToCelebrate} ann{status.yearsToCelebrate === 1 ? "o" : "i"}</strong> il {new Date(status.nextOccurrence).toLocaleDateString("it-IT", { month: "short", day: "numeric" })}
                      </span>
                    )}

                    {!status.isToday && (
                      <span className="text-[10px] bg-brand-100 text-brand-700 font-extrabold px-2 py-0.5 rounded-full">
                        Mancano {status.daysRemaining} giorni
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Toggle Form Button */}
        {!showAddForm ? (
          <button
            id="toggle-special-form"
            onClick={() => setShowAddForm(true)}
            className="mt-4 w-full py-2.5 px-4 border border-dashed border-brand-200 text-brand-600 hover:border-brand-400 hover:bg-brand-50/50 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.99] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Aggiungi Data Speciale
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 border-t border-brand-100 pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-800 uppercase">Titolo</label>
                <input
                  id="special-title"
                  type="text"
                  required
                  placeholder="Anniversario amicizia..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-50/50 border border-brand-100 rounded-xl text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-800 uppercase">Quando è iniziato?</label>
                <input
                  id="special-date"
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-50/50 border border-brand-100 rounded-xl text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-800 uppercase">Tipo</label>
                <select
                  id="special-type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-brand-50/50 border border-brand-100 rounded-xl text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-400 focus:bg-white"
                >
                  <option value="anniversary">Anniversario 🌟</option>
                  <option value="milestone">Traguardo 🎁</option>
                  <option value="special_date">Data Importante ❤️</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-800 uppercase">Piccola descrizione</label>
                <input
                  id="special-desc"
                  type="text"
                  placeholder="La data del nostro primo..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-50/50 border border-brand-100 rounded-xl text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 border border-brand-100 hover:bg-brand-50 text-brand-600 rounded-xl text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                id="save-special-btn"
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                {isSaving ? "Salvataggio..." : "Salva ✨"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Interactive Monthly Calendar Grid */}
      <div className="bg-white rounded-3xl border border-brand-100 p-5 shadow-sm">
        {/* Calendar Nav */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-brand-950 text-base font-display">
            {monthNames[viewMonth]} {viewYear}
          </h3>
          <div className="flex gap-1.5">
            <button
              id="calendar-prev-month"
              onClick={handlePrevMonth}
              className="p-1.5 bg-brand-50 hover:bg-brand-100 rounded-lg text-brand-600 active:scale-90 transition cursor-pointer"
            >
              &larr;
            </button>
            <button
              id="calendar-next-month"
              onClick={handleNextMonth}
              className="p-1.5 bg-brand-50 hover:bg-brand-100 rounded-lg text-brand-600 active:scale-90 transition cursor-pointer"
            >
              &rarr;
            </button>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-black text-brand-400 uppercase tracking-wider mb-2">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mer</div>
          <div>Gio</div>
          <div>Ven</div>
          <div>Sab</div>
          <div>Dom</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const { matchesEncounter, matchesSpecial } = getDayEvents(day);
            const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
            const hasEncounter = matchesEncounter.length > 0;
            const hasSpecial = matchesSpecial.length > 0;

            return (
              <div
                key={`day-${day}`}
                className={`aspect-square rounded-xl border flex flex-col justify-between p-1 relative group cursor-pointer transition ${
                  isToday
                    ? "border-brand-500 bg-brand-50/70"
                    : hasEncounter
                    ? "border-brand-200 bg-sky-50 hover:bg-sky-100"
                    : "border-brand-50 hover:bg-brand-50/40"
                }`}
                title={
                  matchesEncounter.map(e => e.title).join(", ") || 
                  matchesSpecial.map(s => s.title).join(", ")
                }
              >
                {/* Day Number */}
                <span className={`text-[11px] font-bold leading-none ${
                  isToday ? "text-brand-600 font-black" : "text-brand-900"
                }`}>
                  {day}
                </span>

                {/* Event Indicators */}
                <div className="flex gap-0.5 justify-end mt-auto">
                  {hasEncounter && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 block" title="Incontro!" />
                  )}
                  {hasSpecial && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 block" title="Anniversario!" />
                  )}
                </div>

                {/* Hover Quick Tip (custom tooltip simulation) */}
                {(hasEncounter || hasSpecial) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-brand-950 text-white text-[9px] py-1 px-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition z-10 w-28 text-center shadow-lg mb-1">
                    {hasEncounter && `📸 ${matchesEncounter.length} Incontro`}
                    {hasEncounter && hasSpecial && " / "}
                    {hasSpecial && `🌟 Anniversario`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
