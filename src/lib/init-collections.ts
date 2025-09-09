import { getDatabase } from './mongodb';
import { Collections } from './mongodb/schemas';

export async function initializeCollections() {
  try {
    const db = await getDatabase();
    
    // Create campaign_applications collection if it doesn't exist
    const collections = await db.listCollections({ name: Collections.CAMPAIGN_APPLICATIONS }).toArray();
    
    if (collections.length === 0) {
      console.log('Creating campaign_applications collection...');
      await db.createCollection(Collections.CAMPAIGN_APPLICATIONS);
      console.log('campaign_applications collection created successfully');
    } else {
      console.log('campaign_applications collection already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing collections:', error);
    return false;
  }
}
