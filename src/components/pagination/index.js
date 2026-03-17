import * as PaginationPrimitive from '@/components/ui/pagination';

/**
 * Pagination component for displaying page navigation.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.pagination - Pagination information object
 * @param {number} props.pagination.page - Current page number
 * @param {number} props.pagination.limit - Number of items per page
 * @param {number} props.pagination.totalCount - Total number of items
 * @param {number} props.pagination.totalPages - Total number of pages
 * @param {boolean} props.pagination.hasNextPage - Whether there is a next page
 * @param {boolean} props.pagination.hasPrevPage - Whether there is a previous page
 * @returns {JSX.Element} Rendered pagination component
 */
export default function Pagination({ pagination }) {
  return (
    <PaginationPrimitive.Pagination>
      <PaginationPrimitive.PaginationContent>
        <PaginationPrimitive.PaginationItem>
          <PaginationPrimitive.PaginationPrevious
            href={`?page=${pagination.page - 1}`}
            disabled={!pagination.hasPrevPage}
          />
        </PaginationPrimitive.PaginationItem>
        {[...Array(pagination.totalPages)].map((_, index) => {
          if (
            index === 0 ||
            index === pagination.totalPages - 1 ||
            (index >= pagination.page - 2 && index <= pagination.page + 2)
          ) {
            return (
              <PaginationPrimitive.PaginationItem key={index}>
                <PaginationPrimitive.PaginationLink
                  href={`?page=${index + 1}`}
                  isActive={pagination.page === index + 1}
                >
                  {index + 1}
                </PaginationPrimitive.PaginationLink>
              </PaginationPrimitive.PaginationItem>
            );
          } else if (
            index === pagination.page - 3 ||
            index === pagination.page + 3
          ) {
            return <PaginationPrimitive.PaginationEllipsis key={index} />;
          }
          return null;
        })}
        <PaginationPrimitive.PaginationItem>
          <PaginationPrimitive.PaginationNext
            href={`?page=${pagination.page + 1}`}
            disabled={!pagination.hasNextPage}
          />
        </PaginationPrimitive.PaginationItem>
      </PaginationPrimitive.PaginationContent>
    </PaginationPrimitive.Pagination>
  );
}
