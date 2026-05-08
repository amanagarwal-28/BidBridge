import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SKILLS = [
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'Django', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MySQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'AWS', category: 'DevOps' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'Figma', category: 'Design' },
  { name: 'UI/UX Design', category: 'Design' },
  { name: 'Mobile Development', category: 'Mobile' },
  { name: 'React Native', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Content Writing', category: 'Writing' },
  { name: 'SEO', category: 'Marketing' },
  { name: 'Digital Marketing', category: 'Marketing' },
];

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Design',
  'Writing', 'Marketing', 'DevOps', 'Data Science',
];

async function main() {
  console.log('Cleaning existing data...');
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.review.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.projectSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.freelancerSkill.deleteMany();
  await prisma.fraudReport.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.client.deleteMany();
  await prisma.freelancer.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding skills...');
  await prisma.skill.createMany({ data: SKILLS });
  const allSkills = await prisma.skill.findMany();

  const password = await bcrypt.hash('Password123!', 12);

  console.log('Seeding admin...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@bidbridge.com',
      password,
      role: Role.ADMIN,
      admin: { create: { name: 'Platform Admin' } },
    },
  });

  console.log('Seeding clients...');
  const clientsData = [
    { email: 'client1@bidbridge.com', firstName: 'Sarah', lastName: 'Johnson', company: 'TechCorp Inc', country: 'USA' },
    { email: 'client2@bidbridge.com', firstName: 'Michael', lastName: 'Chen', company: 'StartupXYZ', country: 'Singapore' },
    { email: 'client3@bidbridge.com', firstName: 'Emma', lastName: 'Williams', company: 'Design Studio Ltd', country: 'UK' },
    { email: 'client4@bidbridge.com', firstName: 'Raj', lastName: 'Patel', company: 'GlobalSoft', country: 'India' },
  ];

  const clients = [];
  for (const c of clientsData) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        password,
        role: Role.CLIENT,
        client: { create: { firstName: c.firstName, lastName: c.lastName, company: c.company, country: c.country } },
      },
      include: { client: true },
    });
    clients.push(user.client!);
  }

  console.log('Seeding freelancers...');
  const freelancersData = [
    { email: 'alex@bidbridge.com', firstName: 'Alex', lastName: 'Garcia', country: 'Spain', hourlyRate: 45, bio: 'Full-stack developer with 7+ years specialising in React and Node.js' },
    { email: 'priya@bidbridge.com', firstName: 'Priya', lastName: 'Sharma', country: 'India', hourlyRate: 35, bio: 'Mobile app developer; React Native and Flutter specialist' },
    { email: 'james@bidbridge.com', firstName: 'James', lastName: 'Wilson', country: 'Canada', hourlyRate: 55, bio: 'Senior backend engineer with deep AWS and Kubernetes expertise' },
    { email: 'lina@bidbridge.com', firstName: 'Lina', lastName: 'Müller', country: 'Germany', hourlyRate: 40, bio: 'Product designer crafting clean UI/UX experiences' },
    { email: 'kenji@bidbridge.com', firstName: 'Kenji', lastName: 'Tanaka', country: 'Japan', hourlyRate: 50, bio: 'Python data engineer and machine learning practitioner' },
    { email: 'mariam@bidbridge.com', firstName: 'Mariam', lastName: 'Hassan', country: 'UAE', hourlyRate: 30, bio: 'Frontend developer turning Figma mockups into production code' },
  ];

  const freelancers = [];
  for (const f of freelancersData) {
    const user = await prisma.user.create({
      data: {
        email: f.email,
        password,
        role: Role.FREELANCER,
        freelancer: {
          create: {
            firstName: f.firstName, lastName: f.lastName, country: f.country,
            hourlyRate: f.hourlyRate, bio: f.bio,
          },
        },
      },
      include: { freelancer: true },
    });
    freelancers.push(user.freelancer!);
  }

  console.log('Adding skills to freelancers...');
  const freelancerSkillMap = [
    [allSkills[0], allSkills[1], allSkills[3], allSkills[4], allSkills[5]],   // Alex
    [allSkills[17], allSkills[18], allSkills[19]],                              // Priya
    [allSkills[5], allSkills[12], allSkills[13], allSkills[14]],                // James
    [allSkills[15], allSkills[16]],                                              // Lina
    [allSkills[7], allSkills[8], allSkills[11]],                                 // Kenji
    [allSkills[0], allSkills[3], allSkills[4], allSkills[15]],                   // Mariam
  ];

  for (let i = 0; i < freelancers.length; i++) {
    for (const skill of freelancerSkillMap[i]) {
      await prisma.freelancerSkill.create({
        data: { freelancerId: freelancers[i].id, skillId: skill.id, proficiency: 4 + Math.floor(Math.random() * 2) },
      });
    }
  }

  console.log('Adding portfolio items...');
  for (const f of freelancers.slice(0, 3)) {
    await prisma.portfolio.createMany({
      data: [
        { freelancerId: f.id, title: 'E-commerce Platform', description: 'Built a scalable shopping platform serving 100k users.', category: 'Web Development', projectUrl: 'https://example.com/portfolio/1' },
        { freelancerId: f.id, title: 'SaaS Dashboard', description: 'Designed and shipped an analytics dashboard for SaaS clients.', category: 'Web Development', projectUrl: 'https://example.com/portfolio/2' },
      ],
    });
  }

  console.log('Seeding projects...');
  const projectsData = [
    { title: 'Build a modern e-commerce website', description: 'We need a full-stack e-commerce site with admin panel, payment integration, and order tracking. Must be responsive and SEO friendly.', category: 'Web Development', budgetMin: 2000, budgetMax: 5000, deadlineDays: 45, skillIds: [allSkills[0].id, allSkills[1].id, allSkills[5].id], clientIdx: 0 },
    { title: 'iOS and Android dating app', description: 'Looking for a mobile developer to build a swipe-based dating app with chat, profile management, and push notifications.', category: 'Mobile Development', budgetMin: 5000, budgetMax: 10000, deadlineDays: 60, skillIds: [allSkills[17].id, allSkills[18].id], clientIdx: 1 },
    { title: 'Brand redesign and logo refresh', description: 'Need a designer to refresh our brand identity, including logo, color palette, and brand guidelines.', category: 'Design', budgetMin: 800, budgetMax: 2000, deadlineDays: 21, skillIds: [allSkills[15].id, allSkills[16].id], clientIdx: 2 },
    { title: 'Backend API with microservices', description: 'Need a senior backend engineer to design and implement a microservices-based REST API on AWS.', category: 'Web Development', budgetMin: 4000, budgetMax: 8000, deadlineDays: 50, skillIds: [allSkills[5].id, allSkills[6].id, allSkills[12].id, allSkills[13].id], clientIdx: 3 },
    { title: 'Data pipeline for analytics', description: 'Build an ETL pipeline using Python to ingest data from multiple sources and load into a data warehouse.', category: 'Data Science', budgetMin: 3000, budgetMax: 6000, deadlineDays: 40, skillIds: [allSkills[7].id, allSkills[11].id], clientIdx: 0 },
    { title: 'SEO and content marketing', description: 'Looking for an experienced SEO professional to optimize our site and drive organic traffic.', category: 'Marketing', budgetMin: 500, budgetMax: 1500, deadlineDays: 30, skillIds: [allSkills[21].id, allSkills[22].id], clientIdx: 1 },
  ];

  const projects = [];
  for (const p of projectsData) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + p.deadlineDays);
    const project = await prisma.project.create({
      data: {
        clientId: clients[p.clientIdx].id,
        title: p.title,
        description: p.description,
        category: p.category,
        budgetMin: p.budgetMin,
        budgetMax: p.budgetMax,
        deadline,
        skills: { create: p.skillIds.map((skillId) => ({ skillId })) },
      },
    });
    projects.push(project);
  }

  console.log('Adding sample bids...');
  const sampleBids = [
    { projectIdx: 0, freelancerIdx: 0, bidAmount: 3500, deliveryDays: 40, proposal: 'I have built 12+ e-commerce sites using Next.js and Stripe. Can deliver pixel-perfect designs with admin panel and analytics.' },
    { projectIdx: 0, freelancerIdx: 5, bidAmount: 2800, deliveryDays: 45, proposal: 'I specialize in Next.js + Tailwind. Recent project shipped to 50k MAUs. Available immediately.' },
    { projectIdx: 1, freelancerIdx: 1, bidAmount: 7500, deliveryDays: 55, proposal: 'I have built two production dating apps. Native push, chat with WebSockets, scalable backend.' },
    { projectIdx: 2, freelancerIdx: 3, bidAmount: 1500, deliveryDays: 18, proposal: 'I will deliver a complete brand kit: logo, color guide, typography, brand book.' },
    { projectIdx: 3, freelancerIdx: 2, bidAmount: 6500, deliveryDays: 45, proposal: 'I can architect a robust microservices stack on AWS with full CI/CD and Kubernetes.' },
    { projectIdx: 4, freelancerIdx: 4, bidAmount: 4200, deliveryDays: 35, proposal: 'I will use Airflow + dbt for the pipeline, fully tested and documented.' },
  ];

  for (const b of sampleBids) {
    await prisma.bid.create({
      data: {
        projectId: projects[b.projectIdx].id,
        freelancerId: freelancers[b.freelancerIdx].id,
        bidAmount: b.bidAmount,
        deliveryDays: b.deliveryDays,
        proposal: b.proposal,
      },
    });
    await prisma.project.update({ where: { id: projects[b.projectIdx].id }, data: { totalBids: { increment: 1 } } });
  }

  console.log('Creating one accepted contract for demo...');
  const acceptedBid = await prisma.bid.findFirst({
    where: { projectId: projects[2].id, freelancerId: freelancers[3].id },
  });
  if (acceptedBid) {
    await prisma.bid.update({ where: { id: acceptedBid.id }, data: { status: 'ACCEPTED' } });
    await prisma.project.update({
      where: { id: projects[2].id },
      data: { status: 'IN_PROGRESS', acceptedBidId: acceptedBid.id },
    });
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + acceptedBid.deliveryDays);
    const contract = await prisma.contract.create({
      data: {
        projectId: projects[2].id,
        freelancerId: freelancers[3].id,
        agreedAmount: acceptedBid.bidAmount,
        endDate,
      },
    });
    await prisma.milestone.createMany({
      data: [
        { contractId: contract.id, title: 'Logo concepts', amount: 500, dueDate: new Date(Date.now() + 7 * 86400000), status: 'APPROVED' },
        { contractId: contract.id, title: 'Brand guidelines doc', amount: 600, dueDate: new Date(Date.now() + 14 * 86400000), status: 'IN_PROGRESS' },
        { contractId: contract.id, title: 'Final brand book delivery', amount: 400, dueDate: new Date(Date.now() + 18 * 86400000), status: 'PENDING' },
      ],
    });
    await prisma.payment.create({
      data: { contractId: contract.id, amount: 500, status: 'COMPLETED', paidAt: new Date(), txRef: 'TXN-DEMO0001' },
    });
  }

  console.log(`✓ Seed complete.`);
  console.log(`  Admin    : admin@bidbridge.com / Password123!`);
  console.log(`  Client   : client1@bidbridge.com / Password123!`);
  console.log(`  Freelancer: alex@bidbridge.com / Password123!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
