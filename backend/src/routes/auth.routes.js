import express from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

// Protected Profile Endpoint
router.get('/me', protect, getMe);

// Role Test Endpoints
router.get('/host-only-dashboard', protect, restrictTo(ROLES.HOST, ROLES.ADMIN), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Welcome to LuxeStay Host Management' });
});

export default router;