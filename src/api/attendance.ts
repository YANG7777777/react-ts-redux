import request from '../utils/request';

export interface ClockRecordParams {
  user_name?: string;
  id?: number;
  page?: number;
  pageSize?: number;
}

export interface ClockRecordResponse {
  id: number;
  user_id: number;
  user_name: string;
  clock_in_time?: string;
  clock_out_time?: string;
  work_date: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface ClockRecordListResponse {
  list: ClockRecordResponse[];
  total: number;
}

export const getClockRecordList = async (params: ClockRecordParams = {}): Promise<ClockRecordListResponse> => {
  const response = await request.get<ClockRecordListResponse>('/clock-records/all', params);
  return response.data;
};

export const deleteClockRecord = async (id: number): Promise<void> => {
  await request.delete(`/clock-records/delete/${id}`);
};

export interface LeaveRequestParams {
  employee_name?: string;
  id?: number;
  page?: number;
  pageSize?: number;
  status?: number;
}

export interface LeaveRequestResponse {
  id: number;
  employee_id: number;
  employee_name: string;
  leave_type: number;
  start_date: string;
  end_date: string;
  reason?: string;
  approver_id?: number;
  approver_name?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequestListResponse {
  list: LeaveRequestResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const getLeaveRequestList = async (params: LeaveRequestParams = {}): Promise<LeaveRequestListResponse> => {
  const response = await request.get<LeaveRequestListResponse>('/leave-applications/all', params);
  return response.data;
};

export const deleteLeaveRequest = async (id: number): Promise<void> => {
  await request.delete(`/leave-applications/delete/${id}`);
};

// 新增请假申请
export interface AddLeaveRequestParams {
  employee_id: number;
  employee_name: string;
  leave_type: number;
  start_date: string;
  end_date: string;
  reason?: string;
  approver_id: number;
}

export const addLeaveRequest = async (params: AddLeaveRequestParams): Promise<void> => {
  await request.post('/leave-applications/add', params);
};

// 获取审批人列表
export interface ApproverResponse {
  id: number;
  name: string;
}

export const getApproverList = async (): Promise<ApproverResponse[]> => {
  const response = await request.get<ApproverResponse[]>('/employees/admins');
  return response.data;
};

// 审批请假申请
export interface ApproveLeaveRequestParams {
  id: number;
  status: number; // 1 同意, 2 拒绝
}

export const approveLeaveRequest = async (id: number, status: number): Promise<void> => {
  await request.post(`/leave-applications/approve/${id}`, { status });
};


export interface OvertimeRequestParams {
  user_name?: string;
  id?: number;
  page?: number;
  pageSize?: number;
  status?: number;
}

export interface OvertimeRequestResponse {
  id: number;
  user_id: number;
  user_name: string;
  overtime_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface OvertimeRequestListResponse {
  list: OvertimeRequestResponse[];
  total: number;
}

export const getOvertimeRequestList = async (params: OvertimeRequestParams = {}): Promise<OvertimeRequestListResponse> => {
  const response = await request.get<OvertimeRequestListResponse>('/overtime-requests/all', params);
  return response.data;
};

export const deleteOvertimeRequest = async (id: number): Promise<void> => {
  await request.delete(`/overtime-requests/delete/${id}`);
};