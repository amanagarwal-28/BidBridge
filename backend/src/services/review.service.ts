import { prisma } from '../config/prisma';
import { createNotification } from './notification.service';

export const createReview = async (contractId: string, userId: string, data: {
  clientRating?: number; clientText?: string; freelancerRating?: number; freelancerText?: string;
}) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      project: { include: { client: { include: { user: true } } } },
      freelancer: { include: { user: true } },
    },
  });
  if (!contract) throw new Error('Contract not found');
  if (contract.status !== 'COMPLETED') throw new Error('Contract must be completed to leave a review');

  const isClient = contract.project.client.userId === userId;
  const isFreelancer = contract.freelancer.userId === userId;
  if (!isClient && !isFreelancer) throw new Error('Unauthorized');

  const existing = await prisma.review.findUnique({ where: { contractId } });

  let review;
  if (!existing) {
    review = await prisma.review.create({
      data: {
        contractId,
        clientId: contract.project.clientId,
        freelancerId: contract.freelancerId,
        clientRating: isClient ? (data.clientRating ?? 5) : 0,
        clientText: isClient ? data.clientText : null,
        freelancerRating: isFreelancer ? data.freelancerRating : null,
        freelancerText: isFreelancer ? data.freelancerText : null,
      },
    });
  } else {
    const updateData: Record<string, unknown> = {};
    if (isClient) { updateData.clientRating = data.clientRating; updateData.clientText = data.clientText; }
    if (isFreelancer) { updateData.freelancerRating = data.freelancerRating; updateData.freelancerText = data.freelancerText; }
    review = await prisma.review.update({ where: { contractId }, data: updateData });
  }

  // Update freelancer avg rating
  if (isClient && data.clientRating) {
    const allReviews = await prisma.review.findMany({
      where: { freelancerId: contract.freelancerId, clientRating: { gt: 0 } },
    });
    const avg = allReviews.reduce((acc, r) => acc + r.clientRating, 0) / allReviews.length;
    await prisma.freelancer.update({
      where: { id: contract.freelancerId },
      data: { avgRating: avg, totalReviews: allReviews.length },
    });

    await createNotification({
      receiverId: contract.freelancer.userId,
      type: 'REVIEW_RECEIVED',
      title: 'You received a review',
      message: `Your client rated you ${data.clientRating}/5 stars.`,
      entityId: contractId,
      entityType: 'contract',
    });
  }

  return review;
};

export const getFreelancerReviews = async (freelancerId: string) => {
  return prisma.review.findMany({
    where: { freelancerId, clientRating: { gt: 0 } },
    include: {
      client: { select: { firstName: true, lastName: true, avatarUrl: true } },
      contract: { include: { project: { select: { title: true, category: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
