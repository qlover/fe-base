import { FormatterInterface, LogEvent } from '@qlover/logger';

export interface ColorStyle {
  color?: string;
  background?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
}

export interface ColorSegment {
  text: string;
  style?: ColorStyle;
}

export type ColorContext = {
  value: ColorSegment[];
};

export class ColorFormatter implements FormatterInterface<ColorContext> {
  public static defaultStyle: ColorStyle = {
    color: 'inherit',
    background: 'inherit',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none'
  };

  constructor(
    private levelColors: Record<string, ColorStyle> = {
      fatal: { color: '#ff0000', fontWeight: 'bold' },
      error: { color: '#ff0000' },
      warn: { color: '#ffa500' },
      info: { color: '#0000ff' },
      debug: { color: '#008000' },
      trace: { color: '#808080' },
      log: { color: '#000000' }
    }
  ) {}

  /**
   * Transform style object to CSS string
   */
  public static styleToCss(style: ColorStyle): string {
    return Object.entries(style)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }

  /**
   * Split text into multiple segments, each with its own style
   */
  public static splitIntoSegments(
    _text: string,
    segments: ColorSegment[]
  ): { text: string; styles: string[] } {
    let result = '';
    const styles: string[] = [];

    segments.forEach((segment) => {
      const style = segment.style || ColorFormatter.defaultStyle;
      const css = ColorFormatter.styleToCss(style);

      // Add text and style
      result += `%c${segment.text}%c`;
      styles.push(css);
      styles.push(ColorFormatter.styleToCss(ColorFormatter.defaultStyle));
    });

    return { text: result, styles };
  }

  /**
   * Format log event
   * @override
   */
  public format(event: LogEvent<ColorContext>): unknown[] {
    const { level, args, context } = event;

    // If the first argument is a string and the context is an array of color segments
    if (typeof args[0] === 'string' && Array.isArray(context?.value)) {
      const segments = context.value as ColorSegment[];
      const { text, styles } = ColorFormatter.splitIntoSegments(
        args[0],
        segments
      );
      return [text, ...styles];
    }

    // If the first argument is a string and contains color segments
    if (typeof args[0] === 'string' && args[0].includes('%c')) {
      return args;
    }

    // If the first argument is a string, use the color of the log level
    if (typeof args[0] === 'string') {
      const levelStyle =
        this.levelColors[level.toLowerCase()] || this.levelColors.log;
      const levelText = `%c${level.toUpperCase()}%c`;
      const levelCss = ColorFormatter.styleToCss(levelStyle);
      const defaultCss = ColorFormatter.styleToCss(ColorFormatter.defaultStyle);

      // Separate the first argument (message) and other arguments
      const message = args[0];
      const otherArgs = args.slice(1);

      return [`${levelText} ${message}`, levelCss, defaultCss, ...otherArgs];
    }

    // Default case: use the default style
    return args;
  }
}
