-- =========================================================
-- CREATORIN: Seed Initial Users & Profiles
-- =========================================================

-- 1. Insert into auth.users (trigger on_auth_user_created will auto-create profiles)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'maya@creatorin.id', '$2a$10$dummyhashedpasswordcreatorin2026', NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Maya Angelina","role":"creator","avatar_url":"/creatorin/maya-angelina.png"}'::jsonb, 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'qaesyaar@creatorin.id', '$2a$10$dummyhashedpasswordcreatorin2026', NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Qaesyaar Aqeel","role":"creator","avatar_url":"/creatorin/avatar.png"}'::jsonb, 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'munir@creatorin.id', '$2a$10$dummyhashedpasswordcreatorin2026', NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sobakhul Munir Siroj","role":"creator","avatar_url":"/creatorin/avatar.png"}'::jsonb, 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'glowlab@creatorin.id', '$2a$10$dummyhashedpasswordcreatorin2026', NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"GlowLab Skincare Indonesia","role":"business","avatar_url":"/creatorin/sarah-kurniawan.png"}'::jsonb, 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Update Profile details (phone, location)
UPDATE public.profiles SET phone = '+628123456789', location = 'Jakarta Barat' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET phone = '+628198765432', location = 'Bandung, Jawa Barat' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET phone = '+628135792468', location = 'Jakarta Selatan' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET phone = '+628111222333', location = 'Jakarta Pusat' WHERE id = '44444444-4444-4444-4444-444444444444';

-- 3. Upsert Creator Profiles
INSERT INTO public.creator_profiles (
  profile_id, slug, headline, bio, career_score, completed_projects_count,
  rating, reviews_count, followers_count, school_name, starting_price,
  skills, languages, is_pro, is_promoted
)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111', 'maya-angelina',
    'Beauty & Lifestyle TikTok Content Creator',
    'Kreator konten spesialis video UGC, review produk kecantikan & gaya hidup dengan engagement tinggi.',
    95, 142, 4.9, 98, '4.827', 'SMK Telkom Sidoarjo', 'Mulai Rp850.000/proyek',
    '["TikTok UGC", "Beauty Review", "Reels Video", "Skincare Testing", "Script Writing"]'::jsonb,
    '["Indonesia", "English", "Jawa"]'::jsonb,
    TRUE, TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222222', 'qaesyaar-aqeel',
    'Brand Identity & Digital Content Creator',
    'Membantu UMKM dan brand lokal membangun identitas visual berkelas dunia dengan standar komersial tinggi.',
    95, 88, 5.0, 88, '3.240', 'Institut Teknologi Bandung', 'Mulai Rp200.000/proyek',
    '["Brand Identity", "Packaging", "Social Media Feed", "Logo Design", "Typography"]'::jsonb,
    '["Indonesia", "English", "Sunda"]'::jsonb,
    TRUE, TRUE
  ),
  (
    '33333333-3333-3333-3333-333333333333', 'sobakhul-munir-siroj',
    'TikTok UGC & Product Review Creator',
    'Fokus pada pembuatan video konversi tinggi untuk campaign TikTok, e-commerce, dan marketplace.',
    93, 64, 4.9, 52, '2.913', 'Creatorin Academy', 'Mulai Rp1.500.000/proyek',
    '["UI/UX Design", "Framer", "Design System", "Product Design", "Interactive Web"]'::jsonb,
    '["Indonesia", "English"]'::jsonb,
    FALSE, FALSE
  )
ON CONFLICT (profile_id) DO UPDATE SET
  slug = EXCLUDED.slug,
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  career_score = EXCLUDED.career_score,
  completed_projects_count = EXCLUDED.completed_projects_count,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  followers_count = EXCLUDED.followers_count,
  school_name = EXCLUDED.school_name,
  starting_price = EXCLUDED.starting_price,
  skills = EXCLUDED.skills,
  languages = EXCLUDED.languages,
  is_pro = EXCLUDED.is_pro,
  is_promoted = EXCLUDED.is_promoted;

-- 4. Upsert Business Profile
INSERT INTO public.business_profiles (profile_id, company_name, business_category, description, website)
VALUES (
  '44444444-4444-4444-4444-444444444444', 'GlowLab Skincare', 'Beauty & Cosmetics',
  'Brand skincare lokal yang berfokus pada barrier restoring treatment berbasis riset dermatologi.',
  'https://glowlab.id'
)
ON CONFLICT (profile_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  business_category = EXCLUDED.business_category,
  description = EXCLUDED.description,
  website = EXCLUDED.website;

-- 5. Services
INSERT INTO public.services (creator_id, title, category, description, price, price_numeric, estimated_days, shape_idx, is_active)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '1x Video TikTok UGC & Review Viral', 'TikTok UGC', 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.', 'Rp1.500.000', 1500000, '2 Hari Kerja', 0, TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Desain Identitas Brand & Logo UMKM', 'Brand Identity', 'Paket lengkap logo, filosofi warna, dan panduan visual untuk brand berkembang.', 'Rp100.000', 100000, '3 Hari Kerja', 0, TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Desain Feed Instagram Aesthetic (9 Grid)', 'Feed Instagram', 'Template grid feed terstruktur untuk meningkatkan engagement dan citra brand di media sosial.', 'Rp50.000', 50000, '2 Hari Kerja', 1, TRUE),
  ('11111111-1111-1111-1111-111111111111', '1x Video Unboxing & First Impression', 'Product Review', 'Ulasan jujur dan estetik produk skincare/lifestyle langsung di hadapan kamera.', 'Rp850.000', 850000, '2 Hari Kerja', 2, TRUE)
ON CONFLICT DO NOTHING;

-- 6. Projects
INSERT INTO public.projects (creator_id, title, description, creator_handle, views_count, media_type)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Skincare Barrier Restoring Serum 14-Day Honest Review (TikTok UGC Viral)', 'Uji coba harian serum barrier kulit selama 14 hari dengan dokumentasi makro sebelum dan sesudah.', '@mayaangelina.ugc', '710.0K', 'shader'),
  ('33333333-3333-3333-3333-333333333333', 'Tips bertahan as Product Designer di 2026 ditengah gempuran AI bot :(', 'Diskusi visual mengenai diferensiasi nilai craft desainer produk manusia.', '@munirs.design', '185.4K', 'shader')
ON CONFLICT DO NOTHING;

-- 7. Reviews
INSERT INTO public.reviews (creator_id, reviewer_id, reviewer_name, reviewer_role, reviewer_avatar, project_title, rating, comment, completed_date)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Sarah Kurniawan', 'Founder, GlowLab Skincare', '/creatorin/sarah-kurniawan.png', 'Desain Landing Page & Mobile UI Kit Kosmetik', 5.0, 'Kerja sama yang sangat memuaskan dari awal brief hingga serah terima. Mas Munir sangat responsif di room chat Creatorin, memahami kebutuhan visual brand kami tanpa perlu banyak revisi, dan deliverable Figma-nya terstruktur rapi.', '12 September 2026'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Budi Pratama', 'Marketing Lead, Kopi Karsa', '/creatorin/budi-pratama.png', 'Redesign Website Interaktif & Brand Guideline', 5.0, 'Hasil pengerjaan website Framer-nya jauh melampaui ekspektasi. Interaksi animasinya sangat halus dan konversi campaign kopi kami naik drastis sejak peluncuran.', '28 Agustus 2026')
ON CONFLICT DO NOTHING;

-- 8. Wallets
INSERT INTO public.creator_wallets (creator_id, balance, points)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 4500000, 250),
  ('22222222-2222-2222-2222-222222222222', 6200000, 380),
  ('33333333-3333-3333-3333-333333333333', 3800000, 190)
ON CONFLICT (creator_id) DO NOTHING;
