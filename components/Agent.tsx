import Image from "next/image";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InterviewQuestion {
  id: string;
  question: string;
  sampleAnswer: string;
  category: string;
}

interface AgentProps {
  questions: InterviewQuestion[];
  dayInRoleTitle?: string;
}

const Agent = ({ questions, dayInRoleTitle }: AgentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold text-foreground mb-4">No Interview Questions Available</h3>
          <p className="text-muted-foreground">Please generate interview questions first.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Interview Practice Session
        </h2>
        {dayInRoleTitle && (
          <p className="text-lg text-muted-foreground mb-4">
            Preparing for: <span className="font-semibold">{dayInRoleTitle}</span>
          </p>
        )}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="w-32 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
        <Card className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-white">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Image
                    src="/ai-avatar.png"
                    alt="AI Interviewer"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <span className="block text-xl font-semibold">AI Interviewer</span>
                <span className="block text-sm text-gray-300 font-normal">{currentQuestion.category}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <p className="text-lg text-white leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Show Answer Button */}
            <div className="flex justify-center">
              <Button
                onClick={toggleAnswer}
                variant={showAnswer ? "secondary" : "default"}
                className="px-6 py-3 text-lg font-semibold"
              >
                {showAnswer ? "Hide Sample Answer" : "Show Sample Answer"}
              </Button>
            </div>

            {/* Sample Answer */}
            {showAnswer && (
              <div className="bg-green-50/10 backdrop-blur-sm rounded-lg p-6 border border-green-500/20 animate-fadeIn">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Image
                        src="/user-avatar.png"
                        alt="Sample answer"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-300">Sample Answer</span>
                </div>
                <p className="text-white leading-relaxed whitespace-pre-line">
                  {currentQuestion.sampleAnswer}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-4">
        <Button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="px-6 py-3"
        >
          Previous Question
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Practice at your own pace
          </p>
        </div>

        <Button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
          className="px-6 py-3"
        >
          Next Question
        </Button>
      </div>

      {/* Completion Message */}
      {currentQuestionIndex === questions.length - 1 && (
        <div className="text-center py-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">🎉 Great Job!</h3>
                             <p className="text-gray-300">
                 You&apos;ve completed all the interview questions. Keep practicing to improve your interview skills!
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agent;
