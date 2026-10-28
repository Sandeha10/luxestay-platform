import express from 'express';
import {
  getAllProperties,
  getPropertyBySlug,
  createProperty,
  getPropertiesWithin,
} from '../controllers/property.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router
  .route('/')
  .get(getAllProperties)
  .post(protect, restrictTo(ROLES.HOST, ROLES.ADMIN), createProperty);

router.route('/within/:distance/center/:latlng').get(getPropertiesWithin);
router.route('/:slug').get(getPropertyBySlug);

export default router;