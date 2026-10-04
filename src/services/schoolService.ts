import { 
  SchoolInfo, 
  SchoolDashboardOverview, 
  StudentApprovalItem, 
  StudentAssessmentSummary, 
  StudentAssessmentDetail, 
  RubricCriterion, 
  SchoolAchievement, 
  PublicSchoolProfile, 
  SchoolStatus, 
  AssessmentStatus 
} from '@/types';
import { apiUrl } from '@/lib/api-config';

// Default Rubric Template
export const DEFAULT_RUBRIC: RubricCriterion[] = [
  { name: 'Kemampuan Teknis', score: 92, weight: 40, notes: 'Penguasaan tool dan kualitas deliverable' },
  { name: 'Tanggung Jawab', score: 85, weight: 20, notes: 'Ketepatan waktu dan komitmen' },
  { name: 'Komunikasi', score: 88, weight: 20, notes: 'Kejelasan berdiskusi dan proaktif' },
  { name: 'Kedisiplinan', score: 90, weight: 20, notes: 'Kepatuhan terhadap arahan dan SOP' },
];

export function calculateFinalScore(items: RubricCriterion[]): number {
  const totalWeight = items.reduce((acc, item) => acc + (item.weight || 0), 0);
  if (totalWeight === 0) return 0;
  const weightedSum = items.reduce((acc, item) => acc + ((item.score || 0) * (item.weight || 0)), 0);
  return parseFloat((weightedSum / totalWeight).toFixed(1));
}

// In-Memory Fallback State (Simulates full real-time reactivity for demo/testing)
const fallbackSchool: SchoolInfo = {
  id: 'sch-kreatif-01',
  name: 'SMK Kreatif Indonesia',
  slug: 'smk-kreatif-indonesia',
  logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80',
  tagline: 'Technology • Design • Creative Industry',
  description: 'Mencetak talenta kreator muda, digital marketer, dan desainer masa depan berbasis portofolio industri nyata.',
  address: 'Jl. Pemuda No. 45, Embong Kaliasin',
  city: 'Surabaya, Jawa Timur, Indonesia',
  website: 'https://smkkreatif.sch.id',
  email: 'kemitraan@smkkreatif.sch.id',
  phone: '+62 811-2345-6789',
  picName: 'Drs. Hendro Wibowo, M.Kom',
  picContact: '+62 812-9876-5432 (Kepala Hubin)',
  sectionOrder: ['featured_projects', 'students', 'achievements', 'about'],
  isVerified: true,
};

let fallbackApprovals: StudentApprovalItem[] = [
  {
    id: 'req-1',
    studentId: 'std-andi',
    name: 'Andi Pratama',
    email: 'andi.pratama@student.smk.id',
    major: 'RPL',
    classGrade: 'XII RPL 1',
    graduationYear: '2026',
    requestDate: '2026-09-28',
    status: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    nisn: '0054891234',
  },
  {
    id: 'req-2',
    studentId: 'std-nabila',
    name: 'Nabila Putri',
    email: 'nabila.putri@student.smk.id',
    major: 'DKV',
    classGrade: 'XII DKV 2',
    graduationYear: '2026',
    requestDate: '2026-09-29',
    status: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    nisn: '0054891235',
  },
  {
    id: 'req-3',
    studentId: 'std-rizky',
    name: 'Rizky Ramadhan',
    email: 'rizky.r@student.smk.id',
    major: 'TKJ',
    classGrade: 'XI TKJ 1',
    graduationYear: '2027',
    requestDate: '2026-09-30',
    status: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    nisn: '0064891290',
  },
  {
    id: 'req-4',
    studentId: 'std-siti',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@student.smk.id',
    major: 'Animasi',
    classGrade: 'XII Animasi',
    graduationYear: '2026',
    requestDate: '2026-10-01',
    status: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    nisn: '0054891299',
  },
];

let fallbackStudentsAssessment: StudentAssessmentSummary[] = [
  {
    studentId: 'std-1',
    name: 'Andi Pratama',
    email: 'andi.p@student.smk.id',
    major: 'RPL',
    classGrade: 'XII RPL 1',
    graduationYear: '2026',
    nisn: '0054891234',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    projectCount: 12,
    status: 'completed',
    finalScore: 89.4,
    updatedAt: '2026-09-25',
  },
  {
    studentId: 'std-2',
    name: 'Budi Santoso',
    email: 'budi.s@student.smk.id',
    major: 'DKV',
    classGrade: 'XII DKV 1',
    graduationYear: '2026',
    nisn: '0054891288',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    projectCount: 8,
    status: 'draft',
    finalScore: 82.0,
    updatedAt: '2026-09-27',
  },
  {
    studentId: 'std-3',
    name: 'Nabila Putri',
    email: 'nabila.putri@student.smk.id',
    major: 'RPL',
    classGrade: 'XI RPL 2',
    graduationYear: '2027',
    nisn: '0064891255',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    projectCount: 9,
    status: 'not_started',
    finalScore: null,
    updatedAt: '2026-09-20',
  },
  {
    studentId: 'std-4',
    name: 'Rizky Ramadhan',
    email: 'rizky.r@student.smk.id',
    major: 'TKJ',
    classGrade: 'XII TKJ 1',
    graduationYear: '2026',
    nisn: '0054891290',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    projectCount: 14,
    status: 'completed',
    finalScore: 91.2,
    updatedAt: '2026-09-28',
  },
  {
    studentId: 'std-5',
    name: 'Farhan Maulana',
    email: 'farhan.m@student.smk.id',
    major: 'DKV',
    classGrade: 'XII DKV 2',
    graduationYear: '2026',
    nisn: '0054891295',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    projectCount: 6,
    status: 'completed',
    finalScore: 88.0,
    updatedAt: '2026-09-22',
  },
  {
    studentId: 'std-6',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@student.smk.id',
    major: 'Animasi',
    classGrade: 'XII Animasi',
    graduationYear: '2026',
    nisn: '0054891299',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    projectCount: 11,
    status: 'draft',
    finalScore: 87.5,
    updatedAt: '2026-09-29',
  }
];

let fallbackAchievements: SchoolAchievement[] = [
  {
    id: 'ach-1',
    title: 'Juara 1 Web Design Competition Nasional',
    description: 'Tim siswa RPL berhasil merancang platform SaaS interaktif terbaik di tingkat nasional.',
    year: '2026',
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop&q=80',
    category: 'Lomba Nasional',
  },
  {
    id: 'ach-2',
    title: 'Best Innovation Project LKS SMK',
    description: 'Proyek Smart Farming IoT dan Dashboard Kreatif oleh kolaborasi siswa RPL & TKJ.',
    year: '2026',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    category: 'Inovasi',
  },
  {
    id: 'ach-3',
    title: 'Top SMK Vokasi Kreatif Mitra Industri',
    description: 'Penghargaan atas 100+ kolaborasi siswa dengan UMKM aktif se-Jawa Timur.',
    year: '2025',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    category: 'Kemitraan',
  },
];

let fallbackStudentRubrics: Record<string, RubricCriterion[]> = {
  'std-1': [
    { name: 'Kemampuan Teknis', score: 92, weight: 40, notes: 'Menguasai Next.js dan Tailwind dengan sangat baik' },
    { name: 'Tanggung Jawab', score: 85, weight: 20, notes: 'Selalu mengirim brief update sesuai timeline' },
    { name: 'Komunikasi', score: 88, weight: 20, notes: 'Proaktif dan responsif saat diajak diskusi' },
    { name: 'Kedisiplinan', score: 90, weight: 20, notes: 'Kerapihan kode dan commit teratur' },
  ],
  'std-2': [
    { name: 'Kemampuan Teknis', score: 84, weight: 40, notes: 'Desain visual rapi, perlu peningkatan typography' },
    { name: 'Tanggung Jawab', score: 80, weight: 20, notes: 'Pengerjaan sesuai target' },
    { name: 'Komunikasi', score: 80, weight: 20, notes: 'Cukup komunikatif' },
    { name: 'Kedisiplinan', score: 85, weight: 20, notes: 'Hadir tepat waktu di kelas industri' },
  ],
  'std-4': [
    { name: 'Kemampuan Teknis', score: 95, weight: 40, notes: 'Sangat mahir konfigurasi jaringan & server cloud' },
    { name: 'Tanggung Jawab', score: 90, weight: 20, notes: 'Penyelesaian proyek tanpa komplain' },
    { name: 'Komunikasi', score: 88, weight: 20, notes: 'Komunikasi jelas dan lugas' },
    { name: 'Kedisiplinan', score: 90, weight: 20, notes: 'Disiplin tinggi' },
  ],
  'std-6': [
    { name: 'Kemampuan Teknis', score: 90, weight: 40, notes: 'Animasi 3D sangat halus' },
    { name: 'Tanggung Jawab', score: 85, weight: 20, notes: 'Tepat waktu' },
    { name: 'Komunikasi', score: 85, weight: 20, notes: 'Responsif' },
    { name: 'Kedisiplinan', score: 88, weight: 20, notes: 'Sangat tertib' },
  ]
};

export interface SchoolStudentProjectItem {
  id: string;
  studentId: string;
  title: string;
  studentName: string;
  studentAvatar?: string;
  category: string;
  thumbnail: string;
  createdDate: string;
  viewsCount?: string;
  isFeaturedSchool?: boolean;
}

export interface SchoolStudentItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  major: string;
  classGrade: string;
  graduationYear: string;
  projectCount: number;
  careerScore: number;
  isFeatured?: boolean;
}

let fallbackAllStudentProjects: SchoolStudentProjectItem[] = [
  {
    id: 'sp-1',
    studentId: 'std-1',
    title: 'UI Design UMKM Fashion & Coffee Shop',
    studentName: 'Andi Pratama',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    category: 'UI/UX Design',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    createdDate: '12 Sep 2026',
    viewsCount: '1.4K',
    isFeaturedSchool: true,
  },
  {
    id: 'sp-2',
    studentId: 'std-2',
    title: 'Smart Farming IoT Sensor Dashboard',
    studentName: 'Nabila Putri',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    category: 'Web App',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    createdDate: '20 Sep 2026',
    viewsCount: '2.8K',
    isFeaturedSchool: true,
  },
  {
    id: 'sp-3',
    studentId: 'std-4',
    title: 'Brand Identity & Kemasan UMKM Rempah',
    studentName: 'Rizky Ramadhan',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    category: 'Branding',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
    createdDate: '18 Agu 2026',
    viewsCount: '890',
    isFeaturedSchool: true,
  },
  {
    id: 'sp-4',
    studentId: 'std-6',
    title: 'Reels Review Skincare Lokal Natural',
    studentName: 'Siti Nurhaliza',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    category: 'Video UGC',
    thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    createdDate: '24 Sep 2026',
    viewsCount: '5.2K',
    isFeaturedSchool: false,
  },
  {
    id: 'sp-5',
    studentId: 'std-1',
    title: 'E-Commerce Mobile App Wireframe & Design System',
    studentName: 'Andi Pratama',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    category: 'UI/UX Design',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    createdDate: '26 Sep 2026',
    viewsCount: '3.1K',
    isFeaturedSchool: false,
  },
  {
    id: 'sp-6',
    studentId: 'std-2',
    title: 'Ilustrasi Maskot & Katalog Produk Madu Hutan',
    studentName: 'Nabila Putri',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    category: 'Branding',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    createdDate: '28 Sep 2026',
    viewsCount: '1.9K',
    isFeaturedSchool: false,
  }
];

let fallbackAllSchoolStudents: SchoolStudentItem[] = [
  {
    id: 'std-1',
    name: 'Andi Pratama',
    email: 'andi.p@student.smk.id',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    role: 'UI/UX Designer',
    major: 'RPL',
    classGrade: 'XII RPL 1',
    graduationYear: '2026',
    projectCount: 12,
    careerScore: 94,
    isFeatured: true,
  },
  {
    id: 'std-2',
    name: 'Nabila Putri',
    email: 'nabila.putri@student.smk.id',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    role: 'Graphic Designer',
    major: 'DKV',
    classGrade: 'XI RPL 2',
    graduationYear: '2027',
    projectCount: 8,
    careerScore: 91,
    isFeatured: true,
  },
  {
    id: 'std-4',
    name: 'Rizky Ramadhan',
    email: 'rizky.r@student.smk.id',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    role: 'Cloud & Network Specialist',
    major: 'TKJ',
    classGrade: 'XII TKJ 1',
    graduationYear: '2026',
    projectCount: 14,
    careerScore: 95,
    isFeatured: true,
  },
  {
    id: 'std-6',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@student.smk.id',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: '3D Animator & Video Creator',
    major: 'Animasi',
    classGrade: 'XII Animasi',
    graduationYear: '2026',
    projectCount: 11,
    careerScore: 92,
    isFeatured: true,
  },
  {
    id: 'std-5',
    name: 'Farhan Maulana',
    email: 'farhan.m@student.smk.id',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    role: 'Illustrator & 2D Artist',
    major: 'DKV',
    classGrade: 'XII DKV 2',
    graduationYear: '2026',
    projectCount: 6,
    careerScore: 88,
    isFeatured: false,
  },
  {
    id: 'std-2-budi',
    name: 'Budi Santoso',
    email: 'budi.s@student.smk.id',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    role: 'Visual Designer',
    major: 'DKV',
    classGrade: 'XII DKV 1',
    graduationYear: '2026',
    projectCount: 8,
    careerScore: 82,
    isFeatured: false,
  }
];

// ==========================================
// School Service Methods (Client & Universal Safe)
// ==========================================
export const schoolService = {
  // 1. Overview Dashboard Stats & Activities
  async getDashboardOverview(_schoolId: string = fallbackSchool.id): Promise<SchoolDashboardOverview> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/school/dashboard', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.totalStudents !== undefined) return data;
        }
      } catch {
        // Fallback below
      }
    }

    // Default fallback matching user specification:
    // 42 Total Siswa (36 Siswa Aktif, 4 Pending, 31 Sudah Dinilai, 5 Draft, 6 Belum Dinilai, 126 Total Project)
    const active = 36;
    const pending = fallbackApprovals.filter(a => a.status === 'pending').length;
    const graded = fallbackStudentsAssessment.filter(s => s.status === 'completed').length;
    const draft = fallbackStudentsAssessment.filter(s => s.status === 'draft').length;
    const ungraded = fallbackStudentsAssessment.filter(s => s.status === 'not_started').length;

    return {
      totalStudents: active + pending,
      activeStudents: active,
      pendingApproval: pending,
      gradedStudents: graded,
      ungradedStudents: ungraded,
      totalProjects: 126,
      recentActivities: [
        { id: 'act-1', studentId: 'std-1', studentName: 'Andi Pratama', activityType: 'uploaded_project', description: 'mengupload project baru "Design System UMKM"', timestamp: '15 menit yang lalu' },
        { id: 'act-2', studentId: 'std-2', studentName: 'Nabila Putri', activityType: 'completed_project', description: 'menyelesaikan project "Smart Farming IoT"', timestamp: '1 jam yang lalu' },
        { id: 'act-3', studentId: 'std-3', studentName: 'Rizky Ramadhan', activityType: 'joined', description: 'bergabung melalui SMK Kreatif Indonesia', timestamp: '3 jam yang lalu' },
        { id: 'act-4', studentId: 'std-6', studentName: 'Siti Nurhaliza', activityType: 'assessed', description: 'menyelesaikan rubrik penilaian kompetensi', timestamp: '5 jam yang lalu' },
      ],
      assessmentProgress: {
        graded: 31,
        draft: 5,
        ungraded: 6,
      }
    };
  },

  // 2. Pending Approvals List
  async getApprovals(_schoolId?: string): Promise<StudentApprovalItem[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/school/approvals', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) return json.data;
        }
      } catch {
        // Fallback
      }
    }
    return fallbackApprovals;
  },

  // 3. Approve or Reject Student Relation
  async updateApprovalStatus(relationId: string, status: SchoolStatus): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/school/approvals/${relationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            const item = fallbackApprovals.find(a => a.id === relationId);
            if (item) item.status = status;
            return true;
          }
        }
      } catch {
        // Fallback
      }
    }

    const item = fallbackApprovals.find(a => a.id === relationId);
    if (item) {
      item.status = status;
      if (status === 'approved') {
        const exists = fallbackStudentsAssessment.some(s => s.studentId === item.studentId);
        if (!exists) {
          fallbackStudentsAssessment.unshift({
            studentId: item.studentId,
            name: item.name,
            email: item.email,
            major: item.major,
            classGrade: item.classGrade,
            graduationYear: item.graduationYear,
            nisn: item.nisn,
            avatarUrl: item.avatarUrl,
            projectCount: 0,
            status: 'not_started',
            finalScore: null,
            updatedAt: new Date().toISOString().split('T')[0],
          });
        }
        const existsInSchool = fallbackAllSchoolStudents.some(s => s.id === item.studentId);
        if (!existsInSchool) {
          fallbackAllSchoolStudents.unshift({
            id: item.studentId,
            name: item.name,
            email: item.email,
            avatarUrl: item.avatarUrl,
            role: `${item.major} Student Creator`,
            major: item.major,
            classGrade: item.classGrade,
            graduationYear: item.graduationYear,
            projectCount: 0,
            careerScore: 88,
            isFeatured: false,
          });
        }
      }
      return true;
    }
    return false;
  },

  // 4. Students for Assessment (with Search & Filters)
  async getStudentsForAssessment(
    _schoolId?: string,
    filters?: {
      search?: string;
      year?: string;
      major?: string;
      classGrade?: string;
      status?: AssessmentStatus | 'all';
    }
  ): Promise<StudentAssessmentSummary[]> {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams();
        if (filters?.search) params.set('search', filters.search);
        if (filters?.year && filters.year !== 'all') params.set('year', filters.year);
        if (filters?.major && filters.major !== 'all') params.set('major', filters.major);
        if (filters?.classGrade && filters.classGrade !== 'all') params.set('classGrade', filters.classGrade);
        if (filters?.status && filters.status !== 'all') params.set('status', filters.status);

        const res = await fetch(`/api/school/assessments?${params.toString()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) return json.data;
        }
      } catch {
        // Fallback
      }
    }

    let result = [...fallbackStudentsAssessment];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.nisn && s.nisn.toLowerCase().includes(q))
      );
    }

    if (filters?.year && filters.year !== 'all') {
      result = result.filter(s => s.graduationYear === filters.year);
    }

    if (filters?.major && filters.major !== 'all') {
      result = result.filter(s => s.major.toLowerCase() === filters.major?.toLowerCase());
    }

    if (filters?.classGrade && filters.classGrade !== 'all') {
      result = result.filter(s => s.classGrade.toLowerCase().includes(filters.classGrade!.toLowerCase()));
    }

    if (filters?.status && filters.status !== 'all') {
      result = result.filter(s => s.status === filters.status);
    }

    return result;
  },

  // 5. Student Detail for Assessment
  async getStudentAssessmentDetail(studentId: string): Promise<StudentAssessmentDetail | null> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/school/assessments/${studentId}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) return json.data;
        }
      } catch {
        // Fallback
      }
    }

    const studentSummary = fallbackStudentsAssessment.find(s => s.studentId === studentId);
    if (!studentSummary) {
      const approval = fallbackApprovals.find(a => a.studentId === studentId);
      if (!approval) return null;
      return {
        student: {
          id: approval.studentId,
          name: approval.name,
          email: approval.email,
          avatarUrl: approval.avatarUrl,
          major: approval.major,
          classGrade: approval.classGrade,
          graduationYear: approval.graduationYear,
          nisn: approval.nisn,
          projectCount: 0,
          skills: ['UI/UX', 'Figma', 'Web Design'],
          bio: 'Siswa SMK Kreatif Indonesia aktif berkolaborasi.',
        },
        projects: [],
        assessment: {
          status: 'not_started',
          finalScore: null,
          rubricItems: [...DEFAULT_RUBRIC],
        }
      };
    }

    const rubricItems = fallbackStudentRubrics[studentId] || [...DEFAULT_RUBRIC];
    const finalScore = studentSummary.finalScore ?? calculateFinalScore(rubricItems);

    return {
      student: {
        id: studentSummary.studentId,
        name: studentSummary.name,
        email: studentSummary.email,
        avatarUrl: studentSummary.avatarUrl,
        major: studentSummary.major,
        classGrade: studentSummary.classGrade,
        graduationYear: studentSummary.graduationYear,
        nisn: studentSummary.nisn,
        projectCount: studentSummary.projectCount,
        skills: ['UI/UX', 'Figma', 'React', 'Mobile App', 'Graphic Design'],
        bio: 'Fokus pada pengembangan aplikasi web, riset user flow, dan desain antarmuka UMKM modern.',
      },
      projects: [
        {
          id: 'proj-1',
          title: 'UI Design UMKM Fashion & Coffee Shop',
          category: 'UI/UX Design',
          coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
          createdDate: '12 Sep 2026',
          viewsCount: '1.4K',
          isFeaturedSchool: true,
        },
        {
          id: 'proj-2',
          title: 'Smart Farming IoT Sensor Dashboard',
          category: 'Web App',
          coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          createdDate: '20 Sep 2026',
          viewsCount: '2.8K',
          isFeaturedSchool: true,
        },
        {
          id: 'proj-3',
          title: 'Reels Review Skincare Lokal Natural',
          category: 'Video UGC',
          coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
          createdDate: '24 Sep 2026',
          viewsCount: '5.2K',
          isFeaturedSchool: false,
        }
      ],
      assessment: {
        status: studentSummary.status,
        finalScore,
        rubricItems,
        notes: 'Siswa menunjukkan dedikasi dan keterampilan teknis di atas rata-rata.'
      }
    };
  },

  // 6. Save Assessment (Draft or Finish)
  async saveAssessment(
    studentId: string,
    rubricItems: RubricCriterion[],
    status: AssessmentStatus,
    notes?: string
  ): Promise<{ success: boolean; finalScore: number }> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/school/assessments/${studentId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rubricItems, status, notes })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const finalScore = json.data.finalScore;
            fallbackStudentRubrics[studentId] = rubricItems;
            const student = fallbackStudentsAssessment.find(s => s.studentId === studentId);
            if (student) {
              student.status = status;
              student.finalScore = finalScore;
              student.updatedAt = new Date().toISOString().split('T')[0];
            }
            return json.data;
          }
        }
      } catch {
        // Fallback
      }
    }

    const finalScore = calculateFinalScore(rubricItems);
    fallbackStudentRubrics[studentId] = rubricItems;

    const student = fallbackStudentsAssessment.find(s => s.studentId === studentId);
    if (student) {
      student.status = status;
      student.finalScore = finalScore;
      student.updatedAt = new Date().toISOString().split('T')[0];
    }

    return { success: true, finalScore };
  },

  // 7. Public School Profile
  async getPublicSchoolProfile(slug: string = 'smk-kreatif-indonesia'): Promise<PublicSchoolProfile> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/school/${slug}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) return json.data;
        }
      } catch {
        // Fallback
      }
    }

    const school = { ...fallbackSchool, slug };
    const featuredProjects = fallbackAllStudentProjects
      .filter(p => p.isFeaturedSchool)
      .map(p => ({
        id: p.id,
        title: p.title,
        studentName: p.studentName,
        studentAvatar: p.studentAvatar,
        category: p.category,
        thumbnail: p.thumbnail,
        createdDate: p.createdDate,
      }));

    const featuredStudents = fallbackAllSchoolStudents.filter(s => s.isFeatured);
    const displayStudents = featuredStudents.length > 0 ? featuredStudents : fallbackAllSchoolStudents;

    return {
      school,
      stats: {
        totalStudents: fallbackAllSchoolStudents.length + 36,
        totalProjects: 126,
        totalCollaborations: 18,
        totalAchievements: fallbackAchievements.length,
      },
      featuredProjects,
      studentProjects: fallbackAllStudentProjects.map(p => ({
        id: p.id,
        title: p.title,
        studentName: p.studentName,
        studentAvatar: p.studentAvatar,
        category: p.category,
        thumbnail: p.thumbnail,
        createdDate: p.createdDate,
        viewsCount: p.viewsCount,
      })),
      students: displayStudents.map(s => ({
        id: s.id,
        name: s.name,
        avatarUrl: s.avatarUrl,
        role: s.role,
        major: s.major,
        projectCount: s.projectCount,
        careerScore: s.careerScore,
      })),
      achievements: fallbackAchievements,
      sectionOrder: fallbackSchool.sectionOrder || ['featured_projects', 'students', 'achievements', 'about'],
    };
  },

  // 8. Update School Profile Info
  async updateSchoolProfile(_schoolId: string, data: Partial<SchoolInfo>): Promise<SchoolInfo> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/school/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            Object.assign(fallbackSchool, json.data);
            return json.data;
          }
        }
      } catch {
        // Fallback
      }
    }
    Object.assign(fallbackSchool, data);
    return { ...fallbackSchool };
  },

  // 9. Add or Edit Achievement
  async saveAchievement(achievement: Partial<SchoolAchievement>): Promise<SchoolAchievement> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/school/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(achievement)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        }
      } catch {
        // Fallback
      }
    }

    if (achievement.id) {
      const idx = fallbackAchievements.findIndex(a => a.id === achievement.id);
      if (idx !== -1) {
        fallbackAchievements[idx] = { ...fallbackAchievements[idx], ...achievement } as SchoolAchievement;
        return fallbackAchievements[idx];
      }
    }
    const newAch: SchoolAchievement = {
      id: `ach-${Date.now()}`,
      title: achievement.title || 'Prestasi Baru',
      description: achievement.description || '',
      year: achievement.year || '2026',
      imageUrl: achievement.imageUrl || 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=600&auto=format&fit=crop&q=80',
      category: achievement.category || 'Kompetisi',
    };
    fallbackAchievements.unshift(newAch);
    return newAch;
  },

  // 10. Delete Achievement
  async deleteAchievement(achievementId: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/school/achievements?id=${achievementId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          const json = await res.json();
          return !!json.success;
        }
      } catch {
        // Fallback
      }
    }

    const initialLen = fallbackAchievements.length;
    fallbackAchievements = fallbackAchievements.filter(a => a.id !== achievementId);
    return fallbackAchievements.length < initialLen;
  },

  // 11. Toggle Featured Project (is_featured_school)
  async toggleFeaturedProject(projectId: string, isFeatured: boolean): Promise<boolean> {
    const proj = fallbackAllStudentProjects.find(p => p.id === projectId);
    if (proj) {
      proj.isFeaturedSchool = isFeatured;
      return true;
    }
    return false;
  },

  // 12. Toggle Featured Student
  async toggleFeaturedStudent(studentId: string, isFeatured: boolean): Promise<boolean> {
    const std = fallbackAllSchoolStudents.find(s => s.id === studentId);
    if (std) {
      std.isFeatured = isFeatured;
      return true;
    }
    return false;
  },

  // 13. Update Section Order for Public School Profile
  async updateSectionOrder(sectionOrder: string[]): Promise<boolean> {
    fallbackSchool.sectionOrder = sectionOrder;
    return true;
  },

  // 14. Get All School Student Projects
  async getAllStudentProjects(): Promise<SchoolStudentProjectItem[]> {
    return fallbackAllStudentProjects;
  },

  // 15. Get All Approved School Students
  async getSchoolStudents(): Promise<SchoolStudentItem[]> {
    return fallbackAllSchoolStudents;
  }
};
