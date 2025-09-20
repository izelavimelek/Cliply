import { Campaign } from '@/components/features/campaigns/types';

export interface ValidationError {
  section: string;
  field: string;
  message: string;
}

export interface PublishingCheck {
  canPublish: boolean;
  validationErrors: ValidationError[];
  hasPaymentMethod: boolean;
  missingPaymentSetup: boolean;
}

/**
 * Comprehensive validation for campaign publishing
 */
export function validateCampaignForPublishing(campaign: Campaign): ValidationError[] {
  const errors: ValidationError[] = [];

  // Campaign Overview validation
  if (!campaign.title || campaign.title.length < 5) {
    errors.push({
      section: 'Campaign Overview',
      field: 'title',
      message: 'Campaign title must be at least 5 characters long'
    });
  }

  if (!campaign.description || campaign.description.length < 10) {
    errors.push({
      section: 'Campaign Overview',
      field: 'description',
      message: 'Campaign description must be at least 10 characters long'
    });
  }

  if (!campaign.objective) {
    errors.push({
      section: 'Campaign Overview',
      field: 'objective',
      message: 'Campaign objective is required'
    });
  }

  if (!campaign.platforms || campaign.platforms.length === 0) {
    errors.push({
      section: 'Campaign Overview',
      field: 'platforms',
      message: 'At least one platform must be selected'
    });
  }

  if (!campaign.category) {
    errors.push({
      section: 'Campaign Overview',
      field: 'category',
      message: 'Campaign category is required'
    });
  }

  // Budget & Timeline validation
  if (!campaign.start_date) {
    errors.push({
      section: 'Budget & Timeline',
      field: 'start_date',
      message: 'Campaign start date is required'
    });
  }

  if (!campaign.end_date) {
    errors.push({
      section: 'Budget & Timeline',
      field: 'end_date',
      message: 'Campaign end date is required'
    });
  }

  if (!campaign.submission_deadline) {
    errors.push({
      section: 'Budget & Timeline',
      field: 'submission_deadline',
      message: 'Submission deadline is required'
    });
  }

  if (!campaign.total_budget || campaign.total_budget <= 0) {
    errors.push({
      section: 'Budget & Timeline',
      field: 'total_budget',
      message: 'Campaign budget must be greater than 0'
    });
  }

  if (!campaign.rate_type) {
    errors.push({
      section: 'Budget & Timeline',
      field: 'rate_type',
      message: 'Payment structure is required'
    });
  }

  // Content Requirements validation
  if (!campaign.deliverable_quantity || 
      (!campaign.deliverable_quantity.clips && !campaign.deliverable_quantity.long_videos)) {
    errors.push({
      section: 'Content Requirements',
      field: 'deliverable_quantity',
      message: 'At least one deliverable type (clips or videos) must be specified'
    });
  }

  if (!campaign.required_elements?.logo_placement) {
    errors.push({
      section: 'Content Requirements',
      field: 'logo_placement',
      message: 'Logo placement requirement must be specified'
    });
  }

  if (!campaign.required_elements?.brand_mention) {
    errors.push({
      section: 'Content Requirements',
      field: 'brand_mention',
      message: 'Brand mention requirement must be specified'
    });
  }

  if (!campaign.required_elements?.call_to_action) {
    errors.push({
      section: 'Content Requirements',
      field: 'call_to_action',
      message: 'Call to action requirement must be specified'
    });
  }

  if (!campaign.required_elements?.hashtag_requirements) {
    errors.push({
      section: 'Content Requirements',
      field: 'hashtag_requirements',
      message: 'Hashtag requirements must be specified'
    });
  }

  // Audience Targeting validation
  if (!campaign.target_geography || campaign.target_geography.length === 0) {
    errors.push({
      section: 'Audience Targeting',
      field: 'target_geography',
      message: 'Target geography is required'
    });
  }

  if (!campaign.target_languages || campaign.target_languages.length === 0) {
    errors.push({
      section: 'Audience Targeting',
      field: 'target_languages',
      message: 'Target language is required'
    });
  }

  if (!campaign.target_age_range || !campaign.target_age_range.min || !campaign.target_age_range.max) {
    errors.push({
      section: 'Audience Targeting',
      field: 'target_age_range',
      message: 'Target age range is required'
    });
  }

  return errors;
}

/**
 * Mock payment method check - will be replaced with real implementation later
 */
export async function checkBrandPaymentMethod(brandId: string): Promise<boolean> {
  // TODO: Replace with actual payment method checking
  // For now, return false to prevent publishing until payment is set up
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/brands/payment-status?brand_id=${brandId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.hasPaymentMethod || false;
    }
  } catch (error) {
    console.error('Error checking payment method:', error);
  }
  
  // Default to false - no payment method
  return false;
}

/**
 * Complete publishing validation check
 */
export async function performPublishingCheck(campaign: Campaign): Promise<PublishingCheck> {
  const validationErrors = validateCampaignForPublishing(campaign);
  const hasPaymentMethod = await checkBrandPaymentMethod(campaign.brand_id || '');
  
  const canPublish = validationErrors.length === 0 && hasPaymentMethod;
  const missingPaymentSetup = validationErrors.length === 0 && !hasPaymentMethod;

  return {
    canPublish,
    validationErrors,
    hasPaymentMethod,
    missingPaymentSetup
  };
}

/**
 * Publish campaign to pending approval status
 */
export async function publishCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/campaigns/${campaignId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to publish campaign' };
    }
  } catch (error) {
    return { success: false, error: 'Network error occurred' };
  }
}
