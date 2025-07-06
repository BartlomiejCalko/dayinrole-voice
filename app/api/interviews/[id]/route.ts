import { createServiceClient } from '@/utils/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        const supabase = createServiceClient();
        
        const { data: interview, error } = await supabase
            .from('interviews')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error || !interview) {
            return Response.json({ success: false, message: "Interview not found" }, { status: 404 });
        }
        
        // Verify the interview belongs to the user
        if (interview.user_id !== userId) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Transform data to match expected format
        const transformedData = {
            id: interview.id,
            userId: interview.user_id,
            role: interview.role,
            type: interview.type,
            level: interview.level,
            questions: interview.questions,
            techstack: interview.techstack,
            createdAt: interview.created_at,
            dayInRoleId: interview.dayinrole_id,
            companyName: null, // Not available in schema
            questionCount: interview.questions?.length || 0,
            completedAttempts: interview.completed_attempts || 0,
        };

        return Response.json({ 
            success: true, 
            data: transformedData
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error fetching interview:', error);
        return Response.json({ success: false, message: "Failed to fetch interview" }, { status: 500 });
    }
} 