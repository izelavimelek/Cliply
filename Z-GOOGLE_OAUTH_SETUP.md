# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for your Cliply authentication system.

## 🚀 Quick Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Cliply OAuth` (or your preferred name)
4. Click "Create"

### 2. Enable Google+ API

1. In your project dashboard, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields:
     - App name: `Cliply`
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your email for testing)

4. Back to creating credentials:
   - Application type: "Web application"
   - Name: `Cliply Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000`
     - `https://yourdomain.com` (for production)

5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### 4. Update Environment Variables

Create or update your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-google-client-id-here

# Other required variables
NEXTAUTH_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/cliply
```

### 5. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/auth`

3. Click "Log in with Google"

4. You should see a Google OAuth popup

## 🔧 Configuration Details

### Required Scopes
- `email` - Access to user's email address
- `profile` - Access to user's basic profile information
- `openid` - OpenID Connect authentication

### Environment Variables Explained

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Server-side Google Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google Client Secret | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client-side Google Client ID | Yes |
| `NEXTAUTH_SECRET` | JWT signing secret | Yes |

### User Data Collected

When users sign in with Google, we collect:
- Email address
- Display name
- Profile picture URL
- Google ID (for account linking)

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid client" error**
   - Check that `GOOGLE_CLIENT_ID` matches exactly
   - Ensure the client ID is for a "Web application" type

2. **"Redirect URI mismatch" error**
   - Add `http://localhost:3000` to authorized redirect URIs
   - Check for trailing slashes or typos

3. **"Access blocked" error**
   - Add your email to test users in OAuth consent screen
   - Ensure the app is published or in testing mode

4. **"Invalid token" error**
   - Check that `GOOGLE_CLIENT_SECRET` is correct
   - Ensure `NEXTAUTH_SECRET` is set

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded:
   ```bash
   echo $GOOGLE_CLIENT_ID
   ```
3. Check Google Cloud Console logs
4. Test with a fresh incognito window

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use different client IDs for development and production
- Regularly rotate your client secret
- Monitor OAuth usage in Google Cloud Console

## 📱 Production Setup

For production deployment:

1. Update authorized origins and redirect URIs to your production domain
2. Publish your OAuth consent screen
3. Update environment variables in your hosting platform
4. Test thoroughly before going live

## 🎯 Next Steps

Once Google OAuth is working:

1. Test user registration and login flows
2. Verify user data is saved correctly in MongoDB
3. Test role-based redirects (creator/brand/admin)
4. Consider adding additional OAuth providers (GitHub, LinkedIn, etc.)

---

**Need help?** Check the [Google OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2) or create an issue in your repository.
