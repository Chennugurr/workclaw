import Case from 'case';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export default function ProposalStatusBadge({ status }) {
  const badgeStyles = {
    APPLIED: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    WITHDRAWN: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    SHORTLISTED: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    ARCHIVED: 'bg-red-100 text-red-800 hover:bg-red-200',
    HIRED: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
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
