import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { assessmentItems, creatorProfiles, profiles, projects, schoolAchievements, schoolAssessments, schools, studentSchoolRelations } from '@/lib/db/schema';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

const MOCK_DEV_BUNDLE = {
  overview: {
    totalStudents: 8,
    activeStudents: 6,
    pendingApproval: 2,
    gradedStudents: 4,
    ungradedStudents: 2,
    totalProjects: 12,
    recentActivities: [],
    assessmentProgress: { graded: 4, draft: 1, ungraded: 1 },
  },
  approvals: [
    {
      id: 'mock-appr-1',
      studentId: 'mock-stud-1',
      name: 'Rian Pratama',
      email: 'rian.pratama@creatorin.id',
      major: 'Desain Komunikasi Visual',
      classGrade: 'XII DKV 1',
      graduationYear: '2025',
      nisn: '0051234567',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      requestDate: new Date().toISOString(),
      status: 'pending' as const,
    },
    {
      id: 'mock-appr-2',
      studentId: 'mock-stud-2',
      name: 'Alya Putri',
      email: 'alya.putri@creatorin.id',
      major: 'Rekayasa Perangkat Lunak',
      classGrade: 'XII RPL 2',
      graduationYear: '2025',
      nisn: '0057654321',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      requestDate: new Date().toISOString(),
      status: 'pending' as const,
    },
  ],
  assessments: [
    {
      studentId: 'mock-stud-3',
      name: 'Budi Santoso',
      email: 'budi.santoso@creatorin.id',
      major: 'Multimedia / DKV',
      classGrade: 'XII DKV 2',
      graduationYear: '2025',
      nisn: '0059998877',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      projectCount: 4,
      status: 'completed' as const,
      finalScore: 88,
      updatedAt: new Date().toISOString(),
    },
    {
      studentId: 'mock-stud-4',
      name: 'Citra Kirana',
      email: 'citra.kirana@creatorin.id',
      major: 'Animasi',
      classGrade: 'XII ANM 1',
      graduationYear: '2025',
      nisn: '0051122334',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      projectCount: 3,
      status: 'draft' as const,
      finalScore: 75,
      updatedAt: new Date().toISOString(),
    },
    {
      studentId: 'mock-stud-5',
      name: 'Dimas Prasetyo',
      email: 'dimas.prasetyo@creatorin.id',
      major: 'Desain Komunikasi Visual',
      classGrade: 'XII DKV 1',
      graduationYear: '2025',
      nisn: '0052233445',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      projectCount: 2,
      status: 'not_started' as const,
      finalScore: null,
      updatedAt: new Date().toISOString(),
    },
  ],
  profile: {
    school: {
      id: '55555555-5555-5555-5555-555555555555',
      name: 'SMK Mitra Creatorin',
      slug: 'smk-mitra',
      logoUrl: '',
      coverUrl: '',
      tagline: 'Pusat Keunggulan Vokasi Kreatif Digital (Dev Mode)',
      description: 'Menyiapkan talenta kreatif muda siap industri kolaborasi UMKM digital Indonesia.',
      address: 'Jl. Pendidikan Vokasi No. 12',
      city: 'Jakarta',
      website: 'https://smkmitra.sch.id',
      email: 'info@smkmitra.sch.id',
      phone: '021-5551234',
      picName: 'Drs. Hendro Wibowo, M.Pd.',
      picContact: '081234567890',
      sectionOrder: ['featured_projects', 'students', 'achievements', 'about'],
      isVerified: true,
    },
    stats: { totalStudents: 6, totalProjects: 9, totalCollaborations: 5, totalAchievements: 2 },
    featuredProjects: [],
    studentProjects: [],
    students: [
      {
        id: 'mock-stud-3',
        name: 'Budi Santoso',
        email: 'budi.santoso@creatorin.id',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        role: 'Desain Grafis',
        major: 'Multimedia / DKV',
        classGrade: 'XII DKV 2',
        graduationYear: '2025',
        projectCount: 4,
        careerScore: 82,
        isFeatured: true,
      },
    ],
    achievements: [
      {
        id: 'mock-ach-1',
        title: 'Juara 1 LKS Nasional Desain Grafis',
        description: 'Meraih medali emas tingkat nasional.',
        year: '2024',
        imageUrl: '',
        category: 'Kompetisi',
      },
    ],
    sectionOrder: ['featured_projects', 'students', 'achievements', 'about'],
  },
  projects: [
    {
      id: 'mock-proj-1',
      studentId: 'mock-stud-3',
      title: 'Rebranding Visual Brand UMKM Lokal',
      studentName: 'Budi Santoso',
      studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      category: 'Desain Grafis',
      thumbnail: '',
      createdDate: new Date().toISOString(),
      viewsCount: 154,
      isFeaturedSchool: true,
    },
  ],
  students: [
    {
      id: 'mock-stud-3',
      name: 'Budi Santoso',
      email: 'budi.santoso@creatorin.id',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Desain Grafis',
      major: 'Multimedia / DKV',
      classGrade: 'XII DKV 2',
      graduationYear: '2025',
      projectCount: 4,
      careerScore: 82,
      isFeatured: true,
    },
  ],
  detail: {
    student: {
      id: 'mock-stud-3',
      name: 'Budi Santoso',
      email: 'budi.santoso@creatorin.id',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      major: 'Multimedia / DKV',
      classGrade: 'XII DKV 2',
      graduationYear: '2025',
      nisn: '0059998877',
      projectCount: 4,
      skills: ['Branding', 'Illustrator', 'Packaging'],
      bio: 'Siswa SMK peminatan identitas visual dan packaging UMKM.',
    },
    projects: [
      {
        id: 'mock-proj-1',
        title: 'Rebranding Visual Brand UMKM Lokal',
        category: 'Desain Grafis',
        coverImage: '',
        createdDate: new Date().toISOString(),
        viewsCount: 154,
        isFeaturedSchool: true,
      },
    ],
    assessment: {
      id: 'mock-ass-1',
      status: 'completed' as const,
      finalScore: 88,
      notes: 'Kemampuan teknis dan komunikasi sangat baik.',
      rubricItems: [
        { id: 'm-1', name: 'Kemampuan Teknis', score: 90, weight: 40, notes: 'Sangat menguasai software' },
        { id: 'm-2', name: 'Tanggung Jawab', score: 85, weight: 20, notes: 'Selesai tepat waktu' },
        { id: 'm-3', name: 'Komunikasi', score: 85, weight: 20, notes: 'Komunikatif dengan pembimbing' },
        { id: 'm-4', name: 'Kedisiplinan', score: 90, weight: 20, notes: 'Kehadiran prima' },
      ],
    },
  },
};

async function schoolFor(request: NextRequest, slug?: string) {
  const db = getDb();
  if (!db) return null;
  if (slug) {
    const [school] = await db.select().from(schools).where(eq(schools.slug, slug)).limit(1);
    return school || null;
  }
  let user = await getAuthenticatedUser(request);
  if ((!user || user.role !== 'school') && process.env.NODE_ENV === 'development') {
    user = {
      id: '55555555-5555-5555-5555-555555555555',
      role: 'school',
      fullName: 'SMK Mitra Creatorin',
      email: 'smkmitra@creatorin.id'
    };
  }
  if (!user || user.role !== 'school') return null;
  const [existing] = await db.select().from(schools).where(eq(schools.profileId, user.id)).limit(1);
  if (existing) return existing;
  if (process.env.NODE_ENV === 'development') {
    const [anySchool] = await db.select().from(schools).limit(1);
    if (anySchool) return anySchool;
  }
  const [created] = await db.insert(schools).values({ profileId: user.id, name: user.fullName, slug: `school-${user.id}` }).onConflictDoNothing().returning();
  if (created) return created;
  const [school] = await db.select().from(schools).where(eq(schools.profileId, user.id)).limit(1);
  return school || null;
}

export async function GET(request: NextRequest) {
  const db = getDb();
  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(MOCK_DEV_BUNDLE);
    }
    return fail('Database belum terhubung', 503);
  }
  try {
    const school = await schoolFor(request, request.nextUrl.searchParams.get('slug') || undefined);
    if (!school) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(MOCK_DEV_BUNDLE);
      }
      return fail('Sekolah tidak ditemukan atau akses ditolak', 404);
    }

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
  const isDev = process.env.NODE_ENV === 'development';
  let user = await getAuthenticatedUser(request);
  if ((!user || user.role !== 'school') && isDev) {
    user = {
      id: '55555555-5555-5555-5555-555555555555',
      role: 'school',
      fullName: 'SMK Mitra Creatorin',
      email: 'smkmitra@creatorin.id',
    };
  }
  if (!user || user.role !== 'school') return fail('Akses ditolak', 403);
  const db = getDb();
  if (!db) {
    if (isDev) return NextResponse.json({ success: true, message: 'Operasi simulasi dev berhasil' });
    return fail('Database belum terhubung', 503);
  }
  try {
    const school = await schoolFor(request);
    if (!school) {
      if (isDev) return NextResponse.json({ success: true, message: 'Simulasi aksi sekolah dev berhasil' });
      return fail('Sekolah tidak ditemukan', 404);
    }
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
