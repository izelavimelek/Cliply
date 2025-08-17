import { ObjectId } from 'mongodb';

// Base interface for MongoDB documents
export interface BaseDocument {
  _id?: ObjectId;
  created_at: Date;
  updated_at: Date;
}

// Profile schema
export interface Profile extends BaseDocument {
  user_id: string;
  email: string;
  password: string; // Add password field for authentication
  display_name?: string;
  role?: 'creator' | 'brand' | 'admin';
  is_admin?: boolean;
  bio?: string;
  website?: string;
  social_links?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

// Brand schema
export interface Brand extends BaseDocument {
  owner_id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
}

// Campaign schema
export interface Campaign extends BaseDocument {
  brand_id: ObjectId;
  title: string;
  description: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  rate_per_thousand: number;
  total_budget: number;
  budget_spent?: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: Date;
  end_date?: Date;
  rules?: string;
  caption_code: string;
  requirements?: string[];
}

// Submission schema
export interface Submission extends BaseDocument {
  campaign_id: ObjectId;
  creator_id: string;
  post_url: string;
  status: 'pending' | 'approved' | 'rejected';
  views?: number;
  earnings?: number;
  feedback?: string;
  verified_at?: Date;
}

// Snapshot schema
export interface Snapshot extends BaseDocument {
  submission_id: ObjectId;
  views: number;
  likes?: number;
  comments?: number;
  shares?: number;
  engagement_rate?: number;
  captured_at: Date;
}

// Payout schema
export interface Payout extends BaseDocument {
  creator_id: string;
  submission_id: ObjectId;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripe_payment_intent_id?: string;
  processed_at?: Date;
}

// Webhook schema
export interface Webhook extends BaseDocument {
  type: string;
  payload: Record<string, any>;
  status: 'pending' | 'processed' | 'failed';
  attempts: number;
  processed_at?: Date;
  error_message?: string;
}

// Audit log schema
export interface AuditLog extends BaseDocument {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// User authentication schema (for JWT tokens)
export interface User {
  id: string;
  email: string;
  role?: 'creator' | 'brand' | 'admin';
  is_admin?: boolean;
}

// Database collections
export const Collections = {
  PROFILES: 'profiles',
  BRANDS: 'brands',
  CAMPAIGNS: 'campaigns',
  SUBMISSIONS: 'submissions',
  SNAPSHOTS: 'snapshots',
  PAYOUTS: 'payouts',
  WEBHOOKS: 'webhooks',
  AUDIT_LOGS: 'audit_logs',
} as const;
