import { prisma } from '../config/prisma';
import { createNotification } from './notification.service';

export const getContractById = async (contractId: string, userId: string) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      project: {
        include: {
          client: { include: { user: { select: { id: true, email: true } } } },
          skills: { include: { skill: true } },
        },
      },
      freelancer: { include: { user: { select: { id: true, email: true } } } },
      milestones: { orderBy: { dueDate: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      review: true,
    },
  });

  if (!contract) throw new Error('Contract not found');

  const isAuthorized =
    contract.project.client.userId === userId || contract.freelancer.userId === userId;
  if (!isAuthorized) throw new Error('Unauthorized');

  return contract;
};

export const getClientContracts = async (clientId: string) => {
  return prisma.contract.findMany({
    where: { project: { clientId } },
    include: {
      project: { select: { id: true, title: true, category: true } },
      freelancer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, avgRating: true } },
      milestones: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getFreelancerContracts = async (freelancerId: string) => {
  return prisma.contract.findMany({
    where: { freelancerId },
    include: {
      project: {
        select: { id: true, title: true, category: true },
        include: { client: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      },
      milestones: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createMilestone = async (contractId: string, clientId: string, data: {
  title: string; description?: string; amount: number; dueDate: string;
}) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { project: { include: { client: true } } },
  });
  if (!contract || contract.project.client.id !== clientId) throw new Error('Unauthorized');

  return prisma.milestone.create({
    data: { contractId, title: data.title, description: data.description, amount: data.amount, dueDate: new Date(data.dueDate) },
  });
};

export const updateMilestoneStatus = async (milestoneId: string, status: string, userId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      contract: {
        include: {
          project: { include: { client: { include: { user: true } } } },
          freelancer: { include: { user: true } },
        },
      },
    },
  });
  if (!milestone) throw new Error('Milestone not found');

  const isClient = milestone.contract.project.client.userId === userId;
  const isFreelancer = milestone.contract.freelancer.userId === userId;

  if (!isClient && !isFreelancer) throw new Error('Unauthorized');

  // Freelancer can submit; client can approve/reject
  if (status === 'SUBMITTED' && !isFreelancer) throw new Error('Only freelancer can submit milestone');
  if ((status === 'APPROVED' || status === 'REJECTED') && !isClient) throw new Error('Only client can approve/reject milestone');

  return prisma.milestone.update({ where: { id: milestoneId }, data: { status: status as never } });
};

export const completeContract = async (contractId: string, clientId: string) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      project: { include: { client: { include: { user: true } } } },
      freelancer: { include: { user: true } },
    },
  });
  if (!contract) throw new Error('Contract not found');
  if (contract.project.client.id !== clientId) throw new Error('Unauthorized');

  const result = await prisma.$transaction(async (tx) => {
    const updatedContract = await tx.contract.update({
      where: { id: contractId },
      data: { status: 'COMPLETED' },
    });
    await tx.project.update({
      where: { id: contract.projectId },
      data: { status: 'COMPLETED' },
    });
    await tx.freelancer.update({
      where: { id: contract.freelancerId },
      data: {
        completedJobs: { increment: 1 },
        totalEarned: { increment: contract.agreedAmount },
      },
    });
    await tx.client.update({
      where: { id: clientId },
      data: { totalSpent: { increment: contract.agreedAmount } },
    });
    return updatedContract;
  });

  await createNotification({
    receiverId: contract.freelancer.userId,
    type: 'CONTRACT_COMPLETED',
    title: 'Contract marked as complete',
    message: `The contract for "${contract.project.title}" has been marked as complete.`,
    entityId: contractId,
    entityType: 'contract',
  });

  return result;
};
