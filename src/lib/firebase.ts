import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, enableIndexedDbPersistence, connectFirestoreEmulator, addDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Firebase console'dan alınan config bilgileri
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase yapılandırmasını kontrol et
console.log('Firebase yapılandırması:', {
  apiKey: firebaseConfig.apiKey ? 'Mevcut' : 'Eksik',
  authDomain: firebaseConfig.authDomain ? 'Mevcut' : 'Eksik',
  projectId: firebaseConfig.projectId ? 'Mevcut' : 'Eksik',
  storageBucket: firebaseConfig.storageBucket ? 'Mevcut' : 'Eksik',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Mevcut' : 'Eksik',
  appId: firebaseConfig.appId ? 'Mevcut' : 'Eksik'
});

// Gerekli alanları kontrol et
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

if (missingFields.length > 0) {
  throw new Error(`Firebase yapılandırması eksik: ${missingFields.join(', ')}`);
}

// Firebase uygulamasını başlat
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Firestore'u başlat
const db = getFirestore(app);

// Firestore ayarlarını yapılandır
const firestoreSettings = {
  experimentalForceLongPolling: true,
  useFetchStreams: false
};

// Firestore bağlantısını test et
const testFirestoreConnection = async () => {
  try {
    console.log('Firestore bağlantısı test ediliyor...');
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, { test: true });
    console.log('Firestore bağlantısı başarılı');
    return true;
  } catch (error) {
    console.error('Firestore bağlantı hatası:', error);
    return false;
  }
};

// Storage'ı başlat
const storage = getStorage(app);

export { db, storage }; 