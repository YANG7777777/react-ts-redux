import request from '../utils/request';

export interface DepartmentParams {
  department_name?: string;
  id?: number;
  current?: number;
  pageSize?: number;
}

export interface DepartmentResponse {
  id: number;
  dept_name: string;
  dept_code: string;
  parent_id?: number;
  parent_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentListResponse {
  list: DepartmentResponse[];
  total: number;
}

export const getDepartmentList = async (params: DepartmentParams = {}): Promise<DepartmentListResponse> => {
  const response = await request.get<DepartmentListResponse>('/departments/all', params);
  console.log('部门列表原始返回:', response);
  return response.data as unknown as DepartmentListResponse;
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

export const updateDepartment = async (id: number, data: DepartmentFormData): Promise<DepartmentResponse> => {
  const response = await request.put<DepartmentResponse>(`/departments/update/${id}`, data);
  return response.data;
};