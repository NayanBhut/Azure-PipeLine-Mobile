export interface Headers {
  [key: string]: string;
}

// New interface to include both data and headers
export interface ApiResponse<T> {
  data: T;
  headers: Headers;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Updated request method to return both data and headers
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body: Record<string, any> | null = null,
    customHeaders: Headers = {},
  ): Promise<ApiResponse<T>> {
    const headers: Headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      console.log('API Endpoint is ', `${this.baseURL}${endpoint}`);

      // Convert headers to plain object
      const responseHeaders: Headers = {};
      response.headers.forEach((value: any, key: string) => {
        responseHeaders[key] = value;
      });

      if (!response.ok) {
        const errorData = await this.tryParseJson(response);
        throw new Error(errorData?.message || 'API request failed');
      }

      // Handle JSON responses
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        // console.log('API Response is ', json);
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
      console.log('API Endpoint is ', `${this.baseURL}${endpoint}`);
      console.error(`API call failed: ${error.message}`);
      throw error;
    }
  }

  private async tryParseJson(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch (e) {
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
