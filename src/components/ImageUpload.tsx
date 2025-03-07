import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Language } from '../types';

interface ImageUploadProps {
  language: Language;
  onImageSelect: (file: File) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function ImageUpload({ 
  language, 
  onImageSelect,
  maxSize = 5, // Default max size is 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      setError(language === 'en' 
        ? 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
        : 'Type de fichier invalide. Veuillez télécharger une image JPEG, PNG ou WebP.'
      );
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(language === 'en'
        ? `File size must be less than ${maxSize}MB`
        : `La taille du fichier doit être inférieure à ${maxSize}Mo`
      );
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onImageSelect(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8
            ${dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500'}
          `}
        >
          <input
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {language === 'en' ? (
                <>
                  Drag and drop your image here, or <span className="text-red-600">browse</span>
                </>
              ) : (
                <>
                  Glissez et déposez votre image ici, ou <span className="text-red-600">parcourez</span>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {language === 'en' ? (
                `JPEG, PNG or WebP up to ${maxSize}MB`
              ) : (
                `JPEG, PNG ou WebP jusqu'à ${maxSize}Mo`
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}