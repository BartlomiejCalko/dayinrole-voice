import { createServiceClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dayInRoleId = searchParams.get('dayInRoleId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    if (!dayInRoleId) {
      return Response.json({ success: false, message: "Day in role ID is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch question sets from interview_questions table
    const { data: questionSets, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('dayinrole_id', dayInRoleId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching question sets:', error);
      return Response.json({ success: false, message: "Failed to fetch question sets" }, { status: 500 });
    }

    // Transform data to match expected format
    const transformedData = (questionSets || []).map(questionSet => ({
      id: questionSet.id,
      dayInRoleId: questionSet.dayinrole_id,
      userId: questionSet.user_id,
      questions: questionSet.questions, // Full question objects with sample answers
      numberOfQuestions: questionSet.number_of_questions,
      language: questionSet.language,
      createdAt: questionSet.created_at,
      dayInRoleTitle: questionSet.dayinrole_title,
    }));

    return Response.json({ 
      success: true, 
      data: transformedData,
      message: `Found ${transformedData.length} interview question sets`
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching question sets:', error);
    return Response.json({ success: false, message: "Failed to fetch question sets" }, { status: 500 });
  }
} 