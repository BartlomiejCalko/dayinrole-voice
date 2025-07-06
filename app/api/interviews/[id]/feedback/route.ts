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

        // First verify the interview exists and belongs to the user
        const { data: interview, error: interviewError } = await supabase
            .from('interviews')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (interviewError || !interview) {
            return Response.json({ success: false, message: "Interview not found or unauthorized" }, { status: 404 });
        }

        // Get the latest interview attempt for this interview
        const { data: attempts, error: attemptsError } = await supabase
            .from('interview_attempts')
            .select('*')
            .eq('interview_id', id)
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1);

        if (attemptsError) {
            console.error('Error fetching interview attempts:', attemptsError);
            return Response.json({ success: false, message: "Failed to fetch feedback" }, { status: 500 });
        }

        if (!attempts || attempts.length === 0) {
            return Response.json({ 
                success: false, 
                message: "No completed interview attempts found" 
            }, { status: 404 });
        }

        const latestAttempt = attempts[0];

        // Transform data to match expected format
        const transformedData = {
            id: latestAttempt.id,
            interviewId: latestAttempt.interview_id,
            userId: latestAttempt.user_id,
            transcript: latestAttempt.transcript,
            feedback: latestAttempt.feedback,
            completedAt: latestAttempt.completed_at,
            overallScore: latestAttempt.overall_score,
            interview: {
                id: interview.id,
                role: interview.role,
                type: interview.type,
                level: interview.level,
                companyName: interview.company_name,
                techstack: interview.techstack,
                questions: interview.questions,
            }
        };

        return Response.json({ 
            success: true, 
            data: transformedData
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error fetching interview feedback:', error);
        return Response.json({ 
            success: false, 
            message: "Failed to fetch interview feedback" 
        }, { status: 500 });
    }
} 