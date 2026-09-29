import { useState, useEffect } from 'react';
import { Space, Form, Input, Button, message, Modal, Select, InputNumber } from 'antd';
import styles from './users.module.scss';
import CommonTable from '@/components/CommonTable';
import CommonForm from '@/components/CommonForm';
import {
  getUserList,
  type UserParams,
  type UserResponse,
  updateUser,
  type UserFormData,
} from '@/api/user';
import { getRoleList, type RoleResponse } from '@/api/role';
import CommonTitle from '@/components/CommonTitle';

interface DataType extends UserResponse {
  key: string;
}

interface FormType {
  /** 登录名 */
  username?: string;
  /** 用户名（员工姓名） */
  employee_name?: string;
  id?: number;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const UsersPage = () => {
  const [form] = Form.useForm<FormType>();
  const [modalForm] = Form.useForm<UserFormData>();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<UserParams>({});
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<DataType | null>(null);
  const [roles, setRoles] = useState<RoleResponse[]>([]);

  const getRoleLabel = (role?: string | number) => {
    if (role === undefined || role === null || role === '') return '未知';
    const matched = roles.find((r) => String(r.role_code) === String(role));
    if (matched) return matched.role_name;
    const fallback: Record<string, string> = { '0': '超管', '1': '管理员', '2': '员工' };
    return fallback[String(role)] ?? String(role);
  };

  const onUserEdit = (record: DataType) => {
    setEditingUser(record);
    modalForm.setFieldsValue({
      username: record.username,
      email: record.email,
      address: record.address,
      role: record.role,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (!editingUser) return;
      const updateValues: UserFormData = { ...values };
      if (!updateValues.password) {
        delete updateValues.password;
      }
      await updateUser(editingUser.id, updateValues);
      message.success('编辑成功');
      setModalVisible(false);
      modalForm.resetFields();
      fetchUserList(searchParams);
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error(error instanceof Error ? error.message : '编辑失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    modalForm.resetFields();
  };

  const fetchUserList = async (params: UserParams = {}) => {
    setLoading(true);
    try {
      const res = await getUserList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params,
      });
      setData(res.list.map((item) => ({ ...item, key: String(item.id) })));
      setPagination((prev) => ({ ...prev, total: res.total }));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoleList();
      setRoles(res);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取角色列表失败');
    }
  };

  useEffect(() => {
    fetchUserList(searchParams);
  }, [pagination.current, pagination.pageSize, searchParams]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const onFinish = (values: FormType) => {
    setSearchParams(values);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: '用户名',
      dataIndex: 'employee_name',
      key: 'employee_name',
      width: 120,
      render: (text?: string | null) => text || <span className={styles.muted}>未关联员工</span>,
    },
    {
      title: '登录名',
      dataIndex: 'username',
      key: 'username',
      width: 140,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (text: string | number) => getRoleLabel(text),
    },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 200, ellipsis: true },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 170 },
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: DataType) => (
        <Space size="middle">
          <Button type="link" onClick={() => onUserEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.users}>
      <CommonTitle title="账号管理" />

      <div className={styles.searchBox}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          className={styles.searchForm}
        >
          <Form.Item<FormType> name="employee_name" label="用户名">
            <Input placeholder="员工姓名" allowClear />
          </Form.Item>
          <Form.Item<FormType> name="username" label="登录名">
            <Input placeholder="登录账号" allowClear />
          </Form.Item>
          <Form.Item<FormType> name="id" label="账号ID">
            <InputNumber placeholder="账号ID" style={{ width: 140 }} min={1} />
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
          scroll={{ x: 1100 }}
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
        title="编辑账号"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item label="用户名">
            <Input
              value={editingUser?.employee_name || ''}
              placeholder="未关联员工档案"
              disabled
            />
          </Form.Item>
          <Form.Item
            name="username"
            label="登录名"
            rules={[{ required: true, message: '请输入登录名' }]}
            extra="用于系统登录的账号名"
          >
            <Input placeholder="请输入登录名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="password" label="密码">
            <Input.Password placeholder="留空则不更新密码" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.role_code}>
                  {role.role_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
