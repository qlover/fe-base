/**
 * Change package name to pure camel case (remove all special symbols)
 * @param pkgName original package name, may contain /, -, @, etc.
 * @returns converted camel case (no special symbols)
 */
export function toPureCamelCase(pkgName) {
  return pkgName
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}
