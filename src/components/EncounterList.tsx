import React, { useState } from "react";
import { Encounter } from "../types";
import { calculateDaysBetween, formatDuration } from "../utils/imageCompressor";
import { Calendar, Trash2, Edit2, Heart, MessageSquare, ChevronRight, Image as ImageIcon, Eye, Sparkles } from "lucide-react";

interface EncounterListProps {
  encounters: Encounter[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (encounter: Encounter) => void;
  currentUser: string;
}

export default function EncounterList({ encounters, onDelete, onEdit, currentUser }: EncounterListProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; uploadedBy: string } | null>(null);

  // 1. Sort encounters chronologically ASCENDING to calculate absolute encounter numbers and durations
  const sortedChronological = [...encounters].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Create lookup for metadata: index (1-based) and days elapsed from previous
  const encounterMeta = new Map<
    string,
    { index: number; daysSincePrevious: number | null; formattedDays: string | null }
  >();

  sortedChronological.forEach((enc, idx) => {
    let daysSincePrevious: number | null = null;
    let formattedDays: string | null = null;

    if (idx > 0) {
      const prevEnc = sortedChronological[idx - 1];
      daysSincePrevious = calculateDaysBetween(prevEnc.date, enc.date);
      formattedDays = formatDuration(daysSincePrevious);
    }

    encounterMeta.set(enc.id, {
      index: idx + 1,
      daysSincePrevious,
      formattedDays,
    });
  });

  // 2. Render encounters sorted DESCENDING (most recent first) for a stream/diary experience
  const sortedRecent = [...encounters].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (encounters.length === 0) {
    return (
      <div id="empty-encounters" className="text-center py-16 px-4 bg-white rounded-3xl border border-brand-100 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-400">
          <Heart className="w-8 h-8 stroke-1 animate-pulse fill-brand-100" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-brand-900 text-lg">Nessun incontro registrato</h3>
          <p className="text-sm text-brand-500 max-w-xs mx-auto">
            Registrate il vostro primo incontro insieme toccando il tasto <strong className="text-brand-600">Nuovo</strong> in basso!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic count summary widget */}
      <div className="bg-gradient-to-br from-brand-500 to-sky-400 text-white p-5 rounded-3xl shadow-lg shadow-brand-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-100">Il vostro legame</span>
          <h2 className="text-2xl font-black font-display mt-0.5">
            {encounters.length} Incontr{encounters.length === 1 ? "o" : "i"}
          </h2>
          <p className="text-xs text-sky-50/90 mt-1">
            Ogni momento passato insieme è un tesoro 💙
          </p>
        </div>
        <div className="bg-white/15 p-3 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col items-center">
          <Sparkles className="w-6 h-6 text-yellow-200 mb-0.5" />
          <span className="text-[10px] font-bold">BIG TIME</span>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-5">
        {sortedRecent.map((encounter) => {
          const meta = encounterMeta.get(encounter.id);
          const hasPhotos = encounter.photos && encounter.photos.length > 0;

          return (
            <div
              id={`encounter-card-${encounter.id}`}
              key={encounter.id}
              className="bg-white rounded-3xl border border-brand-100 shadow-sm overflow-hidden flex flex-col transition duration-300 hover:shadow-md hover:border-brand-200"
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    {/* Dynamic Auto-number tag */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-700">
                        {meta?.index}° Incontro
                      </span>
                      {meta?.formattedDays && (
                        <span className="text-xs text-brand-500 font-semibold italic">
                          ({meta.formattedDays})
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-extrabold text-brand-950 font-display tracking-tight leading-snug">
                      {encounter.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit button */}
                    <button
                      id={`edit-btn-${encounter.id}`}
                      onClick={() => onEdit(encounter)}
                      className="p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition"
                      title="Modifica ricordo"
                      aria-label="Modifica ricordo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Delete button */}
                    <button
                      id={`delete-btn-${encounter.id}`}
                      onClick={() => {
                        if (window.confirm("Sei sicuro di voler eliminare questo ricordo?")) {
                          onDelete(encounter.id);
                        }
                      }}
                      className="p-2 text-brand-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                      title="Elimina ricordo"
                      aria-label="Elimina incontro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Date Row */}
                <div className="flex items-center gap-1.5 text-brand-500 text-xs mt-2.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateLabel(encounter.date)}</span>
                </div>
              </div>

              {/* Photos Gallery */}
              {hasPhotos && (
                <div className="px-5 py-2">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                    {(() => {
                      const displayPhotos = encounter.photosWithAuthor && encounter.photosWithAuthor.length > 0
                        ? encounter.photosWithAuthor
                        : (encounter.photos || []).map((url) => ({ url, uploadedBy: "Samuel" }));

                      return displayPhotos.map((photo, pIdx) => {
                        const isSamuel = photo.uploadedBy === "Samuel";
                        return (
                          <div
                            key={pIdx}
                            onClick={() => setSelectedPhoto(photo)}
                            className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 snap-center cursor-pointer active:scale-95 transition ${
                              isSamuel ? "border-sky-200" : "border-rose-200"
                            }`}
                          >
                            <img
                              src={photo.url}
                              alt={`Memory ${pIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Small author badge */}
                            <div className={`absolute bottom-1 right-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow border bg-white ${
                              isSamuel ? "text-sky-600 border-sky-100" : "text-rose-600 border-rose-100"
                            }`}>
                              {isSamuel ? "👦 S" : "👧 I"}
                            </div>

                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                              <Eye className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* General Shared Note / Dedication Box */}
              {encounter.note && (
                <div className="mx-5 mb-3 p-4 bg-brand-50/50 border border-brand-100 rounded-2xl relative">
                  <div className="absolute top-3 left-4 text-brand-300">
                    <MessageSquare className="w-4 h-4 fill-brand-100" />
                  </div>
                  <p className="text-sm text-brand-800 leading-relaxed pl-6 italic font-serif">
                    "{encounter.note}"
                  </p>
                </div>
              )}

              {/* Co-authored personal thoughts block */}
              <div className="mx-5 mb-5 space-y-2 border-t border-brand-100/60 pt-3">
                {/* Samuel's Note */}
                {encounter.noteSamuel ? (
                  <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-sky-700 block mb-0.5">👦 Samuel dice:</span>
                    <p className="text-xs text-sky-950 font-serif italic">"{encounter.noteSamuel}"</p>
                  </div>
                ) : (
                  currentUser === "Samuel" && (
                    <button
                      onClick={() => onEdit(encounter)}
                      className="w-full p-2.5 border border-dashed border-sky-200 bg-sky-50/20 hover:bg-sky-50 hover:border-sky-300 rounded-xl text-center text-xs text-sky-600 font-semibold tracking-wide transition flex items-center justify-center gap-1"
                    >
                      <span>👦</span> Aggiungi il tuo ricordo di Samuel! ✍️
                    </button>
                  )
                )}

                {/* Ilenia's Note */}
                {encounter.noteIle ? (
                  <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-rose-700 block mb-0.5">👧 Ilenia dice:</span>
                    <p className="text-xs text-rose-950 font-serif italic">"{encounter.noteIle}"</p>
                  </div>
                ) : (
                  currentUser === "Ile" && (
                    <button
                      onClick={() => onEdit(encounter)}
                      className="w-full p-2.5 border border-dashed border-rose-200 bg-rose-50/20 hover:bg-rose-50 hover:border-rose-300 rounded-xl text-center text-xs text-rose-600 font-semibold tracking-wide transition flex items-center justify-center gap-1"
                    >
                      <span>👧</span> Aggiungi il tuo ricordo di Ilenia! ✍️
                    </button>
                  )
                )}

                {/* Prompt for the other user when their note is empty but the viewer is not them */}
                {!encounter.noteSamuel && currentUser !== "Samuel" && (
                  <div className="text-center p-2 text-[10px] text-brand-400 italic">
                    In attesa del pensiero di Samuel... 👦⏳
                  </div>
                )}
                {!encounter.noteIle && currentUser !== "Ile" && (
                  <div className="text-center p-2 text-[10px] text-brand-400 italic">
                    In attesa del pensiero di Ilenia... 👧⏳
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          id="photo-lightbox"
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-4 cursor-pointer"
        >
          <div className="absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-full transition">
            <XIcon className="w-6 h-6" />
          </div>
          <img
            src={selectedPhoto.url}
            alt="Expanded memory"
            className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl"
          />
          
          <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border ${
            selectedPhoto.uploadedBy === "Samuel"
              ? "bg-sky-500/20 text-sky-200 border-sky-500/30"
              : "bg-rose-500/20 text-rose-200 border-rose-500/30"
          }`} onClick={(e) => e.stopPropagation()}>
            Caricata da: {selectedPhoto.uploadedBy === "Samuel" ? "👦 Samuel" : "👧 Ilenia"}
          </div>

          <p className="text-white/40 text-[10px] mt-4">Clicca in qualsiasi punto per chiudere</p>
        </div>
      )}
    </div>
  );
}

// Inline fallback since Lucide-react doesn't have custom X icon occasionally
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
