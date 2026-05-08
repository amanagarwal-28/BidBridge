import { Response, NextFunction } from 'express';
import * as bidService from '../services/bid.service';
import { createBidSchema } from '../validations/bid.validation';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const placeBid = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const input = createBidSchema.parse(req.body);
    const bid = await bidService.placeBid(req.params.projectId, req.user!.profileId, input);
    sendSuccess(res, 'Bid placed successfully', bid, 201);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};

export const getProjectBids = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bids = await bidService.getProjectBids(req.params.projectId, req.user!.profileId);
    sendSuccess(res, 'Bids fetched', bids);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 403); return; }
    next(err);
  }
};

export const getMyBids = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bidService.getFreelancerBids(req.user!.profileId, req.query as Record<string, string>);
    sendSuccess(res, 'Bids fetched', result.bids, 200, result.meta);
  } catch (err) { next(err); }
};

export const acceptBid = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bidService.acceptBid(req.params.id, req.user!.profileId);
    sendSuccess(res, 'Bid accepted, contract created', result);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};

export const rejectBid = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bid = await bidService.rejectBid(req.params.id, req.user!.profileId);
    sendSuccess(res, 'Bid rejected', bid);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};

export const withdrawBid = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bid = await bidService.withdrawBid(req.params.id, req.user!.profileId);
    sendSuccess(res, 'Bid withdrawn', bid);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};
