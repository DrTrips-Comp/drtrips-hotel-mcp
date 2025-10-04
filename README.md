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

### NPX Usage (Recommended)

You can run this MCP server directly using npx:

```bash
npx drtrips-hotel-mcp
```

### Local Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd hotel_mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Required
RAPID_API_KEY=your_rapid_api_key_here

# Optional (for future features)
OPENWEATHER_API_KEY=your_openweather_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

### Claude Desktop Configuration

Add to your Claude Desktop configuration file:

**Using Local Build (Current - Not Published Yet):**
```json
{
  "mcpServers": {
    "hotel-search": {
      "command": "node",
      "args": ["D:/lanflow-reccomendation/app/mcp/hotel_mcp/dist/index.js"],
      "env": {
        "RAPID_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

⚠️ Replace the path with your actual project path.

**Using NPX (After Publishing to NPM):**
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

This works only **after** you publish to npm with `npm publish`.

**Configuration file location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Development Mode (with tsx)

```bash
npm run dev
```

## Architecture

### Project Structure

```
hotel_mcp/
├── src/
│   ├── config/
│   │   └── settings.ts          # API configuration
│   ├── models/
│   │   └── hotel-models.ts      # TypeScript interfaces
│   ├── services/
│   │   └── hotel-api.ts         # Booking.com API client
│   └── index.ts                 # MCP server entry point
├── dist/                        # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env                         # Environment variables
```

### Key Components

- **HotelSearchAPI**: Main API client handling all Booking.com interactions
  - Two-phase search pattern: destination → hotels → details
  - Concurrent fetching with Promise.allSettled()
  - Photo fallback logic from multiple sources

- **MCP Server**: Exposes hotel search as MCP tool
  - Stdio transport for Claude Desktop integration
  - Formatted output with emojis for readability
  - Comprehensive error handling

## API Limits

- **Free Tier**: Limited requests per month on RapidAPI
- **Rate Limiting**: Implemented internally to prevent quota exhaustion
- **Concurrent Requests**: Maximum 10 hotels processed in parallel

## Documentation

Complete documentation is available in the [`/docs`](docs/) directory:

### 📚 User Guides
- **[Quick Start](docs/guides/QUICKSTART.md)** - Get started in 3 steps
- **[Usage Guide](docs/guides/USAGE.md)** - Detailed usage instructions
- **[Publishing to NPM](docs/guides/PUBLISHING.md)** - How to publish the package

### 🔧 Technical Reference
- **[API Request Flow](docs/reference/API_REQUEST_FLOW.md)** - Request patterns and optimization
- **[Metadata Tracking](docs/reference/METADATA_TRACKING.md)** - Request counter implementation
- **[Migration Summary](docs/reference/MIGRATION_COMPLETE.md)** - Python to TypeScript migration

### 🚀 For Developers
- **[Migration Guide](docs/MIGRATION_GUIDE_PYTHON_TO_TYPESCRIPT.md)** - Complete Python to TypeScript guide
- **[MCP SDK Documentation](docs/mcp_documentation.md)** - TypeScript MCP SDK reference

## Troubleshooting

### Server Not Starting

1. Check that `RAPID_API_KEY` is set in environment
2. Verify Node.js version (>=18 required)
3. Rebuild the project: `npm run build`

### No Results Returned

1. Verify API key is valid and has quota remaining
2. Check date format (must be YYYY-MM-DD)
3. Ensure destination name is spelled correctly

### Claude Desktop Not Detecting Server

1. Restart Claude Desktop after config changes
2. Check config file syntax (valid JSON)
3. Verify file paths in configuration
4. Check Claude Desktop logs for errors

## Project Structure

```
drtrips-hotel-mcp/
├── src/                    # TypeScript source code
│   ├── config/            # Configuration
│   ├── models/            # Type definitions
│   ├── services/          # API client
│   └── index.ts           # MCP server entry point
├── dist/                  # Compiled JavaScript (auto-generated)
├── docs/                  # Documentation
│   ├── guides/           # User guides
│   ├── reference/        # Technical docs
│   └── examples-archive/ # Reference implementations
├── .env                   # Environment variables (create from .env.example)
├── package.json          # NPM package config
└── README.md             # This file
```

**Note:** This project was migrated from Python to TypeScript. All Python source files have been removed. See [Migration Summary](docs/reference/MIGRATION_COMPLETE.md) for details.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the [troubleshooting guide](#troubleshooting)
- Review [MCP documentation](https://modelcontextprotocol.io)
- File an issue on GitHub

## Credits

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Booking.com API](https://rapidapi.com/DataCrawler/api/booking-com15)
- [Axios](https://axios-http.com/)
