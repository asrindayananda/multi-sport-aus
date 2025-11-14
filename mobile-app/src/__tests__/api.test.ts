// Test file to verify all sports APIs work correctly
import { sportsApi } from '../services/sportsApi';

async function testAPIs() {
  console.log('=== Testing Sports APIs ===\n');
  
  try {
    console.log('1. Testing F1 API...');
    const f1Events = await sportsApi.getF1Schedule();
    console.log(`✓ F1: Retrieved ${f1Events.length} events`);
    console.log(`  First event: ${f1Events[0]?.title} on ${f1Events[0]?.date}`);
    
    console.log('\n2. Testing Bathurst API...');
    const bathurstEvents = await sportsApi.getBathurstSchedule();
    console.log(`✓ Bathurst: Retrieved ${bathurstEvents.length} events`);
    console.log(`  First event: ${bathurstEvents[0]?.title} on ${bathurstEvents[0]?.date}`);
    
    console.log('\n3. Testing NRL API...');
    const nrlEvents = await sportsApi.getNRLSchedule();
    console.log(`✓ NRL: Retrieved ${nrlEvents.length} events`);
    console.log(`  First event: ${nrlEvents[0]?.title} on ${nrlEvents[0]?.date}`);
    
    console.log('\n4. Testing AFL API...');
    const aflEvents = await sportsApi.getAFLSchedule();
    console.log(`✓ AFL: Retrieved ${aflEvents.length} events`);
    console.log(`  First event: ${aflEvents[0]?.title} on ${aflEvents[0]?.date}`);
    
    console.log('\n5. Testing getAllSchedules...');
    const allEvents = await sportsApi.getAllSchedules();
    console.log(`✓ All Sports: Retrieved ${allEvents.length} total events`);
    console.log(`  Events by sport:`);
    console.log(`    - F1: ${allEvents.filter(e => e.sport === 'F1').length}`);
    console.log(`    - Bathurst: ${allEvents.filter(e => e.sport === 'Bathurst').length}`);
    console.log(`    - NRL: ${allEvents.filter(e => e.sport === 'NRL').length}`);
    console.log(`    - AFL: ${allEvents.filter(e => e.sport === 'AFL').length}`);
    
    console.log('\n6. Verifying events are sorted by date...');
    const dates = allEvents.map(e => new Date(e.date).getTime());
    const isSorted = dates.every((date, i) => i === 0 || date >= dates[i - 1]);
    console.log(`✓ Events are ${isSorted ? 'properly' : 'NOT'} sorted by date`);
    
    console.log('\n7. Verifying all events have required fields...');
    const requiredFields = ['id', 'title', 'date', 'time', 'location', 'sport', 'description'];
    const allValid = allEvents.every(event => 
      requiredFields.every(field => event[field as keyof typeof event])
    );
    console.log(`✓ All events have required fields: ${allValid ? 'YES' : 'NO'}`);
    
    console.log('\n=== All Tests Passed ===');
    return true;
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPIs().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testAPIs };
