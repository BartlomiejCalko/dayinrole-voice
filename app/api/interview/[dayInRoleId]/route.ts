import { createServiceClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dayInRoleId: string }> }
) {
  try {
    const { dayInRoleId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch interviews for this day-in-role
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('dayinrole_id', dayInRoleId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interviews:', error);
      return Response.json({ success: false, message: "Failed to fetch interviews" }, { status: 500 });
    }

    // Transform data to match expected format
    const transformedData = (interviews || []).map(interview => ({
      id: interview.id,
      dayInRoleId: interview.dayinrole_id,
      userId: interview.user_id,
      questions: interview.questions,
      numberOfQuestions: interview.questions?.length || 0,
      language: 'english', // Default since language isn't stored in interviews table
      createdAt: interview.created_at,
      dayInRoleTitle: interview.role, // Use role as title since company_name doesn't exist
      role: interview.role,
      type: interview.type,
      level: interview.level,
      techstack: interview.techstack,
    }));

    return Response.json({ 
      success: true, 
      data: transformedData
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return Response.json({ success: false, message: "Failed to fetch interviews" }, { status: 500 });
  }
} 