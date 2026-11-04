'use strict';
// Bu dosya herkese açıktır. Secret/service_role anahtarı veya parola EKLEMEYİN.
// Anahtar tek başına veri güvenliği sağlamaz; sunucudaki RLS belirleyicidir.
window.RETROVA_SUPABASE_CONFIG = Object.freeze({
   projectUrl: 'https://xrhwazwhbwuugwisvkxs.supabase.co',
  publishableKey: 'sb_publishable_V1xsa1ZxexdBzx2IclJ18A_zzOMF611', // sb_publishable_... veya yalnızca role=anon olan eski anahtar
  authEnabled: true, // Auth ve e-posta doğrulama ayarları incelenmeden açmayın.
  // RLS ve eksik baslik/donem sütunları doğrulanmadan bu üç bayrağı açmayın.
  // Bunlar UI/kurulum kilididir; güvenlik sunucudaki politikalarla sağlanır.
  submissionEnabled: false,
  schemaReviewed: false,
  policiesReviewed: false,
  table: 'retrova_paylasimlar',
  privateBucket: 'retrova-medya',
  // Mevcut sütunlar eşlendi. baslik/donem ayrı SQL taslağındaki ÖNERİLEN alanlardır.
  columns: Object.freeze({
    id: 'id', owner: 'user_id', author: 'ziyaretci_adi',
    era: 'donem', title: 'baslik', body: 'ani_metni',
    mediaPath: 'dosya_url', mediaType: 'dosya_turu',
    approval: 'onaylandi', createdAt: 'created_at'
  })
});
