import Header from '@/components/Header';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#f6f8ff]">
      <Header />
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-indigo-600 mb-6 leading-tight">
          EEG Analizinde Yapay Zeka
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 mb-10">
          EEG kayıtlarınızı yapay zeka ile analiz edin, epileptiform aktiviteleri tespit edin ve detaylı raporlar alın.
        </p>
        <a
          href="/eeg-analiz"
          className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-500 shadow-lg hover:from-indigo-700 hover:to-purple-600 transition-all duration-300"
        >
          Hemen Başla
          <svg className="ml-3 -mr-1 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </section>

      {/* Özellikler */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-100">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Epileptiform Aktivite Tespiti</h3>
            <p className="text-gray-600 text-base leading-relaxed">
              EEG kayıtlarınızda epileptiform aktiviteleri otomatik olarak tespit edin.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-100">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Artefakt Analizi</h3>
            <p className="text-gray-600 text-base leading-relaxed">
              Kas, göz ve elektrot kaynaklı artefaktları kolayca analiz edin.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-100">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Detaylı Raporlama</h3>
            <p className="text-gray-600 text-base leading-relaxed">
              Tüm bulguları içeren kapsamlı ve anlaşılır raporlar alın.
            </p>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır? */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Nasıl Çalışır?</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            EEGAI ile analiz süreci sadece 3 adımda tamamlanır. Hızlı, kolay ve güvenilir EEG analizi için aşağıdaki adımları takip edin.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center border border-gray-100 transition-transform hover:-translate-y-2 hover:shadow-indigo-200 duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
              <span className="text-3xl font-extrabold text-white">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">EEG Görüntüsü Yükleyin</h3>
            <p className="text-gray-600 text-base leading-relaxed">
              EEG kaydınızı PDF veya görüntü formatında sisteme yükleyin.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center border border-gray-100 transition-transform hover:-translate-y-2 hover:shadow-indigo-200 duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
              <span className="text-3xl font-extrabold text-white">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Yapay Zeka Analizi</h3>
            <p className="text-gray-600 text-base leading-relaxed">
              Sistemimiz görüntüyü analiz eder ve bulguları tespit eder.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center border border-gray-100 transition-transform hover:-translate-y-2 hover:shadow-indigo-200 duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
              <span className="text-3xl font-extrabold text-white">3</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Sonuçları Görüntüleyin</h3>
            <p className="text-gray-600 text-base leading-relaxed">
              Detaylı analiz raporunu ve bulguları görüntüleyin.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Hemen Başlayın
            </h2>
            <p className="text-xl sm:text-2xl text-indigo-100 mb-8">
              EEGAI ile EEG analizlerinizi hızlı ve doğru bir şekilde gerçekleştirin.
            </p>
            <a
              href="/eeg-analiz"
              className="inline-flex items-center px-10 py-5 border-2 border-white text-lg font-semibold rounded-xl text-white bg-transparent hover:bg-white hover:text-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Ücretsiz Deneyin
              <svg className="ml-3 -mr-1 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
