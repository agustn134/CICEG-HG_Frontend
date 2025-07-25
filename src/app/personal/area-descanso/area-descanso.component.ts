import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, Subscription } from 'rxjs';

import {
  EntretenimientoService,
  TriviaQuestion,
  TriviaStats,
  MedicalCategory,
  JokeResponse,
  MusicTrack,
  MotivationalQuote,
  CatImage,
  NewsArticle,
  Achievement
} from '../../services/entretenimiento/entretenimiento.service';

@Component({
  selector: 'app-area-descanso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './area-descanso.component.html',
  styles: [`
    @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
    .animate-pulse-soft { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

    @keyframes bounce-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .animate-bounce-gentle { animation: bounce-gentle 1s ease-in-out; }

    .answer-option:hover { @apply bg-slate-100 cursor-pointer; }
    .answer-option.selected { @apply ring-2 ring-blue-500 bg-blue-50; }
    .answer-option.correct { @apply bg-green-100 border-green-500 text-green-800; }
    .answer-option.incorrect { @apply bg-red-100 border-red-500 text-red-800; }
  `]
})
export class AreaDescansoComponent implements OnInit, OnDestroy {
  @ViewChild('audioPlayer', { static: false }) audioPlayer!: ElementRef<HTMLAudioElement>;

  private destroy$ = new Subject<void>();
  private sessionStart = new Date();
  private slideshowInterval: any;

  // ==========================================
  // ESTADOS DE CARGA
  // ==========================================
  isLoadingTrivia = false;
  isLoadingJoke = false;
  isLoadingQuote = false;
  isLoadingMusic = false;
  isLoadingImage = false;
  isLoadingNews = false;

  // ==========================================
  // ESTADOS DE CONTENIDO
  // ==========================================
  currentTrivia: TriviaQuestion | null = null;
  triviaOptions: string[] = [];
  showTriviaAnswer = false;
  selectedAnswer = -1;
  isCorrectAnswer = false;

  currentJoke: JokeResponse | null = null;
  jokeReaction = {
    liked: false,
    likes: Math.floor(Math.random() * 50) + 10,
    laughs: Math.floor(Math.random() * 30) + 5
  };

  currentQuote: MotivationalQuote | null = null;
  currentNews: NewsArticle[] = [];
  currentTracks: MusicTrack[] = [];
  selectedTrackIndex = -1;
  currentPlayingTrack: MusicTrack | null = null;
  isPlaying = false;

  currentImage: CatImage | null = null;
  imageType: 'cat' | 'dog' = 'cat';
  slideshowActive = false;

  // ==========================================
  // CONFIGURACIÓN DE JUEGO
  // ==========================================
  selectedCategory = 'random';
  selectedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  gameMode: 'practice' | 'challenge' = 'practice';
  timeRemaining = 30;
  timerInterval: any;

  // ==========================================
  // ESTADÍSTICAS Y PROGRESO
  // ==========================================
  triviaStats: TriviaStats = {
    answered: 0,
    correct: 0,
    streak: 0,
    maxStreak: 0,
    totalPoints: 0,
    level: 1,
    accuracy: 0
  };
  recentAchievements: { icon: string; title: string; description: string }[] = [];

  // UI
  currentTime = '';
  currentDate = '';
  relaxationTime = '0 seg';
  relaxationTips = [
    'Observar imágenes relajantes reduce el cortisol en un 23%',
    'Las mascotas ayudan a reducir la presión arterial',
    'Reír libera endorfinas y mejora el estado de ánimo',
    'La música suave reduce la frecuencia cardíaca',
    'Las frases motivadoras mejoran la resiliencia'
  ];
  currentTipIndex = 0;

  constructor(
    private router: Router,
    private entretenimientoService: EntretenimientoService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopSlideshow();
    this.stopTimer();
    if (this.slideshowInterval) clearInterval(this.slideshowInterval);
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  private initializeComponent(): void {
    this.updateTime();
    this.medicalCategories = this.entretenimientoService.getMedicalCategories();
    this.loadTriviaStats();
    this.loadUnlockedAchievements();
    this.startTimeTracking();
    this.loadInitialContent();
  }

  private loadInitialContent(): void {
    Promise.all([
      this.obtenerNuevaTrivia(),
      this.obtenerNuevoChiste(),
      this.obtenerNuevaFrase(),
      this.obtenerNuevaImagen(),
      this.obtenerNoticiasPositivas(),
      this.obtenerMusicaRelajante()
    ]).then(() => {
      console.log('✅ Contenido inicial cargado completamente');
    }).catch(error => {
      console.error('❌ Error cargando contenido inicial:', error);
    });
  }

  // ==========================================
  // MÉTODOS DE TIEMPO Y SESIÓN
  // ==========================================
  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    this.currentDate = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private updateRelaxationTime(): void {
    const now = new Date();
    const diffMs = now.getTime() - this.sessionStart.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    this.relaxationTime = diffMins > 0
      ? `${diffMins}:${diffSecs.toString().padStart(2, '0')} min`
      : `${diffSecs} seg`;
  }

  private startTimeTracking(): void {
    setInterval(() => {
      this.updateTime();
      this.updateRelaxationTime();
    }, 1000);
  }

   // Método para manejar cambio de dificultad con tipos correctos
  onDifficultyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedDifficulty = target.value as 'easy' | 'medium' | 'hard';
    this.obtenerNuevaTrivia();
  }

  // ==========================================
  // MÉTODOS DE TRIVIA
  // ==========================================
  obtenerNuevaTrivia(): void {
  this.isLoadingTrivia = true;
  this.showTriviaAnswer = false;
  this.selectedAnswer = -1;
  this.isCorrectAnswer = false;

  this.entretenimientoService.getMedicalTrivia(this.selectedDifficulty)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (question: TriviaQuestion) => {
        // Validación adicional para asegurar que question no sea null
        if (question && question.incorrect_answers && question.correct_answer) {
          this.currentTrivia = question;
          this.triviaOptions = [...question.incorrect_answers, question.correct_answer]
            .sort(() => Math.random() - 0.5);
          this.isLoadingTrivia = false;
          this.startTimer();
        } else {
          console.error('❌ Pregunta inválida recibida:', question);
          this.isLoadingTrivia = false;
          // Intentar de nuevo o mostrar mensaje de error
          this.showNotification('Error cargando pregunta. Intenta de nuevo.', 'error');
        }
      },
      error: (error: any) => {
        console.error('❌ Error cargando trivia:', error);
        this.isLoadingTrivia = false;
        this.showNotification('Error de conexión. Usando preguntas locales.', 'info');
      }
    });
}

  startTimer(): void {
    this.timeRemaining = this.entretenimientoService.getCurrentTriviaTimeLimit();
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.onTimeUp();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onTimeUp(): void {
    if (!this.showTriviaAnswer) {
      this.selectTriviaAnswer('', -1); // Tiempo agotado = incorrecto
    }
  }

  selectTriviaAnswer(option: string, index: number): void {
    if (this.showTriviaAnswer || this.selectedAnswer !== -1) return;

    this.selectedAnswer = index;
    this.isCorrectAnswer = option === this.currentTrivia?.correct_answer;
    this.showTriviaAnswer = true;
    this.stopTimer();

    this.entretenimientoService.updateStats(this.isCorrectAnswer);

    // Actualizar estadísticas locales
    this.triviaStats = { ...this.entretenimientoService.triviaStats };

    // Verificar logros
    this.checkAchievements();

    // Mostrar notificación si es correcto
    if (this.isCorrectAnswer) {
      this.showNotification(`+${this.getCurrentTriviaPoints()} puntos`, 'success');
    } else {
      this.showNotification('Sigue intentando', 'info');
    }
  }

  // ==========================================
  // MÉTODOS DE CHISTES
  // ==========================================
   // Método para obtener chiste con tipos correctos
  obtenerNuevoChiste(): void {
    this.isLoadingJoke = true;
    this.entretenimientoService.getMedicalJoke()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (joke: JokeResponse) => {
          this.currentJoke = joke;
          this.jokeReaction = {
            liked: false,
            likes: Math.floor(Math.random() * 50) + 10,
            laughs: Math.floor(Math.random() * 30) + 5
          };
          this.isLoadingJoke = false;
        },
        error: (error: any) => {
          console.error('❌ Error cargando chiste:', error);
          this.isLoadingJoke = false;
        }
      });
  }


  likeJoke(): void {
    if (!this.jokeReaction.liked) {
      this.jokeReaction.liked = true;
      this.jokeReaction.likes++;
    }
  }

  laughReaction(event: Event): void {
    this.jokeReaction.laughs++;
    const button = event.target as HTMLElement;
    button.classList.add('animate-bounce-gentle');
    setTimeout(() => button.classList.remove('animate-bounce-gentle'), 1000);
  }

  // ==========================================
  // MÉTODOS DE FRASES
  // ==========================================
  obtenerNuevaFrase(): void {
    this.isLoadingQuote = true;
    this.entretenimientoService.getMotivationalQuote()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (quote) => {
          this.currentQuote = quote;
          this.isLoadingQuote = false;
        },
        error: (error) => {
          console.error('❌ Error cargando frase:', error);
          this.isLoadingQuote = false;
        }
      });
  }

  // ==========================================
  // MÉTODOS DE IMÁGENES
  // ==========================================
  obtenerNuevaImagen(): void {
    this.isLoadingImage = true;
    this.entretenimientoService.getCatImage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (images) => {
          this.currentImage = images[0];
          this.isLoadingImage = false;
          this.currentImage.width = 500;
          this.currentImage.height = 500;
        },
        error: () => {
          this.currentImage = {
            id: 'fallback',
            url: '/assets/images/fallback-zen.jpg',
            width: 500,
            height: 500
          };
          this.isLoadingImage = false;
        }
      });
  }

  changeImageType(type: 'cat' | 'dog'): void {
    if (this.imageType !== type) {
      this.imageType = type;
      this.obtenerNuevaImagen();
    }
  }

  onImageLoad(): void {
    console.log('✅ Imagen cargada correctamente');
  }

  onImageError(): void {
    console.warn('⚠️ Error cargando imagen, usando fallback');
    this.currentImage = {
      id: 'fallback',
      url: '/assets/images/fallback-zen.jpg',
      width: 500,
      height: 500
    };
  }

  downloadImage(): void {
    if (this.currentImage) {
      const link = document.createElement('a');
      link.href = this.currentImage.url;
      link.download = `siceg-zen-${this.imageType}-${Date.now()}.jpg`;
      link.click();
      this.showNotification('Imagen descargada', 'success');
    }
  }

  startSlideshow(): void {
    if (this.slideshowActive) {
      this.stopSlideshow();
    } else {
      this.slideshowActive = true;
      this.slideshowInterval = setInterval(() => {
        this.obtenerNuevaImagen();
        this.currentTipIndex = (this.currentTipIndex + 1) % this.relaxationTips.length;
      }, 5000);
    }
  }

  private stopSlideshow(): void {
    this.slideshowActive = false;
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
      this.slideshowInterval = null;
    }
  }

  // ==========================================
  // MÉTODOS DE MÚSICA
  // ==========================================
   // Método para obtener música con tipos correctos
  obtenerMusicaRelajante(): void {
    this.isLoadingMusic = true;
    this.entretenimientoService.getRelaxingMusic()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tracks: MusicTrack[]) => {
          this.currentTracks = tracks.slice(0, 5);
          this.isLoadingMusic = false;
        },
        error: (error: any) => {
          console.error('❌ Error cargando música:', error);
          this.isLoadingMusic = false;
        }
      });
  }

  playTrack(track: MusicTrack, index: number): void {
    this.selectedTrackIndex = index;
    this.currentPlayingTrack = track;
    this.isPlaying = true;
    this.entretenimientoService.playTrack(track);
  }

  pauseTrack(): void {
    this.isPlaying = false;
    this.entretenimientoService.pauseTrack();
  }

  // ==========================================
  // MÉTODOS DE NOTICIAS
  // ==========================================
  obtenerNoticiasPositivas(): void {
    this.isLoadingNews = true;
    this.entretenimientoService.getPositiveNews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (news) => {
          this.currentNews = news;
          this.isLoadingNews = false;
        },
        error: (error) => {
          console.error('❌ Error cargando noticias:', error);
          this.isLoadingNews = false;
        }
      });
  }

  // ==========================================
  // MÉTODOS DE ESTADÍSTICAS Y LOGROS
  // ==========================================
  private loadTriviaStats(): void {
    this.triviaStats = { ...this.entretenimientoService.triviaStats };
  }

  private loadUnlockedAchievements(): void {
    const unlocked = this.entretenimientoService.getUnlockedAchievements();
    this.recentAchievements = unlocked.map(a => ({
      icon: a.icon,
      title: a.title,
      description: a.description
    }));
  }

  checkAchievements(): void {
    const newUnlocks = this.entretenimientoService.getUnlockedAchievements()
      .filter(ach => !this.recentAchievements.some(ra => ra.title === ach.title));

    newUnlocks.forEach(ach => {
      this.recentAchievements.push({
        icon: ach.icon,
        title: ach.title,
        description: ach.description
      });
      this.showNotification(`🎉 Logro: ${ach.title}`, 'success');
    });
  }

  getLevelProgress(): number {
    const currentLevelBase = (this.triviaStats.level - 1) * 100;
    const pointsInCurrentLevel = this.triviaStats.totalPoints - currentLevelBase;
    return Math.min(100, Math.round((pointsInCurrentLevel / 100) * 100));
  }

  getPointsToNextLevel(): number {
    return this.triviaStats.level * 100 - this.triviaStats.totalPoints;
  }

  getTotalSessionTime(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.sessionStart.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins} min`;
  }

  getRelaxationLevel(): number {
    const timeMinutes = Math.floor((new Date().getTime() - this.sessionStart.getTime()) / 60000);
    const timeProgress = Math.min((timeMinutes / 20) * 50, 50);
    const activityCount = [this.currentTrivia, this.currentJoke, this.currentQuote, this.currentImage].filter(Boolean).length;
    const activityProgress = (activityCount / 4) * 50;
    return Math.round(activityProgress + timeProgress);
  }

  getRecommendation(): string {
    const level = this.getRelaxationLevel();
    if (level < 30) return 'Continúa relajándote';
    if (level < 60) return 'Buen progreso';
    if (level < 85) return 'Excelente nivel';
    return 'Perfectamente relajado';
  }

  getRecommendationEmoji(): string {
    const level = this.getRelaxationLevel();
    return level < 30 ? '🌱' : level < 60 ? '🌿' : level < 85 ? '🌳' : '🏆';
  }

  // ==========================================
  // NOTIFICACIONES
  // ==========================================
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full opacity-0
      ${type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'}
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 100);

    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentElement) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================
  regresarDashboard(): void {
    const sessionData = {
      duration: this.getTotalSessionTime(),
      activities: [this.currentTrivia, this.currentJoke, this.currentQuote, this.currentImage].filter(Boolean).length,
      relaxationLevel: this.getRelaxationLevel(),
      timestamp: new Date().toISOString(),
      stats: this.triviaStats
    };
    localStorage.setItem('siceg-last-wellness-session', JSON.stringify(sessionData));
    this.router.navigate(['/app/dashboard']);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getCurrentTriviaPoints(): number {
    return this.currentTrivia?.points || 10;
  }

  getCurrentTriviaTimeLimit(): number {
    return this.currentTrivia?.timeLimit || 30;
  }

  // src/app/personal/area-descanso/area-descanso.component.ts

getTotalActivities(): number {
  return [this.currentTrivia, this.currentJoke, this.currentQuote, this.currentImage]
    .filter(item => item !== null).length;
}

shareQuote(): void {
  if (!this.currentQuote) return;

  const text = `"${this.currentQuote.text}" — ${this.currentQuote.author}`;

  if (navigator.share) {
    navigator.share({
      title: 'Frase Inspiradora - SICEG-HG',
      text: text,
      url: window.location.href
    }).catch(err => {
      console.log('Error al compartir:', err);
    });
  } else {
    // Fallback: copiar al portapapeles
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Frase copiada al portapapeles', 'success');
    }).catch(() => {
      this.showNotification('No se pudo copiar', 'error');
    });
  }
}

  // ==========================================
  // PROPIEDADES
  // ==========================================
  medicalCategories: MedicalCategory[] = [];
}
