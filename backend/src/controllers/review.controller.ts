import { Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await reviewService.createReview(req.params.contractId, req.user!.userId, req.body);
    sendSuccess(res, 'Review submitted', review, 201);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};

export const getFreelancerReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reviews = await reviewService.getFreelancerReviews(req.params.freelancerId);
    sendSuccess(res, 'Reviews fetched', reviews);
  } catch (err) { next(err); }
};
