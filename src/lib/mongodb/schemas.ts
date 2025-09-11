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
  brand_name?: string; // Brand name for brand accounts
  bio?: string;
  website?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  social_links?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

// Campaign schema
export interface Campaign extends BaseDocument {
  brand_id: ObjectId;
  
  // Campaign Overview
  title: string;
  objective?: 'awareness' | 'engagement' | 'conversions' | 'ugc' | 'other';
  platforms: string[]; // ['tiktok', 'youtube', 'instagram']
  platform?: 'youtube' | 'tiktok' | 'instagram'; // Keep for backward compatibility
  category?: string; // Gaming, Fashion, Food, etc.
  description: string;
  
  // Budget & Timeline
  total_budget?: number;
  budget_spent?: number;
  budget?: number;
  rate_type?: 'per_thousand_views' | 'fixed_fee' | 'hybrid' | 'commission';
  rate_per_thousand?: number;
  fixed_fee?: number;
  commission_percentage?: number;
  base_rate?: number;
  performance_bonus?: number;
  start_date?: string;
  end_date?: string;
  submission_deadline?: string;
  
  // Content Requirements - Mandatory
  deliverable_quantity?: {
    clips?: number;
    long_videos?: number;
    images?: number;
  };
  required_elements?: {
    logo_placement?: boolean;
    logo_instructions?: string;
    logo_duration?: number;
    brand_mention?: boolean;
    brand_phrase?: string;
    mention_timing?: string;
    call_to_action?: boolean;
    cta_type?: string;
    cta_text?: string;
    hashtags?: string[];
    hashtag_placement?: string;
    additional_requirements?: string;
  };
  prohibited_content?: {
    competitor_brands?: boolean;
    profanity?: boolean;
    political?: boolean;
    custom?: string[];
  };
  
  // Content Requirements - Optional
  tone_style?: 'fun' | 'cinematic' | 'educational' | 'professional' | 'casual';
  music_guidelines?: string;
  example_references?: string[];
  
  // Audience Targeting - Mandatory
  target_geography?: string[];
  target_languages?: string[];
  target_age_range?: {
    min: number;
    max: number;
  };
  
  // Audience Targeting - Optional
  target_gender?: 'all' | 'male' | 'female' | 'non_binary';
  audience_interests?: string[];
  
  // Agreements & Compliance
  usage_rights?: 'organic_only' | 'ads_allowed' | 'full_commercial';
  exclusivity?: {
    enabled: boolean;
    category_exclusive?: boolean;
  };
  legal_confirmations?: {
    platform_compliant?: boolean;
    no_unlicensed_assets?: boolean;
  };
  
  // Analytics (Post-launch)
  analytics?: {
    views?: number;
    engagement_rate?: number;
    ctr?: number;
    cpm?: number;
    cpc?: number;
    cpa?: number;
    roi?: number;
    platform_breakdown?: Record<string, any>;
  };
  
  // Communication & Assets
  message_board_enabled?: boolean;
  shared_files?: {
    logos?: string[];
    brand_kit?: string[];
    example_content?: string[];
  };
  
  // Legacy fields
  type?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget_status: 'pending' | 'funded' | 'insufficient';
  deadline?: Date;
  rules?: string;
  caption_code?: string;
  requirements?: string;
  tags?: string;
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

// Campaign Application schema (creators joining campaigns)
export interface CampaignApplication extends BaseDocument {
  campaign_id: ObjectId;
  creator_id: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: Date;
  approved_at?: Date;
  rejected_at?: Date;
  notes?: string;
}

// Submission schema
export interface Submission extends BaseDocument {
  campaign_id: ObjectId;
  creator_id: string;
  post_url: string;
  media_urls?: string[]; // Array of media file URLs
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

// Announcement schema
export interface Announcement extends BaseDocument {
  campaign_id: ObjectId;
  brand_id: ObjectId;
  content: string;
  title?: string;
  is_pinned: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  created_by: string; // brand user_id
  updated_by?: string;
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
  CAMPAIGN_APPLICATIONS: 'campaign_applications',
  SUBMISSIONS: 'submissions',
  SNAPSHOTS: 'snapshots',
  PAYOUTS: 'payouts',
  WEBHOOKS: 'webhooks',
  AUDIT_LOGS: 'audit_logs',
  ANNOUNCEMENTS: 'announcements',
} as const;
