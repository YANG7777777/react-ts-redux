import { useState, useEffect } from "react";
//
import { Space, Form, Input, Button, message, Modal, Select } from "antd";
import styles from "./role.module.scss";
// 通用表格组件
import CommonTable from "@/components/CommonTable";
// 通用表单组件
import CommonForm from "@/components/CommonForm";
import { getRoleList, RoleParams, RoleResponse, deleteRole, createRole, updateRole, RoleFormData } from "@/api/role";
import CommonTitle from "@/components/CommonTitle";

interface DataType extends RoleResponse {
  key: string;
}

interface FormType {
  role_name?: string;
  id?: number;
}

// 角色列表页面
const RolePage = () => {
  // 搜索表单
  const [form] = Form.useForm<FormType>();
  // 弹窗表单
  const [modalForm] = Form.useForm<RoleFormData>();
  // 表格数据
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  // 搜索参数
  const [searchParams, setSearchParams] = useState<RoleParams>({});
  // 弹窗是否可见
  const [modalVisible, setModalVisible] = useState(false);
  // 当前编辑角色
  const [editingRole, setEditingRole] = useState<DataType | null>(null);

  // 添加角色按钮
  const onRoleAdd = () => {
    setEditingRole(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  // 编辑角色按钮
  const onRoleEdit = (record: DataType) => {
    setEditingRole(record);
    modalForm.setFieldsValue({
      role_name: record.role_name,
      role_code: (record as any).role_code,
    });
    setModalVisible(true);
  };

  // 确认添加/编辑角色
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
      console.error('操作失败:', error);
      message.error(editingRole ? '编辑失败' : '添加失败');
    }
  };

  // 取消添加/编辑角色
  const handleModalCancel = () => {
    setModalVisible(false);
    modalForm.resetFields();
  };

  // 删除角色按钮
  const onRoleDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除角色 "${record.role_name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteRole(record.id);
          message.success('删除成功');
          await fetchRoleList(searchParams);
        } catch (error) {
          console.error('删除角色失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // 获取角色列表
  const fetchRoleList = async (params: RoleParams = {}) => {
    setLoading(true);
    try {
      const res = await getRoleList(params);

      console.log('res', res);

      const formattedData = res.map((item) => ({
        ...item,
        key: String(item.id),
      }));
      setData(formattedData);
    } catch (error) {
      console.error('获取角色列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleList(searchParams);
  }, [searchParams]);

  // 搜索角色
  const onFinish = async (values: FormType) => {
    console.log('表单提交:', values);
    setSearchParams(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('表单验证失败:', errorInfo);
    message.error('请检查表单填写！');
  };

  // 表格列定义
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "角色名称",
      dataIndex: "role_name",
      key: "role_name",
      render: (text: string) => <a>{text}</a>,
      width: 180,
    },
    {
      title: "角色类型",
      dataIndex: "role_code",
      key: "role_code",
      render: (text: number) => {
        const roleMap: Record<number, string> = {
          0: '超管',
          1: '管理员',
          2: '员工',
        };
        return <a>{roleMap[text] ?? '未知'}</a>;
      },
      width: 180,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      key: "updated_at",
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: DataType) => (
        <Space size="middle">
          <Button onClick={() => onRoleEdit(record)} disabled={record.id === 1} color="primary" variant="text">编辑</Button>
          <Button onClick={() => onRoleDelete(record)} disabled={record.id === 1} color="danger" variant="text">删除</Button>
        </Space>
      ),
      width: 280,
    },
  ];

  return (
    <div className={styles.role}>
      <CommonTitle title="角色管理">
        <Button onClick={onRoleAdd} type="primary" color="primary">添加角色</Button>
      </CommonTitle>

      {/* 搜索表单 */}
      <div className={styles.searchBox} style={{ marginBottom: 20 }}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className={styles.searchForm}
        >
          <Form.Item<FormType>
            name="role_name"
            label="角色名称"
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item<FormType>
            name="id"
            label="角色ID"
          >
            <Input placeholder="请输入角色ID" />
          </Form.Item>

          <Form.Item className={styles.searchItem}>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => {
              form.resetFields();
              setSearchParams({});
            }}>
              重置
            </Button>
          </Form.Item>
        </CommonForm>
      </div>

      {/* 角色表格 */}
      <div className={styles.tableBox}>
        <CommonTable<DataType>
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />
      </div>


      {/* 弹窗表单 */}
      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item<RoleFormData>
            name="role_name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item<RoleFormData>
            name="role_code"
            label="角色类型"
            rules={[{ required: true, message: '请选择角色类型' }]}
          >
            <Select placeholder="请选择角色类型">
              {/* <Select.Option value={0}>超管</Select.Option> */}
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