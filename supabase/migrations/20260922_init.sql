-- =========================================================
-- CREATORIN: Initial Supabase PostgreSQL Migration
-- Aligned with daftar_halaman_web_app_creatorin.md
-- =========================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Types & Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('creator', 'business', 'school');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('unpaid', 'paid', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE room_status AS ENUM ('in_progress', 'review_pending', 'revision_requested', 'completed', 'disputed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Unified Profiles (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'creator',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Role-Specific Profile Extension Tables
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  headline TEXT NOT NULL,
  bio TEXT,
  career_score INT NOT NULL DEFAULT 92,
  completed_projects_count INT NOT NULL DEFAULT 0,
  rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
  reviews_count INT NOT NULL DEFAULT 0,
  followers_count TEXT NOT NULL DEFAULT '0',
  school_name TEXT,
  starting_price TEXT NOT NULL DEFAULT 'Mulai Rp100.000',
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages JSONB NOT NULL DEFAULT '["Indonesia", "English"]'::jsonb,
  is_pro BOOLEAN NOT NULL DEFAULT FALSE,
  is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
  response_time TEXT NOT NULL DEFAULT '< 1 Jam',
  on_time_rate INT NOT NULL DEFAULT 95,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_category TEXT NOT NULL,
  description TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.school_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  pic_contact TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Services & Projects (Halaman 2-7, 18-21)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  price_numeric INT NOT NULL DEFAULT 0,
  estimated_days TEXT NOT NULL,
  shape_idx INT NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  creator_handle TEXT NOT NULL,
  views_count TEXT NOT NULL DEFAULT '0',
  media_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'shader',
  external_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Project Briefs & Applications (Halaman 22-27)
CREATE TABLE IF NOT EXISTS public.project_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  expected_output TEXT,
  budget TEXT NOT NULL,
  deadline TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.brief_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.project_briefs(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pitch TEXT,
  proposed_price TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Messaging (Halaman 28-29)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_time TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  service_quote_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Invoices (Halaman 30-33)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  scope_description TEXT NOT NULL,
  total_amount INT NOT NULL,
  deadline_days INT NOT NULL DEFAULT 3,
  revision_rules TEXT NOT NULL DEFAULT 'Maksimal 2 kali revisi minor.',
  status invoice_status NOT NULL DEFAULT 'unpaid',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Collaboration Rooms & Submissions (Halaman 34-35)
CREATE TABLE IF NOT EXISTS public.collaboration_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID UNIQUE NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  brief_summary TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  status room_status NOT NULL DEFAULT 'in_progress',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.collaboration_rooms(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  notes TEXT,
  file_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.collaboration_rooms(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Reviews & Ratings (Halaman 36)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.collaboration_rooms(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_role TEXT NOT NULL,
  reviewer_avatar TEXT NOT NULL DEFAULT '/creatorin/avatar.png',
  project_title TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  comment TEXT NOT NULL,
  completed_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Notifications (Halaman 37)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Wallets (Halaman 38-39)
CREATE TABLE IF NOT EXISTS public.creator_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 13. Trigger: Automatically initialize Profile on SignUp
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
  user_full_name TEXT;
BEGIN
  -- Determine role from metadata or default to creator
  assigned_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'creator'::user_role);
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (new.id, assigned_role, user_full_name, new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  -- Create role extension row
  IF assigned_role = 'creator' THEN
    INSERT INTO public.creator_profiles (profile_id, slug, headline)
    VALUES (new.id, LOWER(REPLACE(user_full_name, ' ', '-')), 'Kreator Baru di Creatorin')
    ON CONFLICT (profile_id) DO NOTHING;

    INSERT INTO public.creator_wallets (creator_id, balance, points)
    VALUES (new.id, 0, 0)
    ON CONFLICT (creator_id) DO NOTHING;
  ELSIF assigned_role = 'business' THEN
    INSERT INTO public.business_profiles (profile_id, company_name, business_category)
    VALUES (new.id, user_full_name, 'UMKM / Bisnis')
    ON CONFLICT (profile_id) DO NOTHING;
  ELSIF assigned_role = 'school' THEN
    INSERT INTO public.school_profiles (profile_id, school_name, pic_name)
    VALUES (new.id, user_full_name, user_full_name)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 14. Row Level Security (RLS)
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brief_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_wallets ENABLE ROW LEVEL SECURITY;

-- Public read policies for marketplace discovery
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Creator profiles are viewable by everyone" ON public.creator_profiles FOR SELECT USING (true);
CREATE POLICY "Active services are viewable by everyone" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Open briefs are viewable by everyone" ON public.project_briefs FOR SELECT USING (true);

-- User self-update policies
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Creators can manage own services" ON public.services FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Creators can manage own projects" ON public.projects FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Creators can view own wallet" ON public.creator_wallets FOR SELECT USING (auth.uid() = creator_id);

-- Conversations & Messages access
CREATE POLICY "Participants can view conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);
CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );
CREATE POLICY "Participants can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Collaboration Room access
CREATE POLICY "Members can view their collaboration rooms" ON public.collaboration_rooms
  FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = business_id);
CREATE POLICY "Members can view submissions" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collaboration_rooms r
      WHERE r.id = submissions.room_id
      AND (r.creator_id = auth.uid() OR r.business_id = auth.uid())
    )
  );
