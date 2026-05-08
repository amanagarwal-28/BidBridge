import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/skills', userController.getAllSkills);

router.get('/freelancers/:id', userController.getFreelancerProfile);
router.put('/freelancers/me', authenticate, authorize('FREELANCER'), userController.updateMyFreelancerProfile);
router.put('/freelancers/me/skills', authenticate, authorize('FREELANCER'), userController.updateMySkills);
router.post('/freelancers/me/portfolio', authenticate, authorize('FREELANCER'), userController.addPortfolioItem);
router.delete('/freelancers/me/portfolio/:id', authenticate, authorize('FREELANCER'), userController.deletePortfolioItem);

router.get('/clients/:id', userController.getClientProfile);
router.put('/clients/me', authenticate, authorize('CLIENT'), userController.updateMyClientProfile);

export default router;
