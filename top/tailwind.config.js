import baseConfig from '../shared/tailwind.config.base.js';

export default {
  presets: [baseConfig],
  content: [
    "./public/**/*.html",
    "./public/**/*.js",
    "./src/**/*.html",
    "./src/**/*.js",
    "../shared/src/**/*.html",
  ],
  theme: {
    extend: {
      // Local overrides
    },
  },
  plugins: [],
}
