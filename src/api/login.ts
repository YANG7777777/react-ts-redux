import request from '../utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginUserInfo {
  id: number;
  username: string;
  email?: string;
  role?: number;
  role_name?: string;
  /** 关联员工档案 ID，与 users.id 不同 */
  employee_id?: number | null;
  employee_name?: string | null;
  [key: string]: unknown;
}

export interface LoginResponse {
  token: string;
  userInfo?: LoginUserInfo;
}

export interface LogoutResponse {
  status?: string;
  message?: string;
}

export const login = async (values: LoginParams): Promise<LoginResponse> => {
  const response = await request.post<LoginResponse>('/login', values);
  return response.data;
};

export const getPublicKey = async (): Promise<string> => {
  const response = await request.get<string>('/login/public-key');
  return response.data;
};

export const logout = async (): Promise<LogoutResponse | null> => {
  const response = await request.post<LogoutResponse | null>('/logout');
  return response.data;
};
