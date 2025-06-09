import { db } from '@/firebase/admin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        // First verify the dayinrole belongs to the user
        const dayInRoleDoc = await db.collection("dayinroles").doc(id).get();
        
        if (!dayInRoleDoc.exists) {
            return Response.json({ success: false, message: "DayInRole not found" }, { status: 404 });
        }

        const dayInRoleData = dayInRoleDoc.data();
        
        if (dayInRoleData?.userId !== userId) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Get all interviews for this dayinrole
        // Note: This query may require a composite index in Firestore
        let interviewsQuery;
        try {
            interviewsQuery = await db.collection("interviews")
                .where("dayInRoleId", "==", id)
                .where("userId", "==", userId)
                .orderBy("createdAt", "desc")
                .get();
        } catch (indexError) {
            console.log('Using fallback query without orderBy due to missing index');
            // Fallback query without orderBy if index doesn't exist
            interviewsQuery = await db.collection("interviews")
                .where("dayInRoleId", "==", id)
                .where("userId", "==", userId)
                .get();
        }

        let interviews = interviewsQuery.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort manually if we used the fallback query
        interviews = interviews.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });

        // For each interview, get the latest feedback/attempt info
        const interviewsWithAttempts = await Promise.all(
            interviews.map(async (interview) => {
                let attemptsQuery;
                try {
                    attemptsQuery = await db.collection("interview_attempts")
                        .where("interviewId", "==", interview.id)
                        .where("userId", "==", userId)
                        .orderBy("completedAt", "desc")
                        .limit(1)
                        .get();
                } catch (indexError) {
                    // Fallback without orderBy
                    console.log('Using fallback query for interview attempts');
                    attemptsQuery = await db.collection("interview_attempts")
                        .where("interviewId", "==", interview.id)
                        .where("userId", "==", userId)
                        .get();
                }

                let latestAttempt = null;
                if (!attemptsQuery.empty) {
                    // If we used fallback, sort manually to get the latest
                    const attempts = attemptsQuery.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    
                    const sortedAttempts = attempts.sort((a, b) => {
                        const dateA = new Date(a.completedAt || 0);
                        const dateB = new Date(b.completedAt || 0);
                        return dateB.getTime() - dateA.getTime();
                    });
                    
                    latestAttempt = sortedAttempts[0];
                }

                return {
                    ...interview,
                    latestAttempt
                };
            })
        );

        return Response.json({ 
            success: true, 
            data: interviewsWithAttempts
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error fetching dayinrole interviews:', error);
        return Response.json({ success: false, message: "Failed to fetch interviews" }, { status: 500 });
    }
} 