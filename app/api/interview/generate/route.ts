import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

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

export async function POST(request: NextRequest) {
  try {
    const { dayInRole, numberOfQuestions, userId }: GenerateQuestionsRequest = await request.json();

    if (!dayInRole || !numberOfQuestions || !userId) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    // Validate number of questions
    const numQuestions = Math.max(3, Math.min(15, numberOfQuestions));

    // Detect language from job offer content
    const jobContent = `${dayInRole.description} ${dayInRole.challenges.map(c => typeof c === 'string' ? c : c.challenge).join(' ')} ${dayInRole.requirements.join(' ')}`;
    const detectedLanguage = detectLanguageFromContent(jobContent);

    // Generate interview questions based on the day in role
    const questions: InterviewQuestion[] = generateInterviewQuestions(dayInRole, numQuestions, detectedLanguage);

    // Save to database
    const interviewQuestionSet: Omit<InterviewQuestionSet, 'id'> = {
      dayInRoleId: dayInRole.id,
      userId,
      questions,
      numberOfQuestions: numQuestions,
      language: detectedLanguage,
      createdAt: new Date().toISOString(),
      dayInRoleTitle: `${dayInRole.position} at ${dayInRole.companyName}`
    };

    const docRef = await db.collection('interviewQuestions').add(interviewQuestionSet);

    return NextResponse.json({ 
      success: true, 
      questions,
      questionSetId: docRef.id,
      language: detectedLanguage,
      message: `Generated ${questions.length} interview questions successfully in ${detectedLanguage}`
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating interview questions:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to generate interview questions" 
    }, { status: 500 });
  }
}

// Enhanced language detection function that analyzes job content to determine the original language
function detectLanguageFromContent(content: string): string {
  const text = content.toLowerCase();
  
  // Comprehensive language indicators - common words, patterns, and tech terms for different languages
  const languageIndicators = {
    polish: [
      // Common words
      'i ', 'w ', 'na ', 'z ', 'do ', 'o ', 'że ', 'się ', 'oraz', 'będzie', 'można', 'powinien', 'zespół', 'projekt',
      // Tech/business terms
      'doświadczenie', 'firma', 'praca', 'stanowisko', 'technologie', 'rozwój', 'umiejętności', 'kandydat',
      // Endings
      'anie', 'acja', 'ość', 'enie'
    ],
    french: [
      // Common words
      'et ', 'de ', 'le ', 'la ', 'les ', 'du ', 'des ', 'dans', 'avec', 'pour', 'sur', 'vous', 'nous', 'être', 'avoir',
      // Tech/business terms  
      'expérience', 'entreprise', 'travail', 'poste', 'technologies', 'développement', 'compétences', 'candidat',
      // Endings
      'tion', 'ment', 'eur', 'euse'
    ],
    german: [
      // Common words
      'und ', 'der ', 'die ', 'das ', 'den ', 'dem ', 'ein ', 'eine', 'mit', 'für', 'auf', 'sie', 'wir', 'sind', 'haben',
      // Tech/business terms
      'erfahrung', 'unternehmen', 'arbeit', 'position', 'technologien', 'entwicklung', 'fähigkeiten', 'bewerber',
      // Endings
      'ung', 'keit', 'lich', 'isch'
    ],
    spanish: [
      // Common words
      'y ', 'de ', 'el ', 'la ', 'los ', 'las ', 'en ', 'con', 'para', 'por', 'que', 'del', 'ser', 'estar',
      // Tech/business terms
      'experiencia', 'empresa', 'trabajo', 'puesto', 'tecnologías', 'desarrollo', 'habilidades', 'candidato',
      // Endings
      'ción', 'miento', 'ador', 'ista'
    ],
    italian: [
      // Common words
      'e ', 'di ', 'il ', 'la ', 'i ', 'le ', 'del ', 'della', 'con', 'per', 'che', 'essere', 'avere',
      // Tech/business terms
      'esperienza', 'azienda', 'lavoro', 'posizione', 'tecnologie', 'sviluppo', 'competenze', 'candidato',
      // Endings
      'zione', 'mento', 'tore', 'ista'
    ],
    portuguese: [
      // Common words
      'e ', 'de ', 'o ', 'a ', 'os ', 'as ', 'do ', 'da', 'com', 'para', 'que', 'ser', 'estar',
      // Tech/business terms
      'experiência', 'empresa', 'trabalho', 'posição', 'tecnologias', 'desenvolvimento', 'habilidades', 'candidato',
      // Endings
      'ção', 'mento', 'dor', 'ista'
    ],
    dutch: [
      // Common words
      'en ', 'de ', 'het ', 'van ', 'in ', 'op ', 'met', 'voor', 'bij', 'zijn', 'hebben',
      // Tech/business terms
      'ervaring', 'bedrijf', 'werk', 'positie', 'technologieën', 'ontwikkeling', 'vaardigheden', 'kandidaat',
      // Endings
      'ing', 'heid', 'lijk', 'isch'
    ],
    russian: [
      // Common words
      'и ', 'в ', 'на ', 'с ', 'для ', 'как ', 'что', 'быть', 'иметь', 'мы', 'вы', 'они',
      // Tech/business terms
      'опыт', 'компания', 'работа', 'позиция', 'технологии', 'разработка', 'навыки', 'кандидат',
      // Endings
      'ние', 'ция', 'ость', 'тель'
    ],
    ukrainian: [
      // Common words
      'і ', 'в ', 'на ', 'з ', 'для ', 'як ', 'що', 'бути', 'мати', 'ми', 'ви', 'вони',
      // Tech/business terms
      'досвід', 'компанія', 'робота', 'позиція', 'технології', 'розробка', 'навички', 'кандидат',
      // Endings
      'ння', 'ція', 'ість', 'тель'
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

// Generate language-appropriate templates
function getLanguageTemplates(language: string, dayInRole: DayInRole) {
  const templates = {
    polish: {
      general: {
        introQuestion: `Proszę opowiedzieć o sobie i wyjaśnić, dlaczego jest Pan/Pani zainteresowana stanowiskiem ${dayInRole.position} w firmie ${dayInRole.companyName}.`,
        introAnswer: `Jestem osobą z pasją do technologii, mającą doświadczenie w pracy z ${dayInRole.techstack.slice(0, 3).join(', ')}. Szczególnie przyciąga mnie możliwość pracy na stanowisku ${dayInRole.position} w ${dayInRole.companyName}, ponieważ widzę tu szansę na dalszy rozwój zawodowy i wykorzystanie swoich umiejętności w ${dayInRole.description.split('.')[0].toLowerCase()}. Moje dotychczasowe doświadczenie w obszarach ${dayInRole.requirements.slice(0, 2).join(' oraz ')} idealnie wpisuje się w wymagania tej pozycji.`,
        companyQuestion: `Co wie Pan/Pani o firmie ${dayInRole.companyName} i dlaczego chciałby/chciałaby Pan/Pani u nas pracować?`,
        companyAnswer: `Przeprowadziłem/am dokładne researche firmy ${dayInRole.companyName} i jestem pod wrażeniem Waszego podejścia do innowacyjnych rozwiązań. Szczególnie interesuje mnie możliwość pracy przy projektach wykorzystujących ${dayInRole.techstack.slice(0, 2).join(' oraz ')}. Kultura organizacyjna firmy wydaje się promować wartości, które są dla mnie bardzo ważne - ciągłe uczenie się i współpracę zespołową.`
      },
      technical: {
        challengeQuestion: `Jak podszedłby/podeszłaby Pan/Pani do rozwiązania następującego wyzwania: "${dayInRole.challenges[0]?.challenge || 'optymalizacji wydajności systemu'}"?`,
        challengeAnswer: `Moje podejście do tego typu wyzwań jest systematyczne i metodyczne. Zaczynam od dokładnej analizy problemu i identyfikacji kluczowych punktów. Korzystając z mojego doświadczenia w ${dayInRole.techstack.slice(0, 3).join(', ')}, wypracowuję strategiczne podejście. Pierwszym krokiem byłoby przeanalizowanie najlepszych praktyk branżowych, konsultacja z zespołem oraz ewentualne stworzenie prototypu rozwiązania.`,
        techQuestion: `Proszę opisać swoje doświadczenie z technologią ${dayInRole.techstack[0]} i sposób jej wykorzystania na stanowisku ${dayInRole.position}.`,
        techAnswer: `Mam solidne doświadczenie praktyczne w pracy z ${dayInRole.techstack[0]}, które zdobywałem/am w różnych projektach. Na stanowisku ${dayInRole.position} wykorzystałbym/łabym tę technologię zgodnie z opisem roli - ${dayInRole.description.split('.')[1]?.toLowerCase() || 'do tworzenia wydajnych rozwiązań'}. Regularnie śledzę najnowsze trendy i aktualizacje w tej technologii.`
      },
      behavioral: {
        pressureQuestion: `Proszę opowiedzieć o sytuacji, kiedy musiał/a Pan/Pani pracować pod presją czasu.`,
        pressureAnswer: `W jednym z projektów stanęliśmy przed wyzwaniem realizacji kluczowej funkcjonalności w bardzo krótkim czasie. Zorganizowałem/am pracę zespołu poprzez podział zadań na mniejsze iteracje i utrzymanie transparentnej komunikacji z klientem. Kluczem do sukcesu było skuteczne zarządzanie priorytetami i utrzymanie wysokiej jakości pracy pomimo presji czasowej.`,
        learningQuestion: `Jak radzi sobie Pan/Pani z nauką nowych technologii w kontekście ${dayInRole.techstack.join(', ')}?`,
        learningAnswer: `Mam wypracowany systematyczny proces uczenia się nowych technologii. Zaczynam od oficjalnej dokumentacji i materiałów szkoleniowych, następnie buduję praktyczne projekty. W przypadku technologii takich jak ${dayInRole.techstack.slice(0, 2).join(' czy ')}, korzystam również z kursów online i aktywnie uczestniczę w społecznościach deweloperskich.`
      }
    },
    french: {
      general: {
        introQuestion: `Pouvez-vous vous présenter et expliquer pourquoi vous êtes intéressé(e) par le poste de ${dayInRole.position} chez ${dayInRole.companyName} ?`,
        introAnswer: `Je suis un(e) professionnel(le) passionné(e) par la technologie, avec une expérience en ${dayInRole.techstack.slice(0, 3).join(', ')}. Ce qui m'attire particulièrement dans ce poste de ${dayInRole.position} chez ${dayInRole.companyName}, c'est l'opportunité de ${dayInRole.description.split('.')[0].toLowerCase()}. Mon expérience dans ${dayInRole.requirements.slice(0, 2).join(' et ')} correspond parfaitement aux exigences de ce poste.`,
        companyQuestion: `Que savez-vous de ${dayInRole.companyName} et pourquoi souhaitez-vous travailler chez nous ?`,
        companyAnswer: `J'ai effectué des recherches approfondies sur ${dayInRole.companyName} et je suis impressionné(e) par votre approche des solutions innovantes. Je suis particulièrement intéressé(e) par la possibilité de travailler sur des projets utilisant ${dayInRole.techstack.slice(0, 2).join(' et ')}. La culture d'entreprise semble promouvoir l'apprentissage continu et la collaboration, des valeurs qui me tiennent à cœur.`
      },
      technical: {
        challengeQuestion: `Comment aborderiez-vous ce défi : "${dayInRole.challenges[0]?.challenge || 'optimisation des performances du système'}" ?`,
        challengeAnswer: `Mon approche pour ce type de défi est systématique et méthodique. Je commence par une analyse détaillée du problème et sa décomposition en parties plus petites. En utilisant mon expérience avec ${dayInRole.techstack.slice(0, 3).join(', ')}, je développe une approche stratégique. La première étape serait d'analyser les meilleures pratiques de l'industrie et de consulter l'équipe.`,
        techQuestion: `Décrivez votre expérience avec ${dayInRole.techstack[0]} et comment vous l'utiliseriez dans le rôle de ${dayInRole.position}.`,
        techAnswer: `J'ai une solide expérience pratique avec ${dayInRole.techstack[0]}, acquise dans divers projets. Dans ce rôle de ${dayInRole.position}, j'utiliserais cette technologie pour ${dayInRole.description.split('.')[1]?.toLowerCase() || 'développer des solutions efficaces'}. Je reste à jour avec les dernières tendances et mises à jour de cette technologie.`
      },
      behavioral: {
        pressureQuestion: `Parlez-moi d'une situation où vous avez dû travailler sous pression pour respecter un délai serré.`,
        pressureAnswer: `Dans un projet, nous avons fait face au défi de livrer une fonctionnalité clé en très peu de temps. J'ai organisé le travail de l'équipe en divisant les tâches en itérations más courtes et en maintenant une communication transparente avec le client. La clé du succès était la gestion efficace des priorités et le maintien de la qualité malgré la pression temporelle.`,
        learningQuestion: `Comment gérez-vous l'apprentissage de nouvelles technologies, notamment ${dayInRole.techstack.join(', ')} ?`,
        learningAnswer: `J'ai développé un processus systématique d'apprentissage des nouvelles technologies. Je commence par la documentation officielle et les matériaux de formation, puis je construis des projets pratiques. Pour des technologies comme ${dayInRole.techstack.slice(0, 2).join(' ou ')}, j'utilise également des cours en ligne et je participe activement aux communautés de développeurs.`
      }
    },
    german: {
      general: {
        introQuestion: `Können Sie sich vorstellen und erklären, warum Sie sich für die ${dayInRole.position} Position bei ${dayInRole.companyName} interessieren?`,
        introAnswer: `Ich bin ein technologiebegeisterter Fachmann mit Erfahrung in ${dayInRole.techstack.slice(0, 3).join(', ')}. Was mich besonders an dieser ${dayInRole.position} Position bei ${dayInRole.companyName} reizt, ist die Möglichkeit, ${dayInRole.description.split('.')[0].toLowerCase()}. Meine Erfahrung in ${dayInRole.requirements.slice(0, 2).join(' und ')} passt perfekt zu den Anforderungen dieser Position.`,
        companyQuestion: `Was wissen Sie über ${dayInRole.companyName} und warum möchten Sie bei uns arbeiten?`,
        companyAnswer: `Ich habe umfangreiche Recherchen über ${dayInRole.companyName} durchgeführt und bin beeindruckt von Ihrem Ansatz für innovative Lösungen. Besonders interessiert mich die Möglichkeit, an Projekten mit ${dayInRole.techstack.slice(0, 2).join(' und ')} zu arbeiten. Die Unternehmenskultur scheint kontinuierliches Lernen und Zusammenarbeit zu fördern - Werte, die mir sehr wichtig sind.`
      },
      technical: {
        challengeQuestion: `Wie würden Sie diese Herausforderung angehen: "${dayInRole.challenges[0]?.challenge || 'Systemleistungsoptimierung'}"?`,
        challengeAnswer: `Mein Ansatz für solche Herausforderungen ist systematisch und methodisch. Ich beginne mit einer detaillierten Problemanalyse und teile es in kleinere, handhabbare Teile auf. Mit meiner Erfahrung in ${dayInRole.techstack.slice(0, 3).join(', ')} entwickle ich einen strategischen Ansatz. Der erste Schritt wäre die Analyse bewährter Praktiken der Branche und die Beratung mit dem Team.`,
        techQuestion: `Beschreiben Sie Ihre Erfahrung mit ${dayInRole.techstack[0]} und wie Sie es in der ${dayInRole.position} Rolle einsetzen würden.`,
        techAnswer: `Ich habe solide praktische Erfahrung mit ${dayInRole.techstack[0]}, die ich in verschiedenen Projekten gesammelt habe. In dieser ${dayInRole.position} Rolle würde ich diese Technologie einsetzen, um ${dayInRole.description.split('.')[1]?.toLowerCase() || 'effiziente Lösungen zu entwickeln'}. Ich halte mich über die neuesten Trends und Updates dieser Technologie auf dem Laufenden.`
      },
      behavioral: {
        pressureQuestion: `Erzählen Sie mir von einer Situation, in der Sie unter Zeitdruck arbeiten mussten.`,
        pressureAnswer: `In einem Projekt standen wir vor der Herausforderung, eine wichtige Funktionalität in sehr kurzer Zeit zu liefern. Ich organisierte die Teamarbeit durch Aufteilung der Aufgaben in kürzere Iterationen und aufrechterhaltung transparenter Kommunikation mit dem Kunden. Der Schlüssel zum Erfolg war effektives Prioritätenmanagement und die Beibehaltung hoher Qualität trotz Zeitdruck.`,
        learningQuestion: `Wie gehen Sie mit dem Erlernen neuer Technologien um, insbesondere ${dayInRole.techstack.join(', ')}?`,
        learningAnswer: `Ich habe einen systematischen Prozess zum Erlernen neuer Technologien entwickelt. Ich beginne mit offizieller Dokumentation und Schulungsmaterialien, dann baue ich praktische Projekte. Für Technologien wie ${dayInRole.techstack.slice(0, 2).join(' oder ')} nutze ich auch Online-Kurse und beteilige mich aktiv an Entwicklergemeinschaften.`
      }
    },
    spanish: {
      general: {
        introQuestion: `¿Puede presentarse y explicar por qué está interesado/a en el puesto de ${dayInRole.position} en ${dayInRole.companyName}?`,
        introAnswer: `Soy un/a profesional apasionado/a por la tecnología con experiencia en ${dayInRole.techstack.slice(0, 3).join(', ')}. Lo que me atrae particularmente de este puesto de ${dayInRole.position} en ${dayInRole.companyName} es la oportunidad de ${dayInRole.description.split('.')[0].toLowerCase()}. Mi experiencia en ${dayInRole.requirements.slice(0, 2).join(' y ')} se alinea perfectamente con los requisitos de esta posición.`,
        companyQuestion: `¿Qué sabe sobre ${dayInRole.companyName} y por qué quiere trabajar con nosotros?`,
        companyAnswer: `He realizado una investigación exhaustiva sobre ${dayInRole.companyName} y estoy impresionado/a por su enfoque hacia las soluciones innovadoras. Me interesa especialmente la posibilidad de trabajar en proyectos que utilicen ${dayInRole.techstack.slice(0, 2).join(' y ')}. La cultura empresarial parece promover el aprendizaje continuo y la colaboración, valores que son muy importantes para mí.`
      },
      technical: {
        challengeQuestion: `¿Cómo abordaría este desafío: "${dayInRole.challenges[0]?.challenge || 'optimización del rendimiento del sistema'}"?`,
        challengeAnswer: `Mi enfoque para este tipo de desafíos es sistemático y metódico. Comienzo con un análisis detallado del problema y lo divido en partes más pequeñas y manejables. Utilizando mi experiencia en ${dayInRole.techstack.slice(0, 3).join(', ')}, desarrollo un enfoque estratégico. El primer paso sería analizar las mejores prácticas de la industria y consultar con el equipo.`,
        techQuestion: `Describa su experiencia con ${dayInRole.techstack[0]} y cómo la utilizaría en el rol de ${dayInRole.position}.`,
        techAnswer: `Tengo una sólida experiencia práctica con ${dayInRole.techstack[0]}, adquirida en varios proyectos. En este rol de ${dayInRole.position}, utilizaría esta tecnología para ${dayInRole.description.split('.')[1]?.toLowerCase() || 'desarrollar soluciones eficientes'}. Me mantengo actualizado/a con las últimas tendencias y actualizaciones de esta tecnología.`
      },
      behavioral: {
        pressureQuestion: `Cuénteme sobre una situación en la que tuvo que trabajar bajo presión para cumplir con una fecha límite ajustada.`,
        pressureAnswer: `En un proyecto, enfrentamos el desafío de entregar una funcionalidad clave en muy poco tiempo. Organicé el trabajo del equipo dividiendo las tareas en iteraciones más cortas y manteniendo comunicación transparente con el cliente. La clave del éxito fue la gestión efectiva de prioridades y mantener la calidad a pesar de la presión temporal.`,
        learningQuestion: `¿Cómo maneja el aprendizaje de nuevas tecnologías, especialmente ${dayInRole.techstack.join(', ')}?`,
        learningAnswer: `He desarrollado un proceso sistemático para aprender nuevas tecnologías. Comienzo con documentación oficial y materiales de entrenamiento, luego construyo proyectos prácticos. Para tecnologías como ${dayInRole.techstack.slice(0, 2).join(' o ')}, también utilizo cursos en línea y participo activamente en comunidades de desarrolladores.`
      }
    }
  };

  // Add support for additional languages with English fallback
  if (!templates[language as keyof typeof templates]) {
    // For unsupported languages, use English templates but indicate the detected language
    return generateEnglishTemplatesWithLanguageNote(dayInRole, language);
  }

  return templates[language as keyof typeof templates];
}

// Generate English templates when language is not supported, but acknowledge the original language
function generateEnglishTemplatesWithLanguageNote(dayInRole: DayInRole, detectedLanguage: string): any {
  const languageNote = detectedLanguage !== 'english' ? 
    ` (Note: Interview questions generated in English as ${detectedLanguage} templates are not yet available)` : '';

  return {
    general: {
      introQuestion: `Can you tell me about yourself and explain why you're interested in the ${dayInRole.position} position at ${dayInRole.companyName}?${languageNote}`,
      introAnswer: `I am a technology enthusiast with experience working with ${dayInRole.techstack.slice(0, 3).join(', ')}. What particularly attracts me to this ${dayInRole.position} position at ${dayInRole.companyName} is the opportunity to ${dayInRole.description.split('.')[0].toLowerCase()}. My previous experience in ${dayInRole.requirements.slice(0, 2).join(' and ')} aligns perfectly with the requirements for this position.`,
      companyQuestion: `What do you know about ${dayInRole.companyName} and why do you want to work here?`,
      companyAnswer: `I have conducted thorough research on ${dayInRole.companyName} and I'm impressed by your approach to innovative solutions. I'm particularly interested in the opportunity to work on projects utilizing ${dayInRole.techstack.slice(0, 2).join(' and ')}. The company culture seems to promote continuous learning and teamwork, which are values that are very important to me.`
    },
    technical: {
      challengeQuestion: `How would you approach solving this challenge: "${dayInRole.challenges[0]?.challenge || 'system performance optimization'}"?`,
      challengeAnswer: `My approach to these types of challenges is systematic and methodical. I start with a detailed analysis of the problem and identify key points. Using my experience with ${dayInRole.techstack.slice(0, 3).join(', ')}, I develop a strategic approach. The first step would be to analyze industry best practices, consult with the team, and potentially create a prototype solution.`,
      techQuestion: `Please describe your experience with ${dayInRole.techstack[0]} and how you would use it in the ${dayInRole.position} role.`,
      techAnswer: `I have solid practical experience working with ${dayInRole.techstack[0]}, which I've gained through various projects. In the ${dayInRole.position} role, I would use this technology according to the role description - ${dayInRole.description.split('.')[1]?.toLowerCase() || 'to create efficient solutions'}. I regularly follow the latest trends and updates in this technology.`
    },
    behavioral: {
      pressureQuestion: `Tell me about a situation when you had to work under time pressure.`,
      pressureAnswer: `In one project, we faced the challenge of delivering key functionality in a very short time. I organized the team's work by dividing tasks into smaller iterations and maintaining transparent communication with the client. The key to success was effective priority management and maintaining high quality work despite time pressure.`,
      learningQuestion: `How do you handle learning new technologies in the context of ${dayInRole.techstack.join(', ')}?`,
      learningAnswer: `I have developed a systematic process for learning new technologies. I start with official documentation and training materials, then build practical projects. For technologies like ${dayInRole.techstack.slice(0, 2).join(' or ')}, I also use online courses and actively participate in developer communities.`
    }
  };
}

function generateInterviewQuestions(dayInRole: DayInRole, numberOfQuestions: number, language: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  
  // Get language-appropriate templates
  const templates = getLanguageTemplates(language, dayInRole);
  
  // Question categories in detected language
  const categoryNames = {
    english: { general: 'General', technical: 'Technical', behavioral: 'Behavioral', situational: 'Situational' },
    polish: { general: 'Ogólne', technical: 'Techniczne', behavioral: 'Behawioralne', situational: 'Sytuacyjne' },
    french: { general: 'Général', technical: 'Technique', behavioral: 'Comportemental', situational: 'Situationnel' },
    german: { general: 'Allgemein', technical: 'Technisch', behavioral: 'Verhalten', situational: 'Situativ' },
    spanish: { general: 'General', technical: 'Técnico', behavioral: 'Conductual', situational: 'Situacional' },
    italian: { general: 'Generale', technical: 'Tecnico', behavioral: 'Comportamentale', situational: 'Situazionale' },
    portuguese: { general: 'Geral', technical: 'Técnico', behavioral: 'Comportamental', situational: 'Situacional' },
    dutch: { general: 'Algemeen', technical: 'Technisch', behavioral: 'Gedragsmatig', situational: 'Situationeel' },
    russian: { general: 'Общий', technical: 'Технический', behavioral: 'Поведенческий', situational: 'Ситуационный' },
    ukrainian: { general: 'Загальний', technical: 'Технічний', behavioral: 'Поведінковий', situational: 'Ситуаційний' }
  };
  
  const cats = categoryNames[language as keyof typeof categoryNames] || categoryNames.english;
  
  // Generate questions based on templates
  const questionPool = [
    { question: templates.general.introQuestion, answer: templates.general.introAnswer, category: cats.general },
    { question: templates.general.companyQuestion, answer: templates.general.companyAnswer, category: cats.general },
    { question: templates.technical.challengeQuestion, answer: templates.technical.challengeAnswer, category: cats.technical },
    { question: templates.technical.techQuestion, answer: templates.technical.techAnswer, category: cats.technical },
    { question: templates.behavioral.pressureQuestion, answer: templates.behavioral.pressureAnswer, category: cats.behavioral },
    { question: templates.behavioral.learningQuestion, answer: templates.behavioral.learningAnswer, category: cats.behavioral },
  ];

  // Add situational questions based on additional challenges
  if (dayInRole.challenges.length > 1) {
    const secondChallenge = typeof dayInRole.challenges[1] === 'string' ? dayInRole.challenges[1] : dayInRole.challenges[1].challenge;
    const situationalTemplates = createSituationalTemplate(language, secondChallenge);
    
    questionPool.push({
      question: situationalTemplates.question,
      answer: situationalTemplates.answer,
      category: cats.situational
    });
  }

  // Select questions for the requested number
  for (let i = 0; i < numberOfQuestions && i < questionPool.length; i++) {
    const template = questionPool[i % questionPool.length];
    questions.push({
      id: `q-${i + 1}`,
      question: template.question,
      sampleAnswer: template.answer,
      category: template.category
    });
  }

  return questions;
}

// Create situational questions in any language
function createSituationalTemplate(language: string, challenge: string) {
  const templates = {
    english: {
      question: `How would you handle a situation where ${challenge.toLowerCase()}?`,
      answer: `I would approach this situation with openness and a focus on constructive dialogue. First, I would carefully listen to understand the different perspectives and reasoning behind each approach. Then I would present my viewpoint, supporting it with concrete examples and data. If we still can't reach consensus, I would suggest involving a senior team member or conducting a brief test of both approaches.`
    },
    polish: {
      question: `Jak poradziłby/poradziłaby sobie Pan/Pani z sytuacją, w której ${challenge.toLowerCase()}?`,
      answer: `Podszedłbym/podeszłabym do tej sytuacji z otwartością i nastawieniem na konstruktywny dialog. Najpierw uważnie wysłuchałbym/łabym argumentów, starając się zrozumieć różne perspektywy i uzasadnienia dla każdego podejścia. Następnie przedstawiłbym/łabym swój punkt widzenia, wspierając go konkretnymi przykładami i danymi. Jeśli nadal nie udałoby się osiągnąć konsensusu, zasugerowałbym/łabym włączenie starszego członka zespołu lub przeprowadzenie krótkiego testu obu podejść.`
    },
    french: {
      question: `Comment géreriez-vous une situation où ${challenge.toLowerCase()}?`,
      answer: `J'aborderais cette situation avec ouverture et en me concentrant sur un dialogue constructif. D'abord, j'écouterais attentivement pour comprendre les différentes perspectives et le raisonnement derrière chaque approche. Ensuite, je présenterais mon point de vue en l'appuyant avec des exemples concrets et des données. Si nous ne parvenons toujours pas à un consensus, je suggérerais d'impliquer un membre senior de l'équipe ou de mener un bref test des deux approches.`
    },
    german: {
      question: `Wie würden Sie mit einer Situation umgehen, in der ${challenge.toLowerCase()}?`,
      answer: `Ich würde diese Situation mit Offenheit und einem Fokus auf konstruktiven Dialog angehen. Zuerst würde ich aufmerksam zuhören, um die verschiedenen Perspektiven und die Begründung hinter jedem Ansatz zu verstehen. Dann würde ich meinen Standpunkt präsentieren und ihn mit konkreten Beispielen und Daten unterstützen. Falls wir immer noch keinen Konsens erreichen können, würde ich vorschlagen, ein erfahrenes Teammitglied einzubeziehen oder einen kurzen Test beider Ansätze durchzuführen.`
    },
    spanish: {
      question: `¿Cómo manejaría una situación en la que ${challenge.toLowerCase()}?`,
      answer: `Abordaría esta situación con apertura y enfoque en el diálogo constructivo. Primero, escucharía atentamente para entender las diferentes perspectivas y el razonamiento detrás de cada enfoque. Luego presentaría mi punto de vista, apoyándolo con ejemplos concretos y datos. Si aún no podemos llegar a un consenso, sugeriría involucrar a un miembro senior del equipo o realizar una prueba breve de ambos enfoques.`
    },
    italian: {
      question: `Come gestireste una situazione in cui ${challenge.toLowerCase()}?`,
      answer: `Affronterei questa situazione con apertura e concentrandomi su un dialogo costruttivo. Prima di tutto, ascolterei attentamente per comprendere le diverse prospettive e il ragionamento dietro ogni approccio. Poi presenterei il mio punto di vista, supportandolo con esempi concreti e dati. Se non riusciamo ancora a raggiungere un consenso, suggerirei di coinvolgere un membro senior del team o di condurre un breve test di entrambi gli approcci.`
    },
    portuguese: {
      question: `Como lidaria com uma situação em que ${challenge.toLowerCase()}?`,
      answer: `Abordaria esta situação com abertura e foco no diálogo construtivo. Primeiro, ouviria atentamente para entender as diferentes perspectivas e o raciocínio por trás de cada abordagem. Em seguida, apresentaria meu ponto de vista, apoiando-o com exemplos concretos e dados. Se ainda não conseguíssemos chegar a um consenso, sugeriria envolver um membro sênior da equipe ou realizar um teste breve de ambas as abordagens.`
    },
    dutch: {
      question: `Hoe zou u omgaan met een situatie waarin ${challenge.toLowerCase()}?`,
      answer: `Ik zou deze situatie benaderen met openheid en een focus op constructieve dialoog. Eerst zou ik aandachtig luisteren om de verschillende perspectieven en redenering achter elke benadering te begrijpen. Dan zou ik mijn standpunt presenteren, ondersteund met concrete voorbeelden en data. Als we nog steeds geen consensus kunnen bereiken, zou ik voorstellen om een senior teamlid erbij te betrekken of een korte test van beide benaderingen uit te voeren.`
    },
    russian: {
      question: `Как бы вы справились с ситуацией, когда ${challenge.toLowerCase()}?`,
      answer: `Я бы подошел к этой ситуации с открытостью и сосредоточением на конструктивном диалоге. Сначала я бы внимательно выслушал, чтобы понять различные точки зрения и рассуждения за каждым подходом. Затем я бы представил свою точку зрения, подкрепив её конкретными примерами и данными. Если мы всё ещё не можем прийти к консенсусу, я бы предложил привлечь старшего члена команды или провести краткое тестирование обоих подходов.`
    },
    ukrainian: {
      question: `Як би ви справилися з ситуацією, коли ${challenge.toLowerCase()}?`,
      answer: `Я б підійшов до цієї ситуації з відкритістю та зосередженням на конструктивному діалозі. Спочатку я б уважно вислухав, щоб зрозуміти різні точки зору та обґрунтування за кожним підходом. Потім я б представив свою точку зору, підкріпивши її конкретними прикладами та даними. Якщо ми все ще не можемо дійти консенсусу, я б запропонував залучити старшого члена команди або провести короткий тест обох підходів.`
    }
  };

  return templates[language as keyof typeof templates] || templates.english;
} 