import { useState, useEffect } from "react";
import { Space, Form, Input, Button, message, Modal, Select, Card, TreeSelect, DatePicker } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import styles from "./userInfo.module.scss";
import CommonTable from "@/components/CommonTable";
import CommonForm from "@/components/CommonForm";
import CommonTitle from "@/components/CommonTitle";
import { getUserInfoList, UserInfoResponse, UserInfoParams, UserInfoFormData, createUserInfo, updateUserInfo, deleteUserInfo } from "@/api/userInfo";
import { getDepartmentList, DepartmentResponse } from "@/api/department";
import { getRoleList, RoleResponse } from "@/api/role";

interface DataType extends UserInfoResponse {
  key: string;
}

interface FormType {
  name?: string;
  id?: number;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

interface TreeNode {
  title: string;
  value: string | number;
  key: string | number;
  children?: TreeNode[];
}

dayjs.extend(utc);

const UserInfoPage = () => {
  const [form] = Form.useForm<FormType>();
  const [modalForm] = Form.useForm<UserInfoFormData>();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<FormType>({});
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<DataType | null>(null);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);

  const positions = ['经理', '主管', '工程师', '设计师', '专员'];

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartmentList();
      setDepartments(res.list);
      const tree = buildTreeData(res.list);
      setTreeData(tree);
    } catch (error) {
      console.error('获取部门列表失败:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoleList();
      setRoles(res);
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  const buildTreeData = (departments: DepartmentResponse[], parentId: number | undefined = undefined): TreeNode[] => {
    return departments
      .filter(dept => {
        if (parentId === undefined) {
          return dept.parent_id === undefined || dept.parent_id === null || dept.parent_id === 0;
        }
        return dept.parent_id === parentId;
      })
      .map(dept => {
        const children = buildTreeData(departments, dept.id);
        return {
          title: dept.dept_name,
          value: dept.dept_code,
          key: dept.dept_code,
          children: children.length > 0 ? children : undefined,
        };
      });
  };

  const onEmployeeAdd = () => {
    setEditingEmployee(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  const onEmployeeEdit = (record: DataType) => {
    setEditingEmployee(record);
    modalForm.setFieldsValue({
      name: record.name,
      dept_code: record.dept_code,
      department: record.department || '',
      role_id: record.role_id,
      position: record.position,
      email: record.email,
      phone: record.phone,
      birthday: record.birthday ? dayjs.utc(record.birthday).local() : undefined,
      status: record.status ? 1 : 0,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      const submitData = {
        ...values,
        birthday: values.birthday && typeof values.birthday !== 'string' 
          ? values.birthday.format('YYYY-MM-DD') 
          : values.birthday || undefined,
      };
      if (editingEmployee) {
        await updateUserInfo(editingEmployee.id, submitData);
        message.success('编辑成功');
      } else {
        await createUserInfo(submitData);
        message.success('添加成功');
      }
      setModalVisible(false);
      modalForm.resetFields();
      fetchEmployeeList();
    } catch (error) {
      console.error('操作失败:', error);
      message.error(editingEmployee ? '编辑失败' : '添加失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    modalForm.resetFields();
  };

  const onEmployeeDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除员工 "${record.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteUserInfo(record.id);
          message.success('删除成功');
          fetchEmployeeList();
        } catch (error) {
          console.error('删除员工失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const fetchEmployeeList = async () => {
    setLoading(true);
    try {
      const params: UserInfoParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (searchParams.name) params.name = searchParams.name;
      if (searchParams.id) params.id = searchParams.id;

      const res = await getUserInfoList(params);
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
      console.error('获取员工列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeList();
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

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <a>{text}</a>,
      width: 120,
    },
    {
      title: "部门",
      dataIndex: "department_name",
      key: "department_name",
      width: 120,
    },
    {
      title: "职位",
      dataIndex: "position",
      key: "position",
      width: 120,
    },
    {
      title: "角色",
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
      width: 120,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "生日",
      dataIndex: "birthday",
      key: "birthday",
      width: 200,
    },
    {
      title: "电话",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (text: number) => (
        <span className={text === 1 ? 'status-active' : 'status-inactive'}>
          {text === 1 ? '在职' : '离职'}
        </span>
      ),
      width: 100,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 200,
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: DataType) => (
        <Space size="middle">
          <Button onClick={() => onEmployeeEdit(record)} color="primary" variant="text">编辑</Button>
          <Button onClick={() => onEmployeeDelete(record)} color="danger" variant="text">删除</Button>
        </Space>
      ),
      width: 200,
    },
  ];

  return (
    <div className={styles.userInfo}>
      <CommonTitle title="员工信息管理">
        <Button onClick={onEmployeeAdd} type="primary" color="primary">添加员工</Button>
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
            name="name"
            label="员工姓名"
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>

          <Form.Item<FormType>
            name="id"
            label="员工ID"
          >
            <Input placeholder="请输入员工ID" />
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
        title={editingEmployee ? '编辑员工' : '添加员工'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item<UserInfoFormData>
            name="name"
            label="员工姓名"
            rules={[{ required: true, message: '请输入员工姓名' }]}
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>
          <Form.Item<UserInfoFormData>
            name="dept_code"
            label="所属部门"
            rules={[{ required: true, message: '请选择所属部门' }]}
          >
            <TreeSelect
              showSearch
              style={{ width: '100%' }}
              placeholder="请选择所属部门"
              treeData={treeData}
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item<UserInfoFormData>
            name="position"
            label="职位"
            rules={[{ required: true, message: '请选择职位' }]}
          >
            <Select placeholder="请选择职位">
              {positions.map(pos => (
                <Select.Option key={pos} value={pos}>{pos}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<UserInfoFormData>
            name="role_id"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色" allowClear>
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>{role.role_name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<UserInfoFormData>
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item<UserInfoFormData>
            name="birthday"
            label="生日"
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择生日" />
          </Form.Item>
          <Form.Item<UserInfoFormData>
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入电话' }]}
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item<UserInfoFormData>
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value={1}>在职</Select.Option>
              <Select.Option value={0}>离职</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserInfoPage;