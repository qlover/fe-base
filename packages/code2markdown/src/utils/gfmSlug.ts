/**
 * GitHub-flavored Markdown style heading slug (approximate).
 * Aligns with common renderers for headings like `` `name` (KindName) ``.
 */
export function gfmSlug(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
