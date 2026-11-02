# RETROVA — GitHub Pages hazırlığı

Bu site düz HTML, CSS ve JavaScript kullanır. Derleme, veritabanı veya ücretli sunucu gerekmez. Hazırlık yalnızca yerel dosyalarda yapıldı; GitHub deposu oluşturulmadı, dosyalar gönderilmedi ve site yayınlanmadı.

## Dosya yapısı

GitHub deposunun kökü, bilgisayarındaki **RETROVA klasörünün içeriği** olmalı. Üstteki `Codex Projelerim` klasörünü depo kökü olarak kullanma.

```text
index.html
style.css
script.js
.nojekyll
.gitignore
.github/
  workflows/
    pages.yml
```

Kılavuzlar depoda kalabilir; yayın paketi yalnızca yukarıdaki üç site dosyası ile `.nojekyll` dosyasını içerir. Görseller CSS ile çizilmiştir; ayrı görsel dosyası gerektirmez. İleride görsel eklersen yayın iş akışının kopyalama adımına ilgili klasörü de ekle.

`dist/` önceki tasarımdır; `.openai/` önceki barındırma ayarıdır. İkisi de bilgisayarda korunur, Git tarafından yok sayılır ve Pages paketine alınmaz. `.gitignore`, önceden Git takibine alınmış dosyaları takipten çıkarmaz.

## Hazır olduğunda yayınlama adımları

**Bu adımlar henüz uygulanmadı.**

1. Ücretsiz GitHub Pages kullanımı için GitHub hesabında `retrova` adlı **Public** bir depo oluştur. GitHub Free planında Pages, herkese açık depolarda kullanılabilir.
2. RETROVA klasörünün içeriğini, gizli `.github`, `.gitignore` ve `.nojekyll` dosyaları dahil, deponun köküne aktar. `dist` ve `.openai` klasörlerini yükleme. Windows Dosya Gezgini'nde gerekirse gizli öğeleri görünür yap. Bu işlem tek başına eklediğimiz iş akışını çalıştırmaz.
3. Yayınlamaya karar verdiğinde deponun **Settings → Pages → Build and deployment → Source** alanında **GitHub Actions** seç.
4. **Actions → RETROVA - GitHub Pages → Run workflow** üzerinden varsayılan daldaki iş akışını elle başlat. Bu adım siteyi yayınlar. GitHub bir ortam onayı isterse ilgili çalıştırmada onayla.
5. İşlem başarılı olunca bağlantıyı **Settings → Pages** veya iş akışının deployment sonucunda bulabilirsin. `retrova` adlı proje deposu için adres genellikle `https://KULLANICI-ADIN.github.io/retrova/` biçimindedir; GitHub'ın gösterdiği gerçek adresi kullan.

İş akışında `push` tetikleyicisi bulunmaz. Daha sonraki değişikliklerin yayınlanması için de **Run workflow** işlemini yeniden başlatman gerekir. Kaynak olarak “Deploy from a branch” seçmek bu hazırlıktaki elle yayınlama düzeninden farklıdır.

## Yerel kontrol

`index.html` dosyasına çift tıklayarak siteyi aç. Değişikliklerden sonra gerekirse Ctrl+F5 ile yenile.

- 320–390 piksel genişlikte başlığı, menüyü, retro çizimleri ve video alanını kontrol et.
- 768 piksel ve masaüstü genişliğinde kartları ve sütunları kontrol et.
- Dönem bağlantılarını, anı düğmelerini ve ürün pencerelerinin kapatılmasını dene.
- Video odasına bir YouTube bağlantısı ekle. İnternet ve videonun gömülü oynatmaya açık olması gerekir.
- Google Fonts yüklenmezse sistem yazı tipleri devreye girer.

## Yapılan kontroller ve sınırları

CSS/JS dosyalarının varlığı, bağlantılardaki dosya adlarının büyük/küçük harf uyumu, bölüm hedefleri, UTF-8 Türkçe metinler ve JavaScript sözdizimi kontrol edildi. CSS'teki 900 ve 650 piksel kırılımları incelendi; dar ekranlarda taşma riskini azaltan ek kurallar eklendi.

Tarayıcı otomasyonu açık sayfanın adresini doğrulayamadığından bu hazırlık sırasında masaüstü/mobil görsel kontrol tamamlanamadı. GitHub iş akışı da henüz çalıştırılmadı; gerçek yayın doğrulaması yayınlama gününde yapılmalıdır.

## Resmî kaynaklar

- [GitHub Pages özel iş akışları](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub'ın statik site iş akışı örneği](https://github.com/actions/starter-workflows/blob/main/pages/static.yml)
- [GitHub Pages hakkında ve plan uygunluğu](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)
