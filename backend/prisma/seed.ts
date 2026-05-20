import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123456', 10)
  const studentPassword = await bcrypt.hash('student123456', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gu.edu.eg' },
    update: {},
    create: {
      name: 'Dr. Khaled Salem',
      email: 'admin@gu.edu.eg',
      passwordHash: adminPassword,
      major: null,
      role: 'admin',
      status: 'Active',
    },
  })

  const ahmed = await prisma.user.upsert({
    where: { email: 'ahmed@gu.edu.eg' },
    update: {},
    create: {
      name: 'Ahmed Mohammed',
      email: 'ahmed@gu.edu.eg',
      passwordHash: studentPassword,
      major: 'Computer Science',
      role: 'student',
      status: 'Active',
    },
  })

  const sara = await prisma.user.upsert({
    where: { email: 'sara@gu.edu.eg' },
    update: {},
    create: {
      name: 'Sarah Ali',
      email: 'sara@gu.edu.eg',
      passwordHash: studentPassword,
      major: 'Computer Science',
      role: 'student',
      status: 'Active',
    },
  })

  // Extra mock students for admin dashboard
  await prisma.user.upsert({
    where: { email: 'omar_f@gu.edu.eg' },
    update: {},
    create: { name: 'Omar Farouk', email: 'omar_f@gu.edu.eg', passwordHash: studentPassword, major: 'Software Engineering', role: 'student', status: 'Active' },
  })
  await prisma.user.upsert({
    where: { email: 'laila_h@gu.edu.eg' },
    update: {},
    create: { name: 'Laila Hassan', email: 'laila_h@gu.edu.eg', passwordHash: studentPassword, major: 'Medicine', role: 'student', status: 'Active' },
  })
  await prisma.user.upsert({
    where: { email: 'youssef_s@gu.edu.eg' },
    update: {},
    create: { name: 'Youssef Soliman', email: 'youssef_s@gu.edu.eg', passwordHash: studentPassword, major: 'Dentistry', role: 'student', status: 'Pending' },
  })
  await prisma.user.upsert({
    where: { email: 'nour_d@gu.edu.eg' },
    update: {},
    create: { name: 'Nour El-Din', email: 'nour_d@gu.edu.eg', passwordHash: studentPassword, major: 'Artificial Intelligence', role: 'student', status: 'Restricted' },
  })
  await prisma.user.upsert({
    where: { email: 'hana_s@gu.edu.eg' },
    update: {},
    create: { name: 'Hana Selim', email: 'hana_s@gu.edu.eg', passwordHash: studentPassword, major: 'Engineering', role: 'student', status: 'Active' },
  })

  // ── Communities ────────────────────────────────────────────────────────────
  const cs = await prisma.community.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Computer Science & AI',
      tag: 'Public',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
      avatarUrl: 'https://i.pravatar.cc/100?img=12',
      description: 'GU coding projects, algorithms, and tech discussion group.',
      creator: 'Dr. Ahmed Khaled',
      membersCount: 1240,
      discussionsCount: 342,
      interactionsCount: 8900,
    },
  })

  const med = await prisma.community.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: 'Medicine & Surgery',
      tag: 'Public',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop',
      avatarUrl: 'https://i.pravatar.cc/100?img=5',
      description: 'Anatomy, physiology reviews, and medical study resources.',
      creator: 'Dr. Sara Ali',
      membersCount: 852,
      discussionsCount: 215,
      interactionsCount: 5430,
    },
  })

  const eng = await prisma.community.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      title: 'Engineering Hub',
      tag: 'Public',
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop',
      avatarUrl: 'https://i.pravatar.cc/100?img=17',
      description: 'Calculus resources, circuit design labs, and mechanical guides.',
      creator: 'Dr. Mahmoud Hassan',
      membersCount: 945,
      discussionsCount: 420,
      interactionsCount: 12400,
    },
  })

  const dent = await prisma.community.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      title: 'Dentistry Science',
      tag: 'Public',
      imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=600&auto=format&fit=crop',
      avatarUrl: 'https://i.pravatar.cc/100?img=24',
      description: 'Oral biology, dentistry tool guides, and clinical advice.',
      creator: 'Dr. Mona Youssef',
      membersCount: 620,
      discussionsCount: 156,
      interactionsCount: 3200,
    },
  })

  // ── Memberships ────────────────────────────────────────────────────────────
  for (const communityId of [cs.id, eng.id]) {
    await prisma.communityMember.upsert({
      where: { userId_communityId: { userId: ahmed.id, communityId } },
      update: {},
      create: { userId: ahmed.id, communityId },
    })
  }

  // ── Threads ────────────────────────────────────────────────────────────────
  const t1 = await prisma.thread.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Best resources for mastering Data Structures & Algorithms',
      content: 'I am preparing for upcoming internships and looking for recommendations on platforms, books, or courses. What worked best for you in CS?',
      authorId: ahmed.id,
      communityId: cs.id,
      category: 'Computer Science & AI',
      likes: 24,
      views: 1200,
    },
  })

  const t2 = await prisma.thread.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: 'Selling old engineering textbook - GU Edition',
      content: 'Perfect condition, barely used. Mechanics of Materials 8th Edition. Selling for 300 EGP. PM if interested.',
      authorId: ahmed.id,
      communityId: eng.id,
      category: 'Engineering Hub',
      likes: 5,
      views: 450,
    },
  })

  const t3 = await prisma.thread.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      title: 'Important warning: Midterm exam schedule changes',
      content: 'Please check your portal! The Engineering midterm exam has been shifted by two hours.',
      authorId: admin.id,
      communityId: eng.id,
      category: 'Engineering Hub',
      likes: 42,
      views: 2800,
      isLocked: true,
    },
  })

  const t4 = await prisma.thread.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      title: 'Effective memory tips for studying massive Anatomy diagrams',
      content: 'What techniques helped you retain complex anatomical structures for exams?',
      authorId: ahmed.id,
      communityId: med.id,
      category: 'Medicine & Surgery',
      likes: 34,
      views: 980,
    },
  })

  const t5 = await prisma.thread.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      title: 'Team recruitment for the upcoming Hackathon event',
      content: 'Looking for 2 teammates with React and Node experience for the GU Hackathon next month. DM me if interested!',
      authorId: ahmed.id,
      communityId: cs.id,
      category: 'Computer Science & AI',
      likes: 56,
      views: 1100,
    },
  })

  const t6 = await prisma.thread.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      title: 'Recommended dental tool kits for second-year clinical trials',
      content: 'Which kits did seniors recommend for clinical practice this semester?',
      authorId: ahmed.id,
      communityId: dent.id,
      category: 'Dentistry Science',
      likes: 18,
      views: 440,
    },
  })

  // ── Comments ───────────────────────────────────────────────────────────────
  await prisma.comment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      threadId: t1.id,
      authorId: admin.id,
      content: 'I highly suggest focusing on understanding complexity before jumping to solutions.',
      likes: 8,
    },
  })
  await prisma.comment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      threadId: t1.id,
      authorId: sara.id,
      content: 'LeetCode and GeeksforGeeks are great starting points!',
      likes: 3,
    },
  })
  await prisma.comment.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      threadId: t3.id,
      authorId: ahmed.id,
      content: 'Thank you for the notification, Dr. Khaled!',
      likes: 12,
    },
  })
  await prisma.comment.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      threadId: t4.id,
      authorId: admin.id,
      content: 'Try spaced repetition with labeled diagrams.',
      likes: 12,
    },
  })

  // ── Flagged Posts ──────────────────────────────────────────────────────────
  const flaggedData = [
    { threadId: t5.id, author: 'anonymous_gu', reason: 'Academic Dishonesty', severity: 'High' },
    { threadId: t2.id, author: 'karim_saleh', reason: 'Spam / Off-topic Commercial', severity: 'Low' },
    { threadId: t1.id, author: 'std_9022', reason: 'Harassment', severity: 'Medium' },
    { threadId: t6.id, author: 'spammer_hub', reason: 'External Ads Spam', severity: 'Medium' },
  ]

  for (const f of flaggedData) {
    await prisma.flaggedPost.create({ data: f }).catch(() => {})
  }

  console.log('Seeding complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
