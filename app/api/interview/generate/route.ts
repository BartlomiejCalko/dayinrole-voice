import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createServiceClient } from '@/utils/supabase/server';
import { InterviewGenerateSchema } from '@/lib/validation/interview';
import { apiError } from '@/lib/api/response';
import { buildRateKey, rateLimit } from '@/lib/rate-limit';

interface InterviewQuestion {
  id: string;
  question: string;
  sampleAnswer: string;
  category: string;
}

interface GenerateQuestionsRequest {
  dayInRole: DayInRole;
  numberOfQuestions: number;
  userId: string;
}

interface InterviewQuestionSet {
  id: string;
  dayInRoleId: string;
  userId: string;
  questions: InterviewQuestion[];
  numberOfQuestions: number;
  language: string;
  createdAt: string;
  dayInRoleTitle: string;
}

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
      'experiência', 'empresa', 'trabalho', 'posição', 'tecnologias', 'desenvolvimento', 'habilidades', 'candidato',
      'procuramos', 'oferecemos', 'requisitos', 'formação', 'conhecimento', 'colaboração', 'responsabilidades',
      'ção', 'mente', 'ador', 'agem', 'ável', 'idade', 'ismo'
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

  const scores: Record<string, number> = {};
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
    
    scores[lang] = score;
    
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  console.log('Language detection scores:', scores);
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
        const raw = await request.json();
        const parsedBody = InterviewGenerateSchema.safeParse(raw);
        if (!parsedBody.success) {
            return apiError('Invalid request body', 400, { issues: parsedBody.error.flatten() });
        }
        const { dayInRole, numberOfQuestions, userId }: GenerateQuestionsRequest = parsedBody.data as any;

        // Simple rate limit: 15 requests / 60s per user+IP for question generation
        const rl = rateLimit({ key: buildRateKey(request as any, userId, 'api:interview:generate'), limit: 15, windowMs: 60_000 });
        if (!rl.allowed) {
            return apiError('Too many requests. Please slow down.', 429);
        }

        if (!dayInRole || !numberOfQuestions || !userId) {
            return Response.json({ 
                success: false, 
                message: "Missing required fields" 
            }, { status: 400 });
        }

        // Validate number of questions
        const numQuestions = Math.max(3, Math.min(15, numberOfQuestions));

        // Get the language from dayinrole if explicitly set, otherwise detect from content
        let detectedLanguage: string = dayInRole?.language || 'english';
        console.log('Initial language from dayinrole:', dayInRole?.language);
        
        // Prepare job content for language detection
        const jobContent = `
            ${dayInRole?.position || ''} 
            ${dayInRole?.description || ''} 
            ${dayInRole?.requirements?.join(' ') || ''} 
            ${dayInRole?.challenges?.map((c: unknown) => typeof c === 'string' ? c : (c as { challenge: string })?.challenge).join(' ') || ''} 
        `.trim();
        
        // If language is not explicitly set or is 'original', try to detect from all content
        if (!dayInRole?.language || dayInRole.language === 'original') {
            detectedLanguage = detectLanguageFromJobContent(jobContent);
        }
        
        console.log('=== LANGUAGE DETECTION DEBUG ===');
        console.log('DayInRole language field:', dayInRole?.language);
        console.log('Detected job offer language:', detectedLanguage);
        console.log('Job content sample for language detection:', jobContent.substring(0, 300) + '...');
                 console.log('Job position:', dayInRole?.position);
        console.log('Company name:', dayInRole?.companyName);
        console.log('=== END LANGUAGE DETECTION DEBUG ===');

        // Create AI prompt for generating questions
        const languageInstructions = getLanguageInstructions(detectedLanguage);
        
        const prompt = `
You are an expert interview coach creating professional interview questions for a ${dayInRole.position} position at ${dayInRole.companyName}.

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

JOB DETAILS:
- Position: ${dayInRole.position}
- Company: ${dayInRole.companyName}
- Tech Stack: ${dayInRole.techstack?.join(', ') || 'General'}
- Requirements: ${dayInRole.requirements?.join(', ') || 'Standard requirements'}
- Description: ${dayInRole.description || ''}

Generate exactly ${numQuestions} professional interview questions in ${detectedLanguage.toUpperCase()}.

RESPONSE FORMAT:
Return ONLY a valid JSON array of objects with this structure:
[
  {
    "question": "Question text in ${detectedLanguage}",
    "sampleAnswer": "Sample answer text in ${detectedLanguage}",
    "category": "Category name in ${detectedLanguage}"
  }
]

EXAMPLE FOR ${detectedLanguage.toUpperCase()}:
${detectedLanguage === 'norwegian' ? `[
  {
    "question": "Kan du fortelle meg om din yrkeserfaring?",
    "sampleAnswer": "Jeg har X års erfaring innen...",
    "category": "Generell"
  }
]` :
  detectedLanguage === 'danish' ? `[
  {
    "question": "Kan du fortælle om din erhvervserfaring?",
    "sampleAnswer": "Jeg har X års erfaring inden for...",
    "category": "Generel"
  }
]` :
  detectedLanguage === 'swedish' ? `[
  {
    "question": "Kan du berätta om din yrkeslivserfarenhet?",
    "sampleAnswer": "Jag har X års erfarenhet inom...",
    "category": "Allmän"
  }
]` :
  detectedLanguage === 'portuguese' ? `[
  {
    "question": "Pode falar-me sobre a sua experiência profissional?",
    "sampleAnswer": "Tenho X anos de experiência em...",
    "category": "Geral"
  }
]` :
  detectedLanguage === 'polish' ? `[
  {
    "question": "Może Pan/Pani opowiedzieć o swoim doświadczeniu zawodowym?",
    "sampleAnswer": "Mam X lat doświadczenia w...",
    "category": "Ogólne"
  }
]` :
  `[
  {
    "question": "Can you tell me about your professional experience?",
    "sampleAnswer": "I have X years of experience in...",
    "category": "General"
  }
]`}
        `;

        console.log('Generating interview questions with AI...');
        
        const { text: questionsText } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: prompt,
        });

        console.log('AI Response:', questionsText);

        // Clean the response text
        let cleanedText = questionsText.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Parse the questions
        let aiQuestions;
        try {
            aiQuestions = JSON.parse(cleanedText);
            
            if (!Array.isArray(aiQuestions)) {
                throw new Error('Response is not an array');
            }
            
            if (!aiQuestions.every(q => q.question && q.sampleAnswer && q.category)) {
                throw new Error('Not all questions have required fields');
            }
            
        } catch (parseError) {
            console.error('JSON parsing failed:', parseError);
            console.error('Raw AI response:', questionsText);
            
            return Response.json({ 
                success: false, 
                message: `Failed to parse AI response as JSON. Raw response: ${questionsText.substring(0, 200)}...`
            }, { status: 500 });
        }

        // Convert to the expected format with IDs
        const questions: InterviewQuestion[] = aiQuestions.map((q: any, index: number) => ({
            id: `q-${index + 1}`,
            question: q.question,
            sampleAnswer: q.sampleAnswer,
            category: q.category
        }));

        // Save to interviews table (using actual schema fields)
        const interviewData = {
            user_id: userId,
            dayinrole_id: dayInRole.id,
            role: dayInRole.position,
            level: 'mid', // You can enhance this to detect level from dayInRole
            type: 'general',
            questions: questions.map(q => q.question), // Store just the question strings
            techstack: dayInRole.techstack || [],
            finalized: true,
            completed_attempts: 0,
            created_at: new Date().toISOString(),
        };

        console.log('Creating interview document in Supabase...');
        const supabase = createServiceClient();
        const { data: savedInterview, error: saveError } = await supabase
            .from('interviews')
            .insert(interviewData)
            .select()
            .single();

        if (saveError) {
            console.error('Error saving interview:', saveError);
            return Response.json({ 
                success: false, 
                message: "Failed to save interview questions to database" 
            }, { status: 500 });
        }

        console.log('Interview created successfully with ID:', savedInterview.id);

        // Also save full question objects to interview_questions table
        const questionSetData = {
            dayinrole_id: dayInRole.id,
            user_id: userId,
            questions: questions, // Store full question objects with sample answers
            number_of_questions: questions.length,
            language: detectedLanguage,
            dayinrole_title: `${dayInRole.position} at ${dayInRole.companyName}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data: savedQuestionSet, error: questionSetError } = await supabase
            .from('interview_questions')
            .insert(questionSetData)
            .select()
            .single();

        if (questionSetError) {
            console.error('Error saving question set:', questionSetError);
            // Don't fail the entire request if interview_questions save fails
            // since we already have the interview saved
        }

        console.log('Question set created successfully with ID:', savedQuestionSet?.id);

        return Response.json({ 
            success: true, 
            questions,
            questionSetId: savedQuestionSet?.id || savedInterview.id,
            interviewId: savedInterview.id,
            language: detectedLanguage,
            interview: {
                id: savedInterview.id,
                role: savedInterview.role,
                type: savedInterview.type,
                level: savedInterview.level,
                questions: savedInterview.questions,
                techstack: savedInterview.techstack,
                dayInRoleId: savedInterview.dayinrole_id,
                userId: savedInterview.user_id,
                createdAt: savedInterview.created_at,
            },
            message: `Generated ${questions.length} interview questions successfully in ${detectedLanguage}`
        }, { status: 200 });

    } catch (error) {
        console.error('Error generating interview questions:', error);
        return apiError('Failed to generate interview questions', 500);
    }
} 