import { createServiceClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch full question objects from interview_questions table
    const { data: questionSet, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching question set:', error);
      return Response.json({ success: false, message: "Failed to fetch question set" }, { status: 500 });
    }

    if (!questionSet) {
      return Response.json({ success: false, message: "Question set not found" }, { status: 404 });
    }

    // Transform data to match expected format
    const transformedData = {
      id: questionSet.id,
      dayInRoleId: questionSet.dayinrole_id,
      userId: questionSet.user_id,
      questions: questionSet.questions, // Full question objects with sample answers
      numberOfQuestions: questionSet.number_of_questions,
      language: questionSet.language,
      createdAt: questionSet.created_at,
      dayInRoleTitle: questionSet.dayinrole_title,
    };

    return Response.json({ 
      success: true, 
      data: transformedData
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching question set:', error);
    return Response.json({ success: false, message: "Failed to fetch question set" }, { status: 500 });
  }
} 