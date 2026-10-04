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
  SchoolStudentItem,
} from '@/types';
import { schoolService, DEFAULT_RUBRIC, calculateFinalScore } from '@/services/schoolService';
import { useAuth } from '@/providers/AuthProvider';
import {
  LayoutDashboard,
  UserCheck,
  Award,
  Building2,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Star,
  SlidersHorizontal,
  RefreshCw,
  FolderGit2,
  Users,
  GraduationCap,
  Sparkles,
  LogOut,
  Sliders,
  FileCheck2,
  CheckCheck,
  ChevronDown,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Info,
} from 'lucide-react';

type DashboardTab = 'overview' | 'approval' | 'penilaian' | 'profile' | 'settings';
type AssessmentTab = 'rubrik' | 'profile' | 'projects';
type ProfileSubTab = 'info' | 'featured_projects' | 'featured_students' | 'achievements' | 'display_settings';

// ─── Design System Components (Aligned with design.md) ────────────────────────

function StatusBadge({ status }: { status: AssessmentStatus }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-semibold text-[#14532D] border border-[#86EFAC]/40">
        <CheckCircle2 className="size-3 text-[#16803C]" />
        Selesai
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4D6] px-2.5 py-0.5 text-xs font-semibold text-[#7A2E0E] border border-[#FDE68A]/60">
        <Clock className="size-3 text-[#B54708]" />
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F3F4] px-2.5 py-0.5 text-xs font-semibold text-[#55576A] border border-[#E1E3EA]">
      <Clock className="size-3 text-[#6F7285]" />
      Belum Dinilai
    </span>
  );
}

function FeedbackToast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  const isSuccess = type === 'success';
  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
        isSuccess
          ? 'border-[#86EFAC] bg-[#DCFCE7] text-[#14532D]'
          : 'border-[#FCA5A5] bg-[#FEE4E2] text-[#912018]'
      }`}
    >
      {isSuccess ? <CheckCircle2 className="size-4 shrink-0 text-[#16803C]" /> : <AlertCircle className="size-4 shrink-0 text-[#D92D20]" />}
      <span>{message}</span>
    </div>
  );
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-[#E1E3EA] pb-6">
      <div>
        <h1 className="font-['DM_Sans'] text-2xl sm:text-3xl font-semibold tracking-tight text-[#0D0C22]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-[#55576A] max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SchoolDashboardPage() {
  const { user, signOut } = useAuth();
  const isDev = process.env.NODE_ENV === 'development';
  const effectiveUser =
    user?.role === 'school'
      ? user
      : isDev
      ? {
          id: '55555555-5555-5555-5555-555555555555',
          name: user?.name || 'SMK Mitra Creatorin',
          email: user?.email || 'smkmitra@creatorin.id',
          role: 'school' as const,
          avatar: user?.avatar || '',
        }
      : user;

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

  // Filters for Penilaian
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssessmentStatus | 'all'>('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [majorFilter, setMajorFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  // Profile Management State
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('info');
  const [schoolProfile, setSchoolProfile] = useState<SchoolInfo | null>(null);
  const [achievements, setAchievements] = useState<SchoolAchievement[]>([]);
  const [allProjects, setAllProjects] = useState<SchoolStudentProjectItem[]>([]);
  const [allStudents, setAllStudents] = useState<SchoolStudentItem[]>([]);
  const [sectionOrderList, setSectionOrderList] = useState<string[]>([
    'featured_projects',
    'students',
    'achievements',
    'about',
  ]);
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
      const [
        overviewData,
        approvalsData,
        studentsData,
        publicProfile,
        studentProjects,
        schoolStudents,
      ] = await Promise.all([
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
      setSectionOrderList(
        publicProfile.school.sectionOrder || [
          'featured_projects',
          'students',
          'achievements',
          'about',
        ]
      );
    } catch (err) {
      console.error('Failed to load school dashboard data:', err);
      setLoadError(err instanceof Error ? err.message : 'Gagal memuat data sekolah');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      const fetchDetail = async () => {
        const detail = await schoolService.getStudentAssessmentDetail(selectedStudentId);
        if (detail) {
          setStudentDetail(detail);
          setRubricItems(
            detail.assessment.rubricItems.length > 0
              ? detail.assessment.rubricItems
              : DEFAULT_RUBRIC
          );
        }
      };
      fetchDetail();
    }
  }, [selectedStudentId]);

  const handleApprovalAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const success = await schoolService.updateApprovalStatus(id, status);
      if (success) {
        setApprovals((prev) => prev.filter((item) => item.id !== id));
        setApprovalFeedback(
          status === 'approved'
            ? 'Permohonan relasi siswa disetujui. Siswa aktif masuk ke penilaian rubrik.'
            : 'Permohonan relasi siswa telah ditolak.'
        );
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
      alert('Gagal memproses permohonan siswa');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchYear = yearFilter === 'all' || s.graduationYear === yearFilter;
      const matchMajor =
        majorFilter === 'all' || s.major.toLowerCase() === majorFilter.toLowerCase();
      const matchClass =
        classFilter === 'all' || s.classGrade.toLowerCase().includes(classFilter.toLowerCase());
      return matchSearch && matchStatus && matchYear && matchMajor && matchClass;
    });
  }, [students, searchQuery, statusFilter, yearFilter, majorFilter, classFilter]);

  const currentFinalScore = useMemo(() => calculateFinalScore(rubricItems), [rubricItems]);
  const filledRubricCount = useMemo(
    () => rubricItems.filter((item) => typeof item.score === 'number' && item.score > 0).length,
    [rubricItems]
  );

  const handleScoreChange = (index: number, newScore: number) => {
    setRubricItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], score: Math.min(100, Math.max(0, newScore)) };
      return updated;
    });
  };

  const handleSaveAssessment = async (targetStatus: AssessmentStatus) => {
    if (!selectedStudentId) return;
    setIsSavingAssessment(true);
    try {
      const result = await schoolService.saveAssessment(
        selectedStudentId,
        rubricItems,
        targetStatus,
        studentDetail?.assessment.notes
      );
      setAssessmentFeedback(
        targetStatus === 'completed'
          ? `Penilaian berhasil diterbitkan dengan nilai akhir ${result.finalScore} / 100.`
          : 'Draf penilaian berhasil disimpan.'
      );
      setTimeout(() => setAssessmentFeedback(null), 4000);
      const [updatedStudents, updatedOverview] = await Promise.all([
        schoolService.getStudentsForAssessment(),
        schoolService.getDashboardOverview(),
      ]);
      setStudents(updatedStudents);
      setOverview(updatedOverview);
      if (studentDetail) {
        setStudentDetail({
          ...studentDetail,
          assessment: {
            ...studentDetail.assessment,
            status: targetStatus,
            finalScore: result.finalScore,
            rubricItems,
          },
        });
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
      setProfileFeedback('Informasi profil sekolah berhasil diperbarui.');
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Gagal memperbarui profil sekolah');
    }
  };

  const handleToggleFeaturedStudent = async (studentId: string, currentFeatured: boolean) => {
    try {
      await schoolService.toggleFeaturedStudent(studentId, !currentFeatured);
      setAllStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, isFeatured: !currentFeatured } : s))
      );
    } catch (err) {
      console.error('Toggle featured student error:', err);
      alert('Gagal mengubah status featured siswa');
    }
  };

  const handleToggleFeaturedProject = async (projectId: string, currentFeatured: boolean) => {
    try {
      await schoolService.toggleFeaturedProject(projectId, !currentFeatured);
      setAllProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, isFeaturedSchool: !currentFeatured } : p))
      );
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
      setAchievements((prev) => [added, ...prev]);
      setIsAddingAchievement(false);
      setNewAchievement({
        title: '',
        description: '',
        year: new Date().getFullYear().toString(),
        category: 'Kompetisi',
        imageUrl: '',
      });
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
      setAchievements((prev) => prev.filter((a) => a.id !== id));
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
      setProfileFeedback('Urutan section profil publik berhasil disimpan.');
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
        <div className="w-full max-w-md rounded-2xl border border-[#E1E3EA] bg-white p-8 text-center shadow-[0_1px_3px_rgba(13,12,34,0.06)]">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[#FFF4D6]">
            <ShieldAlert className="size-6 text-[#B54708]" />
          </div>
          <h1 className="font-['DM_Sans'] text-xl font-semibold text-[#0D0C22]">
            Khusus Akun Sekolah
          </h1>
          <p className="mt-2 text-sm text-[#55576A] leading-relaxed">
            Anda saat ini masuk sebagai{' '}
            <strong className="text-[#0D0C22] capitalize">{user?.role || 'pengunjung'}</strong>.
            Halaman ini dikhususkan bagi koordinator dan guru pembimbing kemitraan vokasi SMK.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#155DFC] text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
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
        <div className="w-full max-w-md rounded-2xl border border-[#FCA5A5] bg-[#FEE4E2] p-8 text-center space-y-4">
          <AlertCircle className="mx-auto size-8 text-[#D92D20]" />
          <h2 className="font-['DM_Sans'] text-lg font-semibold text-[#912018]">
            Gagal Memuat Data
          </h2>
          <p className="text-sm text-[#912018]/80">{loadError}</p>
          <button
            onClick={() => loadData()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#FCA5A5] bg-white px-4 py-2.5 text-xs font-semibold text-[#D92D20] hover:bg-[#FEE4E2] transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  const navItems: { id: DashboardTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'approval',
      label: 'Approval Relasi',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    {
      id: 'penilaian',
      label: 'Penilaian Siswa',
      icon: Award,
      badge: students.length > 0 ? students.length : undefined,
    },
    { id: 'profile', label: 'Profil Sekolah', icon: Building2 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#F8F9FC] text-[#0D0C22]">
      {/* ─── Institutional Sidebar (Desktop) ─────────────────────────────────── */}
      <aside
        id="school-institutional-sidebar"
        data-testid="school-institutional-sidebar"
        className="hidden w-64 shrink-0 flex-col border-r border-[#E1E3EA] bg-white md:flex"
      >
        {/* School Profile Branding */}
        <div className="flex items-center gap-3 border-b border-[#E1E3EA] p-5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-[#E1E3EA] bg-[#F8F9FC]">
            <img
              src={schoolProfile?.logoUrl || '/creatorin/avatar.png'}
              alt={schoolProfile?.name || 'Logo'}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-[#0D0C22]">
                {schoolProfile?.name || effectiveUser?.name || 'SMK Mitra Creatorin'}
              </p>
              <ShieldCheck className="size-3.5 shrink-0 text-[#155DFC]" />
            </div>
            <p className="text-xs text-[#55576A]">Mitra Pendidikan Vokasi</p>
          </div>
        </div>

        {isDev && !user && (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-[#FDE68A]/60 bg-[#FFF4D6] px-3 py-2 text-xs font-medium text-[#7A2E0E]">
            <Sparkles className="size-3.5 shrink-0 text-[#B54708]" />
            Mode Demo Aktif
          </div>
        )}

        {/* Sidebar Nav */}
        <nav aria-label="Navigasi Dashboard" className="flex-1 space-y-1 p-3">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F7285]">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedStudentId(null);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#E8F0FF] text-[#155DFC] font-semibold'
                    : 'text-[#55576A] hover:bg-[#F3F3F4] hover:text-[#0D0C22]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`size-4.5 ${isActive ? 'text-[#155DFC]' : 'text-[#6F7285]'}`} />
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.id === 'approval'
                        ? 'bg-[#FFF4D6] text-[#7A2E0E]'
                        : 'bg-[#F3F3F4] text-[#55576A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-[#E1E3EA] p-4 space-y-2">
          <Link
            id="btn-public-school-profile"
            href={`/school/${schoolProfile?.slug || 'smk-mitra'}`}
            target="_blank"
            className="flex w-full items-center justify-between rounded-xl border border-[#E1E3EA] bg-[#F8F9FC] px-3.5 py-2.5 text-xs font-semibold text-[#0D0C22] transition-colors hover:border-[#155DFC] hover:bg-[#E8F0FF] hover:text-[#155DFC]"
          >
            <span className="flex items-center gap-2">
              <Eye className="size-4 text-[#155DFC]" />
              Halaman Publik
            </span>
            <ExternalLink className="size-3.5 text-[#6F7285]" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 shrink-0 rounded-full border border-[#E1E3EA] bg-[#F8F9FC] overflow-hidden">
                <img
                  src={effectiveUser?.avatar || '/creatorin/avatar.png'}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#0D0C22]">
                  {effectiveUser?.name || 'SMK Mitra'}
                </p>
                <p className="truncate text-[10px] text-[#6F7285]">
                  {effectiveUser?.email || 'sekolah@creatorin.id'}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                window.location.href = '/';
              }}
              title="Keluar"
              className="rounded-md p-1.5 text-[#55576A] transition-colors hover:bg-[#FEE4E2] hover:text-[#D92D20] cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Header & Horizontal Navigation ───────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-30 border-b border-[#E1E3EA] bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img
              src={schoolProfile?.logoUrl || '/creatorin/avatar.png'}
              alt="Logo"
              className="size-7 rounded-lg border border-[#E1E3EA] object-cover"
            />
            <span className="text-sm font-semibold text-[#0D0C22] truncate max-w-[180px]">
              {schoolProfile?.name || effectiveUser?.name || 'Sekolah'}
            </span>
          </div>
          <Link
            href={`/school/${schoolProfile?.slug || 'smk-mitra'}`}
            target="_blank"
            className="flex items-center gap-1 rounded-lg border border-[#E1E3EA] px-2.5 py-1 text-xs font-semibold text-[#155DFC]"
          >
            Profil <ExternalLink className="size-3" />
          </Link>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedStudentId(null);
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive ? 'bg-[#E8F0FF] text-[#155DFC]' : 'text-[#55576A] hover:text-[#0D0C22]'
                }`}
              >
                <Icon className="size-3.5" />
                {item.label}
                {item.badge !== undefined && (
                  <span className="rounded-full bg-[#FFF4D6] px-1.5 text-[10px] font-bold text-[#7A2E0E]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Content Canvas ────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop Topbar */}
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-[#E1E3EA] bg-white px-8 md:flex">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6F7285]">Dashboard Sekolah</span>
            <span className="text-[#B7BBC9]">/</span>
            <span className="font-semibold text-[#0D0C22]">
              {activeTab === 'overview'
                ? 'Overview Kinerja'
                : activeTab === 'approval'
                ? 'Approval Relasi'
                : activeTab === 'penilaian'
                ? selectedStudentId
                  ? 'Rubrik Penilaian Siswa'
                  : 'Penilaian Siswa'
                : activeTab === 'profile'
                ? 'Profil Sekolah'
                : 'Pengaturan Akun'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/school/${schoolProfile?.slug || 'smk-mitra'}`}
              target="_blank"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E1E3EA] bg-white px-3.5 text-xs font-semibold text-[#0D0C22] transition-colors hover:border-[#155DFC] hover:bg-[#E8F0FF] hover:text-[#155DFC]"
            >
              <Eye className="size-3.5 text-[#155DFC]" />
              Pratinjau Halaman Publik
              <ExternalLink className="size-3 text-[#6F7285]" />
            </Link>
          </div>
        </header>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-1 items-center justify-center pt-24 md:pt-0">
            <div className="space-y-3 text-center">
              <RefreshCw className="mx-auto size-7 animate-spin text-[#155DFC]" />
              <p className="text-sm font-medium text-[#55576A]">Memuat data institusi sekolah…</p>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && (
          <main
            id="school-dashboard-main-content"
            className="flex-1 overflow-y-auto px-4 py-8 pt-28 sm:px-6 md:pt-8 lg:px-8 max-w-[1400px] w-full mx-auto"
          >
            {/* ══════════════════════════════════════════════════════════════
                TAB 1: OVERVIEW
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && !selectedStudentId && overview && (
              <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                  <div>
                    <span className="text-xs font-semibold text-[#155DFC] uppercase tracking-wider">
                      Ruang Kerja Sekolah Vokasi
                    </span>
                    <h1 className="mt-1 font-['DM_Sans'] text-2xl sm:text-3xl font-semibold tracking-tight text-[#0D0C22]">
                      Selamat Datang, {schoolProfile?.name || effectiveUser?.name || 'SMK Mitra'}
                    </h1>
                    <p className="mt-1 text-sm text-[#55576A] leading-relaxed max-w-2xl">
                      Kelola permohonan relasi siswa, lakukan asesmen rubrik industri, dan tampilkan karya terbaik ke calon mitra UMKM.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => setActiveTab('penilaian')}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#155DFC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
                    >
                      <Award className="size-4" />
                      Mulai Penilaian
                    </button>
                    {pendingApprovalsCount > 0 && (
                      <button
                        onClick={() => setActiveTab('approval')}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#FDE68A] bg-[#FFF4D6] px-4 text-sm font-semibold text-[#7A2E0E] transition-colors hover:bg-[#FEF08A]"
                      >
                        <UserCheck className="size-4 text-[#B54708]" />
                        {pendingApprovalsCount} Permohonan
                      </button>
                    )}
                  </div>
                </div>

                {/* 4 Core KPI Metric Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    {
                      label: 'Total Siswa',
                      value: overview.totalStudents,
                      icon: Users,
                      color: 'text-[#155DFC]',
                      bg: 'bg-[#E8F0FF]',
                    },
                    {
                      label: 'Siswa Aktif',
                      value: overview.activeStudents,
                      icon: CheckCircle2,
                      color: 'text-[#16803C]',
                      bg: 'bg-[#DCFCE7]',
                    },
                    {
                      label: 'Menunggu Approval',
                      value: overview.pendingApproval,
                      icon: Clock,
                      color: 'text-[#B54708]',
                      bg: 'bg-[#FFF4D6]',
                    },
                    {
                      label: 'Sudah Dinilai',
                      value: overview.gradedStudents,
                      icon: Award,
                      color: 'text-[#087BB8]',
                      bg: 'bg-[#E1F6FF]',
                    },
                    {
                      label: 'Belum Dinilai',
                      value: overview.ungradedStudents,
                      icon: FileCheck2,
                      color: 'text-[#55576A]',
                      bg: 'bg-[#F3F3F4]',
                    },
                    {
                      label: 'Karya Siswa',
                      value: overview.totalProjects,
                      icon: FolderGit2,
                      color: 'text-[#03ACFD]',
                      bg: 'bg-[#E1F6FF]',
                    },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-[#E1E3EA] bg-white p-4 shadow-[0_1px_2px_rgba(13,12,34,0.06)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#55576A]">{label}</span>
                        <div className={`rounded-lg p-1.5 ${bg}`}>
                          <Icon className={`size-4 ${color}`} />
                        </div>
                      </div>
                      <p className="mt-3 font-['DM_Sans'] text-2xl font-semibold text-[#0D0C22]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Progress & Activities Split */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Left Column: Kemajuan Penilaian */}
                  <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)] flex flex-col justify-between">
                    <div>
                      <h2 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">
                        Kemajuan Asesmen Rubrik
                      </h2>
                      <p className="mt-1 text-xs text-[#55576A]">
                        Distribusi status penilaian rubrik kompetensi siswa aktif semester ini.
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-5">
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#F3F3F4]">
                          <div
                            className="h-full bg-[#155DFC] transition-all duration-500"
                            style={{
                              width: `${
                                overview.activeStudents > 0
                                  ? (overview.assessmentProgress.graded / overview.activeStudents) * 100
                                  : 0
                              }%`,
                            }}
                          />
                          <div
                            className="h-full bg-[#FDE68A] transition-all duration-500"
                            style={{
                              width: `${
                                overview.activeStudents > 0
                                  ? (overview.assessmentProgress.draft / overview.activeStudents) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-[#55576A]">
                          <span className="font-semibold text-[#0D0C22]">
                            {Math.round(
                              (overview.assessmentProgress.graded / (overview.activeStudents || 1)) * 100
                            )}
                            % Selesai Dinilai
                          </span>
                          <span>Target Kurikulum Vokasi</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="mt-6 space-y-2.5 border-t border-[#E1E3EA] pt-4">
                        {[
                          {
                            label: 'Sudah Selesai Dinilai',
                            val: overview.assessmentProgress.graded,
                            dot: 'bg-[#155DFC]',
                          },
                          {
                            label: 'Draf Penilaian',
                            val: overview.assessmentProgress.draft,
                            dot: 'bg-[#FDE68A]',
                          },
                          {
                            label: 'Belum Dinilai',
                            val: overview.assessmentProgress.ungraded,
                            dot: 'bg-[#DDE0E8]',
                          },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-[#55576A]">
                              <span className={`size-2.5 rounded-full ${row.dot}`} />
                              {row.label}
                            </span>
                            <span className="font-semibold text-[#0D0C22]">{row.val} siswa</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('penilaian')}
                      className="mt-6 w-full rounded-xl border border-[#E1E3EA] bg-white py-2.5 text-xs font-semibold text-[#0D0C22] transition-colors hover:border-[#155DFC] hover:bg-[#E8F0FF] hover:text-[#155DFC]"
                    >
                      Buka Daftar Penilaian Siswa
                    </button>
                  </div>

                  {/* Right Column: Recent Activities */}
                  <div className="lg:col-span-2 rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                    <div className="flex items-center justify-between border-b border-[#E1E3EA] pb-4">
                      <div>
                        <h2 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">
                          Aktivitas Terbaru Siswa
                        </h2>
                        <p className="mt-0.5 text-xs text-[#55576A]">
                          Proyek yang diselesaikan, brief yang dikerjakan, dan pencapaian vokasi.
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[#6F7285]">Realtime</span>
                    </div>

                    <div className="mt-4 divide-y divide-[#E1E3EA]">
                      {overview.recentActivities.length > 0 ? (
                        overview.recentActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0"
                          >
                            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF]">
                              <Award className="size-4 text-[#155DFC]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm leading-relaxed text-[#0D0C22]">
                                <strong className="font-semibold">{activity.studentName}</strong>{' '}
                                <span className="text-[#55576A]">{activity.description}</span>
                              </p>
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#6F7285]">
                                <Clock className="size-3" />
                                {activity.timestamp}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center">
                          <CheckCheck className="mx-auto mb-2 size-8 text-[#B7BBC9]" />
                          <p className="text-sm font-medium text-[#0D0C22]">
                            Belum ada aktivitas baru hari ini
                          </p>
                          <p className="mt-1 text-xs text-[#55576A]">
                            Pembaruan portofolio siswa akan tercatat otomatis di sini.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 2: APPROVAL RELASI SISWA
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'approval' && !selectedStudentId && (
              <div className="space-y-6">
                <PageHeader
                  title="Approval Relasi Siswa"
                  description="Verifikasi permohonan siswa yang mendaftarkan sekolah ini sebagai almamater vokasi mereka. Siswa yang disetujui langsung dapat dinilai dengan rubrik kompetensi industri."
                  action={
                    pendingApprovalsCount > 0 ? (
                      <span className="rounded-full bg-[#FFF4D6] px-3 py-1 text-xs font-semibold text-[#7A2E0E] border border-[#FDE68A]/60">
                        {pendingApprovalsCount} menunggu tinjauan
                      </span>
                    ) : undefined
                  }
                />

                {approvalFeedback && <FeedbackToast message={approvalFeedback} />}

                {/* Approvals Table */}
                <div className="overflow-hidden rounded-xl border border-[#E1E3EA] bg-white shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#E1E3EA] bg-[#F8F9FC] text-xs font-semibold text-[#55576A]">
                          <th className="px-5 py-3.5">Identitas Siswa</th>
                          <th className="px-4 py-3.5">Jurusan</th>
                          <th className="px-4 py-3.5">Kelas</th>
                          <th className="px-4 py-3.5">Tahun Lulus</th>
                          <th className="px-4 py-3.5">Tanggal Permohonan</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E3EA] text-sm">
                        {approvals.length > 0 ? (
                          approvals.map((student) => (
                            <tr key={student.id} className="transition-colors hover:bg-[#F8F9FC]">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={student.avatarUrl || '/creatorin/avatar.png'}
                                    alt={student.name}
                                    className="size-9 shrink-0 rounded-full border border-[#E1E3EA] object-cover"
                                  />
                                  <div className="min-w-0">
                                    <span className="block font-semibold text-[#0D0C22]">
                                      {student.name}
                                    </span>
                                    {student.nisn && (
                                      <span className="block text-xs text-[#55576A]">
                                        NISN: {student.nisn}
                                      </span>
                                    )}
                                    <span className="block text-xs text-[#6F7285]">
                                      {student.email}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 font-medium text-[#0D0C22]">
                                {student.major}
                              </td>
                              <td className="px-4 py-4 text-[#55576A]">{student.classGrade}</td>
                              <td className="px-4 py-4 text-[#55576A]">{student.graduationYear}</td>
                              <td className="px-4 py-4 text-[#55576A]">
                                {new Date(student.requestDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4D6] px-2.5 py-0.5 text-xs font-semibold text-[#7A2E0E] border border-[#FDE68A]/60">
                                  <Clock className="size-3 text-[#B54708]" />
                                  Menunggu
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleApprovalAction(student.id, 'approved')}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#155DFC] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1248C7]"
                                  >
                                    <Check className="size-3.5" />
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => handleApprovalAction(student.id, 'rejected')}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E3EA] bg-white px-3 py-1.5 text-xs font-semibold text-[#55576A] transition-colors hover:border-[#FCA5A5] hover:bg-[#FEE4E2] hover:text-[#912018]"
                                  >
                                    <XCircle className="size-3.5" />
                                    Tolak
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-16 text-center">
                              <UserCheck className="mx-auto mb-3 size-9 text-[#B7BBC9]" />
                              <p className="font-semibold text-[#0D0C22]">
                                Tidak Ada Permohonan Tertunda
                              </p>
                              <p className="mt-1 text-xs text-[#55576A] max-w-sm mx-auto">
                                Semua pendaftaran relasi siswa telah diverifikasi atau belum ada pengajuan baru dari siswa.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 3: PENILAIAN SISWA (LIST)
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'penilaian' && !selectedStudentId && (
              <div className="space-y-6">
                <PageHeader
                  title="Penilaian Kompetensi Siswa"
                  description="Evaluasi kesiapan kerja siswa vokasi berdasarkan standar rubrik industri. Klik pada baris siswa untuk membuka formulir penilaian berbobot."
                />

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Total Siswa Terdaftar', value: students.length, color: 'text-[#0D0C22]' },
                    {
                      label: 'Selesai Dinilai',
                      value: students.filter((s) => s.status === 'completed').length,
                      color: 'text-[#16803C]',
                    },
                    {
                      label: 'Draft Tersimpan',
                      value: students.filter((s) => s.status === 'draft').length,
                      color: 'text-[#B54708]',
                    },
                    {
                      label: 'Belum Dinilai',
                      value: students.filter((s) => s.status === 'not_started').length,
                      color: 'text-[#55576A]',
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-[#E1E3EA] bg-white p-4 shadow-[0_1px_2px_rgba(13,12,34,0.06)]"
                    >
                      <span className="text-xs font-medium text-[#55576A]">{label}</span>
                      <p className={`mt-1 font-['DM_Sans'] text-2xl font-semibold ${color}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1 rounded-xl border border-[#E1E3EA] bg-[#F3F3F4] p-1 shrink-0">
                    {(['all', 'not_started', 'draft', 'completed'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          statusFilter === key
                            ? 'bg-white text-[#0D0C22] shadow-[0_1px_2px_rgba(13,12,34,0.06)]'
                            : 'text-[#55576A] hover:text-[#0D0C22]'
                        }`}
                      >
                        {key === 'all'
                          ? 'Semua'
                          : key === 'not_started'
                          ? 'Belum Dinilai'
                          : key === 'draft'
                          ? 'Draft'
                          : 'Selesai'}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6F7285]" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nama, NISN, atau email…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#E1E3EA] bg-white pl-10 pr-3 text-sm text-[#0D0C22] placeholder:text-[#6F7285] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/15"
                    />
                  </div>

                  {/* Dropdowns */}
                  <div className="flex items-center gap-2 shrink-0">
                    {[
                      {
                        value: yearFilter,
                        onChange: setYearFilter,
                        options: [
                          ['all', 'Tahun: Semua'],
                          ['2026', '2026'],
                          ['2025', '2025'],
                          ['2024', '2024'],
                        ],
                      },
                      {
                        value: majorFilter,
                        onChange: setMajorFilter,
                        options: [
                          ['all', 'Jurusan: Semua'],
                          ['RPL', 'RPL'],
                          ['DKV', 'DKV'],
                          ['Multimedia', 'Multimedia'],
                          ['Animasi', 'Animasi'],
                        ],
                      },
                      {
                        value: classFilter,
                        onChange: setClassFilter,
                        options: [
                          ['all', 'Kelas: Semua'],
                          ['XII', 'Kelas XII'],
                          ['XI', 'Kelas XI'],
                          ['X', 'Kelas X'],
                        ],
                      },
                    ].map(({ value, onChange, options }, i) => (
                      <select
                        key={i}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-10 rounded-xl border border-[#E1E3EA] bg-white px-3 text-xs font-semibold text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                      >
                        {options.map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    ))}

                    {(statusFilter !== 'all' ||
                      yearFilter !== 'all' ||
                      majorFilter !== 'all' ||
                      classFilter !== 'all' ||
                      searchQuery !== '') && (
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setYearFilter('all');
                          setMajorFilter('all');
                          setClassFilter('all');
                          setSearchQuery('');
                        }}
                        className="px-2 text-xs font-semibold text-[#155DFC] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Students Assessment Table */}
                <div className="overflow-hidden rounded-xl border border-[#E1E3EA] bg-white shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#E1E3EA] bg-[#F8F9FC] text-xs font-semibold text-[#55576A]">
                          <th className="px-5 py-3.5">Siswa</th>
                          <th className="px-4 py-3.5">Jurusan & Kelas</th>
                          <th className="px-4 py-3.5">Tahun Lulus</th>
                          <th className="px-4 py-3.5">Portofolio</th>
                          <th className="px-4 py-3.5">Status Asesmen</th>
                          <th className="px-4 py-3.5">Nilai Akhir</th>
                          <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E3EA] text-sm">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <tr
                              key={student.studentId}
                              onClick={() => setSelectedStudentId(student.studentId)}
                              className="group cursor-pointer transition-colors hover:bg-[#F8F9FC]"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={student.avatarUrl || '/creatorin/avatar.png'}
                                    alt={student.name}
                                    className="size-9 shrink-0 rounded-full border border-[#E1E3EA] object-cover"
                                  />
                                  <div className="min-w-0">
                                    <span className="block font-semibold text-[#0D0C22] transition-colors group-hover:text-[#155DFC]">
                                      {student.name}
                                    </span>
                                    {student.nisn && (
                                      <span className="block text-xs text-[#55576A]">
                                        NISN: {student.nisn}
                                      </span>
                                    )}
                                    <span className="block text-xs text-[#6F7285]">
                                      {student.email}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="block font-medium text-[#0D0C22]">
                                  {student.major}
                                </span>
                                <span className="block text-xs text-[#55576A]">
                                  {student.classGrade}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-[#55576A]">
                                {student.graduationYear}
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-1.5 text-xs text-[#55576A] font-medium">
                                  <FolderGit2 className="size-3.5 text-[#03ACFD]" />
                                  {student.projectCount} karya
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <StatusBadge status={student.status} />
                              </td>
                              <td className="px-4 py-4">
                                {student.finalScore !== null ? (
                                  <span className="font-['DM_Sans'] text-base font-bold text-[#155DFC]">
                                    {student.finalScore}{' '}
                                    <span className="text-xs font-normal text-[#55576A]">/ 100</span>
                                  </span>
                                ) : (
                                  <span className="text-[#B7BBC9]">—</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-xl border border-[#E1E3EA] bg-white px-3 py-1.5 text-xs font-semibold text-[#0D0C22] transition-colors group-hover:border-[#155DFC] group-hover:bg-[#E8F0FF] group-hover:text-[#155DFC]"
                                >
                                  Buka Asesmen <ChevronRight className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-16 text-center">
                              <Users className="mx-auto mb-3 size-9 text-[#B7BBC9]" />
                              <p className="font-semibold text-[#0D0C22]">
                                Tidak Ada Siswa yang Sesuai Filter
                              </p>
                              <p className="mt-1 text-xs text-[#55576A]">
                                Coba sesuaikan kata kunci pencarian atau reset filter di atas.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 3 (DETAIL): FORMULIR RUBRIK PENILAIAN SISWA
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'penilaian' && selectedStudentId && studentDetail && (
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#55576A] transition-colors hover:text-[#0D0C22]"
                >
                  <ArrowLeft className="size-4" />
                  Kembali ke Daftar Siswa
                </button>

                {assessmentFeedback && <FeedbackToast message={assessmentFeedback} />}

                {/* Student Hero Header Card */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                  <div className="flex items-center gap-4">
                    <img
                      src={studentDetail.student.avatarUrl || '/creatorin/avatar.png'}
                      alt={studentDetail.student.name}
                      className="size-14 shrink-0 rounded-full border border-[#E1E3EA] object-cover"
                    />
                    <div>
                      <h2 className="font-['DM_Sans'] text-xl font-bold text-[#0D0C22]">
                        {studentDetail.student.name}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#55576A]">
                        <span className="font-semibold text-[#155DFC]">
                          {studentDetail.student.major}
                        </span>
                        <span>•</span>
                        <span>{studentDetail.student.classGrade}</span>
                        {studentDetail.student.nisn && (
                          <>
                            <span>•</span>
                            <span>NISN: {studentDetail.student.nisn}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Lulusan {studentDetail.student.graduationYear}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={studentDetail.assessment.status} />
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex border-b border-[#E1E3EA]">
                  {[
                    { id: 'rubrik' as AssessmentTab, label: 'Rubrik Penilaian' },
                    { id: 'profile' as AssessmentTab, label: 'Profil Siswa' },
                    {
                      id: 'projects' as AssessmentTab,
                      label: `Karya Siswa (${studentDetail.projects.length})`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAssessmentSubTab(tab.id)}
                      className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                        assessmentSubTab === tab.id
                          ? 'border-[#155DFC] text-[#155DFC]'
                          : 'border-transparent text-[#55576A] hover:text-[#0D0C22]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sub-Tab 1: Formulir Rubrik Penilaian */}
                {assessmentSubTab === 'rubrik' && (
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left 2 Cols: Form */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                        <div className="border-b border-[#E1E3EA] pb-4">
                          <h3 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">
                            Standar Kompetensi Industri
                          </h3>
                          <p className="mt-1 text-xs text-[#55576A]">
                            Evaluasi 4 pilar kompetensi. Nilai akhir dihitung secara berbobot:{' '}
                            <code className="rounded bg-[#E8F0FF] px-1.5 py-0.5 text-[#155DFC] font-semibold">
                              Σ (skor × bobot)
                            </code>
                          </p>
                        </div>

                        <div className="mt-6 space-y-5">
                          {rubricItems.map((item, idx) => (
                            <div
                              key={item.name}
                              className="rounded-xl border border-[#E1E3EA] bg-[#F8F9FC] p-5 space-y-4"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <span className="block font-semibold text-sm text-[#0D0C22]">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-[#55576A]">
                                    Bobot Aspek: <strong className="text-[#155DFC]">{item.weight}%</strong>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-[#55576A]">Skor:</span>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={item.score}
                                    onChange={(e) =>
                                      handleScoreChange(idx, parseInt(e.target.value) || 0)
                                    }
                                    className="h-9 w-18 rounded-lg border border-[#B7BBC9] bg-white text-center font-['DM_Sans'] text-sm font-bold text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* Interactive Range Slider */}
                              <div className="space-y-1.5">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={item.score}
                                  onChange={(e) =>
                                    handleScoreChange(idx, parseInt(e.target.value) || 0)
                                  }
                                  className="w-full cursor-pointer accent-[#155DFC]"
                                />
                                <div className="flex justify-between text-[11px] text-[#6F7285]">
                                  <span>0 (Kurang)</span>
                                  <span>60 (Cukup)</span>
                                  <span>75 (Kompeten)</span>
                                  <span>90+ (Sangat Mahir)</span>
                                </div>
                              </div>

                              {item.notes && (
                                <p className="text-xs italic text-[#55576A] border-t border-[#E1E3EA] pt-2">
                                  Catatan Panduan: {item.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right 1 Col: Summary & Actions (Sticky) */}
                    <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
                      <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_3px_rgba(13,12,34,0.06)] space-y-5">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#6F7285]">
                            Progres Asesmen
                          </span>
                          <p className="mt-1 text-sm font-semibold text-[#0D0C22]">
                            {filledRubricCount} dari {rubricItems.length} aspek telah dinilai
                          </p>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F3F3F4]">
                            <div
                              className="h-full rounded-full bg-[#155DFC] transition-all duration-300"
                              style={{
                                width: `${(filledRubricCount / rubricItems.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Calculated Final Score */}
                        <div className="rounded-xl bg-[#F8F9FC] border border-[#E1E3EA] p-5 text-center">
                          <span className="text-xs font-semibold text-[#55576A]">
                            Nilai Akhir Terhitung
                          </span>
                          <p className="mt-1 font-['DM_Sans'] text-4xl font-bold text-[#155DFC]">
                            {currentFinalScore}
                            <span className="text-sm font-normal text-[#55576A]"> / 100</span>
                          </p>
                          <span className="mt-1 block text-[11px] text-[#6F7285]">
                            Otomatis dihitung berbobot
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                          <button
                            onClick={() => handleSaveAssessment('completed')}
                            disabled={isSavingAssessment}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-sm font-semibold text-white transition-colors hover:bg-[#1248C7] disabled:opacity-60"
                          >
                            <Check className="size-4" />
                            Selesaikan & Terbitkan
                          </button>
                          <button
                            onClick={() => handleSaveAssessment('draft')}
                            disabled={isSavingAssessment}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#E1E3EA] bg-white text-sm font-medium text-[#0D0C22] transition-colors hover:bg-[#F8F9FC] disabled:opacity-60"
                          >
                            <Save className="size-3.5 text-[#6F7285]" />
                            Simpan sebagai Draf
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Profil Siswa */}
                {assessmentSubTab === 'profile' && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                      <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">
                        Tentang Siswa
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#55576A]">
                        {studentDetail.student.bio || 'Belum ada bio yang dicantumkan oleh siswa.'}
                      </p>
                      <div className="mt-6 border-t border-[#E1E3EA] pt-4">
                        <span className="text-xs font-semibold text-[#0D0C22]">
                          Keahlian & Kompetensi
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {studentDetail.student.skills.length > 0 ? (
                            studentDetail.student.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-lg bg-[#E8F0FF] px-2.5 py-1 text-xs font-medium text-[#0D2A75]"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#6F7285]">Belum menambahkan skill.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                      <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">
                        Data Akademik
                      </h3>
                      <div className="mt-3 divide-y divide-[#E1E3EA] text-sm">
                        {[
                          ['Jurusan', studentDetail.student.major],
                          ['Kelas', studentDetail.student.classGrade],
                          ['Tahun Kelulusan', studentDetail.student.graduationYear],
                          ['NISN', studentDetail.student.nisn || '—'],
                          ['Email Akun', studentDetail.student.email],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between py-3">
                            <span className="text-[#55576A]">{label}</span>
                            <span className="font-medium text-[#0D0C22]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Proyek Karya Siswa */}
                {assessmentSubTab === 'projects' && (
                  <div className="space-y-4">
                    <h3 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">
                      Karya yang Diunggah ({studentDetail.projects.length})
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {studentDetail.projects.length > 0 ? (
                        studentDetail.projects.map((proj) => (
                          <div
                            key={proj.id}
                            className="overflow-hidden rounded-xl border border-[#E1E3EA] bg-white shadow-[0_1px_2px_rgba(13,12,34,0.06)] transition-all hover:border-[#155DFC]"
                          >
                            <div className="relative h-40 bg-[#F3F3F4]">
                              {proj.coverImage ? (
                                <img
                                  src={proj.coverImage}
                                  alt={proj.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <FolderGit2 className="size-8 text-[#B7BBC9]" />
                                </div>
                              )}
                              <span className="absolute left-3 top-3 rounded-full bg-[#0D0C22]/80 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                                {proj.category}
                              </span>
                            </div>
                            <div className="p-4">
                              <h4 className="truncate text-sm font-semibold text-[#0D0C22]">
                                {proj.title}
                              </h4>
                              <div className="mt-2 flex items-center justify-between text-xs text-[#55576A]">
                                <span>{proj.viewsCount} dilihat</span>
                                {proj.isFeaturedSchool && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[#B54708]">
                                    <Star className="size-3 fill-amber-400 text-amber-400" />
                                    Unggulan Sekolah
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full rounded-xl border border-[#E1E3EA] bg-white py-14 text-center">
                          <FolderGit2 className="mx-auto mb-3 size-8 text-[#B7BBC9]" />
                          <p className="font-medium text-[#0D0C22]">Belum ada karya</p>
                          <p className="mt-1 text-xs text-[#55576A]">
                            Siswa belum mempublikasikan karya proyek di marketplace.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 4: PROFIL PUBLIK SEKOLAH
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'profile' && !selectedStudentId && schoolProfile && (
              <div className="space-y-6">
                <PageHeader
                  title="Profil & Etalase Sekolah"
                  description="Kelola informasi institusi, kurasi siswa dan karya unggulan, sertifikasi prestasi, serta urutan layout yang tampil di halaman profil publik sekolah."
                  action={
                    <Link
                      href={`/school/${schoolProfile.slug || 'smk-mitra'}`}
                      target="_blank"
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#155DFC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
                    >
                      <Eye className="size-4" />
                      Lihat Halaman Publik
                    </Link>
                  }
                />

                {profileFeedback && <FeedbackToast message={profileFeedback} />}

                {/* Sub-tab Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-[#E1E3EA] bg-[#F3F3F4] p-1.5">
                  {(
                    [
                      { id: 'info', label: 'Info & Kontak', icon: Building2 },
                      { id: 'featured_projects', label: 'Kurasi Proyek', icon: Sparkles },
                      { id: 'featured_students', label: 'Kurasi Siswa', icon: GraduationCap },
                      { id: 'achievements', label: 'Prestasi & Sertifikasi', icon: Award },
                      { id: 'display_settings', label: 'Urutan Tampilan', icon: SlidersHorizontal },
                    ] as { id: ProfileSubTab; label: string; icon: React.ElementType }[]
                  ).map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setProfileSubTab(sub.id)}
                        className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                          profileSubTab === sub.id
                            ? 'bg-white text-[#155DFC] shadow-[0_1px_2px_rgba(13,12,34,0.06)]'
                            : 'text-[#55576A] hover:text-[#0D0C22]'
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {sub.label}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Tab 1: Info & Kontak */}
                {profileSubTab === 'info' && (
                  <form
                    onSubmit={handleUpdateSchoolProfile}
                    className="space-y-6 rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]"
                  >
                    <div className="border-b border-[#E1E3EA] pb-3">
                      <h3 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">
                        Identitas & Kontak Resmi Sekolah
                      </h3>
                      <p className="mt-1 text-xs text-[#55576A]">
                        Informasi ini akan ditampilkan pada header dan footer halaman profil publik.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { label: 'Nama Sekolah', key: 'name', type: 'text' },
                        { label: 'Tagline / Slogan', key: 'tagline', type: 'text' },
                        { label: 'URL Logo', key: 'logoUrl', type: 'text' },
                        { label: 'URL Foto Sampul (Cover)', key: 'coverUrl', type: 'text' },
                        { label: 'Website Resmi', key: 'website', type: 'text' },
                        { label: 'Email Resmi', key: 'email', type: 'email' },
                        { label: 'Nomor Telepon', key: 'phone', type: 'text' },
                        { label: 'Kota / Kabupaten', key: 'city', type: 'text' },
                      ].map(({ label, key, type }) => (
                        <div key={key}>
                          <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">
                            {label}
                          </label>
                          <input
                            type={type}
                            value={(schoolProfile as any)[key] || ''}
                            onChange={(e) =>
                              setSchoolProfile({ ...schoolProfile, [key]: e.target.value })
                            }
                            className="h-10 w-full rounded-xl border border-[#E1E3EA] bg-white px-3.5 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/15"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">
                          Deskripsi & Visi Vokasi
                        </label>
                        <textarea
                          rows={3}
                          value={schoolProfile.description}
                          onChange={(e) =>
                            setSchoolProfile({ ...schoolProfile, description: e.target.value })
                          }
                          className="w-full rounded-xl border border-[#E1E3EA] bg-white p-3.5 text-sm text-[#0D0C22] leading-relaxed focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/15"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">
                          Alamat Lengkap
                        </label>
                        <input
                          type="text"
                          value={schoolProfile.address}
                          onChange={(e) =>
                            setSchoolProfile({ ...schoolProfile, address: e.target.value })
                          }
                          className="h-10 w-full rounded-xl border border-[#E1E3EA] bg-white px-3.5 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/15"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-[#E1E3EA]">
                      <button
                        type="submit"
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#155DFC] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
                      >
                        <Save className="size-4" />
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-Tab 2: Kurasi Proyek Unggulan */}
                {profileSubTab === 'featured_projects' && (
                  <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                    <div className="border-b border-[#E1E3EA] pb-3">
                      <h3 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">
                        Kurasi Karya Siswa Unggulan
                      </h3>
                      <p className="mt-1 text-xs text-[#55576A]">
                        Pilih karya terbaik yang layak menjadi etalase utama sekolah saat dilihat mitra UMKM.
                      </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {allProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                            proj.isFeaturedSchool
                              ? 'border-[#155DFC] bg-[#E8F0FF]/30'
                              : 'border-[#E1E3EA] bg-[#F8F9FC]'
                          }`}
                        >
                          <div className="min-w-0 pr-3">
                            <span className="block truncate text-sm font-semibold text-[#0D0C22]">
                              {proj.title}
                            </span>
                            <span className="mt-1 block text-xs text-[#55576A]">
                              Kreator: <strong>{proj.studentName}</strong> · {proj.category}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleFeaturedProject(proj.id, Boolean(proj.isFeaturedSchool))
                            }
                            className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              proj.isFeaturedSchool
                                ? 'bg-[#155DFC] text-white'
                                : 'border border-[#E1E3EA] bg-white text-[#55576A] hover:border-[#155DFC] hover:text-[#155DFC]'
                            }`}
                          >
                            <Star
                              className={`size-3.5 ${
                                proj.isFeaturedSchool ? 'fill-white' : ''
                              }`}
                            />
                            {proj.isFeaturedSchool ? 'Unggulan' : 'Tandai'}
                          </button>
                        </div>
                      ))}
                      {allProjects.length === 0 && (
                        <div className="col-span-full py-12 text-center text-sm text-[#55576A]">
                          Belum ada karya siswa yang tersedia.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Kurasi Siswa Unggulan */}
                {profileSubTab === 'featured_students' && (
                  <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                    <div className="border-b border-[#E1E3EA] pb-3">
                      <h3 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">
                        Kurasi Siswa Berprestasi
                      </h3>
                      <p className="mt-1 text-xs text-[#55576A]">
                        Tampilkan profil siswa dengan rekam jejak terbaik di halaman sekolah.
                      </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {allStudents.map((student) => (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                            student.isFeatured
                              ? 'border-[#155DFC] bg-[#E8F0FF]/30'
                              : 'border-[#E1E3EA] bg-[#F8F9FC]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={student.avatarUrl || '/creatorin/avatar.png'}
                              alt={student.name}
                              className="size-9 shrink-0 rounded-full border border-[#E1E3EA] object-cover"
                            />
                            <div className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-[#0D0C22]">
                                {student.name}
                              </span>
                              <span className="block text-xs text-[#55576A]">
                                {student.major} · {student.classGrade}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleFeaturedStudent(student.id, Boolean(student.isFeatured))
                            }
                            className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              student.isFeatured
                                ? 'bg-[#155DFC] text-white'
                                : 'border border-[#E1E3EA] bg-white text-[#55576A] hover:border-[#155DFC] hover:text-[#155DFC]'
                            }`}
                          >
                            <Star
                              className={`size-3.5 ${
                                student.isFeatured ? 'fill-white' : ''
                              }`}
                            />
                            {student.isFeatured ? 'Unggulan' : 'Tandai'}
                          </button>
                        </div>
                      ))}
                      {allStudents.length === 0 && (
                        <div className="col-span-full py-12 text-center text-sm text-[#55576A]">
                          Belum ada siswa terdaftar.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 4: Prestasi & Sertifikasi */}
                {profileSubTab === 'achievements' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">
                          Prestasi & Penghargaan Sekolah ({achievements.length})
                        </h3>
                        <p className="mt-0.5 text-xs text-[#55576A]">
                          Capaian institusi, kejuaraan LKS, dan sertifikasi kemitraan industri.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddingAchievement((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
                      >
                        <Plus className="size-4" />
                        Tambah Prestasi
                      </button>
                    </div>

                    {isAddingAchievement && (
                      <form
                        onSubmit={handleAddAchievement}
                        className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)] space-y-4"
                      >
                        <h4 className="font-['DM_Sans'] font-semibold text-[#0D0C22]">
                          Tambah Data Prestasi Baru
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">
                              Nama Penghargaan / Gelar
                            </label>
                            <input
                              type="text"
                              required
                              value={newAchievement.title || ''}
                              onChange={(e) =>
                                setNewAchievement((prev) => ({ ...prev, title: e.target.value }))
                              }
                              className="h-10 w-full rounded-xl border border-[#E1E3EA] bg-white px-3.5 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">
                              Kategori
                            </label>
                            <select
                              value={newAchievement.category || 'Kompetisi'}
                              onChange={(e) =>
                                setNewAchievement((prev) => ({ ...prev, category: e.target.value }))
                              }
                              className="h-10 w-full rounded-xl border border-[#E1E3EA] bg-white px-3 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                            >
                              {[
                                'Kompetisi',
                                'Sertifikasi',
                                'Kolaborasi Industri',
                                'Penghargaan Akademik',
                                'Lainnya',
                              ].map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">
                              Tahun Perolehan
                            </label>
                            <input
                              type="text"
                              value={newAchievement.year || ''}
                              onChange={(e) =>
                                setNewAchievement((prev) => ({ ...prev, year: e.target.value }))
                              }
                              className="h-10 w-full rounded-xl border border-[#E1E3EA] bg-white px-3.5 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">
                              URL Dokumentasi (Opsional)
                            </label>
                            <input
                              type="text"
                              value={newAchievement.imageUrl || ''}
                              onChange={(e) =>
                                setNewAchievement((prev) => ({
                                  ...prev,
                                  imageUrl: e.target.value,
                                }))
                              }
                              className="h-10 w-full rounded-xl border border-[#E1E3EA] bg-white px-3.5 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-[#0D0C22]">
                              Keterangan Singkat
                            </label>
                            <textarea
                              rows={2}
                              value={newAchievement.description || ''}
                              onChange={(e) =>
                                setNewAchievement((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-[#E1E3EA] bg-white p-3 text-sm text-[#0D0C22] focus:border-[#155DFC] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-[#E1E3EA]">
                          <button
                            type="button"
                            onClick={() => setIsAddingAchievement(false)}
                            className="rounded-xl border border-[#E1E3EA] bg-white px-4 py-2 text-sm font-medium text-[#55576A] hover:bg-[#F3F3F4]"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="rounded-xl bg-[#155DFC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1248C7]"
                          >
                            Simpan Prestasi
                          </button>
                        </div>
                      </form>
                    )}

                    {achievements.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {achievements.map((ach) => (
                          <div
                            key={ach.id}
                            className="rounded-xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="block font-semibold text-sm text-[#0D0C22]">
                                  {ach.title}
                                </span>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="rounded-full bg-[#E8F0FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#0D2A75]">
                                    {ach.category}
                                  </span>
                                  <span className="text-xs text-[#55576A]">{ach.year}</span>
                                </div>
                                {ach.description && (
                                  <p className="mt-2 text-xs leading-relaxed text-[#55576A]">
                                    {ach.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteAchievement(ach.id)}
                                className="rounded-lg p-1.5 text-[#B7BBC9] transition-colors hover:bg-[#FEE4E2] hover:text-[#D92D20]"
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
                          <p className="font-semibold text-[#0D0C22]">Belum ada prestasi tercatat</p>
                          <p className="mt-1 text-xs text-[#55576A]">
                            Tambahkan riwayat sertifikasi dan kejuaraan sekolah untuk meningkatkan reputasi vokasi.
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Sub-Tab 5: Urutan Tampilan Profil Publik */}
                {profileSubTab === 'display_settings' && (
                  <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)] space-y-5">
                    <div>
                      <h3 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22]">
                        Tata Letak Halaman Publik
                      </h3>
                      <p className="mt-0.5 text-xs text-[#55576A]">
                        Atur urutan penempatan section di etalase publik sekolah Anda.
                      </p>
                    </div>

                    <div className="space-y-2 max-w-xl">
                      {sectionOrderList.map((sectionId, index) => {
                        const labels: Record<string, string> = {
                          featured_projects: 'Karya Siswa Unggulan',
                          students: 'Siswa Berprestasi',
                          achievements: 'Prestasi & Sertifikasi',
                          about: 'Tentang & Profil Institusi',
                        };
                        return (
                          <div
                            key={sectionId}
                            className="flex items-center justify-between rounded-xl border border-[#E1E3EA] bg-[#F8F9FC] px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-['DM_Sans'] text-sm font-bold text-[#155DFC]">
                                {index + 1}
                              </span>
                              <span className="text-sm font-semibold text-[#0D0C22]">
                                {labels[sectionId] || sectionId}
                              </span>
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

                    <div className="flex justify-end pt-2 border-t border-[#E1E3EA]">
                      <button
                        onClick={handleSaveSectionOrder}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#155DFC] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1248C7]"
                      >
                        <Save className="size-4" />
                        Simpan Urutan Tampilan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 5: PENGATURAN AKUN
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'settings' && !selectedStudentId && (
              <div className="space-y-6 max-w-2xl">
                <PageHeader
                  title="Pengaturan Akun"
                  description="Kelola kredensial instansi dan preferensi keamanan akun sekolah."
                />

                <div className="rounded-xl border border-[#E1E3EA] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,0.06)] space-y-6">
                  <div>
                    <h3 className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">
                      Informasi Sesi Login
                    </h3>
                    <p className="mt-0.5 text-xs text-[#55576A]">
                      Akun terdaftar sebagai entitas institusi pendidikan resmi.
                    </p>
                  </div>

                  <div className="divide-y divide-[#E1E3EA] text-sm">
                    {[
                      ['Nama Akun', effectiveUser?.name || '—'],
                      ['Alamat Email', effectiveUser?.email || '—'],
                      ['Peran / Role', 'Sekolah / Mitra Pendidikan Vokasi'],
                      ['ID Instansi', effectiveUser?.id || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-3">
                        <span className="text-[#55576A]">{label}</span>
                        <span className="font-medium text-[#0D0C22]">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#E1E3EA]">
                    <button
                      onClick={async () => {
                        await signOut();
                        window.location.href = '/';
                      }}
                      className="flex items-center gap-2 rounded-xl border border-[#FCA5A5] px-4 py-2 text-sm font-semibold text-[#D92D20] transition-colors hover:bg-[#FEE4E2] cursor-pointer"
                    >
                      <LogOut className="size-4" />
                      Keluar dari Sesi Ini
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
