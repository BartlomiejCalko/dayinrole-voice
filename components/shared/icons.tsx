import { LucideProps, Home, User, Files, Settings, CreditCard, Calendar, LogOut, PlusCircle, Search, Trash2, Edit, ChevronLeft, ChevronRight, SunMedium, Moon, Laptop, Brain, Infinity } from "lucide-react";

export type IconKeys = keyof typeof Icons;

export const Icons = {
  logo: ({ ...props }: LucideProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  home: Home,
  user: User,
  files: Files,
  settings: Settings,
  billing: CreditCard,
  calendar: Calendar,
  logout: LogOut,
  add: PlusCircle,
  search: Search,
  trash: Trash2,
  edit: Edit,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  brain: Brain,
  infinity: Infinity,
}; 