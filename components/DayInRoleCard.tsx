import dayjs from "dayjs";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

const DayInRoleCard = ({ 
  dayInRoleId, 
  companyName, 
  companyLogo,
  position, 
  description, 
  challenges, 
  createdAt
}: Omit<DayInRoleCardProps, 'userId'>) => {
  const formattedDate = dayjs(createdAt || Date.now()).format('MMM D, YYYY');
  
  return (
    <div className="w-full h-[520px] p-0.5 bg-gradient-to-b from-purple-700/20 to-blue-900/20 dark:from-purple-700/50 dark:to-blue-900/30 rounded-2xl">
      <div className="bg-card/0 dark:bg-card/40 backdrop-blur-sm rounded-2xl h-full flex flex-col p-6 relative overflow-hidden gap-10 justify-between border border-border/20">
        <div>
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-green-500/20 dark:bg-green-500/10 border border-border/20">
            <p className="text-sm font-semibold text-foreground">Day in Role</p>
          </div>
          
          {/* Company Logo or Name */}
          {companyLogo ? (
            <Image 
              src={companyLogo} 
              alt={`${companyName} logo`} 
              width={90} 
              height={90} 
              className="rounded-full object-cover size-[90px] bg-white p-2 items-center justify-center" 
              onError={(e) => {
                // Fallback to company name if logo fails to load
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          
          {/* Company Name Fallback */}
          <div className={`${companyLogo ? 'hidden' : 'flex'} size-[90px] rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 items-center justify-center`}>
            <span className="text-md font-bold text-primary leading-none select-none text-center flex items-center justify-center w-full h-full">
              {companyName.split(' ').map(word => word.charAt(0)).join('').slice(0, 3).toUpperCase()}
            </span>
          </div>
          
          <h3 className="mt-5 capitalize text-2xl font-semibold text-foreground line-clamp-2">
            {position}
          </h3>
          <p className="text-lg font-medium text-muted-foreground mb-3">
            at {companyName}
          </p>
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2 items-center">
              <Image src='/calendar.svg' alt="calendar" width={22} height={22} className="opacity-90 dark:opacity-90" />   
              <p className="text-muted-foreground">{formattedDate}</p>    
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image src="/briefcase.svg" alt="challenges" width={22} height={22} className="opacity-70 dark:opacity-90 dark:invert" />
              <p className="text-muted-foreground">{challenges.length} challenges</p>
            </div>
          </div>
          <p className="line-clamp-3 mt-5 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-row justify-end items-center">
          <Button size="sm">
            <Link href={`/dayinrole/${dayInRoleId}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DayInRoleCard;