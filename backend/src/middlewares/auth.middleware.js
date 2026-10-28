import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Route Guard: Ensures request carries a valid Access Token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Read token from Authorization header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2. Return 401 instead of crashing if no token exists
  if (!token) {
    return next(new ApiError('Please sign in to view your reservations.', 401));
  }

  // 3. Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    return next(new ApiError('Session expired or invalid. Please sign in again.', 401));
  }

  // 4. Verify user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new ApiError('Account belonging to this token no longer exists.', 401));
  }

  req.user = currentUser;
  next();
});

// Granular Role-Based Authorization
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(`Access forbidden: '${req.user.role}' role cannot perform this action`, 403)
      );
    }
    next();
  };
};