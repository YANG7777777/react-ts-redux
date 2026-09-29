import { useState, useEffect } from 'react';
import { Space, Form, Input, Button, message, Modal, Select, Card, Empty, Tag } from 'antd';
import styles from './departments.module.scss';
import {
  getDepartmentList,
  type DepartmentParams,
  type DepartmentResponse,
  deleteDepartment,
  createDepartment,
  updateDepartment,
  type DepartmentFormData,
} from '@/api/department';
import { getUserInfoList, type UserInfoResponse } from '@/api/userInfo';
import CommonTitle from '@/components/CommonTitle';
import CommonTable from '@/components/CommonTable';
import DepartmentTree from '@/components/DepartmentTree';

interface EmployeeRow extends UserInfoResponse {
  key: string;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const DepartmentPage = () => {
  const [modalForm] = Form.useForm<DepartmentFormData>();
  const [allDepartments, setAllDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentResponse | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResponse | null>(null);

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const onDepartmentAdd = () => {
    setEditingDepartment(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  const onDepartmentEdit = (record: DepartmentResponse) => {
    setEditingDepartment(record);
    modalForm.setFieldsValue({
      dept_name: record.dept_name,
      parent_id: record.parent_id ?? undefined,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (editingDepartment) {
        const updatedDepartment = await updateDepartment(editingDepartment.id, values);
        message.success('编辑成功');
        if (selectedDepartment?.id === editingDepartment.id) {
          setSelectedDepartment(updatedDepartment);
        }
        setAllDepartments((prev) =>
          prev.map((dept) =>
            dept.id === editingDepartment.id ? { ...dept, ...updatedDepartment } : dept
          )
        );
      } else {
        await createDepartment(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      modalForm.resetFields();
      fetchDepartmentList();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error(
        error instanceof Error ? error.message : editingDepartment ? '编辑失败' : '添加失败'
      );
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    modalForm.resetFields();
  };

  const onDepartmentDelete = (record: DepartmentResponse) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部门「${record.dept_name}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDepartment(record.id);
          message.success('删除成功');
          if (selectedDepartment?.id === record.id) {
            setSelectedDepartment(null);
            setEmployees([]);
          }
          await fetchDepartmentList();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
        }
      },
    });
  };

  const fetchDepartmentList = async (params: DepartmentParams = {}) => {
    setLoading(true);
    try {
      const res = await getDepartmentList(params);
      setAllDepartments(res.list);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  const isRootDepartment = (dept: DepartmentResponse) =>
    dept.parent_id === 0 || dept.parent_id === null || dept.parent_id === undefined;

  const fetchEmployees = async (
    dept: DepartmentResponse,
    page = pagination.current,
    pageSize = pagination.pageSize
  ) => {
    // 公司（根节点）展示全部人员；子部门按 dept_code 筛选
    if (!isRootDepartment(dept) && !dept.dept_code) {
      setEmployees([]);
      setPagination((prev) => ({ ...prev, current: page, pageSize, total: 0 }));
      return;
    }

    setEmpLoading(true);
    try {
      const params = isRootDepartment(dept)
        ? { page, pageSize }
        : { dept_code: dept.dept_code, page, pageSize };

      const res = await getUserInfoList(params);
      setEmployees(
        (res.list || []).map((item) => ({
          ...item,
          key: String(item.id),
        }))
      );
      setPagination({
        current: page,
        pageSize,
        total: res.total || 0,
      });
    } catch (error) {
      setEmployees([]);
      message.error(error instanceof Error ? error.message : '获取部门人员失败');
    } finally {
      setEmpLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentList();
  }, []);

  useEffect(() => {
    if (allDepartments.length > 0 && !selectedDepartment) {
      const topLevelDept = allDepartments.find(
        (dept) => dept.parent_id === 0 || dept.parent_id === null || dept.parent_id === undefined
      );
      if (topLevelDept) {
        setSelectedDepartment(topLevelDept);
      }
    }
  }, [allDepartments, selectedDepartment]);

  useEffect(() => {
    if (!selectedDepartment) {
      setEmployees([]);
      setPagination((prev) => ({ ...prev, current: 1, total: 0 }));
      return;
    }
    fetchEmployees(selectedDepartment, 1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅随选中部门变化重置到第 1 页
  }, [selectedDepartment?.id, selectedDepartment?.dept_code]);

  const handleTreeSelect = (id: number | null) => {
    const dept = allDepartments.find((d) => d.id === id);
    setSelectedDepartment(dept || null);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    if (!selectedDepartment) return;
    fetchEmployees(selectedDepartment, page, pageSize);
  };

  const getChildrenCount = (deptId: number): number => {
    return allDepartments.filter((d) => d.parent_id === deptId).length;
  };

  /** 排除自身及所有下级，避免形成循环父子关系 */
  const getDescendantIds = (rootId: number): Set<number> => {
    const ids = new Set<number>([rootId]);
    let changed = true;
    while (changed) {
      changed = false;
      allDepartments.forEach((dept) => {
        if (dept.parent_id != null && ids.has(dept.parent_id) && !ids.has(dept.id)) {
          ids.add(dept.id);
          changed = true;
        }
      });
    }
    return ids;
  };

  const parentOptions = editingDepartment
    ? allDepartments.filter((dept) => !getDescendantIds(editingDepartment.id).has(dept.id))
    : allDepartments;

  const employeeColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '职位', dataIndex: 'position', key: 'position', width: 120 },
    {
      title: '角色',
      dataIndex: 'role_name',
      key: 'role_name',
      width: 100,
      render: (text?: string) => text || '-',
    },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
    { title: '邮箱', dataIndex: 'email', key: 'email', ellipsis: true },
    {
      title: '上级',
      dataIndex: 'approver_name',
      key: 'approver_name',
      width: 100,
      render: (text?: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: number, record: EmployeeRow) => (
        <Tag color={status === 1 ? 'success' : 'default'}>
          {record.status_name || (status === 1 ? '在职' : '离职')}
        </Tag>
      ),
    },
  ];

  return (
    <div className={styles.departments}>
      <CommonTitle title="部门管理">
        <Button onClick={onDepartmentAdd} type="primary" loading={loading}>
          添加部门
        </Button>
      </CommonTitle>

      <div className={styles.layout}>
        <div className={styles.treePanel}>
          <Card title="部门树" className={styles.treeCard} loading={loading}>
            <DepartmentTree
              departments={allDepartments}
              selectedId={selectedDepartment?.id ?? null}
              onSelect={handleTreeSelect}
            />
          </Card>
        </div>

        <div className={styles.contentPanel}>
          {selectedDepartment ? (
            <div className={styles.rightStack}>
              <Card
                title="部门详情"
                className={styles.detailCard}
                extra={
                  <Space>
                    <Button
                      onClick={() => onDepartmentEdit(selectedDepartment)}
                      type="primary"
                      size="small"
                    >
                      编辑
                    </Button>
                    <Button
                      onClick={() => onDepartmentDelete(selectedDepartment)}
                      disabled={
                        selectedDepartment.id === 0 || getChildrenCount(selectedDepartment.id) > 0
                      }
                      danger
                      size="small"
                    >
                      删除
                    </Button>
                  </Space>
                }
              >
                <div className={styles.detailInfo}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>部门名称</span>
                    <span className={styles.detailValue}>{selectedDepartment.dept_name}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>部门编码</span>
                    <span className={styles.detailValue}>{selectedDepartment.dept_code || '-'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>上级部门</span>
                    <span className={styles.detailValue}>
                      {selectedDepartment.parent_name || '无'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>子部门</span>
                    <span className={styles.detailValue}>
                      {getChildrenCount(selectedDepartment.id)} 个
                      {getChildrenCount(selectedDepartment.id) > 0 && (
                        <span className={styles.deleteTip}>（有子部门时不可删除）</span>
                      )}
                    </span>
                  </div>
                </div>
              </Card>

              <Card
                title={`${isRootDepartment(selectedDepartment) ? '全部人员' : '部门人员'}（${pagination.total}）`}
                className={styles.memberCard}
                extra={
                  <span className={styles.memberHint}>
                    {isRootDepartment(selectedDepartment)
                      ? '公司全员'
                      : `${selectedDepartment.dept_name}${
                          selectedDepartment.dept_code ? ` · ${selectedDepartment.dept_code}` : ''
                        }`}
                  </span>
                }
              >
                <CommonTable<EmployeeRow>
                  fillHeight
                  columns={employeeColumns}
                  dataSource={employees}
                  loading={empLoading}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="该部门暂无人员"
                      />
                    ),
                  }}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `共 ${total} 人`,
                    onChange: handlePaginationChange,
                  }}
                />
              </Card>
            </div>
          ) : (
            <Card className={styles.emptyCard}>
              <div className={styles.emptyTip}>请从左侧选择一个部门查看人员</div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        title={editingDepartment ? '编辑部门' : '添加部门'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item
            name="dept_name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="parent_id" label="上级部门">
            <Select placeholder="请选择上级部门（可选）" allowClear>
              {parentOptions.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.dept_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentPage;
