import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProperties = async (params = {}) => {
  const response = await apiClient.get('/properties', { params });
  return response.data;
};

export const fetchPropertyBySlug = async (slug) => {
  const response = await apiClient.get(`/properties/${slug}`);
  return response.data;
};

export const fetchBookedDates = async (propertyId) => {
  const response = await apiClient.get(`/bookings/property/${propertyId}/booked-dates`);
  return response.data;
};

export const createBookingRequest = async (bookingData) => {
  const response = await apiClient.post('/bookings', bookingData);
  return response.data;
};

export const createCheckoutSession = async (bookingId) => {
  const response = await apiClient.post(`/payments/create-checkout-session/${bookingId}`);
  return response.data;
};

// Append to frontend/src/services/api.js

export const fetchBookingById = async (bookingId) => {
  const response = await apiClient.get(`/bookings/${bookingId}`);
  return response.data;
};

export const fetchMyBookings = async () => {
  const response = await apiClient.get('/bookings/my-bookings');
  return response.data;
};

// Append to frontend/src/services/api.js

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};