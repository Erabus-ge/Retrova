# RETROVA — 90’lar Dünyası

## Tek sayfa ana sayfa

90’lar içeriği artık `index.html` içinde `#dunya90` bölümünde de bulunur. Üst menüdeki dönem bağlantıları aynı sayfada ilgili alana kaydırır. Mevcut dönem kartları, genel video formu, ürün alanı ve diğer içerikler korunmuştur. Eski `90lar.html` adresi de çalışmaya devam eder.

`index.html`, ortak `style.css` ve `script.js` yanında `90lar.css` ve `90lar.js` dosyalarını yükler. 90’lar JavaScript’i bölüm köküne bağlıdır; hareket durdurma diğer dönemlere uygulanmaz. Ürün penceresinin kapatma düğmeleri kendi penceresiyle sınırlanmıştır; Shorts penceresi bağımsız kapanır. Ses yalnızca 90’ları Başlat düğmesine basınca oluşur.

Yerel önizleme: `http://localhost:8080/index.html`. Sunucunun açık olması gerekir. Ana sayfanın kodu ile ayrı 90’lar sayfasının HTML içeriği iki yerde bulunduğundan, ileride yeni bir 90’lar içerik değişikliği yaparken ikisi de güncellenmelidir; CSS ve JavaScript ortaktır. GitHub ve alan adı ayarları değiştirilmemiştir.

## Yeni anı albümü ve zaman çizelgesi

“90'LARDAN ANILAR” alanında televizyon, VHS, taşınabilir kasetçalar, atari salonu, mahalle oyunları ve sokak için altı özgün CSS sahnesi bulunur. Bunlar fotoğraf yerine kullanılan, açıklamalı geçici görsel alanlarıdır. Harici fotoğraf indirilmez. Fareyle kartların üzerine gelince hafif büyüme uygulanır; telefonlarda dokunma gerektiren gizli içerik yoktur.

“Kanal değiştir” düğmesi beş tematik kanal arasında döner ve kısa bir yayın geçişi oynatır. Ses başlatmaz; mevcut açılış düğmesi sesin tek başlatıcısı olarak kalır. 1990–1999 yıl düğmeleri seçilen yıla ait temsili anıyı gösterir. Bu metinler tarihsel olay iddiası içermez. Klavyede Tab ve Enter/Boşluk ile kullanılabilir.

“90'LAR VİDEO ODASI”, mevcut Shorts galerisidir; aşağıdaki video ekleme yönergeleri geçerlidir. Değişiklikler yereldir, yayınlanmadı.

`90lar.html` dosyasını tarayıcıda aç veya ana sayfanın altındaki **90’lar Dünyası’na gir** bağlantısını kullan. Bu bölüm ayrı HTML/CSS/JavaScript dosyalarında çalışır; ana sayfanın mevcut anı düğmeleri, video formu ve ürün pencereleri değiştirilmedi. Alan adı ve barındırma kimliği ayarlarına dokunulmadı. GitHub’a dosya gönderilmedi ve yayın yapılmadı.

## Giriş, hareket ve ses

- Başlık giriş animasyonu, yüzen VHS/müzik kasetleri, eski televizyon ve atari kumandası kodla çizildi. Harici resim veya video arka planı indirilmez.
- **90’ları Başlat** televizyon açılışı ve VHS tarama efektini oynatır. Aynı düğmeye basınca kısa, düşük seviyeli, Web Audio ile üretilen özgün elektronik sesler duyulur. Telifli müzik veya hazır ses kaydı kullanılmaz.
- Sayfa açılışında ses çalmaz. **Ses efektleri: kapalı** ile efektleri kapatabilirsin; bu ayar YouTube oynatıcısının sesini yönetmez.
- **Hareketi durdur** animasyonları duraklatır. Cihazın “hareketi azalt” ayarı etkinse animasyonlar kapalı kalır. Anılar ve galeri bu tercihten bağımsız çalışır.
- Animasyonlar transform/opacity üzerinden çalışır; sürekli JavaScript çizim döngüsü bulunmaz. Sekme gizlenince hareket ve kısa ses durur; açık video kapatılır.

## Herkese açık Shorts seçkisini ekleme

`90lar.js` dosyasının başındaki `RETROVA_SHORTS` listesine kendi videolarını aşağıdaki biçimde ekle. Buradaki `VIDEO_KIMLIGI` bir yer tutucudur; gerçek videonun 11 karakterlik kimliği ile değiştirilmelidir.

```js
const RETROVA_SHORTS = [
  { title: 'Bizim 90’lar anımız', url: 'https://www.youtube.com/shorts/VIDEO_KIMLIGI' }
];
```

En fazla 12 herkese açık video gösterilir. Shorts, youtu.be ve standart YouTube video bağlantıları kabul edilir. Geçersiz bağlantılar seçkiye alınmaz. Kendi videolarını veya paylaşım iznin olan içerikleri kullan.

Sayfadaki **Kendi Shorts bağlantını dene** alanı bir önizleme aracıdır: eklenen en fazla 12 video yalnızca o tarayıcıda saklanır. Başka ziyaretçilerde görünmez, sunucuya yüklenmez. Tarayıcı depolaması kapalıysa o oturumda çalışır. Herkese açık seçki için yukarıdaki kaynak listesini düzenle.

Oynatıcı yalnızca **Videoyu aç** düğmesine basınca oluşturulur. Video kendiliğinden oynamaz. Pencereyi çarpı veya Escape ile kapatınca iframe kaldırılır, oynatma biter. Gömülü oynatmaya kapalı içerikler için **YouTube’da aç** bağlantısı vardır. İnternet bağlantısı gerekir.

## Yayın paketi

GitHub Pages iş akışına `90lar.html`, `90lar.css`, `90lar.js` eklendi. İş akışı hâlâ yalnızca elle çalıştırılır. Alan adı, ana sayfa stil dosyası ve mevcut `script.js` korunur. Yeni sayfa temel `style.css` dosyasını da kullandığından bu dosyaları birlikte tut.

## Kontrol

JavaScript sözdizimi, dosya/çapa bağlantıları, açılışta sessizlik, hareket azaltma, video adresi doğrulaması ve galeri işlevleri kod düzeyinde kontrol edilir. Gerçek cihazda son kontrol için 320/390 px telefon, 768 px tablet ve masaüstünde sayfayı aç; başlatma, sessize alma, hareket durdurma ve gerçek bir Shorts videosunu oynatma/kapatma işlemlerini dene. Bu geliştirmede tarayıcı üzerinden görsel doğrulama tamamlanmadı.
