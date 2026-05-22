import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        graphite: {
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
        },
      },
      boxShadow: {
        soft: '0 18px 45px -28px rgb(15 23 42 / 0.45)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
} satisfies Config
