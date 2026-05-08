import { prisma } from '../config/prisma';
import { createNotification } from './notification.service';
import { v4 as uuidv4 } from 'uuid';

export const initiatePayment = async (contractId: string, clientId: string, milestoneId?: string) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      project: { include: { client: { include: { user: true } } } },
      freelancer: { include: { user: true } },
    },
  });
  if (!contract || contract.project.client.id !== clientId) throw new Error('Unauthorized');

  const amount = milestoneId
    ? (await prisma.milestone.findUnique({ where: { id: milestoneId } }))?.amount ?? contract.agreedAmount
    : contract.agreedAmount;

  const payment = await prisma.payment.create({
    data: {
      contractId,
      milestoneId: milestoneId || null,
      amount,
      status: 'PENDING',
      txRef: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
    },
  });

  return payment;
};

export const completePayment = async (paymentId: string, clientId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      contract: {
        include: {
          project: { include: { client: { include: { user: true } } } },
          freelancer: { include: { user: true } },
        },
      },
    },
  });

  if (!payment || payment.contract.project.client.id !== clientId) throw new Error('Unauthorized');
  if (payment.status !== 'PENDING') throw new Error('Payment already processed');

  const updated = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });

    if (payment.milestoneId) {
      await tx.milestone.update({ where: { id: payment.milestoneId }, data: { status: 'APPROVED' } });
    }

    return updatedPayment;
  });

  await createNotification({
    receiverId: payment.contract.freelancer.userId,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment received',
    message: `A payment of $${payment.amount} has been released for your contract.`,
    entityId: paymentId,
    entityType: 'payment',
  });

  return updated;
};

export const getContractPayments = async (contractId: string, userId: string) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      project: { include: { client: { include: { user: true } } } },
      freelancer: { include: { user: true } },
    },
  });
  if (!contract) throw new Error('Not found');
  const isAuthorized = contract.project.client.userId === userId || contract.freelancer.userId === userId;
  if (!isAuthorized) throw new Error('Unauthorized');

  return prisma.payment.findMany({
    where: { contractId },
    include: { milestone: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getClientPaymentSummary = async (clientId: string) => {
  const payments = await prisma.payment.findMany({
    where: { contract: { project: { clientId } } },
    include: {
      contract: { include: { project: { select: { title: true } }, freelancer: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalSpent = payments.filter((p) => p.status === 'COMPLETED').reduce((acc, p) => acc + Number(p.amount), 0);
  const pending = payments.filter((p) => p.status === 'PENDING').reduce((acc, p) => acc + Number(p.amount), 0);

  return { payments, totalSpent, pendingAmount: pending };
};

export const getFreelancerEarnings = async (freelancerId: string) => {
  const payments = await prisma.payment.findMany({
    where: { contract: { freelancerId }, status: 'COMPLETED' },
    include: {
      contract: { include: { project: { select: { title: true } } } },
    },
    orderBy: { paidAt: 'desc' },
  });

  const totalEarned = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const pendingPayments = await prisma.payment.findMany({
    where: { contract: { freelancerId }, status: 'PENDING' },
    include: { contract: { include: { project: { select: { title: true } } } } },
  });
  const pendingAmount = pendingPayments.reduce((acc, p) => acc + Number(p.amount), 0);

  return { payments, totalEarned, pendingAmount, pendingPayments };
};
