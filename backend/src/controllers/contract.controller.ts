import { Response, NextFunction } from 'express';
import * as contractService from '../services/contract.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const getContractById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contract = await contractService.getContractById(req.params.id, req.user!.userId);
    sendSuccess(res, 'Contract fetched', contract);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 404); return; }
    next(err);
  }
};

export const getMyClientContracts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contracts = await contractService.getClientContracts(req.user!.profileId);
    sendSuccess(res, 'Contracts fetched', contracts);
  } catch (err) { next(err); }
};

export const getMyFreelancerContracts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contracts = await contractService.getFreelancerContracts(req.user!.profileId);
    sendSuccess(res, 'Contracts fetched', contracts);
  } catch (err) { next(err); }
};

export const createMilestone = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const milestone = await contractService.createMilestone(req.params.id, req.user!.profileId, req.body);
    sendSuccess(res, 'Milestone created', milestone, 201);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};

export const updateMilestoneStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const milestone = await contractService.updateMilestoneStatus(req.params.id, req.body.status, req.user!.userId);
    sendSuccess(res, 'Milestone updated', milestone);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};

export const completeContract = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contract = await contractService.completeContract(req.params.id, req.user!.profileId);
    sendSuccess(res, 'Contract completed', contract);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};
