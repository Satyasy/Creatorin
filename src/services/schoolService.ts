import type {
  AssessmentStatus, PublicSchoolProfile, RubricCriterion, SchoolAchievement,
  SchoolDashboardOverview, SchoolInfo, SchoolStatus, SchoolStudentItem,
  SchoolStudentProjectItem, StudentApprovalItem, StudentAssessmentDetail, StudentAssessmentSummary,
} from '@/types';
import { apiUrl } from '@/lib/api-config';

export const DEFAULT_RUBRIC: RubricCriterion[] = [
  { name: 'Kemampuan Teknis', score: 0, weight: 40 },
  { name: 'Tanggung Jawab', score: 0, weight: 20 },
  { name: 'Komunikasi', score: 0, weight: 20 },
  { name: 'Kedisiplinan', score: 0, weight: 20 },
];

export function calculateFinalScore(items: RubricCriterion[]): number {
  const weight = items.reduce((sum, item) => sum + item.weight, 0);
  return weight ? Math.round(items.reduce((sum, item) => sum + item.score * item.weight, 0) / weight * 10) / 10 : 0;
}

type SchoolBundle = {
  overview: SchoolDashboardOverview;
  approvals: StudentApprovalItem[];
  assessments: StudentAssessmentSummary[];
  profile: PublicSchoolProfile;
  projects: SchoolStudentProjectItem[];
  students: SchoolStudentItem[];
  detail: StudentAssessmentDetail | null;
};

let pending: Promise<SchoolBundle> | null = null;

async function readBundle(params?: URLSearchParams): Promise<SchoolBundle> {
  if (!params?.size && pending) return pending;
  const request = fetch(`/api/school/data${params?.size ? `?${params}` : ''}`, { cache: 'no-store' }).then(async response => {
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Gagal memuat data sekolah');
    return body as SchoolBundle;
  });
  if (!params?.size) {
    pending = request;
    request.finally(() => { if (pending === request) pending = null; }).catch(() => {});
  }
  return request;
}

async function write(action: string, body: Record<string, unknown>) {
  const response = await fetch('/api/school/data', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Gagal menyimpan data sekolah');
  pending = null;
  return result;
}

export const schoolService = {
  async getDashboardOverview(): Promise<SchoolDashboardOverview> { return (await readBundle()).overview; },
  async getApprovals(): Promise<StudentApprovalItem[]> { return (await readBundle()).approvals; },
  async updateApprovalStatus(id: string, status: SchoolStatus): Promise<boolean> {
    return Boolean((await write('approval', { id, status })).success);
  },
  async getStudentsForAssessment(_schoolId?: string, filters?: { search?: string; year?: string; major?: string; classGrade?: string; status?: AssessmentStatus | 'all' }): Promise<StudentAssessmentSummary[]> {
    const rows = (await readBundle()).assessments;
    return rows.filter(row => {
      const query = filters?.search?.toLowerCase();
      return (!query || [row.name, row.email, row.nisn].some(value => value?.toLowerCase().includes(query)))
        && (!filters?.year || filters.year === 'all' || row.graduationYear === filters.year)
        && (!filters?.major || filters.major === 'all' || row.major === filters.major)
        && (!filters?.classGrade || filters.classGrade === 'all' || row.classGrade === filters.classGrade)
        && (!filters?.status || filters.status === 'all' || row.status === filters.status);
    });
  },
  async getStudentAssessmentDetail(studentId: string): Promise<StudentAssessmentDetail | null> {
    return (await readBundle(new URLSearchParams({ studentId }))).detail;
  },
  async saveAssessment(studentId: string, rubricItems: RubricCriterion[], status: AssessmentStatus, notes?: string): Promise<{ success: boolean; finalScore: number }> {
    const result = await write('assessment', { studentId, rubricItems, status, notes });
    return { success: true, finalScore: result.finalScore };
  },
  async getPublicSchoolProfile(slug?: string): Promise<PublicSchoolProfile> {
    return (await readBundle(slug ? new URLSearchParams({ slug }) : undefined)).profile;
  },
  async updateSchoolProfile(_schoolId: string, data: Partial<SchoolInfo>): Promise<SchoolInfo> {
    return (await write('profile', { data })).data;
  },
  async saveAchievement(data: Partial<SchoolAchievement>): Promise<SchoolAchievement> {
    return (await write('achievement', { data })).data;
  },
  async deleteAchievement(id: string): Promise<boolean> { return Boolean((await write('deleteAchievement', { id })).success); },
  async toggleFeaturedProject(id: string, featured: boolean): Promise<boolean> { return Boolean((await write('featuredProject', { id, featured })).success); },
  async toggleFeaturedStudent(id: string, featured: boolean): Promise<boolean> { return Boolean((await write('featuredStudent', { id, featured })).success); },
  async updateSectionOrder(sectionOrder: string[]): Promise<boolean> { return Boolean((await write('sectionOrder', { sectionOrder })).success); },
  async getAllStudentProjects(): Promise<SchoolStudentProjectItem[]> { return (await readBundle()).projects; },
  async getSchoolStudents(): Promise<SchoolStudentItem[]> { return (await readBundle()).students; },
};
