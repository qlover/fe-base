/* eslint-disable react-refresh/only-export-components */
import cssText from 'data-text:~style.css';
import type { PlasmoCSConfig } from 'plasmo';
import { CountButton } from '~features/count-button';

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>']
};

/**
 * Generates a style element with adjusted CSS to work correctly within a Shadow DOM.
 *
 * Tailwind CSS relies on `rem` units, which are based on the root font size (typically defined on the <html>
 * or <body> element). However, in a Shadow DOM (as used by Plasmo), there is no native root element, so the
 * rem values would reference the actual page's root font size—often leading to sizing inconsistencies.
 *
 * To address this, we:
 * 1. Replace the `:root` selector with `:host(fe-csui)` to properly scope the styles within the Shadow DOM.
 * 2. Convert all `rem` units to pixel values using a fixed base font size, ensuring consistent styling
 *    regardless of the host page's font size.
 */
export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16;

  let updatedCssText = cssText.replaceAll(':root', ':host(fe-csui)');
  const remRegex = /([\d.]+)rem/g;
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize;

    return `${pixelsValue}px`;
  });

  const styleElement = document.createElement('style');

  styleElement.textContent = updatedCssText;

  return styleElement;
};

const PlasmoOverlay = () => {
  console.log('PlasmoOverlay');
  return (
    <div
      data-testid="PlasmoOverlay"
      className="fe:z-50 fe:flex fe:fixed fe:top-32 fe:right-8">
      <CountButton />
    </div>
  );
};

export default PlasmoOverlay;
