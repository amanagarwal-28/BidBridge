import { Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export const getMy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await notificationService.getNotifications(req.user!.userId, unreadOnly);
    sendSuccess(res, 'Notifications fetched', notifications);
  } catch (err) { next(err); }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationService.markRead(req.params.id, req.user!.userId);
    sendSuccess(res, 'Marked as read');
  } catch (err) { next(err); }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllRead(req.user!.userId);
    sendSuccess(res, 'All marked as read');
  } catch (err) { next(err); }
};
