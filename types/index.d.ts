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

interface User {
  name: string;
  email: string;
  id: string;
}

// Note: The auth context uses Firebase's User type which has 'uid' instead of 'id'
// This interface is for our app's user data structure
interface AppUser {
  uid: string;
  name?: string | null;
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

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

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

// Future interface for when we add advice functionality
interface DayInRoleChallenge {
  challenge: string;
  advice: string;
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
}

interface DayInRoleFormProps {
  onSubmit: (jobOfferText: string, language: 'original' | 'english') => void;
  isLoading?: boolean;
}
