import Case from 'case';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export default function JobPositionBadge({ position }) {
  const badgeStyles = {
    FULL_TIME: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    PART_TIME: 'bg-green-100 text-green-800 hover:bg-green-200',
    CONTRACT: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    TEMPORARY: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    INTERNSHIP: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  };

  return (
    <Badge
      className={cn(
        'text-xs px-2 py-0.5',
        badgeStyles[position] || 'bg-gray-100 text-gray-800',
        'whitespace-nowrap'
      )}
    >
      {Case.title(position)}
    </Badge>
  );
}
