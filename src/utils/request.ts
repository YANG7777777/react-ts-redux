// 请求工具封装

interface RequestOptions extends RequestInit {
  baseURL?: string;
  params?: Record<string, unknown>;
  timeout?: number;
}

let token: string | null = null;

/** 401 时由外部注册的回调（清登录态并跳转） */
let unauthorizedHandler: (() => void) | null = null;

export const setToken = (newToken: string | null): void => {
  token = newToken;
};

export const getToken = (): string | null => {
  return token;
};

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

interface TraditionalResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

interface NewResponse {
  status: 'ok' | 'error' | string;
  message: string;
  public_key?: string;
  data?: unknown;
  [key: string]: unknown;
}

type RawResponse<T = unknown> = TraditionalResponse<T> | NewResponse;

/** 开发走 Vite 代理前缀，避免直连后端的 CORS；生产可配同域反向代理路径 */
const defaultConfig: RequestOptions = {
  baseURL: import.meta.env.VITE_APP_API || import.meta.env.VITE_APP_API_TARGET || '',
  timeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000', 10),
  headers: {
    'Content-Type': 'application/json',
  },
};

const handleUnauthorized = () => {
  setToken(null);
  unauthorizedHandler?.();
};

/** FastAPI 422 校验错误 → 可读文案 */
const formatValidationError = (payload: unknown): string => {
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { detail?: unknown }).detail)
  ) {
    const details = (payload as { detail: Array<{ loc?: unknown[]; msg?: string }> }).detail;
    const parts = details.map((item) => {
      const field = Array.isArray(item.loc)
        ? item.loc.filter((x) => x !== 'body' && x !== 'query').join('.')
        : '';
      return field ? `${field}: ${item.msg || '校验失败'}` : item.msg || '校验失败';
    });
    return parts.filter(Boolean).join('；') || '请求参数校验失败';
  }
  if (payload && typeof payload === 'object' && 'message' in payload) {
    return String((payload as { message: unknown }).message);
  }
  return '请求失败';
};

const request = async <T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<TraditionalResponse<T>> => {
  const { baseURL = defaultConfig.baseURL, params, ...otherOptions } = options;

  let fullUrl = `${baseURL}${url}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const paramsString = searchParams.toString();
    if (paramsString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + paramsString;
    }
  }

  if (
    otherOptions.body &&
    typeof otherOptions.body === 'object' &&
    !(otherOptions.body instanceof FormData)
  ) {
    otherOptions.body = JSON.stringify(otherOptions.body);
  }

  const requestConfig = {
    ...defaultConfig,
    ...otherOptions,
    headers: {
      ...defaultConfig.headers,
      ...otherOptions.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时'));
    }, requestConfig.timeout);
  });

  try {
    const response = (await Promise.race([
      fetch(fullUrl, requestConfig),
      timeoutPromise,
    ])) as Response;

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('登录已过期，请重新登录');
    }

    if (!response.ok) {
      let errPayload: unknown = null;
      try {
        errPayload = await response.json();
      } catch {
        /* ignore */
      }
      if (response.status === 422) {
        throw new Error(formatValidationError(errPayload));
      }
      throw new Error(
        formatValidationError(errPayload) || `HTTP错误! 状态: ${response.status}`
      );
    }

    const data = (await response.json()) as RawResponse<T>;

    if ('code' in data) {
      if (data.code === 401) {
        handleUnauthorized();
        throw new Error(data.message || '登录已过期，请重新登录');
      }
      if (data.code !== 200) {
        throw new Error(data.message || '请求失败');
      }
      return data as TraditionalResponse<T>;
    }

    if ('status' in data) {
      if (data.status !== 'ok' && data.status !== '200') {
        throw new Error(data.message || '请求失败');
      }

      if (data.public_key) {
        return {
          code: 200,
          message: data.message,
          data: data.public_key as T,
        };
      }

      if ('data' in data && data.data !== undefined) {
        return {
          code: 200,
          message: data.message,
          data: data.data as T,
        };
      }

      return {
        code: 200,
        message: data.message,
        data: data as T,
      };
    }

    throw new Error('未知的响应格式');
  } catch (error) {
    throw error instanceof Error ? error : new Error('请求失败');
  }
};

request.get = <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions
): Promise<TraditionalResponse<T>> => {
  return request<T>(url, {
    ...options,
    method: 'GET',
    params,
  });
};

request.post = <T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestOptions
): Promise<TraditionalResponse<T>> => {
  return request<T>(url, {
    ...options,
    method: 'POST',
    body: data as BodyInit,
  });
};

request.put = <T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestOptions
): Promise<TraditionalResponse<T>> => {
  return request<T>(url, {
    ...options,
    method: 'PUT',
    body: data as BodyInit,
  });
};

request.delete = <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions
): Promise<TraditionalResponse<T>> => {
  return request<T>(url, {
    ...options,
    method: 'DELETE',
    params,
  });
};

export default request;
