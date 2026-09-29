import { useState, useEffect } from 'react';
import { Space, Form, Input, Button, message, Modal, Select, InputNumber } from 'antd';
import styles from './role.module.scss';
import CommonTable from '@/components/CommonTable';
import CommonForm from '@/components/CommonForm';
import {
  getRoleList,
  type RoleParams,
  type RoleResponse,
  deleteRole,
  createRole,
  updateRole,
  type RoleFormData,
} from '@/api/role';
import CommonTitle from '@/components/CommonTitle';

interface DataType extends RoleResponse {
  key: string;
}

interface FormType {
  role_name?: string;
  id?: number;
}

const roleCodeMap: Record<string, string> = {
  '0': '超管',
  '1': '管理员',
  '2': '员工',
};

const RolePage = () => {
  const [form] = Form.useForm<FormType>();
  const [modalForm] = Form.useForm<RoleFormData>();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<RoleParams>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<DataType | null>(null);

  const onRoleAdd = () => {
    setEditingRole(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  const onRoleEdit = (record: DataType) => {
    setEditingRole(record);
    modalForm.setFieldsValue({
      role_name: record.role_name,
      role_code: Number(record.role_code),
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (editingRole) {
        await updateRole(editingRole.id, values);
        message.success('编辑成功');
      } else {
        await createRole(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      modalForm.resetFields();
      fetchRoleList(searchParams);
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error(error instanceof Error ? error.message : editingRole ? '编辑失败' : '添加失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    modalForm.resetFields();
  };

  const onRoleDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除角色「${record.role_name}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteRole(record.id);
          message.success('删除成功');
          await fetchRoleList(searchParams);
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
        }
      },
    });
  };

  const fetchRoleList = async (params: RoleParams = {}) => {
    setLoading(true);
    try {
      const res = await getRoleList(params);
      setData(res.map((item) => ({ ...item, key: String(item.id) })));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleList(searchParams);
  }, [searchParams]);

  const onFinish = (values: FormType) => {
    setSearchParams(values);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '角色名称', dataIndex: 'role_name', key: 'role_name', width: 180 },
    {
      title: '角色类型',
      dataIndex: 'role_code',
      key: 'role_code',
      width: 140,
      render: (text: string | number) => roleCodeMap[String(text)] ?? String(text),
    },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at' },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: DataType) => (
        <Space size="middle">
          <Button type="link" onClick={() => onRoleEdit(record)} disabled={record.id === 1}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => onRoleDelete(record)} disabled={record.id === 1}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.role}>
      <CommonTitle title="角色管理">
        <Button onClick={onRoleAdd} type="primary">
          添加角色
        </Button>
      </CommonTitle>

      <div className={styles.searchBox}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          className={styles.searchForm}
        >
          <Form.Item<FormType> name="role_name" label="角色名称">
            <Input placeholder="请输入角色名称" allowClear />
          </Form.Item>
          <Form.Item<FormType> name="id" label="角色ID">
            <InputNumber placeholder="请输入角色ID" style={{ width: 160 }} min={1} />
          </Form.Item>
          <Form.Item className={styles.searchItem}>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setSearchParams({});
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
          pagination={false}
        />
      </div>

      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item
            name="role_name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="role_code"
            label="角色类型"
            rules={[{ required: true, message: '请选择角色类型' }]}
          >
            <Select placeholder="请选择角色类型">
              <Select.Option value={1}>管理员</Select.Option>
              <Select.Option value={2}>员工</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolePage;
