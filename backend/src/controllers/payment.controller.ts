import { Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const initiatePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.initiatePayment(req.params.contractId, req.user!.profileId, req.body.milestoneId);
    sendSuccess(res, 'Payment initiated', payment, 201);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};

export const completePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.completePayment(req.params.id, req.user!.profileId);
    sendSuccess(res, 'Payment completed', payment);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 400); return; }
    next(err);
  }
};

export const getContractPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payments = await paymentService.getContractPayments(req.params.contractId, req.user!.userId);
    sendSuccess(res, 'Payments fetched', payments);
  } catch (err) {
    if (err instanceof Error) { sendError(res, err.message, 404); return; }
    next(err);
  }
};

export const getClientPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const summary = await paymentService.getClientPaymentSummary(req.user!.profileId);
    sendSuccess(res, 'Payments fetched', summary);
  } catch (err) { next(err); }
};

export const getFreelancerEarnings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const earnings = await paymentService.getFreelancerEarnings(req.user!.profileId);
    sendSuccess(res, 'Earnings fetched', earnings);
  } catch (err) { next(err); }
};
