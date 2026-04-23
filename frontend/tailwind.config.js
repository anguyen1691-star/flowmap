export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          amber: '#F8BC24',
          orange: '#F58800',
          navy: '#051821',
          'dark-teal': '#1A4645',
          teal: '#266867',
          'light-teal': '#9EB3C2',
          'slate-dark': '#3B5070',
          'slate': '#4F6D8A',
          'light-blue': '#DDEAF8',
          'red-orange': '#F05223',
          'light-orange': '#FDB130',
          'light-bg': '#F8F8F6',
          'light-gray': '#F0F0EC',
          'mid-gray': '#888888',
          'dark-gray': '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
