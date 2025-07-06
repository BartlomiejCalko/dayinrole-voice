import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createServiceClient } from '@/utils/supabase/server';
import { requireInterviewLimit } from '@/lib/subscription/middleware';
import { incrementInterviewUsage } from '@/lib/subscription/queries';

// Enhanced language detection function that analyzes job content
function detectLanguageFromJobContent(content: string): string {
  const text = content.toLowerCase();
  
  // Comprehensive language indicators - common words, patterns, and tech terms
  const languageIndicators = {
    polish: [
      'i ', 'w ', 'na ', 'z ', 'do ', 'o ', 'że ', 'się ', 'oraz', 'będzie', 'można', 'powinien', 'zespół', 'projekt',
      'doświadczenie', 'firma', 'praca', 'stanowisko', 'technologie', 'rozwój', 'umiejętności', 'kandydat',
      'oferujemy', 'wymagania', 'wymagany', 'wykształcenie', 'znajomość', 'preferowane', 'mile widziane',
      'współpracy', 'realizacji', 'oprogramowania', 'aplikacji', 'systemów', 'bazy danych',
      'anie', 'acja', 'ość', 'enie', 'ować', 'nych', 'owy', 'owe'
    ],
    french: [
      'et ', 'de ', 'le ', 'la ', 'les ', 'du ', 'des ', 'dans', 'avec', 'pour', 'sur', 'vous', 'nous', 'être', 'avoir',
      'expérience', 'entreprise', 'travail', 'poste', 'technologies', 'développement', 'compétences', 'candidat',
      'recherche', 'offrons', 'exigences', 'formation', 'connaissance', 'maîtrise', 'collaboration',
      'tion', 'ment', 'eur', 'euse', 'ique', 'aire'
    ],
    german: [
      'und ', 'der ', 'die ', 'das ', 'den ', 'dem ', 'ein ', 'eine', 'mit', 'für', 'auf', 'sie', 'wir', 'sind', 'haben',
      'erfahrung', 'unternehmen', 'arbeit', 'position', 'technologien', 'entwicklung', 'fähigkeiten', 'bewerber',
      'suchen', 'bieten', 'anforderungen', 'ausbildung', 'kenntnisse', 'zusammenarbeit', 'software',
      'ung', 'keit', 'lich', 'isch', 'ität', 'ieren'
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
    ],
    norwegian: [
      'og ', 'av ', 'i ', 'til ', 'for ', 'med', 'på', 'er', 'å', 'det', 'vi', 'du', 'deg', 'være', 'har', 'kan',
      'erfaring', 'selskap', 'arbeid', 'stilling', 'teknologi', 'utvikling', 'ferdigheter', 'kandidat',
      'søker', 'tilbyr', 'krav', 'utdanning', 'kunnskap', 'samarbeid', 'ansvar', 'muligheter'
    ],
    danish: [
      'og ', 'af ', 'i ', 'til ', 'for ', 'med', 'på', 'er', 'at', 'det', 'vi', 'du', 'dig', 'være', 'har', 'kan',
      'erfaring', 'virksomhed', 'arbejde', 'stilling', 'teknologi', 'udvikling', 'færdigheder', 'kandidat',
      'søger', 'tilbyder', 'krav', 'uddannelse', 'viden', 'samarbejde', 'ansvar', 'muligheder'
    ],
    swedish: [
      'och ', 'av ', 'i ', 'till ', 'för ', 'med', 'på', 'är', 'att', 'det', 'vi', 'du', 'dig', 'vara', 'har', 'kan',
      'erfarenhet', 'företag', 'arbete', 'tjänst', 'teknik', 'utveckling', 'färdigheter', 'kandidat',
      'söker', 'erbjuder', 'krav', 'utbildning', 'kunskap', 'samarbete', 'ansvar', 'möjligheter'
    ]
  };

  let maxScore = 0;
  let detectedLang = 'english';
  let totalMatches = 0;
  const scores: Record<string, number> = {};

  // Calculate scores for each language based on indicator frequency
  for (const [lang, indicators] of Object.entries(languageIndicators)) {
    let score = 0;
    for (const indicator of indicators) {
      const regex = new RegExp(indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = (text.match(regex) || []).length;
      score += matches;
      totalMatches += matches;
    }
    
    scores[lang] = score;
    
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  // Log detection results for debugging
  console.log('Language detection scores:', scores);
  console.log('Total matches found:', totalMatches);
  console.log('Detected language:', detectedLang, 'with score:', maxScore);

  // If no significant indicators found, default to English
  if (totalMatches < 3) {
    console.log('Not enough language indicators found, defaulting to English');
    detectedLang = 'english';
  }

  return detectedLang;
}

// Get language-specific interview instructions for Gemini
function getLanguageInstructions(language: string): string {
  const instructions = {
    english: "You MUST generate ALL interview questions in ENGLISH only. Use professional business English appropriate for corporate interviews.",
    polish: "Musisz wygenerować WSZYSTKIE pytania rekrutacyjne WYŁĄCZNIE w języku POLSKIM. Używaj formalnego zwrotu Pan/Pani. Pytania muszą brzmieć naturalnie i profesjonalnie dla native speakerów polskiego. Żadne słowo nie może być w języku angielskim.",
    french: "Vous DEVEZ générer TOUTES les questions d'entretien EXCLUSIVEMENT en FRANÇAIS. Utilisez un ton formel et professionnel approprié au contexte d'entreprise français. Aucun mot ne doit être en anglais.",
    german: "Sie MÜSSEN ALLE Vorstellungsgesprächsfragen AUSSCHLIESSLICH auf DEUTSCH generieren. Verwenden Sie einen formellen und professionellen Ton, der für deutsche Geschäftsumgebungen angemessen ist. Kein Wort darf auf Englisch sein.",
    spanish: "Debes generar TODAS las preguntas de entrevista EXCLUSIVAMENTE en ESPAÑOL. Usa un tono formal y profesional apropiado para el contexto empresarial en español. Ninguna palabra debe estar en inglés.",
    italian: "Devi generare TUTTE le domande di colloquio ESCLUSIVAMENTE in ITALIANO. Usa un tono formale e professionale appropriato per il contesto aziendale italiano. Nessuna parola deve essere in inglese.",
    portuguese: "Você DEVE gerar TODAS as perguntas de entrevista EXCLUSIVAMENTE em PORTUGUÊS. Use um tom formal e profissional apropriado para o contexto empresarial em português. Nenhuma palavra deve estar em inglês.",
    dutch: "Je MOET ALLE sollicitatievragen UITSLUITEND in het NEDERLANDS genereren. Gebruik een formele en professionele toon die geschikt is voor Nederlandse bedrijfscontexten. Geen enkel woord mag in het Engels zijn.",
    russian: "Вы ДОЛЖНЫ создать ВСЕ вопросы для собеседования ИСКЛЮЧИТЕЛЬНО на РУССКОМ языке. Используйте формальный и профессиональный тон, подходящий для российского корпоративного контекста. Ни одного слова не должно быть на английском языке.",
    ukrainian: "Ви ПОВИННІ створити ВСІ питання для співбесіди ВИКЛЮЧНО українською мовою. Використовуйте формальний та професійний тон, відповідний для українського корпоративного контексту. Жодного слова не повинно бути англійською мовою.",
    norwegian: "Du MÅ generere ALLE intervjuspørsmål UTELUKKENDE på NORSK. Bruk en formell og profesjonell tone som passer for norske bedriftskontekster. Ikke et eneste ord skal være på engelsk.",
    danish: "Du SKAL generere ALLE interviewspørgsmål UDELUKKENDE på DANSK. Brug en formel og professionel tone, der passer til danske virksomhedskontekster. Ikke et eneste ord må være på engelsk.",
    swedish: "Du MÅSTE generera ALLA intervjufrågor UTESLUTANDE på SVENSKA. Använd en formell och professionell ton som passar svenska företagskontexter. Inte ett enda ord får vara på engelska."
  };

  return instructions[language as keyof typeof instructions] || instructions.english;
}

export async function POST(request: Request) {
    try {
        // Check subscription limits first
        const limitCheck = await requireInterviewLimit(request as any);
        if (limitCheck) return limitCheck;

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

        const supabase = createServiceClient();

        // Get the dayinrole data for context
        const { data: dayInRole, error: dayInRoleError } = await supabase
            .from('dayinroles')
            .select('*')
            .eq('id', dayInRoleId)
            .eq('user_id', userId)
            .single();
        
        if (dayInRoleError || !dayInRole) {
            return Response.json({ 
                success: false, 
                message: "Day in role not found or unauthorized" 
            }, { status: 404 });
        }

        const dayInRoleData = dayInRole;

        // Get the language from dayinrole if explicitly set, otherwise detect from content
        let detectedLanguage = dayInRoleData?.language || 'english';
        console.log('Initial language from dayinrole:', dayInRoleData?.language);
        
        // Prepare job content for language detection
        const jobContent = `
            ${dayInRoleData?.title || ''} 
            ${dayInRoleData?.description || ''} 
            ${dayInRoleData?.requirements?.join(' ') || ''} 
            ${dayInRoleData?.responsibilities?.join(' ') || ''} 
            ${dayInRoleData?.challenges?.map((c: unknown) => typeof c === 'string' ? c : (c as { challenge: string })?.challenge).join(' ') || ''} 
            ${dayInRoleData?.benefits?.join(' ') || ''} 
            ${dayInRoleData?.companyDescription || ''}
        `.trim();
        
        // If language is not explicitly set, try to detect from all content
        if (!dayInRoleData?.language || dayInRoleData.language === 'auto') {
            detectedLanguage = detectLanguageFromJobContent(jobContent);
        }
        
        console.log('=== LANGUAGE DETECTION DEBUG ===');
        console.log('DayInRole language field:', dayInRoleData?.language);
        console.log('Detected job offer language:', detectedLanguage);
        console.log('Job content sample for language detection:', jobContent.substring(0, 300) + '...');
        console.log('Job title:', dayInRoleData?.title);
        console.log('Company name:', companyName);
        console.log('=== END LANGUAGE DETECTION DEBUG ===');

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

        // Check for existing interviews to ensure uniqueness
        console.log('Checking for existing interviews to ensure question uniqueness...');
        const { data: existingInterviews, error: existingError } = await supabase
            .from('interviews')
            .select('questions')
            .eq('dayinrole_id', dayInRoleId)
            .eq('user_id', userId);

        const existingQuestions: string[] = [];
        if (!existingError && existingInterviews) {
            existingInterviews.forEach((interview) => {
                if (interview.questions && Array.isArray(interview.questions)) {
                    existingQuestions.push(...interview.questions);
                }
            });
        }

        console.log(`Found ${existingQuestions.length} existing questions to avoid`);

        // Create a focused prompt based on the day-in-role context with language awareness
        const languageInstructions = getLanguageInstructions(detectedLanguage);
        
        const contextPrompt = `
You are an expert interview coach creating professional interview questions for a ${role} position at ${companyName}.

🚨 ABSOLUTELY CRITICAL LANGUAGE REQUIREMENT 🚨
${languageInstructions}

MANDATORY LANGUAGE RULES:
- The job offer is in ${detectedLanguage.toUpperCase()}
- You MUST write ALL questions EXCLUSIVELY in ${detectedLanguage.toUpperCase()} 
- Every single word, phrase, and sentence MUST be in ${detectedLanguage.toUpperCase()}
- Do NOT mix languages or use English if the target language is different
- The questions must sound natural and professional to native ${detectedLanguage} speakers
- Use proper ${detectedLanguage} grammar, syntax, and professional terminology

❌ WRONG: Mixing English with other languages
✅ CORRECT: Pure ${detectedLanguage.toUpperCase()} throughout

${existingQuestions.length > 0 ? `
🔄 QUESTION UNIQUENESS REQUIREMENT:
You MUST create completely NEW and UNIQUE questions. The user has already generated ${existingQuestions.length} questions for this position.

QUESTIONS TO AVOID (do NOT create similar or duplicate questions):
${existingQuestions.slice(0, 20).map((q, i) => `${i + 1}. ${q}`).join('\n')}

Create questions that are:
- Completely different in wording and focus
- Cover different aspects of the role
- Ask about different skills, experiences, or scenarios
- Have unique angles and perspectives
` : ''}

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

🎯 FINAL VERIFICATION CHECKLIST:
✅ All questions are in ${detectedLanguage.toUpperCase()} ONLY
✅ No English words if target language is not English  
✅ Questions are unique and different from existing ones
✅ Professional tone appropriate for ${detectedLanguage} business context
✅ Questions test relevant skills for ${level} ${role} position
✅ Proper ${detectedLanguage} grammar and terminology

RESPONSE FORMAT:
Return ONLY a valid JSON array of strings in ${detectedLanguage.toUpperCase()}. No explanations, no markdown, no additional text.

EXAMPLE FOR ${detectedLanguage.toUpperCase()}:
${detectedLanguage === 'norwegian' ? '["Kan du fortelle meg om din yrkeserfaring?", "Hvordan vil du håndtere en misfornøyd kunde?", "Hva er dine karrieremål?"]' :
  detectedLanguage === 'danish' ? '["Kan du fortælle om din erhvervserfaring?", "Hvordan vil du håndtere en utilfreds kunde?", "Hvad er dine karrieremål?"]' :
  detectedLanguage === 'swedish' ? '["Kan du berätta om din yrkeslivserfarenhet?", "Hur skulle du hantera en missnöjd kund?", "Vilka är dina karriärmål?"]' :
  detectedLanguage === 'portuguese' ? '["Pode falar-me sobre a sua experiência profissional?", "Como lidaria com um cliente insatisfeito?", "Quais são os seus objetivos profissionais?"]' :
  detectedLanguage === 'polish' ? '["Może Pan/Pani opowiedzieć o swoim doświadczeniu zawodowym?", "Jak poradziłby Pan/Pani sobie z niezadowolonym klientem?", "Jakie są Pana/Pani cele zawodowe?"]' :
  detectedLanguage === 'french' ? '["Pouvez-vous me parler de votre expérience professionnelle?", "Comment géreriez-vous un client mécontent?", "Quels sont vos objectifs professionnels?"]' :
  detectedLanguage === 'german' ? '["Können Sie mir von Ihrer beruflichen Erfahrung erzählen?", "Wie würden Sie mit einem unzufriedenen Kunden umgehen?", "Was sind Ihre beruflichen Ziele?"]' :
  detectedLanguage === 'spanish' ? '["¿Puede hablarme de su experiencia profesional?", "¿Cómo manejaría a un cliente insatisfecho?", "¿Cuáles son sus objetivos profesionales?"]' :
  '["Can you tell me about your professional experience?", "How would you handle an unsatisfied client?", "What are your professional goals?"]'}
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

            // Validate language consistency (improved check)
            if (detectedLanguage !== 'english') {
                const questionsText = questions.join(' ').toLowerCase();
                console.log('Checking language consistency for:', detectedLanguage);
                console.log('Questions text sample:', questionsText.substring(0, 200));
                
                // Check for obvious English patterns
                const englishPatterns = [
                    /\b(you|your|the|and|can|tell|about|what|how|why|when|where)\b/g,
                    /\b(experience|work|position|company|interview|questions|generated|english|templates|available|note)\b/g,
                    /\b(describe|explain|discuss|handle|manage|think|feel|would|could|should)\b/g
                ];
                
                let englishMatches = 0;
                englishPatterns.forEach(pattern => {
                    const matches = questionsText.match(pattern);
                    if (matches) {
                        englishMatches += matches.length;
                    }
                });
                
                console.log('English words/patterns found:', englishMatches);
                
                if (englishMatches > 5) {
                    console.error(`ERROR: Generated questions contain too many English words/patterns (${englishMatches}) for target language: ${detectedLanguage}`);
                    console.error('Generated questions:', questions);
                    
                    return Response.json({ 
                        success: false, 
                        message: `Interview questions were generated in wrong language. Expected ${detectedLanguage} but detected English patterns. Please try again.`,
                        details: {
                            expectedLanguage: detectedLanguage,
                            englishPatternsFound: englishMatches,
                            generatedQuestions: questions
                        }
                    }, { status: 422 });
                }
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
            user_id: userId,
            dayinrole_id: dayInRoleId,
            role,
            type: interviewType,
            level,
            techstack: techstack ? techstack.split(",").map((t: string) => t.trim()) : [],
            questions,
            finalized: true,
            created_at: new Date().toISOString(),
            completed_attempts: 0, // Track how many times user has taken this interview
        };

        console.log('Creating interview document in Supabase...');
        const { data: savedInterview, error: saveError } = await supabase
            .from('interviews')
            .insert(interview)
            .select()
            .single();

        if (saveError) {
            console.error('Error saving interview:', saveError);
            return Response.json({ 
                success: false, 
                message: "Failed to save interview" 
            }, { status: 500 });
        }
        
        // Increment usage after successful generation
        try {
            await incrementInterviewUsage(userId);
        } catch (usageError) {
            console.error('Error incrementing interview usage:', usageError);
            // Don't fail the request if usage tracking fails
        }
        
        return Response.json({ 
            success: true, 
            data: { 
                id: savedInterview.id,
                ...interview 
            } 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error generating interview from day in role:', error);
        
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