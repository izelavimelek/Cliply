import { getDatabase, Collections } from './mongodb';
import { Campaign, Submission, Profile, Brand, Snapshot, Payout, AuditLog, CampaignApplication, Announcement } from './mongodb/schemas';
import { ObjectId } from 'mongodb';

export async function createCampaign(campaignData: any): Promise<string> {
  const db = await getDatabase();
  const campaignsCollection = db.collection(Collections.CAMPAIGNS);

  console.log("createCampaign called with data:", JSON.stringify(campaignData, null, 2));

  const now = new Date();
  const captionCode = await generateCaptionCode();
  
  // Convert brand_id string to ObjectId
  const campaign: Omit<Campaign, '_id'> = {
    ...campaignData,
    brand_id: new ObjectId(campaignData.brand_id), // Convert string to ObjectId
    caption_code: captionCode,
    created_at: now,
    updated_at: now,
  };

  console.log("Campaign data to be inserted:", JSON.stringify(campaign, null, 2));

  const result = await campaignsCollection.insertOne(campaign);
  console.log("Campaign inserted with ID:", result.insertedId.toString());
  
  return result.insertedId.toString();
}

export async function getCampaigns(filters?: { status?: string; brand_id?: string; includeArchived?: boolean }): Promise<Campaign[]> {
  const db = await getDatabase();
  const campaignsCollection = db.collection(Collections.CAMPAIGNS);

  let query = {};
  
  // Handle archived campaigns filtering
  if (filters?.status === 'deleted') {
    query = { ...query, status: 'deleted' };
  } else if (filters?.includeArchived) {
    // Include all campaigns (both active and archived)
    // No status filter applied
  } else {
    // Default behavior: exclude deleted campaigns
    query = { ...query, status: { $ne: 'deleted' } };
  }
  
  if (filters?.status && filters.status !== 'deleted') {
    query = { ...query, status: filters.status };
  }
  
  if (filters?.brand_id) {
    try {
      // Check if brand_id is a valid ObjectId string
      if (ObjectId.isValid(filters.brand_id)) {
        query = { ...query, brand_id: new ObjectId(filters.brand_id) };
        console.log("Converting brand_id to ObjectId:", filters.brand_id, "->", new ObjectId(filters.brand_id));
      } else {
        console.log("Invalid brand_id format, skipping brand filter:", filters.brand_id);
        // Don't add brand_id filter if it's not a valid ObjectId
      }
    } catch (error) {
      console.error("Error converting brand_id to ObjectId:", error);
      // Don't return empty array, just skip the brand_id filter
      console.log("Skipping brand_id filter due to conversion error");
    }
  }

  console.log("getCampaigns query:", JSON.stringify(query, null, 2));

  const campaigns = await campaignsCollection.find(query).toArray();
  console.log("getCampaigns found campaigns:", campaigns.length);
  
  return campaigns as Campaign[];
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const db = await getDatabase();
  const campaignsCollection = db.collection(Collections.CAMPAIGNS);

  const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
  return campaign as Campaign | null;
}

export async function updateCampaign(id: string, updateData: Partial<Campaign>): Promise<Campaign | null> {
  const db = await getDatabase();
  const campaignsCollection = db.collection(Collections.CAMPAIGNS);

  const now = new Date();
  const updatePayload = {
    ...updateData,
    updated_at: now,
  };

  const result = await campaignsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );

  return result as Campaign | null;
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const db = await getDatabase();
  const campaignsCollection = db.collection(Collections.CAMPAIGNS);

  try {
    // Soft delete: update status to 'deleted' instead of removing the record
    const result = await campaignsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'deleted',
          updated_at: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result !== null;
  } catch (error) {
    console.error("Error soft deleting campaign:", error);
    return false;
  }
}

export async function restoreCampaign(id: string, newStatus: string = 'draft'): Promise<Campaign | null> {
  const db = await getDatabase();
  const campaignsCollection = db.collection(Collections.CAMPAIGNS);

  try {
    // Validate the new status
    const validStatuses = ['draft', 'active', 'pending_budget', 'paused', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    // Restore the campaign by changing status from 'deleted' to the new status
    const result = await campaignsCollection.findOneAndUpdate(
      { _id: new ObjectId(id), status: 'deleted' },
      { 
        $set: { 
          status: newStatus,
          updated_at: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result as Campaign | null;
  } catch (error) {
    console.error("Error restoring campaign:", error);
    return null;
  }
}

export async function createSubmission(submissionData: Omit<Submission, '_id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = await getDatabase();
  const submissionsCollection = db.collection(Collections.SUBMISSIONS);

  const now = new Date();
  const submission: Omit<Submission, '_id'> = {
    ...submissionData,
    created_at: now,
    updated_at: now,
  };

  const result = await submissionsCollection.insertOne(submission);
  return result.insertedId.toString();
}

export async function getSubmissions(filters?: { creator_id?: string; campaign_id?: string; status?: string }): Promise<Submission[]> {
  const db = await getDatabase();
  const submissionsCollection = db.collection(Collections.SUBMISSIONS);

  let query = {};
  if (filters?.creator_id) query = { ...query, creator_id: filters.creator_id };
  if (filters?.campaign_id) query = { ...query, campaign_id: new ObjectId(filters.campaign_id) };
  if (filters?.status) query = { ...query, status: filters.status };

  const submissions = await submissionsCollection.find(query).toArray();
  return submissions as Submission[];
}

export async function updateSubmission(id: string, updateData: Partial<Submission>): Promise<Submission | null> {
  const db = await getDatabase();
  const submissionsCollection = db.collection(Collections.SUBMISSIONS);

  try {
    const result = await submissionsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updated_at: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result as Submission | null;
  } catch (error) {
    console.error('Error updating submission:', error);
    return null;
  }
}

export async function createProfile(profileData: Omit<Profile, '_id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = await getDatabase();
  const profilesCollection = db.collection(Collections.PROFILES);

  const now = new Date();
  const profile: Omit<Profile, '_id'> = {
    ...profileData,
    created_at: now,
    updated_at: now,
  };

  const result = await profilesCollection.insertOne(profile);
  return result.insertedId.toString();
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const db = await getDatabase();
  const profilesCollection = db.collection(Collections.PROFILES);

  const profile = await profilesCollection.findOne({ user_id: userId });
  return profile as Profile | null;
}

export async function createBrand(brandData: Omit<Brand, '_id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = await getDatabase();
  const brandsCollection = db.collection(Collections.BRANDS);

  const now = new Date();
  const brand: Omit<Brand, '_id'> = {
    ...brandData,
    created_at: now,
    updated_at: now,
  };

  const result = await brandsCollection.insertOne(brand);
  return result.insertedId.toString();
}

export async function createSnapshot(snapshotData: Omit<Snapshot, '_id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = await getDatabase();
  const snapshotsCollection = db.collection(Collections.SNAPSHOTS);

  const now = new Date();
  const snapshot: Omit<Snapshot, '_id'> = {
    ...snapshotData,
    created_at: now,
    updated_at: now,
  };

  const result = await snapshotsCollection.insertOne(snapshot);
  return result.insertedId.toString();
}

export async function getSnapshots(submissionId: string): Promise<Snapshot[]> {
  const db = await getDatabase();
  const snapshotsCollection = db.collection(Collections.SNAPSHOTS);

  const snapshots = await snapshotsCollection.find({ submission_id: new ObjectId(submissionId) }).toArray();
  return snapshots as Snapshot[];
}

export async function createPayout(payoutData: Omit<Payout, '_id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = await getDatabase();
  const payoutsCollection = db.collection(Collections.PAYOUTS);

  const now = new Date();
  const payout: Omit<Payout, '_id'> = {
    ...payoutData,
    created_at: now,
    updated_at: now,
  };

  const result = await payoutsCollection.insertOne(payout);
  return result.insertedId.toString();
}

export async function getPayouts(creatorId?: string): Promise<Payout[]> {
  const db = await getDatabase();
  const payoutsCollection = db.collection(Collections.PAYOUTS);

  let query = {};
  if (creatorId) query = { creator_id: creatorId };

  const payouts = await payoutsCollection.find(query).toArray();
  return payouts as Payout[];
}

export async function generateCaptionCode(): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function logAuditEvent(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  const db = await getDatabase();
  const auditLogsCollection = db.collection(Collections.AUDIT_LOGS);

  const now = new Date();
  const auditLog: Omit<AuditLog, '_id'> = {
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details || {},
    created_at: now,
    updated_at: now,
  };

  await auditLogsCollection.insertOne(auditLog);
}

export async function getDeletedCampaigns(brand_id?: string): Promise<Campaign[]> {
  const db = await getDatabase();
  const campaignsCollection = db.collection(Collections.CAMPAIGNS);

  let query: any = { status: 'deleted' };
  
  if (brand_id) {
    try {
      query = { ...query, brand_id: new ObjectId(brand_id) };
    } catch (error) {
      console.error("Error converting brand_id to ObjectId:", error);
      return [];
    }
  }

  console.log("getDeletedCampaigns query:", JSON.stringify(query, null, 2));

  const campaigns = await campaignsCollection.find(query).toArray();
  console.log("getDeletedCampaigns found campaigns:", campaigns.length);
  
  return campaigns as Campaign[];
}

// Campaign Application functions
export async function createCampaignApplication(applicationData: Omit<CampaignApplication, '_id' | 'created_at' | 'updated_at' | 'applied_at'>): Promise<string> {
  try {
    const db = await getDatabase();
    console.log('Database connected, accessing collection:', Collections.CAMPAIGN_APPLICATIONS);
    
    const applicationsCollection = db.collection(Collections.CAMPAIGN_APPLICATIONS);
    console.log('Collection accessed successfully');

    const now = new Date();
    const application: Omit<CampaignApplication, '_id'> = {
      ...applicationData,
      applied_at: now,
      created_at: now,
      updated_at: now,
      ...(applicationData.status === 'approved' && { approved_at: now }),
    };

    console.log('Attempting to insert application:', application);
    const result = await applicationsCollection.insertOne(application);
    console.log('Application inserted successfully:', result.insertedId);
    return result.insertedId.toString();
  } catch (error) {
    console.error('Error creating campaign application:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // If collection doesn't exist, create it and try again
    if (error instanceof Error && (error.message.includes('collection') || error.message.includes('Expected'))) {
      try {
        console.log('Attempting to create collection and retry...');
        const db = await getDatabase();
        await db.createCollection(Collections.CAMPAIGN_APPLICATIONS);
        console.log('Collection created successfully');
        
        const applicationsCollection = db.collection(Collections.CAMPAIGN_APPLICATIONS);
        const now = new Date();
        const application: Omit<CampaignApplication, '_id'> = {
          ...applicationData,
          applied_at: now,
          created_at: now,
          updated_at: now,
          ...(applicationData.status === 'approved' && { approved_at: now }),
        };
        
        const result = await applicationsCollection.insertOne(application);
        console.log('Application inserted successfully on retry:', result.insertedId);
        return result.insertedId.toString();
      } catch (retryError) {
        console.error('Error on retry:', retryError);
        throw new Error('Failed to create campaign application after retry');
      }
    }
    throw new Error('Failed to create campaign application');
  }
}

export async function getCampaignApplications(filters?: { creator_id?: string; campaign_id?: string; status?: string }): Promise<CampaignApplication[]> {
  const db = await getDatabase();
  const applicationsCollection = db.collection(Collections.CAMPAIGN_APPLICATIONS);

  let query = {};
  if (filters?.creator_id) query = { ...query, creator_id: filters.creator_id };
  if (filters?.campaign_id) query = { ...query, campaign_id: new ObjectId(filters.campaign_id) };
  if (filters?.status) query = { ...query, status: filters.status };

  console.log('getCampaignApplications query:', query);

  try {
    const applications = await applicationsCollection.find(query).toArray();
    console.log('getCampaignApplications found:', applications.length, 'applications');
    return applications as CampaignApplication[];
  } catch (error) {
    // If collection doesn't exist, return empty array
    console.log('Campaign applications collection not found, returning empty array');
    return [];
  }
}

export async function updateCampaignApplication(id: string, updateData: Partial<CampaignApplication>): Promise<CampaignApplication | null> {
  const db = await getDatabase();
  const applicationsCollection = db.collection(Collections.CAMPAIGN_APPLICATIONS);

  const now = new Date();
  const updatePayload = {
    ...updateData,
    updated_at: now,
  };

  try {
    const result = await applicationsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );

    return result as CampaignApplication | null;
  } catch (error) {
    console.error('Error updating campaign application:', error);
    return null;
  }
}

// Announcement functions
export async function createAnnouncement(announcementData: Omit<Announcement, '_id' | 'created_at' | 'updated_at'>): Promise<string> {
  try {
    const db = await getDatabase();
    const announcementsCollection = db.collection('announcements');
    
    const now = new Date();
    const announcement: Omit<Announcement, '_id'> = {
      ...announcementData,
      created_at: now,
      updated_at: now,
    };

    const result = await announcementsCollection.insertOne(announcement);
    return result.insertedId.toString();
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw new Error('Failed to create announcement');
  }
}

export async function getAnnouncements(filters?: { campaign_id?: string; brand_id?: string; creator_id?: string }): Promise<Announcement[]> {
  try {
    const db = await getDatabase();
    const announcementsCollection = db.collection('announcements');

    let query = {};
    if (filters?.campaign_id) query = { ...query, campaign_id: new ObjectId(filters.campaign_id) };
    if (filters?.brand_id) query = { ...query, brand_id: new ObjectId(filters.brand_id) };

    // If creator_id is provided, we need to check if they're part of the campaign
    if (filters?.creator_id) {
      const applications = await getCampaignApplications({ creator_id: filters.creator_id, status: 'approved' });
      const campaignIds = applications.map(app => app.campaign_id);
      query = { ...query, campaign_id: { $in: campaignIds } };
    }

    const announcements = await announcementsCollection
      .find(query)
      .sort({ is_pinned: -1, created_at: -1 }) // Pinned first, then by date
      .toArray();

    // Get brand names for announcements
    const brandsCollection = db.collection(Collections.BRANDS);
    const brandIds = [...new Set(announcements.map(a => a.brand_id))];
    const brands = await brandsCollection.find({ _id: { $in: brandIds } }).toArray();
    const brandMap = new Map(brands.map(b => [b._id.toString(), b.name]));

    return announcements.map(announcement => ({
      ...announcement,
      id: announcement._id?.toString() || '',
      campaign_id: announcement.campaign_id.toString(),
      brand_id: announcement.brand_id.toString(),
      brand_name: brandMap.get(announcement.brand_id.toString()),
      created_at: announcement.created_at.toISOString(),
      updated_at: announcement.updated_at.toISOString(),
    })) as Announcement[];
  } catch (error) {
    console.error('Error getting announcements:', error);
    return [];
  }
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  try {
    const db = await getDatabase();
    const announcementsCollection = db.collection('announcements');

    const announcement = await announcementsCollection.findOne({ _id: new ObjectId(id) });
    if (!announcement) return null;

    // Get brand name
    const brandsCollection = db.collection(Collections.BRANDS);
    const brand = await brandsCollection.findOne({ _id: announcement.brand_id });
    
    return {
      ...announcement,
      id: announcement._id?.toString() || '',
      campaign_id: announcement.campaign_id.toString(),
      brand_id: announcement.brand_id.toString(),
      brand_name: brand?.name,
      created_at: announcement.created_at.toISOString(),
      updated_at: announcement.updated_at.toISOString(),
    } as Announcement;
  } catch (error) {
    console.error('Error getting announcement:', error);
    return null;
  }
}

export async function updateAnnouncement(id: string, updateData: Partial<Announcement>): Promise<Announcement | null> {
  try {
    const db = await getDatabase();
    const announcementsCollection = db.collection('announcements');

    const now = new Date();
    const updatePayload = {
      ...updateData,
      updated_at: now,
    };

    const result = await announcementsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    // Get brand name
    const brandsCollection = db.collection(Collections.BRANDS);
    const brand = await brandsCollection.findOne({ _id: result.brand_id });

    return {
      ...result,
      id: result._id?.toString() || '',
      campaign_id: result.campaign_id.toString(),
      brand_id: result.brand_id.toString(),
      brand_name: brand?.name,
      created_at: result.created_at.toISOString(),
      updated_at: result.updated_at.toISOString(),
    } as Announcement;
  } catch (error) {
    console.error('Error updating announcement:', error);
    return null;
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const announcementsCollection = db.collection('announcements');

    const result = await announcementsCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return false;
  }
}
