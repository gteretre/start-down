import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        backHeader: 'var(--backHeader)',
        foreHeader: 'var(--foreHeader)',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        sm: '0 1.5px 4px 0 rgba(80, 180, 255, 0.08), 0 1px 2px 0 rgba(0,0,0,0.08)',
        md: '0 2px 8px 0 rgba(80, 180, 255, 0.10), 0 2px 8px 0 rgba(0,0,0,0.10)',
        lg: '0 4px 24px 0 rgba(0, 0, 0, 0.12), 0 1.5px 8px 0 rgba(80, 180, 255, 0.08)',
        DEFAULT: '0 4px 24px 0 rgba(0, 0, 0, 0.12), 0 1.5px 8px 0 rgba(80, 180, 255, 0.08)',
        dark: '0 4px 24px 0 rgba(0, 0, 0, 0.7), 0 1.5px 8px 0 rgba(80, 180, 255, 0.12)',
        header: '0 1px 2px rgba(0, 0, 0, 0.05)',
        logoHover: '0 4px 8px rgba(0, 0, 0, 0.2)',
        neon: "0 0 5px theme('colors.purple.200'), 0 0 20px theme('colors.purple.700')",
      },
      borderRadius: {
        logo: '50%',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionProperty: {
        logo: 'transform, box-shadow',
      },
      transitionTimingFunction: {
        logo: 'ease',
      },
      transitionDuration: {
        logo: '300ms',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 1s linear infinite',
      },
    },
    plugins: [tailwindcssAnimate],
  },
} satisfies Config;
