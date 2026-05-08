import { prisma } from '../config/prisma';
import { CreateProjectInput, UpdateProjectInput } from '../validations/project.validation';
import { getPagination, buildMeta } from '../utils/pagination';
import { createNotification } from './notification.service';

export const createProject = async (clientId: string, input: CreateProjectInput) => {
  const { skillIds, ...projectData } = input;

  const project = await prisma.project.create({
    data: {
      ...projectData,
      deadline: new Date(input.deadline),
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      clientId,
      skills: skillIds?.length
        ? { create: skillIds.map((skillId) => ({ skillId })) }
        : undefined,
    },
    include: { skills: { include: { skill: true } } },
  });

  return project;
};

export const getProjects = async (query: Record<string, string | undefined>) => {
  const { page, limit, skip } = getPagination(query);
  const { category, status, search, minBudget, maxBudget, skillId } = query;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (search) where.title = { contains: search };
  if (minBudget || maxBudget) {
    where.budgetMin = {};
    if (minBudget) (where.budgetMin as Record<string, unknown>).gte = parseFloat(minBudget);
    if (maxBudget) (where.budgetMax as Record<string, unknown>).lte = parseFloat(maxBudget);
  }
  if (skillId) {
    where.skills = { some: { skillId } };
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        skills: { include: { skill: true } },
        client: { select: { firstName: true, lastName: true, avatarUrl: true, country: true } },
        _count: { select: { bids: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return { projects, meta: buildMeta(total, page, limit) };
};

export const getProjectById = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
      client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, country: true, totalSpent: true } },
      bids: {
        include: {
          freelancer: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true, avgRating: true, completedJobs: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return project;
};

export const updateProject = async (id: string, clientId: string, input: UpdateProjectInput) => {
  const { skillIds, ...updateData } = input;

  const data: Record<string, unknown> = { ...updateData };
  if (input.deadline) data.deadline = new Date(input.deadline);
  if (input.budgetMin !== undefined) data.budgetMin = input.budgetMin;
  if (input.budgetMax !== undefined) data.budgetMax = input.budgetMax;

  if (skillIds !== undefined) {
    await prisma.projectSkill.deleteMany({ where: { projectId: id } });
    if (skillIds.length > 0) {
      data.skills = { create: skillIds.map((skillId: string) => ({ skillId })) };
    }
  }

  return prisma.project.update({ where: { id, clientId }, data, include: { skills: { include: { skill: true } } } });
};

export const deleteProject = async (id: string, clientId: string) => {
  return prisma.project.delete({ where: { id, clientId } });
};

export const getClientProjects = async (clientId: string, query: Record<string, string | undefined>) => {
  const { page, limit, skip } = getPagination(query);
  const status = query.status;

  const where: Record<string, unknown> = { clientId };
  if (status) where.status = status;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { bids: true } },
        contract: { select: { status: true, freelancer: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return { projects, meta: buildMeta(total, page, limit) };
};

export const getRecommendedFreelancers = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { skills: { select: { skillId: true } } },
  });
  if (!project) return [];

  const skillIds = project.skills.map((s) => s.skillId);
  if (!skillIds.length) return [];

  const freelancers = await prisma.freelancer.findMany({
    where: {
      availableForWork: true,
      user: { isBlocked: false, isActive: true },
      skills: { some: { skillId: { in: skillIds } } },
    },
    orderBy: [{ avgRating: 'desc' }, { completedJobs: 'desc' }],
    take: 5,
    include: {
      skills: { include: { skill: true } },
      user: { select: { email: true } },
    },
  });

  return freelancers.map((f) => ({
    ...f,
    matchScore: f.skills.filter((s) => skillIds.includes(s.skillId)).length,
  }));
};

export const closeProject = async (projectId: string, clientId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.clientId !== clientId) throw new Error('Project not found');

  return prisma.project.update({
    where: { id: projectId },
    data: { status: 'CLOSED' },
  });
};
