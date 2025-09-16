import { TikTokAccount, YouTubeAccount, InstagramAccount } from './mongodb/schemas';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Platform-specific validation functions
export function validateTikTokAccount(account: Partial<TikTokAccount>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!account.username) {
    errors.push('Username is required');
  } else if (typeof account.username !== 'string') {
    errors.push('Username must be a string');
  } else if (account.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (account.username.length > 24) {
    errors.push('Username must be no more than 24 characters long');
  } else if (!/^[a-zA-Z0-9._]+$/.test(account.username)) {
    errors.push('Username can only contain letters, numbers, dots, and underscores');
  }

  // Optional fields validation
  if (account.display_name && typeof account.display_name !== 'string') {
    errors.push('Display name must be a string');
  }

  if (account.follower_count !== undefined) {
    if (typeof account.follower_count !== 'number') {
      errors.push('Follower count must be a number');
    } else if (account.follower_count < 0) {
      errors.push('Follower count cannot be negative');
    } else if (account.follower_count > 1000000000) {
      warnings.push('Follower count seems unusually high');
    }
  }

  if (account.verified !== undefined && typeof account.verified !== 'boolean') {
    errors.push('Verified status must be a boolean');
  }

  if (account.connected_at && !(account.connected_at instanceof Date)) {
    errors.push('Connected at must be a valid date');
  }

  if (account.last_synced && !(account.last_synced instanceof Date)) {
    errors.push('Last synced must be a valid date');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateYouTubeAccount(account: Partial<YouTubeAccount>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!account.channel_id) {
    errors.push('Channel ID is required');
  } else if (typeof account.channel_id !== 'string') {
    errors.push('Channel ID must be a string');
  } else if (account.channel_id.length < 10) {
    errors.push('Channel ID must be at least 10 characters long');
  } else if (!/^UC[a-zA-Z0-9_-]{22}$/.test(account.channel_id)) {
    warnings.push('Channel ID format may be invalid');
  }

  // Optional fields validation
  if (account.channel_name && typeof account.channel_name !== 'string') {
    errors.push('Channel name must be a string');
  }

  if (account.subscriber_count !== undefined) {
    if (typeof account.subscriber_count !== 'number') {
      errors.push('Subscriber count must be a number');
    } else if (account.subscriber_count < 0) {
      errors.push('Subscriber count cannot be negative');
    } else if (account.subscriber_count > 100000000) {
      warnings.push('Subscriber count seems unusually high');
    }
  }

  if (account.verified !== undefined && typeof account.verified !== 'boolean') {
    errors.push('Verified status must be a boolean');
  }

  if (account.connected_at && !(account.connected_at instanceof Date)) {
    errors.push('Connected at must be a valid date');
  }

  if (account.last_synced && !(account.last_synced instanceof Date)) {
    errors.push('Last synced must be a valid date');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateInstagramAccount(account: Partial<InstagramAccount>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!account.username) {
    errors.push('Username is required');
  } else if (typeof account.username !== 'string') {
    errors.push('Username must be a string');
  } else if (account.username.length < 1) {
    errors.push('Username must be at least 1 character long');
  } else if (account.username.length > 30) {
    errors.push('Username must be no more than 30 characters long');
  } else if (!/^[a-zA-Z0-9._]+$/.test(account.username)) {
    errors.push('Username can only contain letters, numbers, dots, and underscores');
  }

  // Optional fields validation
  if (account.display_name && typeof account.display_name !== 'string') {
    errors.push('Display name must be a string');
  }

  if (account.follower_count !== undefined) {
    if (typeof account.follower_count !== 'number') {
      errors.push('Follower count must be a number');
    } else if (account.follower_count < 0) {
      errors.push('Follower count cannot be negative');
    } else if (account.follower_count > 1000000000) {
      warnings.push('Follower count seems unusually high');
    }
  }

  if (account.verified !== undefined && typeof account.verified !== 'boolean') {
    errors.push('Verified status must be a boolean');
  }

  if (account.connected_at && !(account.connected_at instanceof Date)) {
    errors.push('Connected at must be a valid date');
  }

  if (account.last_synced && !(account.last_synced instanceof Date)) {
    errors.push('Last synced must be a valid date');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Generic validation function
export function validateAccountData(
  platform: 'tiktok' | 'youtube' | 'instagram',
  accountData: any
): ValidationResult {
  switch (platform) {
    case 'tiktok':
      return validateTikTokAccount(accountData);
    case 'youtube':
      return validateYouTubeAccount(accountData);
    case 'instagram':
      return validateInstagramAccount(accountData);
    default:
      return {
        isValid: false,
        errors: ['Unsupported platform'],
        warnings: []
      };
  }
}

// Check for duplicate accounts
export function checkForDuplicateAccount(
  existingAccounts: (TikTokAccount | YouTubeAccount | InstagramAccount)[],
  newAccount: TikTokAccount | YouTubeAccount | InstagramAccount,
  platform: 'tiktok' | 'youtube' | 'instagram'
): boolean {
  switch (platform) {
    case 'tiktok':
    case 'instagram':
      return existingAccounts.some(acc => 
        'username' in acc && 'username' in newAccount && 
        acc.username === newAccount.username
      );
    case 'youtube':
      return existingAccounts.some(acc => 
        'channel_id' in acc && 'channel_id' in newAccount && 
        acc.channel_id === newAccount.channel_id
      );
    default:
      return false;
  }
}

// Validate account ownership (placeholder for future implementation)
export async function validateAccountOwnership(
  platform: 'tiktok' | 'youtube' | 'instagram',
  accountData: any,
  accessToken: string
): Promise<boolean> {
  // TODO: Implement actual account ownership validation
  // This would involve making API calls to verify the account belongs to the user
  // For now, return true as a placeholder
  return true;
}

// Sanitize account data
export function sanitizeAccountData(
  platform: 'tiktok' | 'youtube' | 'instagram',
  accountData: any
): any {
  const sanitized = { ...accountData };

  // Remove any potentially sensitive data
  delete sanitized.access_token;
  delete sanitized.refresh_token;
  delete sanitized.expires_in;

  // Sanitize string fields
  if (sanitized.username) {
    sanitized.username = sanitized.username.trim();
  }
  if (sanitized.display_name) {
    sanitized.display_name = sanitized.display_name.trim();
  }
  if (sanitized.channel_name) {
    sanitized.channel_name = sanitized.channel_name.trim();
  }

  // Ensure numeric fields are valid
  if (sanitized.follower_count !== undefined) {
    sanitized.follower_count = Math.max(0, Math.floor(sanitized.follower_count));
  }
  if (sanitized.subscriber_count !== undefined) {
    sanitized.subscriber_count = Math.max(0, Math.floor(sanitized.subscriber_count));
  }

  // Ensure boolean fields are valid
  if (sanitized.verified !== undefined) {
    sanitized.verified = Boolean(sanitized.verified);
  }

  return sanitized;
}

// Format validation errors for display
export function formatValidationErrors(validationResult: ValidationResult): string {
  if (validationResult.isValid) {
    return '';
  }

  const errorMessages = validationResult.errors.map(error => `• ${error}`);
  const warningMessages = validationResult.warnings.map(warning => `⚠ ${warning}`);

  return [...errorMessages, ...warningMessages].join('\n');
}
