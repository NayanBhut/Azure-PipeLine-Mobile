import {isTrustedAzureDevOpsUrl} from '../Common/NetworkSecurity';

export interface Headers {
  [key: string]: string;
}
export interface ApiResponse<T> {
  data: T;
  headers: Headers;
}

export class ApiError extends Error {
  status?: number;
  isUnauthorized: boolean;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isUnauthorized = status === 401 || status === 203;
  }
}

const DEFAULT_TIMEOUT_MS = 30_000;

class ApiService {
  private baseURL: string;
  private timeoutMs: number;

  constructor(baseURL: string, timeoutMs: number = DEFAULT_TIMEOUT_MS) {
    if (!ApiService.isSecureUrl(baseURL)) {
      throw new ApiError(
        'Refusing to send credentials to an untrusted endpoint. Only Azure DevOps HTTPS URLs are allowed.',
      );
    }

    this.baseURL = baseURL;
    this.timeoutMs = timeoutMs;
  }

  private static isSecureUrl(value: string): boolean {
    return isTrustedAzureDevOpsUrl(value);
  }

  // Updated request method to return both data and headers
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body: Record<string, any> | null = null,
    customHeaders: Headers = {},
  ): Promise<ApiResponse<T>> {
    const headers: Headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const options: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);

      // Convert headers to plain object
      const responseHeaders: Headers = {};
      response.headers.forEach((value: any, key: string) => {
        responseHeaders[key] = value;
      });

      if (!response.ok) {
        const errorData = await this.tryParseJson(response);
        throw new ApiError(
          errorData?.message || `API request failed (${response.status})`,
          response.status,
        );
      }

      // Handle JSON responses
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        return {
          data: json as T,
          headers: responseHeaders,
        };
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        return {
          data: text as unknown as T,
          headers: responseHeaders,
        };
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new ApiError('The request timed out. Please try again.');
      }

      if (__DEV__) {
        // Never log request URLs containing organization/project identifiers,
        // and never log headers because they contain the authorization token.
        console.error(`API call failed: ${error?.message ?? 'unknown error'}`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async tryParseJson(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  // Updated convenience methods to return ApiResponse
  public async get<T>(
    endpoint: string,
    customHeaders: Headers = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', null, customHeaders);
  }

  public async post<T>(
    endpoint: string,
    body: Record<string, any>,
    customHeaders: Headers = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, customHeaders);
  }

  public async put<T>(
    endpoint: string,
    body: Record<string, any>,
    customHeaders: Headers = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body, customHeaders);
  }

  public async delete<T>(
    endpoint: string,
    customHeaders: Headers = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', null, customHeaders);
  }
}

export default ApiService;
