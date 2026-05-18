import request from '../utils/request';

export interface RoleParams {
  role_name?: string;
  id?: number;
}

export interface RoleResponse {
  id: number;
  role_name: string;
  role_type: number;
  role_code: string;
  created_at: string;
  updated_at: string;
}

export const getRoleList = async (params: RoleParams = {}): Promise<RoleResponse[]> => {
  const response = await request.get<RoleResponse[]>('/roles/all', params);
  return response.data as unknown as RoleResponse[];
};

export const deleteRole = async (id: number): Promise<void> => {
  await request.delete(`/roles/delete/${id}`);
};

export interface RoleFormData {
  role_name?: string;
  role_code?: number;
}

export const createRole = async (data: RoleFormData): Promise<RoleResponse> => {
  const response = await request.post<RoleResponse>('/roles/add', data);
  return response.data;
};

export const updateRole = async (id: number, data: RoleFormData): Promise<RoleResponse> => {
  const response = await request.put<RoleResponse>(`/roles/update/${id}`, data);
  return response.data;
};