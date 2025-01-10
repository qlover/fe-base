export type TextProps = {
  text: string;
};

export function Text({ text }: TextProps) {
  return <div>Text: {text}</div>;
}
