'use client';

import { useState, useEffect } from 'react';
import { fileService } from '@/services/fileService';

interface SidebarProps {
  onFileSelect: (fileRecord: any, imageUrls?: string[]) => void;
}

export default function Sidebar({ onFileSelect }: SidebarProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const fileRecords = await fileService.getFileHistory();
        setFiles(fileRecords);
      } catch (error) {
        console.error('Dosyalar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, []);

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto h-screen fixed right-0 top-0 pt-16">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Geçmiş Dosyalar</h2>
        {loading ? (
          <div className="text-center text-gray-500">Yükleniyor...</div>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-500">Henüz dosya yok</div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => onFileSelect(file)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="font-medium text-gray-900 truncate">{file.fileName}</div>
                <div className="text-sm text-gray-500">
                  {file.uploadDate && !isNaN(new Date(file.uploadDate).getTime())
                    ? new Date(file.uploadDate).toLocaleDateString('tr-TR')
                    : ''}
                </div>
                <div className="text-sm text-gray-500">
                  {file.analyzedPagesCount || 0} sayfa analiz edildi
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 