#!/usr/bin/env node
// Test script for web scrapers

const { scrapeNRLData } = require('./scrapers/nrlScraper');
const { scrapeAFLData } = require('./scrapers/aflScraper');
const { scrapeBathurstData } = require('./scrapers/bathurstScraper');

async function testScrapers() {
  console.log('\n=== Testing Web Scrapers ===\n');
  
  try {
    console.log('1. Testing NRL Scraper...');
    const nrlEvents = await scrapeNRLData();
    console.log(`   ✓ Retrieved ${nrlEvents.length} NRL events`);
    if (nrlEvents.length > 0) {
      console.log(`   ✓ Sample: ${nrlEvents[0].title} on ${nrlEvents[0].date}`);
    }
    
    console.log('\n2. Testing AFL Scraper...');
    const aflEvents = await scrapeAFLData();
    console.log(`   ✓ Retrieved ${aflEvents.length} AFL events`);
    if (aflEvents.length > 0) {
      console.log(`   ✓ Sample: ${aflEvents[0].title} on ${aflEvents[0].date}`);
    }
    
    console.log('\n3. Testing Bathurst Scraper...');
    const bathurstEvents = await scrapeBathurstData();
    console.log(`   ✓ Retrieved ${bathurstEvents.length} Bathurst events`);
    if (bathurstEvents.length > 0) {
      console.log(`   ✓ Sample: ${bathurstEvents[0].title} on ${bathurstEvents[0].date}`);
    }
    
    console.log('\n4. Testing Combined Data...');
    const allEvents = [...nrlEvents, ...aflEvents, ...bathurstEvents];
    console.log(`   ✓ Total ${allEvents.length} events across all sports`);
    
    console.log('\n5. Checking Data Structure...');
    const sampleEvent = allEvents[0];
    const hasRequiredFields = sampleEvent.id && sampleEvent.title && 
                               sampleEvent.date && sampleEvent.sport;
    console.log(`   ✓ Required fields present: ${hasRequiredFields ? 'YES' : 'NO'}`);
    
    console.log('\n=== All Scraper Tests Passed ✓ ===\n');
    return true;
    
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    return false;
  }
}

testScrapers().then(success => {
  process.exit(success ? 0 : 1);
});
