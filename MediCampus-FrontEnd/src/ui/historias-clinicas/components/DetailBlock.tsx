import { Card } from '../../../ui/components/Card';

interface DetailBlockProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DetailBlock = ({ title, children, className = '' }: DetailBlockProps) => (
  <Card className={className}>
    <h2 className="text-lg font-medium text-slate-900">{title}</h2>
    <div className="mt-2 text-sm text-slate-500">{children}</div>
  </Card>
);

export default DetailBlock;
