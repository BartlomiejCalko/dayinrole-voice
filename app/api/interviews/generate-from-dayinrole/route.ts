import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getRandomInterviewCover } from '@/lib/utils';
import { db } from '@/firebase/admin';

// Enhanced language detection function that analyzes job content
function detectLanguageFromJobContent(content: string): string {
  const text = content.toLowerCase();
  
  // Comprehensive language indicators - common words, patterns, and tech terms
  const languageIndicators = {
    polish: [
      'i ', 'w ', 'na ', 'z ', 'do ', 'o ', 'że ', 'się ', 'oraz', 'będzie', 'można', 'powinien', 'zespół', 'projekt',
      'doświadczenie', 'firma', 'praca', 'stanowisko', 'technologie', 'rozwój', 'umiejętności', 'kandydat',
      'anie', 'acja', 'ość', 'enie'
    ],
    french: [
      'et ', 'de ', 'le ', 'la ', 'les ', 'du ', 'des ', 'dans', 'avec', 'pour', 'sur', 'vous', 'nous', 'être', 'avoir',
      'expérience', 'entreprise', 'travail', 'poste', 'technologies', 'développement', 'compétences', 'candidat',
      'tion', 'ment', 'eur', 'euse'
    ],
    german: [
      'und ', 'der ', 'die ', 'das ', 'den ', 'dem ', 'ein ', 'eine', 'mit', 'für', 'auf', 'sie', 'wir', 'sind', 'haben',
      'erfahrung', 'unternehmen', 'arbeit', 'position', 'technologien', 'entwicklung', 'fähigkeiten', 'bewerber',
      'ung', 'keit', 'lich', 'isch'
    ],
    spanish: [
      'y ', 'de ', 'el ', 'la ', 'los ', 'las ', 'en ', 'con', 'para', 'por', 'que', 'del', 'ser', 'estar',
      'experiencia', 'empresa', 'trabajo', 'puesto', 'tecnologías', 'desarrollo', 'habilidades', 'candidato',
      'ción', 'miento', 'ador', 'ista'
    ],
    italian: [
      'e ', 'di ', 'il ', 'la ', 'i ', 'le ', 'del ', 'della', 'con', 'per', 'che', 'essere', 'avere',
      'esperienza', 'azienda', 'lavoro', 'posizione', 'tecnologie', 'sviluppo', 'competenze', 'candidato'
    ],
    portuguese: [
      'e ', 'de ', 'o ', 'a ', 'os ', 'as ', 'do ', 'da', 'com', 'para', 'que', 'ser', 'estar',
      'experiência', 'empresa', 'trabalho', 'posição', 'tecnologias', 'desenvolvimento', 'habilidades', 'candidato'
    ],
    dutch: [
      'en ', 'de ', 'het ', 'van ', 'in ', 'op ', 'met', 'voor', 'bij', 'zijn', 'hebben',
      'ervaring', 'bedrijf', 'werk', 'positie', 'technologieën', 'ontwikkeling', 'vaardigheden', 'kandidaat'
    ],
    russian: [
      'и ', 'в ', 'на ', 'с ', 'для ', 'как ', 'что', 'быть', 'иметь', 'мы', 'вы', 'они',
      'опыт', 'компания', 'работа', 'позиция', 'технологии', 'разработка', 'навыки', 'кандидат'
    ],
    ukrainian: [
      'і ', 'в ', 'на ', 'з ', 'для ', 'як ', 'що', 'бути', 'мати', 'ми', 'ви', 'вони',
      'досвід', 'компанія', 'робота', 'позиція', 'технології', 'розробка', 'навички', 'кандидат'
    ]
  };

  let maxScore = 0;
  let detectedLang = 'english';
  let totalMatches = 0;

  // Calculate scores for each language based on indicator frequency
  for (const [lang, indicators] of Object.entries(languageIndicators)) {
    let score = 0;
    for (const indicator of indicators) {
      const regex = new RegExp(indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = (text.match(regex) || []).length;
      score += matches;
      totalMatches += matches;
    }
    
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  // If no significant indicators found, default to English
  if (totalMatches < 3) {
    detectedLang = 'english';
  }

  return detectedLang;
}

// Get language-specific interview instructions for Gemini
function getLanguageInstructions(language: string): string {
  const instructions = {
    english: "Generate professional interview questions in English.",
    polish: "Generuj profesjonalne pytania rekrutacyjne w języku polskim. Używaj formalnego zwrotu Pan/Pani. Pytania powinny brzmieć naturalnie i profesjonalnie dla native speakerów polskiego.",
    french: "Générez des questions d'entretien professionnelles en français. Utilisez un ton formel et professionnel approprié au contexte d'entreprise français.",
    german: "Generieren Sie professionelle Vorstellungsgesprächsfragen auf Deutsch. Verwenden Sie einen formellen und professionellen Ton, der für deutsche Geschäftsumgebungen angemessen ist.",
    spanish: "Genera preguntas de entrevista profesionales en español. Usa un tono formal y profesional apropiado para el contexto empresarial en español.",
    italian: "Genera domande di colloquio professionali in italiano. Usa un tono formale e professionale appropriato per il contesto aziendale italiano.",
    portuguese: "Gere perguntas de entrevista profissionais em português. Use um tom formal e profissional apropriado para o contexto empresarial em português.",
    dutch: "Genereer professionele sollicitatievragen in het Nederlands. Gebruik een formele en professionele toon die geschikt is voor Nederlandse bedrijfscontexten.",
    russian: "Создайте профессиональные вопросы для собеседования на русском языке. Используйте формальный и профессиональный тон, подходящий для российского корпоративного контекста.",
    ukrainian: "Створіть професійні питання для співбесіди українською мовою. Використовуйте формальний та професійний тон, відповідний для українського корпоративного контексту."
  };

  return instructions[language as keyof typeof instructions] || instructions.english;
}

export async function POST(request: Request) {
    try {
        const { 
            dayInRoleId, 
            userId, 
            questionCount, 
            role, 
            companyName, 
            techstack 
        } = await request.json();

        // Validate required fields
        if (!dayInRoleId || !userId || !role || !companyName) {
            return Response.json({ 
                success: false, 
                message: "Missing required fields: dayInRoleId, userId, role, or companyName" 
            }, { status: 400 });
        }

        // Get the dayinrole data for context
        const dayInRoleDoc = await db.collection("dayinroles").doc(dayInRoleId).get();
        
        if (!dayInRoleDoc.exists) {
            return Response.json({ success: false, message: "DayInRole not found" }, { status: 404 });
        }

        const dayInRoleData = dayInRoleDoc.data();

        // Detect the language of the job offer content
        const jobContent = `${dayInRoleData?.description || ''} ${dayInRoleData?.challenges?.map((c: unknown) => typeof c === 'string' ? c : (c as { challenge: string })?.challenge).join(' ') || ''} ${dayInRoleData?.requirements?.join(' ') || ''}`;
        const detectedLanguage = detectLanguageFromJobContent(jobContent);
        
        console.log('Detected job offer language:', detectedLanguage);

        // Automatically determine interview level and type from job data
        const analysisPrompt = `
Analyze this job position and determine the appropriate interview level and type:

Position: ${role}
Company: ${companyName}
Tech Stack: ${techstack}
Requirements: ${dayInRoleData?.requirements?.join(', ') ?? 'Standard requirements'}
Description: ${dayInRoleData?.description ?? ''}

Based on the following criteria:

LEVEL (choose one):
- junior: 0-2 years experience, entry-level positions, basic skills required
- mid: 2-5 years experience, solid foundation, some leadership aspects
- senior: 5+ years experience, advanced skills, mentoring, architecture decisions
- lead: 8+ years experience, team leadership, strategic decisions, principal engineer

TYPE (choose one):
- technical: Focus on coding, system design, problem-solving, technical knowledge
- behavioral: Focus on teamwork, communication, leadership, past experiences
- balanced: Mix of both technical and behavioral questions

Return ONLY a JSON object with this exact format:
{"level": "mid", "type": "technical"}
        `;

        console.log('Analyzing job requirements to determine interview parameters...');
        
        const { text: analysisText } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: analysisPrompt,
        });

        console.log('Analysis Response:', analysisText);

        // Parse the analysis result
        let analysisResult;
        try {
            let cleanedAnalysis = analysisText.trim();
            if (cleanedAnalysis.startsWith('```json')) {
                cleanedAnalysis = cleanedAnalysis.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanedAnalysis.startsWith('```')) {
                cleanedAnalysis = cleanedAnalysis.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            analysisResult = JSON.parse(cleanedAnalysis);
            
            // Validate the analysis result
            const validLevels = ['junior', 'mid', 'senior', 'lead'];
            const validTypes = ['technical', 'behavioral', 'balanced'];
            
            if (!validLevels.includes(analysisResult.level)) {
                analysisResult.level = 'mid'; // Default fallback
            }
            
            if (!validTypes.includes(analysisResult.type)) {
                analysisResult.type = 'balanced'; // Default fallback
            }
            
        } catch (parseError) {
            console.error('Analysis parsing failed:', parseError);
            // Use intelligent defaults based on role and tech stack
            analysisResult = {
                level: determineDefaultLevel(role),
                type: determineDefaultType(role)
            };
        }

        const { level, type: interviewType } = analysisResult;
        
        console.log('Determined interview parameters:', { level, interviewType });

        // Create a focused prompt based on the day-in-role context with language awareness
        const languageInstructions = getLanguageInstructions(detectedLanguage);
        
        const contextPrompt = `
You are an expert interview coach creating professional interview questions for a ${role} position at ${companyName}.

CRITICAL LANGUAGE REQUIREMENT: ${languageInstructions}
The original job offer was written in ${detectedLanguage}. You MUST generate ALL questions in the same language (${detectedLanguage}) to match the job offer's language.

INTERVIEW CONTEXT:
- Position: ${role}
- Company: ${companyName}
- Tech Stack: ${techstack}
- Interview Level: ${level} (junior/mid/senior/lead)
- Interview Focus: ${interviewType}
- Language: ${detectedLanguage}

JOB REQUIREMENTS AND SKILLS:
${dayInRoleData?.requirements?.join('\n- ') ?? 'Standard requirements'}

JOB DESCRIPTION CONTEXT:
${dayInRoleData?.description ?? 'Standard role description'}

QUESTION GENERATION GUIDELINES:

1. **REALISTIC INTERVIEW QUESTIONS ONLY**
   - Create questions that would actually be asked in a professional interview
   - Avoid emergency scenarios, crisis situations, or unrealistic technical emergencies
   - Focus on skills, experience, problem-solving approaches, and professional scenarios

2. **APPROPRIATE QUESTION TYPES**:
${interviewType === 'technical' ? 
   `- Technical knowledge questions about ${techstack}
   - System design and architecture questions appropriate for ${level} level
   - Problem-solving scenarios related to software development
   - Code quality, testing, and best practices questions
   - Experience with relevant technologies and frameworks` :
  interviewType === 'behavioral' ? 
   `- Past experience and achievements questions
   - Team collaboration and communication scenarios
   - Leadership and conflict resolution situations
   - Professional growth and learning experiences
   - Company culture fit and motivation questions` :
   `- Mix of technical knowledge and behavioral scenarios
   - Problem-solving approaches in professional contexts
   - Experience questions related to both technical and soft skills
   - Questions about working in teams and handling projects`}

3. **LANGUAGE AND TONE**:
   - Use professional, conversational tone appropriate for ${detectedLanguage}
   - Questions should sound natural to native speakers
   - Maintain appropriate formality level for business interviews in ${detectedLanguage}

4. **QUESTION QUALITY**:
   - Each question should test relevant skills for this ${role} position
   - Questions should be appropriate for ${level} level candidates
   - Avoid overly specific technical scenarios or emergency situations
   - Focus on general professional competencies and relevant technical knowledge

EXAMPLES OF GOOD INTERVIEW QUESTIONS:
- Experience and background questions
- Technical knowledge within the job's tech stack
- Problem-solving approach questions
- Team collaboration scenarios
- Professional development and learning
- Motivation and company fit questions

EXAMPLES TO AVOID:
- Emergency repair scenarios
- Crisis management in extreme conditions
- Overly specific technical breakdowns
- Unrealistic workplace emergencies

Generate exactly ${questionCount} professional interview questions in ${detectedLanguage}.

RESPONSE FORMAT:
Return ONLY a valid JSON array of strings. No explanations, no markdown, no additional text.
Example: ["Question 1", "Question 2", "Question 3"]
        `;

        console.log('Generating interview questions with AI...');
        
        const { text: questionsText } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: contextPrompt,
        });

        console.log('AI Response:', questionsText);

        // Clean the response text - remove markdown formatting if present
        let cleanedText = questionsText.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Parse the questions
        let questions;
        try {
            questions = JSON.parse(cleanedText);
            
            // Validate that it's an array
            if (!Array.isArray(questions)) {
                throw new Error('Response is not an array');
            }
            
            // Validate that all items are strings
            if (!questions.every(q => typeof q === 'string')) {
                throw new Error('Not all questions are strings');
            }
            
            // Validate question count
            if (questions.length === 0) {
                throw new Error('No questions generated');
            }
            
        } catch (parseError) {
            console.error('JSON parsing failed:', parseError);
            console.error('Raw AI response:', questionsText);
            
            // Try to extract questions from text if JSON parsing fails
            const fallbackQuestions = extractQuestionsFromText(cleanedText, parseInt(questionCount));
            if (fallbackQuestions.length > 0) {
                questions = fallbackQuestions;
                console.log('Using fallback question extraction:', questions);
            } else {
                return Response.json({ 
                    success: false, 
                    message: `Failed to parse AI response as JSON. Raw response: ${questionsText.substring(0, 200)}...`
                }, { status: 500 });
            }
        }

        const interview = {
            role,
            type: interviewType,
            level,
            techstack: techstack ? techstack.split(",").map((t: string) => t.trim()) : [],
            questions,
            userId,
            dayInRoleId,
            companyName,
            questionCount: parseInt(questionCount),
            language: detectedLanguage,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
            completedAttempts: 0, // Track how many times user has taken this interview
        };

        console.log('Creating interview document in Firestore...');
        const docRef = await db.collection("interviews").add(interview);
        console.log('Interview created successfully with ID:', docRef.id);
        
        return Response.json({ 
            success: true, 
            data: { 
                id: docRef.id, 
                ...interview 
            } 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error generating interview from dayinrole:', error);
        
        // Provide more specific error messages
        let errorMessage = "Failed to generate interview";
        if (error instanceof Error) {
            errorMessage = `Failed to generate interview: ${error.message}`;
        }
        
        return Response.json({ 
            success: false, 
            message: errorMessage
        }, { status: 500 });
    }
}

// Helper function to determine default level based on role and tech stack
function determineDefaultLevel(role: string): string {
    const roleLower = role.toLowerCase();
    
    // Check for explicit level indicators in role title
    if (roleLower.includes('junior') || roleLower.includes('intern') || roleLower.includes('entry')) {
        return 'junior';
    }
    if (roleLower.includes('senior') || roleLower.includes('sr.')) {
        return 'senior';
    }
    if (roleLower.includes('lead') || roleLower.includes('principal') || roleLower.includes('architect')) {
        return 'lead';
    }
    
    // Default to mid-level
    return 'mid';
}

// Helper function to determine default type based on role and tech stack
function determineDefaultType(role: string): string {
    const roleLower = role.toLowerCase();
    
    // Check for management/leadership roles
    if (roleLower.includes('manager') || roleLower.includes('lead') || roleLower.includes('director')) {
        return 'behavioral';
    }
    
    // Check for highly technical roles
    if (roleLower.includes('developer') || roleLower.includes('engineer') || 
        roleLower.includes('programmer') || roleLower.includes('architect')) {
        // If it's a technical role but has management aspects
        if (roleLower.includes('lead') || roleLower.includes('senior')) {
            return 'balanced';
        }
        return 'technical';
    }
    
    // Default to balanced for other roles
    return 'balanced';
}

// Helper function to extract questions from text when JSON parsing fails
function extractQuestionsFromText(text: string, expectedCount: number): string[] {
    const questions: string[] = [];
    
    // Try to find questions in various formats
    const patterns = [
        /^\d+\.\s*(.+?)(?=\n\d+\.|\n*$)/gm, // "1. Question"
        /^[\-\*]\s*(.+?)(?=\n[\-\*]|\n*$)/gm, // "- Question" or "* Question"
        /^"(.+?)"$/gm, // "Question"
        /Question \d+:?\s*(.+?)(?=Question \d+:|$)/gm, // "Question 1: ..."
    ];
    
    for (const pattern of patterns) {
        const matches = Array.from(text.matchAll(pattern));
        if (matches.length > 0) {
            matches.forEach(match => {
                const question = match[1]?.trim();
                if (question && question.length > 10) {
                    questions.push(question);
                }
            });
            if (questions.length >= expectedCount) break;
        }
    }
    
    // If no patterns match, try splitting by lines and filtering
    if (questions.length === 0) {
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 10 && line.includes('?'))
            .slice(0, expectedCount);
        questions.push(...lines);
    }
    
    return questions.slice(0, expectedCount);
} 