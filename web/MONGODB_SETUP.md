# MongoDB Setup Guide

This project has been migrated from Supabase to MongoDB. Follow these steps to set up your development environment.

## Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account

## Local MongoDB Setup

### Option 1: Local MongoDB Installation

1. **Install MongoDB Community Edition:**
   - **macOS:** `brew install mongodb-community`
   - **Windows:** Download from [MongoDB website](https://www.mongodb.com/try/download/community)
   - **Linux:** Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB service:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Windows/Linux
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is running:**
   ```bash
   mongosh
   # You should see the MongoDB shell
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

## Environment Configuration

1. **Create `.env.local` file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure MongoDB connection:**
   ```env
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017/cliply
   MONGODB_DB=cliply
   
   # For MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cliply?retryWrites=true&w=majority
   MONGODB_DB=cliply
   ```

3. **Add other required variables:**
   ```env
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

## Database Initialization

The application will automatically create the necessary collections when you first use it. However, you can manually create them if needed:

```javascript
// Connect to MongoDB shell
mongosh

// Switch to your database
use cliply

// Create collections (optional - will be created automatically)
db.createCollection('profiles')
db.createCollection('brands')
db.createCollection('campaigns')
db.createCollection('submissions')
db.createCollection('snapshots')
db.createCollection('payouts')
db.createCollection('webhooks')
db.createCollection('audit_logs')
```

## Development

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Sign up for a new account
   - Complete the onboarding process

4. **Test Dark Mode:**
   - Use the theme toggle button (top right) on any page
   - Switch between Light, Dark, and System themes
   - Verify consistent theming across all components

## Database Schema

The application uses the following collections:

- **profiles**: User profiles with roles (creator/brand/admin)
- **brands**: Brand information and settings
- **campaigns**: Marketing campaigns created by brands
- **submissions**: Content submissions from creators
- **snapshots**: Performance metrics for submissions
- **payouts**: Payment records for creators
- **webhooks**: External service integrations
- **audit_logs**: System activity tracking

## Authentication

The application now uses a custom JWT-based authentication system instead of Supabase Auth:

- **Sign Up**: Creates user profile and assigns role
- **Sign In**: Validates credentials and issues JWT token
- **Token Storage**: JWT tokens stored in localStorage (in production, use HTTP-only cookies)
- **Role-based Access**: Different dashboards for creators, brands, and admins

## Migration Notes

- **Supabase Auth** → **Custom JWT Authentication**
- **Supabase Database** → **MongoDB Collections**
- **Row Level Security** → **Application-level authorization**
- **Real-time subscriptions** → **Polling/WebSocket alternatives**

## Production Considerations

1. **Use MongoDB Atlas** for production databases
2. **Implement proper JWT library** (jsonwebtoken)
3. **Use HTTP-only cookies** for token storage
4. **Add password hashing** (bcrypt)
5. **Implement rate limiting** for API endpoints
6. **Add database indexes** for performance
7. **Set up MongoDB monitoring** and backups

## Troubleshooting

### Common Issues

1. **Connection refused:**
   - Ensure MongoDB service is running
   - Check if port 27017 is available
   - Verify connection string format

2. **Authentication failed:**
   - Check username/password in connection string
   - Ensure user has proper database permissions

3. **Database not found:**
   - MongoDB will create databases automatically
   - Check if MONGODB_DB environment variable is set

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=mongodb:*
```

## Support

For MongoDB-specific issues:
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Community Forums](https://community.mongodb.com/)
- [MongoDB Atlas Support](https://docs.atlas.mongodb.com/support/)
