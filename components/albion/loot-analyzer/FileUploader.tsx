import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Props {
  files: File[];
  imageUrls: string[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export function FileUploader({ files, imageUrls, onAddFiles, onRemoveFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-[var(--mw-text-main)] flex items-center gap-2">
        <ImageIcon size={18} className="text-[var(--mw-text-muted)]" />
        1. Suas Imagens do Inventário
      </h3>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[var(--mw-border)] hover:border-[var(--mw-gold-primary)] transition-colors rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[var(--mw-bg)]/50"
      >
        <Upload size={32} className="text-[var(--mw-text-muted)]" />
        <p className="text-sm text-[var(--mw-text-muted)] text-center font-medium">
          Clique para enviar as prints
          <br /><span className="text-xs opacity-70">(Você pode selecionar várias)</span>
        </p>
        <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-[var(--mw-border)] group">
              <Image src={url} alt={`Print ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={e => { e.stopPropagation(); onRemoveFile(i); }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
