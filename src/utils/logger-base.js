const config = require('config')
const log4js = require('log4js')

log4js.configure(config.log4js)

module.exports = log4js.getLogger('application')
