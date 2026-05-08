import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/:contractId', authenticate, reviewController.createReview);
router.get('/freelancer/:freelancerId', reviewController.getFreelancerReviews);

export default router;
