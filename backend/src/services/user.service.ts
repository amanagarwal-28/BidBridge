import { prisma } from '../config/prisma';

export const getFreelancerProfile = async (freelancerId: string) => {
  return prisma.freelancer.findUnique({
    where: { id: freelancerId },
    include: {
      user: { select: { email: true, createdAt: true } },
      skills: { include: { skill: true } },
      portfolio: true,
      reviews: {
        where: { clientRating: { gt: 0 } },
        include: { client: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
};

export const updateFreelancerProfile = async (freelancerId: string, data: {
  firstName?: string; lastName?: string; bio?: string; phone?: string; country?: string;
  avatarUrl?: string; hourlyRate?: number; availableForWork?: boolean;
}) => {
  return prisma.freelancer.update({ where: { id: freelancerId }, data });
};

export const updateFreelancerSkills = async (freelancerId: string, skills: { skillId: string; proficiency: number }[]) => {
  await prisma.freelancerSkill.deleteMany({ where: { freelancerId } });
  return prisma.freelancerSkill.createMany({
    data: skills.map((s) => ({ freelancerId, ...s })),
  });
};

export const addPortfolioItem = async (freelancerId: string, data: {
  title: string; description?: string; projectUrl?: string; imageUrl?: string; category?: string;
}) => {
  return prisma.portfolio.create({ data: { freelancerId, ...data } });
};

export const deletePortfolioItem = async (id: string, freelancerId: string) => {
  return prisma.portfolio.delete({ where: { id, freelancerId } });
};

export const getClientProfile = async (clientId: string) => {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: {
      user: { select: { email: true, createdAt: true } },
      projects: {
        select: { id: true, title: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
};

export const updateClientProfile = async (clientId: string, data: {
  firstName?: string; lastName?: string; company?: string; bio?: string;
  phone?: string; country?: string; avatarUrl?: string;
}) => {
  return prisma.client.update({ where: { id: clientId }, data });
};

export const getAllSkills = async () => {
  return prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
};
