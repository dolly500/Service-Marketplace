# Homease Application

A service platform for home services.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd homease
```

2. Install all dependencies (frontend, backend, and admin):
```
npm run install-all
```

3. Set up environment variables:
   - Create a `.env` file in the backend directory with the following variables:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-app-password
   JWT_SECRET=your-jwt-secret
   ```

### Running the Application

1. Start both frontend and backend servers (includes database repair):
```
npm start
```

2. To run just the backend server with database repair:
```
npm run backend
```

3. To run just the frontend server:
```
npm run frontend
```

4. To run the admin panel:
```
npm run admin
```

## Database Repair

If you encounter MongoDB errors related to duplicate keys, the application includes an automatic repair process that:

1. Fixes any users with null `userId` fields
2. Removes problematic indexes
3. Updates the schema to use a more robust structure

You can manually trigger the database repair with:
```
npm run backend-repair
```

### Complete Database Index Reset

If you continue to have issues with MongoDB indexes, you can completely reset all indexes:
```
npm run reset-indexes
```

This will:
1. Remove ALL existing indexes on the users collection (except _id)
2. Create fresh indexes for email and userCode
3. Fix any persistent duplicate key errors

**Note**: Use this as a last resort as it will reset ALL custom indexes.

### Fix Duplicate Users

If you're facing "User already exists" errors when creating new accounts, you can fix duplicate user records:
```
npm run fix-users
```

This will:
1. Find and remove duplicate email addresses (case-insensitive)
2. Set up a proper case-insensitive unique index for emails
3. Keep the older account when duplicates are found

### Completely Rebuild Users Collection

If you're still having persistent issues with user registration, you can completely rebuild the users collection:
```
npm run rebuild-users
```

This will:
1. Backup all existing users to a temporary collection
2. Create a fresh users collection with proper indexes
3. Reinsert all users with normalized email addresses
4. Create a test user account you can use immediately:
   - Email: test@example.com
   - Password: password123

**CAUTION**: This is a destructive operation and should only be used as a last resort.

## Troubleshooting

### Connection Refused Errors
If you see "Connection Refused" errors in the frontend:
1. Make sure the backend server is running on port 4000
2. Check terminal for any backend server errors
3. Try restarting the backend server with `npm run backend`

### MongoDB Errors
If you see MongoDB errors about duplicate keys:
1. The application should automatically repair the database on startup
2. If issues persist, try running the repair script manually: `npm run backend-repair`
3. For stubborn problems, reset all indexes with: `npm run reset-indexes`
4. If you can't create new accounts, run: `npm run fix-users`
5. For persistent registration issues, run: `npm run rebuild-users`
6. If problems continue, you may need to manually check your MongoDB database

### Authentication Issues
If you're having problems with login or signup:
1. Make sure your MongoDB connection is working
2. Check that the email service is properly configured in the .env file
3. Verify that the OTP system is working by checking the server logs
4. Try using the test account created by the rebuild-users script:
   - Email: test@example.com
   - Password: password123

### "User Already Exists" Error
If you get this error for all email addresses:
1. Run `npm run rebuild-users` to completely reset the users collection
2. After running the script, try signing up with a new email
3. If issues persist, check the MongoDB logs for any error messages

## Main Features
- User authentication with OTP verification
- Service booking and management
- Admin panel for service management
- Order tracking

## Development

The application consists of three main parts:
1. Frontend (React)
2. Backend (Node.js/Express)
3. Admin Panel (React)

Each part has its own package.json file with specific dependencies. 