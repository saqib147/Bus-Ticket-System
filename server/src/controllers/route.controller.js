import Route from '../models/Route.js';
import { catchAsync } from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getRoutes = catchAsync(async (req, res) => {
  const filter = {};

  if (req.query.manage === 'true' && req.user) {
    if (req.user.role === 'operator') {
      filter.operatorId = req.user._id;
    }
  } else {
    filter.isActive = true;
  }

  if (req.query.source) filter.source = new RegExp(req.query.source, 'i');
  if (req.query.destination) filter.destination = new RegExp(req.query.destination, 'i');
  if (req.query.operatorId) filter.operatorId = req.query.operatorId;

  const routes = await Route.find(filter)
    .populate('operatorId', 'name email')
    .sort({ source: 1 });

  return successResponse(res, 'Routes fetched', { routes });
});

export const createRoute = catchAsync(async (req, res) => {
  const operatorId =
    req.user.role === 'admin' ? req.body.operatorId : req.user._id;

  if (!operatorId) {
    return errorResponse(res, 'Operator is required', 400);
  }

  const route = await Route.create({
    ...req.body,
    operatorId,
    stops: typeof req.body.stops === 'string' ? JSON.parse(req.body.stops) : req.body.stops || [],
  });

  const populated = await Route.findById(route._id).populate('operatorId', 'name email');

  return successResponse(res, 'Route created', { route: populated }, 201);
});

export const updateRoute = catchAsync(async (req, res) => {
  const query =
    req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, operatorId: req.user._id };

  const route = await Route.findOne(query);
  if (!route) return errorResponse(res, 'Route not found', 404);

  const updates = { ...req.body };
  if (typeof updates.stops === 'string') updates.stops = JSON.parse(updates.stops);

  if (req.user.role === 'admin' && updates.operatorId) {
    route.operatorId = updates.operatorId;
    delete updates.operatorId;
  }

  Object.assign(route, updates);
  await route.save();

  const populated = await Route.findById(route._id).populate('operatorId', 'name email');

  return successResponse(res, 'Route updated', { route: populated });
});

export const deleteRoute = catchAsync(async (req, res) => {
  const query =
    req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, operatorId: req.user._id };

  const route = await Route.findOneAndUpdate(query, { isActive: false }, { new: true });

  if (!route) return errorResponse(res, 'Route not found', 404);
  return successResponse(res, 'Route deactivated');
});
