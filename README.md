# Day in Role - Voice

A Next.js application that generates personalized "Day in Role" simulations and interview questions with AI.

## Features

- 🎯 AI-powered "Day in Role" generation from job offers
- 💬 Interactive interview simulations with voice support
- 💳 Subscription-based access with Stripe integration
- 🔥 Firebase authentication and data storage
- 🎨 Modern UI with Tailwind CSS and shadcn/ui

## Subscription Plans

- **Basic Plan (29 zł/month)**: 10 Day in Role + 1 interview (3 questions each)
- **Premium Plan (59 zł/month)**: 20 Day in Role + 3 interviews (10 questions each)

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Firebase project set up
3. Stripe account for payments

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dayinrole-voice
```

2. Install dependencies:
```bash
npm install
```

3. Set up Stripe products and prices in your Stripe dashboard

4. Configure Firebase Firestore collections

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Stripe Configuration

1. Create products and prices in your Stripe dashboard:
   - **Basic Plan**: Monthly subscription at 29 PLN
   - **Premium Plan**: Monthly subscription at 59 PLN

2. Update the price IDs in `constants/subscription-plans.ts`:
   ```typescript
   stripePriceId: 'price_your_actual_price_id_here'
   ```

3. Set up webhook endpoint in Stripe dashboard:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `customer.subscription.*`, `invoice.payment_succeeded`, `checkout.session.completed`

### Firebase Configuration

The application requires the following Firestore collections:

1. **subscriptions** - User subscription data
2. **usage_tracking** - Monthly usage tracking
3. **dayinroles** - Generated day in role content
4. **interviews** - Generated interview questions

### API Routes

- `/api/stripe/create-checkout` - Create Stripe checkout session
- `/api/stripe/webhook` - Handle Stripe webhooks
- `/api/subscription/status` - Get user subscription status
- `/api/subscription/usage` - Get usage statistics
- `/api/subscription/cancel` - Cancel subscription
- `/api/dayinrole/generate` - Generate day in role (with limits)
- `/api/interviews/generate-from-dayinrole` - Generate interview (with limits)

## Architecture

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Firebase Admin SDK
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Payments**: Stripe Subscriptions
- **AI**: Google Gemini for content generation

## Usage Limits

The subscription system enforces monthly limits:

- **Basic Plan**: 10 Day in Role generations, 1 interview per Day in Role (3 questions)
- **Premium Plan**: 20 Day in Role generations, 3 interviews per Day in Role (10 questions)

Limits reset automatically each month and are tracked in the `usage_tracking` collection.

## Development

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
