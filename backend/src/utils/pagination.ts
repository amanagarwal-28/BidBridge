export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const getPagination = (query: Record<string, string | undefined>): PaginationParams => {
  const page = Math.max(1, parseInt(query.page || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10')));
  return { page, limit, skip: (page - 1) * limit };
};

export const buildMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
