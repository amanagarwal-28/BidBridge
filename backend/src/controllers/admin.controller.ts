import { Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export const getStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getPlatformStats();
    sendSuccess(res, 'Stats fetched', stats);
  } catch (err) { next(err); }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getUsers(req.query as Record<string, string>);
    sendSuccess(res, 'Users fetched', result.users, 200, result.meta);
  } catch (err) { next(err); }
};

export const blockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.blockUser(req.params.id);
    sendSuccess(res, 'User blocked', user);
  } catch (err) { next(err); }
};

export const unblockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.unblockUser(req.params.id);
    sendSuccess(res, 'User unblocked', user);
  } catch (err) { next(err); }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await adminService.deleteUser(req.params.id);
    sendSuccess(res, 'User deleted');
  } catch (err) { next(err); }
};

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getAllProjects(req.query as Record<string, string>);
    sendSuccess(res, 'Projects fetched', result.projects, 200, result.meta);
  } catch (err) { next(err); }
};

export const getFraudReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getFraudReports(req.query as Record<string, string>);
    sendSuccess(res, 'Reports fetched', result.reports, 200, result.meta);
  } catch (err) { next(err); }
};

export const resolveReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const report = await adminService.resolveFraudReport(req.params.id);
    sendSuccess(res, 'Report resolved', report);
  } catch (err) { next(err); }
};

export const getAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await adminService.getAnalytics();
    sendSuccess(res, 'Analytics fetched', analytics);
  } catch (err) { next(err); }
};
