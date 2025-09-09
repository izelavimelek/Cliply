/**
 * Brand Profile Validation Utility
 * Centralized validation logic for brand profile completion
 */

import { isBrandComplete, Brand } from './brand-completion';

export interface BrandProfileValidationResult {
  isComplete: boolean;
  missingFields: string[];
}

export const checkBrandProfileCompletion = async (): Promise<BrandProfileValidationResult> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return { isComplete: false, missingFields: ['Authentication required'] };
    }

    const response = await fetch('/api/brands/my-brand', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If we can't fetch brand data, assume profile is incomplete
      // This will show the modal with the standard required fields
      return { 
        isComplete: false, 
        missingFields: ['Brand Name', 'Email Address', 'Industry', 'Brand Description'] 
      };
    }

    const brandData: Brand = await response.json();
    
    // Use the centralized completion logic
    const isComplete = isBrandComplete(brandData);
    
    // Define required fields for campaign creation
    const requiredFields = [
      { key: 'name', label: 'Brand Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'industry', label: 'Industry' },
      { key: 'description', label: 'Brand Description' }
    ];

    const missingFields: string[] = [];

    // Check each required field
    requiredFields.forEach(field => {
      const value = field.key === 'name' || field.key === 'industry' || field.key === 'description' 
        ? brandData.profile?.[field.key as keyof typeof brandData.profile]
        : brandData.profile?.[field.key as keyof typeof brandData.profile];
        
      if (!value || value.toString().trim() === '') {
        missingFields.push(field.label);
      }
    });

    return {
      isComplete,
      missingFields
    };
  } catch (error) {
    console.error('Error checking brand profile:', error);
    // If there's an error, assume profile is incomplete
    // This will show the modal with the standard required fields
    return { 
      isComplete: false, 
      missingFields: ['Brand Name', 'Email Address', 'Industry', 'Brand Description'] 
    };
  }
};

// Note: handleNewCampaignClick has been moved to useBrandProfileModal hook
// This file now only contains the validation logic
