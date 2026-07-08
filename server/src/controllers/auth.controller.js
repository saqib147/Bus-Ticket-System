import crypto from 'crypto';
import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} from '../utils/jwt.js';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../services/email.service.js';

export const register = catchAsync(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return errorResponse(res, 'Email already registered', 409);

  const allowedRole = role === 'operator' ? 'operator' : 'passenger';
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: allowedRole,
    verificationToken,
    operatorStatus: allowedRole === 'operator' ? 'pending' : 'approved',
  });

  const verifyUrl = `${process.env.CLIENT_URL}/auth/verify/${verificationToken}`;
  await sendWelcomeEmail(user, verifyUrl);

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  setTokenCookies(res, accessToken, refreshToken);

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;
  delete userData.verificationToken;

  return successResponse(res, 'Registration successful', { user: userData, accessToken, refreshToken }, 201);
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  if (!user.isActive) return errorResponse(res, 'Account is suspended', 403);

  if (user.role === 'operator' && user.operatorStatus === 'rejected') {
    return errorResponse(res, 'Operator account has been rejected', 403);
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  setTokenCookies(res, accessToken, refreshToken);

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  return successResponse(res, 'Login successful', { user: userData, accessToken, refreshToken });
});

export const logout = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  clearTokenCookies(res);
  return successResponse(res, 'Logged out successfully');
});

export const verifyEmail = catchAsync(async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });
  if (!user) return errorResponse(res, 'Invalid verification token', 400);

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return successResponse(res, 'Email verified successfully');
});

export const forgotPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return successResponse(res, 'If that email exists, a reset link has been sent');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
  await sendPasswordResetEmail(user, resetUrl);

  return successResponse(res, 'If that email exists, a reset link has been sent');
});

export const resetPassword = catchAsync(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) return errorResponse(res, 'Invalid or expired reset token', 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  return successResponse(res, 'Password reset successful');
});

export const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return errorResponse(res, 'Refresh token required', 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return errorResponse(res, 'Invalid refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    return errorResponse(res, 'Invalid refresh token', 401);
  }

  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });
  setTokenCookies(res, accessToken, newRefreshToken);

  return successResponse(res, 'Token refreshed', { accessToken, refreshToken: newRefreshToken });
});

export const getMe = catchAsync(async (req, res) => {
  return successResponse(res, 'User fetched', { user: req.user });
});
