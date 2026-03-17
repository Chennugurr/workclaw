import _ from 'lodash';
import { useCallback, useState } from 'react';
import useAppSWR from './use-app-swr';

/**
 * A custom hook for paginated data fetching using SWR.
 *
 * @param {string} url - The base URL for the API endpoint.
 * @param {Object} options - Additional options for the SWR hook.
 * @param {Function} [options.fetcher] - Custom fetcher function to use instead of default.
 * @param {Object} [options.params={}] - Default search parameters to include in every request.
 * @param {number} [options.params.page=1] - The initial page number.
 * @param {number} [options.params.limit=10] - The number of items per page.
 * @returns {Object} An object containing:
 *   - All properties from the useAppSWR hook
 *   - data: The paginated items
 *   - pagination: Pagination information
 *   - goToPage: Function to navigate to a specific page
 *   - nextPage: Function to navigate to the next page
 *   - prevPage: Function to navigate to the previous page
 *   - setLimit: Function to change the number of items per page
 *   - setParams: Function to update all params
 *
 * @example
 * // Basic usage
 * const { data, pagination, goToPage, nextPage, prevPage, setLimit } = usePaginateSWR('/api/items');
 *
 * @example
 * // With custom options and default params
 * const { data, pagination, isLoading, error } = usePaginateSWR('/api/users', {
 *   params: { page: 2, limit: 20, status: 'active' },
 *   revalidateOnFocus: false
 * });
 *
 * @example
 * // Navigating pages
 * const { goToPage, nextPage, prevPage } = usePaginateSWR('/api/posts');
 * // Go to page 3
 * goToPage(3);
 * // Go to next page
 * nextPage();
 * // Go to previous page
 * prevPage();
 *
 * @example
 * // Changing items per page
 * const { setLimit } = usePaginateSWR('/api/comments');
 * // Set 50 items per page
 * setLimit(50);
 *
 * @example
 * // Updating all params
 * const { setParams } = usePaginateSWR('/api/search');
 * // Update search params
 * setParams({ query: 'new search', page: 1 });
 */
export default function usePaginateSWR(url, options = {}) {
  // Fetch data using useAppSWR
  const { params, setParams, ...result } = useAppSWR(url, {
    ...options,
    params: {
      ...options.params,
      page: parseInt(options.params?.page, 10) || 1,
      limit: parseInt(options.params?.limit, 10) || 10,
    },
  });

  /**
   * Navigate to a specific page.
   * @param {number} newPage - The page number to navigate to.
   */
  const goToPage = useCallback(
    (newPage) => {
      if (result.data?.pagination) {
        setParams((prev) => ({
          ...prev,
          page: Math.max(
            1,
            Math.min(newPage, result.data.pagination.totalPages)
          ),
        }));
      }
    },
    [result.data, setParams]
  );

  /**
   * Navigate to the next page if available.
   */
  const nextPage = useCallback(() => {
    if (result.data?.pagination?.hasNextPage) {
      goToPage(params.page + 1);
    }
  }, [result.data, params.page, goToPage]);

  /**
   * Navigate to the previous page if available.
   */
  const prevPage = useCallback(() => {
    if (result.data?.pagination?.hasPrevPage) {
      goToPage(params.page - 1);
    }
  }, [result.data, params.page, goToPage]);

  /**
   * Change the number of items per page.
   * @param {number} newLimit - The new number of items per page.
   */
  const setLimit = useCallback(
    (newLimit) => {
      setParams((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    },
    [setParams]
  );

  return {
    ...result,
    data: result.data?.items,
    pagination: result.data?.pagination,
    goToPage,
    nextPage,
    prevPage,
    setLimit,
    setParams: (newParams) => {
      setParams({
        ...newParams,
        page: newParams.page || params.page || 1,
        limit: newParams.limit || params.limit || 10,
      });
    },
  };
}
