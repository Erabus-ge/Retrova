'use strict';

// Her dönemin küçük anısı, kendi kartında açılır ve kapanır.
document.querySelectorAll('.memory-button').forEach(button => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
    button.querySelector('span').textContent = expanded ? '+' : '−';
  });
});

// Yalnızca tanınan YouTube adreslerinden geçerli video kimliğini al.
function youtubeId(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let id = null;
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else if (/^\/(shorts|embed|live)\//.test(url.pathname)) id = url.pathname.split('/')[2];
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

const videoForm = document.getElementById('video-form');
const videoInput = document.getElementById('video-url');
const videoMessage = document.getElementById('video-message');
videoForm.addEventListener('submit', event => {
  event.preventDefault();
  const id = youtubeId(videoInput.value.trim());
  if (!id) {
    videoMessage.textContent = 'Geçerli bir YouTube video bağlantısı gir. Örneğin youtube.com/watch?v=… veya youtu.be/…';
    videoInput.setAttribute('aria-invalid', 'true');
    videoInput.focus();
    return;
  }
  videoInput.removeAttribute('aria-invalid');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}`;
  iframe.title = 'RETROVA YouTube video oynatıcısı';
  iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  document.getElementById('video-stage').replaceChildren(iframe);
  const link = document.getElementById('youtube-link');
  link.href = `https://www.youtube.com/watch?v=${id}`;
  link.hidden = false;
  videoMessage.textContent = 'Oynatıcı hazır. Videoyu başlatmak için oynat düğmesine bas.';
});

const productDialog = document.getElementById('product-dialog');
document.querySelectorAll('.product-button').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('product-title').textContent = button.dataset.product;
    productDialog.showModal();
  });
});
document.querySelectorAll('.dialog-close, .dialog-done').forEach(button => {
  button.addEventListener('click', () => productDialog.close());
});
