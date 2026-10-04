import { UserRole } from '@/types';
import { apiUrl } from '@/lib/api-config';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dbRole: 'creator' | 'business' | 'school';
  avatar?: string;
  location?: string;
  phone?: string;
  bio?: string;
  roleTitle?: string;
  handle?: string;
  skills?: string[];
  startingPrice?: string;
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
  async signInWithGoogle(role: UserRole = 'creator'): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Login Google sedang dalam pemeliharaan. Silakan masuk menggunakan email dan kata sandi.' };
  },

  async getCurrentUser(): Promise<UserSession | null> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('creatorin_token') : null;
      if (typeof window !== 'undefined' && !token) {
        return null;
      }
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(apiUrl('/api/auth/me'), {
        headers,
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.user) return null;

      const details = data.details || {};
      const fallbackName = data.user.fullName || data.user.email?.split('@')[0] || 'User';
      return {
        id: data.user.id,
        name: fallbackName,
        email: data.user.email,
        role: mapRoleToFrontend(data.user.role),
        dbRole: data.user.role,
        avatar: data.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
        location: data.user.location,
        phone: data.user.phone,
        bio: details.bio || details.description || data.user.bio || '',
        roleTitle: details.headline || (data.user.role === 'creator' ? 'Kreator Konten' : 'Brand / UMKM'),
        handle: details.slug ? `@${details.slug}` : `@${fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        skills: details.skills || [],
        startingPrice: details.startingPrice,
      };
    } catch {
      return null;
    }
  },

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: UserSession; error?: string }> {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal masuk akun.' };
      }

      if (data.session?.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('creatorin_token', data.session.accessToken);
      }

      const fallbackName = data.user.fullName || data.user.email?.split('@')[0] || 'User';
      const user: UserSession = {
        id: data.user.id,
        name: fallbackName,
        email: data.user.email,
        role: mapRoleToFrontend(data.user.role),
        dbRole: data.user.role,
        avatar: data.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
        location: data.user.location,
        phone: data.user.phone,
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
  }): Promise<{ success: boolean; user?: UserSession; requiresConfirmation?: boolean; error?: string }> {
    try {
      const dbRole = mapRoleToBackend(params.role);
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

      if (data.session?.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('creatorin_token', data.session.accessToken);
      }

      const user: UserSession = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: params.role,
        dbRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      };

      return { success: true, user, requiresConfirmation: Boolean(data.requiresConfirmation) };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat registrasi.';
      return { success: false, error: msg };
    }
  },

  async completeOnboarding(payload: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(apiUrl('/api/onboarding'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  async updateProfile(payload: {
    fullName?: string;
    phone?: string;
    location?: string;
    avatarUrl?: string;
    headline?: string;
    bio?: string;
    skills?: string[];
    startingPrice?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(apiUrl('/api/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal memperbarui profil.' };
      }
      return { success: true, message: data.message || 'Profil berhasil diperbarui.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat memperbarui profil.';
      return { success: false, error: msg };
    }
  },
};
