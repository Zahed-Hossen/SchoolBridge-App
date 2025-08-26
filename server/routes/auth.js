import express from 'express';
import rateLimit from 'express-rate-limit';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { userValidation, validate } from '../middleware/validation.js';
import { RATE_LIMITS } from '../utils/constants.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();
const authLimiter = rateLimit(RATE_LIMITS.AUTH);
const activationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many activation attempts',
});

router.post(
  '/signup',
  authLimiter,
  userValidation.signup,
  validate,
  authController.signup,
);

router.post(
  '/invitations',
  auth,
  authorize('SuperAdmin'),
  authController.createInvitations,
);

router.get(
  '/activate/validate',
  activationLimiter,
  authController.validateActivationToken,
);

router.post(
  '/activate',
  activationLimiter,
  userValidation.activate,
  validate,
  authController.activateAccount,
);

router.post(
  '/login',
  authLimiter,
  userValidation.login,
  validate,
  authController.login,
);

router.post(
  '/google',
  authLimiter,
  userValidation.googleAuth,
  validate,
  authController.googleAuth,
);

router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/validate', authController.validateSession);
router.get('/me', authController.getMe);

export default router;
