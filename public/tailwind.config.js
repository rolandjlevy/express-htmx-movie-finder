// eslint-disable-next-line no-undef
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#006FEE',
        secondary: '#7828C8'
      }
    }
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        ':root': {
          '--nextui-primary': '#006FEE',
          '--nextui-secondary': '#7828C8'
        }
      });
    }
  ]
};
