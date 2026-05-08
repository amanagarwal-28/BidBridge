import { Router } from 'express';
import * as contractController from '../controllers/contract.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.put('/:id/status', authenticate, contractController.updateMilestoneStatus);

export default router;
