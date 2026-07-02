const escRE = /[|\\{}()[\]^$+*?.]/g
const escReplace = String.raw`\$&`
const dashRE = /-/g
const dashReplace = String.raw`\x2d`

/**
 * Escape a string to then be supplied
 * to new RegExp()
 */
export function escapeRegexString(str) {
  return str.replace(escRE, escReplace).replace(dashRE, dashReplace)
}
