const { resolve } = require('path');

const config = {
  port: 9001,
  delay: 1000,
  publicFolder: resolve(__dirname, 'public'),
  excludeFiles: [],

  globalIgnoreErrors: [],
  filesIgnoreErrors: {},

  errorTags: ['wcag2a', 'wcag2aa', 'wcag21aa'],

  axe: {
    element: {
      include: ['body'],
    }, // Optional selector which element to inspect
    config: {}, // Axe-core configurationOptions (https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#parameters-1)
    options: {}, // Axe-core optionsParameter (https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter)
  },

  reporter: 'default', // Reporters: default, simple
};

module.exports = config;
