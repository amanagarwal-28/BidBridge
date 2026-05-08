import { prisma } from '../config/prisma';
import { CreateBidInput } from '../validations/bid.validation';
import { createNotification } from './notification.service';
import { getPagination, buildMeta } from '../utils/pagination';

export const placeBid = async (projectId: string, freelancerId: string, input: CreateBidInput) => {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { client: { include: { user: true } } } });
  if (!project) throw new Error('Project not found');
  if (project.status !== 'OPEN') throw new Error('Project is not accepting bids');

  // Fraud detection: limit bids per freelancer per day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayBidCount = await prisma.bid.count({
    where: { freelancerId, createdAt: { gte: today } },
  });
  if (todayBidCount >= 20) {
    await prisma.fraudReport.create({
      data: {
        reportedId: (await prisma.freelancer.findUnique({ where: { id: freelancerId } }))!.userId,
        reportType: 'SPAM_BIDDING',
        description: `Freelancer attempted to place more than 20 bids in one day.`,
      },
    });
    throw new Error('Daily bid limit exceeded. Suspicious activity flagged.');
  }

  const bid = await prisma.bid.create({
    data: { projectId, freelancerId, ...input },
    include: { freelancer: { select: { firstName: true, lastName: true } } },
  });

  await prisma.project.update({ where: { id: projectId }, data: { totalBids: { increment: 1 } } });

  // Notify client
  await createNotification({
    receiverId: project.client.userId,
    type: 'BID_RECEIVED',
    title: 'New bid received',
    message: `${bid.freelancer.firstName} ${bid.freelancer.lastName} placed a bid on your project "${project.title}"`,
    entityId: project.id,
    entityType: 'project',
  });

  return bid;
};

export const getProjectBids = async (projectId: string, clientId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.clientId !== clientId) throw new Error('Unauthorized');

  return prisma.bid.findMany({
    where: { projectId },
    include: {
      freelancer: {
        include: {
          skills: { include: { skill: true } },
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getFreelancerBids = async (freelancerId: string, query: Record<string, string | undefined>) => {
  const { page, limit, skip } = getPagination(query);
  const status = query.status;
  const where: Record<string, unknown> = { freelancerId };
  if (status) where.status = status;

  const [bids, total] = await Promise.all([
    prisma.bid.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          include: { client: { select: { firstName: true, lastName: true } }, skills: { include: { skill: true } } },
        },
      },
    }),
    prisma.bid.count({ where }),
  ]);

  return { bids, meta: buildMeta(total, page, limit) };
};

export const acceptBid = async (bidId: string, clientId: string) => {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { project: { include: { client: { include: { user: true } } } }, freelancer: { include: { user: true } } },
  });
  if (!bid) throw new Error('Bid not found');
  if (bid.project.client.id !== clientId) throw new Error('Unauthorized');
  if (bid.project.status !== 'OPEN') throw new Error('Project is not open for bid acceptance');

  // Use transaction for contract generation (DBMS requirement)
  const result = await prisma.$transaction(async (tx) => {
    // Reject all other bids
    await tx.bid.updateMany({ where: { projectId: bid.projectId, id: { not: bidId } }, data: { status: 'REJECTED' } });

    // Accept this bid
    const updatedBid = await tx.bid.update({ where: { id: bidId }, data: { status: 'ACCEPTED' } });

    // Update project status
    await tx.project.update({
      where: { id: bid.projectId },
      data: { status: 'IN_PROGRESS', acceptedBidId: bidId },
    });

    // Create contract
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + bid.deliveryDays);
    const contract = await tx.contract.create({
      data: {
        projectId: bid.projectId,
        freelancerId: bid.freelancerId,
        agreedAmount: bid.bidAmount,
        endDate,
      },
    });

    return { bid: updatedBid, contract };
  });

  // Notify freelancer (outside transaction)
  await createNotification({
    receiverId: bid.freelancer.userId,
    type: 'BID_ACCEPTED',
    title: 'Your bid was accepted!',
    message: `Your bid on "${bid.project.title}" has been accepted. A contract has been created.`,
    entityId: result.contract.id,
    entityType: 'contract',
  });

  // Notify other freelancers
  const rejectedBids = await prisma.bid.findMany({
    where: { projectId: bid.projectId, status: 'REJECTED', id: { not: bidId } },
    include: { freelancer: { include: { user: true } } },
  });
  for (const rb of rejectedBids) {
    await createNotification({
      receiverId: rb.freelancer.userId,
      type: 'BID_REJECTED',
      title: 'Bid not selected',
      message: `Your bid on "${bid.project.title}" was not selected.`,
      entityId: bid.projectId,
      entityType: 'project',
    });
  }

  return result;
};

export const rejectBid = async (bidId: string, clientId: string) => {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { project: { include: { client: true } }, freelancer: { include: { user: true } } },
  });
  if (!bid || bid.project.client.id !== clientId) throw new Error('Unauthorized');

  const updated = await prisma.bid.update({ where: { id: bidId }, data: { status: 'REJECTED' } });

  await createNotification({
    receiverId: bid.freelancer.userId,
    type: 'BID_REJECTED',
    title: 'Bid rejected',
    message: `Your bid on "${bid.project.title}" has been rejected.`,
    entityId: bid.projectId,
    entityType: 'project',
  });

  return updated;
};

export const withdrawBid = async (bidId: string, freelancerId: string) => {
  const bid = await prisma.bid.findUnique({ where: { id: bidId } });
  if (!bid || bid.freelancerId !== freelancerId) throw new Error('Unauthorized');
  if (bid.status !== 'PENDING') throw new Error('Cannot withdraw a non-pending bid');

  return prisma.bid.update({ where: { id: bidId }, data: { status: 'WITHDRAWN' } });
};
