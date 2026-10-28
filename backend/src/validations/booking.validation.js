import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    propertyId: z.string({ required_error: 'Property ID is required' }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid Property ObjectId'),
    checkIn: z.string({ required_error: 'Check-in date is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid ISO date string for checkIn',
    }),
    checkOut: z.string({ required_error: 'Check-out date is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid ISO date string for checkOut',
    }),
    guestCount: z.number({ required_error: 'Guest count is required' }).int().positive(),
  }),
});