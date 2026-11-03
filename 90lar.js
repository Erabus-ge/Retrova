(() => {
'use strict';

// Herkese açık seçki: kendi Shorts video bağlantılarınızı ekleyin.
// Örnek biçim: { title: 'Video başlığı', url: 'https://www.youtube.com/shorts/VIDEO_KIMLIGI' }
// Boş liste, gerçek video varmış gibi davranmayan üç tasarım kartı gösterir.
const RETROVA_SHORTS = [
  { title: 'RETROVA Shorts · 01', url: 'https://www.youtube.com/embed/JJ1EOpfJd6o' },
  { title: 'RETROVA Shorts · 02', url: 'https://www.youtube.com/embed/eG-Ls7oziBo' }
];
const storageKey90 = 'retrova-shorts-90-v1';
const root90 = document.querySelector('[data-world90]') || document.body;
const body90 = root90;
const get90 = id => root90.querySelector('#' + id);
const motionPreference90 = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton90 = get90('motion90');
let paused90 = motionPreference90.matches;
let muted90 = false;
let audio90 = null;
let audioTimer90;
let bootTimer90;
let soundRequest90 = 0;
const hero90 = root90.querySelector('.n90-hero');
const status90 = get90('status90');

function updateMotion90() {
  body90.classList.toggle('motion-paused', paused90 || motionPreference90.matches);
  motionButton90.setAttribute('aria-pressed', String(paused90 || motionPreference90.matches));
  motionButton90.textContent = paused90 || motionPreference90.matches ? 'Hareket: duraklatıldı' : 'Hareketi durdur';
}
motionButton90.addEventListener('click', () => {
  if (motionPreference90.matches) {
    status90.textContent = 'Cihazının hareket azaltma tercihi etkin. Animasyonlar kapalı tutuluyor.';
    return;
  }
  paused90 = !paused90;
  updateMotion90();
});
motionPreference90.addEventListener('change', () => { paused90 = motionPreference90.matches; updateMotion90(); });
updateMotion90();

async function stopAudio90() {
  clearTimeout(audioTimer90);
  const old = audio90;
  audio90 = null;
  if (old && old.state !== 'closed') { try { await old.close(); } catch { /* Ses zaten kapatılmış olabilir. */ } }
}

// Özgün, çok kısa elektronik açılış efektleri; harici ses veya müzik indirilmez.
async function bootSound90() {
  const request = ++soundRequest90;
  await stopAudio90();
  if (request !== soundRequest90 || muted90 || document.hidden) return;
  const AudioConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioConstructor) { status90.textContent = '90’lar başladı. Bu tarayıcı ses efektlerini desteklemiyor.'; return; }
  try {
    const context = new AudioConstructor();
    audio90 = context;
    await context.resume();
    if (audio90 !== context || muted90 || document.hidden) { if (context.state !== 'closed') await context.close(); return; }
    const start = context.currentTime;
    // Kısa frekans süpürmesi ve elektronik darbeler: müzik içermeyen özgün açılış.
    [120, 280, 560, 840].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const time = start + index * 0.14;
      oscillator.type = index === 0 ? 'sawtooth' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, time);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * (index === 0 ? 2 : 0.6), time + 0.13);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.018 : 0.035, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(time); oscillator.stop(time + 0.16);
    });
    audioTimer90 = setTimeout(stopAudio90, 850);
  } catch { await stopAudio90(); status90.textContent = '90’lar başladı. Ses efekti bu tarayıcıda açılamadı; sessiz devam edebilirsin.'; }
}

get90('start90').addEventListener('click', () => {
  const scene = root90.querySelector('.n90-scene');
  scene.classList.remove('is-booting');
  hero90.classList.remove('is-starting');
  clearTimeout(bootTimer90);
  if (!paused90 && !motionPreference90.matches) {
    void scene.offsetWidth;
    scene.classList.add('is-booting');
    hero90.classList.add('is-starting');
    bootTimer90 = setTimeout(() => {
      scene.classList.remove('is-booting');
      hero90.classList.remove('is-starting');
    }, 1700);
  }
  get90('screen90').textContent = 'PLAY ▶ · KANAL 90';
  status90.textContent = muted90 ? '90’lar başladı. Ses efektleri kapalı.' : '90’lar başladı. Anılar ve kasetlik seni bekliyor!';
  // AudioContext yalnızca ziyaretçinin bu düğmeye basmasıyla oluşturulur.
  void bootSound90();
});
get90('mute90').addEventListener('click', event => {
  muted90 = !muted90;
  event.currentTarget.setAttribute('aria-pressed', String(muted90));
  event.currentTarget.textContent = muted90 ? 'Ses efektleri: kapalı' : 'Ses efektleri: açık';
  if (muted90) void stopAudio90();
});
document.addEventListener('visibilitychange', () => {
  body90.classList.toggle('is-hidden', document.hidden);
  if (document.hidden) { void stopAudio90(); closeVideo90(); }
});
window.addEventListener('pagehide', () => { void stopAudio90(); closeVideo90(); });

// Görünmeyen giriş sahnesini çizdirmeyerek mobil cihazlarda gereksiz işi azalt.
if ('IntersectionObserver' in window) {
  const heroObserver90 = new IntersectionObserver(entries => {
    hero90.classList.toggle('n90-offscreen', !entries[0].isIntersecting);
  }, { threshold: 0 });
  heroObserver90.observe(hero90);
}

function shortsId90(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let id;
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (['youtube.com', 'm.youtube.com'].includes(host)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : /^\/(shorts|embed|live)\//.test(url.pathname) ? url.pathname.split('/')[2] : null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
function cleanVideos90(list) {
  return Array.isArray(list) ? list.filter(item => item && typeof item.title === 'string' && typeof item.url === 'string' && shortsId90(item.url)).slice(0, 12).map(item => ({title: item.title.slice(0, 70), url: item.url})) : [];
}
let personal90 = [];
try { personal90 = cleanVideos90(JSON.parse(localStorage.getItem(storageKey90) || '[]')); } catch { /* Gizli modda depolama kullanılamayabilir. */ }
const gallery90 = get90('shorts-grid');
const dialog90 = get90('shorts-dialog');
const player90 = get90('shorts-player');
let returnFocus90 = null;

function closeVideo90() {
  player90.replaceChildren();
  if (dialog90.open) dialog90.close();
}
function openVideo90(video, source) {
  const id = shortsId90(video.url);
  if (!id) return;
  returnFocus90 = source;
  const iframe = document.createElement('iframe');
  // Resmî YouTube oynatıcısı; yalnızca kart tıklanınca oluşturulur.
  iframe.src = `https://www.youtube.com/embed/${id}?autoplay=0&playsinline=1&controls=1`;
  iframe.title = video.title;
  iframe.allow = 'encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.setAttribute('aria-describedby', 'shorts-playback-help');
  get90('shorts-dialog-title').textContent = video.title;
  player90.replaceChildren(iframe);
  dialog90.showModal();
}
get90('close-shorts').addEventListener('click', closeVideo90);
dialog90.addEventListener('close', () => { player90.replaceChildren(); returnFocus90?.focus(); });

function renderGallery90() {
  gallery90.replaceChildren();
  const selectedVideos = cleanVideos90(RETROVA_SHORTS);
  const placeholders = ['Radyodan kaydedilen günler', 'Bir jetonluk mutluluk', 'Sokağın son oyunu'];
  // İlk üç alan sabittir; kişisel deneme videoları boş üçüncü alanı kapatmaz.
  const slots = Array.from({ length: Math.max(3, selectedVideos.length) }, (_, index) =>
    selectedVideos[index] || { title: placeholders[index] || 'Yeni video alanı' }
  );
  [...slots, ...personal90].forEach((video, index) => {
    const article = document.createElement('article'); article.className = 'n90-short';
    // Dinamik başlıklar HTML olarak işlenmez.
    const poster = document.createElement('div'); poster.className = 'n90-short-poster'; poster.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); label.textContent = 'RETROVA / SHORTS';
    const number = document.createElement('b'); number.className = 'n90-short-number'; number.textContent = String(index + 1).padStart(2, '0');
    const play = document.createElement('span'); play.className = 'n90-short-play'; play.textContent = video.url ? '▶' : '+';
    const caption = document.createElement('small'); caption.textContent = video.url ? 'DİKEY HATIRA / 9:16' : 'BU KASET SİZİN VİDEONUZU BEKLİYOR';
    poster.append(label, number, play, caption);
    const body = document.createElement('div'); body.className = 'n90-short-body';
    const heading = document.createElement('h3'); heading.textContent = video.title;
    const info = document.createElement('p'); info.textContent = video.url ? 'RETROVA video seçkisi · YouTube' : 'Örnek galeri alanı. Henüz video eklenmedi.';
    const button = document.createElement('button'); button.type = 'button'; button.textContent = video.url ? 'Videoyu aç ▶' : 'Bir Shorts ekle +';
    button.setAttribute('aria-label', `${video.title}: ${video.url ? 'videoyu aç' : 'video ekle'}`);
    button.addEventListener('click', () => {
      if (video.url) openVideo90(video, button);
      else { root90.querySelector('.n90-editor').open = true; get90('shorts-url').focus(); }
    });
    body.append(heading, info, button); article.append(poster, body); gallery90.append(article);
  });
}
function savePersonal90() {
  try { localStorage.setItem(storageKey90, JSON.stringify(personal90)); return true; } catch { return false; }
}
get90('shorts-form').addEventListener('submit', event => {
  event.preventDefault();
  const title = get90('shorts-title').value.trim();
  const field = get90('shorts-url');
  const url = field.value.trim();
  const status = get90('shorts-status');
  if (!title || !shortsId90(url)) { status.textContent = 'Bir başlık ve geçerli bir YouTube video bağlantısı gir.'; field.setAttribute('aria-invalid', 'true'); field.focus(); return; }
  if (personal90.length >= 12) { status.textContent = 'Kişisel kasetliğin en fazla 12 video alabilir. Yeni video eklemek için kişisel listeyi temizle.'; return; }
  field.removeAttribute('aria-invalid');
  personal90.push({title, url});
  const saved = savePersonal90(); renderGallery90(); event.currentTarget.reset();
  status.textContent = saved ? 'Video bu tarayıcıdaki kasetliğine eklendi. Herkese açık seçki değişmedi.' : 'Video bu oturum için eklendi; tarayıcı kalıcı kayda izin vermiyor.';
});
get90('clear-shorts').addEventListener('click', () => {
  personal90 = []; const saved = savePersonal90(); renderGallery90();
  get90('shorts-status').textContent = saved ? 'Bu tarayıcıya eklenen videolar temizlendi.' : 'Oturumdaki liste temizlendi; tarayıcı depolamasına erişilemiyor.';
});
renderGallery90();

// Kanal geçişi sessizdir; mevcut açılış sesine ve düğmesine dokunmaz.
const channels90 = ['RETROVA', 'MÜZİK SAATİ', 'ÇİZGİ FİLM', 'OYUN KANALI', 'MAHALLE TV'];
let channelIndex90 = 0;
let channelTimer90;
const television90 = root90.querySelector('.n90-tv');
get90('channel90').addEventListener('click', () => {
  channelIndex90 = (channelIndex90 + 1) % channels90.length;
  get90('channel-label90').textContent = `CH ${channelIndex90 + 1} · STEREO`;
  get90('screen90').textContent = channels90[channelIndex90];
  get90('channel-status90').textContent = `Kanal ${channelIndex90 + 1} · ${channels90[channelIndex90]}`;
  television90.classList.remove('is-channeling');
  clearTimeout(channelTimer90);
  if (!paused90 && !motionPreference90.matches) {
    void television90.offsetWidth;
    television90.classList.add('is-channeling');
    channelTimer90 = setTimeout(() => television90.classList.remove('is-channeling'), 800);
  }
});

// Yıllara bağlanan temsili anılar; doğrulanmamış tarihsel iddialar içermez.
const yearStories90 = {
  1990: ['Pazar sabahı, televizyon karşısı.', 'Kahvaltı tepsisi hazır, çizgi film başlamak üzere. Evdeki en iyi yer televizyonun tam karşısı.'],
  1991: ['Radyonun başında kayıt nöbeti.', 'Parmağın kayıt tuşunda. Sunucu konuşmayı bitirsin, sevdiğin şarkının ilk saniyesi kaçmasın.'],
  1992: ['Mahallede maç var!', 'İki taş kaleyi kurmaya yetiyor. Takımlar belli, topu getiren arkadaşın gelmesi bekleniyor.'],
  1993: ['VHS etiketine büyük harflerle: SİLME!', 'En sevilen filmin kaseti rafta. İzlemeden önce başa sarmayı, bitince kutusuna koymayı unutma.'],
  1994: ['Cepte kaset, kulakta dünya.', 'Taşınabilir kasetçaların pili biraz azalmış. Yine de eve kadar aynı şarkıya bir kez daha yer var.'],
  1995: ['Son jeton, son bir deneme.', 'Atari salonunda herkes ekrana bakıyor. Rekoru geçmek için tek bir hakkın kaldı.'],
  1996: ['Teneffüsün küçük hazineleri.', 'Çantada defterler, cepte tasolar. Bir takas, bir oyun ve ders ziline kadar kalan birkaç dakika.'],
  1997: ['Seksek çizgileri henüz silinmedi.', 'Tebeşir avuçta, taş ilk karede. Sıranı beklerken hangi karede dengeni kaybettiğini konuşuyorsun.'],
  1998: ['Karışık kasetin B yüzü.', 'Bir arkadaş için seçilen şarkılar, kapağa yazılan küçük not. Bazen en iyi hediye kendi hazırladığındır.'],
  1999: ['Yeni binyıla bir hatıra bırak.', 'Birlikte çekilen fotoğrafın arkasına tarih yazılıyor. Yıllar geçse de o günün gülümsemesi kalıyor.']
};
root90.querySelectorAll('[data-year90]').forEach(button => {
  button.addEventListener('click', () => {
    const year = button.dataset.year90;
    const story = yearStories90[year];
    if (!story) return;
    root90.querySelectorAll('[data-year90]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    get90('year-number90').textContent = year;
    get90('year-title90').textContent = story[0];
    get90('year-copy90').textContent = story[1];
  });
});

})();
