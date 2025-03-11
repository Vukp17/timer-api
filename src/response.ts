export class ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: any[];

  constructor(
    status: 'success' | 'error',
    message: string,
    data?: T,
    errors?: any[],
  ) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}

export function successResponse<T>(message: string, data: T): ApiResponse<T> {
  return new ApiResponse('success', message, data);
}

export function errorResponse(
  message: string,
  errors: any[] = [],
): ApiResponse<null> {
  return new ApiResponse('error', message, null, errors);
}
