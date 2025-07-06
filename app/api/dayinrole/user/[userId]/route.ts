import { createServiceClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('API: Fetching day-in-roles for userId:', userId);

    if (!userId) {
      console.log('API: No userId provided');
      return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    
    // First, try the exact userId
    console.log('API: Querying dayinroles table with exact userId...');
    let { data: dayInRoles, error } = await supabase
      .from('dayinroles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('API: Query with exact userId completed, found', dayInRoles?.length || 0, 'documents');

    // If no results and the userId contains 'I', try with 'l' (common case sensitivity issue)
    if ((!dayInRoles || dayInRoles.length === 0) && userId.includes('I')) {
      const alternativeUserId = userId.replace(/I/g, 'l');
      console.log('API: Trying alternative userId:', alternativeUserId);
      
      const { data: altData, error: altError } = await supabase
        .from('dayinroles')
        .select('*')
        .eq('user_id', alternativeUserId)
        .order('created_at', { ascending: false });
      
      if (!altError && altData) {
        dayInRoles = altData;
        console.log('API: Query with alternative userId completed, found', dayInRoles.length, 'documents');
      }
    }

    // If still no results and the userId contains 'l', try with 'I'
    if ((!dayInRoles || dayInRoles.length === 0) && userId.includes('l')) {
      const alternativeUserId = userId.replace(/l/g, 'I');
      console.log('API: Trying alternative userId:', alternativeUserId);
      
      const { data: altData, error: altError } = await supabase
        .from('dayinroles')
        .select('*')
        .eq('user_id', alternativeUserId)
        .order('created_at', { ascending: false });
      
      if (!altError && altData) {
        dayInRoles = altData;
        console.log('API: Query with alternative userId completed, found', dayInRoles.length, 'documents');
      }
    }

    if (error) {
      console.error('API Error details:', error);
      return Response.json({ 
        success: false, 
        message: `Failed to fetch day in roles: ${error.message}` 
      }, { status: 500 });
    }

    // Transform data to match expected format
    const transformedData = (dayInRoles || []).map(role => ({
      id: role.id,
      userId: role.user_id,
      companyName: role.company_name,
      companyLogo: role.company_logo,
      position: role.position,
      description: role.description,
      challenges: role.challenges,
      requirements: role.requirements,
      techstack: role.techstack,
      coverImage: role.cover_image,
      language: role.language,
      createdAt: role.created_at,
    }));

    console.log('API: Returning', transformedData.length, 'day-in-roles');
    return Response.json({ 
      success: true, 
      data: transformedData 
    }, { status: 200 });

  } catch (error) {
    console.error('API Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return Response.json({ 
      success: false, 
      message: `Failed to fetch day in roles: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 