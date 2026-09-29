/** 统一分页请求参数（与后端 page / current 双兼容，前端统一传 page） */
export interface PageParams {
  page?: number;
  pageSize?: number;
  /** 关联账号 ID，员工列表筛选用 */
  user_id?: number;
}

/** 统一分页响应（后端 page() 同时返回 page 与 current） */
export interface PageResult<T> {
  list: T[];
  total: number;
  page?: number;
  current?: number;
  pageSize?: number;
  totalPages?: number;
}

/** 传统 API 成功结构（request 层已把后端 status 信封归一到此） */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 后端 pageSize 上限，看板等一次性拉取勿超过此值 */
export const PAGE_SIZE_MAX = 100;
