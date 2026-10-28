import { Property } from '../models/property.model.js';
import { User } from '../models/user.model.js'; // Crucial: Registers User schema in memory
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    List all curated listings with dynamic faceted filters
// @route   GET /api/v1/properties
export const getAllProperties = asyncHandler(async (req, res, next) => {
  const { propertyType, guests, search, sort, page = 1, limit = 12 } = req.query;

  // Build Filter Object dynamically
  const filterQuery = { isAvailable: true };

  // 1. Property Type Filter
  if (propertyType && propertyType.trim() !== '') {
    filterQuery.propertyType = propertyType.toLowerCase();
  }

  // 2. Minimum Guest Capacity Filter
  if (guests && !isNaN(Number(guests))) {
    filterQuery.maxGuests = { $gte: Number(guests) };
  }

  // 3. Search Filter (Safe regex across title, city, address - NO text index requirement)
  if (search && search.trim() !== '') {
    const safeRegex = new RegExp(search.trim(), 'i');
    filterQuery.$or = [
      { title: safeRegex },
      { 'location.city': safeRegex },
      { 'location.address': safeRegex },
    ];
  }

  // 4. Sorting
  let sortBy = '-createdAt';
  if (sort) {
    sortBy = sort.split(',').join(' ');
  }

  // 5. Pagination
  const pageNumber = Math.max(1, parseInt(page, 10));
  const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNumber - 1) * limitNumber;

  // Execute Query with Populated Host
  const [properties, totalRecords] = await Promise.all([
    Property.find(filterQuery)
      .populate({
        path: 'host',
        select: 'name avatar email',
      })
      .sort(sortBy)
      .skip(skip)
      .limit(limitNumber)
      .lean(), // Lean returns plain fast JS objects
    Property.countDocuments(filterQuery),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: properties.length,
        totalRecords,
        page: pageNumber,
        properties,
      },
      'Curated properties loaded successfully.'
    )
  );
});

// @desc    Get single luxury property by slug
// @route   GET /api/v1/properties/:slug
export const getPropertyBySlug = asyncHandler(async (req, res, next) => {
  const property = await Property.findOne({ slug: req.params.slug })
    .populate('host', 'name avatar email createdAt')
    .lean();

  if (!property) {
    return next(new ApiError('No architectural residence found with this identifier', 404));
  }

  res.status(200).json(new ApiResponse(200, { property }, 'Property detail fetched.'));
});

// @desc    Publish a new Villa/Apartment listing (Host / Admin Only)
// @route   POST /api/v1/properties
export const createProperty = asyncHandler(async (req, res) => {
  const propertyData = {
    ...req.body,
    host: req.user._id,
  };

  const newProperty = await Property.create(propertyData);

  res.status(201).json(
    new ApiResponse(201, { property: newProperty }, 'Listing published successfully.')
  );
});

// @desc    Find properties within radius (Geospatial $geoWithin)
// @route   GET /api/v1/properties/within/:distance/center/:latlng
export const getPropertiesWithin = asyncHandler(async (req, res, next) => {
  const { distance, latlng } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(new ApiError('Please provide latitude and longitude in format: lat,lng', 400));
  }

  const radius = Number(distance) / 6378.1;

  const properties = await Property.find({
    location: {
      $geoWithin: { $centerSphere: [[Number(lng), Number(lat)], radius] },
    },
    isAvailable: true,
  }).lean();

  res.status(200).json(
    new ApiResponse(
      200,
      { count: properties.length, properties },
      `Listings located within ${distance}km radius.`
    )
  );
});