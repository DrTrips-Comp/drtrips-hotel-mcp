# Hotel Search MCP Server

An MCP (Model Context Protocol) server implementation that integrates with the Booking.com API to provide comprehensive hotel search capabilities through Claude Desktop and other MCP clients.

## Features

- 🔍 **Smart Hotel Search**: Multi-phase search (destination lookup → hotel search → detailed results)
- 💰 **Pricing Information**: Real-time pricing with per-night and total costs
- 📷 **Hotel Photos**: Multiple photos with intelligent fallback logic
- ⭐ **Reviews & Ratings**: Featured reviews and category-specific ratings
- 🏢 **Detailed Information**: Facilities, room types, check-in/out times
- 🔗 **Direct Booking Links**: Pre-filled Booking.com URLs for instant reservations
- 📊 **Dual Format Support**: JSON (default) for programmatic access or Markdown for readable output
- 🛡️ **Comprehensive Validation**: Actionable error messages with date validation and helpful guidance
- 📈 **API Efficiency**: Optimized request patterns to minimize API usage

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
- `destination` (required): City, region, or landmark name (e.g., "Paris", "Tokyo", "Manhattan")
- `check_in_date` (required): Check-in date in YYYY-MM-DD format (must be today or future)
- `check_out_date` (required): Check-out date in YYYY-MM-DD format (must be after check-in)
- `adults` (required): Number of adults (1-30)
- `children` (optional): Array of children ages (e.g., [8, 10])
- `rooms` (optional): Number of rooms (1-8, default: 1)
- `currency` (optional): Currency code (e.g., "USD", "EUR", "GBP", default: "USD")
- `max_results` (optional): Maximum results (1-10, default: 3)
- `format` (optional): Return format - "json" (default) or "markdown"

**Example usage in Claude:**

```
Find me 5 hotels in Paris for 2 adults from December 15-20, 2025
```

```
Search for family hotels in Tokyo for 2 adults and 2 children (ages 8 and 10)
from Jan 10-15, 2025, show me 3 options in JSON format
```

```
Show me hotels in New York for a solo traveler from November 25-28, 2025 in markdown format
```

**Real Output Examples:**

See the `results/` directory for actual API response examples:
- `test1-paris-json.json` - Paris search for 2 adults
- `test2-tokyo-family-json.json` - Tokyo family search with children
- `test3-newyork-solo-json.json` - New York solo traveler search

### Return Format

The `search_hotels` tool supports two output formats:

#### JSON Format (Default)

Returns structured JSON data for programmatic processing. The response includes:

**Response Structure:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "[{hotel1}, {hotel2}, ...]"
    }
  ],
  "isError": false,
  "_meta": {
    "total_requests": 12,
    "format": "json"
  }
}
```

**Hotel Object Structure:**
Each hotel in the array contains:

```json
{
  "name": "Hôtel La Conversation",
  "hotel_id": 256425,
  "accommodation_type": "Hotels",
  "location": {
    "latitude": 48.8330502977924,
    "longitude": 2.30397462844849,
    "address": "61 rue Brancion",
    "city": "Paris",
    "country": "France"
  },
  "photos": [
    "https://cf.bstatic.com/xdata/images/hotel/max500/photo1.jpg",
    "https://cf.bstatic.com/xdata/images/hotel/max500/photo2.jpg"
  ],
  "rooms": [
    {
      "name": "Featuring free toiletries, this double room includes...",
      "price": "$555",
      "price_per_night": "$185",
      "currency": "USD",
      "total_days": 3,
      "photos": [
        "https://cf.bstatic.com/xdata/images/hotel/max750/room1.jpg"
      ],
      "facilities": [
        "TV",
        "Safe",
        "Air conditioning",
        "Free WiFi"
      ],
      "highlights": [
        "Free WiFi",
        "Air conditioning",
        "Flat-screen TV"
      ]
    }
  ],
  "facilities": [
    "Air conditioning",
    "Private bathroom",
    "Free Wifi",
    "Flat-screen TV",
    "24-hour front desk"
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
      "reviews_category": "Breakfast",
      "reviewsCount": 1912,
      "score": 8.5,
      "category": "breakfast"
    },
    {
      "reviews_category": "WiFi",
      "reviewsCount": 1912,
      "score": 9.1,
      "category": "wifi"
    }
  ],
  "review_count": 1912,
  "url": "https://www.booking.com/hotel/fr/hotel-name.html",
  "url_booking_hotel": "https://www.booking.com/hotel/fr/hotel-name.html?checkin=2025-11-20&checkout=2025-11-23&group_adults=2&no_rooms=1..."
}
```

#### Markdown Format

Returns human-readable formatted text with emojis. Set `format: "markdown"` to use this format.

**Example Markdown Output:**
```
🏨 HOTEL SEARCH RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Found 3 hotels

1. Hôtel La Conversation
   📍 Location: 61 rue Brancion, Paris, France
   🏢 Type: Hotels
   ⭐ Rating: 8.9/10 (1912 reviews)
   💰 Price: USD $555 (USD $185/night for 3 nights)
   🛏️  Room: Double room with private bathroom
   ✨ Facilities: Air conditioning, Free Wifi, Flat-screen TV, 24-hour front desk, Daily housekeeping
   🔗 Book now: https://www.booking.com/hotel/...
```

### Response Metadata

The `_meta` object contains:
- **total_requests**: Number of API requests made to fetch the results
- **format**: The format of the response ("json" or "markdown")

### Field Descriptions

**Hotel Fields:**
- `name`: Hotel name
- `hotel_id`: Unique hotel identifier (number)
- `accommodation_type`: Property type (Hotels, Apartments, Resorts, etc.)
- `location`: Complete address with GPS coordinates
- `photos`: Array of hotel photo URLs (up to 5 photos)
- `rooms`: Available room options with detailed pricing
- `facilities`: List of hotel-wide amenities
- `checkin_checkout`: Check-in and check-out time windows
- `featured_review`: Highlighted guest reviews with ratings
- `rating_scores`: Category-specific ratings (breakfast, WiFi, etc.)
- `review_count`: Total number of guest reviews
- `url`: Standard hotel URL
- `url_booking_hotel`: Direct booking link with pre-filled search parameters

**Room Fields:**
- `name`: Room description
- `price`: Total price as string (e.g., "$555")
- `price_per_night`: Per-night rate as string (e.g., "$185")
- `currency`: Three-letter currency code
- `total_days`: Number of nights
- `photos`: Array of room photo URLs
- `facilities`: Room-specific amenities
- `highlights`: Key room features

## API Limits

- **Free Tier**: Limited requests per month on RapidAPI
- **Rate Limiting**: Implemented internally to prevent quota exhaustion
- **Concurrent Requests**: Hotels processed in parallel with optimized request patterns
- **Request Efficiency**: Fetches only `max_results + 2` hotels (buffer for failures)

## Testing

### Running Tests

A test script is provided to verify the MCP server functionality:

```bash
# Build the server first
npm run build

# Run the test script
node test-hotel-search.js
```

The test script will:
1. Search for hotels in Paris (2 adults, 3 nights)
2. Search for family hotels in Tokyo (2 adults + 2 children)
3. Search for hotels in New York (solo traveler)

Results are saved to the `results/` directory as JSON files with complete hotel data and metadata.

### Manual Testing

You can also test the MCP server directly with Claude Desktop or any MCP client by configuring it as shown in the Configuration section above.

## Troubleshooting

### Server Not Starting

1. Check that `RAPID_API_KEY` is set in environment
2. Verify Node.js version (>=18 required)
3. Rebuild the project: `npm run build`
4. Check the VS Code JSON schema reference in `server.json` is valid

### No Results Returned

1. **API Key Issues**: Verify API key is valid and has quota remaining
   - Error message will indicate authentication failures (401/403)
   - Visit [RapidAPI Dashboard](https://rapidapi.com) to check quota
2. **Date Format**: Check date format (must be YYYY-MM-DD)
   - Error message will show the correct format and what was provided
3. **Past Dates**: Ensure dates are today or in the future
   - Error message will show today's date for reference
4. **Destination**: Ensure destination name is spelled correctly
   - Error message suggests common destinations if none found
5. **Rate Limiting**: If you receive a 429 error, wait and try again
   - Consider upgrading your RapidAPI plan for higher limits

### Understanding Error Messages

The server provides actionable error messages with specific guidance:

- **Invalid dates**: Shows expected format and examples
- **Date in past**: Shows today's date and reminds about future dates
- **Invalid check-out**: Ensures check-out is after check-in with examples
- **API failures**: Indicates specific status codes and next steps
- **No hotels found**: Suggests adjusting search criteria

### Output Format Issues

- **JSON parsing**: If you need to parse the response, note that the `content[0].text` field contains the JSON array as a string
- **Markdown display**: Use `format: "markdown"` for human-readable output
- **Metadata access**: Check the `_meta` object for request count and format information

## License

MIT License - see LICENSE file for details

## Credits

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Booking.com API](https://rapidapi.com/DataCrawler/api/booking-com15)
- [Axios](https://axios-http.com/)
