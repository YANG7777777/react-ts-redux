import request from '@/utils/request';
import type { Dayjs } from 'dayjs';
import type { PageParams, PageResult } from './types';

export interface UserInfoResponse {
  id: number;
  user_id?: number | null;
  name: string;
  dept_code?: string;
  department?: string;
  department_name?: string;
  role_id?: number;
  role_code?: string | number;
  role_name?: string;
  position: string;
  email: string;
  phone: string;
  birthday?: string;
  status: number;
  status_name?: string;
  created_at: string;
  updated_at: string;
  approver_id?: number;
  approver_name?: string;
  /** 新建员工时后端一次性返回的初始密码 */
  initial_password?: string;
  username?: string;
}

export type UserInfoListResponse = PageResult<UserInfoResponse>;

export interface UserInfoParams extends PageParams {
  id?: number;
  /** 按关联账号 ID 查员工档案 */
  user_id?: number;
  name?: string;
  department?: string;
  dept_code?: string;
  position?: string;
  status?: number;
}

export interface UserInfoFormData {
  name?: string;
  dept_code?: string;
  department?: string;
  role_id?: number;
  role_code?: number;
  position?: string;
  email?: string;
  phone?: string;
  birthday?: Dayjs | string | null;
  status?: number;
  approver_id?: number;
}

export const getUserInfoList = async (
  params: UserInfoParams = {}
): Promise<UserInfoListResponse> => {
  const response = await request.get<UserInfoListResponse>(
    '/employees/all',
    params as Record<string, unknown>
  );
  return response.data;
};

export const getUserInfoById = async (id: number): Promise<UserInfoResponse> => {
  const response = await request.get<UserInfoResponse>(`/employees/detail/${id}`);
  return response.data;
};

export const createUserInfo = async (data: UserInfoFormData): Promise<UserInfoResponse> => {
  const response = await request.post<UserInfoResponse>('/employees/add', data);
  return response.data;
};

export const updateUserInfo = async (
  id: number,
  data: UserInfoFormData
): Promise<UserInfoResponse> => {
  const response = await request.put<UserInfoResponse>(`/employees/update/${id}`, data);
  return response.data;
};

export const deleteUserInfo = async (id: number): Promise<void> => {
  await request.delete(`/employees/delete/${id}`);
};

export const getLeaderList = async (): Promise<UserInfoResponse[]> => {
  const response = await request.get<UserInfoResponse[]>('/employees/admins');
  return response.data;
};
