import React, { useState, useRef, useEffect } from "react";
import { X, Calendar as CalendarIcon, FileText, Camera, Plus, Trash2, Heart, Sparkles, User, MessageCircle } from "lucide-react";
import { compressImage } from "../utils/imageCompressor";
import { Encounter, EncounterPhoto } from "../types";

interface AddEncounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (encounter: {
    id?: string;
    date: string;
    title: string;
    note: string;
    noteSamuel?: string;
    noteIle?: string;
    photos: string[];
    photosWithAuthor?: EncounterPhoto[];
  }) => Promise<void>;
  currentUser: string;
  encounterToEdit?: Encounter | null;
}

const PRESET_EMOJIS = ["❤️", "✨", "🍕", "🎬", "🚗", "🏖️", "🍨", "☕", "🏡", "🌳", "🍿", "🎁", "🎡", "👩‍❤️‍👨"];

export default function AddEncounterModal({
  isOpen,
  onClose,
  onSave,
  currentUser,
  encounterToEdit,
}: AddEncounterModalProps) {
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [noteSamuel, setNoteSamuel] = useState("");
  const [noteIle, setNoteIle] = useState("");
  const [photosWithAuthor, setPhotosWithAuthor] = useState<EncounterPhoto[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (encounterToEdit) {
        setDate(encounterToEdit.date || "");
        setTitle(encounterToEdit.title || "");
        setNote(encounterToEdit.note || "");
        setNoteSamuel(encounterToEdit.noteSamuel || "");
        setNoteIle(encounterToEdit.noteIle || "");
        
        if (encounterToEdit.photosWithAuthor && encounterToEdit.photosWithAuthor.length > 0) {
          setPhotosWithAuthor(encounterToEdit.photosWithAuthor);
        } else if (encounterToEdit.photos && encounterToEdit.photos.length > 0) {
          // Fallback migration: default to Samuel
          setPhotosWithAuthor(
            encounterToEdit.photos.map((url) => ({ url, uploadedBy: "Samuel" }))
          );
        } else {
          setPhotosWithAuthor([]);
        }
      } else {
        const today = new Date();
        setDate(today.toISOString().split("T")[0]);
        setTitle("");
        setNote("");
        setNoteSamuel("");
        setNoteIle("");
        setPhotosWithAuthor([]);
      }
    }
  }, [encounterToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    const newPhotos: EncounterPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImage(files[i], 600, 600, 0.7);
        newPhotos.push({
          url: compressed,
          uploadedBy: currentUser,
        });
      } catch (err) {
        console.error("Error compressing image:", err);
      }
    }

    setPhotosWithAuthor((prev) => [...prev, ...newPhotos]);
    setIsCompressing(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotosWithAuthor((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emoji: string) => {
    setTitle((prev) => prev + " " + emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      const simplePhotos = photosWithAuthor.map((p) => p.url);
      await onSave({
        id: encounterToEdit?.id,
        date,
        title: title.trim(),
        note: note.trim(),
        noteSamuel: noteSamuel.trim(),
        noteIle: noteIle.trim(),
        photos: simplePhotos,
        photosWithAuthor,
      });
      // Reset form
      setTitle("");
      setNote("");
      setNoteSamuel("");
      setNoteIle("");
      setPhotosWithAuthor([]);
      onClose();
    } catch (err) {
      console.error("Error saving encounter:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!encounterToEdit;

  return (
    <div id="add-encounter-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-brand-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div
        id="add-encounter-panel"
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl border-t sm:border border-brand-100 flex flex-col transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-brand-950 text-base font-display">
              {isEditing ? "Modifica Incontro" : "Aggiungi Incontro"}
            </h3>
          </div>
          <button
            id="close-add-modal"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-brand-50 text-brand-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-900 flex items-center gap-1.5 uppercase tracking-wider">
              <CalendarIcon className="w-3.5 h-3.5 text-brand-500" />
              Quando vi siete visti?
            </label>
            <input
              id="encounter-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-900 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-brand-500" />
              Cosa avete fatto? (Titolo)
            </label>
            <input
              id="encounter-title"
              type="text"
              required
              placeholder="E.g. Pomeriggio al mare, Cinema insieme, Cena stellata..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-900 text-sm placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
            />
            {/* Quick emoji helper */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {PRESET_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-7 h-7 flex items-center justify-center text-xs bg-brand-50 hover:bg-brand-100 rounded-lg active:scale-90 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Shared Note / Story */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              La Nostra Storia / Nota Condivisa
            </label>
            <textarea
              id="encounter-note"
              placeholder="Un riassunto generale o descrizione di quello che avete fatto insieme... (Premi Invio se desideri andare a capo e creare dello spazio)"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-900 text-sm placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition resize-y min-h-[90px]"
            />
          </div>

          {/* Co-authoring Split Blocks */}
          <div className="border-t border-brand-100 pt-4 space-y-4">
            <h4 className="text-xs font-extrabold text-brand-800 uppercase tracking-widest flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-200" />
              I Vostri Pensieri Personali (Co-Autori)
            </h4>
            
            {/* Samuel's Thought Field */}
            <div className={`p-4 rounded-2xl border transition ${
              currentUser === "Samuel" 
                ? "bg-sky-50/70 border-sky-200 ring-1 ring-sky-300" 
                : "bg-brand-50/30 border-brand-100"
            }`}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-bold text-sky-700 flex items-center gap-1">
                  👦 Il pensiero di Samuel
                </span>
                {currentUser === "Samuel" && (
                  <span className="text-[10px] bg-sky-500 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Tu
                  </span>
                )}
              </div>
              <textarea
                id="encounter-note-samuel"
                disabled={currentUser !== "Samuel"}
                placeholder={
                  currentUser === "Samuel"
                    ? "Samuel, aggiungi il tuo pensiero... (Premi Invio per lasciare dello spazio)"
                    : "Ancora nessun pensiero da parte di Samuel."
                }
                rows={3}
                value={noteSamuel}
                onChange={(e) => setNoteSamuel(e.target.value)}
                className="w-full p-2 bg-white/90 border border-brand-100 rounded-lg text-brand-900 text-xs placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-sky-400 transition resize-y"
              />
            </div>

            {/* Ilenia's Thought Field */}
            <div className={`p-4 rounded-2xl border transition ${
              currentUser === "Ile" 
                ? "bg-rose-50/70 border-rose-200 ring-1 ring-rose-300" 
                : "bg-brand-50/30 border-brand-100"
            }`}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  👧 Il pensiero di Ilenia
                </span>
                {currentUser === "Ile" && (
                  <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Tu
                  </span>
                )}
              </div>
              <textarea
                id="encounter-note-ile"
                disabled={currentUser !== "Ile"}
                placeholder={
                  currentUser === "Ile"
                    ? "Ilenia, aggiungi il tuo pensiero... (Premi Invio per lasciare dello spazio)"
                    : "Ancora nessun pensiero da parte di Ilenia."
                }
                rows={3}
                value={noteIle}
                onChange={(e) => setNoteIle(e.target.value)}
                className="w-full p-2 bg-white/90 border border-brand-100 rounded-lg text-brand-900 text-xs placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-rose-400 transition resize-y"
              />
            </div>
          </div>

          {/* Gallery Upload */}
          <div className="space-y-2 border-t border-brand-100 pt-4">
            <label className="text-xs font-bold text-brand-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-brand-500" />
              Foto del Giorno
            </label>
            
            <div className="grid grid-cols-4 gap-2">
              {/* Photo Previews with Author Distinction */}
              {photosWithAuthor.map((photo, index) => {
                const isSamuel = photo.uploadedBy === "Samuel";
                return (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 group shadow-sm bg-brand-50 transition ${
                      isSamuel ? "border-sky-300" : "border-rose-300"
                    }`}
                  >
                    <img src={photo.url} alt="Preview" className="w-full h-full object-cover" />
                    
                    {/* Small tag showing who uploaded */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center text-[8px] text-white font-semibold">
                      {isSamuel ? "👦 Samuel" : "👧 Ile"}
                    </div>

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition shadow z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              {/* Upload Trigger Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-brand-200 hover:border-brand-400 rounded-xl text-brand-400 hover:text-brand-500 hover:bg-brand-50/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {isCompressing ? (
                  <span className="text-[10px] text-brand-500 font-medium animate-pulse">Comprimo...</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mb-0.5 text-brand-400" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Foto</span>
                  </>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-[10px] text-brand-400">Le foto vengono caricate a nome di <strong className="text-brand-600">{currentUser === "Samuel" ? "Samuel 👦" : "Ile 👧"}</strong>.</p>
          </div>

          {/* Submit Button */}
          <button
            id="save-encounter-submit"
            type="submit"
            disabled={isSubmitting || !title.trim() || isCompressing}
            className="w-full mt-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brand-200 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvataggio in corso...
              </span>
            ) : isEditing ? (
              "Salva Modifiche ✏️"
            ) : (
              "Salva Ricordo ✨"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
