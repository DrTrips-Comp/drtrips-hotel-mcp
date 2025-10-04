/**
 * Type definitions for hotel search functionality
 */

export interface HotelSearchParams {
  query?: string;
  destination?: string;
  check_in_date?: string;
  arrival_date?: string;
  check_out_date?: string;
  departure_date?: string;
  num_adults?: number;
  adults?: number;
  children?: number[];
  rooms?: number;
  room_qty?: number;
  currency?: string;
  max_results?: number;
}

export interface Location {
  latitude?: number;
  longitude?: number;
  address: string;
  city: string;
  country: string;
}

export interface RoomData {
  name: string;
  price: string | number;
  price_per_night: string | number;
  currency: string;
  total_days: number;
  photos: string[];
  facilities: string[];
  highlights: string[];
}

export interface CheckinCheckout {
  checkin: {
    from?: string;
    until?: string;
  };
  checkout: {
    from?: string;
    until?: string;
  };
}

export interface FeaturedReview {
  author: string;
  content: string;
  rating?: number;
  date: string;
}

export interface RatingScore {
  reviews_category: string;
  reviewsCount: number;
  score?: number;
  category: string;
}

export interface HotelResult {
  name: string;
  location: Location;
  photos: string[];
  rooms: RoomData[];
  facilities: string[];
  checkin_checkout: CheckinCheckout;
  featured_review: FeaturedReview[];
  rating_scores: RatingScore[];
  accommodation_type: string;
  review_count: number;
  hotel_id: number | string;
  url: string;
  url_booking_hotel: string;
}

export interface DestinationResult {
  dest_id: string;
  dest_type: string;
  name?: string;
  country?: string;
}

export interface ApiError {
  error: string;
}
