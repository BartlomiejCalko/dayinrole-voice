import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dayInRoleId: string }> }
) {
  try {
    const { dayInRoleId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "User ID is required" 
      }, { status: 400 });
    }

    if (!dayInRoleId) {
      return NextResponse.json({ 
        success: false, 
        message: "Day in role ID is required" 
      }, { status: 400 });
    }

    // Fetch interview question sets for this dayInRole and user
    // Note: Using simple where clauses first, then sort in memory to avoid index requirements
    const snapshot = await db
      .collection('interviewQuestions')
      .where('dayInRoleId', '==', dayInRoleId)
      .where('userId', '==', userId)
      .get();

    const questionSets: InterviewQuestionSet[] = [];
    
    snapshot.forEach((doc) => {
      questionSets.push({
        id: doc.id,
        ...doc.data()
      } as InterviewQuestionSet);
    });

    // Sort by createdAt in memory (newest first)
    questionSets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ 
      success: true, 
      data: questionSets,
      message: `Found ${questionSets.length} interview question sets`
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching interview questions:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch interview questions" 
    }, { status: 500 });
  }
} 