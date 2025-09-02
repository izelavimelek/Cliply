import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

// Schema for new campaign creation (basic fields only)
export const newCampaignCreateSchema = z.object({
  brand_id: z.string().min(1).optional(), // Made optional since API provides it from auth
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  platforms: z.array(z.enum(["youtube", "tiktok", "instagram", "linkedin"])).min(1),
  platform: z.enum(["youtube", "tiktok", "instagram", "linkedin"]).optional(), // For backward compatibility
  thumbnail: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  created_at: z.string().optional(),
});

export const campaignCreateSchema = z.object({
  brand_id: z.string().min(1).optional(), // Made optional since API provides it from auth
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  platforms: z.array(z.enum(["youtube", "tiktok", "instagram"])).min(1),
  platform: z.enum(["youtube", "tiktok", "instagram"]).optional(), // For backward compatibility
  
  // Enhanced rate structure
  rate_type: z.enum(["per_thousand_views", "fixed_fee", "hybrid", "commission"]),
  rate_per_thousand: z.number().nonnegative().optional(),
  fixed_fee: z.number().nonnegative().optional(),
  commission_percentage: z.number().min(1).max(100).optional(),
  base_rate: z.number().nonnegative().optional(),
  performance_bonus: z.number().nonnegative().optional(),
  
  total_budget: z.number().nonnegative(),
  start_date: z.string().min(1), // Changed from datetime to string for date inputs
  end_date: z.string().min(1), // Changed from datetime to string for date inputs
  
  // Campaign configuration
  objective: z.enum(["awareness", "engagement", "conversions", "ugc", "other"]).optional(),
  category: z.string().max(50).optional(),
  
  // Content requirements
  deliverable_quantity: z.object({
    clips: z.number().min(0).optional(),
    long_videos: z.number().min(0).optional(),
    images: z.number().min(0).optional(),
  }).optional(),
  
  required_elements: z.object({
    logo_placement: z.boolean().optional(),
    logo_instructions: z.string().optional(),
    logo_duration: z.number().min(1).max(60).optional(),
    brand_mention: z.boolean().optional(),
    brand_phrase: z.string().optional(),
    mention_timing: z.string().optional(),
    call_to_action: z.boolean().optional(),
    cta_type: z.string().optional(),
    cta_text: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    hashtag_placement: z.string().optional(),
    additional_requirements: z.string().optional(),
  }).optional(),
  
  prohibited_content: z.object({
    competitor_brands: z.boolean().optional(),
    profanity: z.boolean().optional(),
    political: z.boolean().optional(),
    custom: z.array(z.string()).optional(),
  }).optional(),
  
  tone_style: z.string().optional(),
  music_guidelines: z.string().optional(),
  example_references: z.array(z.string()).optional(),
  
  rules: z.string().max(5000).optional(),
  requirements: z.string().max(5000).optional(),
  tags: z.string().max(200).optional(),
  thumbnail: z.string().optional(), // Added thumbnail field
  status: z.enum(["draft", "active", "paused", "completed"]), // Made required
  created_at: z.string().optional(),
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

export const submissionCreateSchema = z.object({
  campaign_id: z.string().min(1),
  post_url: z.string().url(),
  note: z.string().max(2000).optional(),
});

export type NewCampaignCreateInput = z.infer<typeof newCampaignCreateSchema>;
export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
export type SubmissionCreateInput = z.infer<typeof submissionCreateSchema>;
