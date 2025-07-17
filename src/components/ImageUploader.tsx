'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imageUrl: string | null;
  acceptedFileTypes?: string;
  isUploading?: boolean;
}

export default function ImageUploader({ 
  onImageSelect, 
  imageUrl,
  acceptedFileTypes = "image/*",
  isUploading = false
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    // setIsLoading(true); // Artık ana sayfadan yönetiliyor

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Dosya boyutu kontrolü (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Dosya boyutu 100MB\'dan küçük olmalıdır.');
        // setIsLoading(false);
        return;
      }

      // Dosya tipi kontrolü
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/dicom'];
      if (!validTypes.includes(file.type)) {
        setError('Sadece PDF, JPEG, PNG ve DICOM dosyaları yüklenebilir.');
        // setIsLoading(false);
        return;
      }

      try {
        onImageSelect(file);
      } catch (err) {
        setError('Dosya yüklenirken bir hata oluştu.');
        console.error('Dosya yükleme hatası:', err);
      }
    }
    // setIsLoading(false);
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/dicom': ['.dicom', '.dcm']
    },
    multiple: false
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                   transition-colors ${
                     isDragActive
                       ? 'border-blue-500 bg-blue-50'
                       : 'border-gray-300 hover:border-gray-400'
                   } ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
      >
        <input
          {...getInputProps()}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="py-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
            </div>
            <p className="text-indigo-600 mt-2 font-medium">Dosya yükleniyor...</p>
          </div>
        ) : imageUrl ? (
          <div className="relative w-full h-[200px]">
            <img
              src={imageUrl}
              alt="Yüklenen görüntü"
              className="w-full h-full object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageSelect(null as any);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="text-gray-600 mt-2">
              <p className="font-semibold">Dosyayı buraya sürükleyin</p>
              <p className="text-sm">veya dosya seçmek için tıklayın</p>
              <p className="text-xs mt-1 text-gray-500">
                Desteklenen formatlar: PDF, JPEG, PNG, DICOM
              </p>
              <p className="text-xs text-gray-500">Maksimum dosya boyutu: 100MB</p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 