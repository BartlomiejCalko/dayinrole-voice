"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import Link from "next/link";

const DayInRoleDetailPage = () => {
  const params = useParams();
  const [dayInRole, setDayInRole] = useState<DayInRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuthGuard({
    requireAuth: true,
    enableRedirect: true
  });

  useEffect(() => {
    const fetchDayInRole = async () => {
      if (!params.id || !user) return;

      try {
        const response = await fetch(`/api/dayinrole/${params.id}?userId=${user.uid}`);
        const result = await response.json();

        if (result.success) {
          setDayInRole(result.data);
        } else {
          console.error('Failed to fetch day in role:', result.message);
        }
      } catch (error) {
        console.error('Error fetching day in role:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && params.id) {
      fetchDayInRole();
    }
  }, [params.id, user]);

  // Show loading state while checking authentication
  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen bg-background dark:bg-neutral-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user || !dayInRole) {
    return null;
  }

  const formattedDate = dayjs(dayInRole.createdAt).format('MMMM D, YYYY');

  return (
    <div className="relative min-h-screen bg-background dark:bg-neutral-950">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              {dayInRole.companyLogo ? (
                <Image 
                  src={dayInRole.companyLogo} 
                  alt={`${dayInRole.companyName} logo`} 
                  width={120} 
                  height={120} 
                  className="rounded-full object-cover size-[120px] bg-white p-3" 
                  onError={(e) => {
                    // Fallback to company name if logo fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Company Name Fallback */}
              <div className={`${dayInRole.companyLogo ? 'hidden' : 'flex'} size-[120px] rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 items-center justify-center`}>
                <span className="text-2xl font-bold text-primary text-center leading-tight px-3">
                  {dayInRole.companyName.split(' ').map(word => word.charAt(0)).join('').slice(0, 3).toUpperCase()}
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {dayInRole.position}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              at {dayInRole.companyName}
            </p>
            <div className="flex justify-center items-center gap-4 mb-2">
              <p className="text-sm text-muted-foreground">
                Generated on {formattedDate}
              </p>
              {dayInRole.language && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  dayInRole.language === 'english' 
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                    : 'bg-green-500/20 text-green-600 dark:text-green-400'
                }`}>
                  {dayInRole.language === 'english' ? '🇺🇸 English' : '🌍 Original Language'}
                </span>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex justify-center mb-8">
            <DisplayTechIcons techStack={dayInRole.techstack} />
          </div>

          {/* Day Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image src="/calendar.svg" alt="calendar" width={24} height={24} />
                Your Typical Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {dayInRole.description}
              </p>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image src="/briefcase.svg" alt="challenges" width={24} height={24} />
                Key Challenges & Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dayInRole.challenges.map((challenge, index) => {
                  // Handle both new structure (object) and legacy structure (string)
                  const isNewStructure = typeof challenge === 'object' && challenge.challenge;
                  const challengeText = isNewStructure ? challenge.challenge : challenge;
                  const advice = isNewStructure ? challenge.advice : null;
                  const tips = isNewStructure ? challenge.tips : [];
                  const resources = isNewStructure ? challenge.resources : [];

                  return (
                    <div key={index} className="border border-border/20 rounded-lg p-6 bg-card/50">
                      {/* Challenge */}
                      <div className="flex gap-3 mb-4">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        <p className="text-foreground font-medium">{challengeText}</p>
                      </div>

                      {/* Advice */}
                      {advice && (
                        <div className="ml-9 mb-4">
                          <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                            <Image src="/lightbulb.svg" alt="advice" width={16} height={16} />
                            How to Handle This
                          </h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {advice}
                          </p>
                        </div>
                      )}

                      {/* Tips */}
                      {tips.length > 0 && (
                        <div className="ml-9 mb-4">
                          <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                            <Image src="/target.svg" alt="tips" width={16} height={16} />
                            Pro Tips
                          </h4>
                          <ul className="space-y-1">
                            {tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="text-muted-foreground text-sm flex items-start gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Resources */}
                      {resources.length > 0 && (
                        <div className="ml-9">
                          <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                            <Image src="/book.svg" alt="resources" width={16} height={16} />
                            Helpful Resources
                          </h4>
                          <ul className="space-y-1">
                            {resources.map((resource, resourceIndex) => (
                              <li key={resourceIndex} className="text-muted-foreground text-sm flex items-start gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {dayInRole.requirements.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image src="/star.svg" alt="requirements" width={24} height={24} />
                  Key Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dayInRole.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-foreground">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dayinrole/create">
                Create Another
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayInRoleDetailPage; 