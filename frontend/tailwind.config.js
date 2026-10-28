/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxe: {
          canvas: '#FBFBF9',     // Warm travertine background
          surface: '#FFFFFF',    // Pristine card white
          primary: '#18181B',    // Deep zinc typography
          muted: '#71717A',      // Slate secondary text
          border: '#E4E4E7',     // Subtle divider lines
          amber: '#D97706',      // Warm bronze accent
          emerald: '#064E3B',    // Forest botanical green
          sand: '#F4F4F0',       // Soft neutral pill badge
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        editorial: '0.25em',
        luxury: '0.15em',
      }
    },
  },
  plugins: [],
}