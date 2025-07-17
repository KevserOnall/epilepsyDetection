'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { fileService } from '@/services/fileService';
import { formatFindings } from '@/utils/formatFindings';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import AnalysisResults from '@/components/AnalysisResults';
import { useRouter } from 'next/navigation';

// PDF.js worker yapılandırması
GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

interface Finding {
  pageNumber: number;
  comment?: string;
  imageUrl?: string;
  findings: {
    location: string;
    description: string;
    id: string;
    coordinates: string;
  }[];
}

interface Report {
  id: string;
  date: string;
  patientName: string;
  patientId: string;
  status: string;
  findings: Finding[];
  analyzedPageCount: number;
  patientInfo?: {
    name?: string;
    id?: string;
    age?: string;
    gender?: string;
    notes?: string;
    pageCount?: number;
  };
}

// Analiz Sonuçları formatı için yardımcı tip
type SectionType = {
  content?: string;
  type: 'text' | 'list';
  description?: string;
  items?: Array<{
    id: string | number;
    title: string;
    description?: string;
    location: string;
  }>;
};

export default function Raporlar() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    patientName: '',
    patientId: '',
    status: ''
  });
  const [openAnalysisIndexes, setOpenAnalysisIndexes] = useState<{ [key: number]: boolean }>({});
  const [modalImage, setModalImage] = useState<string | null>(null);
  // Yorum state'i ve kaydetme fonksiyonu
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: { name: string; value: string; loading: boolean; saved: boolean; lastComment?: string } }>({});

  const handleCommentChange = (index: number, field: 'name' | 'value', value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value }
    }));
  };

  const handleCommentSave = async (report: Report, finding: Finding, index: number) => {
    setCommentInputs((prev) => ({
      ...prev,
      [index]: { ...prev[index], loading: true }
    }));
    try {
      const name = commentInputs[index]?.name || '';
      const value = commentInputs[index]?.value || '';
      // Yorumu isimle birlikte kaydet (yorum formatı: "isim: yorum")
      await fileService.savePageAnalysis(
        report.id,
        finding.pageNumber,
        finding.imageUrl || '',
        finding.findings,
        name ? `${name}: ${value}` : value
      );
      setCommentInputs((prev) => ({
        ...prev,
        [index]: { name: '', value: '', loading: false, saved: true, lastComment: name ? `${name}: ${value}` : value }
      }));
      // Raporları tekrar yüklemeye gerek yok, mesajı hemen gösteriyoruz
    } catch (e) {
      alert('Yorum kaydedilemedi!');
      setCommentInputs((prev) => ({
        ...prev,
        [index]: { ...prev[index], loading: false }
      }));
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const fileRecords = await fileService.getFileHistory();
      
      const formattedReports = fileRecords.map(record => ({
        id: record.id,
        date: new Date(record.uploadDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
        patientName: record.patientInfo?.name || 'Belirtilmemiş',
        patientId: record.patientInfo?.id || 'Belirtilmemiş',
        status: record.analyses?.length > 0 ? 'Tamamlandı' : 'Beklemede',
        findings: record.analyses?.map(analysis => ({
          pageNumber: analysis.pageNumber,
          comment: analysis.comment,
          imageUrl: analysis.imageUrl,
          findings: (analysis.analysis?.findings || []).map((finding: any) => {
            let coordinates = finding.coordinates;
            if (typeof coordinates === 'string') {
              try {
                coordinates = JSON.parse(coordinates);
              } catch {
                coordinates = undefined;
              }
            }
            return {
              location: finding.location || 'Belirtilmemiş',
              description: finding.description || 'Analiz yapılmadı',
              id: finding.id,
              coordinates
            };
          })
        })) || [],
        analyzedPageCount: record.analyses?.length || 0,
        patientInfo: {
          name: record.patientInfo?.name || '',
          id: record.patientInfo?.id || '',
          age: record.patientInfo?.age || '',
          gender: record.patientInfo?.gender || '',
          notes: record.patientInfo?.notes || '',
          pageCount: record.pageCount
        }
      }));

      setReports(formattedReports);
    } catch (error) {
      console.error('Raporlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    return (
      (!filters.date || report.date.includes(filters.date)) &&
      (!filters.patientName || report.patientName.toLowerCase().includes(filters.patientName.toLowerCase())) &&
      (!filters.patientId || report.patientId.toLowerCase().includes(filters.patientId.toLowerCase())) &&
      (!filters.status || report.status === filters.status)
    );
  });

  // Rapor silme fonksiyonu
  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Bu raporu silmek istediğinize emin misiniz?')) return;
    try {
      await fileService.deleteFileRecord(reportId);
      await loadReports();
    } catch (e) {
      alert('Rapor silinemedi!');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
            EEG Analiz Raporları
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Tüm EEG analiz raporlarınızı görüntüleyin ve yönetin
          </p>
        </div>

        {/* Filtreler */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Filtreler</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih Aralığı
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta Adı
              </label>
              <input
                type="text"
                value={filters.patientName}
                onChange={(e) => setFilters({...filters, patientName: e.target.value})}
                placeholder="Hasta adı ile ara..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta ID
              </label>
              <input
                type="text"
                value={filters.patientId}
                onChange={(e) => setFilters({...filters, patientId: e.target.value})}
                placeholder="Hasta ID ile ara..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              >
                <option value="">Tümü</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="Beklemede">Beklemede</option>
              </select>
            </div>
          </div>
        </div>

        {/* Raporlar Tablosu */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hasta Adı
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hasta ID
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-6 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <span className="text-gray-600">Yükleniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-6 text-center">
                      <div className="text-gray-500 flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>Rapor bulunamadı</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                        {report.date}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                        {report.patientName}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                        {report.patientId}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.status === 'Tamamlandı' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rapor Detay Modalı */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Rapor Detayları</h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Hasta Bilgileri */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasta Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Ad Soyad</p>
                      <p className="text-gray-900">{selectedReport.patientInfo?.name || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hasta ID</p>
                      <p className="text-gray-900">{selectedReport.patientInfo?.id || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Yaş</p>
                      <p className="text-gray-900">{selectedReport.patientInfo?.age || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cinsiyet</p>
                      <p className="text-gray-900">{selectedReport.patientInfo?.gender || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                  {selectedReport.patientInfo?.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Notlar</p>
                      <p className="text-gray-900">{selectedReport.patientInfo.notes}</p>
                    </div>
                  )}
                </div>

                {/* Analiz Sonuçları */}
                <div className="space-y-6">
                  {selectedReport.findings
                    .slice()
                    .sort((a, b) => a.pageNumber - b.pageNumber)
                    .map((finding, index) => (
                      <div key={index} className="bg-white rounded-xl border border-gray-200 p-0 cursor-pointer transition hover:bg-gray-50">
                        <div
                          className="flex justify-between items-center p-6 select-none"
                          onClick={() => setOpenAnalysisIndexes({
                            ...openAnalysisIndexes,
                            [index]: !openAnalysisIndexes[index]
                          })}
                        >
                          <h3 className="text-lg font-semibold text-gray-900">
                            Sayfa {finding.pageNumber}
                          </h3>
                          <svg
                            className={`w-5 h-5 transform transition-transform duration-200 ${
                              openAnalysisIndexes[index] ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {openAnalysisIndexes[index] && (
                          <div className="space-y-4">
                            {/* İşaretli görsel ve bulgular */}
                            {finding.imageUrl && finding.findings && (
                              <>
                                <AnalysisResults
                                  results={{ findings: finding.findings }}
                                  imageUrl={finding.imageUrl}
                                />
                                {/* Yorum alanı kesinlikle AnalysisResults'un dışında, hemen altında ayrı bir div olarak */}
                                <div className="mt-4">
                                  <h4 className="text-md font-semibold mb-2">Yorum</h4>
                                  <input
                                    className="w-full px-3 py-2 border rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="İsminiz"
                                    value={commentInputs[index]?.name ?? ''}
                                    onChange={e => handleCommentChange(index, 'name', e.target.value)}
                                  />
                                  <textarea
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Bu analiz hakkında yorumunuzu yazın..."
                                    value={commentInputs[index]?.value ?? ''}
                                    onChange={e => handleCommentChange(index, 'value', e.target.value)}
                                    rows={2}
                                  />
                                  <button
                                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                    disabled={commentInputs[index]?.loading}
                                    onClick={() => handleCommentSave(selectedReport, finding, index)}
                                  >
                                    {commentInputs[index]?.loading ? 'Kaydediliyor...' : 'Kaydet'}
                                  </button>
                                  {commentInputs[index]?.saved && (
                                    <div className="mt-2 text-green-600 text-sm font-medium">Yorum yapıldı!{commentInputs[index]?.lastComment && (
                                      <span className="ml-2 text-gray-700">({commentInputs[index]?.lastComment})</span>
                                    )}</div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Görüntü Modalı */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setModalImage(null)}
          >
            <div className="relative max-w-4xl w-full">
              <img
                src={modalImage}
                alt="Büyük görüntü"
                className="w-full h-auto rounded-lg"
              />
              <button
                onClick={() => setModalImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 