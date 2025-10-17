import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API Configuration
export const BOOKING_API_KEY = process.env.RAPID_API_KEY || '';

// API URLs
export const BOOKING_BASE_URL = 'https://booking-com15.p.rapidapi.com/api/v1';

// Validate required API keys
if (!BOOKING_API_KEY) {
  console.error('Warning: RAPID_API_KEY not set. Hotel search will not work.');
}
