import { useState, useEffect } from "react";
import { Space, Form, Input, Button, message, Modal, Select } from "antd";
import styles from "../attendance.module.scss";
import CommonTable from "@/components/CommonTable";
import CommonForm from "@/components/CommonForm";
import { getOvertimeRequestList, OvertimeRequestParams, OvertimeRequestResponse, deleteOvertimeRequest } from "@/api/attendance";
import CommonTitle from "@/components/CommonTitle";

interface DataType extends OvertimeRequestResponse {
  key: string;
}

interface FormType {
  user_name?: string;
  id?: number;
  status?: number;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const statusMap: Record<number, string> = {
  0: '待审批',
  1: '已通过',
  2: '已拒绝',
};

const OvertimeRequestPage = () => {
  const [form] = Form.useForm<FormType>();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<OvertimeRequestParams>({});
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const onOvertimeRequestDelete = (record: DataType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除加班申请 "${record.user_name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteOvertimeRequest(record.id);
          message.success('删除成功');
          fetchOvertimeRequestList(searchParams);
        } catch (error) {
          console.error('删除加班申请失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const fetchOvertimeRequestList = async (params: OvertimeRequestParams = {}) => {
    setLoading(true);
    try {
      const res = await getOvertimeRequestList({
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
      console.error('获取加班申请列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOvertimeRequestList(searchParams);
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
      width: 80,
    },
    {
      title: "员工姓名",
      dataIndex: "user_name",
      key: "user_name",
      width: 120,
    },
    {
      title: "加班日期",
      dataIndex: "overtime_date",
      key: "overtime_date",
      width: 120,
    },
    {
      title: "开始时间",
      dataIndex: "start_time",
      key: "start_time",
      width: 100,
    },
    {
      title: "结束时间",
      dataIndex: "end_time",
      key: "end_time",
      width: 100,
    },
    {
      title: "加班原因",
      dataIndex: "reason",
      key: "reason",
      width: 200,
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
          <Button onClick={() => onOvertimeRequestDelete(record)} color="danger" variant="text">删除</Button>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div className={styles.attendance}>
      <CommonTitle title="加班申请"></CommonTitle>

      <div className={styles.searchBox} style={{ marginBottom: 20 }}>
        <CommonForm<FormType>
          form={form}
          layout="inline"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className={styles.searchForm}
        >
          <Form.Item<FormType>
            name="user_name"
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
    </div>
  );
};

export default OvertimeRequestPage;