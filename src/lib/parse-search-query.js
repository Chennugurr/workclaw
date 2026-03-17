import { parse } from 'url';

export function parseSearchQuery(req) {
  const { query } = parse(req.url, true);
  const {
    q,
    page = '1',
    limit = '10',
    sort = 'createdAt',
    order = 'desc',
    ...otherParams
  } = query;

  return {
    searchTerm: q,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    order,
    ...otherParams,
  };
}
