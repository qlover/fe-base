/**
 * Handlebars helpers
 */
export const hbsHelpers: Record<string, Handlebars.HelperDelegate> = {
  toLowerCase(str) {
    return typeof str === 'string' ? str.toLowerCase() : str;
  },

  // Register eq helper for string comparison
  eq(a, b) {
    return a === b;
  },

  // Register or helper for logical OR operation
  or(...args) {
    // Remove the last argument (Handlebars options object)
    const values = args.slice(0, -1);
    return values.some((value) => !!value);
  },

  // Register repeat helper for repeating strings
  repeat(count, ...args) {
    // For block helper syntax: {{#repeat count}}content{{/repeat}}
    const options = args[0] as Handlebars.HelperOptions;
    if (options && options.fn) {
      const content = options.fn(this);
      const repeatCount = Math.min(count || 0, 6);

      if (typeof content.repeat === 'function') {
        return content.repeat(repeatCount);
      } else {
        // Fallback implementation
        return Array(repeatCount + 1).join(content);
      }
    }

    // For regular helper syntax: {{repeat count str}}
    const str = args[0];
    const stringValue = String(str || '');
    const repeatCount = Math.min((count || 0) + 3, 6);

    if (typeof stringValue.repeat === 'function') {
      return stringValue.repeat(repeatCount);
    } else {
      return Array(repeatCount + 1).join(stringValue);
    }
  },

  // Register add helper for addition
  add(a, b) {
    return a + b;
  }
};
