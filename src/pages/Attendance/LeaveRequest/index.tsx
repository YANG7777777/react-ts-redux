import { useState, useEffect } from 'react';
import { Space, Form, Input, Button, message, Modal, Select, DatePicker } from 'antd';
import styles from '../attendance.module.scss';
import CommonTable from '@/components/CommonTable';
import CommonForm from '@/components/CommonForm';
import {
  getLeaveRequestList,
  type LeaveRequestParams,
  type LeaveRequestResponse,
  deleteLeaveRequest,
  addLeaveRequest,
  type AddLeaveRequestParams,
  getApproverList,
  type ApproverResponse,
  approveLeaveRequest,
} from '@/api/attendance';
import { getUserInfoList } from '@/api/userInfo';
import CommonTitle from '@/components/CommonTitle';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface DataType extends LeaveRequestResponse {
  key: string;
}

interface FormType {
  employee_name?: string;
  status?: number;
}

interface AddLeaveFormType {
  leave_type: number;
  start_date: dayjs.Dayjs;
  end_date: dayjs.Dayjs;
  reason?: string;
  approver_id: number;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const leaveTypeMap: Record<number, string> = {
  0: '事假',
  1: '病假',
  2: '年假',
  3: '婚假',
  4: '产假',
  5: '其他',
};

const statusMap: Record<number, string> = {
  0: '待审批',
  1: '已通过',
  2: '已拒绝',
};

const statusClassMap: Record<number, string> = {
  0: 'status-pending',
  1: 'status-active',
  2: 'status-inactive',
};

const LeaveRequestPage = () => {
  const [form] = Form.useForm<FormType>();
  const [addForm] = Form.useForm<AddLeaveFormType>();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<LeaveRequestParams>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [approvers, setApprovers] = useState<ApproverResponse[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<{ id: number; name: string } | null>(null);

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  // approver_id / admins 返回的都是 employees.id，不能与 users.id 比较
  const isApprover = approvers.some((item) => item.id === currentEmployee?.id);

  useEffect(() => {
    fetchApprovers();
    resolveCurrentEmployee();
  }, [userInfo?.id, userInfo?.employee_id, userInfo?.username]);

  const resolveCurrentEmployee = async () => {
    if (!userInfo) return;
    // 登录已带回 employee_id 时直接使用，避免再打列表接口
    if (userInfo.employee_id) {
      setCurrentEmployee({
        id: userInfo.employee_id,
        name: userInfo.employee_name || userInfo.username,
      });
      return;
    }
    try {
      // 按账号 user_id 查员工档案（勿用 employees.id = users.id）
      const byUserId = await getUserInfoList({ user_id: userInfo.id, pageSize: 1 });
      if (byUserId.list[0]) {
        setCurrentEmployee({ id: byUserId.list[0].id, name: byUserId.list[0].name });
        return;
      }
      setCurrentEmployee(null);
    } catch {
      setCurrentEmployee(null);
    }
  };

  const fetchApprovers = async () => {
    try {
      const res = await getApproverList();
      setApprovers(res);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取审批人失败');
    }
  };

  const onLeaveRequestDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除请假申请「${record.employee_name}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteLeaveRequest(record.id);
          message.success('删除成功');
          fetchLeaveRequestList(searchParams);
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
        }
      },
    });
  };

  const handleApprove = (record: DataType, status: number) => {
    const actionText = status === 1 ? '同意' : '拒绝';
    Modal.confirm({
      title: `确认${actionText}`,
      content: `确定要${actionText}「${record.employee_name}」的请假申请吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await approveLeaveRequest(record.id, status);
          message.success(`${actionText}成功`);
          fetchLeaveRequestList(searchParams);
        } catch (error) {
          message.error(error instanceof Error ? error.message : `${actionText}失败`);
        }
      },
    });
  };

  const fetchLeaveRequestList = async (params: LeaveRequestParams = {}) => {
    setLoading(true);
    try {
      const res = await getLeaveRequestList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params,
      });
      setData(
        res.list.map((item) => ({
          ...item,
          key: String(item.id),
        }))
      );
      setPagination((prev) => ({
        ...prev,
        total: res.total,
      }));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取请假申请失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequestList(searchParams);
  }, [pagination.current, pagination.pageSize, searchParams]);

  const onFinish = (values: FormType) => {
    setSearchParams(values);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const handleAddClick = () => {
    if (!currentEmployee) {
      message.warning('未找到当前账号对应的员工档案，请先在员工信息中维护');
      return;
    }
    addForm.resetFields();
    setModalVisible(true);
  };

  const handleAddSubmit = async (values: AddLeaveFormType) => {
    if (!currentEmployee) {
      message.warning('未找到当前账号对应的员工档案');
      return;
    }
    try {
      const params: AddLeaveRequestParams = {
        employee_id: currentEmployee.id,
        leave_type: values.leave_type,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
        reason: values.reason,
        approver_id: values.approver_id,
      };
      await addLeaveRequest(params);
      message.success('申请成功');
      setModalVisible(false);
      fetchLeaveRequestList(searchParams);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '申请失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '员工姓名', dataIndex: 'employee_name', key: 'employee_name', width: 120 },
    {
      title: '请假类型',
      dataIndex: 'leave_type',
      key: 'leave_type',
      render: (text: number) => leaveTypeMap[text] || '未知',
      width: 100,
    },
    { title: '开始日期', dataIndex: 'start_date', key: 'start_date', width: 120 },
    { title: '结束日期', dataIndex: 'end_date', key: 'end_date', width: 120 },
    { title: '请假原因', dataIndex: 'reason', key: 'reason', width: 200, ellipsis: true },
    { title: '审批人', dataIndex: 'approver_name', key: 'approver_name', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: number) => (
        <span className={styles[statusClassMap[text] || 'status-pending']}>
          {statusMap[text] || '未知'}
        </span>
      ),
      width: 100,
    },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: unknown, record: DataType) => (
        <Space size="middle">
          {record.status === 0 &&
            (isApprover || record.approver_id === currentEmployee?.id) && (
              <>
                <Button type="link" onClick={() => handleApprove(record, 1)}>
                  同意
                </Button>
                <Button type="link" danger onClick={() => handleApprove(record, 2)}>
                  拒绝
                </Button>
              </>
            )}
          <Button type="link" danger onClick={() => onLeaveRequestDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.attendance}>
      <CommonTitle title="请假申请">
        <Button onClick={handleAddClick} type="primary">
          申请请假
        </Button>
      </CommonTitle>

      <div className={styles.searchBox}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          className={styles.searchForm}
        >
          <Form.Item<FormType> name="employee_name" label="员工姓名">
            <Input placeholder="请输入员工姓名" allowClear />
          </Form.Item>
          <Form.Item<FormType> name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              <Select.Option value={0}>待审批</Select.Option>
              <Select.Option value={1}>已通过</Select.Option>
              <Select.Option value={2}>已拒绝</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item className={styles.searchItem}>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setSearchParams({});
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            >
              重置
            </Button>
          </Form.Item>
        </CommonForm>
      </div>

      <div className={styles.tableBox}>
        <CommonTable<DataType>
          fillHeight
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: handlePaginationChange,
          }}
        />
      </div>

      <Modal title="申请请假" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <CommonForm<AddLeaveFormType> form={addForm} layout="vertical" onFinish={handleAddSubmit}>
          <Form.Item
            name="leave_type"
            label="请假类型"
            rules={[{ required: true, message: '请选择请假类型' }]}
          >
            <Select placeholder="请选择请假类型">
              {Object.entries(leaveTypeMap).map(([value, label]) => (
                <Select.Option key={value} value={Number(value)}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="start_date"
            label="开始日期"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="结束日期"
            dependencies={['start_date']}
            rules={[
              { required: true, message: '请选择结束日期' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue('start_date');
                  if (!value || !start || !value.isBefore(start, 'day')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('结束日期不能早于开始日期'));
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="approver_id"
            label="审批人"
            rules={[{ required: true, message: '请选择审批人' }]}
          >
            <Select placeholder="请选择审批人">
              {approvers.map((approver) => (
                <Select.Option key={approver.id} value={approver.id}>
                  {approver.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="请假原因">
            <Input.TextArea rows={4} placeholder="请输入请假原因" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交申请
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </CommonForm>
      </Modal>
    </div>
  );
};

export default LeaveRequestPage;
