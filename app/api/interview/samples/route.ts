import { NextRequest } from 'next/server';
import { SAMPLE_INTERVIEW_QUESTIONS } from '@/constants/sample-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dayInRoleId = searchParams.get('dayInRoleId');

    if (!dayInRoleId) {
      return Response.json({ 
        success: false, 
        message: 'Day-in-Role ID is required' 
      }, { status: 400 });
    }

    // Get sample questions for the specific day-in-role
    const questions = SAMPLE_INTERVIEW_QUESTIONS[dayInRoleId];

    if (!questions) {
      return Response.json({ 
        success: false, 
        message: 'No sample questions found for this Day-in-Role' 
      }, { status: 404 });
    }

    const questionSet: InterviewQuestionSet = {
      id: `sample-questions-${dayInRoleId}`,
      dayInRoleId,
      userId: 'sample-user',
      questions,
      numberOfQuestions: questions.length,
      language: 'english',
      createdAt: new Date().toISOString(),
      dayInRoleTitle: `Sample Interview Questions`
    };

    return Response.json({ 
      success: true, 
      data: questionSet 
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching sample interview questions:', error);
    return Response.json({ 
      success: false, 
      message: `Failed to fetch sample interview questions: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 