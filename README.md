# Day in Role Voice

A modern web application for generating personalized Day-in-Role career simulations with subscription management.

## Features

- **AI-Powered Career Simulations**: Generate realistic day-in-role experiences for various positions
- **Interactive Interviews**: Practice with AI-generated interview questions
- **Subscription Management**: Tiered pricing with usage limits
- **Clerk Billing Integration**: Secure payment processing through Clerk
- **User Dashboard**: Track usage and manage subscriptions
- **Modern UI**: Built with shadcn/ui and Tailwind CSS

## Quick Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd dayinrole-voice
npm install
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Clerk Authentication & Billing (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # Your Clerk publishable key
CLERK_SECRET_KEY=sk_test_... # Your Clerk secret key
CLERK_WEBHOOK_SECRET=whsec_... # Your Clerk webhook secret

# Supabase Database (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Integration (REQUIRED)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: Direct Stripe (for advanced webhook handling)
STRIPE_SECRET_KEY=sk_test_... # Only needed if using direct Stripe webhooks
STRIPE_WEBHOOK_SECRET=whsec_... # Only needed if using direct Stripe webhooks
```

### 3. Clerk Setup (Essential for Authentication & Billing)

**⚠️ IMPORTANT: The subscription system works through Clerk billing!**

1. **Create a Clerk Account** at https://clerk.com
2. **Set up your application** in Clerk Dashboard
3. **Configure Billing**:
   - Go to Clerk Dashboard > Billing
   - Set up your subscription plans:
     - **Start Plan**: $12/month (10 Day-in-Role sessions, 5 interviews each)
     - **Pro Plan**: $21/month (30 Day-in-Role sessions, 20 interviews each)
   - Configure your pricing table
4. **Set up Webhooks**:
   - Go to Clerk Dashboard > Webhooks
   - Add endpoint: `https://dayinrole.net/api/clerk/webhook`
   - Select events: `user.created`, `user.deleted`, `subscription.created`, `subscription.updated`
   - Copy webhook secret to your `.env.local`

### 4. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Create the required tables:
   - `users` - User profiles
   - `subscriptions` - Subscription tracking
   - `usage_tracking` - Monthly usage limits
   - `dayinroles` - Generated content
   - `interviews` - Interview questions

### 5. Run the Application

```bash
npm run dev
```

## Subscription System

The app uses **Clerk billing** for subscription management:

- **Free Plan**: View examples only
- **Start Plan ($12/month)**: 10 Day-in-Role sessions, 5 interviews each (5 questions per interview)
- **Pro Plan ($21/month)**: 30 Day-in-Role sessions, 20 interviews each (20 questions per interview)

### How Billing Works

1. **Frontend**: Users see Clerk's `PricingTable` component on `/subscription` page
2. **Checkout**: Clerk handles the entire checkout process
3. **Webhooks**: Clerk sends webhooks to `/api/clerk/webhook` when subscriptions change
4. **Sync**: The app automatically syncs subscription status from Clerk
5. **Usage**: The app enforces limits based on the user's current plan

### Troubleshooting Subscriptions

If subscriptions aren't working:

1. **Check Clerk Configuration**: Ensure billing is set up in Clerk Dashboard
2. **Verify Webhooks**: Check that Clerk webhooks are configured and firing
3. **Check Database**: Ensure subscription records are being created/updated
4. **Manual Sync**: Use the "Refresh Status" button to manually sync from Clerk

### Common Issues

- **Users stuck on free plan**: Check if Clerk webhooks are properly configured
- **Billing not showing**: Ensure you've set up pricing plans in Clerk Dashboard
- **Sync issues**: Use the sync-clerk API endpoint to manually sync subscription status

## Architecture

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Supabase
- **Database**: Supabase PostgreSQL
- **Authentication**: Clerk Auth
- **Billing**: Clerk Billing (with Stripe backend)
- **AI**: Google Gemini for content generation

## API Routes

### Subscription Management
- `GET /api/subscription/status` - Get current subscription status
- `POST /api/subscription/sync-clerk` - Sync subscription from Clerk
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/clerk/webhook` - Handle Clerk webhooks

### Content Generation
- `POST /api/dayinrole/generate` - Generate day-in-role content (requires subscription)
- `POST /api/interviews/generate-from-dayinrole` - Generate interviews (requires subscription)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

1. Deploy to your preferred platform (Vercel, Netlify, etc.)
2. Set up environment variables on your platform
3. Configure Clerk webhooks with your production URL
4. Test the subscription flow in production

## Usage Limits

The subscription system enforces monthly limits:

- **Start Plan**: 10 Day-in-Role sessions, 5 interviews each (5 questions)
- **Pro Plan**: 30 Day-in-Role sessions, 20 interviews each (20 questions)

Limits reset automatically each month and are tracked in the `usage_tracking` table.

## Support

For issues with subscriptions or payments:

1. Check Clerk Dashboard billing logs
2. Review application console logs
3. Check webhook delivery in Clerk Dashboard
4. Verify database subscription records in Supabase

## Key Differences from Direct Stripe

This app uses **Clerk billing** instead of direct Stripe integration:

- ✅ **Clerk handles**: Checkout UI, payment processing, customer management
- ✅ **App handles**: Subscription sync, usage tracking, feature access
- ✅ **Benefits**: Simplified setup, integrated with auth, better UX

## License

MIT License - see LICENSE file for details.
