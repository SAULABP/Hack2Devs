/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Consola operativa: superficies oscuras + acentos por severidad
        surface: {
          base: '#0d1117',
          raised: '#161b22',
          overlay: '#1c2128',
          border: '#2d333b',
        },
        ink: {
          primary: '#e6edf3',
          secondary: '#9da7b1',
          muted: '#6e7681',
        },
        accent: '#2f9e8f',      // teal — marca TropelCare
        sev: {
          leve: '#3fb950',
          moderado: '#d29922',
          grave: '#db6d28',
          critico: '#f85149',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
