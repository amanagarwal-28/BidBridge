import { Router } from 'express';
import * as contractController from '../controllers/contract.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/client/me', authenticate, authorize('CLIENT'), contractController.getMyClientContracts);
router.get('/freelancer/me', authenticate, authorize('FREELANCER'), contractController.getMyFreelancerContracts);
router.get('/:id', authenticate, contractController.getContractById);
router.post('/:id/milestones', authenticate, authorize('CLIENT'), contractController.createMilestone);
router.put('/:id/complete', authenticate, authorize('CLIENT'), contractController.completeContract);

export default router;
