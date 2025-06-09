# Interview System Setup Guide

## Overview
This interview system allows users to generate personalized interviews based on their DayInRole experiences and practice with AI-powered interviews using Google Gemini.

## Features
- ✅ Generate interviews from DayInRole data
- ✅ Customizable question count (3, 5, 8, 10)
- ✅ Interview types: Technical, Behavioral, Balanced
- ✅ Experience levels: Junior, Mid, Senior, Lead
- ✅ AI-powered interview experience with Gemini
- ✅ AI-generated feedback and scoring
- ✅ Interview history and retake functionality
- ✅ Detailed performance analytics

## Environment Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Google AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Firebase Configuration
# ... existing Firebase config
```

## Google AI Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env.local` file as `GOOGLE_GENERATIVE_AI_API_KEY`

## Database Collections

The system uses these Firebase collections:

### `interviews`
- Stores interview configurations
- Links to DayInRole experiences
- Tracks completion attempts

### `interview_attempts`
- Stores completed interview sessions
- Contains transcripts and AI feedback
- Used for performance tracking

## Usage Flow

1. **Create DayInRole**: User creates a job role experience
2. **Generate Interview**: User clicks "Practice Interview" on DayInRole page
3. **Configure Interview**: Choose questions, type, and level
4. **Take Interview**: AI-powered interview with Gemini
5. **Get Feedback**: Detailed AI analysis and scoring
6. **Retake**: Option to practice again with same questions

## API Endpoints

- `POST /api/interviews/generate-from-dayinrole` - Generate interview from DayInRole
- `GET /api/interviews/[id]` - Get interview details
- `POST /api/interviews/complete` - Complete interview and generate feedback
- `GET /api/interviews/[id]/feedback` - Get latest feedback

## Components

- `InterviewGenerator` - Interview creation form
- `GeminiAgent` - AI interview interface (to be implemented)
- `InterviewFeedbackPage` - Results and analytics

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **AI**: Google Gemini
- **Database**: Firebase Firestore
- **UI Components**: Radix UI, Shadcn/ui

## Getting Started

1. Set up environment variables
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Create a DayInRole experience
5. Generate and take your first interview!

## Troubleshooting

- Ensure Google AI API key is correctly set
- Verify Firebase configuration
- Check console for any API errors
- Ensure proper network connectivity for AI requests 