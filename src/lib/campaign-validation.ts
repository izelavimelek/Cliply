import { z } from "zod";

// Define the campaign data structure based on the existing schema
export interface CampaignData {
  title?: string;
  description?: string;
  platform?: string;
  platforms?: string[];
  objective?: string;
  category?: string;
  rate_type?: string;
  rate_per_thousand?: number;
  fixed_fee?: number;
  commission_percentage?: number;
  base_rate?: number;
  performance_bonus?: number;
  total_budget?: number;
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
    hashtag_requirements?: boolean;
    required_hashtags?: string;
    min_hashtags?: number;
    hashtag_placement?: string;
    hashtag_instructions?: string;
    hashtags?: string[];
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
    enabled?: boolean;
    category_exclusive?: boolean;
  };
  legal_confirmations?: {
    platform_compliant?: boolean;
    no_unlicensed_assets?: boolean;
  };
  rules?: string;
  requirements?: string;
  tags?: string;
}

// Section validation schemas
const campaignOverviewSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  platforms: z.array(z.string()).min(1),
  objective: z.string().min(1),
  category: z.string().min(1),
});

const budgetTimelineSchema = z.object({
  rate_type: z.string().min(1),
  total_budget: z.number().min(10),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
}).refine((data) => {
  // Validate rate-specific fields
  if (data.rate_type === 'per_thousand_views') {
    return true; // rate_per_thousand will be validated separately
  }
  if (data.rate_type === 'fixed_fee') {
    return true; // fixed_fee will be validated separately
  }
  if (data.rate_type === 'hybrid') {
    return true; // base_rate and performance_bonus will be validated separately
  }
  if (data.rate_type === 'commission') {
    return true; // commission_percentage will be validated separately
  }
  return true;
}).refine((data) => {
  // Validate date range
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) < new Date(data.end_date);
  }
  return true;
}, "End date must be after start date");

const contentRequirementsSchema = z.object({
  requirements: z.string().optional(),
  rules: z.string().optional(),
  tags: z.string().optional(),
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
    hashtag_requirements: z.boolean().optional(),
    required_hashtags: z.string().optional(),
    min_hashtags: z.number().min(1).max(30).optional(),
    hashtag_placement: z.string().optional(),
    hashtag_instructions: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
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
});

const audienceTargetingSchema = z.object({
  target_geography: z.array(z.string()).optional(),
  target_languages: z.array(z.string()).optional(),
  target_age_range: z.object({
    min: z.number().min(13).max(100),
    max: z.number().min(13).max(100),
  }).optional(),
  target_gender: z.string().optional(),
  audience_interests: z.array(z.string()).optional(),
});

const agreementsComplianceSchema = z.object({
  usage_rights: z.string().min(1),
  exclusivity: z.object({
    enabled: z.boolean().optional(),
    category_exclusive: z.boolean().optional(),
  }),
  legal_confirmations: z.object({
    platform_compliant: z.boolean().refine(val => val === true, "Platform compliance confirmation required"),
    no_unlicensed_assets: z.boolean().refine(val => val === true, "Asset licensing confirmation required"),
  }),
});

// Section validation functions
export function validateCampaignOverview(data: CampaignData): boolean {
  try {
    // Handle both platform (string) and platforms (string[]) fields
    const platforms = data.platforms || (data.platform ? [data.platform] : []);
    
    campaignOverviewSchema.parse({
      title: data.title,
      description: data.description,
      platforms: platforms,
      objective: data.objective,
      category: data.category,
    });
    
    return true;
  } catch (error) {
    return false;
  }
}

export function validateBudgetTimeline(data: CampaignData): boolean {
  try {
    // First validate the basic structure
    const basicValidation = budgetTimelineSchema.parse({
      rate_type: data.rate_type,
      total_budget: data.total_budget,
      start_date: data.start_date,
      end_date: data.end_date,
    });

    // Then validate rate-specific fields
    if (data.rate_type === 'per_thousand_views') {
      return data.rate_per_thousand !== undefined && data.rate_per_thousand > 0;
    }
    if (data.rate_type === 'fixed_fee') {
      return data.fixed_fee !== undefined && data.fixed_fee >= 1;
    }
    if (data.rate_type === 'hybrid') {
      return data.base_rate !== undefined && data.base_rate >= 1 && 
             data.performance_bonus !== undefined && data.performance_bonus > 0;
    }
    if (data.rate_type === 'commission') {
      return data.commission_percentage !== undefined && 
             data.commission_percentage >= 1 && data.commission_percentage <= 100;
    }
    
    return true;
  } catch {
    return false;
  }
}

export function validateContentRequirements(campaign: any): boolean {
  if (!campaign) return false;
  
  try {
    contentRequirementsSchema.parse({
      requirements: campaign.requirements,
      rules: campaign.rules,
      tags: campaign.tags,
      deliverable_quantity: campaign.deliverable_quantity,
      required_elements: campaign.required_elements,
      prohibited_content: campaign.prohibited_content,
      tone_style: campaign.tone_style,
      music_guidelines: campaign.music_guidelines,
    });
    
    // For content requirements, we need ALL 7 required fields to be completed:
    // 3 Deliverable Quantity fields + 4 Required Elements fields
    
    // Deliverable Quantity (3 required fields)
    const hasClips = campaign.deliverable_quantity?.clips && campaign.deliverable_quantity.clips > 0;
    const hasLongVideos = campaign.deliverable_quantity?.long_videos && campaign.deliverable_quantity.long_videos > 0;
    const hasImages = campaign.deliverable_quantity?.images && campaign.deliverable_quantity.images > 0;
    
    // Required Elements (4 required fields)
    const hasLogoPlacement = campaign.required_elements?.logo_placement;
    const hasBrandMention = campaign.required_elements?.brand_mention;
    const hasCallToAction = campaign.required_elements?.call_to_action;
    const hasHashtagRequirements = campaign.required_elements?.hashtag_requirements;
    
    // ALL 7 required fields must be completed
    return hasClips && hasLongVideos && hasImages && 
           hasLogoPlacement && hasBrandMention && hasCallToAction && hasHashtagRequirements;
  } catch {
    return false;
  }
}

export function validateAudienceTargeting(data: CampaignData): boolean {
  try {
    audienceTargetingSchema.parse({
      target_geography: data.target_geography,
      target_languages: data.target_languages,
      target_age_range: data.target_age_range,
      target_gender: data.target_gender,
      audience_interests: data.audience_interests,
    });

    // At least one targeting criterion should be specified
    const hasTargeting = !!(
      (data.target_geography && data.target_geography.length > 0) ||
      (data.target_languages && data.target_languages.length > 0) ||
      (data.target_age_range && data.target_age_range.min && data.target_age_range.max) ||
      (data.target_gender && data.target_gender !== "all") ||
      (data.audience_interests && data.audience_interests.length > 0)
    );

    return hasTargeting;
  } catch {
    return false;
  }
}

export function validateAgreementsCompliance(data: CampaignData): boolean {
  try {
    agreementsComplianceSchema.parse({
      usage_rights: data.usage_rights,
      exclusivity: data.exclusivity,
      legal_confirmations: data.legal_confirmations,
    });
    return true;
  } catch {
    return false;
  }
}

// Main validation function that returns completion status for all sections
export function getCampaignSectionCompletionStatus(data: CampaignData) {
  return {
    'campaign-overview': validateCampaignOverview(data),
    'budget-timeline': validateBudgetTimeline(data),
    'content-requirements': validateContentRequirements(data),
    'audience-targeting': validateAudienceTargeting(data),
    'agreements-compliance': validateAgreementsCompliance(data),
    'assets': true, // Assets section is always considered complete for now
  };
}

// Helper function to get completion count
export function getCampaignCompletionCount(data: CampaignData): { completed: number; total: number } {
  const status = getCampaignSectionCompletionStatus(data);
  const completed = Object.values(status).filter(Boolean).length;
  const total = Object.keys(status).length;
  
  return { completed, total };
}

// Helper function to check if campaign is fully complete
export function isCampaignComplete(data: CampaignData): boolean {
  const status = getCampaignSectionCompletionStatus(data);
  return Object.values(status).every(Boolean);
}

// Granular progress calculation functions for individual subsections
export function getCampaignOverviewProgress(data: CampaignData): { completed: number; total: number } {
  let completed = 0;
  const total = 5;

  // Campaign Basics subsections
  if (data.title && data.title.length >= 5) completed++;
  if (data.description && data.description.length >= 10) completed++;

  // Campaign Targeting subsections  
  if (data.objective) completed++;
  if (data.platforms && data.platforms.length > 0) completed++;
  if (data.category) completed++;

  return { completed, total };
}

export function getBudgetTimelineProgress(data: CampaignData): { completed: number; total: number } {
  let completed = 0;
  const total = 5;

  if (data.total_budget && data.total_budget > 0) completed++;
  if (data.rate_type) completed++;
  // Rate amount is now mandatory based on rate type
  if (data.rate_type === 'per_thousand' && data.rate_per_thousand && data.rate_per_thousand > 0) completed++;
  else if (data.rate_type === 'fixed_fee' && data.fixed_fee && data.fixed_fee > 0) completed++;
  // Timeline fields are now mandatory
  if (data.start_date) completed++;
  if (data.end_date) completed++;

  return { completed, total };
}

export function getContentRequirementsProgress(data: CampaignData): { completed: number; total: number } {
  let completed = 0;
  const total = 7; // Count individual required fields with asterisks

  // Deliverable Quantity (3 required fields with *)
  if (data.deliverable_quantity?.clips && data.deliverable_quantity.clips > 0) completed++;
  if (data.deliverable_quantity?.long_videos && data.deliverable_quantity.long_videos > 0) completed++;
  if (data.deliverable_quantity?.images && data.deliverable_quantity.images > 0) completed++;

  // Required Elements (4 required fields with *)
  if (data.required_elements?.logo_placement) completed++;
  if (data.required_elements?.brand_mention) completed++;
  if (data.required_elements?.call_to_action) completed++;
  if (data.required_elements?.hashtag_requirements) completed++;

  return { completed, total };
}

export function getAudienceTargetingProgress(data: CampaignData): { completed: number; total: number } {
  let completed = 0;
  const total = 3; // Geography, Languages, Age Range (mandatory)

  // 1. Geography/Regions
  if (data.target_geography && data.target_geography.length > 0) completed++;

  // 2. Languages
  if (data.target_languages && data.target_languages.length > 0) completed++;

  // 3. Age Range
  if (data.target_age_range && 
      data.target_age_range.min && 
      data.target_age_range.max) completed++;

  return { completed, total };
}

export function getAgreementsComplianceProgress(data: CampaignData): { completed: number; total: number } {
  let completed = 0;
  const total = 5;

  // Usage rights
  if (data.usage_rights && data.usage_rights.length > 0) completed++;

  // Exclusivity settings
  if (data.exclusivity && typeof data.exclusivity.enabled === 'boolean') completed++;
  if (data.exclusivity && typeof data.exclusivity.category_exclusive === 'boolean') completed++;

  // Legal confirmations
  if (data.legal_confirmations && data.legal_confirmations.platform_compliant === true) completed++;
  if (data.legal_confirmations && data.legal_confirmations.no_unlicensed_assets === true) completed++;

  return { completed, total };
}

// Debug function to get detailed validation errors for each section
export function getDetailedValidationErrors(data: CampaignData) {
  const errors: Record<string, string[]> = {};

  // Campaign Overview validation
  const platforms = data.platforms || (data.platform ? [data.platform] : []);
  try {
    campaignOverviewSchema.parse({
      title: data.title,
      description: data.description,
      platforms: platforms,
      objective: data.objective,
      category: data.category,
    });
  } catch (error) {
    errors['campaign-overview'] = error instanceof Error ? [error.message] : ['Validation failed'];
  }
  if (!data.title) errors['campaign-overview'] = [...(errors['campaign-overview'] || []), 'Title is required'];
  if (!data.description || data.description.length < 10) errors['campaign-overview'] = [...(errors['campaign-overview'] || []), 'Description must be at least 10 characters'];
  if (platforms.length === 0) errors['campaign-overview'] = [...(errors['campaign-overview'] || []), 'At least one platform is required'];
  if (!data.objective) errors['campaign-overview'] = [...(errors['campaign-overview'] || []), 'Objective is required'];
  if (!data.category) errors['campaign-overview'] = [...(errors['campaign-overview'] || []), 'Category is required'];

  // Budget Timeline validation
  const budgetErrors: string[] = [];
  if (!data.rate_type) budgetErrors.push('Rate type is required');
  if (!data.total_budget || data.total_budget < 10) budgetErrors.push('Total budget must be at least $10');
  if (!data.start_date) budgetErrors.push('Start date is required');
  if (!data.end_date) budgetErrors.push('End date is required');
  
  // Rate-specific validations
  if (data.rate_type === 'per_thousand_views' && (!data.rate_per_thousand || data.rate_per_thousand <= 0)) {
    budgetErrors.push('Rate per thousand views must be greater than 0');
  }
  if (data.rate_type === 'fixed_fee' && (!data.fixed_fee || data.fixed_fee < 1)) {
    budgetErrors.push('Fixed fee must be at least $1');
  }
  if (data.rate_type === 'hybrid' && (!data.base_rate || data.base_rate < 1 || !data.performance_bonus || data.performance_bonus <= 0)) {
    budgetErrors.push('Base rate and performance bonus are required for hybrid pricing');
  }
  if (data.rate_type === 'commission' && (!data.commission_percentage || data.commission_percentage < 1 || data.commission_percentage > 100)) {
    budgetErrors.push('Commission percentage must be between 1% and 100%');
  }
  
  if (budgetErrors.length > 0) errors['budget-timeline'] = budgetErrors;

  // Content Requirements validation
  const contentErrors: string[] = [];
  
  // Deliverable Quantity (3 required fields)
  if (!data.deliverable_quantity?.clips || data.deliverable_quantity.clips <= 0) {
    contentErrors.push('Short Clips quantity must be specified and greater than 0');
  }
  if (!data.deliverable_quantity?.long_videos || data.deliverable_quantity.long_videos <= 0) {
    contentErrors.push('Long Videos quantity must be specified and greater than 0');
  }
  if (!data.deliverable_quantity?.images || data.deliverable_quantity.images <= 0) {
    contentErrors.push('Static Images quantity must be specified and greater than 0');
  }
  
  // Required Elements (4 required fields)
  if (!data.required_elements?.logo_placement) {
    contentErrors.push('Logo Placement must be enabled');
  }
  if (!data.required_elements?.brand_mention) {
    contentErrors.push('Brand Mention must be enabled');
  }
  if (!data.required_elements?.call_to_action) {
    contentErrors.push('Call-to-Action must be enabled');
  }
  if (!data.required_elements?.hashtag_requirements) {
    contentErrors.push('Hashtag Requirements must be enabled');
  }
  
  if (contentErrors.length > 0) errors['content-requirements'] = contentErrors;

  // Audience Targeting validation
  const audienceErrors: string[] = [];
  const hasTargeting = !!(
    (data.target_geography && data.target_geography.length > 0) ||
    (data.target_languages && data.target_languages.length > 0) ||
    (data.target_age_range && data.target_age_range.min && data.target_age_range.max) ||
    (data.target_gender && data.target_gender !== "all") ||
    (data.audience_interests && data.audience_interests.length > 0)
  );
  if (!hasTargeting) {
    audienceErrors.push('At least one targeting criterion is required (geography, languages, age range, gender, or interests)');
  }
  if (audienceErrors.length > 0) errors['audience-targeting'] = audienceErrors;

  // Agreements Compliance validation
  const complianceErrors: string[] = [];
  if (!data.usage_rights) complianceErrors.push('Usage rights selection is required');
  if (!data.exclusivity) complianceErrors.push('Exclusivity settings are required');
  if (!data.legal_confirmations) complianceErrors.push('Legal confirmations are required');
  if (data.legal_confirmations) {
    if (!data.legal_confirmations.platform_compliant) complianceErrors.push('Platform compliance confirmation is required');
    if (!data.legal_confirmations.no_unlicensed_assets) complianceErrors.push('Asset licensing confirmation is required');
  }
  if (complianceErrors.length > 0) errors['agreements-compliance'] = complianceErrors;

  return errors;
}
