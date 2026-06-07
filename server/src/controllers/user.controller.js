import User from '../models/User.js';
import Booking from '../models/Booking.js';
import cloudinary from '../config/cloudinary.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getProfile = catchAsync(async (req, res) => {
  return successResponse(res, 'Profile fetched', { user: req.user });
});

export const updateProfile = catchAsync(async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (phone) updates.phone = phone;

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'busgo/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });
    updates.profilePicture = result.secure_url;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password -refreshToken');

  return successResponse(res, 'Profile updated', { user });
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return errorResponse(res, 'Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  return successResponse(res, 'Password changed successfully');
});

export const getUserBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ passengerId: req.user._id })
    .populate({
      path: 'scheduleId',
      populate: [{ path: 'busId' }, { path: 'routeId' }],
    })
    .populate('paymentId')
    .sort({ createdAt: -1 });

  return successResponse(res, 'Bookings fetched', { bookings });
});
