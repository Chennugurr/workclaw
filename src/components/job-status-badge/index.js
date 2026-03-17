import Case from 'case';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export default function JobStatusBadge({ status }) {
  const badgeStyles = {
    OPEN: 'bg-green-100 text-green-800 hover:bg-green-200',
    CLOSED: 'bg-red-100 text-red-800 hover:bg-red-200',
    CANCELED: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    COMPLETED: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  };

  return (
    <Badge
      className={cn(
        badgeStyles[status] || 'bg-gray-100 text-gray-800',
        'whitespace-nowrap'
      )}
    >
      {Case.title(status)}
    </Badge>
  );
}
