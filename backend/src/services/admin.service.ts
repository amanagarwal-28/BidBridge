import { prisma } from '../config/prisma';
import { getPagination, buildMeta } from '../utils/pagination';

export const getPlatformStats = async () => {
  const [
    totalUsers, totalClients, totalFreelancers,
    totalProjects, openProjects, inProgressProjects, completedProjects,
    totalContracts, totalRevenue, pendingFraudReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.client.count(),
    prisma.freelancer.count(),
    prisma.project.count(),
    prisma.project.count({ where: { status: 'OPEN' } }),
    prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.project.count({ where: { status: 'COMPLETED' } }),
    prisma.contract.count(),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    prisma.fraudReport.count({ where: { isResolved: false } }),
  ]);

  return {
    totalUsers, totalClients, totalFreelancers,
    totalProjects, openProjects, inProgressProjects, completedProjects,
    totalContracts,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    pendingFraudReports,
  };
};

export const getUsers = async (query: Record<string, string | undefined>) => {
  const { page, limit, skip } = getPagination(query);
  const { role, search, isBlocked } = query;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (isBlocked !== undefined) where.isBlocked = isBlocked === 'true';
  if (search) where.email = { contains: search };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, role: true, isActive: true, isBlocked: true, createdAt: true,
        client: { select: { firstName: true, lastName: true } },
        freelancer: { select: { firstName: true, lastName: true, avgRating: true, completedJobs: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, meta: buildMeta(total, page, limit) };
};

export const blockUser = async (userId: string) => {
  return prisma.user.update({ where: { id: userId }, data: { isBlocked: true } });
};

export const unblockUser = async (userId: string) => {
  return prisma.user.update({ where: { id: userId }, data: { isBlocked: false } });
};

export const deleteUser = async (userId: string) => {
  return prisma.user.delete({ where: { id: userId } });
};

export const getAllProjects = async (query: Record<string, string | undefined>) => {
  const { page, limit, skip } = getPagination(query);
  const { status } = query;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { firstName: true, lastName: true } },
        _count: { select: { bids: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return { projects, meta: buildMeta(total, page, limit) };
};

export const getFraudReports = async (query: Record<string, string | undefined>) => {
  const { page, limit, skip } = getPagination(query);
  const isResolved = query.isResolved === 'true';

  const [reports, total] = await Promise.all([
    prisma.fraudReport.findMany({
      where: { isResolved },
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { reported: { select: { email: true, role: true } } },
    }),
    prisma.fraudReport.count({ where: { isResolved } }),
  ]);

  return { reports, meta: buildMeta(total, page, limit) };
};

export const resolveFraudReport = async (reportId: string) => {
  return prisma.fraudReport.update({
    where: { id: reportId },
    data: { isResolved: true, resolvedAt: new Date() },
  });
};

export const getAnalytics = async () => {
  // Category distribution
  const categoryStats = await prisma.project.groupBy({
    by: ['category'],
    _count: { id: true },
  });

  // Monthly project creation (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentProjects = await prisma.project.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, status: true },
  });

  // Payment trends
  const recentPayments = await prisma.payment.findMany({
    where: { status: 'COMPLETED', paidAt: { gte: sixMonthsAgo } },
    select: { amount: true, paidAt: true },
  });

  // Top freelancers
  const topFreelancers = await prisma.freelancer.findMany({
    where: { user: { isBlocked: false } },
    orderBy: [{ avgRating: 'desc' }, { completedJobs: 'desc' }],
    take: 10,
    select: {
      id: true, firstName: true, lastName: true, avatarUrl: true,
      avgRating: true, completedJobs: true, totalEarned: true,
    },
  });

  return { categoryStats, recentProjects, recentPayments, topFreelancers };
};
