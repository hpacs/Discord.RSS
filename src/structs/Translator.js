const fs = require('fs')
const path = require('path')
const config = require('../config.js')
const createLogger = require('../util/logger/create.js')
const log = createLogger()
const defaultLocale = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', config.bot.locale + '.json')))
const localesData = new Map()
const fileList = fs.readdirSync(path.join(__dirname, '..', 'locales'))
for (const file of fileList) {
  const read = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', file)))
  localesData.set(file.replace('.json', ''), read)
}

function escapeRegExp (str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

class Translator {
  constructor (locale = config.bot.locale) {
    /**
     * Locale string
     * @type {string}
     */
    this.locale = locale
  }

  /**
   * Default locale parsed json
   * @constant {object}
   */
  static get DEFAULT_LOCALE () {
    return defaultLocale
  }

  /**
   * Map of locales parsed jsons
   * @constant {Map<string, object>}
   */
  static get LOCALES_DATA () {
    return localesData
  }

  /**
   * Convert a string according to the translator's locale
   * @param {string} string - Accessor
   * @param {Object.<string, number|string>} params - Keys to replace in string
   * @returns {string}
   */
  translate (string, params) {
    return Translator.translate(string, this.locale, params)
  }

  /**
   * Returns a translator function for a locale
   * @param {string} locale
   * @returns {function}
   */
  static createLocaleTranslator (locale) {
    return (string, params) => this.translate(string, locale, params)
  }

  /**
   * Check if a locale exists
   * @param {string} locale
   * @returns {boolean}
   */
  static hasLocale (locale) {
    return this.LOCALES_DATA.has(locale)
  }

  /**
   * Get list of defined locales
   * @returns {string[]}
   */
  static getLocales () {
    return Array.from(this.LOCALES_DATA.keys()).sort()
  }

  /**
   * Get command descriptions used for rsshelp
   * @param {string} locale
   * @returns {Object.<string, object>}
   */
  static getCommandDescriptions (locale = config.bot.locale) {
    return this.LOCALES_DATA.get(locale).commandDescriptions
  }

  /**
   * Convert a string according to the given locale
   * @param {string} string - Accessor
   * @param {string} locale - Locale
   * @param {Object.<string, number|string>} [params] - Keys to replace in the string
   * @returns {string}
   */
  static translate (string, locale = config.bot.locale, params) {
    if (typeof string !== 'string') {
      throw new TypeError('string is not a string')
    }
    if (typeof locale !== 'string') {
      throw new TypeError('locale is not a string')
    }
    if (!this.hasLocale(locale)) {
      throw new Error('Unknown locale: ' + locale)
    }
    const properties = string.split('.')
    let accessedSoFar = this.LOCALES_DATA.get(locale)
    let reference = this.DEFAULT_LOCALE
    for (const property of properties) {
      accessedSoFar = accessedSoFar[property]
      reference = reference[property]
      if (accessedSoFar === undefined) {
        log.error(`Invalid locale accessor ("${string}" stopped at "${property}") for locale ${locale}`)
        throw new Error(`Invalid locale accessor (stopped at "${property}") for locale ${locale}`)
      }
      if (!reference) {
        log.error(`Invalid locale accessor (no en-US locale reference of "${string}" at "${property}") for locale ${locale}`)
        throw new Error(`Invalid locale accessor (no en-US locale reference at "${property}") for locale ${locale}`)
      }
    }
    if (typeof accessedSoFar !== 'string') {
      log.error(`Invalid locale accessor that stopped with a non-string value ("${string}") for locale ${locale}`)
      throw new Error(`Invalid locale accessor that stopped with a non-string value for locale ${locale}`)
    }
    if (accessedSoFar.length === 0) {
      accessedSoFar = reference // Use the reference if the original locale is an empty string
    }
    if (params) {
      for (const param in params) {
        const term = escapeRegExp(`{{${param}}}`)
        const regex = new RegExp(term, 'g')
        accessedSoFar = accessedSoFar.replace(regex, params[param])
      }
    }
    return accessedSoFar
  }
}

module.exports = Translator
