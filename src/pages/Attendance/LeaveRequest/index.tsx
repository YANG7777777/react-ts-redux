import { useState, useEffect } from "react";
import { Space, Form, Input, Button, message, Modal, Select, DatePicker } from "antd";
import styles from "../attendance.module.scss";
import CommonTable from "@/components/CommonTable";
import CommonForm from "@/components/CommonForm";
import { getLeaveRequestList, LeaveRequestParams, LeaveRequestResponse, deleteLeaveRequest, addLeaveRequest, AddLeaveRequestParams, getApproverList, ApproverResponse, approveLeaveRequest } from "@/api/attendance";
import CommonTitle from "@/components/CommonTitle";
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface DataType extends LeaveRequestResponse {
  key: string;
}

interface FormType {
  employee_name?: string;
  id?: number;
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

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  useEffect(() => {
    fetchApprovers();
  }, []);

  const fetchApprovers = async () => {
    try {
      const res = await getApproverList();
      setApprovers(res);
    } catch (error) {
      console.error('获取审批人列表失败:', error);
    }
  };

  const onLeaveRequestDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除请假申请 "${record.employee_name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteLeaveRequest(record.id);
          message.success('删除成功');
          fetchLeaveRequestList(searchParams);
        } catch (error) {
          console.error('删除请假申请失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const handleApprove = async (record: DataType, status: number) => {
    const actionText = status === 1 ? '同意' : '拒绝';
    Modal.confirm({
      title: `确认${actionText}`,
      content: `确定要${actionText} "${record.employee_name}" 的请假申请吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await approveLeaveRequest(record.id, status);
          message.success(`${actionText}成功`);
          fetchLeaveRequestList(searchParams);
        } catch (error) {
          console.error(`${actionText}失败:`, error);
          message.error(`${actionText}失败`);
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
        ...params
      });
      const formattedData = res.list.map((item) => ({
        ...item,
        key: String(item.id),
      }));
      setData(formattedData);
      setPagination((prev) => ({
        ...prev,
        total: res.total,
      }));
    } catch (error) {
      console.error('获取请假申请列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequestList(searchParams);
  }, [pagination.current, pagination.pageSize, searchParams]);

  const onFinish = async (values: FormType) => {
    setSearchParams(values);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('表单验证失败:', errorInfo);
    message.error('请检查表单填写！');
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
  };

  const handleAddClick = () => {
    addForm.resetFields();
    setModalVisible(true);
  };

  const handleAddSubmit = async (values: AddLeaveFormType) => {
    try {
      const params: AddLeaveRequestParams = {
        employee_id: userInfo?.id || 0,
        employee_name: userInfo?.username || '',
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
      console.error('申请失败:', error);
      message.error('申请失败');
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "员工姓名",
      dataIndex: "employee_name",
      key: "employee_name",
      width: 120,
    },
    {
      title: "请假类型",
      dataIndex: "leave_type",
      key: "leave_type",
      render: (text: number) => leaveTypeMap[text] || '未知',
      width: 100,
    },
    {
      title: "开始日期",
      dataIndex: "start_date",
      key: "start_date",
      width: 120,
    },
    {
      title: "结束日期",
      dataIndex: "end_date",
      key: "end_date",
      width: 120,
    },
    {
      title: "请假原因",
      dataIndex: "reason",
      key: "reason",
      width: 200,
    },
    {
      title: "审批人",
      dataIndex: "approver_name",
      key: "approver_name",
      width: 120,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (text: number) => (
        <span className={text === 1 ? 'status-active' : text === 2 ? 'status-inactive' : 'status-pending'}>
          {statusMap[text] || '未知'}
        </span>
      ),
      width: 100,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: DataType) => (
        <Space size="middle">
          {record.status === 0 && (
            <>
              <Button onClick={() => handleApprove(record, 1)} type="primary" variant="text">同意</Button>
              <Button onClick={() => handleApprove(record, 2)} color="danger" variant="text">拒绝</Button>
            </>
          )}
          <Button onClick={() => onLeaveRequestDelete(record)} color="danger" variant="text">删除</Button>
        </Space>
      ),
      width: 200,
    },
  ];

  return (
    <div className={styles.attendance}>
      <CommonTitle title="请假申请">
        <Button onClick={handleAddClick} type="primary" color="primary">申请请假</Button>
      </CommonTitle>

      <div className={styles.searchBox} style={{ marginBottom: 20 }}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className={styles.searchForm}
        >
          <Form.Item<FormType>
            name="employee_name"
            label="员工姓名"
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>

          <Form.Item<FormType>
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              <Select.Option value={0}>待审批</Select.Option>
              <Select.Option value={1}>已通过</Select.Option>
              <Select.Option value={2}>已拒绝</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className={styles.searchItem}>
            <Button type="primary" htmlType="submit">搜索</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => {
              form.resetFields();
              setSearchParams({});
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}>重置</Button>
          </Form.Item>
        </CommonForm>
      </div>

      <div className={styles.tableBox}>
        <CommonTable<DataType>
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

      <Modal
        title="申请请假"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <CommonForm<AddLeaveFormType>
          form={addForm}
          layout="vertical"
          onFinish={handleAddSubmit}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item<AddLeaveFormType>
            name="leave_type"
            label="请假类型"
            rules={[{ required: true, message: '请选择请假类型' }]}
          >
            <Select placeholder="请选择请假类型">
              <Select.Option value={0}>事假</Select.Option>
              <Select.Option value={1}>病假</Select.Option>
              <Select.Option value={2}>年假</Select.Option>
              <Select.Option value={3}>婚假</Select.Option>
              <Select.Option value={4}>产假</Select.Option>
              <Select.Option value={5}>其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item<AddLeaveFormType>
            name="start_date"
            label="开始日期"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item<AddLeaveFormType>
            name="end_date"
            label="结束日期"
            rules={[{ required: true, message: '请选择结束日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item<AddLeaveFormType>
            name="approver_id"
            label="审批人"
            rules={[{ required: true, message: '请选择审批人' }]}
          >
            <Select placeholder="请选择审批人">
              {approvers.map(approver => (
                <Select.Option key={approver.id} value={approver.id}>{approver.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item<AddLeaveFormType>
            name="reason"
            label="请假原因"
          >
            <Input.TextArea rows={4} placeholder="请输入请假原因" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">提交申请</Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </CommonForm>
      </Modal>
    </div>
  );
};

export default LeaveRequestPage;