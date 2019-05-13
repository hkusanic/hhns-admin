export const checkValidation = (value, rules) => {
  let isValid = true

  if (rules.required) {
    isValid = value.trim() !== '' && isValid
  }

  if (rules.minLength) {
    isValid = value.length >= rules.minLength && isValid // ## ".length" is a string property
  }

  if (rules.maxLength) {
    isValid = value.length <= rules.maxLength && isValid // ## ".length" is a string property
  }

  if (rules.isEmail) {
    const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

    isValid = pattern.test(value) && isValid
  }

  if (rules.isNumeric) {
    const pattern = /^\d+$/

    isValid = pattern.test(value) && isValid
  }

  if (rules.nonZero) {
    isValid = value !== '0' && isValid
  }

  if (rules.isUrl) {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ) // fragment locator

    isValid = pattern.test(value) && isValid
  }

  return isValid
}

export default checkValidation
