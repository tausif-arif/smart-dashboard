/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'Arial', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        ink: 'var(--ink)',
        body: 'var(--body)',
        mute: 'var(--mute)',
        faint: 'var(--faint)',
        hairline: 'var(--hairline)',
        'hairline-soft': 'var(--hairline-soft)',
        canvas: 'var(--canvas)',
        'canvas-elevated': 'var(--canvas-elevated)',
        link: 'var(--link)',
        'link-deep': 'var(--link-deep)',
        'link-soft': 'var(--link-soft)',
        error: 'var(--error)',
        'error-deep': 'var(--error-deep)',
        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
        'warning-deep': 'var(--warning-deep)',
      },
      boxShadow: {
        whisper: '0px 1px 1px rgba(0, 0, 0, 0.04)',
        floating: '0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
