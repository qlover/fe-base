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

export class ColorFormatter implements FormatterInterface {
  private static defaultStyle: ColorStyle = {
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
   * 将样式对象转换为 CSS 字符串
   */
  private static styleToCss(style: ColorStyle): string {
    return Object.entries(style)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }

  /**
   * 将文本分割成多个片段，每个片段可以有自己的样式
   */
  private static splitIntoSegments(text: string, segments: ColorSegment[]): { text: string; styles: string[] } {
    let result = '';
    const styles: string[] = [];

    segments.forEach((segment) => {
      const style = segment.style || ColorFormatter.defaultStyle;
      const css = ColorFormatter.styleToCss(style);
      
      // 添加文本和样式
      result += `%c${segment.text}%c`;
      styles.push(css);
      styles.push(ColorFormatter.styleToCss(ColorFormatter.defaultStyle));
    });

    return { text: result, styles };
  }

  /**
   * 格式化日志事件
   */
  format(event: LogEvent): unknown[] {
    const { level, args, context } = event;
    
    // 如果第一个参数是字符串，且 context 是颜色片段数组
    if (typeof args[0] === 'string' && Array.isArray(context)) {
      const segments = context as ColorSegment[];
      const { text, styles } = ColorFormatter.splitIntoSegments(args[0], segments);
      return [text, ...styles];
    }

    // 如果第一个参数是字符串，且包含颜色片段
    if (typeof args[0] === 'string' && args[0].includes('%c')) {
      return args;
    }

    // 如果第一个参数是字符串，使用日志级别的颜色
    if (typeof args[0] === 'string') {
      const levelStyle = this.levelColors[level.toLowerCase()] || this.levelColors.log;
      const levelText = `%c${level.toUpperCase()}%c`;
      const levelCss = ColorFormatter.styleToCss(levelStyle);
      const defaultCss = ColorFormatter.styleToCss(ColorFormatter.defaultStyle);
      
      // 将第一个参数（消息）和其他参数分开处理
      const message = args[0];
      const otherArgs = args.slice(1);
      
      return [`${levelText} ${message}`, levelCss, defaultCss, ...otherArgs];
    }

    // 默认情况：使用默认样式
    return args;
  }
} 