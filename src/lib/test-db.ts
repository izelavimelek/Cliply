import { getDatabase, Collections } from './mongodb';
import { ObjectId } from 'mongodb';

export async function testDatabaseConnection() {
  try {
    const db = await getDatabase();
    console.log('Database connected successfully');
    
    // Test if we can access the collection
    const applicationsCollection = db.collection(Collections.CAMPAIGN_APPLICATIONS);
    console.log('Collection accessed successfully');
    
    // Test a simple operation
    const count = await applicationsCollection.countDocuments();
    console.log(`Collection has ${count} documents`);
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
