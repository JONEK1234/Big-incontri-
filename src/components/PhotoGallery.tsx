import React, { useState } from "react";
import { Encounter } from "../types";
import { ImageIcon, Eye, Heart, Calendar, Sparkles } from "lucide-react";

interface PhotoGalleryProps {
  encounters: Encounter[];
}

export default function PhotoGallery({ encounters }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; date: string; title: string } | null>(null);

  // Collect all photos from all encounters, paired with encounter info and author
  const allPhotos = encounters.flatMap((enc) => {
    if (enc.photosWithAuthor && enc.photosWithAuthor.length > 0) {
      return enc.photosWithAuthor.map((p) => ({
        url: p.url,
        uploadedBy: p.uploadedBy,
        date: enc.date,
        title: enc.title,
      }));
    }
    const photosList = enc.photos || [];
    return photosList.map((photo) => ({
      url: photo,
      uploadedBy: "Samuel", // Fallback for legacy photos
      date: enc.date,
      title: enc.title,
    }));
  });

  // Sort photos chronologically by date descending
  const sortedPhotos = [...allPhotos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDateLabel = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (sortedPhotos.length === 0) {
    return (
      <div id="empty-gallery" className="text-center py-16 px-4 bg-white rounded-3xl border border-brand-100 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-400">
          <ImageIcon className="w-8 h-8 stroke-1" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-brand-900 text-lg">La galleria è vuota</h3>
          <p className="text-sm text-brand-500 max-w-xs mx-auto">
            Aggiungete una foto caricandola nei vostri incontri per vederla comparire qui in questo rullino magico!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gallery stats */}
      <div className="bg-gradient-to-r from-sky-400 to-brand-500 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-100">I vostri scatti</span>
          <h2 className="text-xl font-extrabold font-display mt-0.5">Rullino dei Ricordi</h2>
          <p className="text-xs text-sky-50 mt-1">
            {sortedPhotos.length} foto scattate insieme 📸
          </p>
        </div>
        <div className="bg-white/10 p-2.5 rounded-2xl">
          <Sparkles className="w-5 h-5 text-yellow-200" />
        </div>
      </div>

      {/* Grid displaying the date under each thumbnail */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-5">
        {sortedPhotos.map((photo, index) => {
          const isSamuel = photo.uploadedBy === "Samuel";
          return (
            <div
              id={`gallery-item-${index}`}
              key={index}
              onClick={() => setSelectedPhoto(photo)}
              className="flex flex-col items-stretch cursor-pointer group active:scale-95 transition"
            >
              {/* Image box */}
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-brand-100 shadow-sm bg-brand-50">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                
                {/* Author badge on bottom-right of thumbnail */}
                <div className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow border bg-white flex items-center gap-0.5 ${
                  isSamuel ? "text-sky-600 border-sky-100" : "text-rose-600 border-rose-100"
                }`}>
                  <span>{isSamuel ? "👦 S" : "👧 I"}</span>
                </div>

                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Eye className="w-5 h-5 text-white drop-shadow" />
                </div>
              </div>
              
              {/* Caption beneath photo */}
              <div className="mt-1 text-center flex flex-col justify-center px-1">
                <span className="text-[10px] font-bold text-brand-800 tracking-tight leading-tight truncate" title={photo.title}>
                  {photo.title}
                </span>
                <span className="text-[9px] font-medium text-brand-400 mt-0.5 whitespace-nowrap">
                  {formatDateLabel(photo.date)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          id="gallery-lightbox"
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-4 cursor-pointer"
        >
          <button
            id="close-gallery-lightbox"
            className="absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-full transition"
            aria-label="Chiudi"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="max-w-full max-h-[75vh] p-1 flex flex-col items-center">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            
            {/* Metadata overlay card */}
            <div className="mt-4 bg-white/15 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-center max-w-sm" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-white text-sm font-bold tracking-tight">{selectedPhoto.title}</h4>
              
              <div className="flex items-center justify-center gap-3 mt-2">
                <p className="text-sky-200 text-xs flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateLabel(selectedPhoto.date)}
                </p>
                <span className="text-white/30 text-xs">•</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedPhoto.uploadedBy === "Samuel" 
                    ? "bg-sky-500/20 text-sky-200 border border-sky-500/30" 
                    : "bg-rose-500/20 text-rose-200 border border-rose-500/30"
                }`}>
                  {selectedPhoto.uploadedBy === "Samuel" ? "👦 Samuel" : "👧 Ilenia"}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-white/40 text-[10px] mt-6">Tocca un punto qualsiasi per chiudere</p>
        </div>
      )}
    </div>
  );
}
