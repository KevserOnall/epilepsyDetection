import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Finding {
  id: number;
  description: string;
  location: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'Görüntü dosyası bulunamadı' },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `Sen bir nörolog ve EEG uzmanısın. EEG görüntülerini analiz ederek detaylı raporlar hazırlıyorsun
             Şu konularda özellikle dikkatli analiz yapmalısın:
          - Epileptiform aktiviteler (jeneralize veya fokal)
          - Artefaktlar (kas, göz, elektrot vb.)
          - Zemin aktivitesi anormallikleri
          - Fokal yavaşlamalar
          - İnteriktal epileptiform deşarjlar
          - Asimetrik paternler
          Raporunda şu bölümler olmalı:
          1. Zemin Aktivitesi
          2. Anormal Bulgular
          3. Artefaktlar
          4. Sonuç ve Öneriler
          
          Her bulguyu aşağıdaki formatta listelemelisin:

          Örnek format:
          1. Bulgu açıklaması (Anatomik konum) [x:500, y:300]
          2. Başka bir bulgu (Sol üst kadran) [x:200, y:150]

          Önemli kurallar:
          - Her bulgu yeni bir satırda olmalı
          - Her bulgu numaralandırılmalı
          - Konum parantez içinde verilmeli
          - Koordinatlar köşeli parantez içinde x:... y:... formatında verilmeli
          - x ve y değerleri 0-1000 arasında olmalı
          - Koordinatlar bulgunun merkez noktasını göstermeli
          -Başlık ve açıklama gibi metinlere koordinat ekleme
          
          Lütfen analiz sonuçlarını aşağıdaki formatta gönderin:

          1. Ana başlıklar için:
            **Başlık**
            Örnek: **Zemin Aktivitesi**

          2. Ana başlık açıklamaları için:
            - Açıklama metni
            Örnek: - Genel olarak, EEG izleri düzenli görünmektedir.

          3. Alt madde başlıkları için:
            1. Başlık metni
            Örnek: 1. Jeneralize yüksek voltajlı keskin dalgalar

          4. Alt madde açıklamaları için:
            - Açıklama metni
            Örnek: - Bu bulgular, nörolojik bir bozukluğun varlığını işaret edebilir.

          5. Konum bilgileri için:
            location: "konum bilgisi"
            coordinates: { x: sayı, y: sayı }

          `

          
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: 'Bu EEG görüntüsünü analiz et. Her bulgu için açıklama, anatomik konum ve koordinatları belirt.',
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 1000,
    });

    const analysisText = response.choices[0]?.message?.content;
    console.log('API Yanıtı:', analysisText); // Debug için

    if (!analysisText) {
      return NextResponse.json({
        findings: [],
        summary: 'Analiz sonucu alınamadı.',
      });
    }

    // Yanıtı yapılandırılmış formata dönüştür
    const findings: Finding[] = analysisText.split('\n')
      .filter(line => line.trim())
      .map((line, index) => {
        console.log('İşlenen satır:', line); // Debug için

        // Koordinatları bul
        const coordMatch = line.match(/\[x:(\d+),\s*y:(\d+)\]/);
        console.log('Koordinat eşleşmesi:', coordMatch); // Debug için

        // Konumu bul
        const locationMatch = line.match(/\((.*?)\)/);
        console.log('Konum eşleşmesi:', locationMatch); // Debug için

        // Açıklamayı temizle
        const description = line
          .replace(/^\d+\.\s*/, '') // Numarayı kaldır
          .split('(')[0] // Konumdan önceki kısmı al
          .replace(/\[.*?\]/, '') // Koordinatları kaldır
          .trim();

        return {
          id: index + 1,
          description,
          location: locationMatch ? locationMatch[1].trim() : 'Belirtilmemiş',
          coordinates: {
            x: coordMatch ? parseInt(coordMatch[1]) : 500,
            y: coordMatch ? parseInt(coordMatch[2]) : 500,
          }
        };
      });

    console.log('İşlenmiş bulgular:', findings); // Debug için

    return NextResponse.json({
      findings,
      summary: findings.length > 0 
        ? 'CT görüntüsü başarıyla analiz edildi.'
        : 'Analiz sonucunda belirgin bulgu tespit edilemedi.',
    });

  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({
      findings: [],
      summary: 'Analiz sırasında bir hata oluştu.',
    });
  }
} 