import { useState, useEffect } from "react";
import { Space, Form, Input, Button, message, Modal, Select, Card, Divider } from "antd";
import styles from "./departments.module.scss";
import CommonForm from "@/components/CommonForm";
import { getDepartmentList, DepartmentParams, DepartmentResponse, deleteDepartment, createDepartment, updateDepartment, DepartmentFormData } from "@/api/department";
import CommonTitle from "@/components/CommonTitle";
import DepartmentTree from "@/components/DepartmentTree";

interface FormType {
  dept_name?: string;
  id?: number;
}

const DepartmentPage = () => {
  const [form] = Form.useForm<FormType>();
  const [modalForm] = Form.useForm<DepartmentFormData>();
  const [allDepartments, setAllDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<DepartmentParams>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentResponse | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResponse | null>(null);

  const onDepartmentAdd = () => {
    setEditingDepartment(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  const onDepartmentEdit = (record: DepartmentResponse) => {
    setEditingDepartment(record);
    modalForm.setFieldsValue({
      dept_name: record.dept_name,
      parent_id: record.parent_id,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (editingDepartment) {
        const updatedDepartment = await updateDepartment(editingDepartment.id, values);
        message.success('编辑成功');
        // 更新当前选中的部门详情
        if (selectedDepartment?.id === editingDepartment.id) {
          setSelectedDepartment(updatedDepartment);
        }
        // 更新部门列表中的数据
        setAllDepartments(prev => prev.map(dept => 
          dept.id === editingDepartment.id ? { ...dept, ...updatedDepartment } : dept
        ));
      } else {
        await createDepartment(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      modalForm.resetFields();
      fetchDepartmentList(searchParams);
    } catch (error) {
      console.error('操作失败:', error);
      message.error(editingDepartment ? '编辑失败' : '添加失败');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    modalForm.resetFields();
  };

  const onDepartmentDelete = (record: DepartmentResponse) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部门 "${record.dept_name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDepartment(record.id);
          message.success('删除成功');
          if (selectedDepartment?.id === record.id) {
            setSelectedDepartment(null);
          }
          await fetchDepartmentList(searchParams);
        } catch (error) {
          console.error('删除部门失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const fetchDepartmentList = async (params: DepartmentParams = {}) => {
    setLoading(true);
    try {
      const res = await getDepartmentList(params);

      console.log('部门列表返回:', res);
      setAllDepartments(res.list);
    } catch (error) {
      console.error('获取部门列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentList(searchParams);
  }, [searchParams]);

  useEffect(() => {
    if (allDepartments.length > 0 && !selectedDepartment) {
      const topLevelDept = allDepartments.find(
        dept => dept.parent_id === 0 || dept.parent_id === null || dept.parent_id === undefined
      );
      if (topLevelDept) {
        setSelectedDepartment(topLevelDept);
      }
    }
  }, [allDepartments, selectedDepartment]);

  const handleTreeSelect = (id: number | null) => {
    const dept = allDepartments.find(d => d.id === id);
    setSelectedDepartment(dept || null);
  };

  const getChildrenCount = (deptId: number): number => {
    return allDepartments.filter(d => d.parent_id === deptId).length;
  };

  return (
    <div className={styles.departments}>
      <CommonTitle title="部门管理">
        <Button onClick={onDepartmentAdd} type="primary" color="primary">添加部门</Button>
      </CommonTitle>

      {/* <div className={styles.searchBox} style={{ marginBottom: 20 }}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className={styles.searchForm}
        >
          <Form.Item<FormType>
            name="dept_name"
            label="部门名称"
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>

          <Form.Item<FormType>
            name="id"
            label="部门ID"
          >
            <Input placeholder="请输入部门ID" />
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
      </div> */}

      <div className={styles.layout}>
        {/* 左侧部门树 */}
        <div className={styles.treePanel}>
          <Card title="部门树" className={styles.treeCard}>
            <DepartmentTree
              departments={allDepartments}
              selectedId={selectedDepartment?.id ?? null}
              onSelect={handleTreeSelect}
            />
          </Card>
        </div>

        {/* 右侧详情区域 */}
        <div className={styles.contentPanel}>
          {selectedDepartment ? (
            <Card 
              title="部门详情" 
              className={styles.detailCard}
              extra={
                <Space>
                  <Button onClick={() => onDepartmentEdit(selectedDepartment)} type="primary" size="small">编辑</Button>
                  <Button 
                    onClick={() => onDepartmentDelete(selectedDepartment)} 
                    disabled={selectedDepartment.id === 0 || getChildrenCount(selectedDepartment.id) > 0} 
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
                  <span className={styles.detailLabel}>部门ID：</span>
                  <span className={styles.detailValue}>{selectedDepartment.id}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>部门名称：</span>
                  <span className={styles.detailValue}>{selectedDepartment.dept_name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>上级部门：</span>
                  <span className={styles.detailValue}>{selectedDepartment.parent_name || '无'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>子部门数量：</span>
                  <span className={styles.detailValue}>{getChildrenCount(selectedDepartment.id)} 个</span>
                  {getChildrenCount(selectedDepartment.id) > 0 && (
                    <span className={styles.deleteTip}>（存在子部门，无法删除）</span>
                  )}
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>创建时间：</span>
                  <span className={styles.detailValue}>{selectedDepartment.created_at}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>更新时间：</span>
                  <span className={styles.detailValue}>{selectedDepartment.updated_at}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className={styles.emptyCard}>
              <div className={styles.emptyTip}>请从左侧选择一个部门查看详情</div>
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
          <Form.Item<DepartmentFormData>
            name="dept_name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item<DepartmentFormData>
            name="parent_id"
            label="上级部门"
          >
            <Select placeholder="请选择上级部门（可选）" allowClear>
              {allDepartments
                .filter(dept => dept.id !== editingDepartment?.id)
                .map(dept => (
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