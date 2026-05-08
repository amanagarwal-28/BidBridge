import { prisma } from '../config/prisma';
import { NotificationType } from '@prisma/client';

export const createNotification = async (params: {
  receiverId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
}) => {
  return prisma.notification.create({ data: params });
};

export const getNotifications = async (userId: string, unreadOnly = false) => {
  return prisma.notification.findMany({
    where: { receiverId: userId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

export const markRead = async (notificationId: string, userId: string) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, receiverId: userId },
    data: { isRead: true },
  });
};

export const markAllRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { receiverId: userId, isRead: false },
    data: { isRead: true },
  });
};
