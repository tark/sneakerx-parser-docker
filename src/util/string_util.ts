export const toSnakeCase = (value: string): string => {
  return value.split(' ').map(s => s.toLowerCase()).join('_')
}

export const toCamelCase = (value: string): string => {
  return value.split(' ').map(s => value.substring(0, 1).toUpperCase() + value.substring(1).toLowerCase()).join('')
}

export const capitalize = (value: string | undefined): string => {
  if (!value || value.length == 0) {
    return '';
  }
  return value.substring(0, 1).toUpperCase() + value.substring(1);
}

export const capitalizeEveryWordForced = (value: string | undefined): string => {
  if (!value || value.length == 0) {
    return '';
  }
  return value.split(' ').map(toCamelCase).join(' ');
}

export const firstTwoLetters = (value: string): string => {
  return value.length == 0 ? '' : value.substring(0, 2);
}

export const trimCommas = (value: string): string => {
  value = value.trim()

  while (value.startsWith(',')) {
    value = value.slice(1, value.length).trim()
  }

  while (value.endsWith(',')) {
    value = value.slice(0, value.length - 1).trim()
  }

  return value
}

export const trimSlash = (value: string): string => {
  value = value.trim()

  while (value.endsWith('/')) {
    value = value.slice(0, value.length - 1).trim()
  }

  return value
}

export const isEmpty = (value?: string | null): boolean => {
  return !value || !value.length
}

export const isNotEmpty = (value?: string | null): boolean => {
  return !isEmpty(value)
}

export const toggleValueInArray = <T>(array?: T[], value?: T): T[] | undefined => {

  if (!array || !value) {
    return array
  }

  if (array.includes(value)) {
    return array.filter(e => e != value)
  } else {
    return [...array, value]
  }
}

export const includesSome = (s?: string, values?: string[]): boolean => {
  if (!s) {
    return false
  }

  if (!values || !values.length) {
    return false
  }

  return values.some(e => s.toLowerCase()?.includes(e)) ?? false
}

export const notIncludesAny = (s?: string, values?: string[]): boolean => {
  if (!s) {
    return false
  }

  if (!values || !values.length) {
    return false
  }

  return values.every(e => !s.toLowerCase().includes(e)) ?? false
}

export const removeStrings = (text: string, stringsToRemove: string[]) : string => {
  // Create a regular expression to match all the strings to remove, case insensitive
  const regex = new RegExp(stringsToRemove.join("|"), "gi");

  // Replace the strings to remove with an empty string
  let result = text.replace(regex, "");

  // Replace all double spaces with a single space
  result = result.replace(/\s\s+/g, " ");

  // Trim the result to remove any leading or trailing spaces
  result = result.trim();

  return result;
}
