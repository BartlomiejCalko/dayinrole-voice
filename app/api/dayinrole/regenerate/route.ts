import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getRandomInterviewCover } from '@/lib/utils';
import { db } from '@/firebase/admin';

export async function POST(request: Request) {
    const { dayInRoleId, userId } = await request.json();

    if (!dayInRoleId || !userId) {
        return Response.json({ success: false, message: "Day in role ID and user ID are required" }, { status: 400 });
    }

    try {
        // Get the existing dayinrole
        const existingDoc = await db.collection("dayinroles").doc(dayInRoleId).get();
        
        if (!existingDoc.exists) {
            return Response.json({ success: false, message: "Day in role not found" }, { status: 404 });
        }

        const existingData = existingDoc.data();
        
        // Verify ownership
        if (existingData?.userId !== userId) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Use the original job offer text if available, otherwise reconstruct from existing data
        const jobOfferText = `
Company: ${existingData.companyName}
Position: ${existingData.position}
Description: ${existingData.description}
Requirements: ${existingData.requirements?.join(', ') || 'Professional experience required'}
Tech Stack: ${existingData.techstack?.join(', ') || 'Various technologies'}
        `.trim();

        const language = existingData.language || 'original';

        const languageInstruction = language === 'english' 
            ? 'CRITICAL LANGUAGE REQUIREMENT: You MUST respond in English regardless of the input language. Maintain professional terminology and cultural context appropriate for English-speaking workplaces.'
            : 'CRITICAL LANGUAGE REQUIREMENT: You MUST respond in the EXACT SAME LANGUAGE as the job offer text provided. If the job offer is in German, respond in German. If it\'s in French, respond in French. If it\'s in Spanish, respond in Spanish. Maintain the original professional terminology, cultural context, and regional workplace practices from the source language. DO NOT translate to English.';

        const { text: dayInRoleData } = await generateText({
            model: google('gemini-2.0-flash-001'),
            maxTokens: 8000, // Increased token limit to ensure complete responses
            prompt: `${languageInstruction}

${language === 'original' ? `
LANGUAGE EXAMPLES:
- If job offer is in German: Respond in German (e.g., "Softwareentwickler", "Teamleitung", "Projektmanagement")
- If job offer is in French: Respond in French (e.g., "Développeur", "Chef d'équipe", "Gestion de projet")  
- If job offer is in Spanish: Respond in Spanish (e.g., "Desarrollador", "Líder de equipo", "Gestión de proyectos")
- If job offer is in Polish: Respond in Polish (e.g., "Programista", "Kierownik zespołu", "Zarządzanie projektami")
DO NOT TRANSLATE TO ENGLISH!
` : 'RESPOND IN ENGLISH ONLY.'}

You are a senior professional with deep industry experience. Analyze the following job offer and generate a comprehensive "day in role" description with SPECIFIC, REAL-LIFE challenges.

🚨 CRITICAL COMPLETENESS REQUIREMENTS 🚨
- NEVER truncate or cut off text mid-sentence or mid-paragraph
- ALWAYS complete your thoughts and finish all sections fully
- MINIMUM word counts are REQUIREMENTS, not suggestions
- Each section must be complete with proper endings
- If you reach any token limits, prioritize completeness over additional content
- Double-check that every sentence ends properly and every paragraph is complete

REGENERATION NOTICE: This is a regeneration of existing content. Make sure to provide COMPLETE, UNTRUNCATED content.

TONE AND STYLE REQUIREMENTS:
- Maintain a PROFESSIONAL tone throughout
- Include SUBTLE, GOOD-TASTE HUMOR that enhances readability
- Use light, workplace-appropriate jokes and witty observations
- Add personality without being unprofessional
- Make the content engaging and memorable
- Think of it as advice from a friendly, experienced colleague who has a good sense of humor

Job Offer Text:
${jobOfferText}

${languageInstruction}

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks. Start your response with { and end with }.

Generate a JSON response with this exact structure:
{
  "companyName": "extracted or inferred company name",
  "companyLogo": "company logo URL if found in the job offer text, otherwise null",
  "position": "job title/position",
  "description": "A concise but engaging description (250-400 words) of what a typical day in this role would like, focusing on key daily activities, important meetings, and work environment. Keep it digestible and practical. ENSURE COMPLETE SENTENCES - DO NOT CUT OFF MID-SENTENCE",
  "challenges": [
          {
        "title": "Short, clear task title (maximum 5-8 words)",
        "challenge": "Specific real-life challenge with concrete example (60-100 words, concise but complete)",
        "tips": ["Actionable tip 1 for solving this challenge", "Practical tip 2 with specific approach", "Quick tip 3 for immediate help"],
        "resources": ["Specific tool/platform (with URL if possible)", "Relevant book or course title", "Documentation or tutorial resource"]
      },
      {
        "title": "Short, clear task title (maximum 5-8 words)",
        "challenge": "Another specific challenge with concrete example (60-100 words, concise but complete)",
        "tips": ["Actionable tip 1 for solving this challenge", "Practical tip 2 with specific approach", "Quick tip 3 for immediate help"],
        "resources": ["Specific tool/platform (with URL if possible)", "Relevant book or course title", "Documentation or tutorial resource"]
      },
      {
        "title": "Short, clear task title (maximum 5-8 words)",
        "challenge": "Third specific challenge with concrete example (60-100 words, concise but complete)",
        "tips": ["Actionable tip 1 for solving this challenge", "Practical tip 2 with specific approach", "Quick tip 3 for immediate help"],
        "resources": ["Specific tool/platform (with URL if possible)", "Relevant book or course title", "Documentation or tutorial resource"]
      }
  ],
  "requirements": ["requirement1", "requirement2", "requirement3"],
  "techstack": ["tech1", "tech2", "tech3"]
}

🚨 FINAL QUALITY CHECK 🚨
Before you finish:
1. Verify that your description is 250-400 words, concise but complete, ending with a complete sentence
2. Verify that each task TITLE is 5-8 words maximum (short and clear)
3. Verify that each challenge description is 60-100 words, focused and complete
4. Verify that tips are actionable and practical (not generic advice)
5. Verify that resources include specific tools, books, or links (not vague references)
6. Ensure NO text is cut off mid-sentence anywhere

REMEMBER: Return ONLY the JSON object, no other text. PRIORITIZE CONCISENESS AND ACTIONABILITY. Provide COMPLETE content without any truncation.`,
        });

        // Parse the AI response
        let parsedData;
        try {
            let cleanedResponse = dayInRoleData.trim();
            cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            const startIndex = cleanedResponse.indexOf('{');
            const lastIndex = cleanedResponse.lastIndexOf('}');
            
            if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
                cleanedResponse = cleanedResponse.substring(startIndex, lastIndex + 1);
            }
            
            parsedData = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            return Response.json({ success: false, message: "Failed to regenerate content" }, { status: 500 });
        }

        // Create updated data with NO character limits
        const updatedDayInRole = {
            ...existingData,
            companyName: (parsedData.companyName || existingData.companyName).toString(),
            position: (parsedData.position || existingData.position).toString(),
            description: (parsedData.description || existingData.description).toString(),
            challenges: Array.isArray(parsedData.challenges) 
                ? parsedData.challenges.slice(0, 3).map((c: any) => {
                    if (typeof c === 'object' && c.challenge) {
                        return {
                            title: c.title ? c.title.toString() : "Task",
                            challenge: c.challenge.toString(),
                            tips: Array.isArray(c.tips) ? c.tips.slice(0, 3).map((t: any) => t.toString()) : [],
                            resources: Array.isArray(c.resources) ? c.resources.slice(0, 3).map((r: any) => r.toString()) : []
                        };
                    } else {
                        return {
                            title: "Task",
                            challenge: c.toString(),
                            tips: [],
                            resources: []
                        };
                    }
                })
                : existingData.challenges || [],
            requirements: Array.isArray(parsedData.requirements) 
                ? parsedData.requirements.slice(0, 10).map((r: any) => r.toString())
                : existingData.requirements || [],
            techstack: Array.isArray(parsedData.techstack) 
                ? parsedData.techstack.slice(0, 10).map((t: any) => t.toString())
                : existingData.techstack || [],
            updatedAt: new Date().toISOString(),
        };

        // Update the document
        await db.collection("dayinroles").doc(dayInRoleId).update(updatedDayInRole);
        
        return Response.json({ 
            success: true, 
            data: { 
                id: dayInRoleId, 
                ...updatedDayInRole 
            } 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error regenerating day in role:', error);
        return Response.json({ success: false, message: "Failed to regenerate day in role" }, { status: 500 });
    }
} 