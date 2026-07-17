import { describe, expect, it } from 'vitest';
import { createDefaultPrompts } from '../src/prompts';

describe('createDefaultPrompts', () => {
  it('should show description next to template name', () => {
    const prompts = createDefaultPrompts([
      {
        name: 'react-seed',
        description: 'Vite + React 19 SPA seed with corekit, i18n, and Tailwind'
      },
      { name: 'empty-desc' },
      {
        name: 'next-oauth',
        description: 'Next.js OAuth 2.0 authorization server example'
      }
    ]);

    const templatePrompt = prompts.find((p) => p.name === 'template');
    expect(templatePrompt).toBeDefined();
    expect(
      (templatePrompt as { choices: Array<{ name: string; value: string }> })
        .choices
    ).toEqual([
      {
        name: 'react-seed - Vite + React 19 SPA seed with corekit, i18n, and Tailwind',
        value: 'react-seed'
      },
      {
        name: 'empty-desc',
        value: 'empty-desc'
      },
      {
        name: 'next-oauth - Next.js OAuth 2.0 authorization server example',
        value: 'next-oauth'
      }
    ]);
  });
});
