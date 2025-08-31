# User Authentication Setup Guide

This guide explains how to properly configure user authentication so that users are automatically created in your database when they sign up using "Continue with Google" or any other authentication method.

## The Problem

When users sign up via Clerk (using Google or other providers), they are created in Clerk's system but not automatically in your application's database. This causes issues when your application tries to access user data or create related records.

## The Solution

This application implements a **multi-layer approach** to ensure users and subscriptions are always in sync:

1. **Primary: Clerk Webhooks** - Automatically syncs users and subscriptions in real-time
2. **Auto-sync: Background Sync** - Automatically syncs subscription status when users visit any page
3. **Fallback: Client-side Initialization** - Creates users when they first visit the app (if webhook failed)

### Automatic Subscription Sync

The app automatically syncs subscription status from Clerk billing in the background. When users upgrade their plan in Clerk, the subscription status is automatically updated in your database within seconds - no manual action required!

## Setup Instructions

### 1. Configure Clerk Webhook

#### Step 1: Get Your Webhook URL
Your webhook endpoint is: `https://dayinrole.net/api/clerk/webhook`

#### Step 2: Set Up Webhook in Clerk Dashboard
1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL: `https://dayinrole.net/api/clerk/webhook`
6. Select the following events:
   - `user.created` (Essential)
   - `user.updated` (Recommended)
   - `user.deleted` (Recommended)
   - `subscription.created` (For billing sync)
   - `subscription.updated` (For billing sync)
   - `subscription.deleted` (For billing sync)
7. Click **Create**

#### Step 3: Configure Webhook Secret
1. After creating the webhook, copy the **Signing Secret**
2. Add it to your environment variables:
   ```bash
   CLERK_WEBHOOK_SECRET=your_signing_secret_here
   ```

#### Step 4: Test the Webhook
1. In the Clerk Dashboard, go to your webhook
2. Use the **Send Test** feature to verify it's working
3. Check your application logs for webhook events

### 2. Environment Variables

Ensure you have all required environment variables:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## How It Works

### Primary Flow (Webhook)
1. User signs up with Google in Clerk
2. Clerk sends a `user.created` webhook to your application
3. Your webhook handler creates the user in your database
4. User gets a free subscription automatically

### Fallback Flow (Client-side)
1. User signs in and visits your application
2. `UserInitializer` component runs automatically
3. It checks if the user exists in your database
4. If not, it creates the user and subscription
5. This ensures users are always properly initialized

## Testing

### Check User Status
Visit: `https://your-domain.com/api/auth/check-user-status`
This endpoint will show:
- Clerk user information
- Database user information
- Subscription status
- Whether the user exists in the database

### Manual User Initialization
POST to: `https://your-domain.com/api/auth/initialize-user`
This will manually initialize the current user in the database.

## Troubleshooting

### Webhook Not Working
1. Check that `CLERK_WEBHOOK_SECRET` is set correctly
2. Verify the webhook URL is accessible publicly
3. Check application logs for webhook errors
4. Test the webhook using Clerk Dashboard

### Users Still Not Created
1. The fallback system should handle this automatically
2. Check browser console for errors
3. Visit the check-user-status endpoint to debug
4. Ensure Supabase permissions are correct

### Database Errors
1. Verify your Supabase service role key has proper permissions
2. Check that your database schema matches the expected structure
3. Review Supabase logs for detailed error messages

## Database Schema

Your `users` table should have these columns:
- `id` (text, primary key) - matches Clerk user ID
- `first_name` (text, nullable)
- `last_name` (text, nullable)
- `email` (text, required)
- `display_name` (text, nullable)
- `created_at` (timestamp, default now())
- `updated_at` (timestamp, default now())

## Next Steps

1. Set up the webhook in Clerk Dashboard
2. Add the webhook secret to your environment variables
3. Test with a new user signup
4. Monitor logs to ensure everything is working correctly

The system is designed to be robust - even if the webhook fails, users will still be created in your database when they first visit your application. 