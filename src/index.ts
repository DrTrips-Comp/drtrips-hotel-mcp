#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { HotelSearchAPI } from './services/hotel-api.js';
import { BOOKING_API_KEY } from './config/settings.js';
import type { HotelSearchParams } from './models/hotel-models.js';

// Validate API key
if (!BOOKING_API_KEY) {
  console.error('Error: RAPID_API_KEY environment variable is required');
  process.exit(1);
}

/**
 * Definition of the Hotel Search Tool
 */
const HOTEL_SEARCH_TOOL: Tool = {
  name: 'search_hotels',
  description:
    'Search for hotels on Booking.com with comprehensive details including pricing, photos, facilities, reviews, and ratings. ' +
    'Use this tool when users need hotel accommodations. Requires destination, check-in/out dates (YYYY-MM-DD), and number of adults. ' +
    'Returns up to max_results hotels with complete booking information including direct Booking.com URLs. ' +
    'Best for: Finding hotels in specific cities, comparing accommodations, checking availability and prices. ' +
    'NOT for: Finding flights, car rentals, or non-hotel accommodations (use specialized tools for those).',
  inputSchema: {
    type: 'object',
    properties: {
      destination: {
        type: 'string',
        description: 'Destination city, region, or landmark name. Examples: "Paris", "Tokyo", "New York City", "Barcelona", "London", "Dubai". Can also be specific areas like "Manhattan" or "Paris 5th arrondissement".'
      },
      check_in_date: {
        type: 'string',
        description: 'Check-in date in YYYY-MM-DD format. Must be today or a future date. Examples: "2025-01-15", "2025-03-20". Ensure the date is valid and not in the past.',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      check_out_date: {
        type: 'string',
        description: 'Check-out date in YYYY-MM-DD format. Must be after check-in date. Examples: "2025-01-20", "2025-03-25". Minimum 1 night stay required.',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      adults: {
        type: 'number',
        description: 'Number of adults (1-30). Examples: 1 for solo traveler, 2 for couple, 4 for family.',
        minimum: 1,
        maximum: 30
      },
      children: {
        type: 'array',
        items: {
          type: 'number',
          description: 'Age of child (0-17)'
        },
        description: 'Array of children ages (optional). Examples: [8, 10] for two children aged 8 and 10, [5] for one 5-year-old child. Leave empty if no children.',
        default: []
      },
      rooms: {
        type: 'number',
        description: 'Number of rooms needed (1-8). Default is 1 room. Examples: 1 for a single room, 2 for two separate rooms.',
        minimum: 1,
        maximum: 8,
        default: 1
      },
      currency: {
        type: 'string',
        description: 'Currency code for pricing (3-letter ISO code). Examples: "USD" for US Dollars, "EUR" for Euros, "GBP" for British Pounds, "JPY" for Japanese Yen. Default: "USD".',
        default: 'USD'
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of hotel results to return (1-10). Use lower numbers (3-5) for quick comparisons, higher numbers (8-10) for comprehensive searches. Default: 3.',
        minimum: 1,
        maximum: 10,
        default: 3
      },
      format: {
        type: 'string',
        enum: ['json', 'markdown'],
        description: 'Return format: "json" for structured data that can be parsed and analyzed (default), "markdown" for human-readable formatted text with emojis. Use "json" when you need to process or compare hotel data programmatically.',
        default: 'json'
      }
    },
    required: ['destination', 'check_in_date', 'check_out_date', 'adults']
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true
  }
};

/**
 * Formats hotel results into a readable string
 */
function formatHotelResults(hotels: any[]): string {
  if (hotels.length === 0) {
    return 'No hotels found matching your criteria.';
  }

  let result = `🏨 HOTEL SEARCH RESULTS\n`;
  result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  result += `Found ${hotels.length} hotel${hotels.length > 1 ? 's' : ''}\n\n`;

  hotels.forEach((hotel, index) => {
    if ('error' in hotel) {
      result += `${index + 1}. Error: ${hotel.error}\n\n`;
      return;
    }

    result += `${index + 1}. ${hotel.name}\n`;
    result += `   📍 Location: ${hotel.location.address}, ${hotel.location.city}, ${hotel.location.country}\n`;

    if (hotel.accommodation_type) {
      result += `   🏢 Type: ${hotel.accommodation_type}\n`;
    }

    // Rating information
    if (hotel.rating_scores && hotel.rating_scores.length > 0) {
      const overallRating = hotel.rating_scores.find((r: any) => r.category === 'overall');
      if (overallRating && overallRating.score) {
        result += `   ⭐ Rating: ${overallRating.score}/10 (${hotel.review_count} reviews)\n`;
      }
    }

    // Room information
    if (hotel.rooms && hotel.rooms.length > 0) {
      const room = hotel.rooms[0]; // Show first room
      result += `   💰 Price: ${room.currency} ${room.price} (${room.currency} ${room.price_per_night}/night for ${room.total_days} nights)\n`;
      if (room.name) {
        result += `   🛏️  Room: ${room.name}\n`;
      }
    }

    // Facilities (show first 5)
    if (hotel.facilities && hotel.facilities.length > 0) {
      const topFacilities = hotel.facilities.slice(0, 5);
      result += `   ✨ Facilities: ${topFacilities.join(', ')}`;
      if (hotel.facilities.length > 5) {
        result += ` (+${hotel.facilities.length - 5} more)`;
      }
      result += '\n';
    }

    // Check-in/check-out times
    if (hotel.checkin_checkout) {
      const checkin = hotel.checkin_checkout.checkin;
      const checkout = hotel.checkin_checkout.checkout;
      if (checkin?.from || checkout?.until) {
        result += `   🕐 Check-in: ${checkin?.from || 'N/A'} | Check-out: ${checkout?.until || 'N/A'}\n`;
      }
    }

    // Featured review
    if (hotel.featured_review && hotel.featured_review.length > 0) {
      const review = hotel.featured_review[0];
      if (review.content && review.content.length < 150) {
        result += `   💬 Review: "${review.content}" - ${review.author}\n`;
      }
    }

    // Photos count
    if (hotel.photos && hotel.photos.length > 0) {
      result += `   📷 Photos: ${hotel.photos.length} available\n`;
    }

    // Booking URL
    result += `   🔗 Book now: ${hotel.url_booking_hotel}\n`;
    result += '\n';
  });

  result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  result += `💡 Tip: Click the booking URL to see full details and complete your reservation\n`;

  return result;
}

// Initialize the MCP server
const server = new Server(
  {
    name: 'drtrips-hotel-mcp',
    version: '1.0.1'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Initialize the Hotel Search API
const hotelAPI = new HotelSearchAPI();

/**
 * Register handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [HOTEL_SEARCH_TOOL]
}));

/**
 * Register handler for calling the hotel search tool
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error('No arguments provided');
    }

    if (name === 'search_hotels') {
      // Validate required arguments
      if (typeof args.destination !== 'string' || !args.destination.trim()) {
        throw new Error(
          'Invalid "destination" parameter: must be a non-empty string. ' +
          'Please provide a city or location name (e.g., "Paris", "Tokyo", "New York"). ' +
          'If searching for a specific area, include the region (e.g., "Manhattan, New York").'
        );
      }

      if (typeof args.check_in_date !== 'string') {
        throw new Error(
          'Invalid "check_in_date" parameter: must be a string in YYYY-MM-DD format. ' +
          'Examples: "2025-01-15", "2025-03-20". Please provide a valid date.'
        );
      }

      if (typeof args.check_out_date !== 'string') {
        throw new Error(
          'Invalid "check_out_date" parameter: must be a string in YYYY-MM-DD format. ' +
          'Examples: "2025-01-20", "2025-03-25". Please provide a valid date.'
        );
      }

      if (typeof args.adults !== 'number') {
        throw new Error(
          'Invalid "adults" parameter: must be a number between 1 and 30. ' +
          'Examples: 1 for solo traveler, 2 for couple, 4 for family.'
        );
      }

      // Validate date formats and logic
      const checkInDate = new Date(args.check_in_date as string);
      const checkOutDate = new Date(args.check_out_date as string);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(checkInDate.getTime())) {
        throw new Error(
          `Invalid "check_in_date": must be in YYYY-MM-DD format (e.g., "2025-01-15"). ` +
          `The date "${args.check_in_date}" could not be parsed. Please use the format YYYY-MM-DD.`
        );
      }

      if (checkInDate < today) {
        throw new Error(
          'Invalid "check_in_date": cannot be in the past. ' +
          `Today is ${today.toISOString().split('T')[0]}. ` +
          'Please provide a check-in date that is today or in the future.'
        );
      }

      if (isNaN(checkOutDate.getTime())) {
        throw new Error(
          `Invalid "check_out_date": must be in YYYY-MM-DD format (e.g., "2025-01-20"). ` +
          `The date "${args.check_out_date}" could not be parsed. Please use the format YYYY-MM-DD.`
        );
      }

      if (checkOutDate <= checkInDate) {
        throw new Error(
          'Invalid "check_out_date": must be after check-in date. ' +
          `Check-in: ${args.check_in_date}, Check-out: ${args.check_out_date}. ` +
          'Please ensure at least 1 night stay between check-in and check-out dates.'
        );
      }

      // Validate adults count
      const adults = args.adults as number;
      if (adults < 1 || adults > 30) {
        throw new Error(
          `Invalid "adults" parameter: must be between 1 and 30, got ${adults}. ` +
          'Please provide a valid number of adults.'
        );
      }

      // Prepare search parameters
      const searchParams: HotelSearchParams = {
        query: args.destination as string,
        check_in_date: args.check_in_date as string,
        check_out_date: args.check_out_date as string,
        num_adults: args.adults as number,
        children: (args.children as number[] | undefined) || [],
        rooms: (args.rooms as number | undefined) || 1,
        currency: (args.currency as string | undefined) || 'USD',
        max_results: (args.max_results as number | undefined) || 3
      };

      // Perform hotel search
      const hotels = await hotelAPI.searchHotels(searchParams);

      // Get request count
      const totalRequests = hotelAPI.getRequestCount();

      // Get format preference (default to json)
      const format = (args.format as string | undefined) || 'json';

      // Return results in requested format
      if (format === 'markdown') {
        const formattedResults = formatHotelResults(hotels);
        return {
          content: [{ type: 'text', text: formattedResults }],
          isError: false,
          _meta: {
            total_requests: totalRequests,
            format: 'markdown'
          }
        };
      } else {
        // Return JSON format (default)
        return {
          content: [{ type: 'text', text: JSON.stringify(hotels, null, 2) }],
          isError: false,
          _meta: {
            total_requests: totalRequests,
            format: 'json'
          }
        };
      }
    }

    // Unknown tool
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true
    };
  } catch (error) {
    // Return error details
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

/**
 * Main function to start the MCP server
 */
async function runServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Hotel Search MCP Server running on stdio');
    console.error('Booking API Key configured:', BOOKING_API_KEY ? 'Yes' : 'No');
  } catch (error) {
    console.error('Fatal error running server:', error);
    process.exit(1);
  }
}

// Start the server
runServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
