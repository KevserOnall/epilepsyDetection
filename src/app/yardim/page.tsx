'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import { useState } from 'react';

export default function Yardim() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
            Yardım Merkezi
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            EEG analiz sistemimizi kullanırken ihtiyacınız olan tüm bilgiler burada
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                  EEG Analiz Nasıl Yapılır?
                </h2>
                <p className="text-gray-600 mt-2 leading-relaxed">
                  EEG görüntülerinizi nasıl yükleyip analiz edeceğinizi öğrenin
                </p>
              </div>
            </div>
            <div className="flex items-center text-indigo-600 group-hover:text-indigo-700 transition-colors duration-200">
              <span className="font-medium">Detaylı Bilgi</span>
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                  Raporları Anlama
                </h2>
                <p className="text-gray-600 mt-2 leading-relaxed">
                  EEG analiz raporlarını nasıl yorumlayacağınızı öğrenin
                </p>
              </div>
            </div>
            <div className="flex items-center text-indigo-600 group-hover:text-indigo-700 transition-colors duration-200">
              <span className="font-medium">Detaylı Bilgi</span>
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* EEG Analiz Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    EEG Analiz Nasıl Yapılır?
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-10">
                  {/* Adım 1 */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-indigo-600">1</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                        EEG Görüntüsünü Yükleyin
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        EEG Analiz sayfasına gidin ve "Dosya Seç" butonuna tıklayarak EEG görüntünüzü yükleyin. 
                        Sistemimiz PDF, JPEG, PNG ve DICOM formatlarını desteklemektedir.
                      </p>
                    </div>
                  </div>

                  {/* Adım 2 */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-indigo-600">2</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                        Analiz Başlatın
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Dosyanızı yükledikten sonra "Analiz Et" butonuna tıklayın. 
                        Sistem otomatik olarak EEG görüntünüzü analiz etmeye başlayacaktır.
                      </p>
                    </div>
                  </div>

                  {/* Adım 3 */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-indigo-600">3</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                        Sonuçları İnceleyin
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Analiz tamamlandığında, sonuçlar aşağıdaki kategorilerde sunulacaktır:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Zemin Aktivitesi</h4>
                          <p className="text-sm text-gray-600">Temel beyin dalgalarının analizi</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Anormal Bulgular</h4>
                          <p className="text-sm text-gray-600">Epileptiform aktiviteler ve diğer anormallikler</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Artefaktlar</h4>
                          <p className="text-sm text-gray-600">Yapay sinyallerin tespiti ve analizi</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Sonuç ve Öneriler</h4>
                          <p className="text-sm text-gray-600">Detaylı değerlendirme ve öneriler</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raporları Anlama Modal */}
        {isReportModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    EEG Raporlarını Anlama
                  </h2>
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-10">
                  {/* Zemin Aktivitesi */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-indigo-600">1</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                        Zemin Aktivitesi
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        EEG'nin temel aktivitesini gösterir. Normal zemin aktivitesi:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Alfa ritmi</h4>
                          <p className="text-sm text-gray-600">8-13 Hz frekans aralığı</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Beta ritmi</h4>
                          <p className="text-sm text-gray-600">13-30 Hz frekans aralığı</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Teta ritmi</h4>
                          <p className="text-sm text-gray-600">4-8 Hz frekans aralığı</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Delta ritmi</h4>
                          <p className="text-sm text-gray-600">0.5-4 Hz frekans aralığı</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Anormal Bulgular */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-indigo-600">2</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                        Anormal Bulgular
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Epileptiform aktiviteler ve diğer anormal bulgular:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Keskin dalgalar</h4>
                          <p className="text-sm text-gray-600">Ani ve keskin yükselen dalgalar</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Spike dalgalar</h4>
                          <p className="text-sm text-gray-600">Çok kısa süreli keskin dalgalar</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Polispike dalgalar</h4>
                          <p className="text-sm text-gray-600">Birden fazla spike dalgası</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Yavaş dalga aktivitesi</h4>
                          <p className="text-sm text-gray-600">Anormal yavaş dalga paternleri</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Artefaktlar */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-indigo-600">3</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                        Artefaktlar
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        EEG kaydını etkileyebilecek yapay sinyaller:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Göz hareketi</h4>
                          <p className="text-sm text-gray-600">Göz kırpma ve hareketlerinden kaynaklanan sinyaller</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Kas artefaktları</h4>
                          <p className="text-sm text-gray-600">Kas hareketlerinden kaynaklanan sinyaller</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Elektrot artefaktları</h4>
                          <p className="text-sm text-gray-600">Elektrot bağlantı sorunlarından kaynaklanan sinyaller</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Kalp atışı</h4>
                          <p className="text-sm text-gray-600">Kalp atışından kaynaklanan sinyaller</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sonuç ve Öneriler */}
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-indigo-600">4</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                        Sonuç ve Öneriler
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Analiz sonuçlarına göre önerilen değerlendirmeler:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Klinik Değerlendirme</h4>
                          <p className="text-sm text-gray-600">Nörolojik muayene ve değerlendirme önerileri</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">İleri Tetkikler</h4>
                          <p className="text-sm text-gray-600">Gerekli görülen ek tetkik önerileri</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Takip Planı</h4>
                          <p className="text-sm text-gray-600">Önerilen takip süreci ve sıklığı</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Tedavi Önerileri</h4>
                          <p className="text-sm text-gray-600">Uygun görülen tedavi yaklaşımları</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end">
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sık Sorulan Sorular */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Sık Sorulan Sorular
          </h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                EEG görüntüsü nasıl yükleyebilirim?
              </h3>
              <p className="text-gray-600">
                EEG Analiz sayfasına gidin ve "Dosya Seç" butonuna tıklayarak EEG görüntünüzü yükleyebilirsiniz. 
                Sistemimiz PDF, JPEG ve PNG formatlarını desteklemektedir.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Hangi formatlarda dosya yükleyebilirim?
              </h3>
              <p className="text-gray-600">
                Sistemimiz aşağıdaki formatları desteklemektedir:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 ml-4">
                <li>PDF (Çok sayfalı EEG kayıtları için)</li>
                <li>JPEG</li>
                <li>PNG</li>
                <li>DICOM</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Analiz sonuçlarını nasıl görüntüleyebilirim?
              </h3>
              <p className="text-gray-600">
                Analiz tamamlandıktan sonra sonuçlar otomatik olarak ekranda görüntülenecektir. 
                Ayrıca Raporlar sayfasından geçmiş analizlerinize de ulaşabilirsiniz.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Maksimum dosya boyutu nedir?
              </h3>
              <p className="text-gray-600">
                Sistemimiz maksimum 100MB boyutunda dosya yüklemeyi desteklemektedir. 
                Daha büyük dosyalar için lütfen dosyanızı sıkıştırın veya bölün.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Analiz sonuçlarını nasıl yorumlayabilirim?
              </h3>
              <p className="text-gray-600">
                Analiz sonuçları aşağıdaki kategorilerde sunulmaktadır:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 ml-4">
                <li>Zemin Aktivitesi</li>
                <li>Anormal Bulgular</li>
                <li>Artefaktlar</li>
                <li>Sonuç ve Öneriler</li>
              </ul>
              <p className="text-gray-600 mt-2">
                Her bulgu için detaylı açıklama ve konum bilgisi sağlanmaktadır.
              </p>
            </div>
          </div>
        </div>

        {/* İletişim Bölümü */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Hala Sorunuz mu Var?
          </h2>
          <p className="text-indigo-100 mb-6">
            Teknik destek ekibimiz size yardımcı olmaktan mutluluk duyacaktır.
          </p>
          <a
            href="mailto:destek@eegai.com"
            className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-indigo-600 transition-colors duration-200"
          >
            Bize Ulaşın
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
} 