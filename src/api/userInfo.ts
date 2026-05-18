import request from '@/utils/request';
import { Dayjs } from 'dayjs';

export interface UserInfoResponse {
  id: number;
  name: string;
  dept_code?: string;
  department: string;
  role_id?: number;
  role_code?: string;
  position: string;
  email: string;
  phone: string;
  birthday?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface UserInfoListResponse {
  list: UserInfoResponse[];
  total: number;
}

export interface UserInfoParams {
  id?: number;
  name?: string;
  department?: string;
  position?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface UserInfoFormData {
  name?: string;
  dept_code?: string;
  department?: string;
  role_id?: number;
  position?: string;
  email?: string;
  phone?: string;
  birthday?: Dayjs | string | null;
  status?: number;
}

export const getUserInfoList = async (params: UserInfoParams = {}): Promise<UserInfoListResponse> => {
  const response = await request.get<UserInfoListResponse>('/employees/all', params);
  return response.data;
};

export const getUserInfoById = async (id: number): Promise<UserInfoResponse> => {
  const response = await request.get<UserInfoResponse>(`/employees/${id}`);
  return response.data;
};

export const createUserInfo = async (data: UserInfoFormData): Promise<UserInfoResponse> => {
  const response = await request.post<UserInfoResponse>('/employees/add', data);
  return response.data;
};

export const updateUserInfo = async (id: number, data: UserInfoFormData): Promise<UserInfoResponse> => {
  const response = await request.put<UserInfoResponse>(`/employees/update/${id}`, data);
  return response.data;
};

export const deleteUserInfo = async (id: number): Promise<void> => {
  await request.delete(`/employees/delete/${id}`);
};