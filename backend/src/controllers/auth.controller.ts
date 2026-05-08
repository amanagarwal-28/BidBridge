import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { signupSchema, loginSchema } from '../validations/auth.validation';
import { sendSuccess, sendError } from '../utils/response';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = signupSchema.parse(req.body);
    const result = await authService.signup(input);
    sendSuccess(res, 'Account created successfully', result, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    sendSuccess(res, 'Login successful', result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid credentials') {
      sendError(res, err.message, 401);
      return;
    }
    if (err instanceof Error && err.message.includes('blocked')) {
      sendError(res, err.message, 403);
      return;
    }
    next(err);
  }
};

export const logout = (_req: Request, res: Response): void => {
  sendSuccess(res, 'Logged out successfully');
};

export const me = async (req: Request & { user?: { userId: string; role: string; profileId: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { prisma } = await import('../config/prisma');
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
    });
    sendSuccess(res, 'User fetched', { ...user, profileId: req.user!.profileId });
  } catch (err) {
    next(err);
  }
};
