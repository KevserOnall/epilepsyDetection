'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ImageUploader from '@/components/ImageUploader';
import AnalysisResults from '@/components/AnalysisResults';
import * as PDFJS from 'pdfjs-dist';
import Sidebar from '@/components/Sidebar';
import { fileService } from '@/services/fileService';
import { useRouter } from 'next/navigation';

export default function EEGAnaliz() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedFileRecord, setSelectedFileRecord] = useState<any>(null);
  const [currentComment, setCurrentComment] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    id: '',
    age: '',
    gender: '',
    notes: ''
  });
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Worker'ı yapılandır
  useEffect(() => {
    PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
  }, []);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const fileRecords = await fileService.getFileHistory();
        setFiles(fileRecords);
      } catch (error) {
        console.error('Dosyalar yüklenirken hata:', error);
      } finally {
        setLoadingFiles(false);
      }
    };
    loadFiles();
  }, []);

  const readFileData = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        }
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  };

  const convertPdfToImages = async (file: File): Promise<string[]> => {
    const images: string[] = [];
    const data = await readFileData(file);
    const pdf = await PDFJS.getDocument(data).promise;
    const canvas = document.createElement("canvas");

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1.5 }); // Biraz daha büyük ölçek
      const context = canvas.getContext("2d");

      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ 
        canvasContext: context, 
        viewport: viewport 
      }).promise;
      
      images.push(canvas.toDataURL('image/png'));
    }

    canvas.remove();
    return images;
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setCurrentImageIndex(0);
    setAnalysisResults(null);
    setIsUploading(true);
    try {
      if (file.type === 'application/pdf') {
        try {
          console.log('PDF yükleme başlıyor...');
          // PDF'i Firebase'e yükle
          const fileUrl = await fileService.uploadFile(file);
          console.log('PDF yüklendi, URL:', fileUrl);

          console.log('PDF görüntülere dönüştürülüyor...');
          const images = await convertPdfToImages(file);
          console.log('PDF görüntülere dönüştürüldü, sayfa sayısı:', images.length);
          setImageUrls(images);
          
          console.log('Dosya kaydı oluşturuluyor...');
          // Dosya kaydını oluştur
          const fileId = await fileService.saveFileRecord(
            file.name,
            fileUrl,
            images.length,
            patientInfo // Hasta bilgilerini de kaydet
          );
          console.log('Dosya kaydı oluşturuldu, ID:', fileId);

          console.log('Dosya kaydı alınıyor...');
          // Yeni oluşturulan dosya kaydını al ve state'i güncelle
          const fileRecord = await fileService.getFileWithAnalyses(fileId);
          console.log('Dosya kaydı alındı:', fileRecord);
          setSelectedFileRecord(fileRecord);
          
          console.log('Sayfa analizleri kaydediliyor...');
          // Her sayfa için görüntüyü sakla
          for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i];
            await fileService.savePageAnalysis(fileId, i + 1, imageUrl, null);
            console.log(`${i + 1}. sayfa analizi kaydedildi`);
          }
          console.log('Tüm işlemler tamamlandı');
        } catch (error) {
          console.error('İşlem sırasında hata oluştu:', error);
          // Hata detaylarını göster
          if (error instanceof Error) {
            console.error('Hata mesajı:', error.message);
            console.error('Hata stack:', error.stack);
          }
        }
      } else {
        setImageUrls([URL.createObjectURL(file)]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrls.length) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      
      // Seçili görüntüyü analiz et
      const currentImageUrl = imageUrls[currentImageIndex];
      if (currentImageUrl.startsWith('data:image')) {
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        formData.append('image', blob, 'converted-page.png');
      } else {
        // Base64 görüntüyü blob'a çevir
        const base64Response = await fetch(currentImageUrl);
        const blob = await base64Response.blob();
        formData.append('image', blob, 'image.png');
      }

      const response = await fetch('/api/analyze-ct', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnalysisResults(data);

      // Analiz sonuçlarını kaydet
      if (selectedFileRecord) {
        try {
          await fileService.savePageAnalysis(
            selectedFileRecord.id,
            currentImageIndex + 1,
            imageUrls[currentImageIndex],
            data,
            currentComment
          );
          console.log('Analiz sonuçları kaydedildi');
        } catch (error) {
          console.error('Analiz sonuçları kaydedilirken hata:', error);
        }
      }
    } catch (error) {
      console.error('Analiz sırasında bir hata oluştu:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setAnalysisResults(null);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : prev));
    setAnalysisResults(null);
  };

  const handleCommentSave = async (comment: string) => {
    if (selectedFileRecord) {
      try {
        await fileService.savePageAnalysis(
          selectedFileRecord.id,
          currentImageIndex + 1,
          imageUrls[currentImageIndex],
          analysisResults,
          comment
        );
        setCurrentComment(comment);
        console.log('Yorum kaydedildi');
      } catch (error) {
        console.error('Yorum kaydedilirken hata:', error);
      }
    }
  };

  const handleFileRecordSelect = async (fileRecord: any, imageUrls?: string[]) => {
    // Hasta bilgilerini doldur
    if (fileRecord.patientInfo) {
      setPatientInfo({
        name: fileRecord.patientInfo.name || '',
        id: fileRecord.patientInfo.id || '',
        age: fileRecord.patientInfo.age || '',
        gender: fileRecord.patientInfo.gender || '',
        notes: fileRecord.patientInfo.notes || ''
      });
    }
    if (imageUrls && imageUrls.length > 0) {
      setImageUrls(imageUrls);
      setCurrentImageIndex(0);
      setSelectedFileRecord(fileRecord);
      // Seçilen sayfanın analiz sonucu ve yorumunu göster
      const currentAnalysis = fileRecord.analyses.find(
        (a: any) => a.pageNumber === 1
      );
      if (currentAnalysis) {
        setAnalysisResults(currentAnalysis.analysis);
        setCurrentComment(currentAnalysis.comment || '');
      } else {
        setAnalysisResults(null);
        setCurrentComment('');
      }
    } else if (fileRecord.fileUrl) {
      // PDF'i indirip sayfalara böl
      try {
        const response = await fetch(fileRecord.fileUrl);
        if (!response.ok) throw new Error('Dosya indirilemedi. (Yetki veya bağlantı hatası olabilir)');
        const blob = await response.blob();
        const file = new File([blob], fileRecord.fileName, { type: 'application/pdf' });
        const images = await convertPdfToImages(file);
        setImageUrls(images);
        setCurrentImageIndex(0);
        setSelectedFileRecord(fileRecord);
        setAnalysisResults(null);
        setCurrentComment('');
      } catch (err: any) {
        alert('Geçmiş PDF dosyası yüklenirken hata: ' + (err.message || err));
        console.error('Geçmiş PDF dosyası yüklenirken hata:', err);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <main className="w-full md:flex-1 overflow-auto">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">EEG Analizi</h1>
                <p className="text-xl text-gray-600 leading-relaxed">EEG görüntülerinizi yükleyin ve yapay zeka destekli analiz sonuçlarını alın.</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-8 py-3 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-500 shadow-lg hover:from-indigo-700 hover:to-purple-600 transition-all duration-300"
              >
                Yeni Analiz
                <svg className="ml-3 -mr-1 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hasta Bilgileri</h2>
                <div className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta Adı</label>
                <input
                  type="text"
                  value={patientInfo.name}
                      onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  placeholder="Hasta adını girin"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta ID</label>
                <input
                  type="text"
                  value={patientInfo.id}
                      onChange={(e) => setPatientInfo({ ...patientInfo, id: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  placeholder="Hasta ID'sini girin"
                />
              </div>
                  <div className="grid grid-cols-2 gap-4">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yaş</label>
                <input
                        type="text"
                  value={patientInfo.age}
                        onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="Yaş"
                />
              </div>
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                <select
                  value={patientInfo.gender}
                        onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                >
                  <option value="">Seçiniz</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                </select>
              </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                <textarea
                  value={patientInfo.notes}
                      onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      rows={3}
                  placeholder="Hasta ile ilgili notlar"
                />
                  </div>
              </div>
            </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dosya Yükleme</h2>
            <ImageUploader 
              onImageSelect={handleFileSelect} 
              imageUrl={imageUrls[currentImageIndex] || null}
              acceptedFileTypes="application/pdf,image/*"
              isUploading={isUploading}
            />
                {selectedFile && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-indigo-700 font-medium">
                      Seçilen dosya: {selectedFile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {imageUrls.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Görüntü Önizleme</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePrevImage}
                    disabled={currentImageIndex === 0}
                    className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  <span className="text-gray-600">
                    Sayfa {currentImageIndex + 1} / {imageUrls.length}
                  </span>
                  <button
                    onClick={handleNextImage}
                    disabled={currentImageIndex === imageUrls.length - 1}
                    className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              </div>

              <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-6">
                <img
                  src={imageUrls[currentImageIndex]}
                  alt={`Sayfa ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analiz Ediliyor...
                    </span>
                  ) : (
                    'Analiz Et'
                  )}
                </button>
              </div>
            </div>
          )}

          {analysisResults && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Analiz Sonuçları</h2>
              <AnalysisResults 
                results={analysisResults} 
                imageUrl={imageUrls[currentImageIndex] || null}
                comment={currentComment}
                onSave={handleCommentSave}
              />
            </div>
          )}
        </div>
      </main>
      {/* Geçmiş Dosyalar Kartı */}
      <div className="w-full md:max-w-xs mx-auto md:mx-0 mt-8 md:mt-12 bg-white rounded-xl shadow-lg p-6 md:ml-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Geçmiş Dosyalar</h2>
        {loadingFiles ? (
          <div className="text-center text-gray-500">Yükleniyor...</div>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-500">Henüz dosya yok</div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => handleFileRecordSelect(file)}
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