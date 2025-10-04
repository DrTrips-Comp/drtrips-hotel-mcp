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
    'Search for hotels on Booking.com with detailed information including pricing, photos, facilities, and reviews. ' +
    'Accepts destination, check-in/check-out dates, number of guests, and returns comprehensive hotel data.',
  inputSchema: {
    type: 'object',
    properties: {
      destination: {
        type: 'string',
        description: 'Destination city or location (e.g., "Paris", "New York", "Tokyo")'
      },
      check_in_date: {
        type: 'string',
        description: 'Check-in date in YYYY-MM-DD format'
      },
      check_out_date: {
        type: 'string',
        description: 'Check-out date in YYYY-MM-DD format'
      },
      adults: {
        type: 'number',
        description: 'Number of adults (1-30)',
        minimum: 1,
        maximum: 30
      },
      children: {
        type: 'array',
        items: {
          type: 'number',
          description: 'Age of child'
        },
        description: 'Array of children ages (optional)',
        default: []
      },
      rooms: {
        type: 'number',
        description: 'Number of rooms (1-8)',
        minimum: 1,
        maximum: 8,
        default: 1
      },
      currency: {
        type: 'string',
        description: 'Currency code (e.g., USD, EUR, GBP)',
        default: 'USD'
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of hotel results to return (1-10)',
        minimum: 1,
        maximum: 10,
        default: 3
      }
    },
    required: ['destination', 'check_in_date', 'check_out_date', 'adults']
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
    version: '1.0.0'
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
      if (typeof args.destination !== 'string') {
        throw new Error('Invalid arguments: "destination" must be a string');
      }
      if (typeof args.check_in_date !== 'string') {
        throw new Error('Invalid arguments: "check_in_date" must be a string');
      }
      if (typeof args.check_out_date !== 'string') {
        throw new Error('Invalid arguments: "check_out_date" must be a string');
      }
      if (typeof args.adults !== 'number') {
        throw new Error('Invalid arguments: "adults" must be a number');
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

      // Format and return results
      const formattedResults = formatHotelResults(hotels);

      return {
        content: [{ type: 'text', text: formattedResults }],
        isError: false,
        _meta: {
          total_requests: totalRequests
        }
      };
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
