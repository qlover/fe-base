export function template(template: string, data: Record<string, any>): string {
  return template.replace(/\${(\w+)}/g, (match, key) => data[key] || match);
}
