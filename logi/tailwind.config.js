import baseConfig from '../shared/tailwind.config.base.js';

export default {
  presets: [baseConfig],
  content: [
    "./public/**/*.html",
    "./public/**/*.js",
  ],
  theme: {
    extend: {
      // Local overrides can be added here
    },
  },
  plugins: [],
}
