export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Some APIs might return 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle standard error structures
      const errorMessage = data?.error || data?.message || response.statusText || 'An API error occurred';
      throw new ApiError(response.status, errorMessage, data);
    }

    return data as T;
  } catch (error) {
    // If it's already our custom ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Otherwise wrap it (network errors, etc.)
    throw new ApiError(500, error instanceof Error ? error.message : 'Network or parsing error');
  }
}
