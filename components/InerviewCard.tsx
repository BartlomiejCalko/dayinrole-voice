import { getRandomInterviewCover } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import DisplayTechIcons from "./DisplayTechIcons";

const InerviewCard = ({ interviewId, role, type, techstack, createdAt }: Omit<InterviewCardProps, 'userId'>) => {
    const feedback = null as Feedback | null;
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');
    return (
        <div className="w-[360px] max-sm:w-full min-h-96 p-0.5 bg-gradient-to-b from-border/50 to-border/20 rounded-2xl">
            <div className="bg-card/80 dark:bg-card/40 backdrop-blur-sm rounded-2xl min-h-full flex flex-col p-6 relative overflow-hidden gap-10 justify-between border border-border/20">
                <div>
                    <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-primary/20 dark:bg-primary/10 border border-border/20">
                        <p className="text-sm font-semibold capitalize text-foreground">{normalizedType}</p>
                    </div>
                    <Image src={getRandomInterviewCover()} alt="cover image" width={90} height={90} className="rounded-full object-fit size-[90px]" />
                    <h3 className="mt-5 capitalize text-2xl font-semibold text-foreground">
                        {role} Interview
                    </h3>
                    <div className="flex flex-row gap-5 mt-3">
                        <div className="flex flex-row gap-2 items-center">
                            <Image src='/calendar.svg' alt="calendar" width={22} height={22} />   
                            <p className="text-muted-foreground">{formattedDate}</p>    
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <Image src="/star.svg" alt="star" width={22} height={22} />
                            <p className="text-muted-foreground">{feedback?.totalScore || '---'}/100</p>
                        </div>
                    </div>
                    <p className="line-clamp-2 mt-5 text-muted-foreground">
                        {feedback?.finalAssessment || "You haven't taken an interview yet. Take it now to improve your skills."}
                    </p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <DisplayTechIcons techStack={techstack}/>

                    <Button className="btn-primary">
                        <Link href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
                            {feedback ? "Check Feedback" : "View Interview"}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default InerviewCard