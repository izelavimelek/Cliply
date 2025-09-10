import { getDatabase, Collections } from './mongodb';

export async function getBrandIdForUser(userId: string): Promise<string | null> {
  try {
    const db = await getDatabase();
    const brandsCollection = db.collection(Collections.BRANDS);
    
    const brand = await brandsCollection.findOne({ owner_id: userId });
    return brand ? brand._id.toString() : null;
  } catch (error) {
    console.error('Error getting brand ID for user:', error);
    return null;
  }
}
