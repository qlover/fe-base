interface FeatureItemProps {
  icon: string;
  text: string;
}

export default function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <div data-testid='FeatureItem' className='flex items-start gap-4'>
      <div className='text-2xl'>{icon}</div>
      <p className='text-text-secondary'>{text}</p>
    </div>
  );
}
