# Hotel Search MCP Server Evaluations

This directory contains evaluation tests to verify that the MCP server enables LLMs to effectively answer complex, realistic questions about hotel searches.

## Evaluation File

- **hotel_search_eval.xml**: 10 comprehensive test questions covering various aspects of hotel search functionality

## How to Run Evaluations

### Step 1: Build the MCP Server

```bash
npm run build
```

### Step 2: Populate Evaluation Answers

The evaluation file (`hotel_search_eval.xml`) contains placeholder answers that need to be replaced with actual values from your API.

**To populate answers:**

1. Ensure your `.env` file has a valid `RAPID_API_KEY`
2. Manually test each question by running the server and executing the search_hotels tool
3. Record the correct answer for each question
4. Update the `<answer>` tags in the XML file with actual values

**Example:**
```xml
<!-- Before -->
<answer>REPLACE_WITH_ACTUAL_HOTEL_NAME</answer>

<!-- After testing -->
<answer>Hotel Plaza Athénée Paris</answer>
```

### Step 3: Run the Evaluation (Optional)

If you have the MCP evaluation harness available:

```bash
python .claude/skills/mcp-builder/scripts/evaluation.py \
  --server-path /path/to/drtrips-hotel-mcp/dist/index.js \
  --eval-file /path/to/drtrips-hotel-mcp/evaluations/hotel_search_eval.xml
```

## Evaluation Questions Coverage

The 10 questions test the agent's ability to:

1. **Basic Search & Rating**: Extract highest-rated hotel from search results
2. **Price Comparison**: Identify cheapest option and extract total price
3. **Family Travel**: Search with children parameters and find most-reviewed hotel
4. **Facility Information**: Count and analyze hotel amenities
5. **Multi-Room Booking**: Handle multiple rooms and extract per-night pricing
6. **Review Analysis**: Aggregate review counts across multiple hotels
7. **Accommodation Types**: Classify and count different property types
8. **Currency Handling**: Work with different currency codes (EUR, USD)
9. **Budget Calculations**: Compute averages across search results
10. **Check-in Times**: Extract and compare temporal information

## Why These Questions?

Each question is designed to:
- ✅ Be **independent** (not dependent on other questions)
- ✅ Use **read-only** operations (non-destructive)
- ✅ Be **complex** (requires careful data extraction and analysis)
- ✅ Be **realistic** (based on actual user needs)
- ✅ Have **verifiable answers** (single, clear answer)
- ✅ Be **stable** (answer format is consistent)

## Notes

- Questions use various destinations to test global coverage
- Different date ranges ensure the API handles various scenarios
- Multiple guest configurations (solo, couple, family, group) test flexibility
- Currency variations (USD, EUR) test internationalization
- The questions cover both simple extraction and analytical tasks

## Troubleshooting

If evaluation fails:
1. Verify your RAPID_API_KEY is valid and has quota
2. Check that the build completed successfully (`npm run build`)
3. Ensure dates in questions are in the future
4. Verify network connectivity to RapidAPI

## Future Improvements

Consider adding questions for:
- Specific area searches (e.g., "Manhattan, New York")
- Longer stays (weekly bookings)
- More complex child age scenarios
- Edge cases (maximum guests, maximum rooms)
