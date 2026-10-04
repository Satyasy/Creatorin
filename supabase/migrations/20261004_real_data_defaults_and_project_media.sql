ALTER TABLE public.creator_profiles ALTER COLUMN career_score SET DEFAULT 0;
ALTER TABLE public.creator_profiles ALTER COLUMN rating SET DEFAULT 0.0;
ALTER TABLE public.reviews ALTER COLUMN rating DROP DEFAULT;
ALTER TABLE public.creator_profiles ALTER COLUMN starting_price SET DEFAULT '';
ALTER TABLE public.creator_profiles ALTER COLUMN languages SET DEFAULT '[]'::jsonb;
ALTER TABLE public.creator_profiles ALTER COLUMN response_time SET DEFAULT '';
ALTER TABLE public.creator_profiles ALTER COLUMN on_time_rate SET DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Karya Kreatif';
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'creator_profiles' AND column_name = 'graduation_year') THEN
    ALTER TABLE public.creator_profiles ALTER COLUMN graduation_year DROP DEFAULT;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'creator_profiles' AND column_name = 'major') THEN
    ALTER TABLE public.creator_profiles ALTER COLUMN major DROP DEFAULT;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'creator_profiles' AND column_name = 'class_grade') THEN
    ALTER TABLE public.creator_profiles ALTER COLUMN class_grade DROP DEFAULT;
  END IF;
END $$;

UPDATE public.creator_profiles
SET career_score = 0
WHERE career_score = 92 AND completed_projects_count = 0 AND reviews_count = 0;

UPDATE public.creator_profiles
SET rating = 0
WHERE rating = 5.0 AND reviews_count = 0;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-media', 'project-media', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Project media is public" ON storage.objects;
CREATE POLICY "Project media is public" ON storage.objects
FOR SELECT USING (bucket_id = 'project-media');

DROP POLICY IF EXISTS "Creators upload their own project media" ON storage.objects;
CREATE POLICY "Creators upload their own project media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE TABLE IF NOT EXISTS public.project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS project_comments_project_created_idx ON public.project_comments(project_id, created_at DESC);
DO $$ BEGIN
  IF to_regclass('public.student_school_relations') IS NOT NULL THEN
    ALTER TABLE public.student_school_relations ALTER COLUMN graduation_year SET DEFAULT '';
    ALTER TABLE public.student_school_relations ALTER COLUMN major SET DEFAULT '';
    ALTER TABLE public.student_school_relations ALTER COLUMN class_grade SET DEFAULT '';
  END IF;
END $$;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS school_id uuid;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS graduation_year text;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS major text;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS class_grade text;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS nisn text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_featured_school boolean NOT NULL DEFAULT false;
DO $$ BEGIN
  CREATE TYPE school_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE assessment_status AS ENUM ('not_started', 'draft', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS school_status school_status DEFAULT 'pending';
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text, cover_url text, tagline text, description text,
  address text, city text, website text, email text, phone text,
  pic_name text, pic_contact text,
  section_order jsonb NOT NULL DEFAULT '["featured_projects","students","achievements","about"]'::jsonb,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.student_school_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  school_status school_status NOT NULL DEFAULT 'pending', is_featured boolean NOT NULL DEFAULT false,
  graduation_year text NOT NULL DEFAULT '', major text NOT NULL DEFAULT '', class_grade text NOT NULL DEFAULT '',
  nisn text, request_date timestamp NOT NULL DEFAULT now(), approved_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (student_id, school_id)
);
ALTER TABLE public.student_school_relations ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS public.school_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  status assessment_status NOT NULL DEFAULT 'not_started',
  final_score numeric(5,2), notes text,
  assessed_by uuid REFERENCES public.profiles(id),
  updated_at timestamp NOT NULL DEFAULT now(), created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (student_id, school_id)
);
CREATE TABLE IF NOT EXISTS public.assessment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.school_assessments(id) ON DELETE CASCADE,
  criterion text NOT NULL, score int NOT NULL DEFAULT 0, weight int NOT NULL DEFAULT 20, notes text
);
CREATE TABLE IF NOT EXISTS public.school_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL, description text, year text NOT NULL, image_url text,
  category text NOT NULL DEFAULT 'Kompetisi', created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  notify_push boolean NOT NULL DEFAULT true,
  language text NOT NULL DEFAULT 'id',
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Remove the four deterministic demo accounts from the former seed file.
-- Cascading foreign keys remove their fabricated profiles, projects, services,
-- reviews, wallets, conversations, and related records.
DELETE FROM auth.users
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);
