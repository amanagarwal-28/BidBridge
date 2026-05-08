import { Router } from 'express';
import * as bidController from '../controllers/bid.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', authenticate, authorize('FREELANCER'), bidController.getMyBids);
router.put('/:id/accept', authenticate, authorize('CLIENT'), bidController.acceptBid);
router.put('/:id/reject', authenticate, authorize('CLIENT'), bidController.rejectBid);
router.put('/:id/withdraw', authenticate, authorize('FREELANCER'), bidController.withdrawBid);

export default router;
