import request from '../utils/request';
import type { PageParams, PageResult } from './types';

export interface DepartmentParams extends PageParams {
  dept_name?: string;
  id?: number;
}

export interface DepartmentResponse {
  id: number;
  dept_name: string;
  dept_code: string;
  parent_id?: number | null;
  parent_name?: string;
  created_at: string;
  updated_at: string;
}

export type DepartmentListResponse = PageResult<DepartmentResponse>;

export const getDepartmentList = async (
  params: DepartmentParams = {}
): Promise<DepartmentListResponse> => {
  const response = await request.get<DepartmentListResponse>(
    '/departments/all',
    params as Record<string, unknown>
  );
  return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await request.delete(`/departments/delete/${id}`);
};

export interface DepartmentFormData {
  dept_name?: string;
  parent_id?: number;
}

export const createDepartment = async (data: DepartmentFormData): Promise<DepartmentResponse> => {
  const response = await request.post<DepartmentResponse>('/departments/add', data);
  return response.data;
};

export const updateDepartment = async (
  id: number,
  data: DepartmentFormData
): Promise<DepartmentResponse> => {
  const response = await request.put<DepartmentResponse>(`/departments/update/${id}`, data);
  return response.data;
};
