import request from '../utils/request';
import type { PageParams, PageResult } from './types';

export interface UserParams extends PageParams {
  /** 登录名 */
  username?: string;
  /** 用户名（员工姓名） */
  employee_name?: string;
  id?: number;
  role?: number;
}

export interface UserResponse {
  id: number;
  /** 登录名 */
  username: string;
  email: string;
  address?: string;
  role?: string | number;
  role_name?: string;
  employee_id?: number | null;
  /** 用户名（关联员工姓名） */
  employee_name?: string | null;
  created_at: string;
  updated_at: string;
}

export type UserListResponse = PageResult<UserResponse>;

export const getUserList = async (params: UserParams = {}): Promise<UserListResponse> => {
  const response = await request.get<UserListResponse>(
    '/users/all',
    params as Record<string, unknown>
  );
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await request.delete(`/users/delete/${id}`);
};

export interface UserFormData {
  /** 登录名 */
  username?: string;
  email?: string;
  address?: string;
  password?: string;
  role?: string | number;
}

export const createUser = async (data: UserFormData): Promise<UserResponse> => {
  const response = await request.post<UserResponse>('/users/add', data);
  return response.data;
};

export const updateUser = async (id: number, data: UserFormData): Promise<UserResponse> => {
  const response = await request.put<UserResponse>(`/users/update/${id}`, data);
  return response.data;
};
