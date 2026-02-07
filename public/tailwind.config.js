// eslint-disable-next-line no-undef
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366F1', // Indigo 500
        'primary-dark': '#4F46E5', // Indigo 600

        secondary: '#A855F7', // Purple 500
        'secondary-dark': '#9333EA', // Purple 600

        accent: '#14B8A6', // Teal 500

        'surface-light': '#FFFFFF',
        'surface-dark': '#1F2937', // Gray 800

        'border-light': '#E5E7EB',
        'border-dark': '#374151'
      }
    }
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        ':root': {
          '--nextui-primary': '#6366F1',
          '--nextui-secondary': '#A855F7'
        }
      });
    }
  ]
};
