const fs = require('fs')
const config = require('../config.js')
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
const createLogger = require('./logger/create.js')
const BUFFER_CONFIGS = ['sslCA', 'sslCRL', 'sslCert', 'sslKey']
const storage = require('./storage.js')
const CON_SETTINGS = typeof config.database.connection === 'object' ? config.database.connection : {}

module.exports = async (shardID, skipRedis) => {
  const log = createLogger(shardID)
  const uri = config.database.uri
  if (!uri.startsWith('mongo')) { // Databaseless configuration
    if (config.web.enabled === true && !skipRedis && !storage.redisClient) {
      return connectRedis().then(() => log.info(`Redis connection ready`))
    } else return
  }

  return new Promise((resolve, reject) => {
    const buffers = {}
    if (Object.keys(CON_SETTINGS).length > 0) {
      for (var x = 0; x < BUFFER_CONFIGS.length; ++x) {
        const name = BUFFER_CONFIGS[x]
        if (CON_SETTINGS[name]) buffers[name] = fs.readFileSync(CON_SETTINGS[name])
      }
    }

    function connect () {
      // Do not use .then here since the promise never gets resolved for some reason
      const options = {
        keepAlive: 120,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        ...CON_SETTINGS,
        ...buffers
      }
      mongoose.connect(uri, options) // Environment variable in Docker container if available
        .catch(err => {
          log.fatal(err, 'Failed to connect to database, retrying in 30 seconds...')
          setTimeout(connect, 30000)
        })

      mongoose.connection.once('open', resolve)
    }

    if (config.web.enabled === true && !skipRedis && !storage.redisClient) {
      connectRedis()
        .then(() => {
          log.info(`Redis connection ready`)
          return mongoose.connection.readyState === 1 ? resolve() : connect()
        }).catch(reject)
    } else if (mongoose.connection.readyState === 1) return resolve()
    else connect()
  })
}

function connectRedis () {
  return new Promise((resolve, reject) => {
    storage.redisClient = require('redis').createClient(config.database.redis)
    storage.redisClient.once('ready', resolve)
    storage.redisClient.on('error', reject)
  })
}
