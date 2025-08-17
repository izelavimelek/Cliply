import { getDatabase, Collections } from './mongodb';
import { Campaign, Submission, Profile, Brand, Snapshot, Payout, AuditLog } from './mongodb/schemas';
import { ObjectId } from 'mongodb';

export async function createCampaign(campaignData: Omit<Campaign, '_id' | 'created_at' | 'updated_at' | 'caption_code'>): Promise<string> {
  const db = await getDatabase();
  const campaignsCollection = db.collection(Collections.CAMPAIGNS);

  const now = new Date();
  const captionCode = await generateCaptionCode();
  
  const campaign: Omit<Campaign, '_id'> = {
    ...campaignData,
    caption_code: captionCode,
    created_at: now,
    updated_at: now,
  };

  const result = await campaignsCollection.insertOne(campaign);
  return result.insertedId.toString();
}

export async function getCampaigns(filters?: { status?: string; brand_id?: string }): Promise<Campaign[]> {
  const db = await getDatabase();
  const campaignsCollection = db.collection(Collections.CAMPAIGNS);

  let query = {};
  if (filters?.status) query = { ...query, status: filters.status };
  if (filters?.brand_id) query = { ...query, brand_id: new ObjectId(filters.brand_id) };

  const campaigns = await campaignsCollection.find(query).toArray();
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
