module.exports = {
  purge: ['./src/**/*.js', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    fontFamily: {
      'sans': 'Roboto',
      'display': ['Varela'],
      'body': ['Varela']
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
