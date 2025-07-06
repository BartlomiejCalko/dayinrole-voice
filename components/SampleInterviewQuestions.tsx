import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Sparkles, Crown, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SampleInterviewQuestionsProps {
  dayInRoleId: string;
  isFreePlan: boolean;
}

const SampleInterviewQuestions: React.FC<SampleInterviewQuestionsProps> = ({ 
  dayInRoleId, 
  isFreePlan 
}) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSampleQuestions = async () => {
      try {
        const response = await fetch(`/api/interview/samples?dayInRoleId=${dayInRoleId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch sample questions');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setQuestions(result.data.questions || []);
        } else {
          setError(result.message || 'No sample questions available');
        }
      } catch (err) {
        console.error('Error fetching sample questions:', err);
        setError('Failed to load sample questions');
      } finally {
        setLoading(false);
      }
    };

    if (dayInRoleId) {
      fetchSampleQuestions();
    }
  }, [dayInRoleId]);

  const handleGenerateInterview = () => {
    if (isFreePlan) {
      toast.error('Free plan users can only view sample questions. Please upgrade to generate custom interviews.');
      return;
    }
    // Navigate to interview generation for paid users
    window.location.href = `/interview/create?dayInRoleId=${dayInRoleId}`;
  };

  if (loading) {
    return (
      <div className="relative w-full mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl" />
        <Card className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Sample Interview Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              <span className="ml-2 text-gray-300">Loading sample questions...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl blur-xl" />
        <Card className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Sample Interview Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-300 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full mt-8">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl" />
      <Card className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Sample Interview Questions
              </CardTitle>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 transition-colors">
                Examples
              </Badge>
            </div>
            {isFreePlan && (
              <Button asChild size="sm" className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-none">
                <Link href="/subscription">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </div>
          <CardDescription className="text-gray-300 mt-2">
            {isFreePlan 
              ? 'Sample interview questions for this role. Upgrade to generate personalized questions based on your specific requirements.'
              : 'Sample questions to give you an idea of what to expect. Generate your own customized interview questions.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.length > 0 ? (
            <>
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300" />
                    <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 transition-colors">
                            Question {index + 1}
                          </Badge>
                          <Badge className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-blue-500/30 transition-colors">
                            {question.category}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-semibold text-white mb-4 text-lg leading-relaxed">
                        {question.question}
                      </h4>
                      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-4 border border-green-500/20 backdrop-blur-sm">
                        <p className="text-sm text-green-300 mb-2 font-medium flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                          Sample Answer:
                        </p>
                        <p className="text-gray-200 leading-relaxed">
                          {question.sampleAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleGenerateInterview}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isFreePlan}
                  >
                    {isFreePlan ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Generate Custom Interview
                      </>
                    ) : (
                      'Generate Custom Interview'
                    )}
                  </Button>
                  {isFreePlan && (
                    <Button asChild variant="outline" className="flex-1 sm:flex-initial bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-3 text-base font-semibold rounded-xl transition-all duration-200">
                      <Link href="/subscription">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Create Custom
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-300 mb-4">
                No sample questions available for this role.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
              >
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SampleInterviewQuestions; 