import request from '../utils/request';

export interface UserParams {
  userName?: string;
  id?: number;
  current?: number;
  pageSize?: number;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  list: UserResponse[];
  total: number;
}

export const getUserList = async (params: UserParams = {}): Promise<UserListResponse> => {
  const response = await request.get<UserListResponse>('/users/all', params);
  return response.data as unknown as UserListResponse;
};

export const deleteUser = async (id: number): Promise<void> => {
  await request.delete(`/users/delete/${id}`);
};

export interface UserFormData {
  username?: string;
  email?: string;
  address?: string;
  password?: string;
}

export const createUser = async (data: UserFormData): Promise<UserResponse> => {
  const response = await request.post<UserResponse>('/users/add', data);
  return response.data;
};

export const updateUser = async (id: number, data: UserFormData): Promise<UserResponse> => {
  const response = await request.put<UserResponse>(`/users/update/${id}`, data);
  return response.data;
};