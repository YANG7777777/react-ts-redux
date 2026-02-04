// 请求工具封装

interface RequestOptions extends RequestInit {
  baseURL?: string;
  params?: Record<string, any>;
  timeout?: number;
}

// 存储token的变量
let token: string | null = null;

/**
 * 设置token
 * @param newToken token字符串
 */
export const setToken = (newToken: string | null): void => {
  token = newToken;
};

/**
 * 获取token
 * @returns token字符串或null
 */
export const getToken = (): string | null => {
  return token;
};

// 传统返回格式：code/message/data
interface TraditionalResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 新返回格式：status/message/xxx
interface NewResponse {
  status: "ok" | "error" | string;
  message: string;
  [key: string]: any; // 支持其他字段，如public_key
}

// 兼容两种返回格式的联合类型
type ResponseData<T = any> = TraditionalResponse<T> | NewResponse;

// 默认配置
const defaultConfig: RequestOptions = {
  baseURL: import.meta.env.VITE_APP_API_TARGET || '',
  timeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
};

// 创建请求实例
const request = async <T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ResponseData<T>> => {
  const { baseURL = defaultConfig.baseURL, params, ...otherOptions } = options;

  // 构建完整URL
  let fullUrl = `${baseURL}${url}`;

  // 处理查询参数
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const paramsString = searchParams.toString();
    if (paramsString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + paramsString;
    }
  }

  // 处理请求体
  if (otherOptions.body && typeof otherOptions.body === 'object' && !(otherOptions.body instanceof FormData)) {
    otherOptions.body = JSON.stringify(otherOptions.body);
  }

  // 请求拦截器
  const requestConfig = {
    ...defaultConfig,
    ...otherOptions,
    headers: {
      ...defaultConfig.headers,
      ...otherOptions.headers,
      // 添加Authorization头
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  // 超时处理
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时'));
    }, requestConfig.timeout);
  });

  try {
    const response = await Promise.race([
      fetch(fullUrl, requestConfig),
      timeoutPromise,
    ]) as Response;

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }

    // 解析响应数据
    const data = await response.json() as ResponseData<T>;

    // 响应拦截器
    // 检查是否为传统格式 (code/message/data)
    if ('code' in data) {
      if (data.code !== 200) {
        throw new Error(data.message || '请求失败');
      }
      return data;
    }

    // 检查是否为新格式 (status/message/xxx)
    if ('status' in data) {
      if (data.status !== 'ok' && data.status !== '200') {
        throw new Error(data.message || '请求失败');
      }

      // 针对获取公钥接口的特殊处理
      if (data.public_key) {
        // 转换为传统格式返回
        return {
          code: 200,
          message: data.message,
          data: data.public_key
        } as TraditionalResponse<T>;
      }

      // 对于其他新格式，尝试提取data字段或直接返回
      if (data.data) {
        return {
          code: 200,
          message: data.message,
          data: data.data
        } as TraditionalResponse<T>;
      }

      // 直接返回新格式，但转换为传统格式的结构
      return {
        code: 200,
        message: data.message,
        data: data
      } as TraditionalResponse<T>;
    }

    // 未知格式，直接返回
    console.warn('未知的响应格式:', data);
    return data;
  } catch (error) {
    console.error('请求错误:', error);
    // 统一错误处理
    throw error instanceof Error ? error : new Error('请求失败');
  }
};

// 封装常用方法
request.get = <T = any>(
  url: string,
  params?: Record<string, any>,
  options?: RequestOptions
): Promise<ResponseData<T>> => {
  return request<T>(url, {
    ...options,
    method: 'GET',
    params,
  });
};

request.post = <T = any>(
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<ResponseData<T>> => {
  return request<T>(url, {
    ...options,
    method: 'POST',
    body: data,
  });
};

request.put = <T = any>(
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<ResponseData<T>> => {
  return request<T>(url, {
    ...options,
    method: 'PUT',
    body: data,
  });
};

request.delete = <T = any>(
  url: string,
  params?: Record<string, any>,
  options?: RequestOptions
): Promise<ResponseData<T>> => {
  return request<T>(url, {
    ...options,
    method: 'DELETE',
    params,
  });
};

export default request;
