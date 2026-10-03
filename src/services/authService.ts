import { UserRole } from '@/types';
import { createClient } from '@/lib/supabase/client';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dbRole: 'creator' | 'business' | 'school';
  avatar?: string;
  location?: string;
  phone?: string;
}

export function mapRoleToFrontend(dbRole: string): UserRole {
  if (dbRole === 'business') return 'umkm';
  if (dbRole === 'school') return 'school';
  return 'creator';
}

export function mapRoleToBackend(feRole: UserRole): 'creator' | 'business' {
  if (feRole === 'umkm') return 'business';
  return 'creator';
}

export const authService = {
  async signInWithGoogle(role: Exclude<UserRole, 'school'> = 'umkm'): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    localStorage.setItem('creatorin_oauth_role', mapRoleToBackend(role));
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return error ? { success: false, error: error.message } : { success: true };
  },
  async getCurrentUser(): Promise<UserSession | null> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { credentials: 'include' },
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.user) return null;

      return {
        id: data.user.id,
        name: data.user.fullName || data.user.email.split('@')[0],
        email: data.user.email,
        role: mapRoleToFrontend(data.user.role),
        dbRole: data.user.role,
        avatar: data.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
        location: data.user.location,
        phone: data.user.phone,
      };
    } catch {
      return null;
    }
  },

  async signIn(email: string, password: string):Promise<{ success: boolean; user?: UserSession; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal masuk akun.' };
      }

      const user: UserSession = {
        id: data.user.id,
        name: data.user.fullName || data.user.email.split('@')[0],
        email: data.user.email,
        role: mapRoleToFrontend(data.user.role),
        dbRole: data.user.role,
        avatar: data.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
      };

      return { success: true, user };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat menghubungkan ke server.';
      return { success: false, error: msg };
    }
  },

  async signUp(params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
  }): Promise<{ success: boolean; user?: UserSession; error?: string }> {
    try {
      const dbRole = mapRoleToBackend(params.role);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          fullName: params.fullName,
          role: dbRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal mendaftar akun baru.' };
      }

      const user: UserSession = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: params.role,
        dbRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      };

      return { success: true, user };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat registrasi.';
      return { success: false, error: msg };
    }
  },

  async completeOnboarding(payload: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal menyimpan data profil.' };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server.';
      return { success: false, error: msg };
    }
  },
};
