import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp,
  getDoc,
  doc,
  updateDoc,
  where,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface PageAnalysis {
  pageNumber: number;
  imageUrl: string;
  analysis: any;
  comment?: string;
  timestamp: Date;
  id?: string;
}

interface FileRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  pageCount: number;
  uploadDate: Date;
  analyses: PageAnalysis[];
  patientInfo?: {
    name: string;
    id: string;
    age: string;
    gender: string;
    notes: string;
  };
  analyzedPagesCount: number;
}

export const fileService = {
  async uploadFile(file: File): Promise<string> {
    try {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const timestamp = Date.now();
      const path = `pdfs/${timestamp}_${safeFileName}`;
      
      const storageRef = ref(storage, path);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'originalName': file.name
        }
      };

      console.log('Uploading file to:', path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('File uploaded successfully');
      
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log('File URL:', downloadUrl);
      return downloadUrl;
    } catch (error: any) {
      console.error('Dosya yükleme hatası:', error);
      if (error.code === 'storage/unauthorized') {
        throw new Error('Dosya yükleme izni reddedildi. Lütfen yetkilendirme ayarlarını kontrol edin.');
      }
      throw new Error(`Dosya yüklenirken bir hata oluştu: ${error.message}`);
    }
  },

  async saveFileRecord(
    fileName: string, 
    fileUrl: string, 
    pageCount: number,
    patientInfo?: {
      name: string;
      id: string;
      age: string;
      gender: string;
      notes: string;
    }
  ): Promise<string> {
    try {
      console.log('Saving file record:', { fileName, fileUrl, pageCount, patientInfo });
      
      // Firestore bağlantısını kontrol et
      if (!db) {
        console.error('Firestore bağlantısı bulunamadı');
        throw new Error('Firestore bağlantısı bulunamadı');
      }

      console.log('Firestore bağlantısı mevcut, koleksiyon oluşturuluyor...');
      const filesCollection = collection(db, 'files');
      
      const fileData = {
        fileName,
        fileUrl,
        pageCount,
        uploadDate: serverTimestamp(),
        analyses: [],
        patientInfo: patientInfo || null
      };

      console.log('Dosya verisi hazırlandı:', fileData);
      
      // Firestore'a yazma işlemi
      console.log('Firestore\'a yazma işlemi başlıyor...');
      const docRef = await addDoc(filesCollection, fileData);
      console.log('Dosya kaydı oluşturuldu, ID:', docRef.id);

      // Kaydedilen veriyi kontrol et
      console.log('Kaydedilen veri kontrol ediliyor...');
      const savedDoc = await getDoc(docRef);
      if (!savedDoc.exists()) {
        console.error('Dosya kaydı bulunamadı');
        throw new Error('Dosya kaydı oluşturulamadı');
      }

      const savedData = savedDoc.data();
      console.log('Kaydedilen veri:', savedData);

      // Veriyi kontrol et
      if (!savedData.fileUrl) {
        console.error('Dosya URL\'si kaydedilmemiş');
        throw new Error('Dosya URL\'si kaydedilemedi');
      }

      console.log('Dosya kaydı başarıyla tamamlandı');
      return docRef.id;
    } catch (error: any) {
      console.error('Dosya kaydı oluşturma hatası:', error);
      console.error('Hata detayları:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      if (error.code === 'permission-denied') {
        throw new Error('Firestore yazma izni reddedildi. Lütfen güvenlik kurallarını kontrol edin.');
      }
      throw new Error(`Dosya kaydı oluşturulamadı: ${error.message}`);
    }
  },

  async savePageAnalysis(
    fileId: string,
    pageNumber: number,
    imageUrl: string,
    analysis: any,
    comment?: string
  ): Promise<void> {
    try {
      console.log('Saving analysis for page:', pageNumber, 'fileId:', fileId);
      
      const analysesRef = collection(db, 'files', fileId, 'analyses');
      const q = query(analysesRef, where('pageNumber', '==', pageNumber));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(db, 'files', fileId, 'analyses', snapshot.docs[0].id);
        await updateDoc(docRef, {
          analysis,
          comment,
          timestamp: serverTimestamp()
        });
        console.log('Existing analysis updated');
      } else {
        await addDoc(analysesRef, {
          pageNumber,
          imageUrl,
          analysis,
          comment,
          timestamp: serverTimestamp()
        });
        console.log('New analysis saved');
      }
    } catch (error) {
      console.error('Analiz kaydedilirken hata:', error);
      throw new Error(`Analiz kaydedilemedi: ${error}`);
    }
  },

  async getFileHistory(): Promise<FileRecord[]> {
    try {
      const q = query(collection(db, 'files'), orderBy('uploadDate', 'desc'));
      const snapshot = await getDocs(q);
      console.log('Retrieved file history, count:', snapshot.size);
      
      const files = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        // Her dosya için analizleri al
        const analysesSnapshot = await getDocs(collection(db, 'files', doc.id, 'analyses'));
        const analyses = analysesSnapshot.docs.map(analysisDoc => ({
          pageNumber: analysisDoc.data().pageNumber,
          imageUrl: analysisDoc.data().imageUrl,
          analysis: analysisDoc.data().analysis,
          comment: analysisDoc.data().comment,
          timestamp: analysisDoc.data().timestamp?.toDate?.() || new Date()
        }));
        
        console.log('File data:', data); // Debug için
        return {
          id: doc.id,
          ...data,
          analyses, // Analizleri ekle
          analyzedPagesCount: analyses.length,
          uploadDate: data.uploadDate?.toDate?.() || new Date(data.uploadDate) || new Date()
        } as FileRecord;
      }));
      
      return files;
    } catch (error: any) {
      console.error('Dosya geçmişi alma hatası:', error);
      throw new Error(`Dosya geçmişi alınamadı: ${error.message}`);
    }
  },

  async getFileWithAnalyses(fileId: string): Promise<FileRecord & { analyses: PageAnalysis[] }> {
    try {
      const fileDoc = await getDoc(doc(db, 'files', fileId));
      if (!fileDoc.exists()) {
        throw new Error('Dosya bulunamadı');
      }

      const fileData = fileDoc.data();
      console.log('File data:', fileData); // Debug için
      
      // Analizleri al
      const analysesSnapshot = await getDocs(
        query(
          collection(db, 'files', fileId, 'analyses'),
          orderBy('pageNumber', 'asc')
        )
      );

      const analyses = analysesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PageAnalysis[];

      return {
        id: fileDoc.id,
        ...fileData,
        uploadDate: fileData.uploadDate?.toDate() || new Date(),
        analyses
      } as FileRecord & { analyses: PageAnalysis[] };
    } catch (error: any) {
      console.error('Dosya detayları alınırken hata:', error);
      throw new Error(`Dosya detayları alınamadı: ${error.message}`);
    }
  },

  async deleteFileRecord(fileId: string): Promise<void> {
    try {
      // Analiz alt koleksiyonundaki tüm dökümanları sil
      const analysesRef = collection(db, 'files', fileId, 'analyses');
      const analysesSnapshot = await getDocs(analysesRef);
      for (const docSnap of analysesSnapshot.docs) {
        await deleteDoc(docSnap.ref);
      }
      // Dosya ana kaydını sil
      await deleteDoc(doc(db, 'files', fileId));
    } catch (error) {
      console.error('Rapor silinirken hata:', error);
      throw new Error('Rapor silinemedi');
    }
  }
}; 