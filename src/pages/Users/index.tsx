import { useState, useEffect } from "react";
// 
import { Space, Form, Input, Button, message, Modal } from "antd";
import styles from "./users.module.scss";
// 通用表格组件
import CommonTable from "@/components/CommonTable";
// 通用表单组件
import CommonForm from "@/components/CommonForm";
import { getUserList, UserParams, UserResponse, deleteUser, createUser, updateUser, UserFormData } from "@/api/user";

interface DataType extends UserResponse {
  key: string;
}

interface FormType {
  username?: string;
  id?: number;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

// 用户列表页面
const UsersPage = () => {
  // 搜索表单
  const [form] = Form.useForm<FormType>();
  // 弹窗表单
  const [modalForm] = Form.useForm<UserFormData>();
  // 表格数据
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  // 搜索参数
  const [searchParams, setSearchParams] = useState<UserParams>({});
  // 分页状态
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  // 弹窗是否可见
  const [modalVisible, setModalVisible] = useState(false);
  // 当前编辑用户
  const [editingUser, setEditingUser] = useState<DataType | null>(null);

  // 添加用户按钮
  const onUserAdd = () => {
    setEditingUser(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  // 编辑用户按钮
  const onUserEdit = (record: DataType) => {
    setEditingUser(record);
    modalForm.setFieldsValue({
      username: record.username,
      email: record.email,
      address: record.address,
    });
    setModalVisible(true);
  };

  // 确认添加/编辑用户
  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (editingUser) {
        const updateValues: UserFormData = { ...values };
        if (!updateValues.password) {
          delete updateValues.password;
        }
        await updateUser(editingUser.id, updateValues);
        message.success('编辑成功');
      } else {
        await createUser(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      modalForm.resetFields();
      fetchUserList(searchParams);
    } catch (error) {
      console.error('操作失败:', error);
      message.error(editingUser ? '编辑失败' : '添加失败');
    }
  };

  // 取消添加/编辑用户
  const handleModalCancel = () => {
    setModalVisible(false);
    modalForm.resetFields();
  };

  // 删除用户按钮
  const onUserDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.username}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success('删除成功');
          fetchUserList(searchParams);
        } catch (error) {
          console.error('删除用户失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // 获取用户列表
  const fetchUserList = async (params: UserParams = {}) => {
    setLoading(true);
    try {
      const res = await getUserList({ 
        current: pagination.current, 
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
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList(searchParams);
  }, [pagination.current, pagination.pageSize, searchParams]);

  // 搜索用户
  const onFinish = async (values: FormType) => {
    console.log('表单提交:', values);
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

  // 分页改变
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
  };

  // 表格列定义
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
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
          <Button onClick={() => onUserEdit(record)} color="primary" variant="text">编辑</Button>
          <Button onClick={() => onUserDelete(record)} disabled={record.id === 1} color="danger" variant="text">删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.users}>
      <div className={styles.title}>
        <div className={styles.titleLeft}>用户管理</div>
        <div className={styles.titleRight}>
          <Button onClick={onUserAdd} type="primary" color="primary">添加用户</Button>
        </div>
      </div>

      {/* 搜索表单 */}
      <div style={{ marginBottom: 20 }}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item<FormType>
            name="username"
            label="用户名"
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item<FormType>
            name="id"
            label="用户ID"
          >
            <Input placeholder="请输入用户ID" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              搜索
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => {
              form.resetFields();
              setSearchParams({});
              setPagination((prev) => ({
                ...prev,
                current: 1,
              }));
            }}>
              重置
            </Button>
          </Form.Item>
        </CommonForm>
      </div>

      {/* 用户表格 */}
      <div className={styles.formBox}>
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


      {/* 弹窗表单 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item<UserFormData>
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item<UserFormData>
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          {/* 编辑时不校验密码 输入代表更新不输入代表不更新 */}
          <Form.Item<UserFormData>
            name="password"
            label="密码"
            rules={editingUser ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingUser ? '请输入密码（留空不更新）' : '请输入密码'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
