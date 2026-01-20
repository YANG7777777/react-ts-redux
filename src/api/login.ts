import request from '../utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userInfo?: {
    id: number;
    username: string;
    email?: string;
  };
}

export const login = async (values: LoginParams): Promise<LoginResponse> => {
  const response = await request.post<LoginResponse>('/login', values);
  return response.data;
};


// 获取公钥
export const getPublicKey = async (): Promise<string> => {
  const response = await request.get<string>('/login/public-key');
  return response.data;
};
