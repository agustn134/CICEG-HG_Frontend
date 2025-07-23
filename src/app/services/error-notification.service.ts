// src/app/services/error-notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number; // milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class ErrorNotificationService {
  private notificationsSubject = new BehaviorSubject<ErrorNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private activeNotifications: ErrorNotification[] = [];

  constructor() {}

  /**
   * Mostrar error HTTP sin redirigir
   */
// En src/app/services/error-notification.service.ts - línea 67-76

showHttpError(status: number, message: string): void {
  let title = 'Error';
  let type: 'error' | 'warning' | 'info' = 'error';
  let autoHide = true;
  let duration = 8000; // 8 segundos

  switch (status) {
    case 400:
      title = 'Solicitud Inválida';
      break;
    case 401:
      title = 'No Autorizado';
      message = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente';
      autoHide = false;
      break;
    case 403:
      title = 'Sin Permisos';
      message = 'No tiene permisos para realizar esta acción';
      type = 'warning';
      break;
    case 404:
      title = 'No Encontrado';
      message = 'El recurso solicitado no fue encontrado';
      type = 'warning';
      break;
    case 500:
      title = 'Error del Servidor';
      message = 'Ha ocurrido un error interno del servidor. Por favor, intente nuevamente';
      autoHide = false;
      break;
    case 502:
      title = 'Error de Conexión';
      message = 'No se puede conectar con el servidor';
      break;
    case 503:
      title = 'Servicio No Disponible';
      message = 'El servicio no está disponible temporalmente';
      break;
    case 504:
      title = 'Tiempo Agotado';
      message = 'La solicitud ha tardado demasiado tiempo';
      break;
    default:
      title = `Error ${status}`;
  }

  //   CORRECCIÓN: No pasar id ni timestamp aquí
  this.showNotification({
    type,
    title,
    message,
    autoHide,
    duration
  });
}
  /**
 * Mostrar notificación personalizada
 */
showNotification(notification: Omit<ErrorNotification, 'id' | 'timestamp'>): void {
  const fullNotification: ErrorNotification = {
    id: this.generateId(),        //   MOVER AQUÍ
    timestamp: new Date(),        //   MOVER AQUÍ
    ...notification,              //   SPREAD AL FINAL
    autoHide: notification.autoHide ?? true,
    duration: notification.duration ?? 5000
  };

  this.activeNotifications.push(fullNotification);
  this.notificationsSubject.next([...this.activeNotifications]);

  // Auto-hide si está configurado
  if (fullNotification.autoHide) {
    setTimeout(() => {
      this.hideNotification(fullNotification.id);
    }, fullNotification.duration);
  }
}

  /**
   * Ocultar notificación específica
   */
  hideNotification(id: string): void {
    this.activeNotifications = this.activeNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next([...this.activeNotifications]);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll(): void {
    this.activeNotifications = [];
    this.notificationsSubject.next([]);
  }

  /**
   * Mostrar mensaje de éxito
   */
  showSuccess(message: string, title: string = 'Éxito'): void {
    this.showNotification({
      type: 'info',
      title,
      message,
      autoHide: true,
      duration: 3000
    });
  }

  /**
   * Mostrar advertencia
   */
  showWarning(message: string, title: string = 'Advertencia'): void {
    this.showNotification({
      type: 'warning',
      title,
      message,
      autoHide: true,
      duration: 5000
    });
  }

  /**
   * Mostrar error personalizado
   */
  showError(message: string, title: string = 'Error', autoHide: boolean = true): void {
    this.showNotification({
      type: 'error',
      title,
      message,
      autoHide,
      duration: autoHide ? 8000 : undefined
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
