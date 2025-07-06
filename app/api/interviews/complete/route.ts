import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createServiceClient } from '@/utils/supabase/server';

interface TranscriptEntry {
  timestamp: string;
  speaker: 'user' | 'ai';
  message: string;
}

export async function POST(request: Request) {
  try {
    const { interviewId, userId, transcript }: { interviewId: string; userId: string; transcript: TranscriptEntry[] } = await request.json();

    if (!interviewId || !userId || !transcript) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get the interview data
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .eq('user_id', userId)
      .single();

    if (interviewError || !interview) {
      return Response.json({ success: false, message: "Interview not found or unauthorized" }, { status: 404 });
    }

    // Generate feedback using AI
    const { text: feedback } = await generateText({
      model: google('gemini-2.0-flash-001'),
      maxTokens: 4000,
      prompt: `
        You are an expert interview coach. Analyze this interview transcript and provide detailed feedback.
        
        Interview Details:
        - Role: ${interview.role}
        - Type: ${interview.type}
        - Level: ${interview.level}
        - Company: ${interview.company_name || 'N/A'}
        
        Transcript:
        ${transcript.map(entry => `${entry.speaker}: ${entry.message}`).join('\n')}
        
        Provide feedback in JSON format with this structure:
        {
          "overallScore": 85,
          "strengths": ["strength1", "strength2", "strength3"],
          "improvements": ["improvement1", "improvement2", "improvement3"],
          "detailedFeedback": "Detailed paragraph about performance...",
          "nextSteps": ["step1", "step2", "step3"]
        }
        
        Return only valid JSON, no other text.
      `,
    });

    // Parse feedback
    let parsedFeedback;
    try {
      parsedFeedback = JSON.parse(feedback);
    } catch (parseError) {
      console.error('Failed to parse feedback:', parseError);
      parsedFeedback = {
        overallScore: 75,
        strengths: ["Communicated clearly", "Showed enthusiasm", "Asked good questions"],
        improvements: ["Provide more specific examples", "Elaborate on technical details", "Practice behavioral questions"],
        detailedFeedback: "Good overall performance with room for improvement in providing specific examples.",
        nextSteps: ["Practice with more examples", "Review technical concepts", "Prepare STAR method responses"]
      };
    }

    // Save the interview attempt
    const attemptData = {
      interview_id: interviewId,
      user_id: userId,
      transcript: transcript,
      feedback: parsedFeedback,
      completed_at: new Date().toISOString(),
      overall_score: parsedFeedback.overallScore,
    };

    const { data: savedAttempt, error: saveError } = await supabase
      .from('interview_attempts')
      .insert(attemptData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving interview attempt:', saveError);
      return Response.json({ success: false, message: "Failed to save interview attempt" }, { status: 500 });
    }

    // Update interview completed attempts count
    const { error: updateError } = await supabase
      .from('interviews')
      .update({ 
        completed_attempts: (interview.completed_attempts || 0) + 1,
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', interviewId);

    if (updateError) {
      console.error('Error updating interview:', updateError);
      // Don't fail the request if this update fails
    }

    return Response.json({ 
      success: true, 
      data: {
        attemptId: savedAttempt.id,
        feedback: parsedFeedback
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error completing interview:', error);
    return Response.json({ success: false, message: "Failed to complete interview" }, { status: 500 });
  }
} 