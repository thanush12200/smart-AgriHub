/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0faf4',
          100: '#d1f0dd',
          200: '#a3e1bb',
          300: '#6bcc94',
          400: '#38a169',
          500: '#1a7a4c',
          600: '#14613c',
          700: '#0f4a2e',
          800: '#0a3320',
          900: '#061c12',
        },
        accent: {
          50: '#fef6ee',
          100: '#fce8d3',
          200: '#f9cda6',
          300: '#f4a96e',
          400: '#e07c3a',
          500: '#c8611f',
          600: '#a04a17',
          700: '#7a3812',
        },
        surface: {
          0: '#ffffff',
          50: '#faf9f7',
          100: '#f3f1ed',
          200: '#e8e5df',
          300: '#d4d0c8',
        },
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        shell: '32px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 25px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
        soft: '0 2px 8px rgba(0,0,0,0.05)',
        shell: '0 20px 60px rgba(11, 32, 24, 0.08)',
        glow: '0 12px 30px rgba(26, 122, 76, 0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'stagger-in': 'fadeIn 0.3s ease-out both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
