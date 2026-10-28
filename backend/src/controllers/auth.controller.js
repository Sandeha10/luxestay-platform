import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getCookieOptions,
} from '../services/token.service.js';

const issueTokenPairAndRespond = async (user, statusCode, res, message) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Store hashed refresh token in database for single-device revocation control
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  // 15 Minutes for Access Token Cookie
  res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
  // 7 Days for Refresh Token Cookie
  res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
      },
      message
    )
  );
};

// @desc    Register a new Guest or Host
// @route   POST /api/v1/auth/register
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError('An account with this email address already exists', 409));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role,
  });

  await issueTokenPairAndRespond(newUser, 201, res, 'Account registered successfully.');
});

// @desc    Authenticate User & Issue Tokens
// @route   POST /api/v1/auth/login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshTokenHash');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new ApiError('Invalid email or password credentials', 401));
  }

  await issueTokenPairAndRespond(user, 200, res, 'Authenticated successfully.');
});

// @desc    Rotate Access Token using valid Refresh Token
// @route   POST /api/v1/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return next(new ApiError('No refresh token provided', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new ApiError('Invalid or expired refresh token', 403));
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user) {
    return next(new ApiError('User belonging to this token no longer exists', 401));
  }

  const incomingHash = hashToken(incomingRefreshToken);
  if (user.refreshTokenHash !== incomingHash) {
    // Refresh token reuse detected: revoke session
    user.refreshTokenHash = undefined;
    await user.save({ validateBeforeSave: false });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return next(new ApiError('Compromised session token detected. Please log in again', 403));
  }

  await issueTokenPairAndRespond(user, 200, res, 'Access token refreshed successfully.');
});

// @desc    Terminate Session & Clear Cookies
// @route   POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (incomingRefreshToken) {
    const hashed = hashToken(incomingRefreshToken);
    await User.findOneAndUpdate({ refreshTokenHash: hashed }, { $unset: { refreshTokenHash: 1 } });
  }

  res.clearCookie('accessToken', getCookieOptions(0));
  res.clearCookie('refreshToken', getCookieOptions(0));

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
});

// @desc    Get Current Authenticated Profile
// @route   GET /api/v1/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, 'Current user profile loaded.'));
});