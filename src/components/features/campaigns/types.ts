// Shared types for campaign detail sections

export interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  brand_id?: string;
  platform?: string;
  platforms?: string[];
  objective?: string;
  category?: string;
  rate_per_thousand?: number;
  rate_type?: string;
  fixed_fee?: number;
  total_budget?: number;
  budget_spent?: number;
  start_date?: string;
  end_date?: string;
  submission_deadline?: string;
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
  tone_style?: string;
  music_guidelines?: string;
  example_references?: string[];
  target_geography?: string[];
  target_languages?: string[];
  target_age_range?: {
    min: number;
    max: number;
  };
  target_gender?: string;
  audience_interests?: string[];
  usage_rights?: string;
  exclusivity?: {
    enabled: boolean;
    category_exclusive?: boolean;
  };
  legal_confirmations?: {
    platform_compliant?: boolean;
    no_unlicensed_assets?: boolean;
  };
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
  message_board_enabled?: boolean;
  shared_files?: {
    logos?: string[];
    brand_kit?: string[];
    example_content?: string[];
  };
  rules?: string;
  requirements?: string;
  tags?: string;
  created_at: string;
  submissions_count?: number;
}

export interface Submission {
  id: string;
  creator_name: string;
  creator_username?: string;
  creator_bio?: string | null;
  creator_website?: string | null;
  post_url: string;
  media_urls?: string[];
  status: string;
  views: number;
  created_at: string;
  feedback?: string;
  verified_at?: string;
}

export interface Announcement {
  id: string;
  campaign_id: string;
  brand_id: string;
  content: string;
  title?: string;
  is_pinned: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  brand_name?: string;
}

export interface CampaignSectionProps {
  campaign: Campaign;
  campaignId: string;
  activeSection: string;
  setActiveSection: (section: string) => void;
  sectionData: Partial<Campaign>;
  setSectionData: (data: Partial<Campaign> | ((prev: Partial<Campaign>) => Partial<Campaign>)) => void;
  editingSection: string | null;
  setEditingSection: (section: string | null) => void;
  savingSection: string | null;
  saveSection: (sectionName: string, data: Partial<Campaign>) => Promise<void>;
  startEditing: (sectionName: string) => void;
  cancelEditing: () => void;
}

export interface SectionValidation {
  isCompleted: boolean;
  getFieldStyle: (hasError: boolean) => string;
}
