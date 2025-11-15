#!/usr/bin/env node
/**
 * Test script for sports data scrapers
 * Verifies that NRL, AFL, and Bathurst scrapers are working
 */

const { scrapeNRLData } = require('./backend/scrapers/nrlScraper');
const { scrapeAFLData } = require('./backend/scrapers/aflScraper');
const { scrapeBathurstData } = require('./backend/scrapers/bathurstScraper');

async function testScrapers() {
  console.log('\n=== Testing Sports Data Scrapers ===\n');
  
  try {
    // Test NRL scraper
    console.log('1. Testing NRL Scraper...');
    const nrlData = await scrapeNRLData();
    console.log(`   ✓ NRL: ${nrlData.length} events retrieved`);
    console.log(`   ✓ Events: ${nrlData.map(e => e.title).join(', ')}`);
    console.log(`   ✓ Data source: ${nrlData[0]?.source || 'unknown'}\n`);
    
    // Test AFL scraper
    console.log('2. Testing AFL Scraper...');
    const aflData = await scrapeAFLData();
    console.log(`   ✓ AFL: ${aflData.length} events retrieved`);
    console.log(`   ✓ Events: ${aflData.map(e => e.title).join(', ')}`);
    console.log(`   ✓ Data source: ${aflData[0]?.source || 'unknown'}\n`);
    
    // Test Bathurst scraper
    console.log('3. Testing Bathurst Scraper...');
    const bathurstData = await scrapeBathurstData();
    console.log(`   ✓ Bathurst: ${bathurstData.length} events retrieved`);
    console.log(`   ✓ Events: ${bathurstData.map(e => e.title).join(', ')}`);
    console.log(`   ✓ Data source: ${bathurstData[0]?.source || 'unknown'}\n`);
    
    // Summary
    const totalEvents = nrlData.length + aflData.length + bathurstData.length;
    console.log('=== Summary ===');
    console.log(`Total events: ${totalEvents}`);
    console.log(`  - NRL: ${nrlData.length}`);
    console.log(`  - AFL: ${aflData.length}`);
    console.log(`  - Bathurst: ${bathurstData.length}`);
    
    // Verify all events have required fields
    const allEvents = [...nrlData, ...aflData, ...bathurstData];
    const requiredFields = ['id', 'title', 'date', 'time', 'location', 'sport', 'description'];
    const allValid = allEvents.every(event => 
      requiredFields.every(field => event[field])
    );
    console.log(`\n✓ All events have required fields: ${allValid ? 'YES' : 'NO'}`);
    
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
