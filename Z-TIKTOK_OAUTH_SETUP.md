# TikTok OAuth Setup Guide

## Overview
This guide explains how to set up TikTok OAuth integration for the connected accounts feature.

## Prerequisites
1. TikTok Developer Account
2. TikTok App Registration
3. Environment Variables Configuration

## Step 1: Create TikTok Developer Account
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Sign up or log in with your TikTok account
3. Complete the developer verification process

## Step 2: Create a TikTok App
1. Navigate to the [TikTok Developer Portal](https://developers.tiktok.com/apps/)
2. Click "Create App"
3. Fill in the required information:
   - **App Name**: Your app name (e.g., "Cliply Connected Accounts")
   - **App Description**: Brief description of your app
   - **Category**: Select appropriate category
   - **Platform**: Web
4. Submit for review (may take 1-3 business days)

## Step 3: Configure OAuth Settings
Once your app is approved:

1. Go to your app dashboard
2. Navigate to "OAuth" section
3. Add the following redirect URI:
   ```
   https://yourdomain.com/api/connected-accounts/tiktok/callback
   ```
   For development:
   ```
   http://localhost:3000/api/connected-accounts/tiktok/callback
   ```

## Step 4: Get OAuth Credentials
1. In your app dashboard, go to "OAuth" section
2. Copy the following values:
   - **Client Key** (this is your CLIENT_ID)
   - **Client Secret** (this is your CLIENT_SECRET)

## Step 5: Configure Environment Variables
Add the following to your `.env.local` file:

```env
# TikTok OAuth Configuration
TIKTOK_CLIENT_ID=your_tiktok_client_key_here
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here
TIKTOK_REDIRECT_URI=https://yourdomain.com/api/connected-accounts/tiktok/callback

# Base URL (for development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 6: Required TikTok Permissions
The app requests the following permissions:
- `user.info.basic` - Basic user information
- `user.info.stats` - User statistics (follower count, etc.)
- `video.list` - List user's videos (for future features)

## Step 7: Test the Integration
1. Start your development server
2. Navigate to Creator Settings > Connected Accounts
3. Click "Connect" on the TikTok card
4. Complete the OAuth flow
5. Verify the account appears in your connected accounts

## API Endpoints Used
- **OAuth Authorization**: `https://www.tiktok.com/v2/auth/authorize/`
- **Token Exchange**: `https://open.tiktokapis.com/v2/oauth/token/`
- **User Info**: `https://open.tiktokapis.com/v2/user/info/`

## Troubleshooting

### Common Issues
1. **"TikTok OAuth not configured"**
   - Check that environment variables are set correctly
   - Restart your development server after adding env vars

2. **"Invalid redirect URI"**
   - Ensure the redirect URI in TikTok app matches exactly
   - Check for trailing slashes or protocol mismatches

3. **"Failed to exchange code for token"**
   - Verify CLIENT_ID and CLIENT_SECRET are correct
   - Check that the app is approved and active

4. **"Failed to get user information"**
   - Ensure the access token is valid
   - Check that required permissions are granted

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Security Notes
- Never commit OAuth credentials to version control
- Use environment variables for all sensitive data
- Implement proper token refresh logic for production
- Consider encrypting stored access tokens

## Production Deployment
1. Update redirect URIs to production URLs
2. Ensure HTTPS is enabled
3. Set up proper error monitoring
4. Implement token refresh mechanism
5. Add rate limiting for API calls

## Support
- [TikTok Developer Documentation](https://developers.tiktok.com/doc/)
- [TikTok API Reference](https://developers.tiktok.com/doc/)
- [TikTok Developer Community](https://developers.tiktok.com/community)
