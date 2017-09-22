'use strict'

exports.validateString = (obj, fieldName, defaultValue) => {
  if (typeof obj[fieldName] === 'undefined') {
    if (typeof defaultValue === 'undefined') {
      throw new TypeError(`Missing value ${fieldName} of type string`)
    } else {
      return defaultValue
    }
  } else if (typeof obj[fieldName] !== 'string') {
    throw new TypeError(`Expected value ${fieldName} to be of type string, was ${typeof obj[fieldName]}`)
  } else {
    return obj[fieldName]
  }
}

exports.validateInteger = (obj, fieldName, defaultValue) => {
  if (typeof obj[fieldName] === 'undefined') {
    if (typeof defaultValue === 'undefined') {
      throw new TypeError(`Missing value ${fieldName} of type integer`)
    } else {
      return defaultValue
    }
  } else if (parseInt(obj[fieldName]) != obj[fieldName]) {
    throw new TypeError(`Expected value ${fieldName} to be of type integer, was '${obj[fieldName]}'`)
  } else {
    return obj[fieldName]
  }
}

exports.validateJson = (obj, fieldName, defaultValue) => {
  if (typeof obj[fieldName] === 'undefined') {
    if (typeof defaultValue === 'undefined') {
      throw new TypeError(`Missing value ${fieldName} of type json`)
    } else {
      return defaultValue
    }
  } else {
    try {
      return JSON.parse(obj[fieldName])
    } catch (err) {
      throw new TypeError(`Expected value ${fieldName} to be of type json, but got error: ${err.message}`)
    }
  }
}
