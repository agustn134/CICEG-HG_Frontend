// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/**/*.{html,ts}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // 🏥 Colores específicos para sistema hospitalario
      colors: {
        hospital: {
          // Azules principales (confianza, profesionalismo)
          'primary': '#1e40af',      // bg-hospital-primary
          'primary-light': '#3b82f6', // bg-hospital-primary-light
          'primary-dark': '#1e3a8a',  // bg-hospital-primary-dark

          // Verdes (salud, éxito)
          'success': '#059669',       // bg-hospital-success
          'success-light': '#10b981', // bg-hospital-success-light
          'success-dark': '#047857',  // bg-hospital-success-dark

          // Rojos (emergencia, error)
          'emergency': '#dc2626',     // bg-hospital-emergency
          'emergency-light': '#ef4444', // bg-hospital-emergency-light
          'emergency-dark': '#b91c1c', // bg-hospital-emergency-dark

          // Naranjas (advertencia)
          'warning': '#d97706',       // bg-hospital-warning
          'warning-light': '#f59e0b', // bg-hospital-warning-light
          'warning-dark': '#b45309',  // bg-hospital-warning-dark

          // Azules informativos
          'info': '#0284c7',          // bg-hospital-info
          'info-light': '#0ea5e9',    // bg-hospital-info-light
          'info-dark': '#0369a1',     // bg-hospital-info-dark

          // Grises para formularios y fondos
          'gray-50': '#f9fafb',       // bg-hospital-gray-50
          'gray-100': '#f3f4f6',      // bg-hospital-gray-100
          'gray-200': '#e5e7eb',      // bg-hospital-gray-200
          'gray-300': '#d1d5db',      // bg-hospital-gray-300
          'gray-400': '#9ca3af',      // bg-hospital-gray-400
          'gray-500': '#6b7280',      // bg-hospital-gray-500
          'gray-600': '#4b5563',      // bg-hospital-gray-600
          'gray-700': '#374151',      // bg-hospital-gray-700
          'gray-800': '#1f2937',      // bg-hospital-gray-800
          'gray-900': '#111827',      // bg-hospital-gray-900
        }
      },

      // 📱 Breakpoints personalizados para responsive design
      screens: {
        'xs': '475px',    // Para móviles grandes
        'sm': '640px',    // Tablet pequeña
        'md': '768px',    // Tablet
        'lg': '1024px',   // Desktop pequeño
        'xl': '1280px',   // Desktop grande
        '2xl': '1536px',  // Desktop muy grande
      },

      // 🎨 Sombras personalizadas para tarjetas
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-focus': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'form-focus': '0 0 0 3px rgba(59, 130, 246, 0.1)',
        'error': '0 0 0 3px rgba(239, 68, 68, 0.1)',
        'success': '0 0 0 3px rgba(16, 185, 129, 0.1)',
      },

      // 🔤 Fuentes para diferentes tipos de contenido médico
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'medical': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },

      // 📏 Espaciado personalizado
      spacing: {
        '18': '4.5rem',   // Para elementos intermedios
        '88': '22rem',    // Para contenedores grandes
        '128': '32rem',   // Para modales
      },

      // 🎯 Border radius personalizados
      borderRadius: {
        'card': '0.75rem',      // rounded-card
        'form': '0.5rem',       // rounded-form
        'button': '0.5rem',     // rounded-button
        'modal': '1rem',        // rounded-modal
      },

      // ⏱️ Animaciones y transiciones
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },

      // 🎭 Animaciones personalizadas
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },

  // 🔌 Plugins recomendados para sistema hospitalario
  plugins: [
    // Plugin para mejores formularios (campos de entrada más bonitos)
    // Descomenta si quieres instalarlo: npm install @tailwindcss/forms --save-dev
    // require('@tailwindcss/forms'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Plugin para tipografía (útil para documentos médicos)
    // Descomenta si quieres instalarlo: npm install @tailwindcss/typography --save-dev
    // require('@tailwindcss/typography'),

    // Plugin para aspect ratios (útil para imágenes médicas)
    // Descomenta si quieres instalarlo: npm install @tailwindcss/aspect-ratio --save-dev
    // require('@tailwindcss/aspect-ratio'),

    // Plugin personalizado para clases de utilidad hospitales
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Clases para tarjetas de hospital
        '.card-hospital': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.card'),
          boxShadow: theme('boxShadow.card'),
          padding: theme('spacing.6'),
          transition: 'all 0.2s ease-in-out',
        },
        '.card-hospital:hover': {
          boxShadow: theme('boxShadow.card-hover'),
          transform: 'translateY(-1px)',
        },

        // Clases para formularios médicos
        '.form-field': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          border: `2px solid ${theme('colors.hospital.gray-300')}`,
          borderRadius: theme('borderRadius.form'),
          fontSize: theme('fontSize.sm'),
          transition: 'all 0.2s ease-in-out',
        },
        '.form-field:focus': {
          outline: 'none',
          borderColor: theme('colors.hospital.primary'),
          boxShadow: theme('boxShadow.form-focus'),
        },
        '.form-field.error': {
          borderColor: theme('colors.hospital.emergency'),
          boxShadow: theme('boxShadow.error'),
        },
        '.form-field.success': {
          borderColor: theme('colors.hospital.success'),
          boxShadow: theme('boxShadow.success'),
        },

        // Botones personalizados
        '.btn-hospital': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.button'),
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          border: 'none',
        },
        '.btn-hospital:disabled': {
          opacity: '0.5',
          cursor: 'not-allowed',
        },

        // Estados de loading
        '.loading': {
          position: 'relative',
          pointerEvents: 'none',
        },
        '.loading::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '20px',
          height: '20px',
          marginTop: '-10px',
          marginLeft: '-10px',
          border: '2px solid transparent',
          borderTop: `2px solid ${theme('colors.hospital.primary')}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        },
      }

      addUtilities(newUtilities)
    },
  ],
}
