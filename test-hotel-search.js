#!/usr/bin/env node

/**
 * Test script for DrTrips Hotel MCP Server
 * Tests the search_hotels functionality and saves output to results folder
 */

import { HotelSearchAPI } from './dist/services/hotel-api.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testHotelSearch() {
  console.log('🏨 Testing DrTrips Hotel MCP Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Initialize API
  const hotelAPI = new HotelSearchAPI();

  // Test 1: Paris search (JSON format)
  console.log('Test 1: Searching hotels in Paris...');
  const test1Params = {
    query: 'Paris',
    check_in_date: '2025-11-20',
    check_out_date: '2025-11-23',
    num_adults: 2,
    children: [],
    rooms: 1,
    currency: 'USD',
    max_results: 3
  };

  try {
    const hotels1 = await hotelAPI.searchHotels(test1Params);
    const test1Output = {
      test: 'Paris - 2 adults, 3 nights',
      parameters: test1Params,
      request_count: hotelAPI.getRequestCount(),
      results_count: hotels1.length,
      results: hotels1
    };

    // Save JSON output
    const jsonPath = path.join(__dirname, 'results', 'test1-paris-json.json');
    fs.writeFileSync(jsonPath, JSON.stringify(test1Output, null, 2));
    console.log(`✅ Test 1 complete: ${hotels1.length} hotels found`);
    console.log(`📁 Saved to: ${jsonPath}\n`);
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    fs.writeFileSync(
      path.join(__dirname, 'results', 'test1-paris-error.txt'),
      `Error: ${error.message}\n${error.stack}`
    );
  }

  // Reset request counter
  hotelAPI.resetRequestCount();

  // Test 2: Tokyo family search
  console.log('Test 2: Searching family hotels in Tokyo...');
  const test2Params = {
    query: 'Tokyo',
    check_in_date: '2025-12-01',
    check_out_date: '2025-12-05',
    num_adults: 2,
    children: [8, 10],
    rooms: 1,
    currency: 'USD',
    max_results: 5
  };

  try {
    const hotels2 = await hotelAPI.searchHotels(test2Params);
    const test2Output = {
      test: 'Tokyo - 2 adults, 2 children (ages 8, 10), 4 nights',
      parameters: test2Params,
      request_count: hotelAPI.getRequestCount(),
      results_count: hotels2.length,
      results: hotels2
    };

    // Save JSON output
    const jsonPath = path.join(__dirname, 'results', 'test2-tokyo-family-json.json');
    fs.writeFileSync(jsonPath, JSON.stringify(test2Output, null, 2));
    console.log(`✅ Test 2 complete: ${hotels2.length} hotels found`);
    console.log(`📁 Saved to: ${jsonPath}\n`);
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    fs.writeFileSync(
      path.join(__dirname, 'results', 'test2-tokyo-error.txt'),
      `Error: ${error.message}\n${error.stack}`
    );
  }

  // Reset request counter
  hotelAPI.resetRequestCount();

  // Test 3: New York solo traveler
  console.log('Test 3: Searching hotels in New York for solo traveler...');
  const test3Params = {
    query: 'New York',
    check_in_date: '2025-11-25',
    check_out_date: '2025-11-28',
    num_adults: 1,
    children: [],
    rooms: 1,
    currency: 'USD',
    max_results: 3
  };

  try {
    const hotels3 = await hotelAPI.searchHotels(test3Params);
    const test3Output = {
      test: 'New York - 1 adult, 3 nights',
      parameters: test3Params,
      request_count: hotelAPI.getRequestCount(),
      results_count: hotels3.length,
      results: hotels3
    };

    // Save JSON output
    const jsonPath = path.join(__dirname, 'results', 'test3-newyork-solo-json.json');
    fs.writeFileSync(jsonPath, JSON.stringify(test3Output, null, 2));
    console.log(`✅ Test 3 complete: ${hotels3.length} hotels found`);
    console.log(`📁 Saved to: ${jsonPath}\n`);
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
    fs.writeFileSync(
      path.join(__dirname, 'results', 'test3-newyork-error.txt'),
      `Error: ${error.message}\n${error.stack}`
    );
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ All tests completed!');
  console.log('📂 Results saved to: ./results/');
}

// Run tests
testHotelSearch().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
