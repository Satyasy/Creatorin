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
  Sliders,
  Eye,
  AlertCircle,
  ShieldAlert,
  BarChart3,
  Sparkles,
  Building2,
  ArrowUp,
  ArrowDown,
  Star,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  Bell,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

type DashboardTab = 'overview' | 'approval' | 'penilaian' | 'profile' | 'settings';
type AssessmentTab = 'rubrik' | 'profile' | 'projects';
type ProfileSubTab = 'info' | 'featured_projects' | 'featured_students' | 'achievements' | 'display_settings';

export function SchoolDashboardPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Overview Data
  const [overview, setOverview] = useState<SchoolDashboardOverview | null>(null);

  // Approvals Data
  const [approvals, setApprovals] = useState<StudentApprovalItem[]>([]);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Penilaian Data
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

  // School Profile Data & Sub-tabs
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

  // Load Initial Data
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

  useEffect(() => {
    loadData();
  }, []);

  // When a student is selected for assessment
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
    } else {
      setStudentDetail(null);
    }
  }, [selectedStudentId]);

  // Handle Approve / Reject
  const handleApprovalAction = async (id: string, status: 'approved' | 'rejected') => {
    const success = await schoolService.updateApprovalStatus(id, status);
    if (success) {
      setApprovals(prev =>
        prev.map(a => (a.id === id ? { ...a, status } : a))
      );
      setApprovalFeedback(
        status === 'approved'
          ? 'Siswa berhasil disetujui! Status kini aktif dan siswa dapat langsung dinilai pada menu Penilaian.'
          : 'Permohonan relasi siswa telah ditolak.'
      );
      setTimeout(() => setApprovalFeedback(null), 4000);

      // Refresh overview, students assessment & approved students
      const [updatedOverview, updatedStudents, updatedSchoolStudents] = await Promise.all([
        schoolService.getDashboardOverview(),
        schoolService.getStudentsForAssessment(),
        schoolService.getSchoolStudents(),
      ]);
      setOverview(updatedOverview);
      setStudents(updatedStudents);
      setAllStudents(updatedSchoolStudents);
    }
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        searchQuery === '' ||
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

  // Rubric Score Calculation
  const currentFinalScore = useMemo(() => {
    return calculateFinalScore(rubricItems);
  }, [rubricItems]);

  const filledRubricCount = useMemo(() => {
    return rubricItems.filter(item => typeof item.score === 'number' && item.score > 0).length;
  }, [rubricItems]);

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
      const result = await schoolService.saveAssessment(
        selectedStudentId,
        rubricItems,
        targetStatus,
        studentDetail?.assessment.notes
      );

      setAssessmentFeedback(
        targetStatus === 'completed'
          ? `Penilaian berhasil diselesaikan dengan nilai akhir ${result.finalScore} / 100.`
          : 'Draf penilaian berhasil disimpan.'
      );
      setTimeout(() => setAssessmentFeedback(null), 4000);

      // Refresh students & overview
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
      console.error(err);
    } finally {
      setIsSavingAssessment(false);
    }
  };

  // Toggle Featured Project
  const handleToggleFeaturedProject = async (projectId: string) => {
    const proj = allProjects.find(p => p.id === projectId);
    if (!proj) return;
    const newFeatured = !proj.isFeaturedSchool;
    await schoolService.toggleFeaturedProject(projectId, newFeatured);
    setAllProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, isFeaturedSchool: newFeatured } : p))
    );
    setProfileFeedback(
      newFeatured
        ? `Project "${proj.title}" ditambahkan ke Featured Project sekolah.`
        : `Project "${proj.title}" dihapus dari Featured Project.`
    );
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  // Toggle Featured Student
  const handleToggleFeaturedStudent = async (studentId: string) => {
    const std = allStudents.find(s => s.id === studentId);
    if (!std) return;
    const newFeatured = !std.isFeatured;
    await schoolService.toggleFeaturedStudent(studentId, newFeatured);
    setAllStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, isFeatured: newFeatured } : s))
    );
    setProfileFeedback(
      newFeatured
        ? `Siswa "${std.name}" ditandai sebagai Siswa Unggulan sekolah.`
        : `Tanda sorotan siswa "${std.name}" telah dilepas.`
    );
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  // Move Section Order
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrderList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setSectionOrderList(newOrder);
  };

  // Save Section Order
  const handleSaveSectionOrder = async () => {
    await schoolService.updateSectionOrder(sectionOrderList);
    if (schoolProfile) {
      setSchoolProfile({ ...schoolProfile, sectionOrder: sectionOrderList });
    }
    setProfileFeedback('Urutan section pada public profile sekolah berhasil disimpan.');
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  // Add Achievement
  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievement.title) return;

    const saved = await schoolService.saveAchievement(newAchievement);
    setAchievements(prev => [saved, ...prev]);
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
  };

  const handleDeleteAchievement = async (id: string) => {
    await schoolService.deleteAchievement(id);
    setAchievements(prev => prev.filter(a => a.id !== id));
    setProfileFeedback('Prestasi berhasil dihapus.');
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  // Update Profile Info
  const handleUpdateSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolProfile) return;
    await schoolService.updateSchoolProfile(schoolProfile.id, schoolProfile);
    setProfileFeedback('Informasi profil sekolah berhasil diperbarui.');
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#155DFC] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Memuat Sistem Dashboard Sekolah...</p>
        </div>
      </div>
    );
  }

  // RBAC Access Guard for School
  if (user?.role !== 'school') {
    return (
      <div 
        id="school-rbac-restricted"
        data-testid="school-rbac-restricted"
        className="flex-1 w-full bg-[#0B132B] text-white flex items-center justify-center p-6 min-h-[85vh]"
      >
        <div className="max-w-md w-full bg-[#111C33] border border-slate-700/60 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="size-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold tracking-wide uppercase border border-slate-700">
              Hak Akses Terbatas (RBAC)
            </span>
            <h1 className="text-xl font-bold text-white">Khusus Akun Sekolah & Institusi Vokasi</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Anda saat ini terhubung sebagai{' '}
              <strong className="text-white capitalize">{user?.role || 'Pengunjung'}</strong>{' '}
              ({user?.name || user?.email || 'Tamu'}). Dashboard ini dikhususkan bagi guru pembimbing dan koordinator kemitraan industri SMK.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/"
              className="inline-flex w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs transition items-center justify-center"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) return <div className="min-h-[70vh] grid place-items-center p-8 text-sm text-red-700" role="alert">{loadError}</div>;

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div className="flex-1 w-full bg-[#F8FAFC] flex flex-col md:flex-row md:h-full md:min-h-0 md:overflow-hidden min-h-screen">
      {/* ======================================================== */}
      {/* 1. DISTINCT SCHOOL INSTITUTIONAL SIDEBAR (Desktop)        */}
      {/* ======================================================== */}
      <aside 
        id="school-institutional-sidebar"
        data-testid="school-institutional-sidebar"
        className="hidden md:flex md:w-64 md:h-full md:shrink-0 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex-col select-none justify-between z-20"
      >
        <div className="flex flex-col min-h-0">
          {/* School Brand Identity Header */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <img
                src={schoolProfile?.logoUrl || '/creatorin/avatar.png'}
                alt={schoolProfile?.name || 'School Logo'}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-md shrink-0 bg-white"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-bold text-white truncate leading-tight">
                  {schoolProfile?.name || user?.name || 'Sekolah'}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Mitra Vokasi A
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Primary Navigation */}
          <nav aria-label="Navigasi Sekolah" className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Vokasi
            </div>

            {/* Menu 1: Overview */}
            <button
              id="sidebar-nav-overview"
              onClick={() => {
                setActiveTab('overview');
                setSelectedStudentId(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview' && !selectedStudentId
                  ? 'bg-[#155DFC] text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </button>

            {/* Menu 2: Approval */}
            <button
              id="sidebar-nav-approval"
              onClick={() => {
                setActiveTab('approval');
                setSelectedStudentId(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'approval' && !selectedStudentId
                  ? 'bg-[#155DFC] text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Approval</span>
              </div>
              {pendingApprovalsCount > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'approval'
                      ? 'bg-white text-[#155DFC]'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {/* Menu 3: Penilaian */}
            <button
              id="sidebar-nav-penilaian"
              onClick={() => {
                setActiveTab('penilaian');
                setSelectedStudentId(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'penilaian'
                  ? 'bg-[#155DFC] text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 shrink-0" />
                <span>Penilaian</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'penilaian'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {students.length}
              </span>
            </button>

            {/* Sub-menu indicators under Penilaian if active */}
            {activeTab === 'penilaian' && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className={`w-full text-left text-[11px] py-1 px-2 rounded-lg transition ${
                    !selectedStudentId ? 'text-white font-bold bg-slate-800/60' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  • Student List & Filter
                </button>
                {selectedStudentId && (
                  <span className="block text-[11px] py-1 px-2 rounded-lg text-emerald-400 font-bold bg-slate-800/60 truncate">
                    • Rubrik: {studentDetail?.student.name || 'Siswa'}
                  </span>
                )}
              </div>
            )}

            {/* Menu 4: Profile */}
            <button
              id="sidebar-nav-profile"
              onClick={() => {
                setActiveTab('profile');
                setSelectedStudentId(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile' && !selectedStudentId
                  ? 'bg-[#155DFC] text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Profile</span>
            </button>

            {/* Sub-menu indicators under Profile if active */}
            {activeTab === 'profile' && (
              <div className="pl-9 pr-2 py-1 space-y-0.5">
                {[
                  { id: 'info', label: 'Profile Information' },
                  { id: 'featured_projects', label: 'Featured Projects' },
                  { id: 'featured_students', label: 'Featured Students' },
                  { id: 'achievements', label: 'Achievements' },
                  { id: 'display_settings', label: 'Display Settings' },
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setProfileSubTab(sub.id as ProfileSubTab)}
                    className={`w-full text-left text-[11px] py-1 px-2 rounded-lg transition block ${
                      profileSubTab === sub.id
                        ? 'text-white font-bold bg-slate-800/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • {sub.label}
                  </button>
                ))}
              </div>
            )}

            {/* Menu 5: Settings */}
            <button
              id="sidebar-nav-settings"
              onClick={() => {
                setActiveTab('settings');
                setSelectedStudentId(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings' && !selectedStudentId
                  ? 'bg-[#155DFC] text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer & Public Profile Gateway */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 space-y-2">
          <Link
            id="btn-public-school-profile"
            href={`/school/${schoolProfile?.slug || 'smk-kreatif-indonesia'}`}
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Public School Profile</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          {/* Current PIC User Card */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={user?.avatar || '/creatorin/avatar.png'}
                alt="PIC Avatar"
                className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <span className="font-semibold text-white truncate block text-[11px]">
                  {user?.name || 'SMK Telkom Sidoarjo'}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  Guru Pembimbing / Hubin
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Keluar Akun"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE SCHOOL NAVIGATION BAR (Header + Horizontal Pills)  */}
      {/* ======================================================== */}
      <div className="md:hidden w-full bg-[#0F172A] text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        {/* Mobile Header Row */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={schoolProfile?.logoUrl || '/creatorin/avatar.png'}
              alt={schoolProfile?.name || 'School Logo'}
              className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0 bg-white"
            />
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white truncate">
                {schoolProfile?.name || user?.name || 'Sekolah'}
              </h2>
              <span className="text-[10px] font-semibold text-blue-400 block">
                Dashboard Vokasi SMK
              </span>
            </div>
          </div>

          <Link
            href={`/school/${schoolProfile?.slug || 'smk-kreatif-indonesia'}`}
            target="_blank"
            className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
          >
            <span>Profil</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Mobile Horizontal Pill Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-2 scrollbar-none bg-[#0B132B]">
          <button
            onClick={() => { setActiveTab('overview'); setSelectedStudentId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview' && !selectedStudentId
                ? 'bg-[#155DFC] text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => { setActiveTab('approval'); setSelectedStudentId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'approval' && !selectedStudentId
                ? 'bg-[#155DFC] text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Approval</span>
            {pendingApprovalsCount > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('penilaian'); setSelectedStudentId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'penilaian'
                ? 'bg-[#155DFC] text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Penilaian</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('profile'); setSelectedStudentId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile' && !selectedStudentId
                ? 'bg-[#155DFC] text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setSelectedStudentId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings' && !selectedStudentId
                ? 'bg-[#155DFC] text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DEDICATED SCHOOL MAIN WORKSPACE CONTAINER             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 md:h-full md:overflow-hidden">
        {/* Dedicated Institutional Topbar */}
        <header className="hidden md:flex h-14 bg-white border-b border-slate-200/90 px-6 items-center justify-between shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-200/80">
              TA 2025/2026 (Semester Genap)
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-600 capitalize">
              {activeTab === 'overview' && 'Overview Kinerja & Portfolio Siswa'}
              {activeTab === 'approval' && 'Manajemen Permohonan Relasi Siswa'}
              {activeTab === 'penilaian' && (selectedStudentId ? `Detail Rubrik Penilaian Siswa` : 'Daftar Penilaian Siswa Terakreditasi')}
              {activeTab === 'profile' && `School Profile Management — ${profileSubTab.replace('_', ' ')}`}
              {activeTab === 'settings' && 'Konfigurasi & Pengaturan Sekolah'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sync Status */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tersinkronisasi</span>
            </div>

            {/* Public profile quick link */}
            <Link
              href={`/school/${schoolProfile?.slug || 'smk-kreatif-indonesia'}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Pratinjau Halaman Publik</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div 
          id="school-dashboard-main-content" 
          className="flex-1 min-w-0 md:overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW                                          */}
          {/* ======================================================== */}
          {activeTab === 'overview' && !selectedStudentId && overview && (
            <div className="space-y-7">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                      Dashboard Vokasi
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500 font-medium">Tahun Ajaran 2025/2026</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0D0C22] mt-1">Overview Kinerja Siswa</h1>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    Kondisi seluruh siswa yang terhubung dengan sekolah, kemajuan asesmen rubrik industri, dan aktivitas terbaru.
                  </p>
                </div>
              </div>

              {/* 3. Overview Summary KPI Cards (Matching PRD #3) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kondisi Siswa Terhubung
                  </h3>
                  <span className="text-[11px] text-slate-400">Terupdate realtime</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {/* Total Siswa */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Total Siswa</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{overview.totalStudents}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <Users className="w-3 h-3" />
                      <span>Terdaftar</span>
                    </div>
                  </div>

                  {/* Siswa Aktif */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Siswa Aktif</span>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{overview.activeStudents}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Telah disetujui</span>
                    </div>
                  </div>

                  {/* Pending Approval */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Pending Approval</span>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{overview.pendingApproval}</p>
                    <button
                      onClick={() => setActiveTab('approval')}
                      className="inline-flex items-center gap-1 text-[11px] text-[#155DFC] hover:underline mt-1 cursor-pointer font-semibold"
                    >
                      <span>Tinjau</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Sudah Dinilai */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Sudah Dinilai</span>
                    <p className="text-2xl font-bold text-[#155DFC] mt-1">{overview.gradedStudents}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <Award className="w-3 h-3 text-[#155DFC]" />
                      <span>Selesai asesmen</span>
                    </div>
                  </div>

                  {/* Belum Dinilai */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Belum Dinilai</span>
                    <p className="text-2xl font-bold text-slate-700 mt-1">{overview.ungradedStudents}</p>
                    <button
                      onClick={() => {
                        setActiveTab('penilaian');
                        setStatusFilter('not_started');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-[#155DFC] hover:underline mt-1 cursor-pointer font-semibold"
                    >
                      <span>Mulai nilai</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total Project */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Total Project</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{overview.totalProjects}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <FolderGit2 className="w-3 h-3" />
                      <span>Portofolio siswa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prominent Visual Data Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="school-overview-charts">
                {/* Chart 1: Tren Aktivitas Proyek (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <TrendingUp className="size-5" />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                            Tren & Distribusi Status Proyek Siswa
                          </h2>
                          <p className="text-[11px] sm:text-xs text-slate-500">
                            Kemajuan portofolio industri siswa 6 bulan terakhir
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        +18.4% Semester Ini
                      </span>
                    </div>

                    {/* Chart Visualizer */}
                    <div className="mt-6 pt-2">
                      <div className="h-44 sm:h-52 w-full flex items-end justify-between gap-3 px-2 border-b border-slate-100 pb-3">
                        {[
                          { month: 'Nov', active: 6, review: 2, completed: 8, revision: 1 },
                          { month: 'Des', active: 8, review: 3, completed: 11, revision: 2 },
                          { month: 'Jan', active: 10, review: 4, completed: 14, revision: 1 },
                          { month: 'Feb', active: 13, review: 5, completed: 19, revision: 2 },
                          { month: 'Mar', active: 15, review: 7, completed: 23, revision: 3 },
                          { month: 'Apr', active: 18, review: 6, completed: 28, revision: 2 },
                        ].map((item) => {
                          const total = item.active + item.review + item.completed + item.revision;
                          const maxVal = 60;
                          const heightPct = Math.min(100, Math.round((total / maxVal) * 100));

                          return (
                            <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                              <div className="relative w-full flex flex-col items-center justify-end h-40">
                                <div
                                  style={{ height: `${heightPct}%` }}
                                  className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col justify-end bg-slate-100 transition-all duration-300 group-hover:scale-105"
                                >
                                  <div style={{ height: `${(item.completed / total) * 100}%` }} className="bg-emerald-500 w-full" />
                                  <div style={{ height: `${(item.review / total) * 100}%` }} className="bg-blue-600 w-full" />
                                  <div style={{ height: `${(item.active / total) * 100}%` }} className="bg-amber-400 w-full" />
                                  <div style={{ height: `${(item.revision / total) * 100}%` }} className="bg-rose-400 w-full" />
                                </div>
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-20 shadow-md">
                                  {total} Proyek
                                </div>
                              </div>
                              <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900">
                                {item.month}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="size-2.5 rounded-sm bg-emerald-500" />
                        Selesai
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="size-2.5 rounded-sm bg-blue-600" />
                        Review Guru
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="size-2.5 rounded-sm bg-amber-400" />
                        Aktif Dikerjakan
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      Total {overview.totalProjects} Proyek Siswa
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Hasil penilaian siswa</h2>
                  <p className="mt-2 text-xs text-slate-500">Berdasarkan rubrik yang telah disimpan sekolah.</p>
                  <p className="mt-8 text-3xl font-bold text-slate-900">
                    {students.filter(student => student.status === 'completed').length
                      ? (students.filter(student => student.status === 'completed').reduce((sum, student) => sum + (student.finalScore || 0), 0) / students.filter(student => student.status === 'completed').length).toFixed(1)
                      : '0'} <span className="text-base font-normal text-slate-400">/ 100 rata-rata</span>
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
                    <div><strong className="block text-lg">{overview.assessmentProgress.graded}</strong>Selesai</div>
                    <div><strong className="block text-lg">{overview.assessmentProgress.draft}</strong>Draf</div>
                    <div><strong className="block text-lg">{overview.assessmentProgress.ungraded}</strong>Belum dinilai</div>
                  </div>
                </div>
              </div>

              {/* Assessment Progress & Recent Student Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assessment Progress Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Assessment Progress</h3>
                    <span className="text-xs font-semibold text-[#155DFC]">
                      {Math.round((overview.assessmentProgress.graded / (overview.totalStudents || 1)) * 100)}%
                    </span>
                  </div>

                  {/* Progress bar visual */}
                  <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(overview.assessmentProgress.graded / (overview.totalStudents || 1)) * 100}%` }}
                      className="bg-[#155DFC] h-full"
                      title={`Sudah Dinilai: ${overview.assessmentProgress.graded}`}
                    />
                    <div
                      style={{ width: `${(overview.assessmentProgress.draft / (overview.totalStudents || 1)) * 100}%` }}
                      className="bg-amber-400 h-full"
                      title={`Draft: ${overview.assessmentProgress.draft}`}
                    />
                    <div
                      style={{ width: `${(overview.assessmentProgress.ungraded / (overview.totalStudents || 1)) * 100}%` }}
                      className="bg-neutral-200 h-full"
                      title={`Belum Dinilai: ${overview.assessmentProgress.ungraded}`}
                    />
                  </div>

                  {/* Legend list */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#155DFC]" />
                        Sudah Dinilai
                      </span>
                      <span className="font-bold text-slate-900">{overview.assessmentProgress.graded}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        Draft Tersimpan
                      </span>
                      <span className="font-bold text-slate-900">{overview.assessmentProgress.draft}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                        Belum Dinilai
                      </span>
                      <span className="font-bold text-slate-900">{overview.assessmentProgress.ungraded}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('penilaian')}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 rounded-xl transition cursor-pointer"
                    >
                      Buka Menu Penilaian Siswa
                    </button>
                  </div>
                </div>

                {/* Recent Student Activity Section */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Recent Student Activity</h3>
                    <span className="text-xs text-slate-400">Pembaruan Langsung</span>
                  </div>

                  <div className="space-y-3">
                    {overview.recentActivities.map(activity => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#155DFC] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-700 leading-relaxed">
                            <strong className="font-bold text-slate-900">{activity.studentName}</strong>{' '}
                            {activity.description}
                          </p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: APPROVAL                                          */}
          {/* ======================================================== */}
          {activeTab === 'approval' && !selectedStudentId && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Approval Relasi Siswa</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Seluruh permohonan siswa yang ingin terhubung dengan sekolah. Siswa yang disetujui (Approve) langsung aktif dan tersedia di halaman Penilaian.
                </p>
              </div>

              {approvalFeedback && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{approvalFeedback}</span>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/90 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Nama Siswa</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Jurusan</th>
                        <th className="py-3.5 px-4">Kelas</th>
                        <th className="py-3.5 px-4">Tahun</th>
                        <th className="py-3.5 px-4">Tanggal Request</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                      {approvals.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={req.avatarUrl || '/creatorin/avatar.png'}
                                alt={req.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block">{req.name}</span>
                                {req.nisn && <span className="text-[10px] text-slate-400">NISN: {req.nisn}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{req.email}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{req.major}</td>
                          <td className="py-3 px-4 text-slate-600">{req.classGrade}</td>
                          <td className="py-3 px-4 text-slate-600">{req.graduationYear}</td>
                          <td className="py-3 px-4 text-slate-500">{req.requestDate}</td>
                          <td className="py-3 px-4">
                            {req.status === 'pending' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Pending
                              </span>
                            )}
                            {req.status === 'approved' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Approved
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {req.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleApprovalAction(req.id, 'approved')}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer shadow-xs"
                                    title="Approve Siswa"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleApprovalAction(req.id, 'rejected')}
                                    className="px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-[11px] font-bold rounded-lg transition cursor-pointer"
                                    title="Reject Permohonan"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedStudentId(req.studentId);
                                    setActiveTab('penilaian');
                                  }}
                                  className="px-2.5 py-1 text-xs text-[#155DFC] hover:underline font-bold cursor-pointer"
                                >
                                  View Profile
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PENILAIAN (LIST & SUMMARY)                        */}
          {/* ======================================================== */}
          {activeTab === 'penilaian' && !selectedStudentId && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Penilaian Siswa</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Daftar seluruh siswa yang dapat dinilai. Klik nama siswa untuk membuka detail rubrik penilaian kompetensi industri.
                </p>
              </div>

              {/* 6. Summary Penilaian */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Total Siswa</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{students.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Sudah Dinilai</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {students.filter(s => s.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Draft</span>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {students.filter(s => s.status === 'draft').length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Belum Dinilai</span>
                  <p className="text-2xl font-bold text-slate-600 mt-1">
                    {students.filter(s => s.status === 'not_started').length}
                  </p>
                </div>
              </div>

              {/* Quick Filter Pills & Search Bar (PRD #5 & #6) */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Quick filter pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {(
                    [
                      { key: 'all', label: 'Semua' },
                      { key: 'not_started', label: 'Belum Dinilai' },
                      { key: 'draft', label: 'Draft' },
                      { key: 'completed', label: 'Selesai' },
                    ] as const
                  ).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === tab.key
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar (Nama, Email, NIS/NISN) */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search siswa (Nama, Email, NIS/NISN)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200/90 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#155DFC] focus:ring-1 focus:ring-[#155DFC]"
                  />
                </div>
              </div>

              {/* Dropdown Filters: Tahun, Jurusan, Kelas */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  className="bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="all">Tahun: Semua</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2025">2025</option>
                </select>

                <select
                  value={majorFilter}
                  onChange={e => setMajorFilter(e.target.value)}
                  className="bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="all">Jurusan: Semua</option>
                  <option value="RPL">RPL</option>
                  <option value="DKV">DKV</option>
                  <option value="TKJ">TKJ</option>
                  <option value="Animasi">Animasi</option>
                </select>

                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="all">Kelas: Semua</option>
                  <option value="XII">Kelas XII</option>
                  <option value="XI">Kelas XI</option>
                  <option value="X">Kelas X</option>
                </select>

                {(statusFilter !== 'all' || yearFilter !== 'all' || majorFilter !== 'all' || classFilter !== 'all' || searchQuery !== '') && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setYearFilter('all');
                      setMajorFilter('all');
                      setClassFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-[#155DFC] hover:underline font-bold cursor-pointer ml-1"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Table (PRD #5: Nama, Jurusan, Tahun, Status, Nilai) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/90 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Nama</th>
                        <th className="py-3.5 px-4">Jurusan</th>
                        <th className="py-3.5 px-4">Tahun</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Nilai</th>
                        <th className="py-3.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            Tidak ada siswa yang sesuai dengan filter pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr
                            key={student.studentId}
                            onClick={() => setSelectedStudentId(student.studentId)}
                            className="hover:bg-slate-50 transition cursor-pointer group"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={student.avatarUrl || '/creatorin/avatar.png'}
                                  alt={student.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 group-hover:text-[#155DFC] transition block">
                                    {student.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {student.classGrade} • {student.projectCount} Project
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">{student.major}</td>
                            <td className="py-3 px-4 text-slate-600">{student.graduationYear}</td>
                            <td className="py-3 px-4">
                              {student.status === 'completed' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Selesai
                                </span>
                              )}
                              {student.status === 'draft' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Draft
                                </span>
                              )}
                              {student.status === 'not_started' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                  Belum Dinilai
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {student.finalScore !== null ? (
                                <span className="font-extrabold text-sm text-slate-900">
                                  {student.finalScore}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#155DFC] group-hover:translate-x-0.5 transition-transform">
                                <span>Detail</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3B: DETAIL PENILAIAN SISWA & STICKY SUMMARY CARD     */}
          {/* ======================================================== */}
          {activeTab === 'penilaian' && selectedStudentId && studentDetail && (
            <div className="space-y-6">
              {/* Back Button */}
              <div>
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#155DFC] transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Daftar Penilaian Siswa</span>
                </button>
              </div>

              {/* Feedback Alert */}
              {assessmentFeedback && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{assessmentFeedback}</span>
                </div>
              )}

              {/* 7. Header Detail Siswa: Nama, Jurusan, Kelas, Angkatan, Project count */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={studentDetail.student.avatarUrl || '/creatorin/avatar.png'}
                    alt={studentDetail.student.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{studentDetail.student.name}</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {studentDetail.student.major} • {studentDetail.student.classGrade} • Angkatan{' '}
                      {studentDetail.student.graduationYear}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold text-[#155DFC] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                        {studentDetail.student.projectCount} Project
                      </span>
                      {studentDetail.student.nisn && (
                        <span className="text-[11px] text-slate-400">NISN: {studentDetail.student.nisn}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="text-right">
                  <span className="text-xs text-slate-400 block mb-1">Status Penilaian</span>
                  {studentDetail.assessment.status === 'completed' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Selesai
                    </span>
                  )}
                  {studentDetail.assessment.status === 'draft' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Draft
                    </span>
                  )}
                  {studentDetail.assessment.status === 'not_started' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                      Belum Dinilai
                    </span>
                  )}
                </div>
              </div>

              {/* 7. Tabs: Profile, Projects, Penilaian */}
              <div className="flex items-center gap-2 border-b border-slate-200/90">
                <button
                  onClick={() => setAssessmentSubTab('rubrik')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    assessmentSubTab === 'rubrik'
                      ? 'border-[#155DFC] text-[#155DFC]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Penilaian (Rubrik)
                </button>
                <button
                  onClick={() => setAssessmentSubTab('profile')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    assessmentSubTab === 'profile'
                      ? 'border-[#155DFC] text-[#155DFC]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Profile Siswa
                </button>
                <button
                  onClick={() => setAssessmentSubTab('projects')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    assessmentSubTab === 'projects'
                      ? 'border-[#155DFC] text-[#155DFC]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Projects ({studentDetail.projects.length})
                </button>
              </div>

              {/* TAB 1: RUBRIK PENILAIAN (PRD #8 & #9) */}
              {assessmentSubTab === 'rubrik' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Rubrik Form (2 Cols) */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
                      <h3 className="text-sm font-bold text-slate-900 mb-1">Rubrik Penilaian Kompetensi</h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Evaluasi capaian aspek kompetensi industri siswa. Nilai akhir dihitung otomatis berdasarkan bobot rubrik terstandar: <code className="text-[#155DFC] font-mono">final_score = Σ(score × weight)</code>.
                      </p>

                      <div className="space-y-4">
                        {rubricItems.map((item, idx) => (
                          <div
                            key={item.name}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">{item.name}</span>
                                <span className="text-[11px] text-slate-500 font-semibold">
                                  Bobot: <strong className="text-[#155DFC]">{item.weight}%</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Nilai (0-100):</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={item.score}
                                  onChange={e => handleScoreChange(idx, parseInt(e.target.value) || 0)}
                                  className="w-16 px-2.5 py-1 text-center font-bold text-sm bg-white rounded-lg border border-slate-300 focus:border-[#155DFC] focus:outline-hidden"
                                />
                              </div>
                            </div>

                            {/* Range Slider for Great UX */}
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={item.score}
                              onChange={e => handleScoreChange(idx, parseInt(e.target.value) || 0)}
                              className="w-full accent-[#155DFC] cursor-pointer"
                            />

                            {item.notes && (
                              <p className="text-[11px] text-slate-500 italic">
                                Catatan Aspek: {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 9. STICKY ASSESSMENT SUMMARY CARD (Right Column) */}
                  <div className="lg:col-span-1 sticky top-6">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-lg space-y-5">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Assessment Progress
                        </span>
                        <p className="text-xs font-bold text-slate-900">
                          {filledRubricCount} / {rubricItems.length} aspek terisi
                        </p>
                        <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-[#155DFC] h-full transition-all duration-300"
                            style={{ width: `${(filledRubricCount / rubricItems.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                        <span className="text-xs font-semibold text-slate-500 block mb-1">Current Score</span>
                        <p className="text-3xl font-extrabold text-[#155DFC] tracking-tight">
                          {currentFinalScore}
                          <span className="text-sm font-normal text-slate-400"> / 100</span>
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                          final_score = Σ(score × weight)
                        </span>
                      </div>

                      <div className="space-y-2 pt-2">
                        <button
                          onClick={() => handleSaveAssessment('completed')}
                          disabled={isSavingAssessment}
                          className="w-full py-2.5 bg-[#155DFC] hover:bg-[#0E4CD1] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Finish Assessment</span>
                        </button>

                        <button
                          onClick={() => handleSaveAssessment('draft')}
                          disabled={isSavingAssessment}
                          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Draft</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                        Nilai yang selesai dinilai otomatis menyinkronkan data profil publik dan Career Score siswa di platform Kreatorin.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE SISWA */}
              {assessmentSubTab === 'profile' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Informasi Lengkap Siswa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Nama Lengkap</span>
                      <p className="font-bold text-slate-900">{studentDetail.student.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Email Siswa</span>
                      <p className="font-semibold text-slate-900">{studentDetail.student.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Jurusan</span>
                      <p className="font-semibold text-slate-900">{studentDetail.student.major}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Kelas & Angkatan</span>
                      <p className="font-semibold text-slate-900">
                        {studentDetail.student.classGrade} (Tahun {studentDetail.student.graduationYear})
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-400 block mb-0.5">Bio Singkat Siswa</span>
                      <p className="text-slate-700 leading-relaxed">{studentDetail.student.bio}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-400 block mb-1">Keahlian & Fokus Industri</span>
                      <div className="flex flex-wrap gap-1.5">
                        {studentDetail.student.skills.map(s => (
                          <span
                            key={s}
                            className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PROJECTS SISWA */}
              {assessmentSubTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Karya & Portofolio Siswa ({studentDetail.projects.length})
                    </h3>
                    <span className="text-xs text-slate-500">
                      Project otomatis terhubung ke School Profile
                    </span>
                  </div>

                  {studentDetail.projects.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/90">
                      <p className="text-xs text-slate-400">Siswa belum mengunggah proyek portofolio.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {studentDetail.projects.map(proj => (
                        <div
                          key={proj.id}
                          className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-[#155DFC]/40 transition group"
                        >
                          <div className="aspect-video w-full overflow-hidden bg-slate-100">
                            <img
                              src={proj.coverImage}
                              alt={proj.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-[#155DFC] uppercase tracking-wider">
                                {proj.category}
                              </span>
                              {proj.isFeaturedSchool && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                                  Featured
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{proj.title}</h4>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                              <span>{proj.createdDate}</span>
                              <span>{proj.viewsCount} views</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: PROFILE MANAGEMENT (PRD #18, #19, #24)            */}
          {/* ======================================================== */}
          {activeTab === 'profile' && !selectedStudentId && schoolProfile && (
            <div className="space-y-6">
              {/* Profile Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Profile Management</h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Atur profil publik sekolah, kurasi Featured Projects & Featured Students, kelola Prestasi, dan atur Urutan Tampilan publik.
                  </p>
                </div>
                <Link
                  href={`/school/${schoolProfile.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Lihat School Profile Publik</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {profileFeedback && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileFeedback}</span>
                </div>
              )}

              {/* 5 Sub-Tabs Navigation (PRD #24) */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl">
                {[
                  { id: 'info', label: 'Profile Information', icon: Building2 },
                  { id: 'featured_projects', label: 'Featured Projects', icon: Sparkles },
                  { id: 'featured_students', label: 'Featured Students', icon: GraduationCap },
                  { id: 'achievements', label: 'Achievements', icon: Award },
                  { id: 'display_settings', label: 'Display Settings', icon: SlidersHorizontal },
                ].map(sub => {
                  const Icon = sub.icon;
                  const isActive = profileSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setProfileSubTab(sub.id as ProfileSubTab)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#155DFC] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SUB-VIEW 1: PROFILE INFORMATION */}
              {profileSubTab === 'info' && (
                <form
                  onSubmit={handleUpdateSchoolProfile}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 max-w-4xl"
                >
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Identitas & Kontak Resmi Sekolah
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sekolah</label>
                      <input
                        type="text"
                        value={schoolProfile.name}
                        onChange={e => setSchoolProfile({ ...schoolProfile, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tagline Sekolah</label>
                      <input
                        type="text"
                        value={schoolProfile.tagline}
                        onChange={e => setSchoolProfile({ ...schoolProfile, tagline: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat / Visi</label>
                      <textarea
                        rows={3}
                        value={schoolProfile.description}
                        onChange={e => setSchoolProfile({ ...schoolProfile, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Logo Image URL</label>
                      <input
                        type="text"
                        value={schoolProfile.logoUrl}
                        onChange={e => setSchoolProfile({ ...schoolProfile, logoUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cover Banner URL</label>
                      <input
                        type="text"
                        value={schoolProfile.coverUrl}
                        onChange={e => setSchoolProfile({ ...schoolProfile, coverUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Website Sekolah</label>
                      <input
                        type="text"
                        value={schoolProfile.website}
                        onChange={e => setSchoolProfile({ ...schoolProfile, website: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                      <input
                        type="email"
                        value={schoolProfile.email}
                        onChange={e => setSchoolProfile({ ...schoolProfile, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon</label>
                      <input
                        type="text"
                        value={schoolProfile.phone}
                        onChange={e => setSchoolProfile({ ...schoolProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kota & Wilayah</label>
                      <input
                        type="text"
                        value={schoolProfile.city}
                        onChange={e => setSchoolProfile({ ...schoolProfile, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap Kampus</label>
                      <input
                        type="text"
                        value={schoolProfile.address}
                        onChange={e => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                    >
                      Simpan Informasi Sekolah
                    </button>
                  </div>
                </form>
              )}

              {/* SUB-VIEW 2: FEATURED PROJECTS (PRD #16) */}
              {profileSubTab === 'featured_projects' && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Kurasi Featured Projects Sekolah</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pilih proyek siswa terbaik yang akan disorot di bagian atas public School Profile.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      {allProjects.filter(p => p.isFeaturedSchool).length} Project Terpilih
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allProjects.map(proj => (
                      <div
                        key={proj.id}
                        className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                          proj.isFeaturedSchool
                            ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 relative">
                            <img
                              src={proj.thumbnail}
                              alt={proj.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                              {proj.category}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{proj.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                              {proj.studentAvatar && (
                                <img src={proj.studentAvatar} alt="" className="size-4 rounded-full object-cover" />
                              )}
                              <span>by {proj.studentName}</span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">{proj.createdDate}</span>
                          <button
                            onClick={() => handleToggleFeaturedProject(proj.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                              proj.isFeaturedSchool
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-[#155DFC] hover:text-white'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{proj.isFeaturedSchool ? 'Batalkan Featured' : 'Pilih Featured'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-VIEW 3: FEATURED STUDENTS */}
              {profileSubTab === 'featured_students' && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Kurasi Siswa Unggulan (Featured Students)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tampilkan siswa dengan capaian kompetensi terbaik pada section Siswa di public profile sekolah.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      {allStudents.filter(s => s.isFeatured).length} Siswa Terpilih
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allStudents.map(std => (
                      <div
                        key={std.id}
                        className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                          std.isFeatured
                            ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatarUrl || '/creatorin/avatar.png'}
                            alt={std.name}
                            className="size-11 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{std.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate">{std.role}</p>
                            <span className="inline-block text-[10px] font-bold text-[#155DFC] bg-blue-50 px-1.5 py-0.2 rounded mt-0.5">
                              {std.major} • {std.classGrade}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-[11px] text-slate-500">
                            <span className="font-bold text-slate-900">{std.projectCount}</span> Project • Score:{' '}
                            <strong className="text-emerald-600">{std.careerScore}</strong>
                          </div>
                          <button
                            onClick={() => handleToggleFeaturedStudent(std.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                              std.isFeatured
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-[#155DFC] hover:text-white'
                            }`}
                          >
                            <Star className="w-3 h-3" />
                            <span>{std.isFeatured ? 'Batalkan Sorot' : 'Sorot Siswa'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-VIEW 4: ACHIEVEMENTS (PRD #17) */}
              {profileSubTab === 'achievements' && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Prestasi Sekolah & Siswa</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kelola rekam jejak lomba, juara, dan kemitraan industri yang tampil di public profile sekolah.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingAchievement(!isAddingAchievement)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#155DFC] text-white text-xs font-bold rounded-xl hover:bg-[#0E4CD1] transition cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Prestasi</span>
                    </button>
                  </div>

                  {isAddingAchievement && (
                    <form
                      onSubmit={handleAddAchievement}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                    >
                      <h4 className="text-xs font-bold text-slate-900">Form Prestasi Baru</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Judul Prestasi</label>
                          <input
                            type="text"
                            required
                            placeholder="cth: Juara 1 Web Design Competition Nasional"
                            value={newAchievement.title}
                            onChange={e => setNewAchievement({ ...newAchievement, title: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Tahun</label>
                          <input
                            type="text"
                            placeholder="2026"
                            value={newAchievement.year}
                            onChange={e => setNewAchievement({ ...newAchievement, year: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori</label>
                          <input
                            type="text"
                            placeholder="cth: Lomba Nasional / Inovasi"
                            value={newAchievement.category}
                            onChange={e => setNewAchievement({ ...newAchievement, category: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Deskripsi</label>
                          <input
                            type="text"
                            placeholder="Penjelasan singkat pencapaian..."
                            value={newAchievement.description}
                            onChange={e => setNewAchievement({ ...newAchievement, description: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingAchievement(false)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#155DFC] text-white text-xs font-bold rounded-lg"
                        >
                          Simpan Prestasi
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {achievements.map(ach => (
                      <div
                        key={ach.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-blue-50 text-[#155DFC] flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">{ach.title}</span>
                            <span className="text-[11px] text-slate-500">
                              {ach.year} • {ach.category} — {ach.description}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAchievement(ach.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Hapus Prestasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-VIEW 5: DISPLAY SETTINGS (PRD #19) */}
              {profileSubTab === 'display_settings' && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5 max-w-3xl">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Urutan Tampilan Halaman Publik (Section Order)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Atur urutan konten utama yang ditampilkan pada public School Profile. Gunakan tombol panah untuk memindahkan urutan section ke atas atau ke bawah.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {sectionOrderList.map((secKey, idx) => {
                      const labels: Record<string, { title: string; desc: string }> = {
                        featured_projects: {
                          title: 'Featured Projects',
                          desc: 'Kurasi proyek siswa pilihan sekolah yang disorot di bagian atas.',
                        },
                        students: {
                          title: 'Siswa & Talenta Kreator',
                          desc: 'Daftar siswa vokasi aktif dan siswa unggulan sekolah.',
                        },
                        achievements: {
                          title: 'Prestasi & Penghargaan',
                          desc: 'Rekam jejak penghargaan kompetisi dan kolaborasi industri.',
                        },
                        about: {
                          title: 'Tentang Sekolah & Hubin',
                          desc: 'Profil resmi sekolah, penanggung jawab kemitraan, dan kontak.',
                        },
                      };
                      const item = labels[secKey] || { title: secKey, desc: '' };

                      return (
                        <div
                          key={secKey}
                          className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="size-6 rounded-full bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <strong className="text-slate-900 block font-bold text-xs">{item.title}</strong>
                              <span className="text-[11px] text-slate-500">{item.desc}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-3">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSection(idx, 'up')}
                              className="size-7 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition"
                              title="Pindah ke Atas"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === sectionOrderList.length - 1}
                              onClick={() => handleMoveSection(idx, 'down')}
                              className="size-7 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition"
                              title="Pindah ke Bawah"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      Catatan: Section galeri seluruh proyek siswa tetap tampil otomatis di halaman publik.
                    </p>
                    <button
                      onClick={handleSaveSectionOrder}
                      className="px-5 py-2.5 bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Urutan Tampilan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: SETTINGS                                          */}
          {/* ======================================================== */}
          {activeTab === 'settings' && !selectedStudentId && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Pengaturan Dashboard Sekolah</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Konfigurasi notifikasi permohonan siswa, integrasi rubrik industri, dan hak akses guru pembimbing.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Notifikasi Permohonan Siswa Baru</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kirim pemberitahuan setiap kali siswa baru mengajukan relasi dengan sekolah ini.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="size-4 accent-[#155DFC] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-start justify-between border-t border-slate-100 pt-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Kemitraan Industri Terbuka (Public Inquiries)</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Izinkan UMKM dan perusahaan industri mengirim penawaran kerja sama langsung via School Profile.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="size-4 accent-[#155DFC] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-start justify-between border-t border-slate-100 pt-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Auto-Sync Career Score Siswa</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Otomatis perbarui skor portofolio siswa begitu asesmen dinyatakan selesai.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="size-4 accent-[#155DFC] rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#155DFC] shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold">Mode Terintegrasi Penuh:</span> Seluruh perubahan approval, rubrik penilaian,
                  kurasi featured projects, featured students, serta urutan tampilan public profile sekolah tersimpan secara responsif sehingga alur kerja institusi dapat diuji secara langsung.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
