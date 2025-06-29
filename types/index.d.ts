interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

// Updated User interface for Clerk
interface User {
  id: string; // Clerk uses 'id' instead of 'uid'
  firstName?: string | null;
  lastName?: string | null;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  primaryEmailAddress?: {
    emailAddress: string;
    id: string;
  } | null;
}

// App user interface that combines Clerk user with our app data
interface AppUser {
  id: string; // Clerk uses 'id' instead of 'uid'
  firstName?: string | null;
  lastName?: string | null;
  email: string | null;
  displayName?: string | null;
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

// Updated interfaces for Clerk (no longer need Firebase-specific sign-in/up params)
type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}

interface DayInRole {
  id: string;
  companyName: string;
  companyLogo?: string | null;
  position: string;
  description: string;
  challenges: DayInRoleChallenge[];
  requirements: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  coverImage: string;
  language?: 'original' | 'english';
}

// Updated interface with Tips & Resources structure
interface DayInRoleChallenge {
  title: string;
  challenge: string;
  tips: string[];
  resources: string[];
}

// Legacy interface for backward compatibility
interface DayInRoleLegacy {
  id: string;
  companyName: string;
  companyLogo?: string | null;
  position: string;
  description: string;
  challenges: string[];
  requirements: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  coverImage: string;
}

interface DayInRoleWithAdvice {
  id: string;
  companyName: string;
  position: string;
  description: string;
  challenges: DayInRoleChallenge[];
  requirements: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  coverImage: string;
}

interface DayInRoleCardProps {
  dayInRoleId?: string;
  userId?: string;
  companyName: string;
  companyLogo?: string | null;
  position: string;
  description: string;
  challenges: DayInRoleChallenge[] | string[];
  createdAt?: string;
  coverImage?: string;
}

interface CreateDayInRoleParams {
  jobOfferText: string;
  userId: string;
  language?: 'original' | 'english';
  inputType?: 'text' | 'url';
}

interface DayInRoleFormProps {
  onSubmit: (input: string, language: 'original' | 'english', inputType: 'text' | 'url') => void;
  isLoading?: boolean;
}

interface InterviewQuestion {
  id: string;
  question: string;
  sampleAnswer: string;
  category: string;
}

interface InterviewQuestionSet {
  id: string;
  dayInRoleId: string;
  userId: string;
  questions: InterviewQuestion[];
  numberOfQuestions: number;
  language: string;
  createdAt: string;
  dayInRoleTitle: string;
}

// Subscription System Types
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  dayInRoleLimit: number;
  interviewLimit: number;
  questionsPerInterview: number;
  stripeProductId: string;
  stripePriceId: string;
}

interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsageTracking {
  id: string;
  userId: string;
  subscriptionId: string;
  periodStart: string;
  periodEnd: string;
  dayInRoleUsed: number;
  interviewsUsed: number;
  resetAt: string;
}

interface SubscriptionLimits {
  dayInRoleLimit: number;
  dayInRoleUsed: number;
  interviewLimit: number;
  interviewsUsed: number;
  questionsPerInterview: number;
  canGenerateDayInRole: boolean;
  canGenerateInterview: boolean;
}

interface SubscriptionPlansProps {
  currentPlanId?: string;
}

interface UsageTrackerProps {
  userId: string;
}
