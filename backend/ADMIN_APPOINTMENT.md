# Admin Appointment Guide

## Overview

For security reasons, admin accounts cannot be created through the normal registration process. Admins must be appointed via the command line using the provided CLI script.

## How It Works

1. **Users Register Normally**: Users register through the web interface as either a Student or Parent
2. **Admin Appoints Via CLI**: An existing admin (or developer) uses the terminal to promote a user to admin status
3. **User Logs Back In**: The promoted user logs out and back in to receive their admin privileges

## Appointing an Admin

### Prerequisites

- User must already be registered in the system
- You need access to the backend terminal/server
- Firebase Admin SDK must be properly configured

### Command

```bash
cd backend
npm run appoint-admin <email>
```

### Example

```bash
npm run appoint-admin admin@studyspot.com
```

### Expected Output

```
🔍 Looking up user with email: admin@studyspot.com...
✅ Found user: John Doe (UID: abc123xyz789)
📋 Current role: student
✅ Successfully appointed admin@studyspot.com as admin!

👤 User Details:
   - Name: John Doe
   - Email: admin@studyspot.com
   - UID: abc123xyz789
   - Previous Role: student
   - New Role: admin

✨ The user will need to log out and log back in for changes to take effect.
```

## Error Handling

### User Not Found

```
❌ Error: No user found with email: admin@studyspot.com

💡 Tip: Make sure the user has registered first before appointing them as admin.
```

**Solution**: Have the user register through the web interface first.

### Already an Admin

```
⚠️  User is already an admin!
```

**Solution**: No action needed.

### Invalid Email Format

```
❌ Error: Invalid email format
   Provided: invalid-email
```

**Solution**: Use a valid email address.

## Security Features

### Registration Protection

The registration API endpoint (`/api/auth/register`) has been modified to:
- Only accept `student` and `parent` roles
- Reject any attempts to register as `admin`
- Return error: "Invalid role. Only student and parent roles can be registered."

### UI Protection

The registration form has been updated to:
- Remove the "Admin" option from the role selector
- Only show "Student" and "Parent" options

### Backend Validation

The `authController.ts` includes validation to prevent admin creation:

```typescript
// Only allow student and parent roles via registration
// Admins must be appointed via CLI/terminal
if (!['student', 'parent'].includes(role)) {
  return res.status(400).json({
    error: 'Invalid role. Only student and parent roles can be registered.'
  });
}
```

## Creating Your First Admin

If you're setting up the system for the first time:

1. Register a regular account through the web interface (as Student or Parent)
2. Use your registered email with the CLI script:
   ```bash
   npm run appoint-admin your-email@example.com
   ```
3. Log out and log back in to access admin features

## Revoking Admin Access

To demote an admin back to a regular user, you can create a similar script or use Firebase Console to manually update the custom claims.

## Technical Details

### Script Location
`backend/src/scripts/appointAdmin.ts`

### How It Works
1. Connects to Firebase Admin SDK
2. Looks up user by email
3. Retrieves current custom claims
4. Updates custom claims to set `role: 'admin'`
5. User's JWT token will include admin role on next login

### Custom Claims
Firebase custom claims are used to store the user role. These claims are:
- Securely stored in Firebase
- Included in the user's ID token
- Verified on each API request
- Cached until the user's next login

## Troubleshooting

### Script Won't Run

Make sure you're in the backend directory:
```bash
cd backend
npm run appoint-admin <email>
```

### Firebase Admin Not Initialized

Check that your `.env` file has the correct Firebase configuration:
```
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
```

Or that you have Application Default Credentials configured.

### Changes Not Taking Effect

The user must:
1. Log out completely
2. Log back in
3. Their new admin role will be included in their fresh ID token

## Best Practices

1. **Limit Admin Accounts**: Only create as many admin accounts as necessary
2. **Document Admin Users**: Keep a record of who has admin access
3. **Regular Audits**: Periodically review admin accounts
4. **Secure Access**: Ensure only trusted individuals have terminal access to appoint admins
5. **Use Strong Passwords**: Admin accounts should use strong, unique passwords
6. **Enable 2FA**: Consider enabling two-factor authentication for admin accounts

## Support

If you encounter issues appointing admins, check:
- Firebase Admin SDK is properly configured
- Service account key is valid
- User exists in Firebase Authentication
- You have proper permissions to modify user claims
