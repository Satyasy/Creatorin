import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { assessmentItems, creatorProfiles, profiles, projects, schoolAchievements, schoolAssessments, schools, studentSchoolRelations } from '@/lib/db/schema';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

async function schoolFor(request: NextRequest, slug?: string) {
  const db = getDb();
  if (!db) return null;
  if (slug) {
    const [school] = await db.select().from(schools).where(eq(schools.slug, slug)).limit(1);
    return school || null;
  }
  const user = await getAuthenticatedUser(request);
  if (!user || user.role !== 'school') return null;
  const [existing] = await db.select().from(schools).where(eq(schools.profileId, user.id)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(schools).values({ profileId: user.id, name: user.fullName, slug: `school-${user.id}` }).onConflictDoNothing().returning();
  if (created) return created;
  const [school] = await db.select().from(schools).where(eq(schools.profileId, user.id)).limit(1);
  return school || null;
}

export async function GET(request: NextRequest) {
  const db = getDb();
  if (!db) return fail('Database belum terhubung', 503);
  try {
    const school = await schoolFor(request, request.nextUrl.searchParams.get('slug') || undefined);
    if (!school) return fail('Sekolah tidak ditemukan atau akses ditolak', 404);

    const relations = await db.select({
      id: studentSchoolRelations.id, studentId: studentSchoolRelations.studentId,
      status: studentSchoolRelations.schoolStatus, featured: studentSchoolRelations.isFeatured,
      graduationYear: studentSchoolRelations.graduationYear, major: studentSchoolRelations.major,
      classGrade: studentSchoolRelations.classGrade, nisn: studentSchoolRelations.nisn,
      requestDate: studentSchoolRelations.requestDate,
      name: profiles.fullName, email: profiles.email, avatarUrl: profiles.avatarUrl,
      careerScore: creatorProfiles.careerScore, skills: creatorProfiles.skills, bio: creatorProfiles.bio,
    }).from(studentSchoolRelations)
      .innerJoin(profiles, eq(studentSchoolRelations.studentId, profiles.id))
      .leftJoin(creatorProfiles, eq(studentSchoolRelations.studentId, creatorProfiles.profileId))
      .where(eq(studentSchoolRelations.schoolId, school.id));
    const ids = relations.map(row => row.studentId);
    const [studentProjects, assessments, achievements] = await Promise.all([
      ids.length ? db.select().from(projects).where(inArray(projects.creatorId, ids)) : Promise.resolve([]),
      db.select().from(schoolAssessments).where(eq(schoolAssessments.schoolId, school.id)),
      db.select().from(schoolAchievements).where(eq(schoolAchievements.schoolId, school.id)),
    ]);
    const assessmentIds = assessments.map(row => row.id);
    const items = assessmentIds.length ? await db.select().from(assessmentItems).where(inArray(assessmentItems.assessmentId, assessmentIds)) : [];
    const approved = relations.filter(row => row.status === 'approved');
    const projectCount = (id: string) => studentProjects.filter(project => project.creatorId === id).length;
    const assessmentOf = (id: string) => assessments.find(row => row.studentId === id);
    const projectRows = studentProjects.map(project => {
      const student = relations.find(row => row.studentId === project.creatorId);
      return {
        id: project.id, studentId: project.creatorId, title: project.title,
        studentName: student?.name || '', studentAvatar: student?.avatarUrl || '',
        category: project.category, thumbnail: project.mediaUrl || '',
        createdDate: project.createdAt.toISOString(), viewsCount: project.viewsCount,
        isFeaturedSchool: project.isFeaturedSchool,
      };
    });
    const studentRows = approved.map(row => ({
      id: row.studentId, name: row.name, email: row.email || '', avatarUrl: row.avatarUrl || '',
      role: row.major || 'Kreator', major: row.major, classGrade: row.classGrade,
      graduationYear: row.graduationYear, projectCount: projectCount(row.studentId),
      careerScore: row.careerScore || 0, isFeatured: row.featured,
    }));
    const assessmentRows = approved.map(row => {
      const assessment = assessmentOf(row.studentId);
      return {
        studentId: row.studentId, name: row.name, email: row.email || '',
        major: row.major, classGrade: row.classGrade, graduationYear: row.graduationYear,
        nisn: row.nisn || '', avatarUrl: row.avatarUrl || '', projectCount: projectCount(row.studentId),
        status: assessment?.status || 'not_started', finalScore: assessment?.finalScore ? Number(assessment.finalScore) : null,
        updatedAt: assessment?.updatedAt?.toISOString() || '',
      };
    });
    const approvals = relations.filter(row => row.status === 'pending').map(row => ({
      id: row.id, studentId: row.studentId, name: row.name, email: row.email || '',
      major: row.major, classGrade: row.classGrade, graduationYear: row.graduationYear,
      nisn: row.nisn || '', avatarUrl: row.avatarUrl || '', requestDate: row.requestDate.toISOString(), status: row.status,
    }));
    const schoolInfo = {
      id: school.id, name: school.name, slug: school.slug, logoUrl: school.logoUrl || '',
      coverUrl: school.coverUrl || '', tagline: school.tagline || '', description: school.description || '',
      address: school.address || '', city: school.city || '', website: school.website || '',
      email: school.email || '', phone: school.phone || '', picName: school.picName || '',
      picContact: school.picContact || '', sectionOrder: school.sectionOrder, isVerified: school.isVerified,
    };
    const publicProfile = {
      school: schoolInfo,
      stats: { totalStudents: approved.length, totalProjects: projectRows.length, totalCollaborations: 0, totalAchievements: achievements.length },
      featuredProjects: projectRows.filter(row => row.isFeaturedSchool).map(row => ({ ...row })),
      studentProjects: projectRows, students: studentRows, achievements: achievements.map(row => ({
        id: row.id, title: row.title, description: row.description || '', year: row.year,
        imageUrl: row.imageUrl || '', category: row.category,
      })), sectionOrder: school.sectionOrder,
    };
    const graded = assessmentRows.filter(row => row.status === 'completed').length;
    const draft = assessmentRows.filter(row => row.status === 'draft').length;
    const overview = {
      totalStudents: relations.length, activeStudents: approved.length, pendingApproval: approvals.length,
      gradedStudents: graded, ungradedStudents: approved.length - graded - draft,
      totalProjects: projectRows.length, recentActivities: [],
      assessmentProgress: { graded, draft, ungraded: approved.length - graded - draft },
    };
    const studentId = request.nextUrl.searchParams.get('studentId');
    const student = approved.find(row => row.studentId === studentId);
    const assessment = student ? assessmentOf(student.studentId) : undefined;
    const detail = student ? {
      student: {
        id: student.studentId, name: student.name, email: student.email || '', avatarUrl: student.avatarUrl || '',
        major: student.major, classGrade: student.classGrade, graduationYear: student.graduationYear,
        nisn: student.nisn || '', projectCount: projectCount(student.studentId),
        skills: student.skills || [], bio: student.bio || '',
      },
      projects: projectRows.filter(row => row.studentId === student.studentId).map(row => ({
        id: row.id, title: row.title, category: row.category, coverImage: row.thumbnail,
        createdDate: row.createdDate, viewsCount: row.viewsCount, isFeaturedSchool: row.isFeaturedSchool,
      })),
      assessment: {
        id: assessment?.id, status: assessment?.status || 'not_started',
        finalScore: assessment?.finalScore ? Number(assessment.finalScore) : null, notes: assessment?.notes || '',
        rubricItems: assessment ? items.filter(item => item.assessmentId === assessment.id).map(item => ({
          id: item.id, name: item.criterion, score: item.score, weight: item.weight, notes: item.notes || '',
        })) : [],
      },
    } : null;
    return NextResponse.json({ overview, approvals, assessments: assessmentRows, profile: publicProfile, projects: projectRows, students: studentRows, detail });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Gagal memuat sekolah', 500);
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user || user.role !== 'school') return fail('Akses ditolak', 403);
  const db = getDb();
  if (!db) return fail('Database belum terhubung', 503);
  try {
    const school = await schoolFor(request);
    if (!school) return fail('Sekolah tidak ditemukan', 404);
    const body = await request.json();
    const action = String(body.action || '');
    if (action === 'approval') {
      if (!['approved', 'rejected'].includes(body.status)) return fail('Status tidak valid', 400);
      const [row] = await db.update(studentSchoolRelations).set({ schoolStatus: body.status, approvedAt: body.status === 'approved' ? new Date() : null })
        .where(and(eq(studentSchoolRelations.id, body.id), eq(studentSchoolRelations.schoolId, school.id))).returning();
      return row ? NextResponse.json({ success: true }) : fail('Permintaan tidak ditemukan', 404);
    }
    if (action === 'assessment') {
      const [relation] = await db.select().from(studentSchoolRelations).where(and(eq(studentSchoolRelations.studentId, body.studentId), eq(studentSchoolRelations.schoolId, school.id), eq(studentSchoolRelations.schoolStatus, 'approved'))).limit(1);
      if (!relation) return fail('Siswa tidak ditemukan', 404);
      if (!Array.isArray(body.rubricItems) || !['draft', 'completed'].includes(body.status)) return fail('Penilaian tidak valid', 400);
      const rubric = body.rubricItems as { name: string; score: number; weight: number; notes?: string }[];
      if (rubric.some(item => !item.name || item.score < 0 || item.score > 100 || item.weight < 0)) return fail('Nilai rubrik tidak valid', 400);
      const totalWeight = rubric.reduce((sum, item) => sum + Number(item.weight), 0);
      const finalScore = totalWeight ? rubric.reduce((sum, item) => sum + Number(item.score) * Number(item.weight), 0) / totalWeight : 0;
      const [existing] = await db.select().from(schoolAssessments).where(and(eq(schoolAssessments.schoolId, school.id), eq(schoolAssessments.studentId, body.studentId))).limit(1);
      const [saved] = existing
        ? await db.update(schoolAssessments).set({ status: body.status, finalScore: String(finalScore), notes: body.notes || '', assessedBy: user.id, updatedAt: new Date() }).where(eq(schoolAssessments.id, existing.id)).returning()
        : await db.insert(schoolAssessments).values({ schoolId: school.id, studentId: body.studentId, status: body.status, finalScore: String(finalScore), notes: body.notes || '', assessedBy: user.id }).returning();
      await db.delete(assessmentItems).where(eq(assessmentItems.assessmentId, saved.id));
      if (rubric.length) await db.insert(assessmentItems).values(rubric.map(item => ({ assessmentId: saved.id, criterion: item.name, score: Number(item.score), weight: Number(item.weight), notes: item.notes || '' })));
      return NextResponse.json({ success: true, finalScore });
    }
    if (action === 'profile' || action === 'sectionOrder') {
      const source = action === 'sectionOrder' ? { sectionOrder: body.sectionOrder } : body.data || {};
      const allowed = ['name', 'logoUrl', 'coverUrl', 'tagline', 'description', 'address', 'city', 'website', 'email', 'phone', 'picName', 'picContact', 'sectionOrder'] as const;
      const values: Record<string, unknown> = {};
      for (const key of allowed) if (key in source) values[key] = source[key];
      if (!Object.keys(values).length) return fail('Tidak ada perubahan', 400);
      const [saved] = await db.update(schools).set(values).where(eq(schools.id, school.id)).returning();
      return NextResponse.json({ success: true, data: saved });
    }
    if (action === 'achievement') {
      const data = body.data || {};
      if (!String(data.title || '').trim()) return fail('Judul prestasi wajib diisi', 400);
      const values = { title: String(data.title).trim(), description: String(data.description || ''), year: String(data.year || ''), imageUrl: String(data.imageUrl || ''), category: String(data.category || 'Kompetisi') };
      const [saved] = data.id
        ? await db.update(schoolAchievements).set(values).where(and(eq(schoolAchievements.id, data.id), eq(schoolAchievements.schoolId, school.id))).returning()
        : await db.insert(schoolAchievements).values({ ...values, schoolId: school.id }).returning();
      return saved ? NextResponse.json({ success: true, data: saved }) : fail('Prestasi tidak ditemukan', 404);
    }
    if (action === 'deleteAchievement') {
      const [removed] = await db.delete(schoolAchievements).where(and(eq(schoolAchievements.id, body.id), eq(schoolAchievements.schoolId, school.id))).returning();
      return NextResponse.json({ success: Boolean(removed) });
    }
    if (action === 'featuredStudent') {
      const [saved] = await db.update(studentSchoolRelations).set({ isFeatured: Boolean(body.featured) }).where(and(eq(studentSchoolRelations.studentId, body.id), eq(studentSchoolRelations.schoolId, school.id), eq(studentSchoolRelations.schoolStatus, 'approved'))).returning();
      return NextResponse.json({ success: Boolean(saved) });
    }
    if (action === 'featuredProject') {
      const [project] = await db.select().from(projects).where(eq(projects.id, body.id)).limit(1);
      if (!project) return fail('Proyek tidak ditemukan', 404);
      const [relation] = await db.select().from(studentSchoolRelations).where(and(eq(studentSchoolRelations.studentId, project.creatorId), eq(studentSchoolRelations.schoolId, school.id), eq(studentSchoolRelations.schoolStatus, 'approved'))).limit(1);
      if (!relation) return fail('Proyek bukan milik siswa sekolah ini', 403);
      await db.update(projects).set({ isFeaturedSchool: Boolean(body.featured) }).where(eq(projects.id, body.id));
      return NextResponse.json({ success: true });
    }
    return fail('Aksi tidak dikenal', 400);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Gagal menyimpan data sekolah', 500);
  }
}
