import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { ApiError } from './utils/ApiError.js';
import { ApiResponse } from './utils/ApiResponse.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { handleStripeWebhook } from './controllers/payment.controller.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import propertyRoutes from './routes/property.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// =========================================================================
// 1. RAW BODY WEBHOOK ROUTE (Must precede express.json() parser)
// =========================================================================
app.post(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// =========================================================================
// 2. Standard Parsers & Express 5 Safe Sanitization
// =========================================================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Custom In-Place NoSQL Injection Sanitizer (Express 5 & 4 compatible)
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query) sanitizeObject(req.query); // Mutates in-place without breaking Express 5 getter
  next();
});

app.use(
  hpp({
    whitelist: ['pricePerNight', 'propertyType', 'maxGuests', 'averageRating'],
  })
);

// =========================================================================
// 3. Mount API Endpoints
// =========================================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        brand: 'LuxeStay API',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      'Platform services operating normally.'
    )
  );
});

// 404 Interceptor (Express 5 safe syntax)
app.all('/{*splat}', (req, res, next) => {
  next(new ApiError(`Endpoint resource not found: ${req.originalUrl}`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;