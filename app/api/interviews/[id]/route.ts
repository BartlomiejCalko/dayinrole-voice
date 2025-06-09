import { db } from '@/firebase/admin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        const doc = await db.collection("interviews").doc(id).get();
        
        if (!doc.exists) {
            return Response.json({ success: false, message: "Interview not found" }, { status: 404 });
        }

        const interviewData = doc.data();
        
        // Verify the interview belongs to the user
        if (interviewData?.userId !== userId) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        return Response.json({ 
            success: true, 
            data: { 
                id: doc.id, 
                ...interviewData 
            } 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error fetching interview:', error);
        return Response.json({ success: false, message: "Failed to fetch interview" }, { status: 500 });
    }
} 