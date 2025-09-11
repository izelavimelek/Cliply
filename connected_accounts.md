# Connected Accounts Feature Implementation Tasks

## Overview
Implement a connected accounts section for creators to connect their TikTok, YouTube, and Instagram accounts, similar to Whop's connected accounts functionality. This will replace the current simple social links section in creator settings.

## Phase 1: Database Schema Updates

### 1.1 Update Profile Schema
**File:** `src/lib/mongodb/schemas.ts`
**Priority:** High
**Status:** Pending

**Tasks:**
- [ ] Add `connected_accounts` field to Profile interface
- [ ] Define structure for each platform (TikTok, YouTube, Instagram)
- [ ] Include fields: username, display_name, follower_count, verified, connected_at, last_synced
- [ ] Keep existing `social_links` for backward compatibility

**Schema Structure:**
```typescript
connected_accounts?: {
  tiktok?: {
    username: string;
    display_name?: string;
    follower_count?: number;
    verified?: boolean;
    connected_at: Date;
    last_synced?: Date;
  };
  youtube?: {
    channel_id: string;
    channel_name?: string;
    subscriber_count?: number;
    verified?: boolean;
    connected_at: Date;
    last_synced?: Date;
  };
  instagram?: {
    username: string;
    display_name?: string;
    follower_count?: number;
    verified?: boolean;
    connected_at: Date;
    last_synced?: Date;
  };
};
```

## Phase 2: Component Development

### 2.1 Create Connected Accounts Component
**File:** `src/components/features/connected-accounts/connected-accounts.tsx`
**Priority:** High
**Status:** Pending

**Tasks:**
- [ ] Create main ConnectedAccounts component
- [ ] Design platform cards (TikTok, YouTube, Instagram)
- [ ] Add connect/disconnect functionality
- [ ] Include refresh/sync functionality
- [ ] Show connection status and stats
- [ ] Add loading states and error handling
- [ ] Implement responsive design

**Features:**
- Platform-specific icons and colors
- Connection status indicators
- Follower/subscriber count display
- Connect/Disconnect buttons
- Refresh data functionality
- Verification badges

### 2.2 Create Platform-Specific Components
**File:** `src/components/features/connected-accounts/platform-card.tsx`
**Priority:** Medium
**Status:** Pending

**Tasks:**
- [ ] Create reusable PlatformCard component
- [ ] Handle different platform states (connected/disconnected)
- [ ] Display platform-specific information
- [ ] Add action buttons (connect, disconnect, refresh)

### 2.3 Create Connection Modal
**File:** `src/components/features/connected-accounts/connection-modal.tsx`
**Priority:** Medium
**Status:** Pending

**Tasks:**
- [ ] Create modal for OAuth connection flow
- [ ] Handle platform-specific connection requirements
- [ ] Show connection progress
- [ ] Display success/error messages

## Phase 3: API Development

### 3.1 Connected Accounts API Routes
**File:** `src/app/api/connected-accounts/route.ts`
**Priority:** High
**Status:** Pending

**Tasks:**
- [ ] GET: Fetch user's connected accounts
- [ ] POST: Connect new account
- [ ] DELETE: Disconnect account
- [ ] PUT: Update account data

### 3.2 Platform-Specific OAuth Endpoints
**File:** `src/app/api/connected-accounts/[platform]/route.ts`
**Priority:** High
**Status:** Pending

**Tasks:**
- [ ] TikTok OAuth integration
- [ ] YouTube OAuth integration
- [ ] Instagram OAuth integration
- [ ] Handle OAuth callbacks
- [ ] Store connection tokens securely

### 3.3 Data Sync Endpoints
**File:** `src/app/api/connected-accounts/sync/route.ts`
**Priority:** Medium
**Status:** Pending

**Tasks:**
- [ ] Sync follower/subscriber counts
- [ ] Update account verification status
- [ ] Handle rate limiting
- [ ] Background sync jobs

## Phase 4: Database Functions

### 4.1 Update Database Functions
**File:** `src/lib/db.ts`
**Priority:** High
**Status:** Pending

**Tasks:**
- [ ] Add `updateConnectedAccounts` function
- [ ] Add `getConnectedAccounts` function
- [ ] Add `syncAccountData` function
- [ ] Handle account disconnection
- [ ] Update existing profile functions

### 4.2 Add Account Validation
**File:** `src/lib/account-validation.ts`
**Priority:** Medium
**Status:** Pending

**Tasks:**
- [ ] Validate platform usernames
- [ ] Verify account ownership
- [ ] Check for duplicate connections
- [ ] Validate follower counts

## Phase 5: UI Integration

### 5.1 Update Creator Settings Page
**File:** `src/app/creator/settings/page.tsx`
**Priority:** High
**Status:** Pending

**Tasks:**
- [ ] Replace social links section with connected accounts
- [ ] Add new "Connected Accounts" tab
- [ ] Integrate ConnectedAccounts component
- [ ] Update navigation tabs
- [ ] Handle state management

### 5.2 Update Creator Profile Display
**File:** `src/components/features/creator-profile.tsx`
**Priority:** Medium
**Status:** Pending

**Tasks:**
- [ ] Display connected accounts in profile
- [ ] Show follower counts
- [ ] Add verification badges
- [ ] Link to connected accounts

## Phase 6: OAuth Integration

### 6.1 TikTok Integration
**Priority:** High
**Status:** Pending

**Tasks:**
- [ ] Register TikTok app
- [ ] Implement OAuth 2.0 flow
- [ ] Get user profile data
- [ ] Get follower count
- [ ] Handle token refresh

### 6.2 YouTube Integration
**Priority:** High
**Status:** Pending

**Tasks:**
- [ ] Register YouTube app
- [ ] Implement OAuth 2.0 flow
- [ ] Get channel data
- [ ] Get subscriber count
- [ ] Handle token refresh

### 6.3 Instagram Integration
**Priority:** High
**Status:** Pending

**Tasks:**
- [ ] Register Instagram app
- [ ] Implement OAuth 2.0 flow
- [ ] Get profile data
- [ ] Get follower count
- [ ] Handle token refresh

## Phase 7: Testing & Validation

### 7.1 Unit Tests
**Priority:** Medium
**Status:** Pending

**Tasks:**
- [ ] Test ConnectedAccounts component
- [ ] Test API endpoints
- [ ] Test database functions
- [ ] Test OAuth flows

### 7.2 Integration Tests
**Priority:** Medium
**Status:** Pending

**Tasks:**
- [ ] Test complete connection flow
- [ ] Test data synchronization
- [ ] Test error handling
- [ ] Test edge cases

## Phase 8: Documentation & Deployment

### 8.1 Documentation
**Priority:** Low
**Status:** Pending

**Tasks:**
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Document OAuth setup
- [ ] Update README

### 8.2 Environment Configuration
**Priority:** Medium
**Status:** Pending

**Tasks:**
- [ ] Add OAuth credentials to environment
- [ ] Configure redirect URLs
- [ ] Set up production OAuth apps
- [ ] Configure CORS settings

## Implementation Order

1. **Phase 1:** Database schema updates
2. **Phase 2:** Basic component development
3. **Phase 3:** API development
4. **Phase 4:** Database functions
5. **Phase 5:** UI integration
6. **Phase 6:** OAuth integration (start with TikTok)
7. **Phase 7:** Testing
8. **Phase 8:** Documentation & deployment

## Dependencies

- OAuth 2.0 libraries for each platform
- Database migration for schema changes
- Environment variables for OAuth credentials
- Rate limiting for API calls
- Error handling and logging

## Success Criteria

- [ ] Creators can connect TikTok, YouTube, and Instagram accounts
- [ ] Follower/subscriber counts are displayed and synced
- [ ] Accounts can be disconnected and reconnected
- [ ] Data syncs automatically in the background
- [ ] UI is responsive and user-friendly
- [ ] OAuth flows are secure and reliable
- [ ] Error handling is comprehensive
- [ ] Performance is optimized

## Estimated Timeline

- **Phase 1-2:** 2-3 days
- **Phase 3-4:** 3-4 days
- **Phase 5:** 1-2 days
- **Phase 6:** 5-7 days (OAuth integration)
- **Phase 7-8:** 2-3 days

**Total:** 13-19 days