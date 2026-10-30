import { describe, expect, it } from 'vitest';
import {
  getSourceFileBasename,
  isPascalCaseTsxSource
} from '../../src/utils/isPrimaryComponentSource';

describe('isPascalCaseTsxSource', () => {
  it('accepts PascalCase tsx component files', () => {
    expect(isPascalCaseTsxSource('src/components/button/Button.tsx')).toBe(
      true
    );
    expect(
      isPascalCaseTsxSource('src/components/button/ActionButton.tsx')
    ).toBe(true);
    expect(isPascalCaseTsxSource('src/config/XoConfigProvider.tsx')).toBe(
      true
    );
  });

  it('rejects helpers, barrels and ts collaborators', () => {
    expect(
      isPascalCaseTsxSource(
        'src/components/button/resolveActionButtonClassName.ts'
      )
    ).toBe(false);
    expect(
      isPascalCaseTsxSource(
        'src/components/button/renderActionButtonLabel.tsx'
      )
    ).toBe(false);
    expect(isPascalCaseTsxSource('src/components/button/index.ts')).toBe(
      false
    );
    expect(isPascalCaseTsxSource('src/components/button/index.tsx')).toBe(
      false
    );
    expect(
      isPascalCaseTsxSource('src/overlay/morph/MorphFrameResolver.ts')
    ).toBe(false);
    expect(isPascalCaseTsxSource('src/components/button/buttonRecipe.ts')).toBe(
      false
    );
  });
});

describe('getSourceFileBasename', () => {
  it('strips tsx extension', () => {
    expect(getSourceFileBasename('src/button/ActionButton.tsx')).toBe(
      'ActionButton'
    );
  });
});
