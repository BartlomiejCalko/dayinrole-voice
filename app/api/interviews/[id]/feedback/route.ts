import { db } from '@/firebase/admin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        // First, get the interview data
        const interviewDoc = await db.collection("interviews").doc(id).get();
        
        if (!interviewDoc.exists) {
            return Response.json({ success: false, message: "Interview not found" }, { status: 404 });
        }

        const interviewData = interviewDoc.data();
        
        // Verify the interview belongs to the user
        if (interviewData?.userId !== userId) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Get the latest feedback for this interview
        const feedbackQuery = await db.collection("interview_attempts")
            .where("interviewId", "==", id)
            .where("userId", "==", userId)
            .orderBy("completedAt", "desc")
            .limit(1)
            .get();

        if (feedbackQuery.empty) {
            return Response.json({ 
                success: false, 
                message: "No feedback found for this interview" 
            }, { status: 404 });
        }

        const latestFeedback = feedbackQuery.docs[0];
        const feedbackData = latestFeedback.data();

        return Response.json({ 
            success: true, 
            data: { 
                feedback: {
                    id: latestFeedback.id,
                    ...feedbackData
                },
                interview: {
                    id: interviewDoc.id,
                    ...interviewData
                }
            } 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return Response.json({ success: false, message: "Failed to fetch feedback" }, { status: 500 });
    }
} 