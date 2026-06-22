import { Card } from '../../../ui/components/Card';

interface DetailBlockProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DetailBlock = ({ title, children, className = '' }: DetailBlockProps) => (
  <Card className={className}>
    <h2 className="text-lg font-medium" style={{ color: 'var(--hc-text)' }}>{title}</h2>
    <div className="mt-2 text-sm" style={{ color: 'var(--card-text-muted)' }}>{children}</div>
  </Card>
);

export default DetailBlock;
