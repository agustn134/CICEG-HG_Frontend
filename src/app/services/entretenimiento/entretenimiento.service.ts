// src/app/services/entretenimiento/entretenimiento.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map, BehaviorSubject } from 'rxjs';


export interface TriviaQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  difficulty: string;
  category: string;
  type: string;
  explanation?: string;
  points?: number;
  timeLimit?: number;
}

export interface TriviaStats {
  answered: number;
  correct: number;
  streak: number;
  maxStreak: number;
  totalPoints: number;
  level: number;
  accuracy: number;
}

export interface MedicalCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface JokeResponse {
  setup: string;
  punchline: string;
  type: string;
  id: number;
}

export interface MusicTrack {
  name: string;
  artist: { name: string };
  url?: string;
  image?: Array<{ '#text': string; size: string }>;
  playcount?: string;
  duration?: string;
  streamable?: { '#text': string; fulltrack: string };
}

export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface HealthyMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
}

export interface MotivationalQuote {
  text: string;
  author: string;
  category: string;
  id: number;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
}

@Injectable({
  providedIn: 'root'
})
export class EntretenimientoService {
  private readonly LASTFM_API_KEY = '59e5c67a9cb58b2b4731675b1e4812db';
  private readonly LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
  private readonly CAT_API_KEY = 'live_fmQdNVpyD2M8u8uLKNZ1jcyb5h5I8dXqfJ4FX7bxFZYGdnwqtOKWaI6qDqHhRbRq';

  // 🎵 Estado del reproductor de audio
  private currentTrackSubject = new BehaviorSubject<MusicTrack | null>(null);
  public currentTrack$ = this.currentTrackSubject.asObservable();

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  public isPlaying$ = this.isPlayingSubject.asObservable();
// ✅ AGREGAR ESTA PROPIEDAD QUE FALTA
  private medicalCategories: MedicalCategory[] = [
    {
      id: 'anatomia',
      name: 'Anatomía',
      description: 'Estructura del cuerpo humano',
      icon: '🦴',
      color: '#FF6B6B'
    },
    {
      id: 'fisiologia',
      name: 'Fisiología',
      description: 'Funcionamiento del organismo',
      icon: '⚡',
      color: '#4ECDC4'
    },
    {
      id: 'cardiologia',
      name: 'Cardiología',
      description: 'Sistema cardiovascular',
      icon: '❤️',
      color: '#45B7D1'
    },
    {
      id: 'neurologia',
      name: 'Neurología',
      description: 'Sistema nervioso',
      icon: '🧠',
      color: '#96CEB4'
    },
    {
      id: 'endocrinologia',
      name: 'Endocrinología',
      description: 'Sistema endocrino y hormonas',
      icon: '🔬',
      color: '#FECA57'
    },
    {
      id: 'farmacologia',
      name: 'Farmacología',
      description: 'Medicamentos y tratamientos',
      icon: '💊',
      color: '#FF9FF3'
    },
    {
      id: 'epidemiologia',
      name: 'Epidemiología',
      description: 'Estudios poblacionales de salud',
      icon: '📊',
      color: '#54A0FF'
    },
    {
      id: 'patologia',
      name: 'Patología',
      description: 'Enfermedades y trastornos',
      icon: '🔍',
      color: '#FD79A8'
    }
  ];


  constructor(private http: HttpClient) {}

  // ==========================================
  // 🧠 TRIVIA MÉDICA MEJORADA
  // ==========================================
 getTriviaQuestion(category: string = 'random', difficulty: string = 'easy'): Observable<{results: TriviaQuestion[]}> {
    // Intentar primero con API externa
    const url = `https://opentdb.com/api.php?amount=1&category=9&difficulty=${difficulty}&type=multiple`;

    return this.http.get<{results: TriviaQuestion[]}>(url).pipe(
      map(response => {
        if (response.results && response.results.length > 0) {
          // Decodificar entidades HTML y agregar puntos
          const question = response.results[0];
          question.question = this.decodeHtmlEntities(question.question);
          question.correct_answer = this.decodeHtmlEntities(question.correct_answer);
          question.incorrect_answers = question.incorrect_answers.map(answer => this.decodeHtmlEntities(answer));
          question.points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 25;
          question.timeLimit = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 35 : 45;
        }
        return response;
      }),
      catchError(() => of({
        results: [this.getMedicalTriviaFromDatabase(category, difficulty)]
      }))
    );
  }

  getMedicalTriviaFromDatabase(category: string = 'random', difficulty: string = 'easy'): TriviaQuestion {
    let filteredQuestions = this.medicalTriviaDatabase;

    // Filtrar por dificultad
    if (difficulty !== 'random') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }

    // Filtrar por categoría
    if (category !== 'random' && category !== 'all') {
      filteredQuestions = filteredQuestions.filter(q =>
        q.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Si no hay preguntas que coincidan, usar todas
    if (filteredQuestions.length === 0) {
      filteredQuestions = this.medicalTriviaDatabase;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    return { ...filteredQuestions[randomIndex] };
  }


 getMedicalCategories(): MedicalCategory[] {
    return this.medicalCategories;
  }

  // Método para obtener estadísticas de trivia
  calculateTriviaLevel(totalPoints: number): number {
    return Math.floor(totalPoints / 100) + 1;
  }

  getNextLevelPoints(currentLevel: number): number {
    return currentLevel * 100;
  }

    // 🎯 Nueva base de datos expandida de trivia médica
  private medicalTriviaDatabase: TriviaQuestion[] = [
    // ANATOMÍA
    {
      question: '¿Cuál es el hueso más largo del cuerpo humano?',
      correct_answer: 'Fémur',
      incorrect_answers: ['Tibia', 'Húmero', 'Radio'],
      difficulty: 'easy',
      category: 'Anatomía',
      type: 'multiple',
      explanation: 'El fémur es el hueso del muslo y es el más largo y fuerte del cuerpo humano.',
      points: 10,
      timeLimit: 30
    },
    {
      question: '¿Cuántas cámaras tiene el corazón humano?',
      correct_answer: '4',
      incorrect_answers: ['2', '3', '6'],
      difficulty: 'easy',
      category: 'Cardiología',
      type: 'multiple',
      explanation: 'El corazón tiene 4 cámaras: 2 aurículas (izquierda y derecha) y 2 ventrículos (izquierdo y derecho).',
      points: 10,
      timeLimit: 25
    },
    {
      question: '¿Qué órgano produce la insulina?',
      correct_answer: 'Páncreas',
      incorrect_answers: ['Hígado', 'Riñones', 'Bazo'],
      difficulty: 'medium',
      category: 'Endocrinología',
      type: 'multiple',
      explanation: 'El páncreas, específicamente las células beta de los islotes de Langerhans, produce la insulina.',
      points: 15,
      timeLimit: 35
    },
    {
      question: '¿Cuál es la presión arterial normal en un adulto sano?',
      correct_answer: '120/80 mmHg',
      incorrect_answers: ['140/90 mmHg', '100/60 mmHg', '160/100 mmHg'],
      difficulty: 'medium',
      category: 'Cardiología',
      type: 'multiple',
      explanation: 'La presión arterial normal es menor a 120/80 mmHg según las guías de la AHA.',
      points: 15,
      timeLimit: 30
    },
    {
      question: '¿Qué significa el acrónimo FAST en el diagnóstico de ACV?',
      correct_answer: 'Face, Arms, Speech, Time',
      incorrect_answers: ['Fever, Anxiety, Syncope, Tremor', 'Focus, Alert, Stable, Treatment', 'First, Aid, Support, Transport'],
      difficulty: 'hard',
      category: 'Neurología',
      type: 'multiple',
      explanation: 'FAST ayuda a identificar signos de ACV: Face (cara caída), Arms (debilidad en brazos), Speech (dificultad del habla), Time (tiempo crítico).',
      points: 25,
      timeLimit: 45
    },
    {
      question: '¿Cuál es la dosis letal media (LD50) del paracetamol en humanos?',
      correct_answer: '10-15 g',
      incorrect_answers: ['5-8 g', '20-25 g', '1-3 g'],
      difficulty: 'hard',
      category: 'Farmacología',
      type: 'multiple',
      explanation: 'La dosis tóxica de paracetamol es aproximadamente 10-15g, pudiendo causar hepatotoxicidad severa.',
      points: 25,
      timeLimit: 40
    },
    // FISIOLOGÍA
    {
      question: '¿Cuántos litros de sangre bombea el corazón por día aproximadamente?',
      correct_answer: '7,500 litros',
      incorrect_answers: ['5,000 litros', '10,000 litros', '12,000 litros'],
      difficulty: 'medium',
      category: 'Fisiología',
      type: 'multiple',
      explanation: 'El corazón bombea aproximadamente 5 litros por minuto, lo que equivale a unos 7,500 litros diarios.',
      points: 15,
      timeLimit: 35
    },
    {
      question: '¿Cuál es la frecuencia respiratoria normal en un adulto en reposo?',
      correct_answer: '12-20 respiraciones por minuto',
      incorrect_answers: ['8-12 respiraciones por minuto', '20-30 respiraciones por minuto', '30-40 respiraciones por minuto'],
      difficulty: 'easy',
      category: 'Fisiología',
      type: 'multiple',
      explanation: 'La frecuencia respiratoria normal en adultos sanos es de 12-20 respiraciones por minuto.',
      points: 10,
      timeLimit: 25
    },
    // PATOLOGÍA
    {
      question: '¿Cuál es la principal causa de muerte en el mundo según la OMS?',
      correct_answer: 'Enfermedad cardiovascular',
      incorrect_answers: ['Cáncer', 'Accidentes cerebrovasculares', 'Diabetes'],
      difficulty: 'medium',
      category: 'Epidemiología',
      type: 'multiple',
      explanation: 'Las enfermedades cardiovasculares son la principal causa de muerte a nivel mundial.',
      points: 15,
      timeLimit: 30
    },
    {
      question: '¿Qué células se ven principalmente afectadas en la diabetes tipo 1?',
      correct_answer: 'Células beta del páncreas',
      incorrect_answers: ['Células alpha del páncreas', 'Hepatocitos', 'Células musculares'],
      difficulty: 'hard',
      category: 'Endocrinología',
      type: 'multiple',
      explanation: 'En la diabetes tipo 1, el sistema inmune ataca y destruye las células beta del páncreas que producen insulina.',
      points: 25,
      timeLimit: 40
    }
  ];


  private getMedicalTriviaFallback(): TriviaQuestion {
    const medicalQuestions = [
      {
        question: '¿Cuántos huesos tiene el cuerpo humano adulto?',
        correct_answer: '206',
        incorrect_answers: ['210', '198', '215'],
        difficulty: 'easy',
        category: 'Medicina',
        type: 'multiple'
      },
      {
        question: '¿Cuál es la frecuencia cardíaca normal en reposo?',
        correct_answer: '60-100 latidos por minuto',
        incorrect_answers: ['40-60 latidos por minuto', '100-120 latidos por minuto', '120-140 latidos por minuto'],
        difficulty: 'easy',
        category: 'Medicina',
        type: 'multiple'
      },
      {
        question: '¿Cuántos litros de sangre bombea el corazón por día aproximadamente?',
        correct_answer: '7,500 litros',
        incorrect_answers: ['5,000 litros', '10,000 litros', '12,000 litros'],
        difficulty: 'medium',
        category: 'Medicina',
        type: 'multiple'
      }
    ];

    return medicalQuestions[Math.floor(Math.random() * medicalQuestions.length)];
  }

  // ==========================================
  // 😄 CHISTES MEJORADOS CON MÚLTIPLES APIS
  // ==========================================
  getJokeInSpanish(): Observable<JokeResponse> {
    const jokeApis = [
      'https://official-joke-api.appspot.com/random_joke',
      'https://v2.jokeapi.dev/joke/Programming,Miscellaneous?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=twopart'
    ];

    const randomApi = jokeApis[Math.floor(Math.random() * jokeApis.length)];

    return this.http.get<any>(randomApi).pipe(
      map(response => {
        if (response.setup && response.delivery) {
          return {
            setup: response.setup,
            punchline: response.delivery,
            type: response.category || 'general',
            id: response.id || Math.random()
          };
        } else if (response.setup && response.punchline) {
          return {
            setup: response.setup,
            punchline: response.punchline,
            type: response.type || 'general',
            id: response.id || Math.random()
          };
        }
        return response;
      }),
      catchError(() => of(this.getMedicalJokeFallback()))
    );
  }

  private getMedicalJokeFallback(): JokeResponse {
    const medicalJokes = [
      {
        setup: '¿Qué le dijo un glóbulo rojo a un glóbulo blanco?',
        punchline: '¡Estás muy pálido!',
        type: 'medical',
        id: 1
      },
      {
        setup: '¿Por qué los médicos siempre llevan un bolígrafo rojo?',
        punchline: '¡Para firmar en caso de emergencia!',
        type: 'medical',
        id: 2
      },
      {
        setup: '¿Cuál es el colmo de un cardiólogo?',
        punchline: '¡Que no tenga corazón!',
        type: 'medical',
        id: 3
      },
      {
        setup: '¿Qué hace un electrón cuando va al médico?',
        punchline: '¡Se pone negativo!',
        type: 'science',
        id: 4
      }
    ];

    return medicalJokes[Math.floor(Math.random() * medicalJokes.length)];
  }


  // ==========================================
  // 🐱 IMÁGENES RELAJANTES MEJORADAS
  // ==========================================
  getCatImage(): Observable<CatImage[]> {
    const headers = new HttpHeaders().set('x-api-key', this.CAT_API_KEY);

    return this.http.get<CatImage[]>('https://api.thecatapi.com/v1/images/search?limit=1&size=med', { headers }).pipe(
      catchError(() => of([{
        id: 'fallback',
        url: '/assets/images/fallback-cat.jpg',
        width: 500,
        height: 500
      }]))
    );
  }

  getDogImage(): Observable<any> {
    return this.http.get<any>('https://dog.ceo/api/breeds/image/random').pipe(
      map(response => [{
        id: 'dog-' + Math.random(),
        url: response.message,
        width: 500,
        height: 500
      }]),
      catchError(() => of([{
        id: 'fallback',
        url: '/assets/images/fallback-dog.jpg',
        width: 500,
        height: 500
      }]))
    );
  }



  // ==========================================
  // 💪 FRASES MOTIVACIONALES EXPANDIDAS
  // ==========================================
  getMotivationalQuote(): Observable<MotivationalQuote> {
    const medicalQuotes: MotivationalQuote[] = [
      {
        text: "La medicina es una ciencia de incertidumbre y un arte de probabilidad.",
        author: "William Osler",
        category: "Sabiduría Médica",
        id: 1
      },
      {
        text: "Curar a veces, aliviar a menudo, consolar siempre.",
        author: "Hipócrates",
        category: "Filosofía Médica",
        id: 2
      },
      {
        text: "El médico debe ser el sirviente de la ciencia, y la ciencia debe ser el sirviente de la humanidad.",
        author: "Claude Bernard",
        category: "Ética Médica",
        id: 3
      },
      {
        text: "La mejor medicina es un médico que inspira confianza.",
        author: "Proverbio médico",
        category: "Relación Médico-Paciente",
        id: 4
      },
      {
        text: "No hay enfermedades, sino enfermos.",
        author: "Claude Bernard",
        category: "Humanización",
        id: 5
      },
      {
        text: "La salud es un estado de completo bienestar físico, mental y social.",
        author: "Organización Mundial de la Salud",
        category: "Definición de Salud",
        id: 6
      }
    ];

    const randomQuote = medicalQuotes[Math.floor(Math.random() * medicalQuotes.length)];
    return of(randomQuote);
  }

  // ==========================================
  // 📰 NOTICIAS POSITIVAS
  // ==========================================
  getPositiveNews(): Observable<NewsArticle[]> {
    // Usando NewsAPI con términos positivos
    const positiveTerms = ['health breakthrough', 'medical innovation', 'healthcare improvement'];
    const randomTerm = positiveTerms[Math.floor(Math.random() * positiveTerms.length)];

    // Nota: Necesitarías una API key de NewsAPI
    const fallbackNews: NewsArticle[] = [
      {
        title: 'Nuevos avances en telemedicina mejoran la atención rural',
        description: 'La implementación de sistemas de telemedicina ha mejorado significativamente el acceso a la atención médica en zonas rurales.',
        url: '#',
        urlToImage: '/assets/images/news-telemedicine.jpg',
        publishedAt: new Date().toISOString(),
        source: { name: 'Salud Digital' }
      },
      {
        title: 'Investigadores desarrollan nueva terapia para enfermedades cardíacas',
        description: 'Un nuevo tratamiento prometedor podría revolucionar el cuidado de pacientes con problemas cardiovasculares.',
        url: '#',
        urlToImage: '/assets/images/news-cardiology.jpg',
        publishedAt: new Date().toISOString(),
        source: { name: 'Medicina Moderna' }
      }
    ];

    return of(fallbackNews);
  }

  // ==========================================
  // 🔧 UTILIDADES
  // ==========================================
  private decodeHtmlEntities(text: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  }

  // Control del reproductor de audio
  setCurrentTrack(track: MusicTrack): void {
    this.currentTrackSubject.next(track);
  }

  setIsPlaying(playing: boolean): void {
    this.isPlayingSubject.next(playing);
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrackSubject.value;
  }

  getIsPlaying(): boolean {
    return this.isPlayingSubject.value;
  }
}
