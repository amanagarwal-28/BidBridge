import { Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export const getFreelancerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.getFreelancerProfile(req.params.id);
    sendSuccess(res, 'Profile fetched', profile);
  } catch (err) { next(err); }
};

export const updateMyFreelancerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.updateFreelancerProfile(req.user!.profileId, req.body);
    sendSuccess(res, 'Profile updated', profile);
  } catch (err) { next(err); }
};

export const updateMySkills = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await userService.updateFreelancerSkills(req.user!.profileId, req.body.skills);
    sendSuccess(res, 'Skills updated');
  } catch (err) { next(err); }
};

export const addPortfolioItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await userService.addPortfolioItem(req.user!.profileId, req.body);
    sendSuccess(res, 'Portfolio item added', item, 201);
  } catch (err) { next(err); }
};

export const deletePortfolioItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await userService.deletePortfolioItem(req.params.id, req.user!.profileId);
    sendSuccess(res, 'Portfolio item deleted');
  } catch (err) { next(err); }
};

export const getClientProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.getClientProfile(req.params.id);
    sendSuccess(res, 'Profile fetched', profile);
  } catch (err) { next(err); }
};

export const updateMyClientProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.updateClientProfile(req.user!.profileId, req.body);
    sendSuccess(res, 'Profile updated', profile);
  } catch (err) { next(err); }
};

export const getAllSkills = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const skills = await userService.getAllSkills();
    sendSuccess(res, 'Skills fetched', skills);
  } catch (err) { next(err); }
};
