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
  AssessmentStatus
} from '@/types';
import { schoolService, DEFAULT_RUBRIC, calculateFinalScore } from '@/services/schoolService';
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
  AlertCircle
} from 'lucide-react';

type DashboardTab = 'overview' | 'approval' | 'penilaian' | 'profile' | 'settings';
type AssessmentTab = 'rubrik' | 'profile' | 'projects';

export function SchoolDashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoading, setIsLoading] = useState(true);

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

  // School Profile Data
  const [schoolProfile, setSchoolProfile] = useState<SchoolInfo | null>(null);
  const [achievements, setAchievements] = useState<SchoolAchievement[]>([]);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Partial<SchoolAchievement>>({
    title: '',
    description: '',
    year: '2026',
    category: 'Kompetisi',
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop&q=80',
  });

  // Load Initial Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewData, approvalsData, studentsData, publicProfile] = await Promise.all([
        schoolService.getDashboardOverview(),
        schoolService.getApprovals(),
        schoolService.getStudentsForAssessment(),
        schoolService.getPublicSchoolProfile(),
      ]);

      setOverview(overviewData);
      setApprovals(approvalsData);
      setStudents(studentsData);
      setSchoolProfile(publicProfile.school);
      setAchievements(publicProfile.achievements);
    } catch (err) {
      console.error('Failed to load school dashboard data:', err);
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
          ? 'Siswa berhasil disetujui dan kini aktif di daftar siswa sekolah.'
          : 'Pengajuan relasi siswa telah ditolak.'
      );
      setTimeout(() => setApprovalFeedback(null), 4000);

      // Refresh overview & student lists
      const [updatedOverview, updatedStudents] = await Promise.all([
        schoolService.getDashboardOverview(),
        schoolService.getStudentsForAssessment(),
      ]);
      setOverview(updatedOverview);
      setStudents(updatedStudents);
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
          ? `Penilaian berhasil diselesaikan dengan nilai akhir ${result.finalScore}.`
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
      year: '2026',
      category: 'Kompetisi',
      imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop&q=80',
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

  // Update Profile
  const handleUpdateSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolProfile) return;
    await schoolService.updateSchoolProfile(schoolProfile.id, schoolProfile);
    setProfileFeedback('Profil sekolah berhasil disimpan dan diperbarui.');
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#155DFC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-neutral-600">Memuat data dashboard sekolah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* 1. Sidebar School Dashboard */}
      <aside className="w-full md:w-64 bg-white border-r border-black/10 flex flex-col shrink-0">
        {/* School Identity Header */}
        <div className="p-5 border-b border-black/10">
          <div className="flex items-center gap-3">
            <img
              src={schoolProfile?.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&auto=format&fit=crop&q=80'}
              alt={schoolProfile?.name || 'School Logo'}
              className="w-10 h-10 rounded-[8px] object-cover border border-black/10 shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#0D0C22] truncate">
                {schoolProfile?.name || 'SMK Kreatif Indonesia'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#155DFC]">
                <GraduationCap className="w-3.5 h-3.5" />
                Vokasi Mitra
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="p-3 space-y-1 flex-1">
          <button
            onClick={() => {
              setActiveTab('overview');
              setSelectedStudentId(null);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview' && !selectedStudentId
                ? 'bg-[#155DFC] text-white'
                : 'text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('approval');
              setSelectedStudentId(null);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'approval' && !selectedStudentId
                ? 'bg-[#155DFC] text-white'
                : 'text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22]'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Approval</span>
            </div>
            {approvals.filter(a => a.status === 'pending').length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === 'approval'
                    ? 'bg-white text-[#155DFC]'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {approvals.filter(a => a.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('penilaian');
              setSelectedStudentId(null);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'penilaian' && !selectedStudentId
                ? 'bg-[#155DFC] text-white'
                : 'text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 shrink-0" />
              <span>Penilaian</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'penilaian'
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {students.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('profile');
              setSelectedStudentId(null);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'profile' && !selectedStudentId
                ? 'bg-[#155DFC] text-white'
                : 'text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22]'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              setSelectedStudentId(null);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'settings' && !selectedStudentId
                ? 'bg-[#155DFC] text-white'
                : 'text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22]'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
        </nav>

        {/* View Public School Profile link */}
        <div className="p-3 border-t border-black/10">
          <Link
            href={`/school/${schoolProfile?.slug || 'smk-kreatif-indonesia'}`}
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-neutral-600 hover:text-[#155DFC] hover:bg-[#F3F3F4] rounded-[8px] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              Public Profile
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* ======================================================== */}
        {/* VIEW 1: OVERVIEW                                         */}
        {/* ======================================================== */}
        {activeTab === 'overview' && !selectedStudentId && overview && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0D0C22]">Overview Sekolah</h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Kondisi keterhubungan siswa, status persetujuan, dan kemajuan asesmen kompetensi industri.
              </p>
            </div>

            {/* 6 Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs font-medium text-neutral-500">Total Siswa</span>
                <p className="text-2xl font-bold text-[#0D0C22] mt-1">{overview.totalStudents}</p>
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
                  <Users className="w-3 h-3" />
                  <span>Terdaftar</span>
                </div>
              </div>

              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs font-medium text-neutral-500">Siswa Aktif</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{overview.activeStudents}</p>
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Telah disetujui</span>
                </div>
              </div>

              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs font-medium text-neutral-500">Pending Approval</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">{overview.pendingApproval}</p>
                <button
                  onClick={() => setActiveTab('approval')}
                  className="inline-flex items-center gap-1 text-[11px] text-[#155DFC] hover:underline mt-1 cursor-pointer"
                >
                  <span>Tinjau</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs font-medium text-neutral-500">Sudah Dinilai</span>
                <p className="text-2xl font-bold text-[#155DFC] mt-1">{overview.gradedStudents}</p>
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
                  <Award className="w-3 h-3 text-[#155DFC]" />
                  <span>Selesai asesmen</span>
                </div>
              </div>

              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs font-medium text-neutral-500">Belum Dinilai</span>
                <p className="text-2xl font-bold text-neutral-700 mt-1">{overview.ungradedStudents}</p>
                <button
                  onClick={() => {
                    setActiveTab('penilaian');
                    setStatusFilter('not_started');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-[#155DFC] hover:underline mt-1 cursor-pointer"
                >
                  <span>Mulai nilai</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs font-medium text-neutral-500">Total Project</span>
                <p className="text-2xl font-bold text-[#0D0C22] mt-1">{overview.totalProjects}</p>
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
                  <FolderGit2 className="w-3 h-3" />
                  <span>Karya siswa</span>
                </div>
              </div>
            </div>

            {/* Assessment Progress Bar & Recent Student Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assessment Progress */}
              <div className="bg-white rounded-[12px] p-5 border border-black/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0D0C22]">Assessment Progress</h3>
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
                    <span className="flex items-center gap-2 text-neutral-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#155DFC]" />
                      Sudah Dinilai
                    </span>
                    <span className="font-bold text-[#0D0C22]">{overview.assessmentProgress.graded}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-neutral-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Draft Tersimpan
                    </span>
                    <span className="font-bold text-[#0D0C22]">{overview.assessmentProgress.draft}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-neutral-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                      Belum Dinilai
                    </span>
                    <span className="font-bold text-[#0D0C22]">{overview.assessmentProgress.ungraded}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('penilaian')}
                    className="w-full py-2 bg-[#F3F3F4] hover:bg-neutral-200/70 text-xs font-bold text-[#0D0C22] rounded-[8px] transition-colors cursor-pointer"
                  >
                    Buka Halaman Penilaian
                  </button>
                </div>
              </div>

              {/* Recent Student Activity Section */}
              <div className="lg:col-span-2 bg-white rounded-[12px] p-5 border border-black/10 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#0D0C22]">Recent Student Activity</h3>
                  <span className="text-xs text-neutral-400">Pembaruan Langsung</span>
                </div>

                <div className="space-y-3">
                  {overview.recentActivities.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-[8px] bg-[#F8FAFC] border border-black/5 hover:bg-white transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#155DFC]/10 text-[#155DFC] flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-neutral-700 leading-relaxed">
                          <strong className="font-bold text-[#0D0C22]">{activity.studentName}</strong>{' '}
                          {activity.description}
                        </p>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-1">
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
        {/* VIEW 2: APPROVAL                                         */}
        {/* ======================================================== */}
        {activeTab === 'approval' && !selectedStudentId && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0D0C22]">Approval Relasi Siswa</h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Tinjau permohonan siswa yang mendaftar dan menghubungkan akun mereka ke SMK ini.
              </p>
            </div>

            {approvalFeedback && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-[8px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{approvalFeedback}</span>
              </div>
            )}

            <div className="bg-white rounded-[12px] border border-black/10 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#F8FAFC] text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Jurusan</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Tahun</th>
                      <th className="py-3 px-4">Tanggal Request</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs text-[#0D0C22]">
                    {approvals.map(req => (
                      <tr key={req.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={req.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'}
                              alt={req.name}
                              className="w-7 h-7 rounded-full object-cover border border-black/10 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-[#0D0C22] block">{req.name}</span>
                              {req.nisn && <span className="text-[10px] text-neutral-400">NISN: {req.nisn}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{req.email}</td>
                        <td className="py-3 px-4 font-semibold">{req.major}</td>
                        <td className="py-3 px-4 text-neutral-600">{req.classGrade}</td>
                        <td className="py-3 px-4 text-neutral-600">{req.graduationYear}</td>
                        <td className="py-3 px-4 text-neutral-500">{req.requestDate}</td>
                        <td className="py-3 px-4">
                          {req.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Approved
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApprovalAction(req.id, 'approved')}
                                  className="px-2.5 py-1 bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-[11px] font-bold rounded-[8px] transition-colors cursor-pointer"
                                  title="Approve Siswa"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApprovalAction(req.id, 'rejected')}
                                  className="px-2.5 py-1 bg-[#F3F3F4] hover:bg-rose-50 hover:text-rose-600 text-neutral-700 text-[11px] font-bold rounded-[8px] transition-colors cursor-pointer"
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
                                className="px-2 py-1 text-xs text-[#155DFC] hover:underline font-semibold cursor-pointer"
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
        {/* VIEW 3: PENILAIAN (LIST & SUMMARY)                       */}
        {/* ======================================================== */}
        {activeTab === 'penilaian' && !selectedStudentId && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0D0C22]">Penilaian Siswa</h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Lakukan evaluasi rubrik kompetensi industri untuk siswa aktif yang telah terhubung.
              </p>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs text-neutral-500 font-medium">Total Siswa</span>
                <p className="text-2xl font-bold text-[#0D0C22] mt-1">{students.length}</p>
              </div>
              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs text-neutral-500 font-medium">Sudah Dinilai</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {students.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs text-neutral-500 font-medium">Draft</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {students.filter(s => s.status === 'draft').length}
                </p>
              </div>
              <div className="bg-white rounded-[12px] p-4 border border-black/10 shadow-xs">
                <span className="text-xs text-neutral-500 font-medium">Belum Dinilai</span>
                <p className="text-2xl font-bold text-neutral-600 mt-1">
                  {students.filter(s => s.status === 'not_started').length}
                </p>
              </div>
            </div>

            {/* Quick Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Quick filter tabs */}
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-[8px]">
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
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === tab.key
                        ? 'bg-white text-[#0D0C22] shadow-xs'
                        : 'text-neutral-500 hover:text-[#0D0C22]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari siswa (Nama, Email, NISN)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] placeholder:text-neutral-400 focus:outline-hidden focus:border-[#155DFC] focus:ring-1 focus:ring-[#155DFC]"
                />
              </div>
            </div>

            {/* Dropdown Filters (Tahun, Jurusan, Kelas) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="bg-white border border-black/10 rounded-[8px] px-3 py-1.5 text-xs font-semibold text-[#0D0C22] focus:outline-hidden"
              >
                <option value="all">Semua Angkatan</option>
                <option value="2026">Angkatan 2026</option>
                <option value="2027">Angkatan 2027</option>
                <option value="2025">Angkatan 2025</option>
              </select>

              <select
                value={majorFilter}
                onChange={e => setMajorFilter(e.target.value)}
                className="bg-white border border-black/10 rounded-[8px] px-3 py-1.5 text-xs font-semibold text-[#0D0C22] focus:outline-hidden"
              >
                <option value="all">Semua Jurusan</option>
                <option value="RPL">RPL</option>
                <option value="DKV">DKV</option>
                <option value="TKJ">TKJ</option>
                <option value="Animasi">Animasi</option>
              </select>

              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="bg-white border border-black/10 rounded-[8px] px-3 py-1.5 text-xs font-semibold text-[#0D0C22] focus:outline-hidden"
              >
                <option value="all">Semua Kelas</option>
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
                  className="text-xs text-[#155DFC] hover:underline font-semibold cursor-pointer ml-1"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Students Assessment Table */}
            <div className="bg-white rounded-[12px] border border-black/10 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#F8FAFC] text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Jurusan</th>
                      <th className="py-3 px-4">Tahun</th>
                      <th className="py-3 px-4">Status Penilaian</th>
                      <th className="py-3 px-4">Nilai Akhir</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-400">
                          Tidak ada siswa yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => (
                        <tr
                          key={student.studentId}
                          onClick={() => setSelectedStudentId(student.studentId)}
                          className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={student.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'}
                                alt={student.name}
                                className="w-8 h-8 rounded-full object-cover border border-black/10"
                              />
                              <div>
                                <span className="font-bold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors block">
                                  {student.name}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  {student.classGrade} • {student.projectCount} Project
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#0D0C22]">{student.major}</td>
                          <td className="py-3 px-4 text-neutral-600">{student.graduationYear}</td>
                          <td className="py-3 px-4">
                            {student.status === 'completed' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Selesai
                              </span>
                            )}
                            {student.status === 'draft' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Draft
                              </span>
                            )}
                            {student.status === 'not_started' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">
                                Belum Dinilai
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {student.finalScore !== null ? (
                              <span className="font-bold text-sm text-[#0D0C22]">
                                {student.finalScore}
                              </span>
                            ) : (
                              <span className="text-neutral-400 font-semibold">-</span>
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
        {/* VIEW 4: DETAIL PENILAIAN SISWA & STICKY ASSESSMENT CARD  */}
        {/* ======================================================== */}
        {activeTab === 'penilaian' && selectedStudentId && studentDetail && (
          <div className="space-y-6">
            {/* Back Button */}
            <div>
              <button
                onClick={() => setSelectedStudentId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#155DFC] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Siswa</span>
              </button>
            </div>

            {/* Feedback Alert */}
            {assessmentFeedback && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-[8px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{assessmentFeedback}</span>
              </div>
            )}

            {/* Header: Student Profile Information */}
            <div className="bg-white rounded-[12px] p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={studentDetail.student.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'}
                  alt={studentDetail.student.name}
                  className="w-16 h-16 rounded-[12px] object-cover border border-black/10 shrink-0"
                />
                <div>
                  <h1 className="text-xl font-bold text-[#0D0C22]">{studentDetail.student.name}</h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {studentDetail.student.major} • {studentDetail.student.classGrade} • Angkatan{' '}
                    {studentDetail.student.graduationYear}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-[6px]">
                      {studentDetail.student.projectCount} Project Aktif
                    </span>
                    {studentDetail.student.nisn && (
                      <span className="text-[11px] text-neutral-400">NISN: {studentDetail.student.nisn}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="text-xs text-neutral-400 block mb-1">Status Penilaian</span>
                {studentDetail.assessment.status === 'completed' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Selesai
                  </span>
                )}
                {studentDetail.assessment.status === 'draft' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Draft
                  </span>
                )}
                {studentDetail.assessment.status === 'not_started' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
                    Belum Dinilai
                  </span>
                )}
              </div>
            </div>

            {/* Sub-tabs: Profile, Projects, Penilaian */}
            <div className="flex items-center gap-2 border-b border-black/10">
              <button
                onClick={() => setAssessmentSubTab('rubrik')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  assessmentSubTab === 'rubrik'
                    ? 'border-[#155DFC] text-[#155DFC]'
                    : 'border-transparent text-neutral-500 hover:text-[#0D0C22]'
                }`}
              >
                Penilaian Rubrik
              </button>
              <button
                onClick={() => setAssessmentSubTab('profile')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  assessmentSubTab === 'profile'
                    ? 'border-[#155DFC] text-[#155DFC]'
                    : 'border-transparent text-neutral-500 hover:text-[#0D0C22]'
                }`}
              >
                Profile Siswa
              </button>
              <button
                onClick={() => setAssessmentSubTab('projects')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  assessmentSubTab === 'projects'
                    ? 'border-[#155DFC] text-[#155DFC]'
                    : 'border-transparent text-neutral-500 hover:text-[#0D0C22]'
                }`}
              >
                Projects ({studentDetail.projects.length})
              </button>
            </div>

            {/* TAB CONTENT: RUBRIK PENILAIAN */}
            {assessmentSubTab === 'rubrik' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Rubrik Form (2 Cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-[12px] p-5 border border-black/10 shadow-xs">
                    <h3 className="text-sm font-bold text-[#0D0C22] mb-1">Rubrik Penilaian Kompetensi</h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      Evaluasi aspek kinerja siswa berdasarkan bobot penilaian terstandarisasi.
                    </p>

                    <div className="space-y-4">
                      {rubricItems.map((item, idx) => (
                        <div
                          key={item.name}
                          className="p-4 rounded-[8px] bg-[#F8FAFC] border border-black/10 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-[#0D0C22] block">{item.name}</span>
                              <span className="text-[11px] text-neutral-500">Bobot: {item.weight}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-400">Nilai (0-100):</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={item.score}
                                onChange={e => handleScoreChange(idx, parseInt(e.target.value) || 0)}
                                className="w-16 px-2.5 py-1 text-center font-bold text-sm bg-white rounded-[8px] border border-black/20 focus:border-[#155DFC] focus:outline-hidden"
                              />
                            </div>
                          </div>

                          {/* Range Slider for UX Polish */}
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={item.score}
                            onChange={e => handleScoreChange(idx, parseInt(e.target.value) || 0)}
                            className="w-full accent-[#155DFC] cursor-pointer"
                          />

                          {/* Note / Criteria Description */}
                          {item.notes && (
                            <p className="text-[11px] text-neutral-500 italic">
                              Indikator: {item.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 9. STICKY ASSESSMENT SUMMARY CARD (1 Col, Sticky on scroll) */}
                <div className="lg:col-span-1 sticky top-24">
                  <div className="bg-white rounded-[12px] p-5 border border-black/10 shadow-md space-y-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Assessment Progress
                      </span>
                      <p className="text-xs font-semibold text-[#0D0C22]">
                        {filledRubricCount} / {rubricItems.length} aspek terisi
                      </p>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-[#155DFC] h-full transition-all duration-300"
                          style={{ width: `${(filledRubricCount / rubricItems.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-[8px] bg-[#F8FAFC] border border-black/10 text-center">
                      <span className="text-xs font-medium text-neutral-500 block mb-1">Current Score</span>
                      <p className="text-3xl font-extrabold text-[#155DFC] tracking-tight">
                        {currentFinalScore}
                        <span className="text-sm font-normal text-neutral-400"> / 100</span>
                      </p>
                      <span className="text-[11px] text-neutral-400 mt-1 block">
                        final_score = Σ(score × weight)
                      </span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => handleSaveAssessment('completed')}
                        disabled={isSavingAssessment}
                        className="w-full py-2.5 bg-[#155DFC] hover:bg-[#0E4CD1] disabled:opacity-50 text-white text-xs font-bold rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Finish Assessment</span>
                      </button>

                      <button
                        onClick={() => handleSaveAssessment('draft')}
                        disabled={isSavingAssessment}
                        className="w-full py-2.5 bg-[#F3F3F4] hover:bg-neutral-200/80 text-[#0D0C22] text-xs font-bold rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Draft</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                      Nilai terverifikasi akan langsung disinkronkan ke Career Score siswa di platform Kreatorin.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROFILE SISWA */}
            {assessmentSubTab === 'profile' && (
              <div className="bg-white rounded-[12px] p-6 border border-black/10 space-y-4">
                <h3 className="text-sm font-bold text-[#0D0C22]">Informasi Siswa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Nama Lengkap</span>
                    <p className="font-bold text-[#0D0C22]">{studentDetail.student.name}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Email Akun</span>
                    <p className="font-semibold text-[#0D0C22]">{studentDetail.student.email}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Jurusan</span>
                    <p className="font-semibold text-[#0D0C22]">{studentDetail.student.major}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Kelas & Angkatan</span>
                    <p className="font-semibold text-[#0D0C22]">
                      {studentDetail.student.classGrade} (Tahun {studentDetail.student.graduationYear})
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-neutral-400 block mb-0.5">Bio Singkat</span>
                    <p className="text-neutral-700 leading-relaxed">{studentDetail.student.bio}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-neutral-400 block mb-1">Keahlian & Fokus</span>
                    <div className="flex flex-wrap gap-1.5">
                      {studentDetail.student.skills.map(s => (
                        <span
                          key={s}
                          className="px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-[6px] text-[11px] font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROJECTS */}
            {assessmentSubTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0D0C22]">
                    Karya & Proyek Siswa ({studentDetail.projects.length})
                  </h3>
                  <span className="text-xs text-neutral-500">
                    Project siswa otomatis terhubung ke School Profile
                  </span>
                </div>

                {studentDetail.projects.length === 0 ? (
                  <div className="bg-white rounded-[12px] p-8 text-center border border-black/10">
                    <p className="text-xs text-neutral-400">Siswa belum mengunggah proyek.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {studentDetail.projects.map(proj => (
                      <div
                        key={proj.id}
                        className="bg-white rounded-[12px] border border-black/10 overflow-hidden shadow-xs hover:border-[#155DFC]/40 transition-colors"
                      >
                        <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                          <img
                            src={proj.coverImage}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-[#155DFC] uppercase tracking-wider">
                              {proj.category}
                            </span>
                            {proj.isFeaturedSchool && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-[4px]">
                                Featured
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-[#0D0C22] line-clamp-1">{proj.title}</h4>
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
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
        {/* VIEW 5: PROFILE MANAGEMENT & ACHIEVEMENTS                */}
        {/* ======================================================== */}
        {activeTab === 'profile' && !selectedStudentId && schoolProfile && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0D0C22]">Profile Management</h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Atur identitas publik sekolah, narasi profil, dan portofolio prestasi sekolah.
                </p>
              </div>
              <Link
                href={`/school/${schoolProfile.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F3F3F4] text-[#0D0C22] border border-black/10 rounded-[8px] text-xs font-bold transition-colors"
              >
                <Eye className="w-4 h-4 text-neutral-600" />
                <span>Lihat School Profile Publik</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </Link>
            </div>

            {profileFeedback && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-[8px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Profil Utama (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                <form
                  onSubmit={handleUpdateSchoolProfile}
                  className="bg-white rounded-[12px] p-5 sm:p-6 border border-black/10 shadow-xs space-y-4"
                >
                  <h3 className="text-sm font-bold text-[#0D0C22] border-b border-black/10 pb-3">
                    Identitas & Kontak Sekolah
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Nama Sekolah
                      </label>
                      <input
                        type="text"
                        value={schoolProfile.name}
                        onChange={e => setSchoolProfile({ ...schoolProfile, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Tagline Sekolah
                      </label>
                      <input
                        type="text"
                        value={schoolProfile.tagline}
                        onChange={e => setSchoolProfile({ ...schoolProfile, tagline: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Deskripsi Singkat / Visi
                      </label>
                      <textarea
                        rows={3}
                        value={schoolProfile.description}
                        onChange={e => setSchoolProfile({ ...schoolProfile, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={schoolProfile.logoUrl}
                        onChange={e => setSchoolProfile({ ...schoolProfile, logoUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Cover Image URL
                      </label>
                      <input
                        type="text"
                        value={schoolProfile.coverUrl}
                        onChange={e => setSchoolProfile({ ...schoolProfile, coverUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Website Sekolah
                      </label>
                      <input
                        type="text"
                        value={schoolProfile.website}
                        onChange={e => setSchoolProfile({ ...schoolProfile, website: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Email Resmi
                      </label>
                      <input
                        type="email"
                        value={schoolProfile.email}
                        onChange={e => setSchoolProfile({ ...schoolProfile, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Nomor Telepon
                      </label>
                      <input
                        type="text"
                        value={schoolProfile.phone}
                        onChange={e => setSchoolProfile({ ...schoolProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Kota & Wilayah
                      </label>
                      <input
                        type="text"
                        value={schoolProfile.city}
                        onChange={e => setSchoolProfile({ ...schoolProfile, city: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Alamat Lengkap
                      </label>
                      <input
                        type="text"
                        value={schoolProfile.address}
                        onChange={e => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-[8px] border border-black/10 text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
                    >
                      Simpan Perubahan Profil
                    </button>
                  </div>
                </form>

                {/* Section Achievements */}
                <div className="bg-white rounded-[12px] p-5 sm:p-6 border border-black/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#0D0C22]">Prestasi Sekolah & Siswa</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Ditampilkan di section Achievements pada public profile sekolah.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingAchievement(!isAddingAchievement)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#155DFC] text-white text-xs font-bold rounded-[8px] hover:bg-[#0E4CD1] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Prestasi</span>
                    </button>
                  </div>

                  {/* Add Achievement Form Modal / Expand */}
                  {isAddingAchievement && (
                    <form
                      onSubmit={handleAddAchievement}
                      className="p-4 bg-[#F8FAFC] border border-black/10 rounded-[8px] space-y-3"
                    >
                      <h4 className="text-xs font-bold text-[#0D0C22]">Form Prestasi Baru</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                            Judul Prestasi
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="cth: Juara 1 Web Design Competition"
                            value={newAchievement.title}
                            onChange={e => setNewAchievement({ ...newAchievement, title: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-black/15 rounded-[6px] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-600 mb-1">Tahun</label>
                          <input
                            type="text"
                            placeholder="2026"
                            value={newAchievement.year}
                            onChange={e => setNewAchievement({ ...newAchievement, year: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-black/15 rounded-[6px] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-600 mb-1">Kategori</label>
                          <input
                            type="text"
                            placeholder="cth: Lomba Nasional / Inovasi"
                            value={newAchievement.category}
                            onChange={e => setNewAchievement({ ...newAchievement, category: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-black/15 rounded-[6px] text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                            Deskripsi
                          </label>
                          <input
                            type="text"
                            placeholder="Penjelasan singkat pencapaian..."
                            value={newAchievement.description}
                            onChange={e => setNewAchievement({ ...newAchievement, description: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-black/15 rounded-[6px] text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingAchievement(false)}
                          className="px-3 py-1 bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-[6px]"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-[#155DFC] text-white text-xs font-bold rounded-[6px]"
                        >
                          Simpan Prestasi
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Achievements */}
                  <div className="space-y-3">
                    {achievements.map(ach => (
                      <div
                        key={ach.id}
                        className="flex items-center justify-between p-3 rounded-[8px] bg-[#F8FAFC] border border-black/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[6px] bg-[#155DFC]/10 text-[#155DFC] flex items-center justify-center shrink-0">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#0D0C22] block">{ach.title}</span>
                            <span className="text-[11px] text-neutral-500">
                              {ach.year} • {ach.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAchievement(ach.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                          title="Hapus Prestasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 19. Profile Display Settings (1 Col) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-[12px] p-5 border border-black/10 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-[#0D0C22]">Urutan Tampilan Profil</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Tentukan bagian profil yang diprioritaskan di public profile sekolah.
                  </p>

                  <div className="space-y-2">
                    {(schoolProfile.sectionOrder || ['featured_projects', 'students', 'achievements', 'about']).map(
                      (sec, idx) => (
                        <div
                          key={sec}
                          className="p-3 bg-[#F8FAFC] border border-black/10 rounded-[8px] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-[#0D0C22] capitalize">
                              {sec === 'featured_projects'
                                ? 'Featured Projects'
                                : sec === 'students'
                                ? 'Daftar Siswa'
                                : sec === 'achievements'
                                ? 'Prestasi'
                                : 'Tentang Sekolah'}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                            Tampil
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Catatan: Section lain tetap tampil otomatis di halaman publik sesuai preferensi pengunjung.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-[12px] p-5 border border-black/10 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-[#0D0C22]">Konten Otomatis</h3>
                  <ul className="text-xs text-neutral-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Jumlah siswa dan project dihitung otomatis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Project siswa otomatis tampil di showcase sekolah</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Aktivitas terbaru dan statistik penilaian terintegrasi</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 6: SETTINGS                                         */}
        {/* ======================================================== */}
        {activeTab === 'settings' && !selectedStudentId && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0D0C22]">Pengaturan Dashboard Sekolah</h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Konfigurasi notifikasi permohonan siswa, integrasi rubrik, dan hak akses guru pembimbing.
              </p>
            </div>

            <div className="bg-white rounded-[12px] p-5 sm:p-6 border border-black/10 shadow-xs space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0D0C22]">Notifikasi Permohonan Siswa Baru</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Kirim email setiap kali siswa baru mengajukan relasi dengan sekolah.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 accent-[#155DFC] rounded-[4px] cursor-pointer"
                />
              </div>

              <div className="flex items-start justify-between border-t border-black/5 pt-4">
                <div>
                  <h3 className="text-xs font-bold text-[#0D0C22]">Kemitraan Industri Terbuka (Public Inquiries)</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Izinkan UMKM dan perusahaan industri mengirim penawaran kerja sama langsung via School Profile.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 accent-[#155DFC] rounded-[4px] cursor-pointer"
                />
              </div>

              <div className="flex items-start justify-between border-t border-black/5 pt-4">
                <div>
                  <h3 className="text-xs font-bold text-[#0D0C22]">Auto-Sync Career Score</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Otomatis perbarui skor karir portofolio siswa begitu asesmen dinyatakan selesai.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 accent-[#155DFC] rounded-[4px] cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-[12px] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#155DFC] shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Mode Simulasi Penuh Aktif:</span> Semua perubahan approval, draf asesmen,
                dan prestasi disimpan responsif di memori aplikasi sehingga Anda dapat menguji seluruh user flow
                secara langsung.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
