'use client';

import { useState, useEffect, useRef } from 'react';

interface ListItem {
  id: number;
  title: string;
  description?: string;
  location: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface Section {
  type: 'text' | 'list';
  content?: string;
  description?: string;
  items?: ListItem[];
}

interface Finding {
  id: number;
  title: string;
  description?: string;
  location: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface AnalysisResultsProps {
  results: any;
  imageUrl: string | null;
  comment?: string;
  onSave?: (comment: string) => void;
}

export default function AnalysisResults({ 
  results, 
  imageUrl, 
  comment: initialComment = '',
  onSave 
}: AnalysisResultsProps) {
  const [comment, setComment] = useState(initialComment);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setComment(initialComment);
  }, [initialComment]);

  // Görselin ekranda render edilen boyutunu güncelle
  useEffect(() => {
    if (!imgRef.current) return;
    const updateSize = () => {
      setRenderedSize({
        width: imgRef.current ? imgRef.current.clientWidth : 0,
        height: imgRef.current ? imgRef.current.clientHeight : 0
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [imageUrl]);

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(`${name}: ${comment}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Sonuçlar yoksa veya geçersizse
  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analiz Sonuçları</h2>
        <p className="text-gray-600">Henüz analiz sonucu bulunmamaktadır.</p>
      </div>
    );
  }

  // API yanıtını düzenle
  const formatFindings = (rawFindings: any[]): { [key: string]: Section } => {
    const sections: { [key: string]: Section } = {
      'Zemin Aktivitesi': { content: '', type: 'text', description: '' },
      'Anormal Bulgular': { items: [], type: 'list', content: '' },
      'Artefaktlar': { items: [], type: 'list', content: '' },
      'Sonuç ve Öneriler': { content: '', type: 'text', description: '' }
    };

    let currentSection = '';
    let lastItem: any = null;
    let conclusionDescriptions: string[] = [];
    let inConclusionSection = false;

    rawFindings.forEach(item => {
      const rawTitle = item.description?.trim() || '';
      
      // ** ile başlayan ana başlıkları kontrol et
      if (rawTitle.startsWith('**')) {
        const title = rawTitle.replace(/\*\*/g, '').trim();
        if (title in sections) {
          currentSection = title;
          lastItem = null;
          inConclusionSection = (title === 'Sonuç ve Öneriler');
        }
        return;
      }

      if (!currentSection) return;

      // Tire ile başlayan açıklamaları kontrol et
      if (rawTitle.startsWith('-')) {
        const description = rawTitle.substring(1).trim();
        if (inConclusionSection) {
          conclusionDescriptions.push(description);
        } else if (lastItem) {
          // Alt madde açıklaması
          lastItem.description = description;
        } else if (sections[currentSection].type === 'text') {
          // Ana başlık açıklaması
          sections[currentSection].description = description;
        }
        return;
      }

      // İçerik ekleme
      if (sections[currentSection].type === 'text') {
        if (!rawTitle.startsWith('-')) {
          sections[currentSection].content = rawTitle;
        }
      } else if (sections[currentSection].type === 'list') {
        // Eğer location Belirtilmemis değilse ve metin - veya ** ile başlamıyorsa, bu bir maddedir
        if (item.location !== 'Belirtilmemis' && 
            !rawTitle.startsWith('-') && 
            !rawTitle.startsWith('**')) {
          // Başındaki numarayı temizle (varsa)
          const title = rawTitle.replace(/^\d+\.?\s*/, '').trim();
          
          const newItem = {
            id: item.id,
            title: title,
            description: '',
            location: item.location,
            coordinates: {
              x: item.coordinates.x,
              y: item.coordinates.y,
              width: item.coordinates.width || 30,
              height: item.coordinates.height || 20
            }
          };
          sections[currentSection].items?.push(newItem);
          lastItem = newItem;
        }
      }
    });

    // Sonuç ve Öneriler açıklamalarını birleştir
    if (conclusionDescriptions.length > 0) {
      sections['Sonuç ve Öneriler'].description = conclusionDescriptions.join(' ');
    }

    return sections;
  };

  const sections = formatFindings(results.findings || []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Analiz Sonuçları</h2>
      {/* Görsel ve işaretler */}
      {imageUrl && (
        <div ref={containerRef} className="relative w-full h-[400px] border rounded-lg overflow-hidden flex items-center justify-center mb-8">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Analiz edilen görüntü"
            className="max-w-full max-h-full object-contain block mx-auto"
            style={{ display: 'block' }}
            onLoad={e => {
              const img = e.target as HTMLImageElement;
              setImgSize({
                width: img.naturalWidth,
                height: img.naturalHeight
              });
              setRenderedSize({
                width: img.clientWidth,
                height: img.clientHeight
              });
            }}
          />
          <p className="text-xs text-gray-500 absolute left-2 bottom-2 bg-white bg-opacity-70 px-2 py-1 rounded z-20">
            Orijinal boyut: {imgSize.width} x {imgSize.height}
          </p>
          {Object.entries(sections).map(([sectionName, section]) => {
            if (section.type === 'list' && section.items) {
              return section.items
                .filter(item => {
                  const loc = item.location?.toLowerCase() || '';
                  const title = item.title?.toLowerCase() || '';
                  const desc = item.description?.toLowerCase() || '';
                  const ignoreWords = ['genel', 'tüm kanallar', 'çeşitli kanallar', 'belirtilmemiş'];
                  if (
                    ignoreWords.some(word => loc.includes(word) || title.includes(word) || desc.includes(word)) ||
                    !loc ||
                    !title
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((item) => {
                  let left = 0, top = 0, width = 120, height = 30;
                  let marginX = 0, marginY = 0;
                  if (containerRef.current && renderedSize.width && renderedSize.height) {
                    const containerW = containerRef.current.clientWidth;
                    const containerH = containerRef.current.clientHeight;
                    marginX = (containerW - renderedSize.width) / 2;
                    marginY = (containerH - renderedSize.height) / 2;
                    left = marginX + (item.coordinates.x / 1000) * renderedSize.width;
                    top = marginY + (item.coordinates.y / 1000) * renderedSize.height;
                  }
                  return (
                    <div
                      key={item.id}
                      className="absolute group z-10"
                      style={{
                        left: left,
                        top: top,
                        width: width,
                        height: height,
                      }}
                    >
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded-md cursor-pointer group-hover:bg-opacity-30 transition-all">
                        <span className="absolute -top-6 -left-6 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                          {item.id}
                        </span>
                      </div>
                      <div className="absolute left-full top-0 ml-2 hidden group-hover:block bg-white p-2 rounded shadow-lg text-sm w-48 z-20">
                        <p className="font-semibold">{item.title}</p>
                        {item.description && (
                          <p className="text-gray-600 text-xs mt-1">{item.description}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">Konum: {item.location}</p>
                      </div>
                    </div>
                  );
                });
            }
            return null;
          })}
        </div>
      )}
      {/* Bulgular tek sütun halinde görselin altında */}
      <div className="space-y-6">
        {Object.entries(sections).map(([sectionName, section]) => (
          <div key={sectionName} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">{sectionName}</h3>
            {section.type === 'text' ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900">{section.content}</p>
                {section.description && (
                  <p className="text-sm text-gray-700 mt-2">{section.description}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {section.content && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{section.content}</p>
                  </div>
                )}
                <div className="space-y-3 ml-4">
                  {section.items?.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm shrink-0">
                          {item.id}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Konum:</span> {item.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

        {/* Yorum alanı kaldırıldı */}
    </div>
  );
}