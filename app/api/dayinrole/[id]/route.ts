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
    
    // Fetch the day-in-role document
    const { data: dayInRole, error } = await supabase
      .from('dayinroles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dayInRole) {
      return Response.json({ success: false, message: "Day in role not found" }, { status: 404 });
    }
    
    // Verify the user owns this day-in-role
    if (dayInRole.user_id !== userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // Transform data to match expected format
    const transformedData = {
      id: dayInRole.id,
      userId: dayInRole.user_id,
      companyName: dayInRole.company_name,
      companyLogo: dayInRole.company_logo,
      position: dayInRole.position,
      description: dayInRole.description,
      challenges: dayInRole.challenges,
      requirements: dayInRole.requirements,
      techstack: dayInRole.techstack,
      coverImage: dayInRole.cover_image,
      language: dayInRole.language,
      createdAt: dayInRole.created_at,
    };

    return Response.json({ 
      success: true, 
      data: transformedData
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching day in role:', error);
    return Response.json({ success: false, message: "Failed to fetch day in role" }, { status: 500 });
  }
} 