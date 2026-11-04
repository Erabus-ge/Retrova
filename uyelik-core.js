/* UI'dan bağımsız doğrulama ve gönderim akışı. Gizli anahtar kullanmaz. */
((scope) => {
  'use strict';
  const types = Object.freeze({
    'image/jpeg': { extension: 'jpg', max: 5 * 1024 * 1024 },
    'image/png': { extension: 'png', max: 5 * 1024 * 1024 },
    'image/webp': { extension: 'webp', max: 5 * 1024 * 1024 },
    'video/mp4': { extension: 'mp4', max: 20 * 1024 * 1024 },
    'video/webm': { extension: 'webm', max: 20 * 1024 * 1024 }
  });
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  class SubmissionError extends Error {
    constructor(code, stage, path = null, uncertain = false) {
      super(code); this.name = 'SubmissionError'; this.code = code;
      this.stage = stage; this.path = path; this.uncertain = uncertain;
    }
  }
  function submissionsReady(config) {
    const names = ['owner', 'author', 'era', 'title', 'body', 'mediaPath', 'mediaType', 'approval'];
    const values = names.map(name => config.columns?.[name]);
    return config.submissionEnabled === true && config.schemaReviewed === true &&
      config.policiesReviewed === true && config.table === 'retrova_paylasimlar' &&
      config.privateBucket === 'retrova-medya' && values.every(v => typeof v === 'string' && /^[a-z_][a-z0-9_]*$/.test(v)) &&
      new Set(values).size === values.length;
  }
  function validateDraft(draft) {
    const text = (value, limit) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= limit;
    if (![1970, 1980, 1990, 2000].includes(Number(draft.era)) ||
      !text(draft.author, 80) || !text(draft.title, 120) || !text(draft.body, 5000) || draft.permission !== true) {
      throw new SubmissionError('invalid_draft', 'validation');
    }
  }
  async function validateFile(file) {
    if (!file) return null;
    const type = types[file.type];
    if (!type || !Number.isFinite(file.size) || file.size <= 0 || file.size > type.max) throw new SubmissionError('invalid_file', 'validation');
    const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
    const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
    const matches = file.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 :
      file.type === 'image/png' ? [137,80,78,71,13,10,26,10].every((b, i) => bytes[i] === b) :
      file.type === 'image/webp' ? ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP' :
      file.type === 'video/mp4' ? bytes.length >= 12 && ascii(4,8) === 'ftyp' :
      file.type === 'video/webm' ? [26,69,223,163].every((b, i) => bytes[i] === b) : false;
    if (!matches) throw new SubmissionError('file_signature', 'validation');
    // Ön denetimdir; gerçek içerik güvenliği sunucuda ve moderasyonda sağlanır.
    return type;
  }
  async function verifiedUser(client) {
    const { data, error } = await client.auth.getUser();
    const user = data?.user;
    if (error) throw error;
    if (!user || !uuidPattern.test(user.id) || !user.email || user.is_anonymous === true) {
      throw new SubmissionError('verified_login_required', 'auth');
    }
    if (!user.email_confirmed_at) throw new SubmissionError('email_not_confirmed', 'auth');
    return user;
  }
  function makePayload(config, user, draft, path) {
    const c = config.columns;
    // İstemcinin taslakta verdiği owner/approval/path değerleri asla kullanılmaz.
    return { [c.owner]: user.id, [c.author]: draft.author.trim(), [c.era]: Number(draft.era),
      [c.title]: draft.title.trim(), [c.body]: draft.body.trim(),
      [c.mediaPath]: path, [c.mediaType]: draft.file ? draft.file.type : null, [c.approval]: false };
  }
  async function submit({ client, config, draft, randomUUID = () => scope.crypto.randomUUID() }) {
    if (!submissionsReady(config)) throw new SubmissionError('setup_required', 'configuration');
    validateDraft(draft);
    const fileType = await validateFile(draft.file);
    const user = await verifiedUser(client);
    let path = null;
    if (draft.file) {
      const id = randomUUID();
      if (!uuidPattern.test(id)) throw new SubmissionError('invalid_upload_id', 'validation');
      path = `${user.id}/${id}.${fileType.extension}`;
      try {
        const { error } = await client.storage.from(config.privateBucket).upload(path, draft.file, {
          upsert: false, contentType: draft.file.type, cacheControl: '60'
        });
        if (error) throw new SubmissionError('upload_rejected', 'upload', path);
      } catch (error) {
        if (error instanceof SubmissionError) throw error;
        throw new SubmissionError('upload_unknown', 'upload', path, true);
      }
    }
    try {
      const current = await verifiedUser(client);
      if (current.id !== user.id) throw new SubmissionError('session_changed', 'auth', path);
    } catch (error) {
      if (error instanceof SubmissionError) { error.path = path; throw error; }
      throw new SubmissionError('session_check_failed', 'auth', path);
    }
    // SELECT izni gerektirmeyen INSERT. Belirsiz hatada otomatik tekrar/silme yok.
    let result;
    try { result = await client.from(config.table).insert(makePayload(config, user, draft, path)); }
    catch { throw new SubmissionError('save_unknown', 'database', path, true); }
    if (result.error) {
      const definite = result.status >= 400 && result.status < 500;
      throw new SubmissionError(definite ? 'save_rejected' : 'save_unknown', 'database', path, !definite);
    }
    return { path, pendingApproval: true };
  }
  const api = Object.freeze({ submissionsReady, validateDraft, validateFile, verifiedUser, makePayload, submit, SubmissionError });
  scope.RetrovaMembership = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
