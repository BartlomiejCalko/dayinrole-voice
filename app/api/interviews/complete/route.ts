import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { db } from '@/firebase/admin';

export async function POST(request: Request) {
    try {
        const { interviewId, userId, transcript } = await request.json();

        if (!interviewId || !userId || !transcript) {
            return Response.json({ 
                success: false, 
                message: "Interview ID, User ID, and transcript are required" 
            }, { status: 400 });
        }

        // Get the interview data
        const interviewDoc = await db.collection("interviews").doc(interviewId).get();
        
        if (!interviewDoc.exists) {
            return Response.json({ success: false, message: "Interview not found" }, { status: 404 });
        }

        const interviewData = interviewDoc.data();
        
        // Verify the interview belongs to the user
        if (interviewData?.userId !== userId) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Generate feedback using AI
        const feedbackPrompt = `
You are an expert interview coach providing detailed feedback on a job interview.

Interview Details:
- Role: ${interviewData?.role}
- Level: ${interviewData?.level}
- Type: ${interviewData?.type}
- Tech Stack: ${interviewData?.techstack?.join(', ')}

Questions Asked:
${interviewData?.questions?.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

Interview Transcript:
${transcript.map((entry: any) => `${entry.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${entry.content}`).join('\n')}

Please provide a comprehensive feedback analysis in the following JSON format:
{
  "totalScore": [number from 1-100],
  "categoryScores": [
    {
      "name": "Technical Skills",
      "score": [1-100],
      "comment": "specific feedback"
    },
    {
      "name": "Communication",
      "score": [1-100], 
      "comment": "specific feedback"
    },
    {
      "name": "Problem Solving",
      "score": [1-100],
      "comment": "specific feedback"
    },
    {
      "name": "Cultural Fit",
      "score": [1-100],
      "comment": "specific feedback"
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["area 1", "area 2", "area 3"],
  "finalAssessment": "detailed overall assessment paragraph"
}

Focus on being constructive, specific, and actionable in your feedback. Consider the candidate's level and the role requirements.
        `;

        const { text: feedbackText } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: feedbackPrompt,
        });

        const feedback = JSON.parse(feedbackText);

        // Save the interview attempt and feedback
        const interviewAttempt = {
            interviewId,
            userId,
            transcript,
            feedback,
            completedAt: new Date().toISOString(),
        };

        const attemptRef = await db.collection("interview_attempts").add(interviewAttempt);

        // Update the interview's completed attempts count
        await db.collection("interviews").doc(interviewId).update({
            completedAttempts: (interviewData?.completedAttempts || 0) + 1,
            lastAttemptAt: new Date().toISOString(),
        });

        return Response.json({ 
            success: true, 
            data: { 
                attemptId: attemptRef.id,
                feedback,
                ...interviewAttempt 
            } 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error completing interview:', error);
        return Response.json({ 
            success: false, 
            message: "Failed to complete interview" 
        }, { status: 500 });
    }
} 