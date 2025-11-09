'use client';

import { useState, useRef, ChangeEvent } from 'react';

type MediaUploadProps = {
  rifaId: number;
  onUploadComplete?: () => void;
};

export function MediaUpload({ rifaId, onUploadComplete }: MediaUploadProps) {
  const [fotos, setFotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fotosInputRef = useRef<HTMLInputElement>(null);
  const videosInputRef = useRef<HTMLInputElement>(null);

  const handleFotosChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (fotos.length + imageFiles.length > 10) {
      setError('Máximo de 10 fotos permitidas');
      return;
    }
    
    setFotos([...fotos, ...imageFiles]);
    setError(null);
  };

  const handleVideosChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFiles = files.filter(f => f.type.startsWith('video/'));
    
    if (videos.length + videoFiles.length > 2) {
      setError('Máximo de 2 vídeos permitidos');
      return;
    }
    
    setVideos([...videos, ...videoFiles]);
    setError(null);
  };

  const removeFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (fotos.length === 0 && videos.length === 0) {
      setError('Selecione pelo menos uma foto ou vídeo');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      fotos.forEach((foto) => {
        formData.append('fotos', foto);
      });
      videos.forEach((video) => {
        formData.append('videos', video);
      });

      const response = await fetch(`/api/upload/rifa/${rifaId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro ao fazer upload' }));
        throw new Error(error.error || 'Erro ao fazer upload');
      }

      setSuccess(true);
      setFotos([]);
      setVideos([]);
      if (fotosInputRef.current) fotosInputRef.current.value = '';
      if (videosInputRef.current) videosInputRef.current.value = '';
      
      setTimeout(() => {
        setSuccess(false);
        onUploadComplete?.();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Fotos e Vídeos</h3>
        <p className="mt-1 text-sm text-slate-600">
          Adicione até 10 fotos e 2 vídeos do prêmio
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fotos (até 10)
          </label>
          <input
            ref={fotosInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFotosChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
          {fotos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {fotos.map((foto, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(foto)}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-20 rounded-lg object-cover border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFoto(index)}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Vídeos (até 2)
          </label>
          <input
            ref={videosInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideosChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
          {videos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {videos.map((video, index) => (
                <div key={index} className="relative group">
                  <div className="h-20 w-20 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                    <svg className="h-8 w-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="text-xs text-slate-500 mt-1 truncate w-20">{video.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(fotos.length > 0 || videos.length > 0) && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploading ? 'Enviando...' : `Enviar ${fotos.length} foto(s) e ${videos.length} vídeo(s)`}
        </button>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Arquivos enviados com sucesso!
        </div>
      )}
    </div>
  );
}

