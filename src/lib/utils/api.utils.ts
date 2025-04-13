export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export const createSuccessResponse = <T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> => ({
  success: true,
  data,
  meta,
});

export const createErrorResponse = (
  message: string,
  code?: string
): ApiResponse<null> => ({
  success: false,
  error: {
    message,
    code,
  },
}); 