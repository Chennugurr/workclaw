import _ from 'lodash';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import axios from '@/lib/axios';
import { useAppDispatch } from '@/store';
import { ACTIONS } from '@/store/constants';

/**
 * Custom hook that extends SWR functionality with additional features.
 *
 * @param {string} url - The URL for the API request.
 * @param {Object} [options={}] - Additional options for SWR and this hook.
 * @param {Function} [options.fetcher=axios] - The fetcher function to use with SWR. Defaults to axios.
 * @param {Object} [options.params] - Initial params for the request.
 *
 * @returns {Object} An object containing:
 *   - All properties from the useSWR hook
 *   - data: The parsed response data
 *   - axios: The full axios response
 *   - params: Current params state
 *   - setParams: Function to update params
 */
export default function useAppSWR(url, options = {}) {
  const dispatch = useAppDispatch();
  const [params, setParams] = useState(options.params || {});

  // Default onSuccess handler for SWR
  const defaultOnSuccess = (data) => {
    if (url === '/auth/whoami') {
      dispatch({ type: ACTIONS.USER.UPDATE, payload: data?.data?.data });
    }
  };

  const mergedOptions = {
    ...options,
    fetcher: options.fetcher || axios,
    onSuccess: (data) => {
      defaultOnSuccess(data);
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  };

  // Memoize the searchParams construction
  const memoizedSearchParams = useMemo(() => {
    const searchParams = new URLSearchParams(url.split('?')[1] || '');
    _.forEach(params, (value, key) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });
    return searchParams;
  }, [url, params]);

  // Memoize the full URL
  const memoizedFullUrl = useMemo(() => {
    const baseUrl = url.split('?')[0];
    const queryString = memoizedSearchParams.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  }, [url, memoizedSearchParams]);

  // Use SWR hook with memoized URL and options
  const result = useSWR(memoizedFullUrl, mergedOptions.fetcher, mergedOptions);

  return {
    ...result,
    data: result.data?.data?.data,
    axios: result.data,
    params,
    setParams,
  };
}
