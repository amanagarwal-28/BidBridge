import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import * as bidController from '../controllers/bid.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public read access (browse projects)
router.get('/', projectController.getProjects);
router.get('/me/list', authenticate, authorize('CLIENT'), projectController.getMyProjects);
router.get('/:id', projectController.getProjectById);
router.get('/:id/recommended', authenticate, authorize('CLIENT'), projectController.getRecommendedFreelancers);
router.get('/:projectId/bids', authenticate, authorize('CLIENT'), bidController.getProjectBids);

// Client-only write access
router.post('/', authenticate, authorize('CLIENT'), projectController.createProject);
router.put('/:id', authenticate, authorize('CLIENT'), projectController.updateProject);
router.delete('/:id', authenticate, authorize('CLIENT'), projectController.deleteProject);
router.put('/:id/close', authenticate, authorize('CLIENT'), projectController.closeProject);

// Freelancer places bid
router.post('/:projectId/bids', authenticate, authorize('FREELANCER'), bidController.placeBid);

export default router;
