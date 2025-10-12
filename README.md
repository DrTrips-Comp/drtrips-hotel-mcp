# Hotel Search MCP Server

An MCP (Model Context Protocol) server implementation that integrates with the Booking.com API to provide comprehensive hotel search capabilities through Claude Desktop and other MCP clients.

## Features

- 🔍 **Smart Hotel Search**: Multi-phase search (destination lookup → hotel search → detailed results)
- 💰 **Pricing Information**: Real-time pricing with per-night and total costs
- 📷 **Hotel Photos**: Multiple photos with intelligent fallback logic
- ⭐ **Reviews & Ratings**: Featured reviews and category-specific ratings
- 🏢 **Detailed Information**: Facilities, room types, check-in/out times
- 🔗 **Direct Booking Links**: Pre-filled Booking.com URLs for instant reservations

## Installation

### Prerequisites

- Node.js v18 or higher
- Booking.com API key from [RapidAPI](https://rapidapi.com/DataCrawler/api/booking-com15)


## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Required
RAPID_API_KEY=your_rapid_api_key_here

```

### Claude Desktop Configuration

Add the server to your Claude Desktop configuration file using `npx`:

```json
{
  "mcpServers": {
    "hotel-search": {
      "command": "npx",
      "args": ["-y", "drtrips-hotel-mcp"],
      "env": {
        "RAPID_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Usage

### Available Tools

#### `search_hotels`

Search for hotels with comprehensive details.

**Parameters:**
- `destination` (required): City or location (e.g., "Paris", "New York")
- `check_in_date` (required): Check-in date (YYYY-MM-DD format)
- `check_out_date` (required): Check-out date (YYYY-MM-DD format)
- `adults` (required): Number of adults (1-30)
- `children` (optional): Array of children ages
- `rooms` (optional): Number of rooms (default: 1)
- `currency` (optional): Currency code (default: "USD")
- `max_results` (optional): Maximum results (1-10, default: 3)

**Example usage in Claude:**

```
Find me 5 hotels in Paris for 2 adults from December 15-20, 2024
```

```
Search for family hotels in Tokyo for 2 adults and 2 children (ages 8 and 10)
from Jan 10-15, 2025, show me 3 options
```

### Return Format

The `search_hotels` tool returns an array of hotel objects in JSON format. Each hotel object contains:

```json
[
  {
    "name": "Hotel Name",
    "hotel_id": "12345678",
    "accommodation_type": "Hotel",
    "location": {
      "address": "123 Main Street",
      "city": "Paris",
      "country": "France",
      "latitude": 48.8566,
      "longitude": 2.3522
    },
    "photos": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg"
    ],
    "rooms": [
      {
        "name": "Deluxe Double Room",
        "price": 500,
        "price_per_night": 100,
        "currency": "USD",
        "total_days": 5,
        "photos": ["https://example.com/room1.jpg"],
        "facilities": ["WiFi", "Air conditioning"],
        "highlights": ["City view", "Balcony"]
      }
    ],
    "facilities": [
      "Free WiFi",
      "Restaurant",
      "Bar",
      "24-hour front desk",
      "Fitness center"
    ],
    "checkin_checkout": {
      "checkin": {
        "from": "14:00",
        "until": "23:00"
      },
      "checkout": {
        "from": "07:00",
        "until": "11:00"
      }
    },
    "featured_review": [
      {
        "author": "John D.",
        "content": "Excellent location and friendly staff!",
        "rating": 9.5,
        "date": "2024-11-15"
      }
    ],
    "rating_scores": [
      {
        "reviews_category": "Overall",
        "reviewsCount": 1234,
        "score": 8.9,
        "category": "overall"
      },
      {
        "reviews_category": "Location",
        "reviewsCount": 1234,
        "score": 9.5,
        "category": "location"
      }
    ],
    "review_count": 1234,
    "url": "https://www.booking.com/hotel/...",
    "url_booking_hotel": "https://www.booking.com/hotel/..."
  }
]
```

**Key Fields:**
- `name`: Hotel name
- `hotel_id`: Unique hotel identifier
- `accommodation_type`: Type of property (Hotel, Apartment, Resort, etc.)
- `location`: Complete address with coordinates
- `photos`: Array of hotel photo URLs
- `rooms`: Available room options with pricing and details
- `facilities`: List of hotel amenities
- `checkin_checkout`: Check-in and check-out time windows
- `featured_review`: Highlighted guest reviews
- `rating_scores`: Category-specific ratings (overall, location, cleanliness, etc.)
- `review_count`: Total number of reviews
- `url_booking_hotel`: Direct booking link with pre-filled search parameters

## API Limits

- **Free Tier**: Limited requests per month on RapidAPI
- **Rate Limiting**: Implemented internally to prevent quota exhaustion
- **Concurrent Requests**: Maximum 10 hotels processed in parallel

## Troubleshooting

### Server Not Starting

1. Check that `RAPID_API_KEY` is set in environment
2. Verify Node.js version (>=18 required)
3. Rebuild the project: `npm run build`

### No Results Returned

1. Verify API key is valid and has quota remaining
2. Check date format (must be YYYY-MM-DD)
3. Ensure destination name is spelled correctly

## License

MIT License - see LICENSE file for details

## Credits

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Booking.com API](https://rapidapi.com/DataCrawler/api/booking-com15)
- [Axios](https://axios-http.com/)
