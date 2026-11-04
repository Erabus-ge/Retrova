(() => {
  'use strict';
  const root = document.getElementById('uyelik');
  if (!root) return;
  const el = id => root.querySelector('#' + id);
  const config = window.RETROVA_SUPABASE_CONFIG || {};
  const core = window.RetrovaMembership;
  const authStatus = el('community-auth-status');
  const draftStatus = el('community-draft-status');
  let client = null, user = null, mediaUrl = null;
  let authBusy = false, sending = false, verification = 0, blockedRetry = false;
  let subscription;
  let recovering = false;
  const messages = {
    invalid_draft: 'Dönem, görünen ad, başlık, anı metni ve paylaşım iznini kontrol et.',
    invalid_file: 'Fotoğraf JPG/PNG/WebP ve en fazla 5 MB; video MP4/WebM ve en fazla 20 MB olmalı.',
    file_signature: 'Dosyanın içeriği seçilen türle uyuşmuyor. Geçerli bir fotoğraf veya video seç.',
    verified_login_required: 'İşlem için e-postası doğrulanmış hesabınla yeniden giriş yap.',
    email_not_confirmed: 'Gönderim için önce e-posta adresini doğrula.',
    setup_required: 'Gönderim henüz açılmadı. Şema ve RLS doğrulaması bekleniyor.',
    upload_rejected: 'Dosya yüklenemedi. Storage izinlerini, boyut sınırını ve oturumunu kontrol et.',
    upload_unknown: 'Yüklemenin sonucu doğrulanamadı. Tekrar göndermeden önce yönetici kontrol etmeli.',
    save_rejected: 'Anı kaydedilemedi. Tablo alanları, izinler veya bağlantı kontrol edilmeli.',
    save_unknown: 'Kaydın sonucu doğrulanamadı; kayıt oluşmuş olabilir. Tekrar gönderme, yöneticiye danış.',
    session_changed: 'İşlem sırasında hesap değişti. Gönderim durduruldu.',
    session_check_failed: 'Oturum yeniden doğrulanamadığı için gönderim durduruldu.'
  };
  function render() {
    const loggedIn = Boolean(user);
    el('community-session').hidden = !loggedIn;
    el('community-session-label').textContent = loggedIn ? 'Doğrulanmış üye oturumu açık.' : '';
    el('community-signup-fields').disabled = !client || loggedIn || authBusy || sending;
    el('community-login-fields').disabled = !client || loggedIn || authBusy || sending;
    el('community-signout').disabled = authBusy || sending;
    el('community-send').disabled = !loggedIn || recovering || !core?.submissionsReady(config) || sending || authBusy || blockedRetry;
    el('community-recovery').hidden = !recovering;
    el('community-recovery-fields').disabled = !client || !recovering || authBusy;
    el('community-send').textContent = sending ? 'Onaya gönderiliyor…' : core?.submissionsReady(config) ? 'Onaya Gönder' : 'Onaya Gönder · kurulum bekliyor';
    el('community-send').setAttribute('aria-busy', String(sending));
    el('community-clear').disabled = sending;
    root.querySelectorAll('#community-draft input, #community-draft textarea, #community-draft select, #community-preview-button').forEach(field => { field.disabled = sending; });
  }
  function publicConfigValid() {
    try {
      const url = new URL(config.projectUrl);
      if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return false;
      return /^sb_publishable_[A-Za-z0-9_-]+$/.test(config.publishableKey || '');
    } catch { return false; }
  }
  async function syncUser() {
    const revision = ++verification;
    user = null; render();
    if (!client) return;
    try {
      const verified = await core.verifiedUser(client);
      if (revision === verification) user = verified;
    } catch (error) {
      if (revision === verification && error?.name !== 'AuthSessionMissingError' && error?.code !== 'verified_login_required') authStatus.textContent = authError(error);
    }
    if (revision === verification) render();
  }
  function redirectUrl() {
    const url = new URL('index.html', window.location.href);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('http_required');
    url.hash = 'uyelik'; return url.href;
  }
  function authError(error) {
    const code = error?.code;
    if (['otp_expired','otp_disabled','flow_state_expired','flow_state_not_found','bad_code_verifier','invalid_grant','validation_failed','bad_oauth_state'].includes(code) || error?.name === 'AuthPKCEGrantCodeExchangeError') return 'E-posta bağlantısı geçersiz, kullanılmış veya süresi dolmuş olabilir. Yeni bağlantı iste ve isteği yaptığın aynı tarayıcıda aç.';
    if (code === 'same_password') return 'Yeni şifren önceki şifrenden farklı olmalı.';
    if (code === 'session_not_found' || code === 'refresh_token_not_found' || error?.name === 'AuthSessionMissingError' || code === 'verified_login_required') return 'Oturum doğrulanamadı veya süresi doldu. Yeniden giriş yap; şifre yenilemek için yeni bağlantı iste.';
    if (error?.name === 'AuthRetryableFetchError' || error instanceof TypeError || error?.status >= 500) return 'Üyelik servisine şu anda ulaşılamıyor. İnternet bağlantını kontrol edip yeniden dene; e-posta doğrulamanın eksik olduğu anlamına gelmez.';
    if (code === 'email_not_confirmed') return 'E-postanı doğruladıktan sonra giriş yap. Gerekirse doğrulama e-postasını yeniden iste.';
    if (code === 'invalid_credentials') return 'E-posta veya şifre doğru değil.';
    if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Çok fazla deneme yapıldı. Bir süre bekleyip yeniden dene.';
    if (code === 'weak_password') return 'Şifre güvenlik koşullarını karşılamıyor. Daha güçlü bir şifre seç.';
    return 'İşlem tamamlanamadı. Bilgilerini ve bağlantını kontrol edip yeniden dene.';
  }
  async function runAuth(action) {
    if (!client || authBusy || sending) return;
    authBusy = true; render();
    try { await action(); }
    catch (error) { authStatus.textContent = authError(error); }
    finally { authBusy = false; render(); }
  }
  async function initializeAuth() {
    render();
    if (!core) { el('community-notice').textContent = 'Üyelik bileşeni yüklenemedi. Sayfayı yenile.'; return; }
    if (config.authEnabled !== true || !publicConfigValid()) {
      el('community-notice').textContent = 'Üyelik bağlantısı henüz yapılandırılmadı. Yalnızca yerel anı önizlemesi kullanılabilir.'; return;
    }
    if (!['http:', 'https:'].includes(window.location.protocol)) {
      el('community-notice').textContent = 'Üyelik için sayfayı localhost veya HTTPS üzerinden aç.'; return;
    }
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.118.0');
      client = createClient(config.projectUrl, config.publishableKey, {
        // PKCE kodunu aşağıda tek kez işleyerek bağlantı hatalarını kullanıcıya göster.
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' }
      });
      // Callback içinde Supabase çağrısını await etme; ayrı göreve bırak.
      const { data } = client.auth.onAuthStateChange(event => {
        if (event === 'PASSWORD_RECOVERY') recovering = true;
        if (event === 'SIGNED_OUT') recovering = false;
        verification++; user = null; render();
        setTimeout(() => { void syncUser(); }, 0);
      });
      subscription = data.subscription;
      const callback = new URL(window.location.href);
      const fragment = new URLSearchParams(callback.hash.slice(1));
      const callbackError = callback.searchParams.get('error_code') || fragment.get('error_code');
      const hasError = callbackError || callback.searchParams.has('error') || fragment.has('error');
      const code = callback.searchParams.get('code');
      if (hasError || code) {
        try {
          if (hasError) throw { code: callbackError || 'otp_expired' };
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!recovering) authStatus.textContent = 'E-posta bağlantısı doğrulandı. Hesabınla giriş yapabilirsin.';
        } catch (error) { authStatus.textContent = authError(error); }
        finally {
          ['code','error','error_code','error_description','error_uri'].forEach(key => callback.searchParams.delete(key));
          callback.hash = 'uyelik';
          window.history?.replaceState(null, '', callback.href);
        }
      }
      await syncUser();
      el('community-notice').textContent = core.submissionsReady(config) ?
        'Üyeler anılarını yönetici onayına gönderebilir. Onaysız gönderiler burada yayınlanmaz.' :
        'Üyelik bağlantısı hazır. Gerçek gönderim, tablo ve RLS kontrolü tamamlanana kadar kapalıdır; yerel önizleme kullanılabilir.';
    } catch {
      subscription?.unsubscribe(); client = null; user = null; render();
      authStatus.textContent = 'Üyelik servisine bağlanılamadı. Yapılandırma, internet ve Auth ayarlarını kontrol et.';
    }
  }
  el('community-signup').addEventListener('submit', event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const email = el('community-signup-email').value.trim();
    const password = el('community-signup-password').value;
    void runAuth(async () => {
      const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl() } });
      el('community-signup-password').value = '';
      if (error) throw error;
      if (data.session) {
        const { error: exitError } = await client.auth.signOut({ scope: 'local' });
        if (exitError) throw exitError;
        await syncUser();
        authStatus.textContent = 'E-posta doğrulaması beklenmeden oturum verildi. Yönetici Confirm email ayarını kontrol etmeli.';
      } else authStatus.textContent = 'Kayıt isteği işlendi. Uygunsa e-postana gelen doğrulama bağlantısını kullan; ardından giriş yap.';
    });
  });
  el('community-login').addEventListener('submit', event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const email = el('community-login-email').value.trim();
    const password = el('community-login-password').value;
    void runAuth(async () => {
      const { error } = await client.auth.signInWithPassword({ email, password });
      el('community-login-password').value = '';
      if (error) throw error;
      try {
        const verified = await core.verifiedUser(client);
        verification++; user = verified; render();
      } catch (error) {
        verification++; user = null; render();
        if (error?.code === 'email_not_confirmed' || error?.code === 'verified_login_required') await client.auth.signOut({ scope: 'local' });
        throw error;
      }
      authStatus.textContent = 'Giriş başarılı.';
    });
  });
  el('community-signout').addEventListener('click', () => { void runAuth(async () => {
    const { error } = await client.auth.signOut({ scope: 'local' }); if (error) throw error;
    verification++; user = null; clearPreview(); render(); authStatus.textContent = 'Bu cihazdaki oturum kapatıldı.';
  }); });
  el('community-resend').addEventListener('click', () => {
    const email = el('community-login-email').value.trim();
    if (!el('community-login-email').reportValidity()) return;
    void runAuth(async () => {
      const { error } = await client.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectUrl() } });
      if (error) throw error;
      authStatus.textContent = 'Uygunsa doğrulama e-postası yeniden gönderildi. Gelen kutunu ve spam klasörünü kontrol et.';
    });
  });
  el('community-forgot').addEventListener('click', () => {
    if (!el('community-login-email').reportValidity()) return;
    void runAuth(async () => {
      const { error } = await client.auth.resetPasswordForEmail(el('community-login-email').value.trim(), { redirectTo: redirectUrl() });
      if (error) throw error;
      authStatus.textContent = 'Adres için işlem uygunsa şifre yenileme e-postası gönderildi. Spam klasörünü de kontrol et; bağlantıyı bu tarayıcıda aç.';
    });
  });
  el('community-recovery').addEventListener('submit', event => {
    event.preventDefault();
    if (!recovering || !event.currentTarget.reportValidity()) return;
    const password = el('community-new-password').value;
    if (password.length < 12 || password.length > 128) { authStatus.textContent = 'Yeni şifre 12–128 karakter olmalı.'; return; }
    if (password !== el('community-new-password-confirm').value) { authStatus.textContent = 'Yeni şifreler eşleşmiyor.'; return; }
    void runAuth(async () => {
      try {
        await core.verifiedUser(client);
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        recovering = false;
        const { error: exitError } = await client.auth.signOut({ scope: 'local' });
        user = null; verification++; clearPreview();
        authStatus.textContent = exitError ? 'Şifren güncellendi; oturum kapatılamadı. Çıkış Yap düğmesini kullan.' : 'Şifren güncellendi. Yeni şifrenle giriş yapabilirsin.';
        if (exitError) await syncUser();
      } finally {
        el('community-new-password').value = ''; el('community-new-password-confirm').value = '';
      }
    });
  });
  function draft() {
    return { era: el('community-era').value, author: el('community-author').value,
      title: el('community-title').value, body: el('community-body').value,
      permission: el('community-permission').checked, file: el('community-file').files[0] || null };
  }
  function clearPreview() {
    const preview = el('community-preview');
    preview.querySelector('video')?.pause(); preview.replaceChildren(); preview.hidden = true;
    if (mediaUrl) { URL.revokeObjectURL(mediaUrl); mediaUrl = null; }
  }
  el('community-draft').addEventListener('submit', async event => {
    event.preventDefault(); if (sending || !event.currentTarget.reportValidity()) return;
    const snapshot = draft();
    try {
      core.validateDraft(snapshot); await core.validateFile(snapshot.file); clearPreview();
      const preview = el('community-preview');
      const label = document.createElement('small'); label.textContent = 'YEREL ÖNİZLEME · GÖNDERİLMEDİ';
      const title = document.createElement('h4'); title.textContent = snapshot.title.trim();
      const meta = document.createElement('p'); meta.textContent = snapshot.author.trim() + ' · ' + snapshot.era + '’ler';
      const body = document.createElement('p'); body.textContent = snapshot.body.trim();
      preview.append(label, title, meta, body);
      if (snapshot.file) {
        const isImage = snapshot.file.type.startsWith('image/');
        const media = document.createElement(isImage ? 'img' : 'video');
        mediaUrl = URL.createObjectURL(snapshot.file); media.src = mediaUrl;
        if (isImage) media.alt = 'Anı fotoğrafının yerel önizlemesi';
        else { media.controls = true; media.preload = 'metadata'; media.playsInline = true; }
        preview.append(media);
      }
      preview.hidden = false; draftStatus.textContent = 'Yalnızca bu cihazda önizlendi; henüz gönderilmedi.';
    } catch (error) { draftStatus.textContent = messages[error.code] || 'Önizleme hazırlanamadı.'; }
  });
  el('community-send').addEventListener('click', async () => {
    if (sending || authBusy || blockedRetry || recovering) return;
    if (!core?.submissionsReady(config)) { draftStatus.textContent = messages.setup_required; return; }
    if (!el('community-draft').reportValidity()) return;
    const snapshot = draft(); sending = true; render();
    draftStatus.textContent = 'Oturum ve içerik kontrol ediliyor; işlem bitene kadar bu sayfayı kapatma.';
    try {
      await core.submit({ client, config, draft: snapshot });
      el('community-draft').reset(); clearPreview();
      draftStatus.textContent = 'Anın alındı ve yönetici onayı bekliyor. Henüz yayınlanmadı.';
    } catch (error) {
      blockedRetry = Boolean(error.uncertain || error.path);
      draftStatus.textContent = messages[error.code] || 'Gönderim tamamlanamadı. Yeniden denemeden önce durumunu kontrol et.';
      if (error.path) {
        const note = document.createElement('p');
        note.textContent = 'Yönetici kontrolü için dosya yolu: ' + error.path + '. Otomatik silme yapılmadı.';
        draftStatus.append(note);
      }
      if (blockedRetry) draftStatus.append(document.createTextNode(' Çift kayıt oluşmaması için bu oturumda yeniden gönderim kilitlendi.'));
    } finally { sending = false; await syncUser(); render(); }
  });
  el('community-clear').addEventListener('click', () => {
    if (sending) return;
    el('community-draft').reset(); clearPreview();
    draftStatus.textContent = blockedRetry ? 'Yerel taslak temizlendi. Önceki belirsiz işlemi yönetici kontrol etmeli; gönderim kilidi korunuyor.' : 'Yerel taslak temizlendi.';
  });
  window.addEventListener('pagehide', clearPreview);
  void initializeAuth();
})();
