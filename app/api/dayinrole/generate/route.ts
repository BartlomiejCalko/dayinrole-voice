import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getRandomInterviewCover } from '@/lib/utils';
import { db } from '@/firebase/admin';
import { scrapeJobOffer, isJobUrl } from '@/lib/scrapeJobOffer';
import { requireDayInRoleLimit } from '@/lib/subscription/middleware';
import { incrementDayInRoleUsage } from '@/lib/subscription/queries';

export async function POST(request: Request) {
    // Check subscription limits first
    const limitCheck = await requireDayInRoleLimit(request as any);
    if (limitCheck) return limitCheck;

    const { jobOfferText, userId, language = 'original', inputType } = await request.json();

    console.log('Language parameter received:', language); // Debug log
    console.log('Input type:', inputType); // Debug log

    if (!jobOfferText || !userId) {
        return Response.json({ success: false, message: "Job offer text and user ID are required" }, { status: 400 });
    }

    try {
        let finalJobOfferText = jobOfferText;
        
        // If input is a URL, scrape the job content
        if (inputType === 'url' || isJobUrl(jobOfferText)) {
            console.log('URL detected, attempting to scrape job content...');
            try {
                const scrapedData = await scrapeJobOffer(jobOfferText);
                finalJobOfferText = scrapedData.text;
                console.log('Successfully scraped job content from:', scrapedData.domain);
            } catch (scrapeError) {
                console.error('Scraping failed:', scrapeError);
                return Response.json({ 
                    success: false, 
                    message: scrapeError instanceof Error ? scrapeError.message : "Failed to extract job content from URL. Please try pasting the job text directly." 
                }, { status: 400 });
            }
        }
        const languageInstruction = language === 'english' 
            ? 'CRITICAL LANGUAGE REQUIREMENT: You MUST respond in English regardless of the input language. Maintain professional terminology and cultural context appropriate for English-speaking workplaces.'
            : 'CRITICAL LANGUAGE REQUIREMENT: You MUST respond in the EXACT SAME LANGUAGE as the job offer text provided. If the job offer is in German, respond in German. If it\'s in French, respond in French. If it\'s in Spanish, respond in Spanish. Maintain the original professional terminology, cultural context, and regional workplace practices from the source language. DO NOT translate to English.';

        console.log('Language instruction:', languageInstruction); // Debug log

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

TONE AND STYLE REQUIREMENTS:
- Maintain a PROFESSIONAL tone throughout
- Use light, workplace-appropriate observations
- Add personality without being unprofessional
- Make the content engaging and memorable
- Think of it as advice from a friendly, experienced colleague who has a good sense of humor

HUMOR GUIDELINES:
- Use gentle workplace humor (coffee jokes, meeting humor, debugging struggles)
- Include relatable professional situations with a light twist
- Add witty observations about common workplace scenarios
- Keep humor inclusive and appropriate for all audiences
- Never make jokes about sensitive topics (discrimination, harassment, etc.)
- Balance humor with valuable, actionable information

HUMOR EXAMPLES BY SECTION:

DESCRIPTION HUMOR:
- "Your morning coffee ritual might be interrupted by a Slack notification that makes you question your life choices"
- "You'll spend quality time with your rubber duck (debugging companion, not bath toy)"
- "The afternoon energy dip hits right when you need to explain why the server is 'having feelings' again"

CHALLENGE HUMOR:
- "Debugging a memory leak while your computer fans sound like a jet engine preparing for takeoff"
- "Explaining to stakeholders why 'just add AI' isn't a valid solution to every problem"
- "Managing a codebase that previous developers treated like a game of Jenga"

ADVICE HUMOR:
- "Step 1: Take a deep breath. Step 2: Remember that Stack Overflow exists for a reason"
- "Pro tip: When the build fails, it's not personal - your code just needs a little encouragement"
- "Coffee consumption may increase by 47% during this process (results may vary)"

TIPS HUMOR:
- "Keep a stress ball handy - your keyboard will thank you"
- "Master the art of looking thoughtful while secretly googling error messages"
- "Learn to speak 'manager' - it's like regular English but with more buzzwords"

Job Offer Text:
${finalJobOfferText}

${languageInstruction}

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks. Start your response with { and end with }.

${language === 'original' ? 'FINAL REMINDER: Use the SAME LANGUAGE as the job offer above. If the job offer contains words like "Entwickler", "Développeur", "Desarrollador", or "Programista", use that same language for your entire response.' : 'FINAL REMINDER: Respond in English only.'}

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

CRITICAL GUIDELINES FOR CHALLENGES:
- Each challenge MUST be a specific, real-life scenario someone in this exact role would face
- Include concrete examples, numbers, tools, or situations
- Avoid generic phrases like "meeting deadlines" or "working with teams"
- Make challenges actionable and specific to the industry/role

TITLE EXAMPLES (5-8 words max):
- "Debug Memory Leak Issue"
- "Handle Client Budget Concerns"
- "Fix User Onboarding Flow"
- "Resolve Server Performance Problem"
- "Manage Urgent Bug Fix"

CHALLENGE EXAMPLES:
  * Title: "Debug Memory Leak Issue", Challenge: "Debugging a memory leak in a React application that's causing 30% slower page load times during peak traffic hours"
  * Title: "Handle Client Budget Concerns", Challenge: "Convincing a skeptical client to increase their budget by $50K when they're seeing 20% lower conversion rates than expected"
  * Title: "Fix User Onboarding Flow", Challenge: "Redesigning the user onboarding flow when 40% of new users drop off at the payment step"

CRITICAL GUIDELINES FOR ADVICE:
- Provide SPECIFIC, ACTIONABLE advice that someone could immediately implement
- Include step-by-step approaches or methodologies
- Reference specific tools, frameworks, or techniques relevant to the role
- Make advice practical and realistic for someone in this position
- Examples of GOOD advice:
  * "Start by using Chrome DevTools Memory tab to identify memory leaks, then implement React.memo() for expensive components and use useCallback() to prevent unnecessary re-renders"
  * "Prepare a data-driven presentation showing competitor pricing, ROI calculations, and a phased implementation plan to justify the budget increase"

CRITICAL GUIDELINES FOR TIPS:
- Each tip should be a specific, actionable item (not generic advice)
- Include tools, shortcuts, best practices, or insider knowledge
- Make tips immediately implementable
- Examples of GOOD tips:
  * "Use React DevTools Profiler to identify which components are re-rendering unnecessarily"
  * "Set up automated alerts in New Relic when memory usage exceeds 80%"
  * "Create a simple A/B testing framework using Google Optimize"

CRITICAL GUIDELINES FOR RESOURCES:
- Include specific tools, documentation, courses, or platforms
- Mention exact names of software, libraries, or services
- Reference industry-standard resources that professionals actually use
- Examples of GOOD resources:
  * "React DevTools Chrome Extension"
  * "Web.dev Performance Guidelines"
  * "Coursera's Google Analytics Certification"

EXAMPLES BY ROLE TYPE:
- Developer: Specific bugs, performance issues, integration problems, code review scenarios
- Designer: Specific design problems, user feedback, accessibility issues, design system challenges
- Marketing: Campaign performance issues, budget allocation problems, A/B test results
- Sales: Objection handling, deal closing scenarios, CRM data issues
- Manager: Team conflicts, resource allocation, performance issues
- Data: Data quality problems, analysis requests, reporting challenges

Guidelines:
- Extract company name from the job offer (if not found, infer from context or use "Unknown Company")
- Extract company logo URL if present in the job offer text (look for image URLs, logo links, or company branding assets)
- Extract exact position title from the job offer
- Create an engaging 300-500 word description of a typical workday
- Generate 3 SPECIFIC, REAL-LIFE challenges with concrete details
- List 3-5 key requirements from the job offer
- Extract all technologies, frameworks, and tools mentioned

COMPANY LOGO EXTRACTION:
- Look for any image URLs in the job offer text that might be company logos
- Check for links to company branding assets or media kits
- If no logo URL is found, set companyLogo to null
- Only include valid HTTP/HTTPS URLs for logos
- Do not generate or create fake logo URLs

Make the description realistic and engaging, covering:
- Morning routine and daily tasks
- Team collaboration and meetings
- Problem-solving activities
- Work environment and culture
- Growth and learning opportunities

🚨 FINAL QUALITY CHECK 🚨
Before you finish:
1. Verify that your description is 250-400 words, concise but complete, ending with a complete sentence
2. Verify that each task TITLE is 5-8 words maximum (short and clear)
3. Verify that each challenge description is 60-100 words, focused and complete
4. Verify that tips are actionable and practical (not generic advice)
5. Verify that resources include specific tools, books, or links (not vague references)
6. Ensure NO text is cut off mid-sentence anywhere

REMEMBER: Return ONLY the JSON object, no other text. PRIORITIZE CONCISENESS AND ACTIONABILITY.`,
        });

        // Clean and parse the AI response
        let parsedData;
        try {
            // Remove any potential markdown formatting or extra text
            let cleanedResponse = dayInRoleData.trim();
            
            // Remove markdown code blocks if present
            cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            
            // Find JSON object boundaries
            const startIndex = cleanedResponse.indexOf('{');
            const lastIndex = cleanedResponse.lastIndexOf('}');
            
            if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
                cleanedResponse = cleanedResponse.substring(startIndex, lastIndex + 1);
            }
            
            console.log('AI Response:', cleanedResponse); // Debug log
            
            parsedData = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            console.error('Raw AI response:', dayInRoleData); // Debug log
            
            // Fallback: create a basic response if parsing fails
            parsedData = {
                companyName: "Unknown Company",
                position: "Unknown Position", 
                description: "We couldn't generate a detailed day-in-role description due to a parsing error. Please try again with a different job offer (our AI is having one of those days).",
                challenges: [
                    {
                        challenge: "Resolving a critical production bug that's affecting 15% of users during peak hours while coordinating with the DevOps team (and trying not to panic)",
                        advice: "Start by checking error logs and monitoring dashboards to identify the root cause. Set up a war room with key stakeholders and implement a hotfix while preparing a comprehensive solution. Remember: deep breaths and coffee are your friends.",
                        tips: ["Use error tracking tools like Sentry (your digital detective)", "Set up real-time monitoring alerts (so you know before your users do)", "Document the incident for future reference (and war stories)"],
                        resources: ["Incident Response Playbook", "Error Monitoring Tools Documentation"]
                    },
                    {
                        challenge: "Presenting quarterly performance metrics to stakeholders when the main KPI dropped 8% and explaining the recovery plan (without using the phrase 'it's complicated')",
                        advice: "Prepare a data-driven presentation showing the context behind the drop, competitive analysis, and a detailed recovery roadmap with specific timelines and success metrics. Pro tip: Charts make everything look more professional.",
                        tips: ["Use visual charts to show trends (pictures speak louder than spreadsheets)", "Prepare for tough questions (they will ask about that one outlier)", "Focus on actionable solutions (not just pretty graphs)"],
                        resources: ["Data Visualization Best Practices", "Executive Presentation Templates"]
                    },
                    {
                        challenge: "Managing conflicting priorities when the marketing team needs a feature by Friday but the security audit requires immediate attention (welcome to the juggling act)",
                        advice: "Assess the business impact and risks of both priorities. Communicate transparently with stakeholders about trade-offs and negotiate realistic timelines based on available resources. Diplomacy skills: activated.",
                        tips: ["Use priority matrix frameworks (because everything can't be urgent)", "Document all decisions (for when people ask 'who decided this?')", "Set clear expectations with all parties (manage those expectations like a pro)"],
                        resources: ["Priority Management Frameworks", "Stakeholder Communication Templates"]
                    }
                ],
                requirements: ["Professional experience", "Strong communication skills", "Problem-solving abilities"],
                techstack: []
            };
        }

        // Validate and sanitize the parsed data (NO CHARACTER LIMITS - preserve full content)
        const dayInRole = {
            companyName: (parsedData.companyName || 'Unknown Company').toString(),
            companyLogo: parsedData.companyLogo && typeof parsedData.companyLogo === 'string' && parsedData.companyLogo.startsWith('http') 
                ? parsedData.companyLogo 
                : null,
            position: (parsedData.position || 'Unknown Position').toString(),
            description: (parsedData.description || 'No description available').toString(),
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
                        // Handle legacy string format
                        return {
                            title: "Task",
                            challenge: c.toString(),
                            tips: [],
                            resources: []
                        };
                    }
                })
                : [
                    {
                        challenge: "Troubleshooting a system integration issue where API response times increased by 200% after a recent deployment (because Murphy's Law loves Fridays)",
                        advice: "Use APM tools to identify bottlenecks, check database query performance, and review recent code changes. Implement caching strategies and optimize database queries. Remember: the bug is probably hiding in the last place you'll look.",
                        tips: ["Use APM tools like New Relic (your performance crystal ball)", "Check database connection pools (they might be having a pool party)", "Review recent deployment logs (the truth is in there somewhere)"],
                        resources: ["API Performance Optimization Guide", "Database Tuning Documentation"]
                    },
                    {
                        challenge: "Handling a difficult client meeting where project scope has expanded 40% but timeline remains unchanged (also known as 'scope creep's greatest hits')",
                        advice: "Document all scope changes clearly, present impact analysis showing resource requirements, and propose alternative solutions like phased delivery or additional resources. Channel your inner diplomat.",
                        tips: ["Prepare scope change documentation (evidence is your friend)", "Use visual project timelines (because pictures don't lie)", "Offer multiple solution options (give them choices, not ultimatums)"],
                        resources: ["Project Scope Management Templates", "Client Communication Best Practices"]
                    },
                    {
                        challenge: "Optimizing database queries that are causing page load times to exceed 5 seconds during peak traffic (users are not known for their patience)",
                        advice: "Analyze slow query logs, implement proper indexing, add query caching, and consider database connection pooling. Use profiling tools to identify the most impactful optimizations. Your database will thank you later.",
                        tips: ["Use EXPLAIN to analyze queries (make your database explain itself)", "Implement Redis caching (because faster is always better)", "Monitor query execution times (knowledge is power)"],
                        resources: ["Database Optimization Guide", "Query Performance Tuning Tools"]
                    }
                ],
            requirements: Array.isArray(parsedData.requirements) 
                ? parsedData.requirements.slice(0, 10).map((r: any) => r.toString())
                : ["Professional experience"],
            techstack: Array.isArray(parsedData.techstack) 
                ? parsedData.techstack.slice(0, 10).map((t: any) => t.toString())
                : [],
            userId: userId,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
            language: language,
        };

        // Save to Firebase
        const docRef = await db.collection("dayinroles").add(dayInRole);
        
        // Increment usage after successful generation
        try {
            await incrementDayInRoleUsage(userId);
        } catch (usageError) {
            console.error('Error incrementing day in role usage:', usageError);
            // Don't fail the request if usage tracking fails
        }
        
        return Response.json({ 
            success: true, 
            data: { 
                id: docRef.id, 
                ...dayInRole 
            } 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error generating day in role:', error);
        return Response.json({ success: false, message: "Failed to generate day in role" }, { status: 500 });
    }
} 