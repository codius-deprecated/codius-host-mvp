'use strict'

const reduct = require('reduct')
const App = require('./src/lib/app')

if (require.main === module) {
  const app = reduct()(App)
  app.listen()
} else {
  module.exports = {
    App
  }
}
