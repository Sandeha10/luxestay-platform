import mongoose from 'mongoose';
import slugify from 'slugify';

const propertySchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A luxury property must belong to an authenticated host'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Property listing title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    tagline: {
      type: String,
      required: [true, 'Editorial tagline is required'],
      trim: true,
      maxlength: [150, 'Tagline cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Full architectural and experience description is required'],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property category classification is required'],
      enum: {
        values: ['villa', 'penthouse', 'beachfront', 'chalet', 'estate'],
        message: '{VALUE} is not a supported LuxeStay property tier',
      },
      lowercase: true,
      index: true,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      country: { type: String, required: true },
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // GeoJSON standard: [Longitude, Latitude]
      coordinates: {
        type: [Number],
        required: [true, 'Geospatial coordinates [longitude, latitude] are required'],
      },
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [50, 'Base rate cannot be less than $50/night'],
      index: true,
    },
    cleaningFee: {
      type: Number,
      default: 120,
    },
    serviceFeeRate: {
      type: Number,
      default: 0.12, // 12% concierge platform fee
    },
    maxGuests: {
      type: Number,
      required: [true, 'Maximum guest occupancy is required'],
      min: [1, 'Must accommodate at least 1 guest'],
      index: true,
    },
    bedrooms: {
      type: Number,
      required: [true, 'Bedroom allocation count is required'],
      min: [1, 'Must have at least 1 bedroom'],
    },
    beds: {
      type: Number,
      required: [true, 'Bed count is required'],
      min: [1, 'Must have at least 1 bed'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Bathroom count is required'],
      min: [1, 'Must have at least 1 bathroom'],
    },
    amenities: [
      {
        type: String,
        enum: [
          'infinity_pool',
          'ocean_panorama',
          'private_chef_kitchen',
          'helipad',
          'spa_sauna',
          'wine_cellar',
          'high_speed_fiber',
          'ev_charger',
          'butler_service',
          'fireplace',
        ],
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: 'Architectural Perspective' },
        isCover: { type: Boolean, default: false },
      },
    ],
    averageRating: {
      type: Number,
      default: 5.0,
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating cannot exceed 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 1. Slug Generator Pre-Save Hook
propertySchema.pre('save', async function () {
  if (!this.isModified('title')) return;
  
  let baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  // Ensure slug uniqueness
  while (await mongoose.models.Property.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }
  this.slug = slug;
});

// 2. Geospatial Index for Map & Proximity Queries
propertySchema.index({ 'location.coordinates': '2dsphere' });

// 3. Compound Index for Catalog Filtering & Sorting
propertySchema.index({ propertyType: 1, pricePerNight: 1, maxGuests: 1 });

// 4. Full-Text Search Index
propertySchema.index({
  title: 'text',
  tagline: 'text',
  description: 'text',
  'location.city': 'text',
});

export const Property = mongoose.model('Property', propertySchema);