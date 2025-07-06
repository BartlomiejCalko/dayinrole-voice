import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createServiceClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const { dayInRoleId, userId } = await request.json();

        if (!dayInRoleId || !userId) {
            return Response.json({ 
                success: false, 
                message: "Day in role ID and user ID are required" 
            }, { status: 400 });
        }

        const supabase = createServiceClient();

        // First, verify the day in role exists and belongs to the user
        const { data: existingDayInRole, error: fetchError } = await supabase
            .from('dayinroles')
            .select('*')
            .eq('id', dayInRoleId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existingDayInRole) {
            return Response.json({ 
                success: false, 
                message: "Day in role not found or unauthorized" 
            }, { status: 404 });
        }

        // Regenerate the day in role content using AI
        const { text: newContent } = await generateText({
            model: google('gemini-2.0-flash-001'),
            maxTokens: 6000,
            prompt: `
You are a senior professional with deep industry experience. Regenerate and improve the day-in-role description for this position with fresh perspectives and different challenges.

Original Data:
- Position: ${existingDayInRole.position}
- Company: ${existingDayInRole.company_name}
- Current Description: ${existingDayInRole.description}
- Current Requirements: ${Array.isArray(existingDayInRole.requirements) ? existingDayInRole.requirements.join(', ') : existingDayInRole.requirements}
- Current Tech Stack: ${Array.isArray(existingDayInRole.techstack) ? existingDayInRole.techstack.join(', ') : existingDayInRole.techstack}

Create a fresh, engaging day-in-role experience with:
1. New daily scenarios and challenges
2. Different work environment perspectives
3. Updated industry insights
4. Enhanced growth opportunities

Return ONLY a JSON object with this structure:
{
  "description": "Fresh 300-500 word description of a typical workday",
  "challenges": [
    {
      "title": "Challenge title",
      "challenge": "Specific challenge description",
      "tips": ["tip1", "tip2", "tip3"],
      "resources": ["resource1", "resource2", "resource3"]
    }
  ],
  "requirements": ["requirement1", "requirement2", "requirement3"],
  "techstack": ["tech1", "tech2", "tech3"]
}
            `,
        });

        // Parse the AI response
        let parsedContent;
        try {
            const cleanedContent = newContent.replace(/```json|```/g, '').trim();
            parsedContent = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            return Response.json({ 
                success: false, 
                message: "Failed to parse AI response" 
            }, { status: 500 });
        }

        // Update the day in role record
        const updateData = {
            description: parsedContent.description || existingDayInRole.description,
            challenges: parsedContent.challenges || existingDayInRole.challenges,
            requirements: parsedContent.requirements || existingDayInRole.requirements,
            techstack: parsedContent.techstack || existingDayInRole.techstack,
            updated_at: new Date().toISOString(),
        };

        const { data: updatedDayInRole, error: updateError } = await supabase
            .from('dayinroles')
            .update(updateData)
            .eq('id', dayInRoleId)
            .eq('user_id', userId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating day in role:', updateError);
            return Response.json({ 
                success: false, 
                message: "Failed to update day in role" 
            }, { status: 500 });
        }

        // Transform data to match expected format
        const transformedData = {
            id: updatedDayInRole.id,
            userId: updatedDayInRole.user_id,
            companyName: updatedDayInRole.company_name,
            companyLogo: updatedDayInRole.company_logo,
            position: updatedDayInRole.position,
            description: updatedDayInRole.description,
            challenges: updatedDayInRole.challenges,
            requirements: updatedDayInRole.requirements,
            techstack: updatedDayInRole.techstack,
            coverImage: updatedDayInRole.cover_image,
            language: updatedDayInRole.language,
            createdAt: updatedDayInRole.created_at,
            updatedAt: updatedDayInRole.updated_at,
        };

        return Response.json({ 
            success: true, 
            data: transformedData,
            message: "Day in role regenerated successfully"
        }, { status: 200 });

    } catch (error) {
        console.error('Error regenerating day in role:', error);
        return Response.json({ 
            success: false, 
            message: "Failed to regenerate day in role" 
        }, { status: 500 });
    }
} 