import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/client/me', authenticate, authorize('CLIENT'), paymentController.getClientPayments);
router.get('/freelancer/me', authenticate, authorize('FREELANCER'), paymentController.getFreelancerEarnings);
router.get('/contract/:contractId', authenticate, paymentController.getContractPayments);
router.post('/contract/:contractId/initiate', authenticate, authorize('CLIENT'), paymentController.initiatePayment);
router.put('/:id/complete', authenticate, authorize('CLIENT'), paymentController.completePayment);

export default router;
