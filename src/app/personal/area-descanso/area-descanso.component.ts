// src/app/personal/area-descanso/area-descanso.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import {
  EntretenimientoService,
  TriviaQuestion,
  TriviaStats,
  MedicalCategory,
  JokeResponse,
  MusicTrack,
  MotivationalQuote,
  HealthyMeal,
  CatImage
} from '../../services/entretenimiento/entretenimiento.service';

@Component({
  selector: 'app-area-descanso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './area-descanso.component.html',
  styles: [`
    @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .animate-pulse-soft {
      animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes bounce-gentle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .animate-bounce-gentle {
      animation: bounce-gentle 1s ease-in-out;
    }
  `]
})
export class AreaDescansoComponent implements OnInit, OnDestroy {
  @ViewChild('audioPlayer', { static: false }) audioPlayer!: ElementRef<HTMLAudioElement>;

  private destroy$ = new Subject<void>();
  private sessionStart = new Date();
  private slideshowInterval?: any;
  private timeInterval?: any;

  // ==========================================
  // ESTADOS DE CARGA
  // ==========================================
  isLoadingTrivia = false;
  isLoadingJoke = false;
  isLoadingQuote = false;
  isLoadingMusic = false;
  isLoadingImage = false;
  isLoadingMeal = false;

  // ==========================================
  // ESTADOS DE CONTENIDO
  // ==========================================
  currentTrivia: TriviaQuestion | null = null;
  triviaOptions: string[] = [];
  showTriviaAnswer = false;
  selectedAnswer = -1;
  isCorrectAnswer = false;

  currentJoke: JokeResponse | null = null;
  jokeReaction = { liked: false, likes: 0, laughs: 0 };

  currentQuote: MotivationalQuote | null = null;

  currentTracks: MusicTrack[] = [];
  selectedTrackIndex = -1;
  currentPlayingTrack: MusicTrack | null = null;
  isPlaying = false;
  selectedArtist = 'ludovico einaudi';

  currentImage: CatImage | null = null;
  imageType: 'cat' | 'dog' = 'cat';
  slideshowActive = false;
  relaxationTips = [
    'Observar imágenes relajantes reduce el cortisol en un 23%',
    'Las mascotas ayudan a reducir la presión arterial',
    'Sonreír, aunque sea forzado, libera endorfinas',
    'Contemplar la naturaleza mejora la concentración',
    'Los animales domésticos reducen la sensación de soledad'
  ];
  currentTipIndex = 0;

  currentMeal: HealthyMeal | null = null;

  // ==========================================
  // ESTADÍSTICAS Y TIEMPO
  // ==========================================
  currentTime = '';
  currentDate = '';
  sessionStartTime = '';
  relaxationTime = '0 min';

  // ==========================================
  // TRIVIA MEJORADA
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

  medicalCategories: MedicalCategory[] = [];
  selectedCategory = 'random';
  selectedDifficulty = 'easy';
  gameMode: 'practice' | 'challenge' = 'practice';

  timeRemaining = 30;
  timerInterval?: any;

  recentAchievements: any[] = [
    { icon: '🎯', title: 'Primera Pregunta', description: 'Has respondido tu primera pregunta' },
    { icon: '🔥', title: 'En Racha', description: 'Respuestas correctas consecutivas' }
  ];

  // ==========================================
  // ESTADÍSTICAS ADICIONALES
  // ==========================================
  jokeStats = { enjoyed: 0, shared: 0 };
  musicStats = { played: 0, favorites: 0 };
  imageStats = { viewed: 0, downloaded: 0 };

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
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  private initializeComponent(): void {
    this.medicalCategories = this.entretenimientoService.getMedicalCategories();
    this.loadTriviaStats();
    this.startTimeTracking();
    this.loadInitialContent();
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

    if (diffMins > 0) {
      this.relaxationTime = `${diffMins}:${diffSecs.toString().padStart(2, '0')} min`;
    } else {
      this.relaxationTime = `${diffSecs} seg`;
    }
  }

  private startTimeTracking(): void {
    // Actualizar tiempo cada segundo
    this.timeInterval = setInterval(() => {
      this.updateTime();
      this.updateRelaxationTime();
    }, 1000);

    // Tracking adicional para estadísticas cada minuto
    setInterval(() => {
      console.log('📊 Tracking bienestar:', {
        tiempo: this.getTotalSessionTime(),
        actividades: this.getTotalActivities(),
        nivel: this.getRelaxationLevel()
      });
    }, 60000);
  }

  // ==========================================
  // MÉTODOS DE TEMPORIZADOR
  // ==========================================
  startTimer(): void {
    if (!this.currentTrivia) return;

    this.timeRemaining = this.currentTrivia.timeLimit || 30;
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

  resetTimer(): void {
    this.stopTimer();
    this.timeRemaining = 30;
  }

  onTimeUp(): void {
    if (!this.showTriviaAnswer) {
      this.selectTriviaAnswer('', -1); // Respuesta incorrecta por tiempo agotado
    }
  }

  // ==========================================
  // MÉTODOS DE CARGA DE CONTENIDO
  // ==========================================
  private loadInitialContent(): void {
    Promise.all([
      this.obtenerNuevaTrivia(),
      this.obtenerNuevoChiste(),
      this.obtenerNuevaFrase(),
      this.obtenerNuevaImagen(),
    ]).then(() => {
      console.log('✅ Contenido inicial cargado completamente');
    }).catch(error => {
      console.error('❌ Error cargando contenido inicial:', error);
    });
  }

  loadRandomContent(): void {
    const randomActions = [
      () => this.obtenerNuevaTrivia(),
      () => this.obtenerNuevoChiste(),
      () => this.obtenerNuevaFrase(),
      () => this.obtenerNuevaImagen()
    ];

    const randomAction = randomActions[Math.floor(Math.random() * randomActions.length)];
    randomAction();
  }

  // ==========================================
  // MÉTODOS DE TRIVIA
  // ==========================================
  obtenerNuevaTrivia(): void {
    this.isLoadingTrivia = true;
    this.showTriviaAnswer = false;
    this.selectedAnswer = -1;
    this.resetTimer();

    this.entretenimientoService.getTriviaQuestion(this.selectedCategory, this.selectedDifficulty)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.results && response.results.length > 0) {
            this.currentTrivia = response.results[0];
            this.triviaOptions = [
              ...this.currentTrivia.incorrect_answers,
              this.currentTrivia.correct_answer
            ].sort(() => Math.random() - 0.5);
          }
          this.isLoadingTrivia = false;
          this.startTimer();
        },
        error: (error) => {
          console.error('Error cargando trivia:', error);
          this.isLoadingTrivia = false;
        }
      });
  }

  selectTriviaAnswer(option: string, index: number): void {
    if (this.showTriviaAnswer) return;

    this.stopTimer();
    this.selectedAnswer = index;
    this.isCorrectAnswer = option === this.currentTrivia?.correct_answer;
    this.showTriviaAnswer = true;

    this.updateTriviaStats();
    this.checkAchievements();

    // Auto-avanzar después de 4 segundos para permitir leer la explicación
    setTimeout(() => {
      this.obtenerNuevaTrivia();
    }, 4000);
  }

  // ==========================================
  // MÉTODOS DE ESTADÍSTICAS Y PROGRESO
  // ==========================================
  updateTriviaStats(): void {
    this.triviaStats.answered++;

    if (this.isCorrectAnswer) {
      this.triviaStats.correct++;
      this.triviaStats.streak++;
      this.triviaStats.totalPoints += this.currentTrivia?.points || 0;

      if (this.triviaStats.streak > this.triviaStats.maxStreak) {
        this.triviaStats.maxStreak = this.triviaStats.streak;
      }
    } else {
      this.triviaStats.streak = 0;
    }

    this.triviaStats.accuracy = Math.round((this.triviaStats.correct / this.triviaStats.answered) * 100);
    this.triviaStats.level = this.entretenimientoService.calculateTriviaLevel(this.triviaStats.totalPoints);

    this.saveTriviaStats();
  }

  loadTriviaStats(): void {
    const saved = localStorage.getItem('siceg-trivia-stats');
    if (saved) {
      this.triviaStats = { ...this.triviaStats, ...JSON.parse(saved) };
    }
  }

  saveTriviaStats(): void {
    localStorage.setItem('siceg-trivia-stats', JSON.stringify(this.triviaStats));
  }

  resetGame(): void {
    this.triviaStats = {
      answered: 0,
      correct: 0,
      streak: 0,
      maxStreak: this.triviaStats.maxStreak,
      totalPoints: this.triviaStats.totalPoints,
      level: this.triviaStats.level,
      accuracy: 0
    };
    this.obtenerNuevaTrivia();
  }

  getNextLevelPoints(): number {
    return this.entretenimientoService.getNextLevelPoints(this.triviaStats.level);
  }

  getLevelProgress(): number {
    const currentLevelBase = (this.triviaStats.level - 1) * 100;
    const pointsInCurrentLevel = this.triviaStats.totalPoints - currentLevelBase;
    return Math.round((pointsInCurrentLevel / 100) * 100);
  }

  getPointsToNextLevel(): number {
    return this.getNextLevelPoints() - this.triviaStats.totalPoints;
  }

  checkAchievements(): void {
    // Lógica para desbloquear logros
    if (this.triviaStats.answered === 1) {
      this.unlockAchievement('🎯', 'Primera Pregunta', 'Has respondido tu primera pregunta');
    }

    if (this.triviaStats.streak === 5) {
      this.unlockAchievement('🔥', 'Racha de 5', '5 respuestas correctas seguidas');
    }

    if (this.triviaStats.totalPoints >= 100) {
      this.unlockAchievement('⭐', 'Centenario', 'Has alcanzado 100 puntos');
    }
  }

  unlockAchievement(icon: string, title: string, description: string): void {
    const achievement = { icon, title, description };
    this.recentAchievements.unshift(achievement);
    if (this.recentAchievements.length > 3) {
      this.recentAchievements.pop();
    }
  }

  // ==========================================
  // MÉTODOS DE ESTILO PARA COLORES RELAJANTES
  // ==========================================
  getOptionButtonClass(index: number): string {
    if (this.selectedAnswer === index) {
      return 'bg-blue-500 text-white border-blue-500 shadow-lg';
    }
    return 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-md';
  }

  getResultCardClass(): string {
    return this.isCorrectAnswer
      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
      : 'bg-gradient-to-r from-rose-50 to-red-50 border-rose-300';
  }

  getResultIconClass(): string {
    return this.isCorrectAnswer
      ? 'bg-emerald-500 text-white'
      : 'bg-rose-500 text-white';
  }

  getResultTextClass(): string {
    return this.isCorrectAnswer
      ? 'text-emerald-800'
      : 'text-rose-800';
  }

  getResultSubtextClass(): string {
    return this.isCorrectAnswer
      ? 'text-emerald-600'
      : 'text-rose-600';
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.obtenerNuevaTrivia();
  }

  onDifficultyChange(event: any): void {
    this.selectedDifficulty = event.target.value;
    this.obtenerNuevaTrivia();
  }

  toggleGameMode(): void {
    this.gameMode = this.gameMode === 'practice' ? 'challenge' : 'practice';
    this.resetGame();
  }

  // ==========================================
  // MÉTODOS DE CHISTES
  // ==========================================
  obtenerNuevoChiste(): void {
    this.isLoadingJoke = true;

    this.entretenimientoService.getJokeInSpanish()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (joke) => {
          this.currentJoke = joke;
          this.jokeReaction = { liked: false, likes: Math.floor(Math.random() * 50) + 10, laughs: Math.floor(Math.random() * 30) + 5 };
          this.isLoadingJoke = false;
        },
        error: (error) => {
          console.error('Error cargando chiste:', error);
          this.isLoadingJoke = false;
        }
      });
  }

  likeJoke(): void {
    if (!this.jokeReaction.liked) {
      this.jokeReaction.liked = true;
      this.jokeReaction.likes++;
      this.jokeStats.enjoyed++;
    }
  }

  laughReaction(event: Event): void {
    this.jokeReaction.laughs++;
    this.jokeStats.enjoyed++;

    // Efecto visual de risa
    const button = event.target as HTMLElement;
    button.classList.add('animate-bounce');
    setTimeout(() => {
      button.classList.remove('animate-bounce');
    }, 1000);
  }

  // ==========================================
  // MÉTODOS DE FRASES MOTIVACIONALES
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
          console.error('Error cargando frase:', error);
          this.isLoadingQuote = false;
        }
      });
  }

  shareQuote(): void {
    if (this.currentQuote) {
      const text = `"${this.currentQuote.text}" - ${this.currentQuote.author}`;

      if (navigator.share) {
        navigator.share({
          title: 'Frase Inspiradora - SICEG-HG',
          text: text,
          url: window.location.href
        }).catch(console.error);
      } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(text).then(() => {
          alert('¡Frase copiada al portapapeles!');
        }).catch(() => {
          alert('Error al copiar la frase');
        });
      }
    }
  }

  // ==========================================
  // MÉTODOS DE IMÁGENES
  // ==========================================
  obtenerNuevaImagen(): void {
    this.isLoadingImage = true;

    const imageService = this.imageType === 'cat'
      ? this.entretenimientoService.getCatImage()
      : this.entretenimientoService.getDogImage();

    imageService.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          this.currentImage = response[0];
          this.imageStats.viewed++;
        }
        this.isLoadingImage = false;
      },
      error: (error) => {
        console.error('Error cargando imagen:', error);
        this.isLoadingImage = false;
      }
    });
  }

  switchImageType(type: 'cat' | 'dog'): void {
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
      this.imageStats.downloaded++;
    }
  }

  startSlideshow(): void {
    if (this.slideshowActive) {
      this.stopSlideshow();
    } else {
      this.slideshowActive = true;
      this.slideshowInterval = setInterval(() => {
        this.obtenerNuevaImagen();
        // Cambiar tip de relajación
        this.currentTipIndex = (this.currentTipIndex + 1) % this.relaxationTips.length;
      }, 5000); // Cambiar imagen cada 5 segundos
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
  // MÉTODOS DE ESTADÍSTICAS
  // ==========================================
  getTotalSessionTime(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.sessionStart.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins >= 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }

    return `${diffMins}m`;
  }

  getTotalActivities(): number {
    return this.triviaStats.answered +
           this.jokeStats.enjoyed +
           this.musicStats.played +
           this.imageStats.viewed;
  }

  getRelaxationLevel(): number {
    const baseLevel = 20; // Nivel base por estar en el área
    const timeBonus = Math.min(Math.floor((Date.now() - this.sessionStart.getTime()) / 60000) * 2, 40); // 2% por minuto, max 40%
    const activityBonus = Math.min(this.getTotalActivities() * 5, 40); // 5% por actividad, max 40%

    return Math.min(baseLevel + timeBonus + activityBonus, 100);
  }

  getWellnessProgress(): number {
    const activities = this.getTotalActivities();
    const timeMinutes = Math.floor((Date.now() - this.sessionStart.getTime()) / 60000);

    // Meta: 10 actividades o 20 minutos para 100%
    const activityProgress = Math.min((activities / 10) * 50, 50);
    const timeProgress = Math.min((timeMinutes / 20) * 50, 50);

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

    if (level < 30) return '🌱';
    if (level < 60) return '🌿';
    if (level < 85) return '🌳';
    return '🏆';
  }

  // ==========================================
  // MÉTODOS DE AUDIO EVENTOS
  // ==========================================
  onAudioEnded(): void {
    this.isPlaying = false;
    this.entretenimientoService.setIsPlaying(false);
    console.log('🎵 Audio terminado');
  }

  onAudioLoadStart(): void {
    console.log('🎵 Iniciando carga de audio...');
  }

  onAudioCanPlay(): void {
    console.log('🎵 Audio listo para reproducir');
  }

  onAudioError(event: any): void {
    console.error('❌ Error de audio:', event);
    this.isPlaying = false;
    this.entretenimientoService.setIsPlaying(false);
    this.showNotification('No se pudo reproducir el audio', 'error');
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================
  regresarDashboard(): void {
    // Guardar estadísticas de la sesión
    const sessionData = {
      duration: this.getTotalSessionTime(),
      activities: this.getTotalActivities(),
      relaxationLevel: this.getRelaxationLevel(),
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('siceg-last-wellness-session', JSON.stringify(sessionData));

    this.router.navigate(['/app/dashboard']);
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
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
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Método para obtener la letra de la opción (A, B, C, D)
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // ==========================================
  // MÉTODOS AUXILIARES PARA EL TEMPLATE
  // ==========================================

  // Getter para obtener puntos de manera segura
  getCurrentTriviaPoints(): number {
    return this.currentTrivia?.points || 0;
  }

  // Getter para obtener tiempo límite de manera segura
  getCurrentTriviaTimeLimit(): number {
    return this.currentTrivia?.timeLimit || 30;
  }
}
