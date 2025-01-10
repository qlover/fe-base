export function githubLog(value, key = 'githubLog') {
  value = typeof value === 'object' ? JSON.stringify(value) : value;
  console.log(`${key}=${value}`);
}
