// src/app/models/configuracion.model.ts (CORREGIR)
export interface ConfiguracionSistema {
  id_configuracion: number;
  parametro: string;
  valor: string;
  descripcion: string;
  tipo: 'texto' | 'imagen' | 'color' | 'numero' | 'booleano';
  categoria: string;
  fecha_modificacion: string;
  modificado_por: number;
}

export interface ConfiguracionLogos {
  logo_principal: string;
  logo_sidebar: string;
  favicon: string;
  logo_gobierno: string;
  nombre_hospital: string;
  nombre_dependencia: string;
  color_primario: string;
  color_secundario: string;
}

// 🔥 CORREGIDO: Usar SVG por defecto
export const CONFIGURACION_DEFAULT: ConfiguracionLogos = {
  logo_principal: '/uploads/logos/logo-principal-default.svg',
  logo_sidebar: '/uploads/logos/logo-sidebar-default.svg',
  favicon: '/uploads/logos/favicon.ico',
  logo_gobierno: '/uploads/logos/logo-gobierno-default.svg',
  nombre_hospital: 'Hospital General San Luis de la Paz',
  nombre_dependencia: 'Secretaría de Salud de Guanajuato',
  color_primario: '#1e40af',
  color_secundario: '#3b82f6'
};
