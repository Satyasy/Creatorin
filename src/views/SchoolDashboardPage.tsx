'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  SchoolDashboardOverview,
  StudentApprovalItem,
  StudentAssessmentSummary,
  StudentAssessmentDetail,
  RubricCriterion,
  SchoolInfo,
  SchoolAchievement,
  AssessmentStatus,
  SchoolStudentProjectItem,
  SchoolStudentItem
} from '@/types';
import { schoolService, DEFAULT_RUBRIC, calculateFinalScore } from '@/services/schoolService';
import { useAuth } from '@/providers/AuthProvider';
import {
  LayoutDashboard,
  UserCheck,
  Award,
  GraduationCap,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FolderGit2,
  Users,
  Clock,
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Building2,
  ArrowUp,
  ArrowDown,
  Star,
  Globe,
  Mail,
  Phone,
  MapPin,
  LogOut,
  SlidersHorizontal,
  RefreshCw,
  Filter,
  CheckCheck,
  FileText
} from 'lucide-react';

type DashboardTab = 'overview' | 'approval' | 'penilaian' | 'profile' | 'settings';
type AssessmentTab = 'rubrik' | 'profile' | 'projects';
type ProfileSubTab = 'info' | 'featured_projects' | 'featured_students' | 'achievements' | 'display_settings';

// ─── Shared UI primitives ────────────────────────────────────────────────────

function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'info' | 'neutral' | 'primary' }) {
  const styles = {
    success: 'bg-[#DCFCE7] text-[#14532D] border-[#86EFAC]/50',
    warning: 'bg-[#FFF4D6] text-[#7A2E0E] border-[#FDE68A]/60',
    info: 'bg-[#E1F6FF] text-[#07557D] border-[#BAE6FD]/50',
    neutral: 'bg-[#F3F3F4] text-[#55576A] border-[#E1E3EA]',
    primary: 'bg-[#E8F0FF] text-[#0D2A75] border-[#A9C3FF]/40',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function Feedback({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  const styles = type === 'success'
    ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#14532D]'
    : 'bg-[#FEE4E2] border-[#FCA5A5] text-[#912018]';
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium ${styles}`}>
      <Icon className="size-4 shrink-0" />
      {message}
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="font-['DM_Sans'] text-2xl font-semibold text-[#0D0C22] tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-sm text-[#55576A] leading-relaxed">{description}</p>}
    </div>
  );
}

// ─── Status badge helper ──────────────────────────────────────────────────────

function AssessmentBadge({ status }: { status: AssessmentStatus }) {
  if (status === 'completed') return <Badge variant="success"><Check className="size-3" />Selesai</Badge>;
  if (status === 'draft') return <Badge variant="warning"><Clock className="size-3" />Draft</Badge>;
  return <Badge variant="neutral">Belum dinilai</Badge>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SchoolDashboardPage() {
  const { user, signOut } = useAuth();
  const isDev = process.env.NODE_ENV === 'development';
  const effectiveUser = user?.role === 'school' ? user : (isDev ? {
    id: '55555555-5555-5555-5555-555555555555',
    name: user?.name || 'SMK Mitra Creatorin',
    email: user?.email || 'smkmitra@creatorin.id',
    role: 'school' as const,
    avatar: user?.avatar || '',
  } : user);

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [overview, setOverview] = useState<SchoolDashboardOverview | null>(null);
  const [approvals, setApprovals] = useState<StudentApprovalItem[]>([]);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentAssessmentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentAssessmentDetail | null>(null);
  const [assessmentSubTab, setAssessmentSubTab] = useState<AssessmentTab>('rubrik');
  const [rubricItems, setRubricItems] = useState<RubricCriterion[]>(DEFAULT_RUBRIC);
  const [assessmentFeedback, setAssessmentFeedback] = useState<string | null>(null);
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssessmentStatus | 'all'>('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [majorFilter, setMajorFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('info');
  const [schoolProfile, setSchoolProfile] = useState<SchoolInfo | null>(null);
  const [achievements, setAchievements] = useState<SchoolAchievement[]>([]);
  const [allProjects, setAllProjects] = useState<SchoolStudentProjectItem[]>([]);
  const [allStudents, setAllStudents] = useState<SchoolStudentItem[]>([]);
  const [sectionOrderList, setSectionOrderList] = useState<string[]>(['featured_projects', 'students', 'achievements', 'about']);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Partial<SchoolAchievement>>({
    title: '',
    description: '',
    year: new Date().getFullYear().toString(),
    category: 'Kompetisi',
    imageUrl: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [overviewData, approvalsData, studentsData, publicProfile, studentProjects, schoolStudents] = await Promise.all([
        schoolService.getDashboardOverview(),
        schoolService.getApprovals(),
        schoolService.getStudentsForAssessment(),
        schoolService.getPublicSchoolProfile(),
        schoolService.getAllStudentProjects(),
        schoolService.getSchoolStudents(),
      ]);
      setOverview(overviewData);
      setApprovals(approvalsData);
      setStudents(studentsData);
      setSchoolProfile(publicProfile.school);
      setAchievements(publicProfile.achievements);
      setAllProjects(studentProjects);
      setAllStudents(schoolStudents);
      setSectionOrderList(publicProfile.school.sectionOrder || ['featured_projects', 'students', 'achievements', 'about']);
    } catch (err) {
      console.error('Failed to load school dashboard data:', err);
      setLoadError(err instanceof Error ? err.message : 'Gagal memuat data sekolah');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (selectedStudentId) {
      const fetchDetail = async () => {
        const detail = await schoolService.getStudentAssessmentDetail(selectedStudentId);
        if (detail) {
          setStudentDetail(detail);
          setRubricItems(detail.assessment.rubricItems.length > 0 ? detail.assessment.rubricItems : DEFAULT_RUBRIC);
        }
      };
      fetchDetail();
    }
  }, [selectedStudentId]);

  const handleApprovalAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const success = await schoolService.updateApprovalStatus(id, status);
      if (success) {
        setApprovals(prev => prev.filter(item => item.id !== id));
        setApprovalFeedback(status === 'approved'
          ? 'Permohonan siswa berhasil disetujui. Siswa kini aktif di sistem vokasi.'
          : 'Permohonan relasi siswa telah ditolak.');
        setTimeout(() => setApprovalFeedback(null), 4000);
        const [updatedStudents, updatedOverview] = await Promise.all([
          schoolService.getStudentsForAssessment(),
          schoolService.getDashboardOverview(),
        ]);
        setStudents(updatedStudents);
        setOverview(updatedOverview);
      }
    } catch (err) {
      console.error('Failed to update approval:', err);
      alert('Gagal memproses approval siswa');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchYear = yearFilter === 'all' || s.graduationYear === yearFilter;
      const matchMajor = majorFilter === 'all' || s.major.toLowerCase() === majorFilter.toLowerCase();
      const matchClass = classFilter === 'all' || s.classGrade.toLowerCase().includes(classFilter.toLowerCase());
      return matchSearch && matchStatus && matchYear && matchMajor && matchClass;
    });
  }, [students, searchQuery, statusFilter, yearFilter, majorFilter, classFilter]);

  const currentFinalScore = useMemo(() => calculateFinalScore(rubricItems), [rubricItems]);
  const filledRubricCount = useMemo(() => rubricItems.filter(item => typeof item.score === 'number' && item.score > 0).length, [rubricItems]);

  const handleScoreChange = (index: number, newScore: number) => {
    setRubricItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], score: Math.min(100, Math.max(0, newScore)) };
      return updated;
    });
  };

  const handleSaveAssessment = async (targetStatus: AssessmentStatus) => {
    if (!selectedStudentId) return;
    setIsSavingAssessment(true);
    try {
      const result = await schoolService.saveAssessment(selectedStudentId, rubricItems, targetStatus, studentDetail?.assessment.notes);
      setAssessmentFeedback(targetStatus === 'completed'
        ? `Penilaian berhasil diselesaikan dengan nilai akhir ${result.finalScore} / 100.`
        : 'Draf penilaian berhasil disimpan.');
      setTimeout(() => setAssessmentFeedback(null), 4000);
      const [updatedStudents, updatedOverview] = await Promise.all([
        schoolService.getStudentsForAssessment(),
        schoolService.getDashboardOverview(),
      ]);
      setStudents(updatedStudents);
      setOverview(updatedOverview);
      if (studentDetail) {
        setStudentDetail({ ...studentDetail, assessment: { ...studentDetail.assessment, status: targetStatus, finalScore: result.finalScore, rubricItems } });
      }
    } catch (err) {
      console.error('Save assessment error:', err);
      alert('Gagal menyimpan hasil penilaian');
    } finally {
      setIsSavingAssessment(false);
    }
  };

  const handleUpdateSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolProfile) return;
    try {
      await schoolService.updateSchoolProfile(schoolProfile.id, schoolProfile);
      setProfileFeedback('Informasi sekolah berhasil diperbarui.');
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Gagal memperbarui profil sekolah');
    }
  };

  const handleToggleFeaturedStudent = async (studentId: string, currentFeatured: boolean) => {
    try {
      await schoolService.toggleFeaturedStudent(studentId, !currentFeatured);
      setAllStudents(prev => prev.map(s => (s.id === studentId ? { ...s, isFeatured: !currentFeatured } : s)));
    } catch (err) {
      console.error('Toggle featured student error:', err);
      alert('Gagal mengubah status featured siswa');
    }
  };

  const handleToggleFeaturedProject = async (projectId: string, currentFeatured: boolean) => {
    try {
      await schoolService.toggleFeaturedProject(projectId, !currentFeatured);
      setAllProjects(prev => prev.map(p => (p.id === projectId ? { ...p, isFeaturedSchool: !currentFeatured } : p)));
    } catch (err) {
      console.error('Toggle featured project error:', err);
      alert('Gagal mengubah status featured project');
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievement.title?.trim()) return;
    try {
      const added = await schoolService.saveAchievement(newAchievement);
      setAchievements(prev => [added, ...prev]);
      setIsAddingAchievement(false);
      setNewAchievement({ title: '', description: '', year: new Date().getFullYear().toString(), category: 'Kompetisi', imageUrl: '' });
      setProfileFeedback('Prestasi baru berhasil ditambahkan.');
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err) {
      console.error('Add achievement error:', err);
      alert('Gagal menambah prestasi');
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus prestasi ini?')) return;
    try {
      await schoolService.deleteAchievement(id);
      setAchievements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Delete achievement error:', err);
      alert('Gagal menghapus prestasi');
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrderList.length) return;
    const updated = [...sectionOrderList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSectionOrderList(updated);
  };

  const handleSaveSectionOrder = async () => {
    try {
      await schoolService.updateSectionOrder(sectionOrderList);
      setProfileFeedback('Urutan section berhasil disimpan.');
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err) {
      console.error('Save section order error:', err);
      alert('Gagal menyimpan urutan section');
    }
  };

  // ── Access guard ──
  if (effectiveUser?.role !== 'school') {
    return (
      <div
        id="school-rbac-restricted"
        data-testid="school-rbac-restricted"
        className="flex min-h-[85vh] w-full items-center justify-center bg-[#F8F9FC] p-6"
      >
        <div className="w-full max-w-sm rounded-xl border border-[#E1E3EA] bg-white p-8 text-center shadow-[0_4px_12px_rgba(13,12,34,0.10)]">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[#FFF4D6]">
            <ShieldAlert className="size-6 text-[#B54708]" />
          </div>
          <h1 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">Khusus Akun Sekolah</h1>
          <p className="mt-2 text-sm text-[#55576A] leading-relaxed">
            Anda masuk sebagai <strong className="text-[#0D0C22] capitalize">{user?.role || 'pengunjung'}</strong>.
            Dashboard ini hanya untuk guru pembimbing dan koordinator kemitraan industri SMK.
          </p>
          <Link
            href="/"
            className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#155DFC] text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="grid min-h-[70vh] place-items-center p-8" role="alert">
        <div className="w-full max-w-sm rounded-xl border border-[#FCA5A5] bg-[#FEE4E2] p-6 text-center space-y-3">
          <AlertCircle className="mx-auto size-7 text-[#D92D20]" />
          <p className="font-semibold text-[#912018]">Gagal memuat data</p>
          <p className="text-xs text-[#912018]/80">{loadError}</p>
          <button
            onClick={() => loadData()}
            className="inline-flex items-center gap-2 rounded-lg border border-[#FCA5A5] bg-white px-4 py-2 text-xs font-semibold text-[#D92D20] hover:bg-[#FEE4E2] transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  // ── Nav items ──
  const navItems = [
    { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'approval' as DashboardTab, label: 'Approval Relasi', icon: UserCheck, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined },
    { id: 'penilaian' as DashboardTab, label: 'Penilaian Rubrik', icon: Award, badge: students.length > 0 ? students.length : undefined },
    { id: 'profile' as DashboardTab, label: 'Profil Sekolah', icon: Building2 },
    { id: 'settings' as DashboardTab, label: 'Pengaturan', icon: Settings },
  ] as const;

  const pageTitle: Record<DashboardTab, string> = {
    overview: 'Overview',
    approval: 'Approval Relasi',
    penilaian: selectedStudentId ? 'Rubrik Penilaian' : 'Penilaian Siswa',
    profile: 'Profil Sekolah',
    settings: 'Pengaturan',
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8F9FC]">

      {/* ─── Sidebar (desktop) ────────────────────────────────────────────── */}
      <aside
        id="school-institutional-sidebar"
        data-testid="school-institutional-sidebar"
        className="hidden w-60 shrink-0 flex-col border-r border-[#E1E3EA] bg-white md:flex"
      >
        {/* School identity */}
        <div className="flex items-center gap-3 border-b border-[#E1E3EA] px-4 py-4">
          <img
            src={schoolProfile?.logoUrl || '/creatorin/avatar.png'}
            alt={schoolProfile?.name || 'Logo sekolah'}
            className="size-9 shrink-0 rounded-lg border border-[#E1E3EA] bg-[#F8F9FC] object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0D0C22]">
              {schoolProfile?.name || effectiveUser?.name || 'SMK Mitra Creatorin'}
            </p>
            <p className="text-xs text-[#55576A]">Mitra Vokasi</p>
          </div>
        </div>

        {isDev && !user && (
          <div className="mx-3 mt-3 flex items-center gap-1.5 rounded-lg border border-[#FDE68A]/60 bg-[#FFF4D6] px-3 py-2 text-xs font-medium text-[#7A2E0E]">
            <Sparkles className="size-3.5 shrink-0" />
            Mode Dev aktif
          </div>
        )}

        {/* Navigation */}
        <nav aria-label="Navigasi Sekolah" className="flex-1 overflow-y-auto px-2 py-3">
          <p className="mb-1 px-2 text-xs font-semibold text-[#B7BBC9]">Menu</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => { setActiveTab(item.id); setSelectedStudentId(null); }}
                className={`mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E8F0FF] text-[#155DFC]'
                    : 'text-[#55576A] hover:bg-[#F3F3F4] hover:text-[#0D0C22]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </span>
                {'badge' in item && item.badge !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.id === 'approval' ? 'bg-[#FFF4D6] text-[#7A2E0E]' : 'bg-[#F3F3F4] text-[#55576A]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#E1E3EA] p-3 space-y-1">
          <Link
            id="btn-public-school-profile"
            href={`/school/${schoolProfile?.slug || 'smk-mitra'}`}
            target="_blank"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[#55576A] transition-colors hover:bg-[#F3F3F4] hover:text-[#0D0C22]"
          >
            <span className="flex items-center gap-2"><Eye className="size-3.5" />Halaman Publik</span>
            <ExternalLink className="size-3.5" />
          </Link>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={effectiveUser?.avatar || '/creatorin/avatar.png'}
                alt="Avatar"
                className="size-6 shrink-0 rounded-full border border-[#E1E3EA] bg-white object-cover"
              />
              <span className="truncate text-xs font-medium text-[#0D0C22]">
                {effectiveUser?.name || 'SMK Mitra'}
              </span>
            </div>
            <button
              onClick={async () => {
                await signOut();
                window.location.href = '/';
              }}
              title="Keluar"
              className="rounded-md p-1.5 text-[#55576A] transition-colors hover:bg-[#FEE4E2] hover:text-[#D92D20] cursor-pointer"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile top bar ───────────────────────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-30 border-b border-[#E1E3EA] bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img
              src={schoolProfile?.logoUrl || '/creatorin/avatar.png'}
              alt="Logo"
              className="size-7 rounded-lg border border-[#E1E3EA] object-cover"
            />
            <span className="text-sm font-semibold text-[#0D0C22]">
              {schoolProfile?.name || effectiveUser?.name || 'Sekolah'}
            </span>
          </div>
          <Link
            href={`/school/${schoolProfile?.slug || 'smk-mitra'}`}
            target="_blank"
            className="flex items-center gap-1 text-xs font-medium text-[#55576A]"
          >
            Profil <ExternalLink className="size-3" />
          </Link>
        </div>
        <div className="flex gap-1 overflow-x-auto px-2 pb-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedStudentId(null); }}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive ? 'bg-[#E8F0FF] text-[#155DFC]' : 'text-[#55576A] hover:text-[#0D0C22]'
                }`}
              >
                <Icon className="size-3.5" />
                {item.label.split(' ')[0]}
                {'badge' in item && item.badge !== undefined && (
                  <span className="rounded-full bg-[#FFF4D6] px-1.5 text-[10px] font-bold text-[#7A2E0E]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main content ─────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Topbar (desktop) */}
        <header className="hidden h-14 shrink-0 items-center justify-between border-b border-[#E1E3EA] bg-white px-6 md:flex">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-[#0D0C22]">{pageTitle[activeTab]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/school/${schoolProfile?.slug || 'smk-mitra'}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border border-[#E1E3EA] bg-white px-3 py-1.5 text-xs font-medium text-[#55576A] transition-colors hover:bg-[#F3F3F4] hover:text-[#0D0C22]"
            >
              <Eye className="size-3.5 text-[#155DFC]" />
              Pratinjau halaman publik
              <ExternalLink className="size-3 text-[#B7BBC9]" />
            </Link>
          </div>
        </header>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-1 items-center justify-center pt-20 md:pt-0">
            <div className="space-y-3 text-center">
              <RefreshCw className="mx-auto size-6 animate-spin text-[#155DFC]" />
              <p className="text-sm text-[#55576A]">Memuat data sekolah…</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <main
            id="school-dashboard-main-content"
            className="flex-1 overflow-y-auto px-4 py-6 pt-24 sm:px-6 md:pt-6 lg:px-8"
          >
            {/* ── TAB: OVERVIEW ─────────────────────────────────────── */}
            {activeTab === 'overview' && !selectedStudentId && overview && (
              <div className="mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="font-['DM_Sans'] text-2xl font-semibold text-[#0D0C22]">
                      Overview Kinerja Siswa
                    </h1>
                    <p className="mt-1 text-sm text-[#55576A]">
                      Pantau kondisi siswa aktif, kemajuan asesmen rubrik, dan portofolio karya.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('penilaian')}
                      className="flex h-10 items-center gap-2 rounded-xl bg-[#155DFC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
                    >
                      <Award className="size-4" />
                      Mulai penilaian
                    </button>
                    <button
                      onClick={() => setActiveTab('approval')}
                      className="flex h-10 items-center gap-2 rounded-xl border border-[#E1E3EA] bg-white px-4 text-sm font-medium text-[#0D0C22] transition-colors hover:bg-[#F3F3F4]"
                    >
                      <UserCheck className="size-4 text-[#155DFC]" />
                      Permohonan {pendingApprovalsCount > 0 && `(${pendingApprovalsCount})`}
                    </button>
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { label: 'Total Siswa', value: overview.totalStudents, icon: Users, color: 'text-[#155DFC]', bg: 'bg-[#E8F0FF]' },
                    { label: 'Siswa Aktif', value: overview.activeStudents, icon: CheckCircle2, color: 'text-[#16803C]', bg: 'bg-[#DCFCE7]' },
                    { label: 'Menunggu Approval', value: overview.pendingApproval, icon: Clock, color: 'text-[#B54708]', bg: 'bg-[#FFF4D6]' },
                    { label: 'Sudah Dinilai', value: overview.gradedStudents, icon: Award, color: 'text-[#087BB8]', bg: 'bg-[#E1F6FF]' },
                    { label: 'Belum Dinilai', value: overview.ungradedStudents, icon: Clock, color: 'text-[#55576A]', bg: 'bg-[#F3F3F4]' },
                    { label: 'Total Proyek', value: overview.totalProjects, icon: FolderGit2, color: 'text-[#03ACFD]', bg: 'bg-[#E1F6FF]' },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="rounded-xl border border-[#E1E3EA] bg-white p-4 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-[#55576A]">{label}</span>
                        <div className={`shrink-0 rounded-lg p-1.5 ${bg}`}>
                          <Icon className={`size-3.5 ${color}`} />
                        </div>
                      </div>
                      <p className="mt-3 font-['DM_Sans'] text-2xl font-semibold text-[#0D0C22]">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Progress + Activity */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Assessment progress */}
                  <div className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                    <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">Kemajuan Asesmen</h3>
                    <p className="mt-0.5 text-xs text-[#55576A]">Distribusi status penilaian rubrik siswa aktif</p>

                    <div className="mt-4">
                      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#F3F3F4]">
                        <div
                          className="h-full bg-[#155DFC] transition-all duration-500"
                          style={{ width: `${overview.activeStudents > 0 ? (overview.assessmentProgress.graded / overview.activeStudents) * 100 : 0}%` }}
                          title={`Selesai: ${overview.assessmentProgress.graded}`}
                        />
                        <div
                          className="h-full bg-[#FDE68A] transition-all duration-500"
                          style={{ width: `${overview.activeStudents > 0 ? (overview.assessmentProgress.draft / overview.activeStudents) * 100 : 0}%` }}
                          title={`Draft: ${overview.assessmentProgress.draft}`}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-[#55576A]">
                        <span>{Math.round((overview.assessmentProgress.graded / (overview.activeStudents || 1)) * 100)}% tuntas</span>
                        <span>Target akhir semester</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-[#E1E3EA] pt-4">
                      {[
                        { label: 'Sudah dinilai', val: overview.assessmentProgress.graded, dot: 'bg-[#155DFC]' },
                        { label: 'Draft tersimpan', val: overview.assessmentProgress.draft, dot: 'bg-[#FDE68A]' },
                        { label: 'Belum dinilai', val: overview.assessmentProgress.ungraded, dot: 'bg-[#DDE0E8]' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-[#55576A]">
                            <span className={`size-2 rounded-full ${row.dot}`} />
                            {row.label}
                          </span>
                          <span className="font-semibold text-[#0D0C22]">{row.val}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveTab('penilaian')}
                      className="mt-4 w-full rounded-lg border border-[#E1E3EA] py-2 text-xs font-semibold text-[#55576A] transition-colors hover:border-[#A9C3FF] hover:bg-[#E8F0FF] hover:text-[#155DFC]"
                    >
                      Buka penilaian siswa
                    </button>
                  </div>

                  {/* Recent activities */}
                  <div className="lg:col-span-2 rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                    <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">Aktivitas Siswa Terbaru</h3>
                    <p className="mt-0.5 text-xs text-[#55576A]">Pembaruan kegiatan proyek dan capaian vokasi</p>

                    <div className="mt-4 space-y-2">
                      {overview.recentActivities.length > 0 ? (
                        overview.recentActivities.map(activity => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 rounded-lg border border-[#E1E3EA] bg-[#F8F9FC] p-3 transition-colors hover:bg-white"
                          >
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] mt-0.5">
                              <TrendingUp className="size-3.5 text-[#155DFC]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-[#55576A] leading-relaxed">
                                <strong className="font-semibold text-[#0D0C22]">{activity.studentName}</strong>{' '}{activity.description}
                              </p>
                              <span className="mt-1 flex items-center gap-1 text-xs text-[#B7BBC9]">
                                <Clock className="size-3" />{activity.timestamp}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-[#E1E3EA] bg-[#F8F9FC] px-6 py-10 text-center">
                          <CheckCheck className="mx-auto mb-2 size-7 text-[#B7BBC9]" />
                          <p className="text-sm font-medium text-[#0D0C22]">Belum ada aktivitas baru hari ini</p>
                          <p className="mt-1 text-xs text-[#55576A]">Aktivitas proyek dan asesmen siswa akan tercatat di sini.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: APPROVAL ─────────────────────────────────────── */}
            {activeTab === 'approval' && !selectedStudentId && (
              <div className="mx-auto max-w-5xl space-y-6">
                <SectionHeader
                  title="Approval Relasi Siswa"
                  description="Tinjau permohonan siswa yang ingin terhubung dengan sekolah. Siswa yang disetujui langsung masuk ke daftar penilaian rubrik."
                />

                {approvalFeedback && <Feedback message={approvalFeedback} />}

                <div className="overflow-hidden rounded-xl border border-[#E1E3EA] bg-white shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#E1E3EA] bg-[#F8F9FC] text-xs font-semibold text-[#55576A]">
                          <th className="px-4 py-3.5">Siswa</th>
                          <th className="px-4 py-3.5">Jurusan</th>
                          <th className="px-4 py-3.5">Kelas</th>
                          <th className="px-4 py-3.5">Tahun Lulus</th>
                          <th className="px-4 py-3.5">Tanggal Pengajuan</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E3EA] text-sm">
                        {approvals.length > 0 ? (
                          approvals.map(student => (
                            <tr key={student.id} className="transition-colors hover:bg-[#F8F9FC]">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={student.avatarUrl || '/creatorin/avatar.png'}
                                    alt={student.name}
                                    className="size-8 shrink-0 rounded-full border border-[#E1E3EA] object-cover"
                                  />
                                  <div>
                                    <span className="block font-medium text-[#0D0C22]">{student.name}</span>
                                    {student.nisn && <span className="block text-xs text-[#55576A]">NISN: {student.nisn}</span>}
                                    <span className="block text-xs text-[#B7BBC9]">{student.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 font-medium text-[#0D0C22]">{student.major}</td>
                              <td className="px-4 py-3.5 text-[#55576A]">{student.classGrade}</td>
                              <td className="px-4 py-3.5 text-[#55576A]">{student.graduationYear}</td>
                              <td className="px-4 py-3.5 text-[#55576A]">
                                {new Date(student.requestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge variant="warning"><Clock className="size-3" />Menunggu</Badge>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleApprovalAction(student.id, 'approved')}
                                    className="flex items-center gap-1.5 rounded-lg bg-[#155DFC] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1248C7]"
                                  >
                                    <Check className="size-3.5" />Setujui
                                  </button>
                                  <button
                                    onClick={() => handleApprovalAction(student.id, 'rejected')}
                                    className="flex items-center gap-1.5 rounded-lg border border-[#E1E3EA] bg-white px-3 py-1.5 text-xs font-semibold text-[#55576A] transition-colors hover:border-[#FCA5A5] hover:bg-[#FEE4E2] hover:text-[#912018]"
                                  >
                                    <XCircle className="size-3.5" />Tolak
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-14 text-center">
                              <UserCheck className="mx-auto mb-3 size-8 text-[#B7BBC9]" />
                              <p className="font-medium text-[#0D0C22]">Tidak ada permohonan tertunda</p>
                              <p className="mt-1 text-xs text-[#55576A]">Seluruh permohonan telah diverifikasi atau belum ada pendaftaran baru.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: PENILAIAN (LIST) ─────────────────────────────── */}
            {activeTab === 'penilaian' && !selectedStudentId && (
              <div className="mx-auto max-w-5xl space-y-6">
                <SectionHeader
                  title="Penilaian Siswa"
                  description="Daftar siswa yang telah disetujui. Klik baris siswa untuk membuka formulir asesmen kompetensi industri."
                />

                {/* Mini KPI */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Total Siswa', value: students.length, color: 'text-[#0D0C22]' },
                    { label: 'Sudah Dinilai', value: students.filter(s => s.status === 'completed').length, color: 'text-[#16803C]' },
                    { label: 'Draft', value: students.filter(s => s.status === 'draft').length, color: 'text-[#B54708]' },
                    { label: 'Belum Dinilai', value: students.filter(s => s.status === 'not_started').length, color: 'text-[#55576A]' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl border border-[#E1E3EA] bg-white p-4 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                      <span className="text-xs text-[#55576A]">{label}</span>
                      <p className={`mt-1 font-['DM_Sans'] text-2xl font-semibold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-1 rounded-lg border border-[#E1E3EA] bg-[#F3F3F4] p-1">
                    {(['all', 'not_started', 'draft', 'completed'] as const).map(key => (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                          statusFilter === key ? 'bg-white text-[#0D0C22] shadow-[0_1px_2px_rgba(13,12,34,0.06)]' : 'text-[#55576A] hover:text-[#0D0C22]'
                        }`}
                      >
                        {key === 'all' ? 'Semua' : key === 'not_started' ? 'Belum dinilai' : key === 'draft' ? 'Draft' : 'Selesai'}
                      </button>
                    ))}
                  </div>

                  <label className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#55576A]" />
                    <input
                      type="text"
                      placeholder="Cari siswa (nama, email, NISN)…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="h-10 w-full rounded-lg border border-[#B7BBC9] bg-white pl-9 pr-3 text-sm text-[#0D0C22] placeholder:text-[#B7BBC9] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/20"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    {[
                      { value: yearFilter, onChange: setYearFilter, options: [['all', 'Tahun: Semua'], ['2026', '2026'], ['2025', '2025'], ['2024', '2024']] },
                      { value: majorFilter, onChange: setMajorFilter, options: [['all', 'Jurusan: Semua'], ['RPL', 'RPL'], ['DKV', 'DKV'], ['Multimedia', 'Multimedia'], ['Animasi', 'Animasi']] },
                      { value: classFilter, onChange: setClassFilter, options: [['all', 'Kelas: Semua'], ['XII', 'XII'], ['XI', 'XI'], ['X', 'X']] },
                    ].map(({ value, onChange, options }, i) => (
                      <select
                        key={i}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="h-10 rounded-lg border border-[#B7BBC9] bg-white px-3 text-xs font-medium text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                      >
                        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    ))}

                    {(statusFilter !== 'all' || yearFilter !== 'all' || majorFilter !== 'all' || classFilter !== 'all' || searchQuery !== '') && (
                      <button
                        onClick={() => { setStatusFilter('all'); setYearFilter('all'); setMajorFilter('all'); setClassFilter('all'); setSearchQuery(''); }}
                        className="text-xs font-semibold text-[#155DFC] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-[#E1E3EA] bg-white shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#E1E3EA] bg-[#F8F9FC] text-xs font-semibold text-[#55576A]">
                          <th className="px-4 py-3.5">Siswa</th>
                          <th className="px-4 py-3.5">Jurusan & Kelas</th>
                          <th className="px-4 py-3.5">Tahun Lulus</th>
                          <th className="px-4 py-3.5">Proyek</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5">Nilai Akhir</th>
                          <th className="px-4 py-3.5 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E3EA] text-sm">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map(student => (
                            <tr
                              key={student.studentId}
                              onClick={() => setSelectedStudentId(student.studentId)}
                              className="group cursor-pointer transition-colors hover:bg-[#F8F9FC]"
                            >
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={student.avatarUrl || '/creatorin/avatar.png'}
                                    alt={student.name}
                                    className="size-8 shrink-0 rounded-full border border-[#E1E3EA] object-cover"
                                  />
                                  <div>
                                    <span className="block font-medium text-[#0D0C22] transition-colors group-hover:text-[#155DFC]">{student.name}</span>
                                    <span className="block text-xs text-[#B7BBC9]">{student.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="block font-medium text-[#0D0C22]">{student.major}</span>
                                <span className="block text-xs text-[#55576A]">{student.classGrade}</span>
                              </td>
                              <td className="px-4 py-3.5 text-[#55576A]">{student.graduationYear}</td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-[#55576A]">
                                  <FolderGit2 className="size-3.5 text-[#03ACFD]" />
                                  {student.projectCount}
                                </span>
                              </td>
                              <td className="px-4 py-3.5"><AssessmentBadge status={student.status} /></td>
                              <td className="px-4 py-3.5">
                                {student.finalScore !== null ? (
                                  <span className="font-['DM_Sans'] font-semibold text-[#155DFC]">{student.finalScore} / 100</span>
                                ) : (
                                  <span className="text-[#B7BBC9]">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  type="button"
                                  className="flex items-center gap-1 rounded-lg border border-[#E1E3EA] bg-white px-3 py-1.5 text-xs font-semibold text-[#0D0C22] transition-colors hover:border-[#A9C3FF] hover:bg-[#E8F0FF] hover:text-[#155DFC]"
                                >
                                  Buka rubrik <ChevronRight className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-14 text-center">
                              <Users className="mx-auto mb-3 size-8 text-[#B7BBC9]" />
                              <p className="font-medium text-[#0D0C22]">Tidak ada siswa yang sesuai filter</p>
                              <p className="mt-1 text-xs text-[#55576A]">Coba ubah kata kunci atau reset filter.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: RUBRIK DETAIL ────────────────────────────────── */}
            {activeTab === 'penilaian' && selectedStudentId && studentDetail && (
              <div className="mx-auto max-w-5xl space-y-6">
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="flex items-center gap-2 text-sm font-medium text-[#55576A] transition-colors hover:text-[#0D0C22]"
                >
                  <ArrowLeft className="size-4" />
                  Kembali ke daftar siswa
                </button>

                {assessmentFeedback && <Feedback message={assessmentFeedback} />}

                {/* Student card */}
                <div className="flex flex-col gap-4 rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)] sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={studentDetail.student.avatarUrl || '/creatorin/avatar.png'}
                      alt={studentDetail.student.name}
                      className="size-12 shrink-0 rounded-full border border-[#E1E3EA] object-cover"
                    />
                    <div>
                      <h2 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">{studentDetail.student.name}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#55576A]">
                        <span className="font-medium text-[#155DFC]">{studentDetail.student.major}</span>
                        <span>•</span>
                        <span>{studentDetail.student.classGrade}</span>
                        {studentDetail.student.nisn && <><span>•</span><span>NISN: {studentDetail.student.nisn}</span></>}
                        <span>•</span>
                        <span>Lulus {studentDetail.student.graduationYear}</span>
                      </div>
                    </div>
                  </div>
                  <AssessmentBadge status={studentDetail.assessment.status} />
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center gap-0 border-b border-[#E1E3EA]">
                  {([
                    { id: 'rubrik' as AssessmentTab, label: 'Penilaian' },
                    { id: 'profile' as AssessmentTab, label: 'Profil Siswa' },
                    { id: 'projects' as AssessmentTab, label: `Proyek (${studentDetail.projects.length})` },
                  ]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAssessmentSubTab(tab.id)}
                      className={`border-b-2 px-4 pb-3 text-sm font-semibold transition-colors ${
                        assessmentSubTab === tab.id
                          ? 'border-[#155DFC] text-[#155DFC]'
                          : 'border-transparent text-[#55576A] hover:text-[#0D0C22]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Rubrik form */}
                {assessmentSubTab === 'rubrik' && (
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <div className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                        <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">Rubrik Penilaian Kompetensi Industri</h3>
                        <p className="mt-0.5 text-xs text-[#55576A]">
                          Evaluasi 4 aspek kompetensi. Nilai akhir dihitung otomatis berbobot:{' '}
                          <code className="font-mono text-[#155DFC]">final = Σ(score × weight)</code>
                        </p>

                        <div className="mt-5 space-y-4">
                          {rubricItems.map((item, idx) => (
                            <div key={item.name} className="rounded-lg border border-[#E1E3EA] bg-[#F8F9FC] p-4 space-y-3">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <span className="block text-sm font-semibold text-[#0D0C22]">{item.name}</span>
                                  <span className="text-xs text-[#55576A]">
                                    Bobot: <strong className="text-[#155DFC]">{item.weight}%</strong>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs text-[#55576A]">Skor</span>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={item.score}
                                    onChange={e => handleScoreChange(idx, parseInt(e.target.value) || 0)}
                                    className="h-9 w-16 rounded-lg border border-[#B7BBC9] bg-white text-center text-sm font-semibold text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                                  />
                                </div>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={item.score}
                                onChange={e => handleScoreChange(idx, parseInt(e.target.value) || 0)}
                                className="w-full cursor-pointer accent-[#155DFC]"
                              />
                              {item.notes && (
                                <p className="text-xs italic text-[#55576A]">Catatan: {item.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sticky summary */}
                    <div className="lg:sticky lg:top-6 lg:self-start">
                      <div className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_4px_12px_rgba(13,12,34,0.10)]">
                        <span className="text-xs font-semibold text-[#55576A]">Progress pengisian</span>
                        <p className="mt-1 text-sm font-semibold text-[#0D0C22]">
                          {filledRubricCount} dari {rubricItems.length} aspek terisi
                        </p>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F3F3F4]">
                          <div
                            className="h-full rounded-full bg-[#155DFC] transition-all duration-300"
                            style={{ width: `${(filledRubricCount / rubricItems.length) * 100}%` }}
                          />
                        </div>

                        <div className="mt-5 rounded-xl bg-[#F8F9FC] p-4 text-center">
                          <span className="text-xs text-[#55576A]">Nilai Akhir</span>
                          <p className="font-['DM_Sans'] text-4xl font-bold text-[#155DFC]">
                            {currentFinalScore}
                            <span className="text-sm font-normal text-[#55576A]"> / 100</span>
                          </p>
                          <code className="mt-1 block text-[10px] text-[#B7BBC9]">final = Σ(score × weight)</code>
                        </div>

                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => handleSaveAssessment('completed')}
                            disabled={isSavingAssessment}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-sm font-semibold text-white transition-colors hover:bg-[#1248C7] disabled:opacity-60"
                          >
                            <Check className="size-4" />
                            Selesaikan & terbitkan
                          </button>
                          <button
                            onClick={() => handleSaveAssessment('draft')}
                            disabled={isSavingAssessment}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#E1E3EA] bg-white text-sm font-medium text-[#55576A] transition-colors hover:border-[#A9C3FF] hover:bg-[#E8F0FF] hover:text-[#155DFC] disabled:opacity-60"
                          >
                            <Save className="size-3.5" />
                            Simpan sebagai draf
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profil siswa */}
                {assessmentSubTab === 'profile' && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                      <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">Tentang Siswa</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#55576A]">
                        {studentDetail.student.bio || 'Belum ada bio yang ditambahkan.'}
                      </p>
                      <div className="mt-4">
                        <span className="text-xs font-semibold text-[#0D0C22]">Keahlian</span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {studentDetail.student.skills.length > 0 ? (
                            studentDetail.student.skills.map(skill => (
                              <span key={skill} className="rounded-lg bg-[#E8F0FF] px-2.5 py-1 text-xs font-medium text-[#0D2A75]">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#55576A]">Belum mencantumkan skill.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                      <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">Data Akademik</h3>
                      <div className="mt-4 space-y-0 divide-y divide-[#E1E3EA] text-sm">
                        {[
                          ['Jurusan', studentDetail.student.major],
                          ['Kelas', studentDetail.student.classGrade],
                          ['Tahun Kelulusan', studentDetail.student.graduationYear],
                          ['NISN', studentDetail.student.nisn || '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-2.5">
                            <span className="text-[#55576A]">{label}</span>
                            <span className="font-medium text-[#0D0C22]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Proyek siswa */}
                {assessmentSubTab === 'projects' && (
                  <div className="space-y-4">
                    <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">
                      Proyek Kreatif ({studentDetail.projects.length})
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {studentDetail.projects.length > 0 ? (
                        studentDetail.projects.map(proj => (
                          <div
                            key={proj.id}
                            className="overflow-hidden rounded-xl border border-[#E1E3EA] bg-white shadow-[0_1px_2px_rgba(13,12,34,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(13,12,34,0.10)]"
                          >
                            <div className="relative h-36 bg-[#F3F3F4]">
                              {proj.coverImage ? (
                                <img src={proj.coverImage} alt={proj.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <FolderGit2 className="size-8 text-[#B7BBC9]" />
                                </div>
                              )}
                              <span className="absolute left-2.5 top-2.5 rounded-full bg-[#0D0C22]/75 px-2 py-0.5 text-[10px] font-semibold text-white">
                                {proj.category}
                              </span>
                            </div>
                            <div className="p-4">
                              <h4 className="truncate text-sm font-semibold text-[#0D0C22]">{proj.title}</h4>
                              <div className="mt-1 flex items-center justify-between text-xs text-[#55576A]">
                                <span>{proj.viewsCount} dilihat</span>
                                {proj.isFeaturedSchool && (
                                  <span className="flex items-center gap-1 font-semibold text-[#B54708]">
                                    <Star className="size-3 fill-amber-400 text-amber-400" />Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full rounded-xl border border-[#E1E3EA] bg-white py-14 text-center">
                          <FolderGit2 className="mx-auto mb-3 size-8 text-[#B7BBC9]" />
                          <p className="font-medium text-[#0D0C22]">Belum ada proyek</p>
                          <p className="mt-1 text-xs text-[#55576A]">Siswa belum mempublikasikan proyek di marketplace.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: PROFIL SEKOLAH ───────────────────────────────── */}
            {activeTab === 'profile' && !selectedStudentId && schoolProfile && (
              <div className="mx-auto max-w-4xl space-y-6">
                <SectionHeader
                  title="Profil Sekolah"
                  description="Atur identitas institusi, kurasi proyek unggulan, penghargaan, dan urutan layout halaman publik."
                />

                {profileFeedback && <Feedback message={profileFeedback} />}

                {/* Sub-tab pills */}
                <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[#E1E3EA] bg-[#F3F3F4] p-1">
                  {([
                    { id: 'info', label: 'Info & Kontak', icon: Building2 },
                    { id: 'featured_projects', label: 'Proyek Unggulan', icon: Sparkles },
                    { id: 'featured_students', label: 'Siswa Unggulan', icon: GraduationCap },
                    { id: 'achievements', label: 'Prestasi', icon: Award },
                    { id: 'display_settings', label: 'Urutan Tampilan', icon: SlidersHorizontal },
                  ] as { id: ProfileSubTab; label: string; icon: React.ElementType }[]).map(sub => {
                    const Icon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setProfileSubTab(sub.id)}
                        className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                          profileSubTab === sub.id
                            ? 'bg-white text-[#155DFC] shadow-[0_1px_2px_rgba(13,12,34,0.06)]'
                            : 'text-[#55576A] hover:text-[#0D0C22]'
                        }`}
                      >
                        <Icon className="size-3.5" />{sub.label}
                      </button>
                    );
                  })}
                </div>

                {/* Info & Kontak */}
                {profileSubTab === 'info' && (
                  <form onSubmit={handleUpdateSchoolProfile} className="space-y-4 rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                    <h3 className="border-b border-[#E1E3EA] pb-3 font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">
                      Identitas & Kontak Resmi
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { label: 'Nama Sekolah', key: 'name', type: 'text' },
                        { label: 'Tagline', key: 'tagline', type: 'text' },
                        { label: 'URL Logo', key: 'logoUrl', type: 'text' },
                        { label: 'URL Banner', key: 'coverUrl', type: 'text' },
                        { label: 'Website Resmi', key: 'website', type: 'text' },
                        { label: 'Email Resmi', key: 'email', type: 'email' },
                        { label: 'Nomor Telepon', key: 'phone', type: 'text' },
                        { label: 'Kota / Kabupaten', key: 'city', type: 'text' },
                      ].map(({ label, key, type }) => (
                        <div key={key}>
                          <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">{label}</label>
                          <input
                            type={type}
                            value={(schoolProfile as any)[key] || ''}
                            onChange={e => setSchoolProfile({ ...schoolProfile, [key]: e.target.value })}
                            className="h-10 w-full rounded-lg border border-[#B7BBC9] bg-white px-3 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/20"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">Deskripsi / Visi</label>
                        <textarea
                          rows={3}
                          value={schoolProfile.description}
                          onChange={e => setSchoolProfile({ ...schoolProfile, description: e.target.value })}
                          className="w-full rounded-lg border border-[#B7BBC9] bg-white p-3 text-sm text-[#0D0C22] leading-relaxed focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/20"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">Alamat Lengkap</label>
                        <input
                          type="text"
                          value={schoolProfile.address}
                          onChange={e => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                          className="h-10 w-full rounded-lg border border-[#B7BBC9] bg-white px-3 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/20"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
                      >
                        <Save className="size-4" />
                        Simpan informasi
                      </button>
                    </div>
                  </form>
                )}

                {/* Featured Projects */}
                {profileSubTab === 'featured_projects' && (
                  <div className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                    <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">Kurasi Proyek Unggulan</h3>
                    <p className="mt-0.5 text-sm text-[#55576A]">
                      Tandai proyek terbaik untuk dipajang di halaman publik sekolah.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {allProjects.map(proj => (
                        <div
                          key={proj.id}
                          className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                            proj.isFeaturedSchool ? 'border-[#155DFC] bg-[#E8F0FF]/30' : 'border-[#E1E3EA] bg-[#F8F9FC]'
                          }`}
                        >
                          <div className="min-w-0 pr-3">
                            <span className="block truncate text-sm font-medium text-[#0D0C22]">{proj.title}</span>
                            <span className="mt-0.5 block text-xs text-[#55576A]">
                              Kreator: <strong>{proj.studentName}</strong> · {proj.category}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleFeaturedProject(proj.id, Boolean(proj.isFeaturedSchool))}
                            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              proj.isFeaturedSchool
                                ? 'bg-[#155DFC] text-white'
                                : 'border border-[#E1E3EA] bg-white text-[#55576A] hover:border-[#155DFC] hover:text-[#155DFC]'
                            }`}
                          >
                            <Star className={`size-3.5 ${proj.isFeaturedSchool ? 'fill-white' : ''}`} />
                            {proj.isFeaturedSchool ? 'Featured' : 'Tandai'}
                          </button>
                        </div>
                      ))}
                      {allProjects.length === 0 && (
                        <div className="col-span-full py-10 text-center text-sm text-[#55576A]">
                          Belum ada proyek siswa tersedia.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Featured Students */}
                {profileSubTab === 'featured_students' && (
                  <div className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                    <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">Kurasi Siswa Unggulan</h3>
                    <p className="mt-0.5 text-sm text-[#55576A]">
                      Pilih siswa berprestasi untuk ditampilkan di halaman publik sekolah.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {allStudents.map(student => (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                            student.isFeatured ? 'border-[#155DFC] bg-[#E8F0FF]/30' : 'border-[#E1E3EA] bg-[#F8F9FC]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={student.avatarUrl || '/creatorin/avatar.png'}
                              alt={student.name}
                              className="size-8 shrink-0 rounded-full border border-[#E1E3EA] object-cover"
                            />
                            <div className="min-w-0">
                              <span className="block truncate text-sm font-medium text-[#0D0C22]">{student.name}</span>
                              <span className="block text-xs text-[#55576A]">{student.major} · {student.classGrade}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleFeaturedStudent(student.id, Boolean(student.isFeatured))}
                            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              student.isFeatured
                                ? 'bg-[#155DFC] text-white'
                                : 'border border-[#E1E3EA] bg-white text-[#55576A] hover:border-[#155DFC] hover:text-[#155DFC]'
                            }`}
                          >
                            <Star className={`size-3.5 ${student.isFeatured ? 'fill-white' : ''}`} />
                            {student.isFeatured ? 'Featured' : 'Tandai'}
                          </button>
                        </div>
                      ))}
                      {allStudents.length === 0 && (
                        <div className="col-span-full py-10 text-center text-sm text-[#55576A]">
                          Belum ada siswa terdaftar.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {profileSubTab === 'achievements' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">
                        Prestasi & Penghargaan ({achievements.length})
                      </h3>
                      <button
                        onClick={() => setIsAddingAchievement(v => !v)}
                        className="flex items-center gap-2 rounded-xl bg-[#155DFC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
                      >
                        <Plus className="size-4" />
                        Tambah prestasi
                      </button>
                    </div>

                    {isAddingAchievement && (
                      <form onSubmit={handleAddAchievement} className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)] space-y-4">
                        <h4 className="font-semibold text-[#0D0C22]">Tambah Prestasi Baru</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">Nama Prestasi / Judul</label>
                            <input
                              type="text"
                              required
                              value={newAchievement.title || ''}
                              onChange={e => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                              className="h-10 w-full rounded-lg border border-[#B7BBC9] bg-white px-3 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">Kategori</label>
                            <select
                              value={newAchievement.category || 'Kompetisi'}
                              onChange={e => setNewAchievement(prev => ({ ...prev, category: e.target.value }))}
                              className="h-10 w-full rounded-lg border border-[#B7BBC9] bg-white px-3 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                            >
                              {['Kompetisi', 'Sertifikasi', 'Kolaborasi Industri', 'Penghargaan Akademik', 'Lainnya'].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">Tahun</label>
                            <input
                              type="text"
                              value={newAchievement.year || ''}
                              onChange={e => setNewAchievement(prev => ({ ...prev, year: e.target.value }))}
                              className="h-10 w-full rounded-lg border border-[#B7BBC9] bg-white px-3 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">URL Gambar (opsional)</label>
                            <input
                              type="text"
                              value={newAchievement.imageUrl || ''}
                              onChange={e => setNewAchievement(prev => ({ ...prev, imageUrl: e.target.value }))}
                              className="h-10 w-full rounded-lg border border-[#B7BBC9] bg-white px-3 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">Deskripsi</label>
                            <textarea
                              rows={2}
                              value={newAchievement.description || ''}
                              onChange={e => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full rounded-lg border border-[#B7BBC9] bg-white p-3 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/20"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingAchievement(false)}
                            className="rounded-lg border border-[#E1E3EA] bg-white px-4 py-2 text-sm font-medium text-[#55576A] hover:bg-[#F3F3F4]"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1248C7]"
                          >
                            Simpan
                          </button>
                        </div>
                      </form>
                    )}

                    {achievements.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {achievements.map(ach => (
                          <div key={ach.id} className="rounded-xl border border-[#E1E3EA] bg-white p-4 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="block text-sm font-semibold text-[#0D0C22]">{ach.title}</span>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <Badge variant="primary">{ach.category}</Badge>
                                  <span className="text-xs text-[#55576A]">{ach.year}</span>
                                </div>
                                {ach.description && <p className="mt-2 text-xs leading-relaxed text-[#55576A]">{ach.description}</p>}
                              </div>
                              <button
                                onClick={() => handleDeleteAchievement(ach.id)}
                                className="shrink-0 rounded-lg p-1.5 text-[#B7BBC9] transition-colors hover:bg-[#FEE4E2] hover:text-[#D92D20]"
                                title="Hapus prestasi"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !isAddingAchievement && (
                        <div className="rounded-xl border border-[#E1E3EA] bg-white py-14 text-center">
                          <Award className="mx-auto mb-3 size-8 text-[#B7BBC9]" />
                          <p className="font-medium text-[#0D0C22]">Belum ada prestasi tercatat</p>
                          <p className="mt-1 text-xs text-[#55576A]">Tambahkan penghargaan dan pencapaian sekolah untuk ditampilkan di profil publik.</p>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Display settings */}
                {profileSubTab === 'display_settings' && (
                  <div className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)] space-y-4">
                    <div>
                      <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">Urutan Section Halaman Publik</h3>
                      <p className="mt-0.5 text-sm text-[#55576A]">
                        Seret atau gunakan tombol untuk mengatur urutan tampilan section di halaman profil publik sekolah.
                      </p>
                    </div>
                    <div className="space-y-2">
                      {sectionOrderList.map((sectionId, index) => {
                        const labels: Record<string, string> = {
                          featured_projects: 'Proyek Unggulan',
                          students: 'Siswa Unggulan',
                          achievements: 'Prestasi & Penghargaan',
                          about: 'Tentang Sekolah',
                        };
                        return (
                          <div key={sectionId} className="flex items-center justify-between rounded-lg border border-[#E1E3EA] bg-[#F8F9FC] px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="font-['DM_Sans'] text-sm font-semibold text-[#B7BBC9]">{index + 1}</span>
                              <span className="text-sm font-medium text-[#0D0C22]">{labels[sectionId] || sectionId}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveSection(index, 'up')}
                                disabled={index === 0}
                                className="rounded-lg p-1.5 text-[#55576A] transition-colors hover:bg-[#E8F0FF] hover:text-[#155DFC] disabled:opacity-30"
                              >
                                <ArrowUp className="size-4" />
                              </button>
                              <button
                                onClick={() => handleMoveSection(index, 'down')}
                                disabled={index === sectionOrderList.length - 1}
                                className="rounded-lg p-1.5 text-[#55576A] transition-colors hover:bg-[#E8F0FF] hover:text-[#155DFC] disabled:opacity-30"
                              >
                                <ArrowDown className="size-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveSectionOrder}
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
                      >
                        <Save className="size-4" />
                        Simpan urutan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: SETTINGS ─────────────────────────────────────── */}
            {activeTab === 'settings' && !selectedStudentId && (
              <div className="mx-auto max-w-2xl space-y-6">
                <SectionHeader
                  title="Pengaturan"
                  description="Kelola konfigurasi akun dan preferensi dashboard sekolah."
                />
                <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                  <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">Akun & Sesi</h3>
                  <p className="mt-1 text-sm text-[#55576A]">Kelola informasi akun dan sesi login aktif.</p>
                  <div className="mt-4 space-y-0 divide-y divide-[#E1E3EA] text-sm">
                    {[
                      ['Nama', effectiveUser?.name || '—'],
                      ['Email', effectiveUser?.email || '—'],
                      ['Role', 'Sekolah / Mitra Vokasi'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-3">
                        <span className="text-[#55576A]">{label}</span>
                        <span className="font-medium text-[#0D0C22]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={async () => {
                        await signOut();
                        window.location.href = '/';
                      }}
                      className="flex items-center gap-2 rounded-xl border border-[#FCA5A5] px-4 py-2 text-sm font-semibold text-[#D92D20] transition-colors hover:bg-[#FEE4E2] cursor-pointer"
                    >
                      <LogOut className="size-4" />
                      Keluar dari akun
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
