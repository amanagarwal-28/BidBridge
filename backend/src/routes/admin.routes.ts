import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getUsers);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/projects', adminController.getProjects);
router.get('/fraud-reports', adminController.getFraudReports);
router.put('/fraud-reports/:id/resolve', adminController.resolveReport);

export default router;
