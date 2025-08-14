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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: TriviaStats) => boolean;
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
  providedIn: 'root',
})
export class EntretenimientoService {
  private readonly LASTFM_API_KEY = '59e5c67a9cb58b2b4731675b1e4812db';
  private readonly LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
  private readonly CAT_API_KEY = 'live_fmQdNVpyD2M8u8uLKNZ1jcyb5h5I8dXqfJ4FX7bxFZYGdnwqtOKWaI6qDqHhRbRq';

  // Claves de almacenamiento
  private readonly STORAGE_KEY_STATS = 'trivia_stats';
  private readonly STORAGE_KEY_ACHIEVEMENTS = 'trivia_achievements';

  // Estado del juego - CORREGIDO: Solo una declaración de triviaStats
  private _triviaStats: TriviaStats;
  public currentTrivia: TriviaQuestion | null = null;
  public isLoadingTrivia = false;
  public selectedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  public isPracticeMode = true;

  // Getter y Setter públicos para triviaStats
  public get triviaStats(): TriviaStats {
    return this._triviaStats;
  }

  public set triviaStats(value: TriviaStats) {
    this._triviaStats = value;
  }

  // Contenido actual
  public currentJoke: JokeResponse | null = null;
  public currentQuote: MotivationalQuote | null = null;
  public lastCatImage: CatImage | null = null;

  // Estado del reproductor
  private currentTrackSubject = new BehaviorSubject<MusicTrack | null>(null);
  public currentTrack$ = this.currentTrackSubject.asObservable();
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  public isPlaying$ = this.isPlayingSubject.asObservable();

  // Categorías médicas
  private medicalCategories: MedicalCategory[] = [
    { id: 'anatomia', name: 'Anatomía', description: 'Estructura del cuerpo humano', icon: '', color: '#FF6B6B' },
    { id: 'fisiologia', name: 'Fisiología', description: 'Funcionamiento del organismo', icon: '', color: '#4ECDC4' },
    { id: 'cardiologia', name: 'Cardiología', description: 'Sistema cardiovascular', icon: '', color: '#45B7D1' },
    { id: 'neurologia', name: 'Neurología', description: 'Sistema nervioso', icon: '🧠', color: '#96CEB4' },
    { id: 'endocrinologia', name: 'Endocrinología', description: 'Sistema endocrino y hormonas', icon: '🔬', color: '#FECA57' },
    { id: 'farmacologia', name: 'Farmacología', description: 'Medicamentos y tratamientos', icon: '', color: '#FF9FF3' },
    { id: 'epidemiologia', name: 'Epidemiología', description: 'Estudios poblacionales de salud', icon: ' ', color: '#54A0FF' },
    { id: 'patologia', name: 'Patología', description: 'Estudio de enfermedades', icon: '', color: '#A55EEA' },
  ];

  // Logros
  private achievements: Achievement[] = [
    {
      id: 'first_steps',
      title: 'Primeros Pasos',
      description: 'Respondiste tu primera pregunta',
      icon: ' ',
      unlocked: false,
      condition: (stats) => stats.answered >= 1,
    },
    {
      id: 'accuracy_master',
      title: 'Maestro de la Precisión',
      description: 'Alcanzaste una precisión del 90% o más',
      icon: '',
      unlocked: false,
      condition: (stats) => stats.accuracy >= 90,
    },
    {
      id: 'streak_king',
      title: 'Rey de la Racha',
      description: 'Lograste una racha de 10 respuestas correctas',
      icon: '',
      unlocked: false,
      condition: (stats) => stats.streak >= 10,
    },
    {
      id: 'knowledge_seeker',
      title: 'Buscador del Conocimiento',
      description: 'Alcanzaste el nivel 5',
      icon: '',
      unlocked: false,
      condition: (stats) => stats.level >= 5,
    },
    {
      id: 'zen_master',
      title: 'Maestro Zen',
      description: 'Completaste una sesión de bienestar completa',
      icon: '',
      unlocked: false,
      condition: () => this.getWellnessProgress() === 100,
    },
  ];

  constructor(private http: HttpClient) {
    // CORREGIDO: Inicializar _triviaStats correctamente
    this._triviaStats = this.loadStats();
    this.loadAchievements();
  }

  // ==========================================
  //   ESTADÍSTICAS Y LOGROS
  // ==========================================

  private loadStats(): TriviaStats {
    const saved = localStorage.getItem(this.STORAGE_KEY_STATS);
    return saved
      ? JSON.parse(saved)
      : {
          answered: 0,
          correct: 0,
          streak: 0,
          maxStreak: 0,
          totalPoints: 0,
          level: 1,
          accuracy: 0,
        };
  }

  private saveStats(): void {
    localStorage.setItem(this.STORAGE_KEY_STATS, JSON.stringify(this._triviaStats));
  }

  private loadAchievements(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY_ACHIEVEMENTS);
    if (saved) {
      const savedAchievements = JSON.parse(saved);
      this.achievements.forEach((ach) => {
        const savedAch = savedAchievements.find((a: any) => a.id === ach.id);
        ach.unlocked = savedAch ? savedAch.unlocked : false;
      });
    }
  }

  private saveAchievements(): void {
    localStorage.setItem(this.STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(this.achievements));
  }

  // MÉTODO PÚBLICO para actualizar estadísticas
  public updateStats(isCorrect: boolean): void {
    this._triviaStats.answered++;
    if (isCorrect) {
      this._triviaStats.correct++;
      this._triviaStats.streak++;
      this._triviaStats.totalPoints += this.currentTrivia?.points || 10;
    } else {
      this._triviaStats.streak = 0;
    }

    this._triviaStats.maxStreak = Math.max(this._triviaStats.maxStreak, this._triviaStats.streak);
    this._triviaStats.accuracy = Math.round((this._triviaStats.correct / this._triviaStats.answered) * 100);
    this._triviaStats.level = this.calculateTriviaLevel(this._triviaStats.totalPoints);

    this.saveStats();
    this.checkAchievements();
  }

  calculateTriviaLevel(points: number): number {
    return Math.floor(points / 100) + 1;
  }

  getLevelProgress(): number {
    const currentLevelPoints = (this._triviaStats.level - 1) * 100;
    const nextLevelPoints = this._triviaStats.level * 100;
    return ((this._triviaStats.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
  }

  getPointsToNextLevel(): number {
    return this._triviaStats.level * 100 - this._triviaStats.totalPoints;
  }

  checkAchievements(): void {
    let newUnlocks = false;
    this.achievements.forEach((achievement) => {
      if (!achievement.unlocked && achievement.condition(this._triviaStats)) {
        achievement.unlocked = true;
        newUnlocks = true;
        console.log(` Logro desbloqueado: ${achievement.title}`);
      }
    });

    if (newUnlocks) {
      this.saveAchievements();
    }
  }

  // MÉTODO PÚBLICO para obtener logros desbloqueados
  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.unlocked);
  }

  // ==========================================
  // ❓ TRIVIA MÉDICA
  // ==========================================


// En entretenimiento.service.ts, en el método getMedicalTrivia:

getMedicalTrivia(difficulty: string = this.selectedDifficulty): Observable<TriviaQuestion> {
  this.isLoadingTrivia = true;

  // Primero verificar si debemos usar fallback por rate limiting
  const lastApiCall = localStorage.getItem('lastTriviaApiCall');
  const now = Date.now();

  if (lastApiCall && (now - parseInt(lastApiCall)) < 5000) {
    // Si la última llamada fue hace menos de 5 segundos, usar fallback
    console.log('  Usando preguntas locales para evitar rate limiting');
    const fallback = this.getMedicalTriviaFallback();
    this.currentTrivia = fallback;
    this.isLoadingTrivia = false;
    return of(fallback);
  }

  const encodedCategory = encodeURIComponent('Science & Nature');
  const difficultyParam = difficulty ? `&difficulty=${difficulty}` : '';
  const url = `https://opentdb.com/api.php?amount=1&category=17${difficultyParam}&type=multiple&encode=htmlentities`;

  // Guardar timestamp de la llamada
  localStorage.setItem('lastTriviaApiCall', now.toString());

  return this.http.get<any>(url).pipe(
    map((response) => {
      let question: TriviaQuestion;

      if (response.results && response.results.length > 0) {
        const apiQuestion = response.results[0];
        question = {
          question: this.decodeHtmlEntities(apiQuestion.question),
          correct_answer: this.decodeHtmlEntities(apiQuestion.correct_answer),
          incorrect_answers: apiQuestion.incorrect_answers.map((a: string) => this.decodeHtmlEntities(a)),
          difficulty: apiQuestion.difficulty || difficulty,
          category: apiQuestion.category || 'Medicina',
          type: apiQuestion.type || 'multiple',
          points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 25,
          timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 35 : 45,
        };
      } else {
        question = this.getMedicalTriviaFallback();
      }

      this.currentTrivia = question;
      this.isLoadingTrivia = false;
      return question;
    }),
    catchError((error) => {
      if (error.status === 429) {
        console.log('⏳ API con límite de velocidad, usando preguntas locales por un momento');
      } else {
        console.warn('⚠️ Error en API externa, usando preguntas locales:', error);
      }
      this.isLoadingTrivia = false;
      const fallback = this.getMedicalTriviaFallback();
      this.currentTrivia = fallback;
      return of(fallback);
    })
  );
}


  // También mejora el método fallback para mayor variedad:
private getMedicalTriviaFallback(): TriviaQuestion {
  const medicalQuestions: TriviaQuestion[] = [
    {
      question: '¿Cuántos huesos tiene el cuerpo humano adulto?',
      correct_answer: '206',
      incorrect_answers: ['210', '198', '215'],
      difficulty: 'easy',
      category: 'Anatomía',
      type: 'multiple',
      points: 10,
      timeLimit: 30,
    },
    {
      question: '¿Qué órgano produce la insulina?',
      correct_answer: 'Páncreas',
      incorrect_answers: ['Hígado', 'Riñones', 'Bazo'],
      difficulty: 'medium',
      category: 'Endocrinología',
      type: 'multiple',
      explanation: 'El páncreas produce insulina en las células beta de los islotes de Langerhans.',
      points: 15,
      timeLimit: 35,
    },
    {
      question: '¿Cuál es la presión arterial normal en adultos?',
      correct_answer: '120/80 mmHg',
      incorrect_answers: ['140/90 mmHg', '110/70 mmHg', '130/85 mmHg'],
      difficulty: 'medium',
      category: 'Cardiología',
      type: 'multiple',
      points: 15,
      timeLimit: 35,
    },
    {
      question: '¿Qué vitamina se produce en la piel con la exposición solar?',
      correct_answer: 'Vitamina D',
      incorrect_answers: ['Vitamina C', 'Vitamina A', 'Vitamina B12'],
      difficulty: 'easy',
      category: 'Nutrición',
      type: 'multiple',
      points: 10,
      timeLimit: 30,
    },
    {
      question: '¿Cuántas cámaras tiene el corazón humano?',
      correct_answer: '4',
      incorrect_answers: ['2', '3', '6'],
      difficulty: 'easy',
      category: 'Cardiología',
      type: 'multiple',
      points: 10,
      timeLimit: 30,
    },
    {
      question: '¿Qué parte del cerebro controla el equilibrio?',
      correct_answer: 'Cerebelo',
      incorrect_answers: ['Cerebro', 'Tronco encefálico', 'Hipotálamo'],
      difficulty: 'hard',
      category: 'Neurología',
      type: 'multiple',
      points: 25,
      timeLimit: 45,
    },
    {
      question: '¿Cuál es el músculo más fuerte del cuerpo humano?',
      correct_answer: 'Masetero (mandíbula)',
      incorrect_answers: ['Bíceps', 'Cuádriceps', 'Corazón'],
      difficulty: 'hard',
      category: 'Anatomía',
      type: 'multiple',
      points: 25,
      timeLimit: 45,
    },
    {
      question: '¿Qué tipo de sangre es el donante universal?',
      correct_answer: 'O negativo',
      incorrect_answers: ['AB positivo', 'A positivo', 'B negativo'],
      difficulty: 'medium',
      category: 'Hematología',
      type: 'multiple',
      points: 15,
      timeLimit: 35,
    },
     {
      question: '¿Cuál es la frecuencia cardíaca normal en reposo?',
      correct_answer: '60-100 latidos por minuto',
      incorrect_answers: ['40-60 latidos por minuto', '100-120 latidos por minuto', '120-140 latidos por minuto'],
      difficulty: 'easy',
      category: 'Cardiología',
      type: 'multiple',
      points: 10,
      timeLimit: 30,
    },
    {
      question: '¿Qué hormona regula el azúcar en la sangre?',
      correct_answer: 'Insulina',
      incorrect_answers: ['Cortisol', 'Adrenalina', 'Tiroxina'],
      difficulty: 'medium',
      category: 'Endocrinología',
      type: 'multiple',
      points: 15,
      timeLimit: 35,
    },
    {
      question: '¿Cuánto tiempo vive un glóbulo rojo aproximadamente?',
      correct_answer: '120 días',
      incorrect_answers: ['30 días', '60 días', '180 días'],
      difficulty: 'hard',
      category: 'Hematología',
      type: 'multiple',
      points: 25,
      timeLimit: 45,
    }
  ];

  return medicalQuestions[Math.floor(Math.random() * medicalQuestions.length)];
}

  // MÉTODO PÚBLICO para obtener tiempo límite
  public getCurrentTriviaTimeLimit(): number {
    return this.currentTrivia?.timeLimit || 30;
  }

  private decodeHtmlEntities(str: string): string {
    const textArea = new DOMParser().parseFromString(str, 'text/html').documentElement.textContent;
    return textArea || str;
  }

  // ==========================================
  // 😄 CHISTES MÉDICOS
  // ==========================================

  getMedicalJoke(): Observable<JokeResponse> {
    const jokeApis = [
      'https://v2.jokeapi.dev/joke/Programming,Miscellaneous?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=twopart',
    ];

    const randomApi = jokeApis[Math.floor(Math.random() * jokeApis.length)];

    return this.http.get<any>(randomApi).pipe(
      map((response) => {
        if (response.setup && response.delivery) {
          return { setup: response.setup, punchline: response.delivery, type: response.category || 'general', id: response.id || Math.random() };
        } else if (response.setup && response.punchline) {
          return { setup: response.setup, punchline: response.punchline, type: response.type || 'general', id: response.id || Math.random() };
        }
        return response;
      }),
      catchError(() => of(this.getMedicalJokeFallback())),
      map((joke) => {
        this.currentJoke = joke;
        return joke;
      })
    );
  }

  private getMedicalJokeFallback(): JokeResponse {
    const medicalJokes = [
      { setup: '¿Qué le dijo un glóbulo rojo a un glóbulo blanco?', punchline: '¡Estás muy pálido!', type: 'medical', id: 1 },
      { setup: '¿Por qué los médicos siempre llevan un bolígrafo rojo?', punchline: '¡Para firmar en caso de emergencia!', type: 'medical', id: 2 },
      { setup: '¿Qué hace un electrón cuando va al médico?', punchline: '¡Se pone negativo!', type: 'science', id: 4 },
    ];
    return medicalJokes[Math.floor(Math.random() * medicalJokes.length)];
  }

  // ==========================================
  // 🐱 IMÁGENES DE GATOS
  // ==========================================

  getCatImage(): Observable<CatImage[]> {
    const headers = new HttpHeaders().set('x-api-key', this.CAT_API_KEY);
    return this.http.get<CatImage[]>('https://api.thecatapi.com/v1/images/search?limit=1&size=med', { headers }).pipe(
      catchError(() => of([{ id: 'fallback', url: 'assets/fallback-cat.jpg', width: 500, height: 500 }])),
      map((images) => {
        this.lastCatImage = images[0];
        return images;
      })
    );
  }

  // ==========================================
  // 📰 NOTICIAS POSITIVAS
  // ==========================================

  getPositiveNews(): Observable<NewsArticle[]> {
    const positiveTerms = ['health breakthrough', 'medical innovation', 'healthcare improvement'];
    const randomTerm = positiveTerms[Math.floor(Math.random() * positiveTerms.length)];

    const fallbackNews: NewsArticle[] = [
      {
        title: 'Nuevos avances en telemedicina mejoran la atención rural',
        description: 'La implementación de sistemas de telemedicina ha mejorado significativamente el acceso a la atención médica en zonas rurales.',
        url: '#',
        urlToImage: 'assets/news-telemedicina.jpg',
        publishedAt: new Date().toISOString(),
        source: { name: 'Salud Global' },
      },
    ];

    return of(fallbackNews);
  }

  // ==========================================
  // 🎵 MÚSICA RELAJANTE
  // ==========================================

  getRelaxingMusic(): Observable<MusicTrack[]> {
    const url = `${this.LASTFM_BASE_URL}?method=tag.gettoptracks&tag=chill&api_key=${this.LASTFM_API_KEY}&format=json&limit=10`;

    return this.http.get<any>(url).pipe(
      map((data) => data.tracks.track),
      catchError(() => of([]))
    );
  }

  // MÉTODOS PÚBLICOS para control de música
  public playTrack(track: MusicTrack): void {
    this.currentTrackSubject.next(track);
    this.isPlayingSubject.next(true);
    console.log(`🎵 Reproduciendo: ${track.name} - ${track.artist.name}`);
  }

  public pauseTrack(): void {
    this.isPlayingSubject.next(false);
    console.log('⏸ Música pausada');
  }

  // ==========================================
  // 💬 FRASES MOTIVADORAS
  // ==========================================

  getMotivationalQuote(): Observable<MotivationalQuote> {
    const medicalQuotes: MotivationalQuote[] = [
      { text: 'La medicina es una ciencia de incertidumbre y un arte de probabilidad.', author: 'William Osler', category: 'Sabiduría Médica', id: 1 },
      { text: 'Trata al paciente, no solo la enfermedad.', author: 'Paracelso', category: 'Humanización', id: 2 },
      { text: 'La salud es el mayor regalo.', author: 'Lao Tsé', category: 'Bienestar', id: 3 },
      { text: 'No hay enfermedades, sino enfermos.', author: 'Claude Bernard', category: 'Humanización', id: 5 },
    ];

    const randomQuote = medicalQuotes[Math.floor(Math.random() * medicalQuotes.length)];
    this.currentQuote = randomQuote;
    return of(randomQuote);
  }

  // ==========================================
  // 🧘 BIENESTAR Y RECOMENDACIONES
  // ==========================================

  getWellnessProgress(): number {
    const maxActivities = 4;
    let completed = 0;
    if (this._triviaStats.answered > 0) completed++;
    if (this.currentJoke) completed++;
    if (this.currentQuote) completed++;
    if (this.lastCatImage) completed++;
    return Math.round((completed / maxActivities) * 100);
  }

  getRecommendation(): string {
    const progress = this.getWellnessProgress();
    if (progress === 100) return '¡Excelente! Has completado tu sesión de bienestar.';
    if (progress < 25) return 'Empieza con una pregunta de trivia médica.';
    if (progress < 50) return 'Relájate con un chiste médico o una cita inspiradora.';
    return 'Visualiza una imagen de gato para terminar tu sesión con calma.';
  }

  getRecommendationEmoji(): string {
    const progress = this.getWellnessProgress();
    if (progress === 100) return '>';
    if (progress < 50) return '<';
    return '>';
  }

  // ==========================================
  // ⏱️ TIEMPO DE SESIÓN
  // ==========================================

  getTotalSessionTime(): string {
    return '05:32'; // Ejemplo
  }

  getTotalActivities(): number {
    return [this._triviaStats.answered > 0, !!this.currentJoke, !!this.currentQuote, !!this.lastCatImage].filter(Boolean).length;
  }

  // ==========================================
  // 🧹 RESET Y UTILIDADES
  // ==========================================

  resetStats(): void {
    this._triviaStats = {
      answered: 0,
      correct: 0,
      streak: 0,
      maxStreak: 0,
      totalPoints: 0,
      level: 1,
      accuracy: 0,
    };
    this.saveStats();
  }

  getMedicalCategories(): MedicalCategory[] {
    return this.medicalCategories;
  }



  // En entretenimiento.service.ts - Agregar este método:

unlockSpecialAchievement(achievementId: string): void {
  const specialAchievements = {
    'master_zen_supreme': {
      id: 'master_zen_supreme',
      title: 'Maestro Zen Supremo',
      description: 'Alcanzaste el 100% de relajación en una sesión',
      icon: '🧘‍♀️',
      unlocked: true,
      condition: () => true
    }
  };

  const achievement = specialAchievements[achievementId as keyof typeof specialAchievements];
  if (achievement) {
    this.achievements.push(achievement);
    this.saveAchievements();
  }
}


}
