export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function successResponse<T>(message: string, data: T) {
  return {
    success: true,
    message,
    data,
  };
}

export function paginatedResponse<T>(data: T[], meta: PaginationMeta) {
  return {
    success: true,
    data,
    meta,
  };
}
