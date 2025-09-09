// Utility functions for checking brand completion status

export interface BrandProfile {
  name?: string;
  industry?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  companySize?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export interface Brand {
  _id?: string;
  profile?: BrandProfile;
  payment?: any;
  notifications?: any;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to check if a field has content
const hasContent = (value: any): boolean => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Check if basic brand information is complete (required for brand creation)
export const isBasicInfoComplete = (brand: Brand | null): boolean => {
  if (!brand) {
    console.log('Brand completion check: No brand found', brand);
    return false;
  }
  
  // Handle both nested profile structure and direct structure
  const profile = brand.profile || brand;
  const isComplete = hasContent(profile.name) && 
         hasContent(profile.industry) && 
         hasContent(profile.description);
  
  console.log('Basic info completion check:', {
    name: profile.name,
    industry: profile.industry,
    description: profile.description,
    isComplete
  });
  
  return isComplete;
};

// Check if contact information is complete (email is required)
export const isContactInfoComplete = (brand: Brand | null): boolean => {
  if (!brand) {
    console.log('Contact info check: No brand found', brand);
    return false;
  }
  
  // Handle both nested profile structure and direct structure
  const profile = brand.profile || brand;
  const isComplete = hasContent(profile.email);
  console.log('Contact info completion check:', {
    email: profile.email,
    isComplete
  });
  
  return isComplete;
};

// Check if brand is fully complete (all required fields)
export const isBrandComplete = (brand: Brand | null): boolean => {
  return isBasicInfoComplete(brand) && isContactInfoComplete(brand);
};

// Check if brand exists but is incomplete (needs setup)
export const isBrandIncomplete = (brand: Brand | null): boolean => {
  return brand !== null && !isBrandComplete(brand);
};

// Check if brand needs setup (doesn't exist or is incomplete)
export const needsBrandSetup = (brand: Brand | null): boolean => {
  const needsSetup = brand === null || isBrandIncomplete(brand);
  console.log('Needs brand setup check:', {
    brand: brand ? 'exists' : 'null',
    isIncomplete: brand ? isBrandIncomplete(brand) : 'N/A',
    needsSetup
  });
  return needsSetup;
};
