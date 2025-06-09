"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Briefcase, Clock, Target, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface InterviewGeneratorProps {
  dayInRole: DayInRole;
  onInterviewCreated: (interviewId: string) => void;
}

const InterviewGenerator = ({ dayInRole, onInterviewCreated }: InterviewGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionCount, setQuestionCount] = useState<string>("1");
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInterview = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Starting interview generation...', {
        dayInRoleId: dayInRole.id,
        userId: dayInRole.userId,
        questionCount,
        role: dayInRole.position,
        companyName: dayInRole.companyName,
      });

      const response = await fetch('/api/interviews/generate-from-dayinrole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayInRoleId: dayInRole.id,
          userId: dayInRole.userId,
          questionCount: parseInt(questionCount),
          role: dayInRole.position,
          companyName: dayInRole.companyName,
          techstack: dayInRole.techstack.join(','),
        }),
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        console.log('Interview generated successfully:', result.data.id);
        onInterviewCreated(result.data.id);
      } else {
        console.error('Failed to generate interview:', result.message);
        setError(result.message || 'Failed to generate interview. Please try again.');
      }
    } catch (error) {
      console.error('Error generating interview:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(`Network error: ${errorMessage}. Please check your connection and try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Practice Interview
        </CardTitle>
        <CardDescription>
          Generate a personalized interview based on this job role and test your knowledge
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Job Info Preview */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{dayInRole.position}</span>
            <span className="text-muted-foreground">at {dayInRole.companyName}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dayInRole.techstack.slice(0, 6).map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {dayInRole.techstack.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{dayInRole.techstack.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Interview Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Questions</label>
            <Select value={questionCount} onValueChange={setQuestionCount} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Question</SelectItem>
                <SelectItem value="2">2 Questions</SelectItem>
                <SelectItem value="3">3 Questions</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The interview focus and difficulty level will be automatically determined based on the job requirements.
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateInterview}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Interview...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Generate Interview ({questionCount} question{questionCount === '1' ? '' : 's'})
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          The interview will be tailored to the {dayInRole.position} role with questions focusing on {dayInRole.techstack.slice(0, 3).join(', ')} and more.
        </p>
      </CardContent>
    </Card>
  );
};

export default InterviewGenerator; 