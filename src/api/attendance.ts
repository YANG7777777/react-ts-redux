import request from '../utils/request';
import type { PageParams, PageResult } from './types';
import type { UserInfoResponse } from './userInfo';
import { getLeaderList } from './userInfo';

export interface ClockRecordParams extends PageParams {
  employee_name?: string;
  employee_id?: number;
  status?: number;
}

export interface ClockRecordResponse {
  id: number;
  employee_id: number;
  employee_name: string;
  clock_in_time?: string;
  clock_out_time?: string;
  /** 打卡日期 YYYY-MM-DD */
  date: string;
  status: number;
  status_name?: string;
  remark?: string;
  created_at: string;
  updated_at: string;
}

export type ClockRecordListResponse = PageResult<ClockRecordResponse>;

export const getClockRecordList = async (
  params: ClockRecordParams = {}
): Promise<ClockRecordListResponse> => {
  const response = await request.get<ClockRecordListResponse>(
    '/clock-records/all',
    params as Record<string, unknown>
  );
  return response.data;
};

export const deleteClockRecord = async (id: number): Promise<void> => {
  await request.delete(`/clock-records/delete/${id}`);
};

export interface LeaveRequestParams extends PageParams {
  employee_name?: string;
  id?: number;
  status?: number;
  employee_id?: number;
  approver_id?: number;
}

export interface LeaveRequestResponse {
  id: number;
  employee_id: number;
  employee_name: string;
  leave_type: number;
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  reason?: string;
  approver_id?: number;
  approver_name?: string;
  status: number;
  status_name?: string;
  created_at: string;
  updated_at: string;
}

export type LeaveRequestListResponse = PageResult<LeaveRequestResponse>;

export const getLeaveRequestList = async (
  params: LeaveRequestParams = {}
): Promise<LeaveRequestListResponse> => {
  const response = await request.get<LeaveRequestListResponse>(
    '/leave-applications/all',
    params as Record<string, unknown>
  );
  return response.data;
};

export const deleteLeaveRequest = async (id: number): Promise<void> => {
  await request.delete(`/leave-applications/delete/${id}`);
};

export interface AddLeaveRequestParams {
  employee_id: number;
  leave_type: number;
  start_date: string;
  end_date: string;
  reason?: string;
  approver_id: number;
}

export const addLeaveRequest = async (params: AddLeaveRequestParams): Promise<void> => {
  await request.post('/leave-applications/add', params);
};

export interface ApproverResponse {
  id: number;
  name: string;
}

/** 复用员工管理员接口，避免重复请求路径 */
export const getApproverList = async (): Promise<ApproverResponse[]> => {
  const leaders = await getLeaderList();
  return leaders.map((item: UserInfoResponse) => ({
    id: item.id,
    name: item.name,
  }));
};

export const approveLeaveRequest = async (id: number, status: number): Promise<void> => {
  await request.post(`/leave-applications/approve/${id}`, { status });
};

export interface OvertimeRequestParams extends PageParams {
  user_name?: string;
  employee_id?: number;
  id?: number;
  status?: number;
}

export interface OvertimeRequestResponse {
  id: number;
  /** 实际存的是 employees.id，兼容字段 */
  user_id: number;
  employee_id: number;
  user_name: string;
  employee_name: string;
  overtime_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  status: number;
  status_name?: string;
  created_at: string;
  updated_at: string;
}

export type OvertimeRequestListResponse = PageResult<OvertimeRequestResponse>;

export const getOvertimeRequestList = async (
  params: OvertimeRequestParams = {}
): Promise<OvertimeRequestListResponse> => {
  const response = await request.get<OvertimeRequestListResponse>(
    '/overtime-requests/all',
    params as Record<string, unknown>
  );
  return response.data;
};

export const deleteOvertimeRequest = async (id: number): Promise<void> => {
  await request.delete(`/overtime-requests/delete/${id}`);
};
