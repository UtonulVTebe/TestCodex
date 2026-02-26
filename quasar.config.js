/* eslint-env node */
const { configure } = require('quasar/wrappers')

module.exports = configure(function () {
  return {
    supportTS: false,
    boot: [],
    css: [],
    extras: ['roboto-font', 'material-icons'],

    build: {
      vueRouterMode: 'history'
    },

    devServer: {
      open: false
    },

    framework: {
      config: {},
      plugins: ['Notify']
    },

    animations: []
  }
})
