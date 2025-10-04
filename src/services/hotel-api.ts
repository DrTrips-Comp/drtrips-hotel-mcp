import axios, { AxiosError } from 'axios';
import { BOOKING_API_KEY, BOOKING_BASE_URL } from '../config/settings.js';
import type {
  HotelSearchParams,
  HotelResult,
  DestinationResult,
  ApiError,
  Location,
  RoomData,
  CheckinCheckout,
  FeaturedReview,
  RatingScore
} from '../models/hotel-models.js';

/**
 * Hotel Search API Client for Booking.com
 */
export class HotelSearchAPI {
  private readonly headers: Record<string, string>;
  private requestCount: number = 0;

  constructor() {
    this.headers = {
      'X-RapidAPI-Key': BOOKING_API_KEY,
      'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
    };
  }

  /**
   * Reset request counter
   */
  resetRequestCount(): void {
    this.requestCount = 0;
  }

  /**
   * Get current request count
   */
  getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Get hotel photos from the API
   */
  async getHotelPhotos(hotelId: string): Promise<string[]> {
    try {
      const url = `${BOOKING_BASE_URL}/hotels/getHotelPhotos`;
      this.requestCount++; // Track request
      const response = await axios.get(url, {
        headers: this.headers,
        params: { hotel_id: hotelId }
      });

      if (response.status === 200 && response.data?.data) {
        const photos = response.data.data;
        const photoUrls: string[] = [];

        for (const photo of photos.slice(0, 5)) {
          if (typeof photo === 'object') {
            const urlOriginal = photo.url_original || '';
            const urlMax = photo.url_max || '';
            const url1024 = photo.url_1024x768 || '';
            const url640 = photo.url_640x400 || '';

            const photoUrl = urlOriginal || urlMax || url1024 || url640;
            if (photoUrl) {
              photoUrls.push(photoUrl);
            }
          }
        }
        return photoUrls;
      }
      return [];
    } catch (error) {
      console.error(`Hotel photos failed for ${hotelId}:`, error);
      return [];
    }
  }

  /**
   * Search for destinations by query
   */
  async searchDestinationsByQuery(query: string): Promise<{ destinations?: DestinationResult[]; error?: string }> {
    try {
      const url = `${BOOKING_BASE_URL}/hotels/searchDestination`;
      this.requestCount++; // Track request
      const response = await axios.get(url, {
        headers: this.headers,
        params: { query }
      });

      if (response.status === 200 && response.data?.status && response.data?.data) {
        return { destinations: response.data.data };
      }
      return { error: 'No destinations found' };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? `API request failed with status ${error.response?.status}`
        : String(error);
      return { error: errorMessage };
    }
  }

  /**
   * Search hotels by destination
   */
  async searchHotelsByDestination(
    destId: string,
    searchType: string,
    checkInDate: string,
    checkOutDate: string,
    numAdults: number,
    rooms: number = 1,
    children?: number[],
    currency: string = 'USD'
  ): Promise<{ hotel_ids?: string[]; error?: string }> {
    try {
      const url = `${BOOKING_BASE_URL}/hotels/searchHotels`;

      const params: Record<string, string> = {
        dest_id: destId,
        search_type: searchType,
        arrival_date: checkInDate,
        departure_date: checkOutDate,
        adults: String(numAdults),
        children_qty: String(children?.length || 0),
        room_qty: String(rooms),
        page_number: '1',
        units: 'metric',
        temperature_unit: 'c',
        languagecode: 'en-us',
        currency_code: currency
      };

      if (children) {
        children.forEach((age, index) => {
          params[`children_age_${index + 1}`] = String(age);
        });
      }

      this.requestCount++; // Track request
      const response = await axios.get(url, {
        headers: this.headers,
        params
      });

      if (response.status === 200 && response.data?.status && response.data?.data) {
        const hotelsData = response.data.data.hotels || [];
        const hotelIds = hotelsData
          .map((hotel: any) => hotel.hotel_id)
          .filter((id: any) => id !== undefined && id !== null);
        return { hotel_ids: hotelIds };
      }
      return { error: 'No hotels found' };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? `API request failed with status ${error.response?.status}`
        : String(error);
      return { error: errorMessage };
    }
  }

  /**
   * Get enhanced hotel details with pricing
   */
  async getHotelDetailsEnhanced(
    hotelId: string,
    checkInDate: string,
    checkOutDate: string,
    numAdults: number,
    rooms: number = 1,
    children?: number[],
    currency: string = 'USD'
  ): Promise<any> {
    try {
      const url = `${BOOKING_BASE_URL}/hotels/getHotelDetails`;

      const params: Record<string, string> = {
        hotel_id: hotelId,
        arrival_date: checkInDate,
        departure_date: checkOutDate,
        adults: String(numAdults),
        children_qty: String(children?.length || 0),
        room_qty: String(rooms),
        units: 'metric',
        temperature_unit: 'c',
        languagecode: 'en-us',
        currency_code: currency
      };

      if (children) {
        children.forEach((age, index) => {
          params[`children_age_${index + 1}`] = String(age);
        });
      }

      this.requestCount++; // Track request
      const response = await axios.get(url, {
        headers: this.headers,
        params
      });

      if (response.status === 200) {
        return response.data;
      }
      return { error: `API request failed with status ${response.status}` };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? `API request failed with status ${error.response?.status}`
        : String(error);
      return { error: errorMessage };
    }
  }

  /**
   * Extract featured reviews from hotel data
   */
  private extractFeaturedReviews(data: any): FeaturedReview[] {
    const featuredReviews: FeaturedReview[] = [];

    try {
      // Check for guest_reviews or reviews section
      const guestReviews = data.guest_reviews || [];
      if (Array.isArray(guestReviews)) {
        for (const review of guestReviews.slice(0, 3)) {
          if (typeof review === 'object') {
            const reviewData: FeaturedReview = {
              author: review.author || review.reviewer_name || 'Anonymous',
              content: review.content || review.review_text || review.positive || '',
              rating: review.rating || review.score,
              date: review.date || review.review_date || ''
            };
            if (reviewData.content) {
              featuredReviews.push(reviewData);
            }
          }
        }
      }

      // Check for review_list or similar structures
      const reviewList = data.review_list || data.reviews || [];
      if (Array.isArray(reviewList) && featuredReviews.length === 0) {
        for (const review of reviewList.slice(0, 3)) {
          if (typeof review === 'object') {
            const reviewData: FeaturedReview = {
              author: review.author || review.name || 'Anonymous',
              content: review.text || review.comment || review.positive || '',
              rating: review.rating || review.score,
              date: review.date || ''
            };
            if (reviewData.content) {
              featuredReviews.push(reviewData);
            }
          }
        }
      }

      // If no reviews found, check for review snippets
      if (featuredReviews.length === 0) {
        const reviewWord = data.review_score_word || '';
        if (reviewWord && typeof reviewWord === 'string') {
          featuredReviews.push({
            author: 'Booking.com',
            content: `Overall rating: ${reviewWord}`,
            rating: data.review_score || data.rating,
            date: ''
          });
        }
      }
    } catch (error) {
      console.error('Error extracting featured reviews:', error);
    }

    return featuredReviews;
  }

  /**
   * Format hotel data to match expected output structure
   */
  private async formatHotelDataEnhanced(
    hotelId: string,
    hotelDetails: any,
    searchParams: HotelSearchParams
  ): Promise<HotelResult | ApiError> {
    try {
      if (!hotelDetails?.status || !hotelDetails?.data) {
        return { error: 'Invalid hotel details' };
      }

      const data = hotelDetails.data;

      // Get hotel photos - try multiple sources
      let photos = await this.getHotelPhotos(hotelId);

      // If no photos from dedicated endpoint, extract from hotel details
      if (photos.length === 0) {
        const photosFromDetails: string[] = [];

        // Check main_photo_url
        const mainPhoto = data.main_photo_url || '';
        if (mainPhoto) {
          photosFromDetails.push(mainPhoto);
        }

        // Check photos array in data
        if (data.photos && Array.isArray(data.photos)) {
          for (const photo of data.photos.slice(0, 4)) {
            if (typeof photo === 'object') {
              const photoUrl =
                photo.url_original ||
                photo.url_max ||
                photo.url_1024x768 ||
                photo.url_640x400 ||
                '';
              if (photoUrl && !photosFromDetails.includes(photoUrl)) {
                photosFromDetails.push(photoUrl);
              }
            }
          }
        }

        // Check property_highlight_strip for images
        const propertyHighlights = data.property_highlight_strip || [];
        for (const highlight of propertyHighlights) {
          if (typeof highlight === 'object' && highlight.image) {
            const imageUrl = highlight.image;
            if (imageUrl && !photosFromDetails.includes(imageUrl)) {
              photosFromDetails.push(imageUrl);
              if (photosFromDetails.length >= 5) break;
            }
          }
        }

        // If still no photos, try to extract from room photos as fallback
        if (photosFromDetails.length === 0) {
          const roomsData = data.rooms || {};
          for (const roomId in roomsData) {
            const roomInfo = roomsData[roomId];
            if (typeof roomInfo === 'object' && roomInfo.photos) {
              const roomPhotos = roomInfo.photos || [];
              for (const photo of roomPhotos.slice(0, 3)) {
                if (typeof photo === 'object') {
                  const photoUrl =
                    photo.url_original ||
                    photo.url_max ||
                    photo.url_max750 ||
                    photo.url_1024x768 ||
                    photo.url_640x400 ||
                    '';
                  if (photoUrl) {
                    photosFromDetails.push(photoUrl);
                  }
                }
                if (photosFromDetails.length >= 3) break;
              }
              if (photosFromDetails.length >= 3) break;
            }
          }
        }

        photos = photosFromDetails.slice(0, 5);
      }

      // Extract basic information
      const hotelName = data.hotel_name || '';

      // Extract location
      const location: Location = {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || '',
        city: data.city || '',
        country: data.country_trans || ''
      };

      // Extract rooms information
      const roomsResult: RoomData[] = [];
      const roomsData = data.rooms || {};
      const priceBreakdown = data.product_price_breakdown || {};
      const grossAmount = priceBreakdown.gross_amount || {};
      const grossAmountPerNight = priceBreakdown.gross_amount_per_night || {};

      for (const roomId in roomsData) {
        const roomInfo = roomsData[roomId];
        if (typeof roomInfo !== 'object') continue;

        const roomName = roomInfo.description || `Room ${roomId}`;

        // Extract room photos
        const roomPhotos: string[] = [];
        if (roomInfo.photos) {
          for (const photo of roomInfo.photos || []) {
            if (typeof photo === 'object') {
              const photoUrl = photo.url_max750 || photo.url_original || '';
              if (photoUrl) roomPhotos.push(photoUrl);
            }
          }
        }

        // Extract room facilities
        const roomFacilities: string[] = [];
        if (roomInfo.facilities) {
          for (const facility of roomInfo.facilities || []) {
            if (typeof facility === 'object' && facility.name) {
              roomFacilities.push(facility.name);
            }
          }
        }

        // Extract room highlights
        const roomHighlights: string[] = [];
        if (roomInfo.highlights) {
          for (const highlight of roomInfo.highlights || []) {
            if (typeof highlight === 'object' && highlight.translated_name) {
              roomHighlights.push(highlight.translated_name);
            }
          }
        }

        const roomData: RoomData = {
          name: roomName,
          price: grossAmount.amount_rounded || grossAmount.amount_unrounded || '',
          price_per_night: grossAmountPerNight.amount_rounded || grossAmountPerNight.amount_unrounded || '',
          currency: grossAmount.currency || 'USD',
          total_days: priceBreakdown.nr_stays || 1,
          photos: roomPhotos,
          facilities: roomFacilities,
          highlights: roomHighlights
        };
        roomsResult.push(roomData);
      }

      // Extract facilities
      const facilitiesResult: string[] = [];

      // From property_highlight_strip
      const propertyHighlights = data.property_highlight_strip || [];
      for (const highlight of propertyHighlights) {
        if (typeof highlight === 'object' && highlight.name) {
          facilitiesResult.push(highlight.name);
        }
      }

      // From facilities_block
      const facilitiesBlock = data.facilities_block || {};
      if (typeof facilitiesBlock === 'object') {
        for (const categoryKey in facilitiesBlock) {
          const categoryData = facilitiesBlock[categoryKey];
          if (typeof categoryData === 'object' && categoryData.facilities) {
            for (const facility of categoryData.facilities) {
              if (typeof facility === 'object' && facility.name) {
                facilitiesResult.push(facility.name);
              }
            }
          }
        }
      }

      // Extract rating scores
      const ratingScores: RatingScore[] = [];
      const reviewScores = data.review_score_word || '';
      const reviewCount = data.review_nr || 0;

      // Breakfast review score
      const breakfastReview = data.breakfast_review_score || {};
      if (breakfastReview && typeof breakfastReview === 'object') {
        ratingScores.push({
          reviews_category: 'Breakfast',
          reviewsCount: breakfastReview.review_count || reviewCount,
          score: breakfastReview.rating || breakfastReview.review_score,
          category: 'breakfast'
        });
      }

      // WiFi review score
      const wifiReview = data.wifi_review_score || {};
      if (wifiReview && typeof wifiReview === 'object') {
        ratingScores.push({
          reviews_category: 'WiFi',
          reviewsCount: reviewCount,
          score: wifiReview.rating,
          category: 'wifi'
        });
      }

      // Overall review score
      const overallScore = data.review_score || data.rating;
      if (overallScore) {
        ratingScores.push({
          reviews_category: 'Overall',
          reviewsCount: reviewCount,
          score: overallScore,
          category: 'overall'
        });
      }

      // Extract checkin/checkout info
      const checkinCheckout: CheckinCheckout = {
        checkin: {
          from: data.checkin?.from,
          until: data.checkin?.until
        },
        checkout: {
          from: data.checkout?.from,
          until: data.checkout?.until
        }
      };

      // Construct URLs
      let baseUrl = data.url || '';
      if (!baseUrl.startsWith('https://www.booking.com')) {
        const countryCode = location.country ? location.country.toLowerCase().slice(0, 2) : 'us';
        const hotelNameSlug = hotelName
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/&/g, 'and');
        baseUrl = `https://www.booking.com/hotel/${countryCode}/${hotelNameSlug}.html`;
      }

      // Construct booking URL with parameters
      const checkInDate = searchParams.check_in_date || searchParams.arrival_date || '';
      const checkOutDate = searchParams.check_out_date || searchParams.departure_date || '';
      const numAdults = searchParams.num_adults || searchParams.adults || 1;
      const children = searchParams.children || [];
      const rooms = searchParams.rooms || searchParams.room_qty || 1;

      const bookingParams: Record<string, any> = {
        checkin: checkInDate,
        checkout: checkOutDate,
        group_adults: numAdults,
        no_rooms: rooms,
        req_adults: numAdults,
        sb_price_type: 'total',
        type: 'total'
      };

      if (children.length > 0) {
        bookingParams.group_children = children.length;
        bookingParams.req_children = children.length;
        children.forEach((age) => {
          bookingParams.req_age = age;
        });
      }

      const queryString = new URLSearchParams(bookingParams).toString();
      const urlBookingHotel = `${baseUrl}?${queryString}`;

      // Format final result
      const formattedHotel: HotelResult = {
        name: hotelName,
        location,
        photos,
        rooms: roomsResult,
        facilities: Array.from(new Set(facilitiesResult)), // Remove duplicates
        checkin_checkout: checkinCheckout,
        featured_review: this.extractFeaturedReviews(data),
        rating_scores: ratingScores,
        accommodation_type: data.accommodation_type_name || 'Hotel',
        review_count: reviewCount,
        hotel_id: typeof hotelId === 'string' && /^\d+$/.test(hotelId) ? parseInt(hotelId, 10) : hotelId,
        url: baseUrl,
        url_booking_hotel: urlBookingHotel
      };

      return formattedHotel;
    } catch (error) {
      console.error('Error formatting hotel data:', error);
      return { error: String(error) };
    }
  }

  /**
   * Search for hotels using two-phase approach
   */
  async searchHotels(searchParams: HotelSearchParams): Promise<Array<HotelResult | ApiError>> {
    try {
      // Reset request counter at the start of each search
      this.resetRequestCount();

      const query = searchParams.query || searchParams.destination || '';
      const checkInDate = searchParams.check_in_date || searchParams.arrival_date || '';
      const checkOutDate = searchParams.check_out_date || searchParams.departure_date || '';
      const numAdults = searchParams.num_adults || searchParams.adults || 1;
      const children = searchParams.children || [];
      const rooms = searchParams.rooms || searchParams.room_qty || 1;
      const currency = searchParams.currency || 'USD';
      const maxResults = searchParams.max_results || 3;

      // Phase 1: Search destinations
      const destinationsResult = await this.searchDestinationsByQuery(query);
      if (destinationsResult.error) {
        return [{ error: destinationsResult.error }];
      }

      const destinations = destinationsResult.destinations || [];
      if (destinations.length === 0) {
        return [];
      }

      // Use first destination
      const destination = destinations[0];
      const destId = destination.dest_id;
      const destType = destination.dest_type || 'city';
      const searchType = destType.toUpperCase();

      // Phase 2: Search hotels by destination
      const hotelsResult = await this.searchHotelsByDestination(
        destId,
        searchType,
        checkInDate,
        checkOutDate,
        numAdults,
        rooms,
        children,
        currency
      );

      if (hotelsResult.error) {
        return [{ error: hotelsResult.error }];
      }

      const hotelIds = hotelsResult.hotel_ids || [];
      if (hotelIds.length === 0) {
        return [];
      }

      // Phase 3: Get detailed hotel information
      const MAX_HOTELS_TO_PROCESS = Math.min(10, hotelIds.length);
      const hotelIdsToProcess = hotelIds.slice(0, MAX_HOTELS_TO_PROCESS);

      // Fetch hotel details concurrently
      const detailPromises = hotelIdsToProcess.map((hotelId) =>
        this.getHotelDetailsEnhanced(
          String(hotelId),
          checkInDate,
          checkOutDate,
          numAdults,
          rooms,
          children,
          currency
        )
      );

      const hotelDetailsResults = await Promise.allSettled(detailPromises);

      // Filter valid results
      const validHotelDetails: Array<[string, any]> = [];
      for (let i = 0; i < hotelDetailsResults.length; i++) {
        const result = hotelDetailsResults[i];
        if (result.status === 'fulfilled') {
          const details = result.value;
          if (!details.error && details.status) {
            validHotelDetails.push([hotelIdsToProcess[i], details]);
            if (validHotelDetails.length >= maxResults + 2) break;
          }
        }
      }

      if (validHotelDetails.length === 0) {
        return [];
      }

      // Phase 4: Get photos and format data
      const formatPromises = validHotelDetails.map(([hotelId, details]) =>
        this.formatHotelDataEnhanced(hotelId, details, searchParams)
      );

      const formattedResults = await Promise.allSettled(formatPromises);

      // Filter valid formatted results
      const finalResults: Array<HotelResult | ApiError> = [];
      for (const result of formattedResults) {
        if (result.status === 'fulfilled') {
          const formatted = result.value;
          if (!('error' in formatted)) {
            finalResults.push(formatted);
            if (finalResults.length >= maxResults) break;
          }
        }
      }

      return finalResults;
    } catch (error) {
      console.error('Error in searchHotels:', error);
      return [{ error: String(error) }];
    }
  }
}
