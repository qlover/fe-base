/** Markdown 正文：编辑与预览两种展示模式。 */
export const MarkdownEditPreviewMode = {
  EDIT: 'edit',
  PREVIEW: 'preview'
} as const;

export type MarkdownEditPreviewModeType =
  (typeof MarkdownEditPreviewMode)[keyof typeof MarkdownEditPreviewMode];
