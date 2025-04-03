import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Define your custom color palette based on ASC Dalfsen colors
        // Example using blues and white from the logo
        primary: {
          '50': '#E3F2FD', // Lighter blue for backgrounds
          '100': '#BBDEFB',
          '200': '#90CAF9',
          '300': '#64B5F6',
          '400': '#42A5F5',
          '500': '#2196F3', // Main blue
          '600': '#1E88E5', // Slightly darker blue for primary actions/text
          '700': '#1976D2',
          '800': '#1565C0',
          '900': '#0D47A1',
        },
        secondary: {
          '50': '#F8FAFC', // Very light grey/off-white
          '100': '#F1F5F9',
          '200': '#E2E8F0',
          '300': '#CBD5E1',
          '400': '#94A3B8',
          '500': '#64748B',
          '600': '#475569', // Darker grey for text
          '700': '#334155',
          '800': '#1E293B',
          '900': '#0F172A', // Very dark grey/near black
        }
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0, 0, 0, 0.05)', // Softer shadow
      },
      // You might extend other theme properties like fontFamily if needed
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Add forms plugin for better default styling
  ],
}
export default config 